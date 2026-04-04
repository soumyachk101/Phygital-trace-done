import { createHash, createVerify } from 'crypto';
import { ApiError } from './errors';

/**
 * Compute SHA-256 hash of a buffer, returns hex string
 */
export function sha256(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Compute SHA-256 hash of a string
 */
export function sha256String(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Compute the fingerprint hash by serializing the fingerprint object to JSON and hashing it.
 */
export function computeFingerprintHash(fingerprint: Record<string, unknown>): string {
  const json = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
  return sha256String(json);
}

/**
 * Compute the payload hash: SHA-256(imageHash + fingerprintHash + timestampMs)
 */
export function computePayloadHash(
  imageHash: string,
  fingerprintHash: string,
  timestampMs: number
): string {
  const input = `${imageHash}${fingerprintHash}${timestampMs}`;
  return sha256String(input);
}

/**
 * Verify a device signature using ECDSA (ES256 / P-256 / secp256r1).
 * The signature is assumed to be hex-encoded DER format.
 */
export function verifyDeviceSignature(
  publicKey: string,
  payload: string,
  signature: string
): boolean {
  try {
    const verifier = createVerify('SHA256');
    verifier.update(payload);
    verifier.end();

    const pemKey = publicKey.startsWith('-----BEGIN')
      ? publicKey
      : createPemFromRawKey(publicKey);

    return verifier.verify(pemKey, Buffer.from(signature, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Convert a raw hex-encoded P-256 public key to PEM format.
 * Supports both compressed (33 bytes) and uncompressed (65 bytes) formats.
 */
function createPemFromRawKey(rawHex: string): string {
  const prefix = rawHex.startsWith('04')
    ? '-----BEGIN PUBLIC KEY-----\n'
    : '-----BEGIN PUBLIC KEY-----\n';

  if (rawHex.startsWith('-----BEGIN')) {
    return rawHex;
  }

  // Build PEM manually for P-256 uncompressed key
  const keyBytes = Buffer.from(rawHex, 'hex');
  if (keyBytes.length === 64) {
    // Raw 32+32 bytes (x,y), prepend 04 to get 65 bytes
    const uncompressed = Buffer.concat([Buffer.from([0x04]), keyBytes]);
    return encodeSpkiPem(uncompressed);
  }

  if (keyBytes.length === 65 && keyBytes[0] === 0x04) {
    return encodeSpkiPem(keyBytes);
  }

  throw new ApiError(400, 'INVALID_PUBLIC_KEY', 'Public key must be 64 or 65 bytes');
}

/**
 * Encode a 65-byte uncompressed P-256 key to SPKI PEM format
 */
function encodeSpkiPem(uncompressedKey: Buffer): string {
  // SPKI header for P-256
  const spkiHeader = Buffer.from([
    0x30, 0x59, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02,
    0x01, 0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
  ]);

  const der = Buffer.concat([spkiHeader, uncompressedKey]);
  const base64 = der.toString('base64');
  const lines = base64.match(/.{1,64}/g) || [base64];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}
