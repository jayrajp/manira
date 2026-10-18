import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import jwt   from 'jsonwebtoken';
import { db } from '../../db';
import { users } from '../../db/schema';
import { hashPassword, comparePassword } from '../../helper/password';
import { signToken } from '../../helper/jwt';
import { sendOtpEmail, sendPasswordResetEmail } from '../../helper/email';
import { env } from '../../config/env';
import { eq } from 'drizzle-orm';

const genOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;
    const [exists] = await db.select().from(users).where(eq(users.email, email));
    if (exists) { res.status(409).json({ message: 'Email already registered' }); return; }
    const passwordHash = await hashPassword(password);
    const otp = genOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.insert(users).values({ id: uuid(), name, email, phone, passwordHash, emailOtp: otp, otpExpiresAt });
    await sendOtpEmail(email, name, otp);
    res.status(201).json({ message: 'Registration successful. Check your email for OTP.' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (user.emailOtp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      res.status(400).json({ message: 'Invalid or expired OTP' }); return;
    }
    await db.update(users).set({ isEmailVerified: true, emailOtp: null, otpExpiresAt: null, updatedAt: new Date() }).where(eq(users.id, user.id));
    const token = signToken({ id: user.id, email: user.email });
    res.json({ message: 'Email verified', token, user: { id: user.id, name: user.name, email: user.email } });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const resendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const otp = genOtp();
    await db.update(users).set({ emailOtp: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), updatedAt: new Date() }).where(eq(users.id, user.id));
    await sendOtpEmail(email, user.name, otp);
    res.json({ message: 'OTP resent' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || user.status === 'blocked') { res.status(401).json({ message: 'Invalid credentials' }); return; }
    if (!user.passwordHash) { res.status(401).json({ message: 'Please login with Google' }); return; }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    if (!user.isEmailVerified) { res.status(403).json({ message: 'Please verify your email first', needsVerification: true }); return; }
    const token = signToken({ id: user.id, email: user.email });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, isEmailVerified: users.isEmailVerified, createdAt: users.createdAt })
      .from(users).where(eq(users.id, req.user!.id));
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json(user);
  } catch { res.status(500).json({ message: 'Server error' }); }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    await db.update(users).set({ name, phone, updatedAt: new Date() }).where(eq(users.id, req.user!.id));
    res.json({ message: 'Profile updated' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── Forgot Password — sends a reset link via email ────────────────────────────
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const [user] = await db.select({ id: users.id, name: users.name, email: users.email })
      .from(users).where(eq(users.email, email.toLowerCase().trim()));

    // Always respond 200 to prevent email enumeration attacks
    if (!user) {
      res.json({ message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    // JWT-based reset token (1 hour expiry) — no extra DB columns needed
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'password_reset' },
      env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── Reset Password — verifies JWT token and updates password ──────────────────
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    let payload: any;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as any;
    } catch {
      res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
      return;
    }

    if (payload.type !== 'password_reset') {
      res.status(400).json({ message: 'Invalid reset token' });
      return;
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, payload.id));
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    const passwordHash = await hashPassword(password);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};

// ── Google OAuth — verify ID token, auto-create account if new user ──────────
export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    if (!credential) { res.status(400).json({ message: 'Google credential required' }); return; }

    // Verify the ID token directly with Google's tokeninfo endpoint (no SDK needed)
    const gRes  = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const gData = (await gRes.json()) as any;

    if (!gRes.ok || !gData.email) {
      res.status(401).json({ message: 'Invalid Google token' });
      return;
    }

    const { email, name: gName, sub: googleId } = gData;

    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // New user — auto-register (no email verification needed for Google)
      const id = uuid();
      await db.insert(users).values({
        id,
        name:            gName || email.split('@')[0],
        email,
        googleId,
        isEmailVerified: true,
      });
      [user] = await db.select().from(users).where(eq(users.email, email));
    } else {
      // Existing user — link Google ID if not linked yet
      if (!user.googleId) {
        await db.update(users)
          .set({ googleId, isEmailVerified: true, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      }
    }

    const token = signToken({ id: user.id, email: user.email, role: 'user' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error('[Google Auth] error:', err);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

// ── Change Password (logged-in users) ────────────────────────────────────────
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ message: 'Current password is incorrect' }); return; }

    if (newPassword.length < 8) { res.status(400).json({ message: 'Password must be at least 8 characters' }); return; }

    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));
    res.json({ message: 'Password changed successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
};
