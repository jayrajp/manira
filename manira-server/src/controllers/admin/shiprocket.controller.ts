import { Request, Response } from 'express';
import { eq }               from 'drizzle-orm';
import { db }               from '../../db';
import { orders, orderItems } from '../../db/schema';
import { env }              from '../../config/env';

const SR_BASE = 'https://apiv2.shiprocket.in/v1/external';

// ── Token cache (Shiprocket tokens last 10 days) ─────────────────────────────
let _token: string | null = null;
let _tokenExpiry = 0;

async function getToken(): Promise<string> {
  // Option 1: use a pre-generated token from .env (recommended)
  const staticToken = (process.env.SHIPROCKET_TOKEN || '').trim();
  if (staticToken) {
    console.log('[Shiprocket] Using static token from SHIPROCKET_TOKEN env var');
    return staticToken;
  }

  // Option 2: login with email + password (auto-refreshes every 9 days)
  if (_token && Date.now() < _tokenExpiry) return _token;

  const email    = (env.SHIPROCKET_EMAIL    || '').trim();
  const password = (env.SHIPROCKET_PASSWORD || '').trim();

  console.log('[Shiprocket] Logging in with email:', email);

  const res = await fetch(`${SR_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  });

  const data = (await res.json()) as any;
  console.log('[Shiprocket] Login status:', res.status, '| token present:', !!data.token);

  if (!data.token) {
    throw new Error(
      data.message
        ? `Shiprocket login failed: ${data.message}`
        : 'Shiprocket authentication failed — set SHIPROCKET_TOKEN in .env (get it from Shiprocket → Settings → API)',
    );
  }

  _token       = data.token;
  _tokenExpiry = Date.now() + 9 * 24 * 60 * 60 * 1000; // 9 days
  console.log('[Shiprocket] Token acquired successfully');
  return _token!;
}

async function srFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const res   = await fetch(`${SR_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = (await res.json()) as any;
  console.log(`[Shiprocket] ${options.method || 'GET'} ${path} → HTTP ${res.status}`, JSON.stringify(data).slice(0, 300));
  if (!res.ok && !data.order_id) {
    throw new Error(data.message || `Shiprocket API error (HTTP ${res.status})`);
  }
  return data;
}

// ── POST /admin/orders/:id/shiprocket — create order + shipment ───────────────
export const createShipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { weight = 0.3, length = 20, breadth = 15, height = 5 } = req.body;

  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    if (order.shiprocketOrderId) {
      res.status(400).json({ message: 'Shipment already created on Shiprocket' });
      return;
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

    // Build a unique Shiprocket order_id.
    // Shiprocket permanently stores every order_id — even cancelled ones.
    // Append attempt counter so retries after cancellation don't conflict.
    const attempt   = (order.shiprocketAttempt ?? 0) + 1;
    const srOrderId = attempt <= 1
      ? order.orderNumber
      : `${order.orderNumber}-R${attempt}`;

    console.log(`[Shiprocket] Creating shipment | attempt=${attempt} | sr_order_id=${srOrderId}`);

    const srPayload = {
      order_id:          srOrderId,
      order_date:        new Date(order.createdAt).toISOString().split('T')[0],
      pickup_location:   process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
      channel_id:        process.env.SHIPROCKET_CHANNEL_ID || undefined,
      billing_customer_name: order.customerName.split(' ')[0],
      billing_last_name:     order.customerName.split(' ').slice(1).join(' ') || '',
      billing_address:   order.addressLine,
      billing_city:      order.city,
      billing_pincode:   order.pincode,
      billing_state:     order.state,
      billing_country:   'India',
      billing_email:     order.email,
      billing_phone:     order.phone,
      shipping_is_billing: true,
      order_items: items.map(item => ({
        name:          item.productName,
        sku:           item.sku || `SKU-${item.id.slice(0, 8)}`,
        units:         item.quantity,
        selling_price: item.price,
        discount:      0,
        tax:           0,
        hsn:           '',
      })),
      payment_method: order.paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      sub_total:      order.subtotal,
      length:         Number(length),
      breadth:        Number(breadth),
      height:         Number(height),
      weight:         Number(weight), // jewellery default ~300g
    };

    const data = await srFetch('/orders/create/adhoc', {
      method: 'POST',
      body:   JSON.stringify(srPayload),
    });

    if (!data.order_id) {
      console.error('[Shiprocket] No order_id in response:', data);
      res.status(400).json({ message: data.message || data.error || 'Shiprocket order creation failed — check server logs' });
      return;
    }

    await db.update(orders).set({
      shiprocketOrderId:    String(data.order_id),
      shiprocketShipmentId: String(data.shipment_id || ''),
      shiprocketAttempt:    attempt,
      status:               'processing',
      updatedAt:            new Date(),
    }).where(eq(orders.id, id));

    console.log(`[Shiprocket] ✅ Shipment created | SR order=${data.order_id} | shipment=${data.shipment_id}`);

    res.json({
      shiprocketOrderId:    data.order_id,
      shiprocketShipmentId: data.shipment_id,
      srOrderIdUsed:        srOrderId,
      attempt,
      status:               data.status,
      message:              'Shipment created on Shiprocket',
    });
  } catch (err: any) {
    console.error('[Shiprocket] createShipment error:', err.message);
    res.status(500).json({ message: err.message || 'Failed to create shipment' });
  }
};

// ── POST /admin/orders/:id/shiprocket/awb — assign courier + AWB ─────────────
export const assignAwb = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { courierId } = req.body;

  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order?.shiprocketShipmentId) {
      res.status(400).json({ message: 'Create a shipment first' });
      return;
    }

    const body: any = { shipment_id: order.shiprocketShipmentId };
    if (courierId) body.courier_id = courierId;

    const data = await srFetch('/courier/assign/awb', {
      method: 'POST',
      body:   JSON.stringify(body),
    });

    if (data.awb_assign_status === 0 || data.status_code === 350) {
      const errMsg = data.message || data.response?.data?.awb_assign_error || 'AWB assignment failed';
      console.error('[Shiprocket] AWB assign failed:', errMsg);
      res.status(400).json({ message: errMsg });
      return;
    }

    const awb         = data.response?.data?.awb_code;
    const courierName = data.response?.data?.courier_name || '';

    if (!awb) {
      res.status(400).json({ message: data.message || data.response?.data?.awb_assign_error || 'No AWB returned' });
      return;
    }

    await db.update(orders).set({
      shiprocketAwbCode: awb,
      awbNumber:         awb,
      courierPartner:    courierName,
      status:            'shipped',
      updatedAt:         new Date(),
    }).where(eq(orders.id, id));

    console.log(`[Shiprocket] ✅ AWB assigned: ${awb} via ${courierName}`);

    res.json({ awb, courier: courierName, message: 'AWB assigned successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to assign AWB' });
  }
};

// ── POST /admin/orders/:id/shiprocket/pickup — request pickup ────────────────
export const generatePickup = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order?.shiprocketShipmentId) {
      res.status(400).json({ message: 'No shipment found. Create a shipment first.' });
      return;
    }

    const data = await srFetch('/courier/generate/pickup', {
      method: 'POST',
      body:   JSON.stringify({ shipment_id: [order.shiprocketShipmentId] }),
    });

    res.json({ message: 'Pickup scheduled', ...data });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to schedule pickup' });
  }
};

// ── GET /admin/orders/:id/track — fetch Shiprocket tracking ──────────────────
export const trackShipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    const awb = order.shiprocketAwbCode || order.awbNumber;
    if (!awb) {
      res.json({
        tracking:             null,
        shiprocketOrderId:    order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        message:              'No tracking available yet',
      });
      return;
    }

    const data = await srFetch(`/courier/track/awb/${awb}`);

    res.json({
      awb,
      courier:      order.courierPartner,
      trackingData: data.tracking_data || data,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch tracking' });
  }
};

// ── DELETE /admin/orders/:id/shiprocket — cancel Shiprocket order ─────────────
export const cancelShipment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order?.shiprocketOrderId) {
      res.status(400).json({ message: 'No Shiprocket shipment found for this order' });
      return;
    }

    const data = await srFetch('/orders/cancel', {
      method: 'POST',
      body:   JSON.stringify({ ids: [Number(order.shiprocketOrderId)] }),
    });

    // Clear Shiprocket IDs but KEEP the attempt counter so next retry uses a unique order_id
    await db.update(orders).set({
      shiprocketOrderId:    null,
      shiprocketShipmentId: null,
      shiprocketAwbCode:    null,
      awbNumber:            null,
      status:               'processing',
      updatedAt:            new Date(),
    }).where(eq(orders.id, id));

    res.json({ message: 'Shiprocket shipment cancelled', ...data });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to cancel shipment' });
  }
};

// ── GET /admin/orders/:id/serviceability — check courier options ─────────────
export const checkServiceability = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { weight = '0.3' } = req.query;
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }

    const pickupPin   = process.env.SHIPROCKET_PICKUP_PINCODE || '';
    const deliveryPin = order.pincode;
    const isCod       = order.paymentMethod === 'cod' ? 1 : 0;

    const params = new URLSearchParams({
      pickup_postcode:   pickupPin,
      delivery_postcode: deliveryPin,
      cod:               String(isCod),
      weight:            String(weight),
    });

    const data = await srFetch(`/courier/serviceability/?${params}`);

    res.json({ available_courier_companies: data.data?.available_courier_companies || [] });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to check serviceability' });
  }
};

// ── GET /admin/shiprocket/status — test auth + show connection status ─────────
export const getShiprocketStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = await getToken();
    res.json({ connected: true, tokenPreview: token.slice(0, 20) + '…' });
  } catch (err: any) {
    res.json({ connected: false, error: err.message });
  }
};
