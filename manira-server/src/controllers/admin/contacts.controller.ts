import { Request, Response } from 'express';
import { db } from '../../db';
import { contactMessages } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const getContacts = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateContact = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(contactMessages).set({ ...req.body, updatedAt: new Date() }).where(eq(contactMessages.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(contactMessages).where(eq(contactMessages.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
