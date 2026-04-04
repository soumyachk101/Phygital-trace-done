import axios from 'axios';
import { env } from '../config/env';
import { ApiError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Upload a file to IPFS via Pinata API.
 * @param fileBuffer - Raw file bytes
 * @param metadata - Optional metadata (name, contentType)
 * @returns IPFS CID
 */
export async function uploadToIPFS(
  fileBuffer: Buffer,
  metadata: { name?: string; contentType?: string } = {}
): Promise<{ cid: string }> {
  if (!env.PINATA_API_KEY || !env.PINATA_SECRET_KEY) {
    logger.warn('Pinata keys not set, returning mock CID');
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

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': env.PINATA_API_KEY,
          'pinata_secret_api_key': env.PINATA_SECRET_KEY,
        },
        timeout: 30000,
      }
    );

    return { cid: response.data.IpfsHash };
  } catch (err: any) {
    logger.error('IPFS upload failed', { error: err.message });
    throw new ApiError(502, 'IPFS_UPLOAD_FAILED', 'Failed to upload to IPFS', {
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
export async function uploadJSONToIPFS(
  data: Record<string, unknown>,
  name?: string
): Promise<{ cid: string }> {
  if (!env.PINATA_API_KEY || !env.PINATA_SECRET_KEY) {
    logger.warn('Pinata keys not set, returning mock CID for JSON');
    return { cid: 'QmMockJson' + Date.now().toString(36) };
  }

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: data,
        pinataMetadata: { name: name || `metadata-${Date.now()}` },
      },
      {
        headers: {
          'pinata_api_key': env.PINATA_API_KEY,
          'pinata_secret_api_key': env.PINATA_SECRET_KEY,
        },
        timeout: 30000,
      }
    );

    return { cid: response.data.IpfsHash };
  } catch (err: any) {
    logger.error('IPFS JSON upload failed', { error: err.message });
    throw new ApiError(502, 'IPFS_UPLOAD_FAILED', 'Failed to upload metadata to IPFS', {
      detail: err.message,
    });
  }
}

/**
 * Fetch content from IPFS via Pinata gateway.
 */
export async function fetchFromIPFS(cid: string): Promise<any> {
  const gateway = env.PINATA_API_KEY
    ? `https://gateway.pinata.cloud/ipfs/${cid}`
    : null;

  if (!gateway) {
    throw new ApiError(404, 'IPFS_FETCH_FAILED', 'No IPFS gateway configured');
  }

  try {
    const response = await axios.get(gateway, { timeout: 10000 });
    return response.data;
  } catch (err: any) {
    throw new ApiError(502, 'IPFS_FETCH_FAILED', 'Failed to fetch from IPFS', {
      detail: err.message,
      cid,
    });
  }
}
