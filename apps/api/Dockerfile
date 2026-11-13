# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace api --include-workspace-root

COPY apps/api apps/api
RUN npm run build --workspace api

# ---------- Stage 2: run ----------
FROM node:20-alpine AS run
ENV NODE_ENV=production
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace api --include-workspace-root --omit=dev \
 && npm cache clean --force

COPY --from=build /repo/apps/api/dist apps/api/dist
COPY apps/api/migrations apps/api/migrations

USER node

WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["sh", "-c", "npx node-pg-migrate up -m migrations && node dist/main.js"]