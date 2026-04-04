"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url().default('postgresql://postgres:postgres@localhost:5432/phygital_trace'),
    REDIS_URL: zod_1.z.string().url().default('redis://localhost:6379'),
    JWT_SECRET: zod_1.z.string().default('dev-jwt-secret-for-development-mode-at-least-32'),
    PINATA_API_KEY: zod_1.z.string().default(''),
    PINATA_SECRET_KEY: zod_1.z.string().default(''),
    BASE_RPC_URL: zod_1.z.string().url().default('https://sepolia.base.org'),
    ATTESTATION_CONTRACT_ADDRESS: zod_1.z.string().default('0x0000000000000000000000000000000000000000'),
    PRIVATE_KEY_SIGNER: zod_1.z.string().default(''),
    AI_SERVICE_URL: zod_1.z.string().url().default('http://localhost:8000'),
    PORT: zod_1.z.string().default('3001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    S3_BUCKET: zod_1.z.string().default(''),
    AWS_ACCESS_KEY_ID: zod_1.z.string().default(''),
    AWS_SECRET_ACCESS_KEY: zod_1.z.string().default(''),
});
exports.env = envSchema.parse(process.env);
