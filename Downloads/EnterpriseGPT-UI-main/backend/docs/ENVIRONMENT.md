# Environment Variables

Copy [`.env.example`](../.env.example) to `.env` and fill in real values. `.env` is git-ignored — never
commit it.

## Server

| Variable    | Default            | Description                                   |
| ------------ | -------------------- | ------------------------------------------------ |
| `NODE_ENV`   | `development`        | `development` \| `test` \| `production`               |
| `PORT`       | `4000`               | HTTP port                                          |
| `API_PREFIX` | `/api/v1`             | Mount path for all API routes                       |
| `LOG_LEVEL`  | `info`                | Winston log level                                    |
| `CORS_ORIGIN`| `http://localhost:5173` | Comma-separated list of allowed frontend origins    |

## Database

| Variable        | Description                                    |
| ---------------- | -------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string used by Prisma           |

## JWT / Auth

| Variable                  | Default | Description                                    |
| --------------------------- | ------- | -------------------------------------------------- |
| `JWT_SECRET`                 | —       | ≥32 chars. Signs access tokens.                       |
| `JWT_EXPIRES_IN`             | `15m`   | Access token lifetime                                  |
| `JWT_REFRESH_SECRET`         | —       | ≥32 chars, must differ from `JWT_SECRET`.               |
| `JWT_REFRESH_EXPIRES_IN`     | `7d`    | Refresh token lifetime                                   |
| `BCRYPT_SALT_ROUNDS`         | `12`    | bcrypt cost factor                                        |
| `PASSWORD_RESET_TOKEN_TTL_MINUTES` | `30` | How long a reset link stays valid                        |
| `PASSWORD_RESET_URL`         | —       | Frontend URL the reset email links to (`?token=` appended) |

## Rate limiting

| Variable                     | Default   | Description                        |
| ------------------------------ | --------- | -------------------------------------- |
| `RATE_LIMIT_WINDOW_MS`          | `900000`  | General limiter window (15 min)          |
| `RATE_LIMIT_MAX`                | `300`     | Max requests per window per IP             |
| `AUTH_RATE_LIMIT_WINDOW_MS`     | `900000`  | Stricter limiter window for `/auth/*`        |
| `AUTH_RATE_LIMIT_MAX`           | `20`      | Max auth attempts per window per IP            |

## SMTP (password reset emails)

| Variable          | Default                          | Description                                             |
| ------------------- | ----------------------------------- | ------------------------------------------------------------ |
| `SMTP_HOST/PORT`     | `smtp.mailtrap.io` / `587`             |                                                                |
| `SMTP_SECURE`        | `false`                              | Use TLS                                                        |
| `SMTP_USER/PASSWORD` | empty                                | If empty, emails are logged instead of sent (dev-friendly)      |
| `SMTP_FROM_NAME/EMAIL` | `EnterpriseGPT` / `no-reply@...`     | From header                                                     |

## Purple Fabric AI Agent

These map directly to the real request shapes captured in `apidoc.json`. **Only the backend reads
these — never expose them to the frontend.**

| Variable                                | Description                                                              |
| ------------------------------------------ | ----------------------------------------------------------------------------|
| `PURPLE_FABRIC_ENDPOINT`                    | Base domain, e.g. `https://api.intellectseecapps.com`                          |
| `PURPLE_FABRIC_TENANT`                      | Path segment for `GET /accesstoken/{tenant}`                                    |
| `PURPLE_FABRIC_API_KEY`                     | Sent as the `apikey` header on every request                                       |
| `PURPLE_FABRIC_USERNAME` / `PURPLE_FABRIC_PASSWORD` | Service-account credentials used to obtain the OAuth access/refresh token |
| `PURPLE_FABRIC_WORKSPACE_ID`                | Sent as `x-platform-workspaceid`                                                   |
| `PURPLE_FABRIC_ASSET_VERSION_ID`            | Sent as `asset_version_id` when creating a conversation                              |
| `PURPLE_FABRIC_AGENT_NAME`                  | Display name only (stored in `agent_configurations`, shown in `/stats`)              |
| `PURPLE_FABRIC_API_VERSION`                 | URL path segment, e.g. `v1` → `/magicplatform/v1/genai/...`                          |
| `PURPLE_FABRIC_APP`                         | `app` header value used by the (not currently exposed) file-upload endpoint            |
| `PURPLE_FABRIC_TOKEN_REFRESH_BUFFER_MS`     | Safety margin subtracted from the token's expiry before it's proactively refreshed     |
| `PURPLE_FABRIC_TIMEOUT_MS`                  | Axios request timeout                                                                |
| `PURPLE_FABRIC_POLL_INTERVAL_MS` / `PURPLE_FABRIC_POLL_MAX_ATTEMPTS` | Polling cadence while waiting for the persisted agent response |

> **Security note:** `apidoc.json` at the repository root contains real-looking bearer/refresh JWTs and
> an `apikey` value embedded in its recorded cURL commands. If that file has ever been shared or
> committed, rotate those credentials — do not reuse them as your actual `PURPLE_FABRIC_*` values.
