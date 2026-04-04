import prisma from '../config/database';
import { attestToBlockchain } from '../services/blockchain.service';
import { logger } from '../utils/logger';

interface QueueItem {
  captureId: string;
  payloadHash: string;
  ipfsCid: string;
  jobId: string;
}

// Simple in-memory queue with worker loop
export const apiQueue: QueueItem[] = [];
let isRunning = false;

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000;

/**
 * Start the attestation worker. Processes queued items one at a time.
 */
export async function startWorker() {
  if (isRunning) return;
  isRunning = true;
  logger.info('Attestation worker started');
  processQueue();
}

/**
 * Stop the attestation worker.
 */
export async function stopWorker() {
  isRunning = false;
  logger.info('Attestation worker stopped');
}

async function processQueue() {
  while (isRunning) {
    if (apiQueue.length === 0) {
      await sleep(1000);
      continue;
    }

    const item = apiQueue.shift()!;
    await processItem(item);
  }
}

async function processItem(item: QueueItem) {
  try {
    // Update status to processing
    await prisma.attestationJob.update({
      where: { id: item.jobId },
      data: { status: 'PROCESSING', attempts: { increment: 1 } },
    });

    logger.info('Processing attestation', { captureId: item.captureId, jobId: item.jobId });

    // Call blockchain attestation
    const result = await attestToBlockchain(item.payloadHash, item.ipfsCid);

    // Update capture record
    await prisma.capture.update({
      where: { id: item.captureId },
      data: {
        status: 'ATTESTED',
        txHash: result.txHash,
        blockNumber: result.blockNumber,
        attestedAt: new Date(),
      },
    });

    // Update job record
    await prisma.attestationJob.update({
      where: { id: item.jobId },
      data: { status: 'SUCCESS', processedAt: new Date() },
    });

    logger.info('Attestation complete', {
      captureId: item.captureId,
      txHash: result.txHash,
      blockNumber: result.blockNumber.toString(),
    });
  } catch (err: any) {
    logger.error('Attestation failed', { captureId: item.captureId, error: err.message });

    // Check retry count
    const job = await prisma.attestationJob.findUnique({
      where: { id: item.jobId },
    });

    if (job && job.attempts < MAX_RETRIES) {
      // Re-queue with delay
      setTimeout(() => {
        apiQueue.push(item);
        logger.info('Re-queued failed attestation', {
          captureId: item.captureId,
          attempt: job.attempts + 1,
        });
      }, BASE_DELAY_MS * (2 ** (job.attempts - 1)));
    } else {
      // Mark as permanently failed
      await prisma.attestationJob.update({
        where: { id: item.jobId },
        data: { status: 'FAILED', lastError: err.message },
      });

      await prisma.capture.update({
        where: { id: item.captureId },
        data: { status: 'FAILED' },
      });
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
