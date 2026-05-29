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

## Quality and Security
- Dockerfile lint: Hadolint (Jenkins)
- Image scan: Trivy (Jenkins)
- Hardening: Dockle (Jenkins)
- SBOM: Syft (Jenkins)
- Image scan: Grype (Jenkins)
- DAST: OWASP ZAP (Jenkins)
 - SAST: Semgrep (Jenkins)
 - SCA: OSV-Scanner (Jenkins)
 - Repo scan: Trivy fs (Jenkins)
 - IaC scan: Checkov (Jenkins)

## Architecture
- Run dependency rules: `npm run arch`

## Auth Security
- 5 failed login attempts lock the account for 10 minutes.

## Jenkins
- See `docs/jenkins-setup.md` and `docs/jenkins-tools.md`.
- Webhook enabled for auto builds.

## Notes
This repo is designed for demos and a short-lived deployment.
