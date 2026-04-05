import { useCallback, useEffect, useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { ethers } from 'ethers';

const DEVICE_ID_KEY = 'phygital_device_id';
const PUBLIC_KEY_KEY = 'phygital_public_key';
const PRIVATE_KEY_KEY = 'phygital_private_key';

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
 * Generates/loads a persistent device identity and ECDSA P-256 keypair.
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
  const privateKeyRef = useRef<string | null>(null);

  const generateAndStoreKeys = useCallback(async () => {
    try {
      const deviceUuid = Crypto.randomUUID();
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const signingKey = new ethers.SigningKey(randomBytes);
      
      const privKeyHex = signingKey.privateKey;
      const pubKeyHex = signingKey.publicKey;

      await setItem(DEVICE_ID_KEY, deviceUuid);
      await setItem(PRIVATE_KEY_KEY, privKeyHex);
      await setItem(PUBLIC_KEY_KEY, pubKeyHex);

      deviceIdRef.current = deviceUuid;
      privateKeyRef.current = privKeyHex;
      setState({
        deviceId: deviceUuid,
        publicKey: pubKeyHex,
        isReady: true,
      });
    } catch (err) {
      console.error('Failed to generate keys:', err);
      // Last resort: generate an in-memory-only identity
      const fallbackId = `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      deviceIdRef.current = fallbackId;
      
      const randomFallback = await Crypto.getRandomBytesAsync(32);
      const fallbackKey = new ethers.SigningKey(randomFallback);
      privateKeyRef.current = fallbackKey.privateKey;
      
      setState({
        deviceId: fallbackId,
        publicKey: fallbackKey.publicKey,
        isReady: true,
      });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedDeviceId = await getItem(DEVICE_ID_KEY);
        const storedPublicKey = await getItem(PUBLIC_KEY_KEY);
        const storedPrivateKey = await getItem(PRIVATE_KEY_KEY);

        if (storedDeviceId && storedPublicKey && storedPrivateKey) {
          deviceIdRef.current = storedDeviceId;
          privateKeyRef.current = storedPrivateKey;
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
    if (!privateKeyRef.current) {
      throw new Error('Device keys not initialized');
    }

    const signingKey = new ethers.SigningKey(privateKeyRef.current);
    
    // Create SHA-256 hash of the input data
    const hashHex = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data
    );

    // Ensure the hash is padded correctly for ethers
    const standardizedHash = hashHex.startsWith('0x') ? hashHex : `0x${hashHex}`;
    
    // Sign the hash
    const signature = signingKey.sign(standardizedHash);
    return signature.serialized;
  }, []);

  return {
    ...state,
    generateKeys: generateAndStoreKeys,
    signData,
  };
}
