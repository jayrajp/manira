import { Request, Response } from 'express';
import { db } from '../../db';
import { reviews } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';

export const getReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = parseInt(page); const limitNum = parseInt(limit);
    const where = status ? eq(reviews.status, status) : undefined;
    const rows = await db.select().from(reviews).where(where).orderBy(desc(reviews.createdAt)).limit(limitNum).offset((pageNum - 1) * limitNum);
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(reviews).where(where);
    res.json({ reviews: rows, total: Number(count) });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.update(reviews).set({ status: req.body.status, updatedAt: new Date() }).where(eq(reviews.id, req.params.id));
    res.json({ message: 'Status updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(reviews).where(eq(reviews.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
