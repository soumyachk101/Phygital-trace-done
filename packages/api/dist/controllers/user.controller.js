"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.loginDevice = exports.registerDevice = void 0;
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
/**
 * POST /api/v1/auth/register - Register a new device
 */
exports.registerDevice = (0, errors_1.asyncHandler)(async (req, res) => {
    const { deviceId, publicKey, username } = req.body;
    const existing = await database_1.default.user.findUnique({
        where: { deviceId },
    });
    if (existing) {
        return res.status(200).json({
            success: true,
            data: {
                userId: existing.id,
                deviceId: existing.deviceId,
                message: 'Device already registered',
            },
        });
    }
    const user = await database_1.default.user.create({
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
exports.loginDevice = (0, errors_1.asyncHandler)(async (req, res) => {
    const { deviceId } = req.body;
    const user = await database_1.default.user.findUnique({
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
exports.getProfile = (0, errors_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const user = await database_1.default.user.findUnique({
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
