import { z } from 'zod';

const fingerprintSchema = z.object({
  timestampUtc: z.string(),
  timestampUnixMs: z.number(),
  gps: z.object({
    latitude: z.number(),
    longitude: z.number(),
    altitude: z.number().optional(),
    accuracy: z.number().optional(),
    speed: z.number().nullable().optional(),
    heading: z.number().nullable().optional(),
  }).optional(),
  accelerometer: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
    magnitude: z.number(),
  }).optional(),
  gyroscope: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }).optional(),
  light: z.object({
    lux: z.number(),
  }).optional(),
  barometer: z.object({
    pressure_hpa: z.number(),
  }).optional(),
  network: z.object({
    wifiRssi: z.number().nullable().optional(),
    cellularSignal: z.number().nullable().optional(),
    connectionType: z.enum(['wifi', 'cellular', 'none']).optional(),
  }).optional(),
  device: z.object({
    model: z.string(),
    osVersion: z.string(),
    batteryLevel: z.number(),
    isCharging: z.boolean(),
  }).optional(),
});

export const captureSubmissionSchema = z.object({
  imageHash: z.string().length(64, 'imageHash must be a 64-character hex string'),
  fingerprintHash: z.string().length(64, 'fingerprintHash must be a 64-character hex string'),
  payloadHash: z.string().length(64, 'payloadHash must be a 64-character hex string'),
  deviceSignature: z.string().min(1, 'deviceSignature is required'),
  mediaType: z.enum(['PHOTO', 'VIDEO']).default('PHOTO'),
  image: z.string().min(1, 'image base64 data is required'),
  fingerprint: fingerprintSchema,
  exposeLocation: z.boolean().default(true),
});

export type CaptureSubmission = z.infer<typeof captureSubmissionSchema>;

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  publicKey: z.string().min(1),
  username: z.string().min(3).max(30).optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
