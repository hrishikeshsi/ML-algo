# EnterpriseGPT Backend

Production-ready secure middleware between the EnterpriseGPT frontend and the **Purple Fabric AI Agent**
(Intellect Design Magic Platform). The backend owns every Purple Fabric credential — the frontend never
sees an API key, access token, or refresh token.

```
Frontend  --(JWT)-->  EnterpriseGPT Backend  --(apikey + OAuth bearer)-->  Purple Fabric Agent
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/DATABASE.md](docs/DATABASE.md),
[docs/API.md](docs/API.md), [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) and
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for details.

## Tech stack

Node.js · Express · TypeScript · PostgreSQL · Prisma · JWT · bcrypt · Axios · Winston · Helmet · CORS ·
express-rate-limit · Zod · Docker · Swagger/OpenAPI · Jest.

## Project structure

```
src/
  config/         env validation (Zod), Swagger spec
  controllers/    thin HTTP handlers — parse req, call a service, shape the response
  database/       Prisma client singleton + health check
  interfaces/     shared DTO/type definitions
  middleware/      auth, role, validation, rate limiting, sanitization, logging, errors
  repositories/    Prisma data access, one file per model
  routes/          Express routers + OpenAPI (swagger-jsdoc) annotations
  services/        business logic (auth, users, conversations, messages, Purple Fabric, logs, email)
  utils/           logger, ApiResponse, AppError, JWT, password hashing, sanitization, SSE parser
  types/           Express Request augmentation
  app.ts           Express app wiring (middleware pipeline, routes, error handler)
  server.ts        process entrypoint (DB connect, listen, graceful shutdown)
prisma/
  schema.prisma    database schema
  seed.ts          seeds a default organization, admin user and agent configuration
tests/
  unit/            service-level unit tests (repositories/HTTP mocked)
  integration/     supertest-driven API tests (repositories mocked, no live DB required)
```

## Getting started (local, no Docker)

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment** — copy `.env.example` to `.env` and fill in real values (see
   [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)). At minimum you need a running PostgreSQL instance and
   real Purple Fabric credentials.
   ```bash
   cp .env.example .env
   ```
3. **Run migrations and generate the Prisma client**
   ```bash
   npm run prisma:migrate
   ```
4. **(Optional) seed a default admin user**
   ```bash
   npm run prisma:seed
   ```
5. **Start the dev server** (hot reload via `tsx watch`)
   ```bash
   npm run dev
   ```
6. Open the interactive API docs at `http://localhost:4000/api/v1/docs`.

## Getting started (Docker)

See [docs/DOCKER.md](docs/DOCKER.md) for the full guide. Quick start:

```bash
cp .env.example .env
docker compose -f docker-compose.dev.yml up --build
```

## Scripts

| Script                  | Purpose                                             |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Start with hot reload (tsx watch)                    |
| `npm run build`          | Compile TypeScript to `dist/`                        |
| `npm start`               | Run the compiled production build                     |
| `npm run typecheck`      | Type-check without emitting                            |
| `npm run prisma:migrate` | Create/apply a dev migration                            |
| `npm run prisma:deploy`  | Apply migrations in production (no prompts)             |
| `npm run prisma:seed`    | Seed a default org/admin/agent configuration            |
| `npm test`                | Run the Jest test suite                                 |
| `npm run test:coverage`  | Run tests with coverage                                  |

## Security posture

- **Helmet** for secure HTTP headers, **CORS** allow-list from `CORS_ORIGIN`.
- **express-rate-limit** on all routes, with a stricter limiter on `/auth/*`.
- **Zod** validates and coerces every request body/params/query before it reaches a controller.
- Recursive input sanitization strips script tags / inline event handlers (defense-in-depth against XSS).
- Passwords hashed with **bcrypt**; refresh tokens and password-reset tokens are stored only as SHA-256
  hashes, never in plaintext.
- JWT access tokens are short-lived; refresh tokens rotate on every use and can be revoked (logout).
- Role-based authorization (`ADMIN`, `MANAGER`, `USER`) guards `/logs` and `/stats`.
- The Purple Fabric `apikey`, service-account credentials, and OAuth tokens live only in backend memory /
  environment variables — they are never persisted to the database or returned to the frontend.
- A global error handler normalizes all failures into the standard response envelope and never leaks
  stack traces in production.

## Response envelope

Every endpoint returns the same JSON shape:

```json
{
  "success": true,
  "data": {},
  "message": "",
  "errors": []
}
```

## ⚠️ Note on `apidoc.json`

The `apidoc.json` Postman collection at the repository root (used to reverse-engineer the real Purple
Fabric contract implemented in `src/services/purpleFabric.service.ts`) contains **live-looking JWTs, a
refresh token, and an `apikey` value** embedded in its recorded cURL commands. Treat that file as
containing credentials: rotate/invalidate them if the file has ever been committed to version control or
shared outside the team, and do not commit real secrets into `apidoc.json`, `.env`, or any tracked file.
