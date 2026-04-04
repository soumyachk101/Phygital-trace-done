import prisma from '../config/database';
import { ApiError } from '../utils/errors';
import { verifyOnChain } from './blockchain.service';

/**
 * Look up a capture by shortCode and return full verification data.
 */
export async function getVerificationByShortCode(shortCode: string) {
  const capture = await prisma.capture.findUnique({
    where: { shortCode },
    include: {
      fingerprint: true,
      user: {
        select: {
          id: true,
          deviceId: true,
          publicKey: true,
          username: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  if (!capture) {
    throw new ApiError(404, 'CERTIFICATE_NOT_FOUND', 'No certificate found for the given short code');
  }

  // Try on-chain verification if attested
  let onChainVerified = false;
  if (capture.status === 'ATTESTED' && capture.txHash) {
    try {
      const chainResult = await verifyOnChain(capture.payloadHash);
      onChainVerified = chainResult.exists;
    } catch (err) {
      // If chain verification fails, note it but don't fail the request
      onChainVerified = false;
    }
  }

  return {
    captureId: capture.id,
    shortCode: capture.shortCode,
    imageHash: capture.imageHash,
    fingerprintHash: capture.fingerprintHash,
    payloadHash: capture.payloadHash,
    deviceSignature: capture.deviceSignature,
    capturedAt: capture.capturedAt,
    mediaType: capture.mediaType,
    status: capture.status,
    anomalyStatus: capture.anomalyStatus,
    anomalyScore: capture.anomalyScore,
    anomalyFlags: capture.anomalyFlags,
    ipfsCid: capture.ipfsCid,
    txHash: capture.txHash,
    blockNumber: capture.blockNumber?.toString() ?? null,
    attestedAt: capture.attestedAt,
    onChainVerified,
    location: {
      latitude: capture.latitude,
      longitude: capture.longitude,
      accuracy: capture.accuracy,
    },
    fingerprint: capture.fingerprint,
    issuer: capture.user,
  };
}

/**
 * Record a verification view for analytics.
 */
export async function recordVerificationView(
  captureId: string,
  ipAddress?: string,
  userAgent?: string,
  referrer?: string
) {
  return prisma.verificationView.create({
    data: {
      captureId,
      ipAddress: ipAddress ?? 'unknown',
      userAgent: userAgent ?? 'unknown',
      referrer: referrer ?? 'direct',
    },
  });
}
