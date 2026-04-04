export interface PhysicalFingerprint {
  timestampUtc: string;
  timestampUnixMs: number | bigint;
  gps: {
    latitude: number;
    longitude: number;
    altitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
  accelerometer: {
    x: number;
    y: number;
    z: number;
    magnitude: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  light: {
    lux: number;
  };
  barometer: {
    pressure_hpa: number;
  };
  network: {
    wifiRssi: number | null;
    cellularSignal: number | null;
    connectionType: 'wifi' | 'cellular' | 'none';
  };
  device: {
    model: string;
    osVersion: string;
    batteryLevel: number;
    isCharging: boolean;
  };
}

export interface TruthCertificate {
  imageHash: string;
  fingerprintHash: string;
  payloadHash: string;
  deviceSignature: string;
  capturedAt: string;
  fingerprint: PhysicalFingerprint;
}
