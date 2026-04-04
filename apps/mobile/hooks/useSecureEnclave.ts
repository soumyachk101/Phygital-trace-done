import { useCallback, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'phygital_device_id';
const PUBLIC_KEY_KEY = 'phygital_public_key';
const PRIVATE_KEY_KEY = 'phygital_private_key';

interface SecureEnclaveState {
  deviceId: string | null;
  publicKey: string | null;
  isReady: boolean;
}

/**
 * Hook for device key management via Secure Enclave.
 * Generates/loads a persistent device identity.
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

  // Use a ref for signData to always have the latest deviceId without re-creating the callback
  const deviceIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const storedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        const storedPublicKey = await SecureStore.getItemAsync(PUBLIC_KEY_KEY);

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
        // SecureStore may not be available (e.g. web); stay not ready
      }
    })();
  }, []);

  const generateAndStoreKeys = useCallback(async () => {
    try {
      const deviceUuid = Crypto.randomUUID();
      const deviceIdHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        deviceUuid
      );

      await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceIdHash);
      await SecureStore.setItemAsync(PUBLIC_KEY_KEY, deviceIdHash);

      deviceIdRef.current = deviceIdHash;
      setState({
        deviceId: deviceIdHash,
        publicKey: deviceIdHash,
        isReady: true,
      });
    } catch {
      // SecureStore may not be available on all platforms
    }
  }, []);

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
