import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './utils/errors';
import healthRoutes from './routes/health.routes';

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*', credentials: true }));
  app.use(express.json({ limit: '50mb' }));

  // Health check at root
  app.use('/health', healthRoutes);

  // Versioned API routes
  app.use('/api/v1', routes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
  });

  // Global error handler
  app.use(errorHandler);

  return app;
};
