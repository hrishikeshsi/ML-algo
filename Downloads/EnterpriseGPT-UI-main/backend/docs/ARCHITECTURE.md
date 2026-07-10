# Architecture

## High-level flow

```
                    ┌────────────────────┐
                    │   Frontend (SPA)   │
                    └─────────┬──────────┘
                              │ HTTPS + JWT (access token)
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                       EnterpriseGPT Backend                        │
│                                                                     │
│  Express app.ts                                                    │
│   ├─ helmet / cors / compression / rate-limit / sanitize            │
│   ├─ routes/*  ──►  middleware (auth, role, validate)  ──► controllers│
│   │                                                        │        │
│   │                                                        ▼        │
│   │                                                    services/     │
│   │        ┌───────────────┬───────────────┬─────────────┴───────┐ │
│   │        │ auth.service   │ conversation.  │ message.service     │ │
│   │        │ user.service   │ service        │ (chat orchestration)│ │
│   │        └───────┬────────┴───────┬────────┴──────────┬─────────┘ │
│   │                │                │                   │           │
│   │                ▼                ▼                   ▼           │
│   │         repositories/ (Prisma)                purpleFabric.     │
│   │                │                              service.ts        │
│   │                ▼                                   │            │
│   │            PostgreSQL                               │            │
│   └───────────────────────────────────────────────────────┘         │
└───────────────────────────────────────────────────────────┬─────────┘
                                                              │ apikey + OAuth bearer
                                                              ▼
                                          ┌───────────────────────────────┐
                                          │  Purple Fabric / Magic         │
                                          │  Platform GenAI Agent API      │
                                          └───────────────────────────────┘
```

## Layering rules

- **Controllers** only parse the request, call one service method, and shape the `ApiResponse`. No
  business logic and no direct Prisma access.
- **Services** hold business logic and orchestrate one or more repositories and/or `PurpleFabricService`.
  They throw `AppError` for anything the global error handler should turn into an HTTP error.
- **Repositories** are the only files that import the Prisma client. Each wraps exactly one model.
- **`PurpleFabricService`** is the single component allowed to read Purple Fabric environment variables
  and call the upstream agent. It caches the OAuth access token in memory (single-flight, refreshed
  shortly before expiry) so every chat message doesn't re-authenticate.

## Chat flow (`POST /chat`)

1. `authenticate` middleware verifies the JWT and attaches `req.user`.
2. `message.service.sendChatMessage`:
   - Loads the target conversation (by id) or creates a new one.
   - `conversation.service.ensureAgentConversation` calls
     `PurpleFabricService.startConversation` if the conversation has no agent-side thread yet, and
     persists the returned `conversation_id` as `conversationIdFromAgent`.
   - Persists the user's message.
   - Calls `PurpleFabricService.continueConversation` (same endpoint as `sendMessage` — the upstream API
     doesn't distinguish "first message" from "next message", only conversation *creation* is separate).
     This consumes the `addmessage/stream` SSE response and, if a `message_id` is surfaced, briefly polls
     `conversation/response/{conversationId}/{messageId}` for the authoritative persisted answer.
   - Persists the agent's message and bumps the conversation's `updatedAt`.
3. Returns `{ conversation, userMessage, agentMessage }` in the standard envelope.

## Why the Purple Fabric response parsing is defensive

The Postman collection in `apidoc.json` recorded every response body as empty (`"response": []`), so the
exact upstream JSON field names for conversation/message ids and answer text were never captured.
`purpleFabric.service.ts` therefore resolves several common key variants (`conversation_id`/`_id`/`id`,
`response`/`answer`/`message`/`content`/`text`, etc.) instead of hard-coding one schema. If you have
access to a real Purple Fabric tenant, capture one live response and tighten `resolveField`'s key lists
accordingly.
