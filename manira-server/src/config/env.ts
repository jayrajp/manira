import * as dotenv from 'dotenv';
dotenv.config();

export const env = {
  DATABASE_URL:        process.env.DATABASE_URL!,
  PORT:                Number(process.env.PORT) || 5000,
  NODE_ENV:            process.env.NODE_ENV || 'development',

  JWT_SECRET:          process.env.JWT_SECRET!,
  JWT_EXPIRES_IN:      process.env.JWT_EXPIRES_IN || '7d',

  CORS_ORIGIN:         process.env.CORS_ORIGIN || 'http://localhost:3000',
  ADMIN_CORS_ORIGIN:   process.env.ADMIN_CORS_ORIGIN || 'http://localhost:3001',

  AWS_ACCESS_KEY_ID:   process.env.AWS_ACCESS_KEY_ID!,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
  AWS_REGION:          process.env.AWS_REGION || 'ap-south-1',
  AWS_BUCKET_NAME:     process.env.AWS_BUCKET_NAME!,

  RAZORPAY_KEY_ID:     process.env.RAZORPAY_KEY_ID!,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET!,

  SMTP_HOST:           process.env.SMTP_HOST!,
  SMTP_PORT:           Number(process.env.SMTP_PORT) || 587,
  SMTP_USER:           process.env.SMTP_USER!,
  SMTP_PASS:           process.env.SMTP_PASS!,
  FROM_EMAIL:          process.env.FROM_EMAIL || 'noreply@manira.in',
  FROM_NAME:           process.env.FROM_NAME  || 'Manira Jewels',

  SHIPROCKET_TOKEN:           process.env.SHIPROCKET_TOKEN    || '', // pre-generated token (preferred)
  SHIPROCKET_EMAIL:           process.env.SHIPROCKET_EMAIL!,
  SHIPROCKET_PASSWORD:        process.env.SHIPROCKET_PASSWORD!,

  FRONTEND_URL:        process.env.FRONTEND_URL || 'http://localhost:3000',
};



