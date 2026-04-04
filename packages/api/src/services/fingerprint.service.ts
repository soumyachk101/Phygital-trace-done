import { computeFingerprintHash } from '../utils/crypto';

/**
 * Serialize a fingerprint object to a canonical JSON string for hashing.
 * Keys are sorted for deterministic serialization.
 */
export function serializeFingerprint(fingerprint: Record<string, unknown>): string {
  return sortKeys(fingerprint);
}

/**
 * Compute the fingerprint hash from a raw fingerprint object.
 */
export function hashFingerprint(fingerprint: Record<string, unknown>): string {
  const serialized = serializeFingerprint(fingerprint);
  return computeFingerprintHash(fingerprint);
}

/**
 * Extract GPS coordinates from a fingerprint.
 */
export function extractGps(fingerprint: Record<string, unknown>): {
  latitude: number;
  longitude: number;
  accuracy?: number;
} {
  const gps = fingerprint.gps as Record<string, unknown> | undefined;
  return {
    latitude: (gps?.latitude as number) ?? 0,
    longitude: (gps?.longitude as number) ?? 0,
    accuracy: gps?.accuracy as number | undefined,
  };
}

/**
 * Check if a fingerprint appears valid (has required fields).
 */
export function isValidFingerprint(fingerprint: Record<string, unknown>): boolean {
  return !!(
    fingerprint.timestampUtc &&
    fingerprint.timestampUnixMs
  );
}

/**
 * Recursively sort object keys for deterministic JSON serialization.
 */
function sortKeys(obj: unknown): string {
  if (obj === null || obj === undefined) {
    return 'null';
  }
  if (typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return `[${obj.map(sortKeys).join(',')}]`;
  }
  const entries = Object.entries(obj as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  const pairs = entries.map(([k, v]) => `${JSON.stringify(k)}:${sortKeys(v)}`);
  return `{${pairs.join(',')}}`;
}
