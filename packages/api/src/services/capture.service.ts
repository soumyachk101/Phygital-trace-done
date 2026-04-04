import axios from 'axios';
import { env } from '../config/env';
import prisma from '../config/database';
import { computeFingerprintHash, verifyDeviceSignature } from '../utils/crypto';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';
import { uploadToIPFS } from './ipfs.service';
import { analyzeFingerprint } from './ai.service';
import { enqueueAttestation } from './queue.service';
import { CaptureSubmission } from '../schemas/capture.schema';

/**
 * Main capture processing pipeline.
 * Steps: verify signature, verify hashes, call AI, upload IPFS, save to DB, enqueue attestation.
 */
export async function processCapture(
  userId: string,
  submission: CaptureSubmission
) {
  const { imageHash, fingerprintHash, payloadHash, deviceSignature, fingerprint, mediaType, image } = submission;

  // 1. Look up user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }

  // 2. Verify device signature
  const payloadToVerify = `${imageHash}${fingerprintHash}${fingerprint.timestampUnixMs}`;
  const sigValid = verifyDeviceSignature(user.publicKey, payloadToVerify, deviceSignature);
  if (!sigValid) {
    throw new ApiError(401, 'INVALID_SIGNATURE', 'Device signature verification failed');
  }

  // 3. Recompute fingerprint hash and verify
  const computedFingerprintHash = computeFingerprintHash(fingerprint);
  if (computedFingerprintHash !== fingerprintHash) {
    throw new ApiError(400, 'FINGERPRINT_HASH_MISMATCH', 'Fingerprint hash does not match submitted data');
  }

  // 4. Call AI anomaly detection service
  const anomalyResult = await analyzeFingerprint(fingerprint);
  logger.info('AI anomaly result', anomalyResult);

  if (anomalyResult.anomaly_status === 'HIGH_RISK') {
    throw new ApiError(422, 'ANOMALY_DETECTED', 'Capture flagged as high risk by AI analysis', {
      flags: anomalyResult.triggered_flags,
    });
  }

  // 5. Upload image to IPFS
  logger.info('Uploading image to IPFS...');
  const ipfsResult = await uploadToIPFS(Buffer.from(image, 'base64'), {
    contentType: mediaType === 'VIDEO' ? 'video/mp4' : 'image/jpeg',
    name: `phygital-trace-${Date.now()}`,
  });

  // 6. Upload metadata JSON to IPFS
  const metadata = {
    imageHash,
    fingerprintHash,
    payloadHash,
    capturedAt: fingerprint.timestampUtc,
    fingerprint,
    anomalyStatus: anomalyResult.anomaly_status,
    anomalyScore: anomalyResult.anomaly_score,
    anomalyFlags: anomalyResult.triggered_flags,
    ipfsImageCid: ipfsResult.cid,
  };

  const metadataResult = await uploadToIPFS(
    Buffer.from(JSON.stringify(metadata)),
    { contentType: 'application/json', name: `metadata-${payloadHash}` }
  );

  // 7. Save to database
  const capture = await prisma.capture.create({
    data: {
      userId,
      imageHash,
      fingerprintHash,
      payloadHash,
      deviceSignature,
      mediaType,
      ipfsCid: metadataResult.cid,
      ipfsThumbnailCid: ipfsResult.cid,
      status: 'PENDING_CHAIN',
      anomalyStatus: anomalyResult.anomaly_status as any,
      anomalyScore: anomalyResult.anomaly_score,
      anomalyFlags: anomalyResult.triggered_flags,
      capturedAt: new Date(fingerprint.timestampUtc),
      latitude: submission.exposeLocation ? fingerprint.gps?.latitude ?? null : null,
      longitude: submission.exposeLocation ? fingerprint.gps?.longitude ?? null : null,
      accuracy: fingerprint.gps?.accuracy ?? null,
      fingerprint: {
        create: {
          timestampUtc: fingerprint.timestampUtc,
          timestampUnixMs: BigInt(fingerprint.timestampUnixMs),
          gpsLatitude: fingerprint.gps?.latitude ?? null,
          gpsLongitude: fingerprint.gps?.longitude ?? null,
          gpsAltitude: fingerprint.gps?.altitude ?? null,
          gpsAccuracy: fingerprint.gps?.accuracy ?? null,
          gpsSpeed: fingerprint.gps?.speed ?? null,
          gpsHeading: fingerprint.gps?.heading ?? null,
          accelX: fingerprint.accelerometer?.x ?? null,
          accelY: fingerprint.accelerometer?.y ?? null,
          accelZ: fingerprint.accelerometer?.z ?? null,
          accelMagnitude: fingerprint.accelerometer?.magnitude ?? null,
          gyroX: fingerprint.gyroscope?.x ?? null,
          gyroY: fingerprint.gyroscope?.y ?? null,
          gyroZ: fingerprint.gyroscope?.z ?? null,
          lightLux: fingerprint.light?.lux ?? null,
          pressureHpa: fingerprint.barometer?.pressure_hpa ?? null,
          wifiRssi: fingerprint.network?.wifiRssi ?? null,
          cellularSignal: fingerprint.network?.cellularSignal ?? null,
          connectionType: fingerprint.network?.connectionType ?? null,
          deviceModel: fingerprint.device?.model ?? null,
          osVersion: fingerprint.device?.osVersion ?? null,
          batteryLevel: fingerprint.device?.batteryLevel ?? null,
          isCharging: fingerprint.device?.isCharging ?? null,
        },
      },
    },
    include: { fingerprint: true },
  });

  // 8. Enqueue blockchain attestation
  await enqueueAttestation(capture.id, payloadHash, metadataResult.cid);

  const verificationUrl = `/verify/${capture.shortCode}`;

  return {
    captureId: capture.id,
    shortCode: capture.shortCode,
    ipfsCid: metadataResult.cid,
    verificationUrl,
    anomalyStatus: anomalyResult.anomaly_status,
  };
}
