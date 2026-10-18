import { Request, Response } from 'express';
import { db } from '../../db';
import { products, productVariants } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export const getInventory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({ id: products.id, name: products.name, sku: products.sku, stock: products.stock, status: products.status }).from(products).orderBy(asc(products.name));
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.update(products).set({ stock: req.body.stock, updatedAt: new Date() }).where(eq(products.id, req.params.id));
    res.json({ message: 'Stock updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateVariantStock = async (req: Request, res: Response): Promise<void> => {
  try {
    await db.update(productVariants).set({ stock: req.body.stock }).where(eq(productVariants.id, req.params.variantId));
    res.json({ message: 'Variant stock updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
