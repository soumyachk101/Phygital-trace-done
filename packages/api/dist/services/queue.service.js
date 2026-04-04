"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopWorker = exports.startWorker = void 0;
exports.enqueueAttestation = enqueueAttestation;
const database_1 = __importDefault(require("../config/database"));
const logger_1 = require("../utils/logger");
const attestation_worker_1 = require("../workers/attestation.worker");
Object.defineProperty(exports, "startWorker", { enumerable: true, get: function () { return attestation_worker_1.startWorker; } });
Object.defineProperty(exports, "stopWorker", { enumerable: true, get: function () { return attestation_worker_1.stopWorker; } });
/**
 * Enqueue a capture for blockchain attestation.
 * Creates a DB record and adds to the in-memory job queue.
 */
async function enqueueAttestation(captureId, payloadHash, ipfsCid) {
    // Create the job record in DB
    const job = await database_1.default.attestationJob.create({
        data: {
            captureId,
            payloadHash,
            ipfsCid,
            status: 'QUEUED',
            attempts: 0,
        },
    });
    // Add to processing queue
    attestation_worker_1.apiQueue.push({
        captureId,
        payloadHash,
        ipfsCid,
        jobId: job.id,
    });
    logger_1.logger.info('Enqueued attestation', { captureId, jobId: job.id });
}
