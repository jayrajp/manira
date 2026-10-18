import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"${env.FROM_NAME}" <${env.FROM_EMAIL}>`,
    to, subject, html,
  });
};

export const sendOtpEmail = (to: string, name: string, otp: string) =>
  sendEmail(to, 'Verify your Manira account', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#B8860B">Manira Jewels</h2>
      <p>Hi ${name},</p>
      <p>Your verification OTP is:</p>
      <h1 style="letter-spacing:8px;color:#B8860B;font-size:36px">${otp}</h1>
      <p>This OTP expires in <strong>10 minutes</strong>.</p>
      <p style="color:#888;font-size:12px">If you didn't request this, please ignore this email.</p>
    </div>
  `);

export const sendPasswordResetEmail = (to: string, name: string, resetLink: string) =>
  sendEmail(to, 'Reset your Manira password', `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#B8860B">Manira Jewels</h2>
      <p>Hi ${name},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display:inline-block;background:#B8860B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a>
      <p>This link expires in <strong>1 hour</strong>.</p>
    </div>
  `);
