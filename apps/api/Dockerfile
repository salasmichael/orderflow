# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /repo

# Copy only the manifests first, so Docker can cache the install layer
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace api --include-workspace-root

# Now copy the source and build
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

# Do not run as root
USER node

WORKDIR /repo/apps/api
EXPOSE 4000
CMD ["node", "dist/main.js"]