import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { metals, stones } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

// ── Metals ────────────────────────────────────────────────────────────────────
export const getMetals = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(metals).orderBy(asc(metals.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createMetal = async (req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await db.insert(metals).values({ id: uuid(), name: req.body.name, displayOrder: req.body.displayOrder ?? 0 }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateMetal = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(metals).set({ ...req.body, updatedAt: new Date() }).where(eq(metals.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteMetal = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(metals).where(eq(metals.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};

// ── Stones ────────────────────────────────────────────────────────────────────
export const getStones = async (_req: Request, res: Response): Promise<void> => {
  try { res.json(await db.select().from(stones).orderBy(asc(stones.displayOrder))); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const createStone = async (req: Request, res: Response): Promise<void> => {
  try {
    const [row] = await db.insert(stones).values({ id: uuid(), name: req.body.name, displayOrder: req.body.displayOrder ?? 0 }).returning();
    res.status(201).json(row);
  } catch { res.status(500).json({ message: 'Server error' }); }
};
export const updateStone = async (req: Request, res: Response): Promise<void> => {
  try { await db.update(stones).set({ ...req.body, updatedAt: new Date() }).where(eq(stones.id, req.params.id)); res.json({ message: 'Updated' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
export const deleteStone = async (req: Request, res: Response): Promise<void> => {
  try { await db.delete(stones).where(eq(stones.id, req.params.id)); res.json({ message: 'Deleted' }); }
  catch { res.status(500).json({ message: 'Server error' }); }
};
