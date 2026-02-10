FROM node:18-alpine AS base

# This Dockerfile is optimized for monorepo structure
FROM base AS builder
WORKDIR /app
# Install turbo
RUN npm install turbo --global

COPY . .

# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "api" is the workspace name in package.json
RUN turbo prune --scope=@flux/api --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

# Build the project
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/turbo.json ./turbo.json

# Build api
RUN npx turbo run build --filter=@flux/api...

FROM base AS runner
WORKDIR /app

# Don't run production as root
# addgroup -g 1001 -S nodejs
# adduser -S nestjs -u 1001

COPY --from=installer /app .

CMD node apps/api/dist/main.js
