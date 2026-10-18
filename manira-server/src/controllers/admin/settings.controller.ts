import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { settings } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    res.json(map);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      const [existing] = await db.select().from(settings).where(eq(settings.key, key));
      if (existing) {
        await db.update(settings).set({ value: String(value), updatedAt: new Date() }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ id: uuid(), key, value: String(value) });
      }
    }
    res.json({ message: 'Settings updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
