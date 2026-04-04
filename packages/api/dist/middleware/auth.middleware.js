"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.deviceAuth = void 0;
const errors_1 = require("../utils/errors");
const database_1 = __importDefault(require("../config/database"));
/**
 * Authenticate requests using device-based auth.
 * Expects X-Device-Id header containing the device identifier.
 * Falls back to Authorization: Bearer <JWT> if device ID not provided.
 */
exports.deviceAuth = (0, errors_1.asyncHandler)(async (req, res, next) => {
    const deviceId = req.headers['x-device-id'];
    const authHeader = req.headers.authorization;
    if (deviceId) {
        const user = await database_1.default.user.findUnique({ where: { deviceId } });
        if (!user) {
            throw new errors_1.ApiError(401, 'DEVICE_NOT_FOUND', 'Device not registered. Call POST /api/v1/auth/register first.');
        }
        req.userId = user.id;
        req.deviceId = user.deviceId;
        next();
        return;
    }
    if (authHeader?.startsWith('Bearer ')) {
        // Simple JWT-like token validation (in production, use jsonwebtoken)
        const token = authHeader.split(' ')[1];
        if (!token || token.length < 10) {
            throw new errors_1.ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token');
        }
        // For device auth, token is the deviceId
        const user = await database_1.default.user.findUnique({ where: { deviceId: token } });
        if (!user) {
            throw new errors_1.ApiError(401, 'DEVICE_NOT_FOUND', 'Device not found for the provided token');
        }
        req.userId = user.id;
        req.deviceId = user.deviceId;
        next();
        return;
    }
    throw new errors_1.ApiError(401, 'MISSING_AUTH', 'X-Device-Id header or Authorization Bearer token is required');
});
/**
 * Optional auth — attaches user if present, does not reject requests without auth
 */
exports.optionalAuth = (0, errors_1.asyncHandler)(async (req, res, next) => {
    const deviceId = req.headers['x-device-id'];
    if (deviceId) {
        const user = await database_1.default.user.findUnique({ where: { deviceId } });
        if (user) {
            req.userId = user.id;
            req.deviceId = user.deviceId;
        }
    }
    next();
});
