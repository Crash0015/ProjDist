# Architecture Summary

Monolith API with modular layers (controllers, services, repositories) and a separate static React frontend. Postgres handles transactional data. Dockerized services provide parity between local, CI, and production.

## C4 (Level 1)
- User -> Web -> API -> Postgres

## Architectural Rules
- No cyclic dependencies in API modules.
- Controllers call services; services call repositories.
- Frontend communicates only via API.

## Quality Gate
- If dependency cycles or cross-layer imports are detected, split modules or introduce a service boundary.
