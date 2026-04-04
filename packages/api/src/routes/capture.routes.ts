import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { captureSubmissionSchema } from '../schemas/capture.schema';
import { deviceAuth } from '../middleware/auth.middleware';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { createCapture, listCaptures, getCapture } from '../controllers/capture.controller';

const router = Router();

router.use(deviceAuth);
router.use(rateLimit(10, 60 * 60 * 1000, (req) => req.deviceId || req.ip || 'unknown'));

router.post('/', validate(captureSubmissionSchema), createCapture);
router.get('/', listCaptures);
router.get('/:id', getCapture);

export default router;
