# Ticketing Demo Platform

Demo platform for a production-like pipeline: Dockerized frontend + backend + Postgres, with CI/CD via Jenkins and static quality checks.

## Structure
- `apps/api`: Express API
- `apps/web`: React frontend (Vite + nginx)
- `infra`: Docker and local compose
- `docs`: Architecture and setup docs

## Local setup (docker)
1) Copy `.env.example` to `.env` in `apps/api` and `apps/web`.
2) Run `docker compose -f infra/docker-compose.yml up --build`.
3) API: `http://localhost:4000`
4) Web: `http://localhost:5173`

## Tests
- Unit/Integration: `npm run test` (via node:test + supertest, requires Postgres)

## Pipeline (Jenkins — static-qa-pipeline)
- Checkout → Install Dependencies → Unit/Integration Tests → SonarCloud → Architecture Rules → Docker Lint/Scan → SAST (Semgrep) → SCA (OSV-Scanner) → Repo/IaC Scan → Deploy to Render

## Architecture
- Run dependency rules: `npm run arch`

## Auth Security
- 5 failed login attempts lock the account for 10 minutes.

## Notes
- This project uses **Jenkins** as CI/CD (not GitHub Actions).
- The pipeline focuses on **static quality** (SonarCloud, Semgrep, Trivy, Hadolint, OSV-Scanner, Checkov, dependency-cruiser).
- Render deploy requires configuring `RENDER_DEPLOY_HOOK` and `RENDER_DEPLOY_HOOK_WEB` in Jenkins credentials.
