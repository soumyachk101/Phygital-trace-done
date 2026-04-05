import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
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
 * Gracefully handles web/desktop where sensors aren't available.
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
    let mounted = true;
    const cleanups: (() => void)[] = [];

    // Only subscribe to hardware sensors on native (not web)
    if (Platform.OS !== 'web') {
      import('expo-sensors').then(({ Accelerometer, Gyroscope, Barometer }) => {
        if (!mounted) return;
        
        // Accelerometer
        Accelerometer.isAvailableAsync().then((available) => {
          if (!available || !mounted) return;
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
              accelerometer: { x: latest[0], y: latest[1], z: latest[2], magnitude: computeMagnitude(latest) },
            }));
          });
          if (mounted) cleanups.push(() => accelSub.remove());
          else accelSub.remove();
        }).catch(() => {});

        // Gyroscope
        Gyroscope.isAvailableAsync().then((available) => {
          if (!available || !mounted) return;
          Gyroscope.setUpdateInterval(100);
          const gyroSub = Gyroscope.addListener((gyro) => {
            const { x, y, z } = gyro;
            const sample = [x, y, z];
            const samples = gyroRef.current;
            samples.push(sample);
            if (samples.length > SAMPLE_COUNT) samples.shift();
            setData((prev) => ({ ...prev, gyroscope: { x, y, z } }));
          });
          if (mounted) cleanups.push(() => gyroSub.remove());
          else gyroSub.remove();
        }).catch(() => {});

        // Barometer
        Barometer.isAvailableAsync().then((available) => {
          if (!available || !mounted) return;
          Barometer.setUpdateInterval(1000);
          const baroSub = Barometer.addListener((baro) => {
            setData((prev) => ({ ...prev, barometer: { pressure_hpa: baro.pressure } }));
          });
          if (mounted) cleanups.push(() => baroSub.remove());
          else baroSub.remove();
        }).catch(() => {});
      }).catch(() => {
        console.log('Sensors module not available');
      });
    }

    // Location
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted' && mounted) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          if (mounted) {
            setData((prev) => ({
              ...prev,
              location: loc,
              locationAccuracy: loc.coords.accuracy ?? null,
            }));
          }

          const locSub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 2000 },
            (newLoc) => {
              if (mounted) {
                setData((prev) => ({
                  ...prev,
                  location: newLoc,
                  locationAccuracy: newLoc.coords.accuracy ?? null,
                }));
              }
            }
          );
          if (mounted) cleanups.push(() => locSub.remove());
          else locSub.remove();
        }
      } catch (e) {
        console.log("Location not available:", e);
      }
    })();

    return () => {
      mounted = false;
      cleanups.forEach((cleanup) => {
        try { cleanup(); } catch {}
      });
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
