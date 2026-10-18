import { Request, Response } from 'express';
import { db } from '../../db';
import { orders, orderItems, products, users } from '../../db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalRevenue] = await db.select({ v: sql<number>`coalesce(sum(total),0)` }).from(orders).where(eq(orders.paymentStatus, 'paid'));
    const [totalOrders]  = await db.select({ v: sql<number>`count(*)` }).from(orders);
    const [totalCustomers] = await db.select({ v: sql<number>`count(*)` }).from(users);
    const [totalProducts]  = await db.select({ v: sql<number>`count(*)` }).from(products);
    res.json({
      totalRevenue:   Number(totalRevenue.v),
      totalOrders:    Number(totalOrders.v),
      totalCustomers: Number(totalCustomers.v),
      totalProducts:  Number(totalProducts.v),
    });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getRevenueChart = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({
      month: sql<string>`to_char(created_at, 'Mon YYYY')`,
      revenue: sql<number>`coalesce(sum(total),0)`,
    }).from(orders).where(and(eq(orders.paymentStatus, 'paid'), gte(orders.createdAt, sql`now() - interval '6 months'`)))
      .groupBy(sql`to_char(created_at, 'Mon YYYY'), date_trunc('month', created_at)`)
      .orderBy(sql`date_trunc('month', created_at)`);
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getTopProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({
      productId: orderItems.productId,
      name: orderItems.productName,
      totalSold: sql<number>`sum(quantity)`,
      revenue: sql<number>`sum(price * quantity)`,
    }).from(orderItems).groupBy(orderItems.productId, orderItems.productName)
      .orderBy(desc(sql`sum(quantity)`)).limit(10);
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getRecentOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10);
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
