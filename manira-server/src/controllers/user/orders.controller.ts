import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { orders, orderItems, coupons, products } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

const generateOrderNumber = () => `MNR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, couponCode, ...orderData } = req.body;
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
    let discountAmount = 0;
    let shippingCost = subtotal >= 999 ? 0 : 99;

    if (couponCode) {
      const [coupon] = await db.select().from(coupons).where(and(eq(coupons.code, couponCode.toUpperCase()), eq(coupons.isActive, true)));
      if (coupon && subtotal >= coupon.minOrder && (!coupon.maxUses || coupon.usedCount < coupon.maxUses)) {
        if (coupon.type === 'percent')  discountAmount = Math.round(subtotal * coupon.value / 100);
        if (coupon.type === 'flat')     discountAmount = coupon.value;
        if (coupon.type === 'shipping') shippingCost   = 0;
        await db.update(coupons).set({ usedCount: coupon.usedCount + 1, updatedAt: new Date() }).where(eq(coupons.id, coupon.id));
      }
    }

    const total = subtotal + shippingCost - discountAmount;
    const orderId = uuid();
    await db.insert(orders).values({
      id: orderId, orderNumber: generateOrderNumber(), userId: req.user?.id,
      ...orderData, subtotal, shippingCost, discountAmount, total, couponCode,
    });
    await db.insert(orderItems).values(items.map((item: any) => ({ id: uuid(), orderId, ...item })));

    for (const item of items) {
      const [p] = await db.select().from(products).where(eq(products.id, item.productId));
      if (p) await db.update(products).set({ stock: Math.max(0, p.stock - item.quantity), sold: p.sold + item.quantity, updatedAt: new Date() }).where(eq(products.id, p.id));
    }

    const [created] = await db.select().from(orders).where(eq(orders.id, orderId));
    res.status(201).json(created);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userOrders = await db.select().from(orders).where(eq(orders.userId, req.user!.id)).orderBy(desc(orders.createdAt));
    res.json(userOrders);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [order] = await db.select().from(orders).where(and(eq(orders.id, req.params.id), eq(orders.userId, req.user!.id)));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    res.json({ ...order, items });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const trackOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderNumber = (req.query.orderNumber || req.params.num || '') as string;
    const email       = (req.query.email || '') as string;

    if (!orderNumber) { res.status(400).json({ message: 'Order number required' }); return; }

    const whereClause = email
      ? and(eq(orders.orderNumber, orderNumber), eq(orders.email, email.toLowerCase().trim()))
      : eq(orders.orderNumber, orderNumber);

    const [order] = await db.select({
      id:            orders.id,
      orderNumber:   orders.orderNumber,
      status:        orders.status,
      awbNumber:     orders.awbNumber,
      courierPartner:orders.courierPartner,
      city:          orders.city,
      state:         orders.state,
      pincode:       orders.pincode,
      createdAt:     orders.createdAt,
      updatedAt:     orders.updatedAt,
    }).from(orders).where(whereClause);

    if (!order) { res.status(404).json({ message: 'Order not found. Please check your order number and email.' }); return; }

    const items = await db.select({
      productName: orderItems.productName,
      quantity:    orderItems.quantity,
      variant:     orderItems.variant,
    }).from(orderItems).where(eq(orderItems.orderId, order.id));

    res.json({ ...order, items });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, orderTotal } = req.body;
    const [coupon] = await db.select().from(coupons).where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)));
    if (!coupon) { res.status(404).json({ message: 'Invalid coupon code' }); return; }
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) { res.status(400).json({ message: 'Coupon has expired' }); return; }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) { res.status(400).json({ message: 'Coupon usage limit reached' }); return; }
    if (orderTotal < coupon.minOrder) { res.status(400).json({ message: `Minimum order ₹${coupon.minOrder} required` }); return; }
    let discount = 0;
    if (coupon.type === 'percent')  discount = Math.round(orderTotal * coupon.value / 100);
    if (coupon.type === 'flat')     discount = coupon.value;
    if (coupon.type === 'shipping') discount = 0;
    res.json({ valid: true, discount, type: coupon.type, message: `Coupon applied! You save ₹${discount}` });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
