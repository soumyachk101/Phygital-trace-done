import prisma from '../config/database';
import { logger } from '../utils/logger';
import { apiQueue, startWorker, stopWorker } from '../workers/attestation.worker';

export interface AttestationJob {
  captureId: string;
  payloadHash: string;
  ipfsCid: string;
}

/**
 * Enqueue a capture for blockchain attestation.
 * Creates a DB record and adds to the in-memory job queue.
 */
export async function enqueueAttestation(
  captureId: string,
  payloadHash: string,
  ipfsCid: string
): Promise<void> {
  // Create the job record in DB
  const job = await prisma.attestationJob.create({
    data: {
      captureId,
      payloadHash,
      ipfsCid,
      status: 'QUEUED',
      attempts: 0,
    },
  });

  // Add to processing queue
  apiQueue.push({
    captureId,
    payloadHash,
    ipfsCid,
    jobId: job.id,
  });

  logger.info('Enqueued attestation', { captureId, jobId: job.id });
}

export { startWorker, stopWorker };
