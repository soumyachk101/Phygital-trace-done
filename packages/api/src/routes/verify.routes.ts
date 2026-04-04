import { Router } from 'express';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { verifyByShortCode } from '../controllers/verify.controller';

const router = Router();

router.use(rateLimit(100, 60 * 1000, (req) => req.ip || 'unknown'));

router.get('/:shortCode', verifyByShortCode);

export default router;
