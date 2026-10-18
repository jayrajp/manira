import { z } from 'zod';

export const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  phone:    z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp:   z.string().length(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});
