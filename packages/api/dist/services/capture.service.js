"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processCapture = processCapture;
const database_1 = __importDefault(require("../config/database"));
const crypto_1 = require("../utils/crypto");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const ipfs_service_1 = require("./ipfs.service");
const ai_service_1 = require("./ai.service");
const queue_service_1 = require("./queue.service");
/**
 * Main capture processing pipeline.
 * Steps: verify signature, verify hashes, call AI, upload IPFS, save to DB, enqueue attestation.
 */
async function processCapture(userId, submission) {
    const { imageHash, fingerprintHash, payloadHash, deviceSignature, fingerprint, mediaType, image } = submission;
    // 1. Look up user
    const user = await database_1.default.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new errors_1.ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }
    // 2. Verify device signature
    const payloadToVerify = `${imageHash}${fingerprintHash}${fingerprint.timestampUnixMs}`;
    const sigValid = (0, crypto_1.verifyDeviceSignature)(user.publicKey, payloadToVerify, deviceSignature);
    if (!sigValid) {
        throw new errors_1.ApiError(401, 'INVALID_SIGNATURE', 'Device signature verification failed');
    }
    // 3. Recompute fingerprint hash and verify
    const computedFingerprintHash = (0, crypto_1.computeFingerprintHash)(fingerprint);
    if (computedFingerprintHash !== fingerprintHash) {
        throw new errors_1.ApiError(400, 'FINGERPRINT_HASH_MISMATCH', 'Fingerprint hash does not match submitted data');
    }
    // 4. Call AI anomaly detection service
    const anomalyResult = await (0, ai_service_1.analyzeFingerprint)(fingerprint);
    logger_1.logger.info('AI anomaly result', anomalyResult);
    if (anomalyResult.anomaly_status === 'HIGH_RISK') {
        throw new errors_1.ApiError(422, 'ANOMALY_DETECTED', 'Capture flagged as high risk by AI analysis', {
            flags: anomalyResult.triggered_flags,
        });
    }
    // 5. Upload image to IPFS
    logger_1.logger.info('Uploading image to IPFS...');
    const ipfsResult = await (0, ipfs_service_1.uploadToIPFS)(Buffer.from(image, 'base64'), {
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
    const metadataResult = await (0, ipfs_service_1.uploadToIPFS)(Buffer.from(JSON.stringify(metadata)), { contentType: 'application/json', name: `metadata-${payloadHash}` });
    // 7. Save to database
    const capture = await database_1.default.capture.create({
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
            anomalyStatus: anomalyResult.anomaly_status,
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
    await (0, queue_service_1.enqueueAttestation)(capture.id, payloadHash, metadataResult.cid);
    const verificationUrl = `/verify/${capture.shortCode}`;
    return {
        captureId: capture.id,
        shortCode: capture.shortCode,
        ipfsCid: metadataResult.cid,
        verificationUrl,
        anomalyStatus: anomalyResult.anomaly_status,
    };
}
