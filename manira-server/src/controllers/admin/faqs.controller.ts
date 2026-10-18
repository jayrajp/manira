import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { productFaqs } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const getProductFaqs = async (req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(productFaqs).where(eq(productFaqs.productId, req.params.productId)).orderBy(asc(productFaqs.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createFaq = async (req: Request, res: Response): Promise<void> => {
  try {
    const { question, answer, displayOrder } = req.body;
    const [row] = await db.insert(productFaqs).values({ id: uuid(), productId: req.params.productId, question, answer, displayOrder: displayOrder ?? 0 }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateFaq = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(productFaqs).set({ ...req.body, updatedAt: new Date() }).where(eq(productFaqs.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteFaq = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(productFaqs).where(eq(productFaqs.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
