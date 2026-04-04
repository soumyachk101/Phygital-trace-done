import { z } from 'zod';

const fingerprintSchema = z.object({
  timestampUtc: z.string(),
  timestampUnixMs: z.number().positive(),
  gps: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    altitude: z.number().min(-500).max(50000).optional(),
    accuracy: z.number().optional(),
    speed: z.number().nullable().optional(),
    heading: z.number().nullable().optional(),
  }).optional(),
  accelerometer: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    z: z.number().finite(),
    magnitude: z.number().finite(),
  }).optional(),
  gyroscope: z.object({
    x: z.number().finite(),
    y: z.number().finite(),
    z: z.number().finite(),
  }).optional(),
  light: z.object({
    lux: z.number().min(0),
  }).optional(),
  barometer: z.object({
    pressure_hpa: z.number().positive(),
  }).optional(),
  network: z.object({
    wifiRssi: z.number().min(-120).max(-1).nullable().optional(),
    cellularSignal: z.number().min(-120).max(-1).nullable().optional(),
    connectionType: z.enum(['wifi', 'cellular', 'none']).optional(),
  }).optional(),
  device: z.object({
    model: z.string(),
    osVersion: z.string(),
    batteryLevel: z.number().min(0).max(100),
    isCharging: z.boolean(),
  }).optional(),
});

export const captureSubmissionSchema = z.object({
  imageHash: z.string().regex(/^[0-9a-f]{64}$/i, 'imageHash must be a valid 64-character hex string'),
  fingerprintHash: z.string().regex(/^[0-9a-f]{64}$/i, 'fingerprintHash must be a valid 64-character hex string'),
  payloadHash: z.string().regex(/^[0-9a-f]{64}$/i, 'payloadHash must be a valid 64-character hex string'),
  deviceSignature: z.string().min(1, 'deviceSignature is required'),
  mediaType: z.enum(['PHOTO', 'VIDEO']).default('PHOTO'),
  image: z.string().max(52428800, 'Image must be less than 50MB encoded'),
  fingerprint: fingerprintSchema.refine(
    (data) => {
      if (!data.timestampUnixMs) return true;
      const now = Date.now();
      const diff = Math.abs(now - data.timestampUnixMs);
      return diff < 365 * 24 * 60 * 60 * 1000; // within 1 year
    },
    { message: 'Timestamp must be within 1 year of current time' }
  ),
  exposeLocation: z.boolean().default(true),
});

export type CaptureSubmission = z.infer<typeof captureSubmissionSchema>;

export const registerDeviceSchema = z.object({
  deviceId: z.string().min(1),
  publicKey: z.string().min(1),
  username: z.string().min(3).max(30).optional(),
});

export type RegisterDeviceInput = z.infer<typeof registerDeviceSchema>;
