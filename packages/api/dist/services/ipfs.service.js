"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToIPFS = uploadToIPFS;
exports.uploadJSONToIPFS = uploadJSONToIPFS;
exports.fetchFromIPFS = fetchFromIPFS;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
/**
 * Upload a file to IPFS via Pinata API.
 * @param fileBuffer - Raw file bytes
 * @param metadata - Optional metadata (name, contentType)
 * @returns IPFS CID
 */
async function uploadToIPFS(fileBuffer, metadata = {}) {
    if (!env_1.env.PINATA_API_KEY || !env_1.env.PINATA_SECRET_KEY) {
        logger_1.logger.warn('Pinata keys not set, returning mock CID');
        return { cid: 'QmMock' + Date.now().toString(36) };
    }
    try {
        const formData = new FormData();
        const blob = new Blob([Uint8Array.from(fileBuffer)], { type: metadata.contentType || 'application/octet-stream' });
        formData.append('file', blob, metadata.name || 'file');
        const pinataMetadata = JSON.stringify({
            name: metadata.name || `phygital-trace-${Date.now()}`,
        });
        formData.append('pinataMetadata', pinataMetadata);
        const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'pinata_api_key': env_1.env.PINATA_API_KEY,
                'pinata_secret_api_key': env_1.env.PINATA_SECRET_KEY,
            },
            timeout: 30000,
        });
        return { cid: response.data.IpfsHash };
    }
    catch (err) {
        logger_1.logger.error('IPFS upload failed', { error: err.message });
        throw new errors_1.ApiError(502, 'IPFS_UPLOAD_FAILED', 'Failed to upload to IPFS', {
            detail: err.message,
        });
    }
}
/**
 * Upload JSON data to IPFS via Pinata API.
 * @param data - JSON-serializable data
 * @param name - Optional name for the Pinata metadata
 * @returns IPFS CID
 */
async function uploadJSONToIPFS(data, name) {
    if (!env_1.env.PINATA_API_KEY || !env_1.env.PINATA_SECRET_KEY) {
        logger_1.logger.warn('Pinata keys not set, returning mock CID for JSON');
        return { cid: 'QmMockJson' + Date.now().toString(36) };
    }
    try {
        const response = await axios_1.default.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            pinataContent: data,
            pinataMetadata: { name: name || `metadata-${Date.now()}` },
        }, {
            headers: {
                'pinata_api_key': env_1.env.PINATA_API_KEY,
                'pinata_secret_api_key': env_1.env.PINATA_SECRET_KEY,
            },
            timeout: 30000,
        });
        return { cid: response.data.IpfsHash };
    }
    catch (err) {
        logger_1.logger.error('IPFS JSON upload failed', { error: err.message });
        throw new errors_1.ApiError(502, 'IPFS_UPLOAD_FAILED', 'Failed to upload metadata to IPFS', {
            detail: err.message,
        });
    }
}
/**
 * Fetch content from IPFS via Pinata gateway.
 */
async function fetchFromIPFS(cid) {
    const gateway = env_1.env.PINATA_API_KEY
        ? `https://gateway.pinata.cloud/ipfs/${cid}`
        : null;
    if (!gateway) {
        throw new errors_1.ApiError(404, 'IPFS_FETCH_FAILED', 'No IPFS gateway configured');
    }
    try {
        const response = await axios_1.default.get(gateway, { timeout: 10000 });
        return response.data;
    }
    catch (err) {
        throw new errors_1.ApiError(502, 'IPFS_FETCH_FAILED', 'Failed to fetch from IPFS', {
            detail: err.message,
            cid,
        });
    }
}
