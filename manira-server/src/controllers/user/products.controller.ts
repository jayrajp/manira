import { Request, Response } from 'express';
import { db } from '../../db';
import { products, productImages, productVariants, productSizes, categories, collections, banners, reviews } from '../../db/schema';
import { eq, like, and, desc, asc, sql, inArray, gte, lte, ilike } from 'drizzle-orm';

const attachImages = async (ids: string[]) => {
  if (!ids.length) return {};
  const imgs = await db.select().from(productImages)
    .where(inArray(productImages.productId, ids))
    .orderBy(asc(productImages.displayOrder));
  const map: Record<string, string[]> = {};
  for (const img of imgs) {
    if (!map[img.productId]) map[img.productId] = [];
    map[img.productId].push(img.imageUrl);
  }
  return map;
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search, category, collection: col, metal, stone, finish, look, gender, occasion,
      minPrice, maxPrice, sort = 'default', page = '1', limit = '24', onSale, badge,
    } = req.query as Record<string, string>;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, parseInt(limit));
    const offset   = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(products.status, 'active')];
    if (search)    conditions.push(ilike(products.name, `%${search}%`));
    if (category)  conditions.push(eq(products.categoryId, category));
    if (col)       conditions.push(eq(products.collectionId, col));
    if (metal)     conditions.push(eq(products.metal, metal));
    if (finish)    conditions.push(eq(products.finish, finish));
    if (look)      conditions.push(eq(products.look, look));
    if (gender)    conditions.push(eq(products.gender, gender));
    if (badge)     conditions.push(eq(products.badge, badge));
    if (occasion)  conditions.push(ilike(products.occasion, `%${occasion}%`));
    if (minPrice)  conditions.push(gte(products.price, parseInt(minPrice)));
    if (maxPrice)  conditions.push(lte(products.price, parseInt(maxPrice)));
    if (onSale === 'true') conditions.push(sql`${products.mrp} > ${products.price}`);

    const where = and(...conditions);
    const orderBy = sort === 'price_asc'  ? asc(products.price)
                  : sort === 'price_desc' ? desc(products.price)
                  : sort === 'rating'     ? desc(products.rating)
                  : sort === 'newest'     ? desc(products.createdAt)
                  : sort === 'bestselling'? desc(products.sold)
                  : desc(products.createdAt);

    const [rows, [{ count }]] = await Promise.all([
      db.select().from(products).where(where).orderBy(orderBy).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(products).where(where),
    ]);

    const imageMap = await attachImages(rows.map(r => r.id));
    const data = rows.map(p => ({ ...p, images: imageMap[p.id] || [] }));
    res.json({ products: data, total: Number(count), page: pageNum, limit: limitNum });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Server error' }); }
};

export const getFeaturedProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(products)
      .where(and(eq(products.status, 'active'), eq(products.isFeatured, true)))
      .orderBy(desc(products.createdAt)).limit(12);
    const imageMap = await attachImages(rows.map(r => r.id));
    res.json(rows.map(p => ({ ...p, images: imageMap[p.id] || [] })));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getNewArrivals = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(products)
      .where(and(eq(products.status, 'active'), eq(products.badge, 'new')))
      .orderBy(desc(products.createdAt)).limit(12);
    const imageMap = await attachImages(rows.map(r => r.id));
    res.json(rows.map(p => ({ ...p, images: imageMap[p.id] || [] })));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getBestsellers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select().from(products)
      .where(and(eq(products.status, 'active'), eq(products.badge, 'bestseller')))
      .orderBy(desc(products.sold)).limit(12);
    const imageMap = await attachImages(rows.map(r => r.id));
    res.json(rows.map(p => ({ ...p, images: imageMap[p.id] || [] })));
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getProductBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const [product] = await db.select().from(products).where(eq(products.slug, req.params.slug));
    if (!product) { res.status(404).json({ message: 'Product not found' }); return; }
    const [imgs, vars, sizes, productReviews] = await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.displayOrder)),
      db.select().from(productVariants).where(eq(productVariants.productId, product.id)),
      db.select().from(productSizes).where(eq(productSizes.productId, product.id)),
      db.select().from(reviews).where(and(eq(reviews.productId, product.id), eq(reviews.status, 'approved'))).orderBy(desc(reviews.createdAt)).limit(10),
    ]);
    res.json({ ...product, images: imgs.map(i => i.imageUrl), rawImages: imgs, variants: vars, sizes, reviews: productReviews });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cats = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.displayOrder));
    res.json(cats);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getCollections = async (_req: Request, res: Response): Promise<void> => {
  try {
    const cols = await db.select().from(collections).where(eq(collections.isActive, true)).orderBy(asc(collections.displayOrder));
    res.json(cols);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getBanners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.query as { position?: string };
    const where = position
      ? and(eq(banners.isActive, true), eq(banners.position, position))
      : eq(banners.isActive, true);
    const rows = await db.select().from(banners).where(where).orderBy(asc(banners.displayOrder));
    res.json(rows);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
