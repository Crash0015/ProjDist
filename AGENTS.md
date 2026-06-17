# AGENTS.md — Ticketing Demo

## Proyecto
Plataforma demo de venta de boletos con Express API + React frontend + PostgreSQL. Pipeline CI/CD con Jenkins y herramientas de calidad estática.

## Stack
- **API**: Express.js, ESM, PostgreSQL (pg), JWT (jsonwebtoken), bcryptjs, Zod
- **Web**: React 18, Vite, CSS plano
- **DB**: PostgreSQL 16 (schema: users, events, orders, payments, login_attempts)
- **Infra**: Docker, docker-compose (3 servicios), Jenkins, SonarCloud

## Estructura
```
apps/api/       → Backend Express (src/app.js, src/index.js)
apps/web/       → Frontend React (src/ui/App.jsx)
infra/          → docker-compose.yml, jenkins/Dockerfile
tests/e2e/      → Playwright (no usado actualmente)
tests/perf/     → k6 (vacío)
docs/           → Documentación
render.yaml     → Config para Render (plan free)
Jenkinsfile     → Pipeline CI/CD
```

## Cómo levantar local
1. Copiar `.env.example` a `.env` en `apps/api/` y `apps/web/`
2. `docker compose -f infra/docker-compose.yml up --build`
3. API en `http://localhost:4000`, Web en `http://localhost:5173`

## Pipeline Jenkins (static-qa-pipeline)
El pipeline ejecuta solo pruebas estáticas. No usa GitHub Actions.

### Etapas
1. **Checkout** — clona el repo
2. **Install Dependencies** — npm install en API y Web via Docker node:20-alpine
3. **Unit/Integration Tests** — levanta Postgres temporal, ejecuta `npm test` (node:test + supertest)
4. **SonarCloud** — sonar-scanner (requiere credencial `SONAR_TOKEN`)
5. **Architecture Rules** — dependency-cruiser (no-circular, no-backend-to-web)
6. **Docker Lint/Scan** — Hadolint, Dockle, Syft SBOM, Grype (fail-on critical)
7. **SAST (Semgrep)** — reglas OWASP Top 10 + JavaScript
8. **SCA (OSV-Scanner)** — escaneo de dependencias
9. **Repo/IaC Scan** — Trivy fs (HIGH, CRITICAL), Checkov (render.yaml + compose)
10. **Deploy to Render** — POST a deploy hooks (requiere credenciales configuradas)

### Errores conocidos y arreglados (Jun 2026)
- ❌ Semgrep: faltaba volumen `/src` → **arreglado** (usa `-v jenkins_home` + symlink)
- ❌ OSV-Scanner: flag `--severity` no existe en latest → **arreglado**
- ❌ Checkov: `--soft-fail false` inválido → **arreglado**
- ❌ Grype: `--fail-on` encontraba Critical en base Alpine (libcrypto3, libssl3) → **arreglado** (apk upgrade + npm update)
- ⚠️ Los 3 errores anteriores eran por el mismo root cause: usar `${WORKSPACE}:/src` en Docker-outside-of-Docker no funciona porque el workspace vive en el volumen `jenkins_home`, no en el host
- ❌ Render: no deploya porque faltan `RENDER_DEPLOY_HOOK` y `RENDER_DEPLOY_HOOK_WEB` en Jenkins

### Pendiente
- [ ] Configurar servicios en Render (usar `render.yaml` como blueprint)
- [ ] Agregar `RENDER_DEPLOY_HOOK` y `RENDER_DEPLOY_HOOK_WEB` en Jenkins Credentials
- [ ] Los Dockerfiles de `apps/api/` y `apps/web/` copian `package-lock.json*` pero el lock está en la raíz — puede fallar el build local directo
