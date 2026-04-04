import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerDeviceSchema } from '../schemas/capture.schema';
import { rateLimit } from '../middleware/rateLimit.middleware';
import { registerDevice, loginDevice, getProfile } from '../controllers/user.controller';
import { deviceAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerDeviceSchema), registerDevice);
router.post('/login', validate(registerDeviceSchema.pick({ deviceId: true })), loginDevice);
router.get('/me', deviceAuth, getProfile);

export default router;
