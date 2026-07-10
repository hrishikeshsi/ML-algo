# Database Schema

PostgreSQL, managed by Prisma. Full source of truth: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity relationship overview

```
Organization 1───* User 1───* Conversation 1───* Message
      │                │
      │                ├───* RefreshToken
      │                ├───* PasswordResetToken
      │                └───* ApiLog (nullable FK, ON DELETE SET NULL)
      │
      └───* AgentConfiguration
```

## Tables

### organizations
| Column             | Type      | Notes            |
| ------------------- | --------- | ------------------ |
| id                  | uuid PK   |                     |
| organization_name   | text      |                     |
| created_at          | timestamp |                     |
| updated_at          | timestamp |                     |

### users
| Column          | Type      | Notes                                             |
| ---------------- | --------- | ---------------------------------------------------- |
| id               | uuid PK   |                                                       |
| name             | text      |                                                       |
| email            | text      | unique index                                          |
| password_hash    | text      | bcrypt hash, never the plaintext password             |
| role             | enum      | `ADMIN` \| `MANAGER` \| `USER`                          |
| organization_id  | uuid FK   | → organizations.id, indexed, `ON DELETE CASCADE`         |
| is_active        | boolean   | soft "disabled" flag, checked on login/refresh            |
| created_at       | timestamp |                                                       |
| updated_at       | timestamp |                                                       |

### refresh_tokens
| Column      | Type      | Notes                                                  |
| ------------ | --------- | ---------------------------------------------------------- |
| id           | uuid PK   | also embedded as `tokenId` inside the signed refresh JWT      |
| user_id      | uuid FK   | → users.id, indexed, `ON DELETE CASCADE`                       |
| token_hash   | text      | unique, SHA-256 hash of the issued JWT — never the raw token   |
| expires_at   | timestamp |                                                             |
| revoked_at   | timestamp | null until logout / rotation / password reset                  |
| created_at   | timestamp |                                                             |

### password_reset_tokens
| Column      | Type      | Notes                                                    |
| ------------ | --------- | -------------------------------------------------------------|
| id           | uuid PK   |                                                                |
| user_id      | uuid FK   | → users.id, indexed, `ON DELETE CASCADE`                          |
| token_hash   | text      | unique, SHA-256 hash of the raw token emailed to the user         |
| expires_at   | timestamp | `PASSWORD_RESET_TOKEN_TTL_MINUTES` from creation                  |
| used_at      | timestamp | null until consumed                                                |
| created_at   | timestamp |                                                                |

### conversations
| Column                     | Type      | Notes                                             |
| --------------------------- | --------- | ---------------------------------------------------- |
| id                          | uuid PK   |                                                       |
| user_id                     | uuid FK   | → users.id, indexed, `ON DELETE CASCADE`                |
| conversation_id_from_agent  | text      | nullable, unique — the thread id returned by Purple Fabric |
| title                       | text      | defaults to `"New Conversation"`                        |
| created_at                  | timestamp |                                                       |
| updated_at                  | timestamp | bumped whenever a message is added                       |

### messages
| Column                 | Type      | Notes                                        |
| ------------------------ | --------- | ------------------------------------------------ |
| id                      | uuid PK   |                                                    |
| conversation_id         | uuid FK   | → conversations.id, indexed, `ON DELETE CASCADE`      |
| sender                  | enum      | `USER` \| `AGENT` \| `SYSTEM`                        |
| message                 | text      |                                                    |
| message_id_from_agent   | text      | nullable — the message id returned by Purple Fabric    |
| timestamp               | timestamp | indexed, defaults to now()                             |

### api_logs
| Column           | Type      | Notes                                                  |
| ------------------ | --------- | ----------------------------------------------------------|
| id                 | uuid PK   |                                                              |
| endpoint           | text      | `req.originalUrl`, indexed                                    |
| method             | text      | HTTP method                                                    |
| request            | jsonb     | sanitized request body (passwords/tokens redacted)              |
| response           | jsonb     | reserved for future use                                          |
| status_code        | int       |                                                              |
| execution_time     | int       | milliseconds                                                    |
| user_id            | uuid FK?  | → users.id, nullable, `ON DELETE SET NULL`                        |
| created_at         | timestamp | indexed                                                          |

### agent_configurations
| Column            | Type      | Notes                                                          |
| ------------------- | --------- | ------------------------------------------------------------------|
| id                  | uuid PK   |                                                                    |
| agent_name          | text      | display name only                                                  |
| agent_endpoint      | text      | Purple Fabric base URL (metadata, **not** used for the live call — the live call always reads `PURPLE_FABRIC_ENDPOINT` from env) |
| api_version         | text      |                                                                    |
| workspace_id        | text      |                                                                    |
| asset_version_id    | text      |                                                                    |
| organization_id     | uuid FK   | → organizations.id, indexed, `ON DELETE CASCADE`                        |
| is_active           | boolean   |                                                                    |
| created_at          | timestamp |                                                                    |
| updated_at          | timestamp |                                                                    |

**The Purple Fabric API key is never stored in this table or anywhere in the database.** It only ever
exists as the `PURPLE_FABRIC_API_KEY` process environment variable read by `purpleFabric.service.ts`.
