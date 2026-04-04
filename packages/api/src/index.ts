import { createApp } from './app';
import { startWorker } from './workers/attestation.worker';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 3001;

const app = createApp();
app.listen(PORT, () => {
  logger.info(`API running on port ${PORT}`);
  startWorker();
});
