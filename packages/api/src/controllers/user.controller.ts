import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors';
import prisma from '../config/database';

/**
 * POST /api/v1/auth/register - Register a new device
 */
export const registerDevice = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId, publicKey, username } = req.body;

  const existing = await prisma.user.findUnique({
    where: { deviceId },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      error: { code: 'DEVICE_ALREADY_REGISTERED', message: 'Device already registered' },
      data: {
        userId: existing.id,
        deviceId: existing.deviceId,
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      deviceId,
      publicKey,
      username: username || null,
    },
    select: {
      id: true,
      deviceId: true,
      publicKey: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  res.status(201).json({ success: true, data: user });
});

/**
 * POST /api/v1/auth/login - Authenticate a device and get a session token
 */
export const loginDevice = asyncHandler(async (req: Request, res: Response) => {
  const { deviceId } = req.body;

  const user = await prisma.user.findUnique({
    where: { deviceId },
  });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'DEVICE_NOT_FOUND', message: 'Device not registered' },
    });
  }

  // Return the deviceId as a simple auth token
  res.json({
    success: true,
    data: {
      userId: user.id,
      deviceId: user.deviceId,
      token: user.deviceId,
    },
  });
});

/**
 * GET /api/v1/users/me - Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deviceId: true,
      username: true,
      role: true,
      publicKey: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { captures: true },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  res.json({ success: true, data: user });
});
