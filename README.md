# Phygital-Trace

Phygital-Trace verifies media provenance by combining sensor-fingerprint analysis, IPFS metadata storage, and blockchain attestation.

## Current Repository Scope

This repository currently contains:

- `packages/api` — Express + TypeScript API
- `packages/ai-service` — FastAPI anomaly detector (Python)
- `packages/contracts` — Solidity smart contracts (Hardhat)
- `packages/shared` — shared TypeScript package
- `Docs` — product and technical documentation

> Note: A mobile app is described in `Docs/`, but no `apps/mobile` source exists in this repository right now.

## Architecture

```text
Client/App -> API (Express) -> AI Service (FastAPI)
                 |                 |
                 v                 |
             PostgreSQL            |
                 |                 |
                 +-------> IPFS ---+
                 |
                 +-------> TruthAttestation (Solidity)
```

## Repository Structure

```text
Phygital-trace-done/
├── Docs/
├── packages/
│   ├── ai-service/
│   ├── api/
│   ├── contracts/
│   └── shared/
├── testsprite_tests/
├── package.json
└── pnpm-workspace.yaml
```

## Prerequisites

- Node.js `>=20`
- pnpm `>=8`
- Python `>=3.11`
- PostgreSQL
- Redis

## Local Setup

From repository root:

```bash
corepack enable
corepack prepare pnpm@8 --activate
pnpm install
```

### API environment (`packages/api/.env`)

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/phygital_trace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-here
PINATA_API_KEY=
PINATA_SECRET_KEY=
BASE_RPC_URL=https://sepolia.base.org
ATTESTATION_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY_SIGNER=
AI_SERVICE_URL=http://localhost:8000
PORT=3001
NODE_ENV=development
S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

> Use a strong `JWT_SECRET` in real environments (at least 32 characters) and never commit real secrets.
> Example generator: `openssl rand -base64 32`
> Replace `ATTESTATION_CONTRACT_ADDRESS` with your deployed contract address (see `packages/contracts/scripts/deploy.ts`); the zero address will fail.

### Database (API)

```bash
cd packages/api
pnpm db:migrate
pnpm db:generate
```

### AI service

```bash
cd packages/ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

### Start services

From repository root:

```bash
pnpm dev
```

This starts workspace `dev` scripts (currently `packages/api` and `packages/shared`).

## Main Commands

From repository root:

- `pnpm dev` — run workspace development scripts
- `pnpm build` — run workspace build scripts
- `pnpm test` — run workspace test scripts
- `pnpm lint` — runs only if packages define a `lint` script

## API Quick Reference

Base path: `/api/v1`

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (requires auth)
- `POST /captures` (requires auth)
- `GET /captures` (requires auth)
- `GET /captures/:id` (requires auth)
- `GET /verify/:shortCode` (public)
- `GET /health` (public)
- `GET /health/deep` (public)

Auth:

- `X-Device-Id: <deviceId>` header, or
- `Authorization: Bearer <deviceId>`

## Smart Contract

`packages/contracts/contracts/TruthAttestation.sol` exposes:

- `attest(bytes32 payloadHash, bytes32 ipfsCidBytes32)`
- `attestBatch(bytes32[] payloadHashes, bytes32[] ipfsCidBatch)`
- `verify(bytes32 payloadHash)`
- `revoke(bytes32 payloadHash)`
- `pause()` / `unpause()`

## Additional Documentation

See `/Docs/README.md` for a documentation index and file-by-file guide.
