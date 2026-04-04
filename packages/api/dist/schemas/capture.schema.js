"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDeviceSchema = exports.captureSubmissionSchema = void 0;
const zod_1 = require("zod");
const fingerprintSchema = zod_1.z.object({
    timestampUtc: zod_1.z.string(),
    timestampUnixMs: zod_1.z.number(),
    gps: zod_1.z.object({
        latitude: zod_1.z.number(),
        longitude: zod_1.z.number(),
        altitude: zod_1.z.number().optional(),
        accuracy: zod_1.z.number().optional(),
        speed: zod_1.z.number().nullable().optional(),
        heading: zod_1.z.number().nullable().optional(),
    }).optional(),
    accelerometer: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        z: zod_1.z.number(),
        magnitude: zod_1.z.number(),
    }).optional(),
    gyroscope: zod_1.z.object({
        x: zod_1.z.number(),
        y: zod_1.z.number(),
        z: zod_1.z.number(),
    }).optional(),
    light: zod_1.z.object({
        lux: zod_1.z.number(),
    }).optional(),
    barometer: zod_1.z.object({
        pressure_hpa: zod_1.z.number(),
    }).optional(),
    network: zod_1.z.object({
        wifiRssi: zod_1.z.number().nullable().optional(),
        cellularSignal: zod_1.z.number().nullable().optional(),
        connectionType: zod_1.z.enum(['wifi', 'cellular', 'none']).optional(),
    }).optional(),
    device: zod_1.z.object({
        model: zod_1.z.string(),
        osVersion: zod_1.z.string(),
        batteryLevel: zod_1.z.number(),
        isCharging: zod_1.z.boolean(),
    }).optional(),
});
exports.captureSubmissionSchema = zod_1.z.object({
    imageHash: zod_1.z.string().length(64, 'imageHash must be a 64-character hex string'),
    fingerprintHash: zod_1.z.string().length(64, 'fingerprintHash must be a 64-character hex string'),
    payloadHash: zod_1.z.string().length(64, 'payloadHash must be a 64-character hex string'),
    deviceSignature: zod_1.z.string().min(1, 'deviceSignature is required'),
    mediaType: zod_1.z.enum(['PHOTO', 'VIDEO']).default('PHOTO'),
    image: zod_1.z.string().min(1, 'image base64 data is required'),
    fingerprint: fingerprintSchema,
    exposeLocation: zod_1.z.boolean().default(true),
});
exports.registerDeviceSchema = zod_1.z.object({
    deviceId: zod_1.z.string().min(1),
    publicKey: zod_1.z.string().min(1),
    username: zod_1.z.string().min(3).max(30).optional(),
});
