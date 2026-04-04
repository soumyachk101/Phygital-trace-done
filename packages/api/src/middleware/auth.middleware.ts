import { Request, Response, NextFunction } from 'express';
import { ApiError, asyncHandler } from '../utils/errors';
import prisma from '../config/database';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      deviceId?: string;
    }
  }
}

/**
 * Authenticate requests using device-based auth.
 * Expects X-Device-Id header containing the device identifier.
 * Falls back to Authorization: Bearer <JWT> if device ID not provided.
 */
export const deviceAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.headers['x-device-id'] as string;
  const authHeader = req.headers.authorization;

  if (deviceId) {
    const user = await prisma.user.findUnique({ where: { deviceId } });
    if (!user) {
      throw new ApiError(401, 'DEVICE_NOT_FOUND', 'Device not registered. Call POST /api/v1/auth/register first.');
    }
    req.userId = user.id;
    req.deviceId = user.deviceId;
    next();
    return;
  }

  if (authHeader?.startsWith('Bearer ')) {
    // Simple JWT-like token validation (in production, use jsonwebtoken)
    const token = authHeader.split(' ')[1];
    if (!token || token.length < 10) {
      throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }
    // For device auth, token is the deviceId
    const user = await prisma.user.findUnique({ where: { deviceId: token } });
    if (!user) {
      throw new ApiError(401, 'DEVICE_NOT_FOUND', 'Device not found for the provided token');
    }
    req.userId = user.id;
    req.deviceId = user.deviceId;
    next();
    return;
  }

  throw new ApiError(401, 'MISSING_AUTH', 'X-Device-Id header or Authorization Bearer token is required');
});

/**
 * Optional auth — attaches user if present, does not reject requests without auth
 */
export const optionalAuth = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const deviceId = req.headers['x-device-id'] as string;
  if (deviceId) {
    const user = await prisma.user.findUnique({ where: { deviceId } });
    if (user) {
      req.userId = user.id;
      req.deviceId = user.deviceId;
    }
  }
  next();
});
