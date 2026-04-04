"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerificationByShortCode = getVerificationByShortCode;
exports.recordVerificationView = recordVerificationView;
const database_1 = __importDefault(require("../config/database"));
const errors_1 = require("../utils/errors");
const blockchain_service_1 = require("./blockchain.service");
/**
 * Look up a capture by shortCode and return full verification data.
 */
async function getVerificationByShortCode(shortCode) {
    const capture = await database_1.default.capture.findUnique({
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
        throw new errors_1.ApiError(404, 'CERTIFICATE_NOT_FOUND', 'No certificate found for the given short code');
    }
    // Try on-chain verification if attested
    let onChainVerified = false;
    if (capture.status === 'ATTESTED' && capture.txHash) {
        try {
            const chainResult = await (0, blockchain_service_1.verifyOnChain)(capture.payloadHash);
            onChainVerified = chainResult.exists;
        }
        catch (err) {
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
async function recordVerificationView(captureId, ipAddress, userAgent, referrer) {
    return database_1.default.verificationView.create({
        data: {
            captureId,
            ipAddress: ipAddress ?? 'unknown',
            userAgent: userAgent ?? 'unknown',
            referrer: referrer ?? 'direct',
        },
    });
}
