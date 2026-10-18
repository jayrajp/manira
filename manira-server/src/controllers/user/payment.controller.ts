import { Request, Response } from 'express';
import { createHmac }        from 'crypto';
import Razorpay              from 'razorpay';
import { eq, and }           from 'drizzle-orm';
import { v4 as uuid }        from 'uuid';
import { db }                from '../../db';
import { orders, orderItems, coupons, products, productVariants, settings, users } from '../../db/schema';
import { env }               from '../../config/env';

const generateOrderNumber = () =>
  `MNR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString().slice(-4)}`;

const getRazorpay = () =>
  new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });

async function getFreeShippingMin(): Promise<number> {
  try {
    const [row] = await db.select().from(settings).where(eq(settings.key, 'freeShippingMin'));
    if (row?.value) return Number(JSON.parse(row.value)) || 999;
  } catch {}
  return 999; // default ₹999 free shipping threshold
}

// ── Step 1: Create a Razorpay order (returns order_id to open checkout modal) ──
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount))) {
      res.status(400).json({ message: 'Valid amount required' });
      return;
    }

    const razorpay = getRazorpay();
    const rzpOrder = await (razorpay.orders.create as any)({
      amount:   Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      receipt:  `rcpt_${Date.now()}`,
    });

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount:          rzpOrder.amount,
      currency:        rzpOrder.currency,
      keyId:           env.RAZORPAY_KEY_ID,
    });
  } catch (err: any) {
    console.error('[Razorpay] createRazorpayOrder error:', err);
    res.status(500).json({ message: err?.error?.description || 'Payment initiation failed' });
  }
};

// ── Step 2: Verify signature + capture + create order in DB ──────────────────
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      // order details
      customerName, email, phone,
      addressLine, city, pincode, state,
      items: orderItemsData,
      couponCode,
      paymentMethod,
    } = req.body;

    // 1. Verify Razorpay signature
    const body              = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
      return;
    }

    // 2. Capture the payment (authorized → captured; required for refunds)
    try {
      const rzp        = getRazorpay();
      const rzpPayment = await rzp.payments.fetch(razorpayPaymentId);
      if (rzpPayment.status === 'authorized') {
        await rzp.payments.capture(razorpayPaymentId, Number(rzpPayment.amount), 'INR');
      }
    } catch (captureErr: any) {
      console.warn('[Razorpay] Capture warning:', captureErr?.error?.description || captureErr?.message);
      // Non-fatal — continue with order creation even if capture fails
    }

    // 3. Calculate totals
    let subtotal = 0;
    for (const item of orderItemsData) {
      subtotal += item.price * item.quantity;
    }

    const freeShippingMin = await getFreeShippingMin();
    let discountAmount = 0;
    let shippingCost   = subtotal >= freeShippingMin ? 0 : 99;

    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()));

      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiry || new Date(coupon.expiry) >= new Date();
        const withinLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const meetsMin    = subtotal >= coupon.minOrder;
        if (notExpired && withinLimit && meetsMin) {
          if (coupon.type === 'percent')  discountAmount = Math.round(subtotal * (coupon.value / 100));
          else if (coupon.type === 'flat')     discountAmount = coupon.value;
          else if (coupon.type === 'shipping') shippingCost   = 0;
          await db.update(coupons)
            .set({ usedCount: coupon.usedCount + 1, updatedAt: new Date() })
            .where(eq(coupons.id, coupon.id));
        }
      }
    }

    const total       = subtotal + shippingCost - discountAmount;
    const orderId     = crypto.randomUUID();
    const orderNumber = generateOrderNumber();

    // 4. Resolve userId (from JWT if logged in, or look up by email for guests)
    let resolvedUserId: string | undefined = req.user?.id;
    if (!resolvedUserId && email) {
      const [matchUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()));
      if (matchUser) resolvedUserId = matchUser.id;
    }

    // 5. Save order to DB
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId:        resolvedUserId,
      customerName,
      email,
      phone,
      addressLine,
      city,
      pincode,
      state,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      couponCode:       couponCode?.toUpperCase(),
      paymentMethod:    paymentMethod || 'upi',
      paymentStatus:    'paid',
      status:           'processing',
      razorpayOrderId,
      razorpayPaymentId,
    });

    // 6. Insert items + update stock
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        id:           crypto.randomUUID(),
        orderId,
        productId:    item.productId,
        productName:  item.productName,
        productImage: item.productImage,
        sku:          item.sku,
        price:        item.price,
        quantity:     item.quantity,
        variant:      item.variant,  // label-based variant (Gold / Silver / Rose Gold)
        size:         item.size,     // ring/bangle size
      });

      if (item.productId) {
        const [p] = await db.select().from(products).where(eq(products.id, item.productId));
        if (p) {
          const newStock = Math.max(0, p.stock - item.quantity);
          await db.update(products).set({
            sold:      p.sold + item.quantity,
            stock:     newStock,
            status:    newStock === 0 ? 'out_of_stock' : p.status,
            updatedAt: new Date(),
          }).where(eq(products.id, item.productId));
        }

        // Also deduct from variant-specific stock (if variant label is provided)
        if (item.variant) {
          const [variantRow] = await db
            .select()
            .from(productVariants)
            .where(and(
              eq(productVariants.productId, item.productId),
              eq(productVariants.label,     item.variant),
            ));
          if (variantRow) {
            await db.update(productVariants)
              .set({ stock: Math.max(0, variantRow.stock - item.quantity) })
              .where(eq(productVariants.id, variantRow.id));
          }
        }
      }
    }

    res.json({
      orderId,
      orderNumber,
      total,
      shippingCost,
      discountAmount,
      message: 'Payment verified and order placed',
    });
  } catch (err) {
    console.error('[Razorpay] verifyRazorpayPayment error:', err);
    res.status(500).json({ message: 'Order creation failed after payment. Please contact support.' });
  }
};

// ── COD: Cash on Delivery — no Razorpay needed ───────────────────────────────
export const createCodOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerName, email, phone,
      addressLine, city, pincode, state,
      items: orderItemsData,
      couponCode,
    } = req.body;

    if (!orderItemsData?.length) {
      res.status(400).json({ message: 'No items in order' });
      return;
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of orderItemsData) {
      subtotal += Number(item.price) * Number(item.quantity);
    }

    const freeShippingMin = await getFreeShippingMin();
    let discountAmount = 0;
    let shippingCost   = subtotal >= freeShippingMin ? 0 : 99;

    // Apply coupon if any
    if (couponCode) {
      const [coupon] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, couponCode.toUpperCase()));

      if (coupon && coupon.isActive) {
        const notExpired  = !coupon.expiry  || new Date(coupon.expiry) >= new Date();
        const withinLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        const meetsMin    = subtotal >= coupon.minOrder;
        if (notExpired && withinLimit && meetsMin) {
          if (coupon.type === 'percent')  discountAmount = Math.round(subtotal * (coupon.value / 100));
          else if (coupon.type === 'flat')     discountAmount = coupon.value;
          else if (coupon.type === 'shipping') shippingCost   = 0;
          await db.update(coupons)
            .set({ usedCount: coupon.usedCount + 1, updatedAt: new Date() })
            .where(eq(coupons.id, coupon.id));
        }
      }
    }

    const total       = subtotal + shippingCost - discountAmount;
    const orderId     = uuid();
    const orderNumber = generateOrderNumber();

    // Resolve userId
    let resolvedUserId: string | undefined = req.user?.id;
    if (!resolvedUserId && email) {
      const [matchUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()));
      if (matchUser) resolvedUserId = matchUser.id;
    }

    // Save order
    await db.insert(orders).values({
      id: orderId,
      orderNumber,
      userId:        resolvedUserId,
      customerName,
      email,
      phone,
      addressLine,
      city,
      pincode,
      state,
      subtotal,
      shippingCost,
      discountAmount,
      total,
      couponCode:    couponCode?.toUpperCase(),
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status:        'processing',
    });

    // Insert items + update stock
    for (const item of orderItemsData) {
      await db.insert(orderItems).values({
        id:           uuid(),
        orderId,
        productId:    item.productId,
        productName:  item.productName,
        productImage: item.productImage,
        sku:          item.sku,
        price:        item.price,
        quantity:     item.quantity,
        variant:      item.variant,
        size:         item.size,
      });

      if (item.productId) {
        const [p] = await db.select().from(products).where(eq(products.id, item.productId));
        if (p) {
          const newStock = Math.max(0, p.stock - item.quantity);
          await db.update(products).set({
            sold:      p.sold + item.quantity,
            stock:     newStock,
            status:    newStock === 0 ? 'out_of_stock' : p.status,
            updatedAt: new Date(),
          }).where(eq(products.id, item.productId));
        }
      }
    }

    res.status(201).json({
      orderId,
      orderNumber,
      total,
      shippingCost,
      discountAmount,
      message: 'Order placed successfully! Pay on delivery.',
    });
  } catch (err) {
    console.error('[COD] createCodOrder error:', err);
    res.status(500).json({ message: 'Failed to place order. Please try again.' });
  }
};
