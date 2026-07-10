# API Reference

Full interactive docs (Swagger UI) are served at `${API_PREFIX}/docs` (default
`http://localhost:4000/api/v1/docs`); the raw OpenAPI JSON is at `${API_PREFIX}/docs.json`. This file is
a quick human-readable index — the Swagger UI is the source of truth for request/response schemas.

All endpoints are mounted under `API_PREFIX` (default `/api/v1`). Every response uses the envelope:

```json
{ "success": true, "data": {}, "message": "", "errors": [] }
```

## Auth (`/auth`) — unauthenticated, rate-limited

| Method | Path                     | Body                                              |
| ------- | ------------------------- | ---------------------------------------------------|
| POST    | `/auth/register`          | `name, email, password, organizationId?, organizationName?` |
| POST    | `/auth/login`              | `email, password`                                     |
| POST    | `/auth/logout`             | `refreshToken`                                        |
| POST    | `/auth/refresh`            | `refreshToken` → new, rotated token pair                 |
| POST    | `/auth/forgot-password`    | `email` → always returns success (no enumeration)          |
| POST    | `/auth/reset-password`     | `token, newPassword`                                       |

## Users (`/users`) — requires `Authorization: Bearer <accessToken>`

| Method | Path         | Notes                                   |
| ------- | ------------- | ------------------------------------------ |
| GET     | `/users/me`   | Current user's profile                        |
| PUT     | `/users/me`   | Update `name` / `email` / `password`            |
| DELETE  | `/users/me`   | Delete own account                              |

## Conversations (`/conversations`) — requires auth

| Method | Path                  | Notes                                                     |
| ------- | ---------------------- | -------------------------------------------------------------|
| GET     | `/conversations`       | List the caller's conversations                                |
| POST    | `/conversations`       | Create a conversation (also opens a Purple Fabric thread)          |
| GET     | `/conversations/:id`   | Get one conversation (must belong to the caller)                     |
| DELETE  | `/conversations/:id`   | Delete a conversation and its messages                                |

## Chat & Messages — requires auth

| Method | Path                        | Notes                                                                    |
| ------- | ---------------------------- | ------------------------------------------------------------------------------|
| POST    | `/chat`                       | `{ conversationId?, message }` → creates a conversation if omitted, calls the agent, persists + returns both messages |
| GET     | `/messages/:conversationId`   | List all messages for a conversation, oldest first                              |

## Admin

| Method | Path      | Auth                | Notes                                                    |
| ------- | ---------- | --------------------- | -------------------------------------------------------------|
| GET     | `/health`   | none (public probe)     | DB + Purple Fabric reachability, `200` or `503`                  |
| GET     | `/logs`     | `ADMIN` role required   | Paginated API audit log (`?page=&limit=`)                          |
| GET     | `/stats`    | `ADMIN` role required   | User/conversation/message counts, 24h API metrics, Purple Fabric health |

## Error responses

Validation errors and thrown `AppError`s all return the same envelope with `success: false` and a
populated `errors` array, e.g.:

```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": ["body.password: Password must contain an uppercase letter"]
}
```
