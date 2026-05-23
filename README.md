# Ticketing Demo Platform

Demo platform for a production-like pipeline: Dockerized frontend + backend + Postgres, with CI/CD, quality checks, Playwright E2E, and k6 load tests.

## Structure
- apps/api: Express API
- apps/web: React frontend (static build)
- infra: Docker and local compose
- tests/e2e: Playwright tests
- tests/perf: k6 scripts
- docs: diagrams and ADRs

## Local setup (docker)
1) Create .env files in apps/api and apps/web (see .env.example files).
2) Run `docker compose -f infra/docker-compose.yml up --build`.
3) API: http://localhost:4000
4) Web: http://localhost:5173

## Tests
- Unit/Integration: `npm run test`
- E2E: `npx playwright test`
- Load: `k6 run tests/perf/basic-flow.js`
- Load (massive): `k6 run tests/perf/million-users.js`

## Quality and Security
- Dockerfile lint: Hadolint (CI)
- Image scan: Trivy (CI)
- Hardening: Dockle (CI)
- SBOM: Syft (CI)
- Image scan: Grype (CI)
- DAST: OWASP ZAP (manual workflow)

## Architecture
- Run dependency rules: `npm run arch`

## Auth Security
- 5 failed login attempts lock the account for 10 minutes.

## Security (DAST)
- Trigger workflow `dast` with secret `DAST_TARGET` pointing to your deployed URL.

## Notes
This repo is designed for demos and a short-lived deployment.
