import { Router } from 'express';
import captureRoutes from './capture.routes';
import verifyRoutes from './verify.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/captures', captureRoutes);
router.use('/verify', verifyRoutes);
router.use('/auth', authRoutes);

export default router;
