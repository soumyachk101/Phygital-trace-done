import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Accelerometer,
  Gyroscope,
  Barometer,
} from 'expo-sensors';
import * as Location from 'expo-location';

interface SensorData {
  accelerometer: { x: number; y: number; z: number; magnitude: number } | null;
  gyroscope: { x: number; y: number; z: number } | null;
  barometer: { pressure_hpa: number } | null;
  location: Location.LocationObject | null;
  locationAccuracy: number | null;
}

const SAMPLE_COUNT = 10;

/**
 * Hook that subscribes to device sensors in real-time.
 * Samples at ~10Hz and keeps the last N samples.
 */
export function useSensors(active = true) {
  const [data, setData] = useState<SensorData>({
    accelerometer: null,
    gyroscope: null,
    barometer: null,
    location: null,
    locationAccuracy: null,
  });

  const accelRef = useRef<number[][]>([]);
  const gyroRef = useRef<number[][]>([]);
  const subsRef = useRef<any[]>([]);

  const computeMagnitude = useCallback((arr: number[]) => {
    return Math.sqrt(arr[0] ** 2 + arr[1] ** 2 + arr[2] ** 2);
  }, []);

  useEffect(() => {
    if (!active) return;

    const subs: any[] = [];

    // Accelerometer
    Accelerometer.isAvailableAsync().then((available) => {
      if (!available) return;
      Accelerometer.setUpdateInterval(100);
      const accelSub = Accelerometer.addListener((accel) => {
        const { x, y, z } = accel;
        const sample = [x, y, z];
        const samples = accelRef.current;
        samples.push(sample);
        if (samples.length > SAMPLE_COUNT) samples.shift();
  
        const latest = samples[samples.length - 1];
        setData((prev) => ({
          ...prev,
          accelerometer: {
            x: latest[0],
            y: latest[1],
            z: latest[2],
            magnitude: computeMagnitude(latest),
          },
        }));
      });
      subs.push(accelSub);
    });

    // Gyroscope
    Gyroscope.isAvailableAsync().then((available) => {
      if (!available) return;
      Gyroscope.setUpdateInterval(100);
      const gyroSub = Gyroscope.addListener((gyro) => {
        const { x, y, z } = gyro;
        const sample = [x, y, z];
        const samples = gyroRef.current;
        samples.push(sample);
        if (samples.length > SAMPLE_COUNT) samples.shift();
  
        setData((prev) => ({
          ...prev,
          gyroscope: { x, y, z },
        }));
      });
      subs.push(gyroSub);
    });

    // Barometer
    Barometer.isAvailableAsync().then((available) => {
      if (!available) return;
      Barometer.setUpdateInterval(1000);
      const baroSub = Barometer.addListener((baro) => {
        setData((prev) => ({
          ...prev,
          barometer: { pressure_hpa: baro.pressure },
        }));
      });
      subs.push(baroSub);
    });

    // Location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setData((prev) => ({
            ...prev,
            location: loc,
            locationAccuracy: loc.coords.accuracy ?? null,
          }));
  
          // Also watch position updates
          const locSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 2000 },
            (newLoc) => {
              setData((prev) => ({
                ...prev,
                location: newLoc,
                locationAccuracy: newLoc.coords.accuracy ?? null,
              }));
            }
          );
          subs.push(locSub);
        }
      } catch (e) {
        console.log("Location not available", e);
      }
    })();

    subsRef.current = subs;

    return () => {
      subs.forEach((s) => s.remove());
      subsRef.current = [];
    };
  }, [active, computeMagnitude]);

  const getLastSamples = useCallback(
    (key: 'accelerometer' | 'gyroscope') => {
      const ref = key === 'accelerometer' ? accelRef : gyroRef;
      return ref.current.slice(-SAMPLE_COUNT);
    },
    []
  );

  return { ...data, getLastSamples };
}
