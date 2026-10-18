import { Request, Response } from 'express';
import { db } from '../../db';
import { users, orders } from '../../db/schema';
import { eq, desc, like, sql } from 'drizzle-orm';

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const where = search ? like(users.email, `%${search}%`) : undefined;
    const [rows, [{ count }]] = await Promise.all([
      db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, status: users.status, createdAt: users.createdAt })
        .from(users).where(where).orderBy(desc(users.createdAt)).limit(limitNum).offset((pageNum - 1) * limitNum),
      db.select({ count: sql<number>`count(*)` }).from(users).where(where),
    ]);
    res.json({ customers: rows, total: Number(count) });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, status: users.status, createdAt: users.createdAt })
      .from(users).where(eq(users.id, req.params.id));
    if (!user) { res.status(404).json({ message: 'Customer not found' }); return; }
    const customerOrders = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
    res.json({ ...user, orders: customerOrders });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const updateCustomerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, req.params.id));
    res.json({ message: 'Status updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
