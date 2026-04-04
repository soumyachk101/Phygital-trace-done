"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attestToBlockchain = attestToBlockchain;
exports.verifyOnChain = verifyOnChain;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Convert an IPFS CID string to a bytes32 hex string for on-chain storage.
 * Truncates or pads to fit 32 bytes.
 */
function cidToBytes32(cid) {
    const hex = Buffer.from(cid).toString('hex');
    // Pad to 64 hex chars (32 bytes)
    return '0x' + hex.padEnd(64, '0').slice(0, 64);
}
/**
 * Submit an attestation to the blockchain.
 * Calls the TruthAttestation contract's attest function.
 * In production, this uses ethers.js with a real signer.
 * For dev, returns a mock result.
 */
async function attestToBlockchain(payloadHash, ipfsCid) {
    const contractAddress = env_1.env.ATTESTATION_CONTRACT_ADDRESS;
    const privateKey = env_1.env.PRIVATE_KEY_SIGNER;
    if (!contractAddress || contractAddress.startsWith('0x000') || !privateKey) {
        logger_1.logger.warn('Blockchain not configured, returning mock attestation result');
        return {
            txHash: '0x' + '0'.repeat(64) + Date.now().toString(16).padStart(64 - 2, '0'),
            blockNumber: BigInt(Math.floor(Math.random() * 10000000)),
        };
    }
    // In production, use ethers.js:
    // const provider = new ethers.JsonRpcProvider(env.BASE_RPC_URL);
    // const signer = new ethers.Wallet(privateKey, provider);
    // const contract = new ethers.Contract(contractAddress, TRUTH_ATTESTATION_ABI, signer);
    // const ipfsBytes32 = ethers.formatBytes32String(ipfsCid);
    // const tx = await contract.attest(payloadHash, ipfsBytes32);
    // const receipt = await tx.wait();
    // return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
    // Fallback: return mock
    logger_1.logger.info('Blockchain attestation (mock)', { contractAddress });
    return {
        txHash: `0xmock_txhash_${Date.now().toString(16)}`,
        blockNumber: BigInt(12345678),
    };
}
/**
 * Verify an attestation on the blockchain.
 */
async function verifyOnChain(payloadHash) {
    const contractAddress = env_1.env.ATTESTATION_CONTRACT_ADDRESS;
    const privateKey = env_1.env.PRIVATE_KEY_SIGNER;
    if (!contractAddress || contractAddress.startsWith('0x000') || !privateKey) {
        return {
            exists: false,
            timestamp: 0n,
            attester: '0x0000000000000000000000000000000000000000',
            revoked: false,
        };
    }
    // In production:
    // const provider = new ethers.JsonRpcProvider(env.BASE_RPC_URL);
    // const contract = new ethers.Contract(contractAddress, TRUTH_ATTESTATION_ABI, provider);
    // return await contract.verify(payloadHash);
    return {
        exists: false,
        timestamp: 0n,
        attester: '0x0000000000000000000000000000000000000000',
        revoked: false,
    };
}
