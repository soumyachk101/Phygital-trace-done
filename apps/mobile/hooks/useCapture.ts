import { useState, useCallback, useRef, useEffect } from 'react';
import { Camera, CameraView } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useSensors } from './useSensors';
import { useSecureEnclave } from './useSecureEnclave';
import { API_URL } from '../constants/api';

export type CaptureStatus =
  | 'idle'
  | 'requesting_permission'
  | 'capturing'
  | 'processing'
  | 'uploading'
  | 'attesting'
  | 'complete'
  | 'error';

interface CaptureResult {
  captureId: string;
  shortCode: string;
  verificationUrl: string;
  anomalyStatus: string;
}

/**
 * Main capture hook - orchestrates the full capture flow:
 * 1. Request camera/location permissions
 * 2. Take photo and compute image hash
 * 3. Sample sensors for fingerprint
 * 4. Compute hashes and sign
 * 5. Submit to API
 */
export function useCapture() {
  const [status, setStatus] = useState<CaptureStatus>('idle');
  const [lastResult, setLastResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const sensors = useSensors(status === 'capturing' || status === 'idle');
  const sensorsRef = useRef<typeof sensors>(sensors);
  const { deviceId, signData, isReady } = useSecureEnclave();
  const deviceIdRef = useRef<string | null>(deviceId);

  // Keep refs in sync so the capture callback always reads latest values
  useEffect(() => {
    sensorsRef.current = sensors;
  }, [sensors]);
  useEffect(() => {
    deviceIdRef.current = deviceId;
  }, [deviceId]);

  const takeCapture = useCallback(async () => {
    if (!cameraRef.current || !deviceIdRef.current) return;

    try {
      setStatus('requesting_permission');
      setError(null);

      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        throw new Error('Camera permission denied');
      }

      setStatus('capturing');

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });

      if (!photo.base64) {
        throw new Error('Failed to capture image data');
      }

      setStatus('processing');

      const imageHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        photo.base64,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      const now = Date.now();
      const timestampUtc = new Date(now).toISOString();
      const deviceType = await Device.getDeviceTypeAsync();
      const osName = Constants.platform?.os ?? 'unknown';
      const osVersion = Constants.platform?.version ?? 'unknown';
      const currentSensors = sensorsRef.current;
      const fingerprint: Record<string, unknown> = {
        timestampUtc,
        timestampUnixMs: now,
        gps: currentSensors.location
          ? {
              latitude: currentSensors.location.coords.latitude,
              longitude: currentSensors.location.coords.longitude,
              altitude: currentSensors.location.coords.altitude ?? null,
              accuracy: currentSensors.locationAccuracy ?? null,
              speed: currentSensors.location.coords.speed ?? null,
              heading: currentSensors.location.coords.heading ?? null,
            }
          : null,
        accelerometer: currentSensors.accelerometer || { x: 0, y: 0, z: 0, magnitude: 0 },
        gyroscope: currentSensors.gyroscope || { x: 0, y: 0, z: 0 },
        light: { lux: 0 },
        barometer: currentSensors.barometer || { pressure_hpa: 1013.25 },
        network: {
          connectionType: 'wifi',
          wifiRssi: null,
          cellularSignal: null,
        },
        device: {
          model: Device.modelName ?? 'unknown',
          deviceType: String(deviceType),
          osVersion: `${osName} ${osVersion}`,
          batteryLevel: 100,
          isCharging: false,
        },
      };

      const fingerprintHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        JSON.stringify(fingerprint),
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      const payloadInput = `${imageHash}${fingerprintHash}${now}`;
      const payloadHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        payloadInput,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      setStatus('uploading');

      const deviceSignature = await signData(payloadHash);

      setStatus('attesting');
      const response = await fetch(`${API_URL}/api/v1/captures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceIdRef.current!,
        },
        body: JSON.stringify({
          imageHash,
          fingerprintHash,
          payloadHash,
          deviceSignature,
          mediaType: 'PHOTO',
          image: photo.base64,
          fingerprint,
          exposeLocation: true,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `API error: ${response.status}`);
      }

      const result = await response.json();
      setLastResult(result.data);
      setStatus('complete');

      return result.data as CaptureResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus('error');
    }
  }, [deviceId, signData]);

  const reset = useCallback(() => {
    setStatus('idle');
    setLastResult(null);
    setError(null);
  }, []);

  return {
    status,
    lastResult,
    error,
    cameraRef,
    isReady,
    deviceId,
    takeCapture,
    reset,
  };
}
