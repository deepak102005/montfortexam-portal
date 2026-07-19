import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';

// Routes
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import resourceRoutes from './routes/resource.routes';
import superadminRoutes from './routes/superadmin.routes';

const app = express();

// ─── Middleware ──────────────────────────────────────────

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// ─── Routes ─────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/superadmin', superadminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error handling ─────────────────────────────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ──────────────────────────────────────────────

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`🚀 LMS Backend running on http://localhost:${env.PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

export default app;
