# Phygital-Trace

**Bridging physical reality with digital truth through AI-powered verification and blockchain attestation.**

## Problem

Digital media — photos, videos, sensor readings — can be fabricated, deepfaked, or sensor-spoofed in seconds. There is currently no widely-adopted, lightweight mechanism to **prove "this came from the real physical world at this time."** Industries affected: journalism, insurance claims, supply chain, legal evidence, and IoT monitoring.

## Solution

Phygital-Trace is a full-stack system that **captures** data from the physical world, **verifies** its authenticity using AI-driven anomaly detection, and **attests** to its provenance on-chain via a Solidity smart contract — creating an immutable, tamper-proof chain of custody.

---

## Architecture

```
┌─────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   Mobile App    │ ─────► │   Express API    │ ─────► │  AI Anomaly       │
│ (React Native)  │  POST  │  (Node.js/Type   │  POST  │  Detector         │
│                 │        │     Script)      │        │  (Python/FastAPI) │
│  - Camera capture       └────────┬─────────┘        └──────────────────┘
│  - Sensor fingerprint            │
│  - Verification scan             ├─────────────┐
└─────────────────┘               │             │
                            ┌─────▼──────┐ ┌────▼────────────┐
                            │ PostgreSQL │ │  Blockchain     │
                            │ (Neon)     │ │  (Ethereum/     │
                            │            │ │   Hardhat dev)  │
                            └────────────┘ │  - TruthAttest  │
                                           │    ation.sol    │
                                           │  - IPFS storage │
                                           └─────────────────┘
```

## Data Flow

1. **Capture** — The React Native mobile app captures media along with a hardware sensor fingerprint (compass, GPS, accelerometer, magnetometer, device motion).
2. **Fingerprinting** — A cryptographic hash of the sensor fingerprint + image is computed client-side.
3. **AI Analysis** — The Express API forwards the fingerprint data to the Python AI service, which runs anomaly detection to check for spoofing or manipulation.
4. **Attestation** — If the data passes AI verification, a smart contract call `attest(payloadHash, ipfsCid)` records the attestation on-chain.
5. **Verification** — Anyone can verify provenance later by calling `verify(payloadHash)` on the smart contract.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Mobile** | React Native (Expo), TypeScript, React Navigation | Camera + sensor capture, verification UI |
| **API** | Express.js, TypeScript, Zod, JWT | REST API, auth, routing, orchestration |
| **Database** | PostgreSQL (Neon), Prisma ORM | User, capture, and attestation records |
| **AI Service** | Python, FastAPI, scikit-learn, SciPy | Anomaly detection on sensor fingerprints |
| **Blockchain** | Solidity 0.8.24, OpenZeppelin, Hardhat | On-chain truth attestation & verification |
| **Shared** | TypeScript, pnpm workspace | Common types across services |

---

## Project Structure

```
phygital-trace/
  apps/
    mobile/               # React Native mobile app
  packages/
    api/                  # Express.js API server
    ai-service/           # Python FastAPI anomaly detector
    contracts/            # Solidity smart contracts
    shared/               # Shared TypeScript types
  testsprite_tests/       # Automated testing
```

---

## Key Features

- **Multi-sensor fingerprinting**: GPS, magnetometer, accelerometer, gyroscope, device motion
- **AI-powered anomaly detection**: Statistical analysis on sensor data to detect spoofing
- **Blockchain attestation**: Immutable proof of capture via Ethereum smart contract
- **IPFS storage**: Decentralized storage of capture metadata
- **Real-time verification**: Verify any capture's provenance in one API call
- **Batch attestation**: Bulk verification support via `attestBatch()`
- **Revocation**: Contract owner can revoke compromised attestations
- **Pausable contract**: Emergency pause mechanism via OpenZeppelin

---

## Smart Contract: TruthAttestation

| Function | Description |
|----------|------------|
| `attest(payloadHash, ipfsCid)` | Records a new attestation on-chain |
| `attestBatch(payloadHashes, ipfsCidBatch)` | Bulk attestation for multiple captures |
| `verify(payloadHash)` | Returns existence, timestamp, attester, and revocation status |
| `revoke(payloadHash)` | Revokes an attestation (owner only) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.11+ (for AI service)

### Install Dependencies

```bash
pnpm install
```

### Environment Setup

Copy `.env.example` to `.env` in each package and fill in values:

```bash
# packages/api/.env
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
AI_SERVICE_URL=http://localhost:8000/
```

### Database

```bash
cd packages/api
pnpm db:migrate
pnpm db:generate
```

### Start Development

```bash
# Start all services
pnpm dev

# Start mobile app only
pnpm start
```

---

## Team

Built for hackathon — bridging physical and digital worlds.
