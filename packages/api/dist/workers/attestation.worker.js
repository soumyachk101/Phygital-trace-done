"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiQueue = void 0;
exports.startWorker = startWorker;
exports.stopWorker = stopWorker;
const database_1 = __importDefault(require("../config/database"));
const blockchain_service_1 = require("../services/blockchain.service");
const logger_1 = require("../utils/logger");
// Simple in-memory queue with worker loop
exports.apiQueue = [];
let isRunning = false;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;
/**
 * Start the attestation worker. Processes queued items one at a time.
 */
async function startWorker() {
    if (isRunning)
        return;
    isRunning = true;
    logger_1.logger.info('Attestation worker started');
    processQueue();
}
/**
 * Stop the attestation worker.
 */
async function stopWorker() {
    isRunning = false;
    logger_1.logger.info('Attestation worker stopped');
}
async function processQueue() {
    while (isRunning) {
        if (exports.apiQueue.length === 0) {
            await sleep(1000);
            continue;
        }
        const item = exports.apiQueue.shift();
        await processItem(item);
    }
}
async function processItem(item) {
    try {
        // Update status to processing
        await database_1.default.attestationJob.update({
            where: { id: item.jobId },
            data: { status: 'PROCESSING', attempts: { increment: 1 } },
        });
        logger_1.logger.info('Processing attestation', { captureId: item.captureId, jobId: item.jobId });
        // Call blockchain attestation
        const result = await (0, blockchain_service_1.attestToBlockchain)(item.payloadHash, item.ipfsCid);
        // Update capture record
        await database_1.default.capture.update({
            where: { id: item.captureId },
            data: {
                status: 'ATTESTED',
                txHash: result.txHash,
                blockNumber: result.blockNumber,
                attestedAt: new Date(),
            },
        });
        // Update job record
        await database_1.default.attestationJob.update({
            where: { id: item.jobId },
            data: { status: 'SUCCESS', processedAt: new Date() },
        });
        logger_1.logger.info('Attestation complete', {
            captureId: item.captureId,
            txHash: result.txHash,
            blockNumber: result.blockNumber.toString(),
        });
    }
    catch (err) {
        logger_1.logger.error('Attestation failed', { captureId: item.captureId, error: err.message });
        // Check retry count
        const job = await database_1.default.attestationJob.findUnique({
            where: { id: item.jobId },
        });
        if (job && job.attempts < MAX_RETRIES) {
            // Re-queue with delay
            setTimeout(() => {
                exports.apiQueue.push(item);
                logger_1.logger.info('Re-queued failed attestation', {
                    captureId: item.captureId,
                    attempt: job.attempts + 1,
                });
            }, BASE_DELAY_MS * (2 ** (job.attempts - 1)));
        }
        else {
            // Mark as permanently failed
            await database_1.default.attestationJob.update({
                where: { id: item.jobId },
                data: { status: 'FAILED', lastError: err.message },
            });
            await database_1.default.capture.update({
                where: { id: item.captureId },
                data: { status: 'FAILED' },
            });
        }
    }
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
