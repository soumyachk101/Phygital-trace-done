import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors';
import { processCapture } from '../services/capture.service';
import { logger } from '../utils/logger';

/**
 * POST /api/v1/captures - Submit a new capture for verification
 */
export const createCapture = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const submission = req.body;

  const result = await processCapture(userId, submission);

  res.status(201).json({
    success: true,
    data: {
      captureId: result.captureId,
      shortCode: result.shortCode,
      verificationUrl: `https://phygital-trace.com/verify/${result.shortCode}`,
      ipfsCid: result.ipfsCid,
      anomalyStatus: result.anomalyStatus,
    },
  });
});

/**
 * GET /api/v1/captures - List user's captures
 */
export const listCaptures = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  const { PrismaClient } = await import('@prisma/client');
  const prisma = (await import('../config/database')).default;

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const [captures, total] = await Promise.all([
    prisma.capture.findMany({
      where: { userId },
      orderBy: { capturedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        shortCode: true,
        imageHash: true,
        status: true,
        anomalyStatus: true,
        anomalyScore: true,
        capturedAt: true,
        ipfsCid: true,
        txHash: true,
        latitude: true,
        longitude: true,
        mediaType: true,
      },
    }),
    prisma.capture.count({ where: { userId } }),
  ]);

  res.json({
    success: true,
    data: {
      captures,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    },
  });
});

/**
 * GET /api/v1/captures/:id - Get a single capture by ID
 */
export const getCapture = asyncHandler(async (req: Request, res: Response) => {
  const prisma = (await import('../config/database')).default;

  const capture = await prisma.capture.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      shortCode: true,
      imageHash: true,
      fingerprintHash: true,
      payloadHash: true,
      status: true,
      anomalyStatus: true,
      anomalyScore: true,
      anomalyFlags: true,
      capturedAt: true,
      ipfsCid: true,
      txHash: true,
      blockNumber: true,
      attestedAt: true,
      latitude: true,
      longitude: true,
      accuracy: true,
      mediaType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!capture) {
    res.status(404).json({ success: false, error: 'Capture not found' });
    return;
  }

  res.json({ success: true, data: capture });
});
