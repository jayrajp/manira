import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { adminUsers } from '../../db/schema';
import { hashPassword, comparePassword } from '../../helper/password';
import { signToken } from '../../helper/jwt';
import { eq } from 'drizzle-orm';

const SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'manira_setup_2024';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (!admin || !admin.isActive) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const token = signToken({ id: admin.id, email: admin.email, role: admin.role });
    res.cookie('adminToken', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const adminRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, secret } = req.body;
    if (secret !== SETUP_SECRET) { res.status(403).json({ message: 'Invalid setup secret' }); return; }
    const [exists] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    if (exists) { res.status(409).json({ message: 'Admin with this email already exists' }); return; }
    const passwordHash = await hashPassword(password);
    const [admin] = await db.insert(adminUsers).values({ id: uuid(), name, email, passwordHash, role }).returning();
    res.status(201).json({ message: 'Admin created', admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const [admin] = await db.select({ id: adminUsers.id, name: adminUsers.name, email: adminUsers.email, role: adminUsers.role })
      .from(adminUsers).where(eq(adminUsers.id, req.admin!.id));
    if (!admin) { res.status(404).json({ message: 'Admin not found' }); return; }
    res.json(admin);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, req.admin!.id));
    if (!admin) { res.status(404).json({ message: 'Admin not found' }); return; }
    const valid = await comparePassword(currentPassword, admin.passwordHash);
    if (!valid) { res.status(400).json({ message: 'Current password is incorrect' }); return; }
    const passwordHash = await hashPassword(newPassword);
    await db.update(adminUsers).set({ passwordHash, updatedAt: new Date() }).where(eq(adminUsers.id, admin.id));
    res.json({ message: 'Password updated successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
