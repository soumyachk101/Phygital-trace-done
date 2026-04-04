"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const attestation_worker_1 = require("./workers/attestation.worker");
const logger_1 = require("./utils/logger");
const PORT = process.env.PORT || 3001;
const app = (0, app_1.createApp)();
app.listen(PORT, () => {
    logger_1.logger.info(`API running on port ${PORT}`);
    (0, attestation_worker_1.startWorker)();
});
