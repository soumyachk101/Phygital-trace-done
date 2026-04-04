import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface AnomalyResult {
  anomaly_score: number;
  anomaly_status: string;
  triggered_flags: string[];
  details: Record<string, unknown>;
  model_version?: string;
  analysis_timestamp?: string;
}

/**
 * Call the Python AI service to analyze a fingerprint for anomalies.
 * Falls back to a default CLEAN result if the AI service is unavailable.
 */
export async function analyzeFingerprint(
  fingerprint: Record<string, unknown>
): Promise<AnomalyResult> {
  const aiUrl = env.AI_SERVICE_URL;

  if (!aiUrl || aiUrl.includes('localhost:8000')) {
    logger.warn('AI service not configured, returning CLEAN result');
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
    const response = await axios.post<AnomalyResult>(
      `${aiUrl}/analyze`,
      { fingerprint },
      { timeout: 15000 }
    );
    return response.data;
  } catch (err: any) {
    logger.error('AI service call failed, using fallback', { error: err.message });
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
