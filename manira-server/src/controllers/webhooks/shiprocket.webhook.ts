import { Request, Response } from 'express';
import { eq, or }           from 'drizzle-orm';
import { db }               from '../../db';
import { orders }           from '../../db/schema';

/**
 * Shiprocket sends a POST to this endpoint whenever a shipment status changes.
 * Configure the webhook URL in Shiprocket Dashboard →
 *   Settings → API → Webhooks → Add URL:
 *   https://yourdomain.com/api/webhooks/shiprocket
 *   (for local dev use ngrok: https://xxxx.ngrok.io/api/webhooks/shiprocket)
 */

const SR_STATUS_MAP: Record<string, string> = {
  // Pickup
  'Pickup Scheduled':   'processing',
  'Pickup Queued':      'processing',
  'Pickup Error':       'processing',
  'Pickup Rescheduled': 'processing',
  'Pickup Generated':   'processing',

  // Picked up / In transit
  'Picked Up':                'in_transit',
  'In Transit':               'in_transit',
  'Reached Destination Hub':  'in_transit',
  'Reached Pickup Location':  'in_transit',

  // Shipped (AWB assigned, not yet picked up)
  'AWB Assigned':     'shipped',
  'Label Generated':  'shipped',
  'Manifested':       'shipped',

  // Out for delivery
  'Out for Delivery': 'out_for_delivery',

  // Delivered
  'Delivered': 'delivered',

  // Cancelled / RTO
  'Cancelled':    'cancelled',
  'RTO Initiated':'in_transit',
  'RTO':          'in_transit',
};

// Status rank to prevent downgrades (e.g., webhook from delayed pickup shouldn't reset a delivered order)
const STATUS_RANK: Record<string, number> = {
  pending: 0, processing: 1, shipped: 2,
  in_transit: 3, out_for_delivery: 4, delivered: 5, cancelled: 6,
};

export const shiprocketWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    const awb         = body.awb || body.awb_code || body.AWB;
    const srOrderId   = body.order_id ? String(body.order_id) : null;
    const srStatus    = body.current_status || body.status || body.shipment_status || '';
    const courierName = body.courier_name || body.courier || '';

    console.log(`[Shiprocket Webhook] AWB=${awb} | SR Order=${srOrderId} | Status="${srStatus}"`);

    if (!awb && !srOrderId) {
      res.status(200).json({ received: true, note: 'No AWB or order_id — ignored' });
      return;
    }

    const newStatus = SR_STATUS_MAP[srStatus];
    if (!newStatus) {
      console.log(`[Shiprocket Webhook] Unknown status "${srStatus}" — skipping`);
      res.status(200).json({ received: true, note: `Unknown status: ${srStatus}` });
      return;
    }

    // Find the order by AWB or SR order ID
    const conditions: any[] = [];
    if (awb)       conditions.push(eq(orders.shiprocketAwbCode, awb));
    if (srOrderId) conditions.push(eq(orders.shiprocketOrderId, srOrderId));

    const [order] = await db
      .select({ id: orders.id, status: orders.status, orderNumber: orders.orderNumber })
      .from(orders)
      .where(conditions.length === 1 ? conditions[0] : or(...conditions))
      .limit(1);

    if (!order) {
      console.warn(`[Shiprocket Webhook] No order found for AWB=${awb} / SR=${srOrderId}`);
      res.status(200).json({ received: true, note: 'Order not found' });
      return;
    }

    // Don't downgrade a delivered order
    const currentRank = STATUS_RANK[order.status] ?? 0;
    const newRank     = STATUS_RANK[newStatus]    ?? 0;

    if (newRank <= currentRank && newStatus !== 'cancelled') {
      console.log(`[Shiprocket Webhook] Order ${order.orderNumber}: skipping downgrade ${order.status} → ${newStatus}`);
      res.status(200).json({ received: true, note: 'Status not upgraded (already at higher state)' });
      return;
    }

    const updatePayload: any = { status: newStatus, updatedAt: new Date() };
    if (courierName) updatePayload.courierPartner    = courierName;
    if (awb)         updatePayload.awbNumber         = awb;
    if (awb)         updatePayload.shiprocketAwbCode = awb;

    await db.update(orders).set(updatePayload).where(eq(orders.id, order.id));

    console.log(`[Shiprocket Webhook] ✅ Order ${order.orderNumber}: ${order.status} → ${newStatus}`);

    res.status(200).json({
      received:       true,
      orderNumber:    order.orderNumber,
      previousStatus: order.status,
      newStatus,
    });
  } catch (err: any) {
    console.error('[Shiprocket Webhook] Error:', err.message);
    // Always return 200 to Shiprocket — otherwise it retries endlessly
    res.status(200).json({ received: true, error: err.message });
  }
};
