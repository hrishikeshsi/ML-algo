# Docker Guide

## Files

| File                     | Purpose                                                                |
| ------------------------- | --------------------------------------------------------------------------|
| `Dockerfile`               | Multi-stage **production** build → small runtime image, runs as non-root    |
| `Dockerfile.dev`           | **Development** image — installs all deps, runs `npm run dev` (tsx watch)      |
| `docker-compose.yml`       | Production-like stack: Postgres + backend, runs `prisma migrate deploy` on boot |
| `docker-compose.dev.yml`   | Development stack: Postgres + backend with a bind-mounted source for hot reload  |

## Development

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

- The backend container mounts the repo at `/app` and runs `npm run dev`, so edits to `src/` reload
  automatically.
- Postgres data persists in the `postgres_dev_data` named volume.
- Once healthy, the API is at `http://localhost:4000/api/v1`, docs at `http://localhost:4000/api/v1/docs`.

## Production

```bash
cp .env.example .env   # fill in real secrets before building
docker compose up --build -d
```

- `Dockerfile` builds TypeScript in a `build` stage, then copies only `dist/`, `prisma/`, and
  production `node_modules` into the final `runtime` stage — no dev dependencies or source maps ship.
- The container runs as a dedicated non-root `appuser`.
- The `backend` service runs `npx prisma migrate deploy` before starting the server, applying any
  pending migrations non-interactively.
- Override `DATABASE_URL`, JWT secrets, and every `PURPLE_FABRIC_*` variable via `.env` or your
  orchestrator's secret manager — never bake real secrets into the image.

## Building the image standalone

```bash
docker build -t enterprisegpt-backend:latest .
docker run --rm -p 4000:4000 --env-file .env enterprisegpt-backend:latest
```
