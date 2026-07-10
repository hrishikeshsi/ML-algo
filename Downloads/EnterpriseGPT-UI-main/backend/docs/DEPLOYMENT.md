# Deployment Guide

## Prerequisites

- A managed PostgreSQL instance (or self-hosted) reachable from the deployment environment.
- Real Purple Fabric credentials for the target tenant (see [ENVIRONMENT.md](ENVIRONMENT.md)).
- A secrets manager (Vault, AWS Secrets Manager, Kubernetes Secrets, etc.) — never store `.env` in the
  image or in source control.

## Release steps

1. **Build** the production image: `docker build -t <registry>/enterprisegpt-backend:<tag> .`
2. **Push**: `docker push <registry>/enterprisegpt-backend:<tag>`
3. **Migrate**: run `npx prisma migrate deploy` against the target database (the provided
   `docker-compose.yml` does this automatically as part of the backend container's startup command; in
   Kubernetes, run it as an init container or a pre-deploy Job instead).
4. **Deploy** the image with the environment variables from [ENVIRONMENT.md](ENVIRONMENT.md) injected as
   secrets/config, not baked into the image.
5. **Health check**: point your load balancer / orchestrator liveness & readiness probes at
   `GET /api/v1/health` (unauthenticated, checks Postgres + Purple Fabric reachability).

## Operational recommendations

- **Horizontal scaling**: the app is stateless (JWTs + Postgres), so it scales horizontally behind a
  load balancer. The in-memory Purple Fabric access-token cache is per-instance, which is fine — each
  instance simply fetches its own token on first use.
- **Logging**: Winston writes structured JSON to `logs/error.log`, `logs/combined.log`, and
  `logs/access.log`, plus colorized console output. In containerized environments, ship stdout/stderr to
  your log aggregator (the console transport is always on) rather than relying on the file transports.
- **Database backups**: back up PostgreSQL on your platform's standard schedule; `refresh_tokens` and
  `password_reset_tokens` are safe to include (only hashes are stored).
- **Secret rotation**: rotating `JWT_SECRET`/`JWT_REFRESH_SECRET` invalidates all existing sessions —
  plan for a coordinated rollout. Rotating `PURPLE_FABRIC_*` credentials only requires restarting the
  backend (the token cache is in-memory and rebuilt on demand).
- **Rate limits**: tune `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` for your expected traffic and number of
  instances (the default in-memory store is per-instance; put a shared store like Redis behind
  `express-rate-limit` if you need a cluster-wide limit).

## Zero-downtime migrations

Prefer additive, backwards-compatible migrations (new nullable columns, new tables) so the previous
container version keeps working while the new one rolls out. Avoid destructive migrations (dropping /
renaming columns still read by the running version) in the same deploy as the code that depends on them.
