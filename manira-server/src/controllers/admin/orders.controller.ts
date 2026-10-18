import { Request, Response } from 'express';
import { db } from '../../db';
import { orders, orderItems } from '../../db/schema';
import { eq, desc, like, and, sql } from 'drizzle-orm';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const conditions: any[] = [];
    if (status) conditions.push(eq(orders.status, status));
    if (search) conditions.push(like(orders.orderNumber, `%${search}%`));
    const where = conditions.length ? and(...conditions) : undefined;
    const [rows, [{ count }]] = await Promise.all([
      db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limitNum).offset((pageNum - 1) * limitNum),
      db.select({ count: sql<number>`count(*)` }).from(orders).where(where),
    ]);
    res.json({ orders: rows, total: Number(count), page: pageNum });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, req.params.id));
    if (!order) { res.status(404).json({ message: 'Order not found' }); return; }
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    res.json({ ...order, items });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, req.params.id));
    res.json({ message: 'Status updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const updateTracking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { awbNumber, courierPartner } = req.body;
    await db.update(orders).set({ awbNumber, courierPartner, updatedAt: new Date() }).where(eq(orders.id, req.params.id));
    res.json({ message: 'Tracking updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
