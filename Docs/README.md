# Documentation Index

This folder contains product, technical, and workflow docs for Phygital-Trace.

## Recommended reading order

1. `PRD.md` — product goals, users, scope
2. `TRD.md` — technical requirements and architecture direction
3. `API_SPEC.md` — API contract and endpoint behavior
4. `DATABASE.md` — data model and storage design
5. `BLOCKCHAIN.md` — smart contract and chain workflow
6. `BACKEND_STRUCTURE.md` — backend folder/service design
7. `MOBILE_APP.md` — mobile app design notes
8. `UI_UX.md` — user experience guidelines
9. `AI_INSTRUCTIONS.md` / `CLAUDE.md` — assistant and workflow notes

## Important note about accuracy

Some docs describe planned architecture that is broader than the currently committed code.

Use these as the source of truth for what is implemented right now:

- `/README.md` (root)
- `/packages/api/src/**`
- `/packages/contracts/**`
- `/packages/ai-service/**`
- `/packages/shared/**`

## Contributing to documentation

- Keep docs aligned with actual code and scripts.
- Prefer updating existing files rather than duplicating content.
- When behavior changes in code, update the closest relevant doc in this folder and root `README.md`.
