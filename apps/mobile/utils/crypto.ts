import * as Crypto from 'expo-crypto';

/**
 * Compute SHA-256 hash of a string, returns hex string.
 */
export async function computeHash(input: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return hash;
}

/**
 * Compute fingerprint hash by hashing the JSON-serialized fingerprint.
 */
export async function computeFingerprintHash(fingerprint: Record<string, unknown>): Promise<string> {
  return computeHash(JSON.stringify(fingerprint));
}

/**
 * Compute payload hash: SHA-256(imageHash + fingerprintHash + timestampMs)
 */
export async function computePayloadHash(
  imageHash: string,
  fingerprintHash: string,
  timestampMs: number
): Promise<string> {
  const input = `${imageHash}${fingerprintHash}${timestampMs}`;
  return computeHash(input);
}
