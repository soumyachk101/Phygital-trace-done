import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errors';
import { getVerificationByShortCode, recordVerificationView } from '../services/verify.service';

/**
 * GET /api/v1/verify/:shortCode - Public verification lookup
 */
export const verifyByShortCode = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;

  const result = await getVerificationByShortCode(shortCode);

  // Record the view for analytics
  try {
    recordVerificationView(
      result.captureId,
      req.ip,
      req.headers['user-agent'],
      req.headers.referer
    ).catch(() => {}); // Don't block the response
  } catch { /* ignore analytics failures */ }

  res.json({ success: true, data: result });
});

/**
 * GET /api/v1/verify/:shortCode/on-chain - Check only on-chain status
 */
export const verifyOnChainOnly = asyncHandler(async (req: Request, res: Response) => {
  const { shortCode } = req.params;
  const prisma = (await import('../config/database')).default;
  const { verifyOnChain } = await import('../services/blockchain.service');

  const capture = await prisma.capture.findUnique({
    where: { shortCode },
    select: {
      id: true,
      payloadHash: true,
      status: true,
      txHash: true,
      blockNumber: true,
      attestedAt: true,
    },
  });

  if (!capture) {
    return res.status(404).json({ success: false, error: 'Certificate not found' });
  }

  let chainVerified = false;
  if (capture.txHash) {
    try {
      const result = await verifyOnChain(capture.payloadHash);
      chainVerified = result.exists;
    } catch {
      chainVerified = false;
    }
  }

  res.json({
    success: true,
    data: {
      onChainVerified: chainVerified,
      status: capture.status,
      txHash: capture.txHash,
      blockNumber: capture.blockNumber?.toString() ?? null,
      attestedAt: capture.attestedAt,
    },
  });
});
