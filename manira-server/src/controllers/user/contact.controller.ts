import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db';
import { contactMessages } from '../../db/schema';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;
    await db.insert(contactMessages).values({ id: uuid(), name, email, phone, subject, message });
    res.status(201).json({ message: 'Message sent successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
