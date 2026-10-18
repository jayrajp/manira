import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { banners } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const getBanners    = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(banners).orderBy(asc(banners.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createBanner  = async (req: Request, res: Response): Promise<void> => {
  try { const [row] = await db.insert(banners).values({ id: uuid(), ...req.body }).returning(); res.status(201).json(row); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateBanner  = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(banners).set({ ...req.body, updatedAt: new Date() }).where(eq(banners.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteBanner  = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(banners).where(eq(banners.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const toggleBanner  = async (req: Request, res: Response): Promise<void> => {
  try {
    const [b] = await db.select().from(banners).where(eq(banners.id, req.params.id));
    if (!b) { res.status(404).json({ message: 'Not found' }); return; }
    await db.update(banners).set({ isActive: !b.isActive, updatedAt: new Date() }).where(eq(banners.id, b.id));
    res.json({ isActive: !b.isActive });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
