import { z } from 'zod';

export const adminLoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export const adminRegisterSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['admin', 'super_admin']).default('admin'),
  secret:   z.string(), // setup secret to prevent unauthorized admin registration
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
});
