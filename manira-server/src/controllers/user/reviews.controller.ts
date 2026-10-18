import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { reviews, products } from '../../db/schema';
import { eq, sql } from 'drizzle-orm';

export const submitReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;
    const [user] = await db.select({ name: (await import('../../db/schema')).users.name }).from((await import('../../db/schema')).users).where(eq((await import('../../db/schema')).users.id, req.user!.id));
    await db.insert(reviews).values({ id: uuid(), userId: req.user!.id, productId, rating, comment, customerName: user?.name || 'Customer', status: 'pending' });
    res.status(201).json({ message: 'Review submitted for moderation' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const markHelpful = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.update(reviews).set({ helpful: sql`helpful + 1` }).where(eq(reviews.id, req.params.id));
    res.json({ message: 'Marked as helpful' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
