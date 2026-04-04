"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeFingerprint = serializeFingerprint;
exports.hashFingerprint = hashFingerprint;
exports.extractGps = extractGps;
exports.isValidFingerprint = isValidFingerprint;
const crypto_1 = require("../utils/crypto");
/**
 * Serialize a fingerprint object to a canonical JSON string for hashing.
 * Keys are sorted for deterministic serialization.
 */
function serializeFingerprint(fingerprint) {
    return sortKeys(fingerprint);
}
/**
 * Compute the fingerprint hash from a raw fingerprint object.
 */
function hashFingerprint(fingerprint) {
    const serialized = serializeFingerprint(fingerprint);
    return (0, crypto_1.computeFingerprintHash)(fingerprint);
}
/**
 * Extract GPS coordinates from a fingerprint.
 */
function extractGps(fingerprint) {
    const gps = fingerprint.gps;
    return {
        latitude: gps?.latitude ?? 0,
        longitude: gps?.longitude ?? 0,
        accuracy: gps?.accuracy,
    };
}
/**
 * Check if a fingerprint appears valid (has required fields).
 */
function isValidFingerprint(fingerprint) {
    return !!(fingerprint.timestampUtc &&
        fingerprint.timestampUnixMs);
}
/**
 * Recursively sort object keys for deterministic JSON serialization.
 */
function sortKeys(obj) {
    if (obj === null || obj === undefined) {
        return 'null';
    }
    if (typeof obj !== 'object') {
        return JSON.stringify(obj);
    }
    if (Array.isArray(obj)) {
        return `[${obj.map(sortKeys).join(',')}]`;
    }
    const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    const pairs = entries.map(([k, v]) => `${JSON.stringify(k)}:${sortKeys(v)}`);
    return `{${pairs.join(',')}}`;
}
