import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../helper/jwt';

export const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ message: 'Authentication required' }); return; }
  try {
    req.user = verifyToken(token) as { id: string; email: string; role?: string };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];
  if (!token) { res.status(401).json({ message: 'Admin authentication required' }); return; }
  try {
    const payload = verifyToken(token) as { id: string; email: string; role: string };
    if (!['admin', 'super_admin'].includes(payload.role)) {
      res.status(403).json({ message: 'Admin access required' }); return;
    }
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired admin token' });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?:  { id: string; email: string; role?: string };
      admin?: { id: string; email: string; role: string };
    }
  }
}
