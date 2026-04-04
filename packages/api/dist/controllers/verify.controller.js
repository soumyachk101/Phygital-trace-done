"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOnChainOnly = exports.verifyByShortCode = void 0;
const errors_1 = require("../utils/errors");
const verify_service_1 = require("../services/verify.service");
/**
 * GET /api/v1/verify/:shortCode - Public verification lookup
 */
exports.verifyByShortCode = (0, errors_1.asyncHandler)(async (req, res) => {
    const { shortCode } = req.params;
    const result = await (0, verify_service_1.getVerificationByShortCode)(shortCode);
    // Record the view for analytics
    try {
        (0, verify_service_1.recordVerificationView)(result.captureId, req.ip, req.headers['user-agent'], req.headers.referer).catch(() => { }); // Don't block the response
    }
    catch { /* ignore analytics failures */ }
    res.json({ success: true, data: result });
});
/**
 * GET /api/v1/verify/:shortCode/on-chain - Check only on-chain status
 */
exports.verifyOnChainOnly = (0, errors_1.asyncHandler)(async (req, res) => {
    const { shortCode } = req.params;
    const prisma = (await Promise.resolve().then(() => __importStar(require('../config/database')))).default;
    const { verifyOnChain } = await Promise.resolve().then(() => __importStar(require('../services/blockchain.service')));
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
        }
        catch {
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
