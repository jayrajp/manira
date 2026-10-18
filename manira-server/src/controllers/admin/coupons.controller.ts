import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { coupons } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const getCoupons   = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(coupons).orderBy(desc(coupons.createdAt))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try { const [row] = await db.insert(coupons).values({ id: uuid(), ...req.body }).returning(); res.status(201).json(row); }
  catch (e: any) {
    if (e?.code === '23505') { res.status(409).json({ message: 'Coupon code already exists' }); return; }
    res.status(500).json({ message: 'Server error' });
  }
};
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(coupons).set({ ...req.body, updatedAt: new Date() }).where(eq(coupons.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(coupons).where(eq(coupons.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const toggleCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const [c] = await db.select().from(coupons).where(eq(coupons.id, req.params.id));
    if (!c) { res.status(404).json({ message: 'Not found' }); return; }
    await db.update(coupons).set({ isActive: !c.isActive, updatedAt: new Date() }).where(eq(coupons.id, c.id));
    res.json({ isActive: !c.isActive });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
