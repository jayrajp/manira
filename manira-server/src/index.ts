import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import userRoutes  from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import { shiprocketWebhook } from './controllers/webhooks/shiprocket.webhook';

const app = express();

app.use(cors({
  origin: [env.CORS_ORIGIN, env.ADMIN_CORS_ORIGIN],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use('/api/user',  userRoutes);
app.use('/api/admin', adminRoutes);

// ── Public Webhooks (no auth) ─────────────────────────────────────────────────
app.post('/api/webhooks/shiprocket', shiprocketWebhook);

app.get('/health', (_req, res) => res.json({ status: 'ok', app: 'manira-server' }));

app.listen(env.PORT, () =>
  console.log(`Manira Server running on port ${env.PORT} [${env.NODE_ENV}]`)
);

export default app;
