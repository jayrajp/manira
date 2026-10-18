import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { collections } from '../../db/schema';
import { generateSlug } from '../../helper/slug';
import { eq, asc } from 'drizzle-orm';

export const getCollections = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(collections).orderBy(asc(collections.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, displayOrder } = req.body;
    const [row] = await db.insert(collections).values({ id: uuid(), name, slug: generateSlug(name), description, image, displayOrder: displayOrder ?? 0 }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...rest } = req.body;
    const update: any = { ...rest, updatedAt: new Date() };
    if (name) { update.name = name; update.slug = generateSlug(name); }
    await db.update(collections).set(update).where(eq(collections.id, req.params.id));
    res.json({ message: 'Updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteCollection = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(collections).where(eq(collections.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const toggleCollection = async (req: Request, res: Response): Promise<void> => {
  try {
    const [col] = await db.select().from(collections).where(eq(collections.id, req.params.id));
    if (!col) { res.status(404).json({ message: 'Not found' }); return; }
    await db.update(collections).set({ isActive: !col.isActive, updatedAt: new Date() }).where(eq(collections.id, col.id));
    res.json({ isActive: !col.isActive });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
