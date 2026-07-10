# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- Install all dependencies (needed to compile TypeScript) ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Compile TypeScript -> dist/ ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Install production-only dependencies ----
FROM base AS prod-deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ---- Final runtime image ----
FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package.json ./
RUN npx prisma generate

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 4000

CMD ["node", "dist/server.js"]
