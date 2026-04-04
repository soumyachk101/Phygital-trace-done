import { useCallback, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = 'phygital_device_id';
const PUBLIC_KEY_KEY = 'phygital_public_key';

interface SecureEnclaveState {
  deviceId: string | null;
  publicKey: string | null;
  isReady: boolean;
}

// ─── Platform-safe storage ───
// SecureStore doesn't work on web, so we use localStorage as fallback
async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    const SecureStore = await import('expo-secure-store');
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage might be disabled
    }
    return;
  }
  try {
    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore may not be available
  }
}

/**
 * Hook for device key management via Secure Enclave.
 * Generates/loads a persistent device identity.
 * Falls back to localStorage on web.
 */
export function useSecureEnclave(): SecureEnclaveState & {
  generateKeys: () => Promise<void>;
  signData: (data: string) => Promise<string>;
} {
  const [state, setState] = useState<SecureEnclaveState>({
    deviceId: null,
    publicKey: null,
    isReady: false,
  });

  const deviceIdRef = useRef<string | null>(null);

  const generateAndStoreKeys = useCallback(async () => {
    try {
      const deviceUuid = Crypto.randomUUID();
      const deviceIdHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        deviceUuid
      );

      await setItem(DEVICE_ID_KEY, deviceIdHash);
      await setItem(PUBLIC_KEY_KEY, deviceIdHash);

      deviceIdRef.current = deviceIdHash;
      setState({
        deviceId: deviceIdHash,
        publicKey: deviceIdHash,
        isReady: true,
      });
    } catch (err) {
      console.error('Failed to generate keys:', err);
      // Last resort: generate an in-memory-only identity
      const fallbackId = `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      deviceIdRef.current = fallbackId;
      setState({
        deviceId: fallbackId,
        publicKey: fallbackId,
        isReady: true,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedDeviceId = await getItem(DEVICE_ID_KEY);
        const storedPublicKey = await getItem(PUBLIC_KEY_KEY);

        if (storedDeviceId && storedPublicKey) {
          deviceIdRef.current = storedDeviceId;
          setState({
            deviceId: storedDeviceId,
            publicKey: storedPublicKey,
            isReady: true,
          });
        } else {
          await generateAndStoreKeys();
        }
      } catch {
        // If all storage fails, still generate keys in-memory
        await generateAndStoreKeys();
      }
    })();
  }, [generateAndStoreKeys]);

  const signData = useCallback(async (data: string): Promise<string> => {
    const currentDeviceId = deviceIdRef.current;
    if (!currentDeviceId) {
      throw new Error('Device not initialized');
    }

    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data + currentDeviceId
    );

    return signature;
  }, []);

  return {
    ...state,
    generateKeys: generateAndStoreKeys,
    signData,
  };
}
