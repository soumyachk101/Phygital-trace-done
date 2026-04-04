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
exports.getCapture = exports.listCaptures = exports.createCapture = void 0;
const errors_1 = require("../utils/errors");
const capture_service_1 = require("../services/capture.service");
/**
 * POST /api/v1/captures - Submit a new capture for verification
 */
exports.createCapture = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const submission = req.body;
    const result = await (0, capture_service_1.processCapture)(userId, submission);
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
exports.listCaptures = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
    const prisma = (await Promise.resolve().then(() => __importStar(require('../config/database')))).default;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
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
exports.getCapture = (0, errors_1.asyncHandler)(async (req, res) => {
    const prisma = (await Promise.resolve().then(() => __importStar(require('../config/database')))).default;
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
