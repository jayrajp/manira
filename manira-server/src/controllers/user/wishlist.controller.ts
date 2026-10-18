import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { wishlistItems, products, productImages } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, req.user!.id));
    const productIds = items.map(i => i.productId);
    if (!productIds.length) { res.json([]); return; }
    const prods = await db.select().from(products).where(eq(products.id, productIds[0]));
    res.json(prods);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const addToWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const [exists] = await db.select().from(wishlistItems).where(and(eq(wishlistItems.userId, req.user!.id), eq(wishlistItems.productId, productId)));
    if (exists) { res.json({ message: 'Already in wishlist' }); return; }
    await db.insert(wishlistItems).values({ id: uuid(), userId: req.user!.id, productId });
    res.status(201).json({ message: 'Added to wishlist' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const removeFromWishlist = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, req.user!.id), eq(wishlistItems.productId, req.params.productId)));
    res.json({ message: 'Removed from wishlist' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
