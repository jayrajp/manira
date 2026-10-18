import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { categories } from '../../db/schema';
import { generateSlug } from '../../helper/slug';
import { eq, asc } from 'drizzle-orm';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(categories).orderBy(asc(categories.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, image, icon, displayOrder } = req.body;
    const [row] = await db.insert(categories).values({ id: uuid(), name, slug: generateSlug(name), description, image, icon, displayOrder: displayOrder ?? 0 }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, ...rest } = req.body;
    const update: any = { ...rest, updatedAt: new Date() };
    if (name) { update.name = name; update.slug = generateSlug(name); }
    await db.update(categories).set(update).where(eq(categories.id, req.params.id));
    res.json({ message: 'Updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(categories).where(eq(categories.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const toggleCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const [cat] = await db.select().from(categories).where(eq(categories.id, req.params.id));
    if (!cat) { res.status(404).json({ message: 'Not found' }); return; }
    await db.update(categories).set({ isActive: !cat.isActive, updatedAt: new Date() }).where(eq(categories.id, cat.id));
    res.json({ isActive: !cat.isActive });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
