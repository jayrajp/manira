import { z } from 'zod';

export const createProductSchema = z.object({
  name:         z.string().min(2).max(255),
  sku:          z.string().min(2).max(100),
  categoryId:   z.string().uuid().optional().nullable(),
  collectionId: z.string().uuid().optional().nullable(),
  metal:        z.string().max(100).optional().nullable(),
  purity:       z.string().max(50).optional().nullable(),
  stone:        z.string().max(500).optional().nullable(),
  finish:       z.string().max(100).optional().nullable(),
  look:         z.string().max(100).optional().nullable(),
  gender:       z.enum(['women', 'men', 'unisex']).default('women'),
  occasion:     z.string().max(500).optional().nullable(),
  isFeatured:   z.boolean().default(false),
  price:        z.number().int().positive(),
  mrp:          z.number().int().positive(),
  stock:        z.number().int().min(0).default(0),
  status:       z.enum(['active', 'draft', 'out_of_stock']).default('active'),
  description:      z.string().optional().nullable(),
  careInstructions: z.string().optional().nullable(),
  weight:      z.number().optional().nullable(),
  dimensions:  z.string().max(100).optional().nullable(),
  tags:        z.string().optional().nullable(),
  badge:       z.enum(['new', 'bestseller', 'sale', 'trending', 'limited']).optional().nullable(),
  videoUrl:    z.string().url().optional().nullable(),
  mediaOrder:  z.enum(['image_first', 'video_first']).default('image_first'),
  seoTitle:       z.string().max(255).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),

  // Nested
  images:   z.array(z.object({ imageUrl: z.string(), displayOrder: z.number().int(), isMain: z.boolean() })).optional(),
  variants: z.array(z.object({ label: z.string(), hexColor: z.string().optional(), stock: z.number().int() })).optional(),
  sizes:    z.array(z.object({ size: z.string(), stock: z.number().int() })).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});
