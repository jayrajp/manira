import { Request, Response } from 'express';
import { db } from '../../db';
import { settings, announcements } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const getPublicSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json({ freeShippingMin: map.freeShippingMin || '999', storeName: map.storeName || 'Manira Jewels', storePhone: map.storePhone, storeEmail: map.storeEmail });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getActiveAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(announcements).where(eq(announcements.isActive, true));
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
