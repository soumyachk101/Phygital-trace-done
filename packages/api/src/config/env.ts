import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/phygital_trace'),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('dev-jwt-secret-for-development-mode-at-least-32'),
  PINATA_API_KEY: z.string().default(''),
  PINATA_SECRET_KEY: z.string().default(''),
  BASE_RPC_URL: z.string().url().default('https://sepolia.base.org'),
  ATTESTATION_CONTRACT_ADDRESS: z.string().default('0x0000000000000000000000000000000000000000'),
  PRIVATE_KEY_SIGNER: z.string().default(''),
  AI_SERVICE_URL: z.string().url().default('http://localhost:8000'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  S3_BUCKET: z.string().default(''),
  AWS_ACCESS_KEY_ID: z.string().default(''),
  AWS_SECRET_ACCESS_KEY: z.string().default(''),
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === 'production') {
  const critical = ['DATABASE_URL', 'JWT_SECRET'] as const;
  for (const key of critical) {
    if (!env[key]) {
      throw new Error(`Critical environment variable missing: ${key}`);
    }
  }
}
