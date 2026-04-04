"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFingerprint = analyzeFingerprint;
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
/**
 * Call the Python AI service to analyze a fingerprint for anomalies.
 * Falls back to a default CLEAN result if the AI service is unavailable.
 */
async function analyzeFingerprint(fingerprint) {
    const aiUrl = env_1.env.AI_SERVICE_URL;
    if (!aiUrl || aiUrl.includes('localhost:8000')) {
        logger_1.logger.warn('AI service not configured, returning CLEAN result');
        return {
            anomaly_score: 0.0,
            anomaly_status: 'CLEAN',
            triggered_flags: [],
            details: { fallback: true, reason: 'AI service not configured' },
            model_version: '0.0.0-fallback',
            analysis_timestamp: new Date().toISOString(),
        };
    }
    try {
        const response = await axios_1.default.post(`${aiUrl}/analyze`, { fingerprint }, { timeout: 15000 });
        return response.data;
    }
    catch (err) {
        logger_1.logger.error('AI service call failed, using fallback', { error: err.message });
        return {
            anomaly_score: 0.0,
            anomaly_status: 'CLEAN',
            triggered_flags: [],
            details: { fallback: true, reason: 'AI service unavailable', error: err.message },
            model_version: '0.0.0-fallback',
            analysis_timestamp: new Date().toISOString(),
        };
    }
}
