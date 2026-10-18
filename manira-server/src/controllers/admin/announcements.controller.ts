import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { announcements } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const getAnnouncements = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(announcements).orderBy(asc(announcements.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try { const [row] = await db.insert(announcements).values({ id: uuid(), ...req.body }).returning(); res.status(201).json(row); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(announcements).set({ ...req.body, updatedAt: new Date() }).where(eq(announcements.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteAnnouncement = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(announcements).where(eq(announcements.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
