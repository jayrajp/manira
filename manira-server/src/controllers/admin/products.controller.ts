import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { products, productImages, productVariants, productSizes, categories, collections } from '../../db/schema';
import { generateSlug } from '../../helper/slug';
import { eq, like, and, or, desc, asc, sql, inArray } from 'drizzle-orm';

const buildProductWhere = (q: Record<string, string>) => {
  const conditions = [];
  if (q.search)     conditions.push(like(products.name, `%${q.search}%`));
  if (q.category)   conditions.push(eq(products.categoryId, q.category));
  if (q.collection) conditions.push(eq(products.collectionId, q.collection));
  if (q.status)     conditions.push(eq(products.status, q.status));
  if (q.metal)      conditions.push(eq(products.metal, q.metal));
  if (q.gender)     conditions.push(eq(products.gender, q.gender));
  return conditions.length ? and(...conditions) : undefined;
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sort = 'newest', page = '1', limit = '20', ...rest } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;
    const where = buildProductWhere(rest);

    const orderBy = sort === 'price_asc'  ? asc(products.price)
                  : sort === 'price_desc' ? desc(products.price)
                  : sort === 'rating'     ? desc(products.rating)
                  : desc(products.createdAt);

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(products).where(where).orderBy(orderBy).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products).where(where),
    ]);

    // Attach main image for each product
    const ids = rows.map(r => r.id);
    const images = ids.length
      ? await db.select().from(productImages).where(and(inArray(productImages.productId, ids), eq(productImages.isMain, true)))
      : [];
    const imageMap = Object.fromEntries(images.map(i => [i.productId, i.imageUrl]));

    const data = rows.map(p => ({ ...p, mainImage: imageMap[p.id] || null }));
    res.json({ products: data, total: Number(count), page: pageNum, limit: limitNum });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [product] = await db.select().from(products).where(eq(products.id, req.params.id));
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
    const [imgs, vars, sizes] = await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.displayOrder)),
      db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
      db.select().from(productSizes).where(eq(productSizes.productId, product.id)),
    ]);
    res.json({ ...product, images: imgs, variants: vars, sizes });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { images = [], variants = [], sizes: sz = [], ...data } = req.body;
    const id   = uuid();
    const slug = generateSlug(data.name);
    await db.insert(products).values({ id, slug, ...data });

    if (images.length) {
      await db.insert(productImages).values(images.map((img: any, i: number) => ({
        id: uuid(), productId: id, imageUrl: img.imageUrl,
        displayOrder: img.displayOrder ?? i, isMain: img.isMain ?? i === 0,
      })));
    }
    if (variants.length) {
      await db.insert(productVariants).values(variants.map((v: any) => ({ id: uuid(), productId: id, ...v })));
    }
    if (sz.length) {
      await db.insert(productSizes).values(sz.map((s: any) => ({ id: uuid(), productId: id, ...s })));
    }

    const [created] = await db.select().from(products).where(eq(products.id, id));
    res.status(201).json(created);
  } catch (e: any) {
    if (e?.code === '23505') { res.status(409).json({ message: 'SKU already exists' }); return; }
    console.error(e); res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { images, variants, sizes: sz, ...data } = req.body;

    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
    if (!exists) { res.status(404).json({ message: 'Product not found' }); return; }

    if (data.name) data.slug = generateSlug(data.name);
    await db.update(products).set({ ...data, updatedAt: new Date() }).where(eq(products.id, id));

    if (Array.isArray(images)) {
      await db.delete(productImages).where(eq(productImages.productId, id));
      if (images.length) {
        await db.insert(productImages).values(images.map((img: any, i: number) => ({
          id: uuid(), productId: id, imageUrl: img.imageUrl,
          displayOrder: img.displayOrder ?? i, isMain: img.isMain ?? i === 0,
        })));
      }
    }
    if (Array.isArray(variants)) {
      await db.delete(productVariants).where(eq(productVariants.productId, id));
      if (variants.length) {
        await db.insert(productVariants).values(variants.map((v: any) => ({ id: uuid(), productId: id, ...v })));
      }
    }
    if (Array.isArray(sz)) {
      await db.delete(productSizes).where(eq(productSizes.productId, id));
      if (sz.length) {
        await db.insert(productSizes).values(sz.map((s: any) => ({ id: uuid(), productId: id, ...s })));
      }
    }

    const [updated] = await db.select().from(products).where(eq(products.id, id));
    res.json(updated);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, req.params.id));
    if (!exists) { res.status(404).json({ message: 'Product not found' }); return; }
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ message: 'Product deleted' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const bulkDeleteProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    await db.delete(products).where(inArray(products.id, ids));
    res.json({ message: `${ids.length} products deleted` });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    if (!file) { res.status(400).json({ message: 'No file uploaded' }); return; }
    res.json({ url: (file as any).location });
  } catch { res.status(500).json({ message: 'Upload failed' }); }
};
