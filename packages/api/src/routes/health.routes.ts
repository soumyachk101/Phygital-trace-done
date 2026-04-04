import { Router } from 'express';
import { asyncHandler } from '../utils/errors';
import prisma from '../config/database';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get(
  '/deep',
  asyncHandler(async (_req, res) => {
    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbOk = true;
      res.json({ status: 'ok', database: dbOk, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(503).json({
        status: 'degraded',
        database: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

export default router;
