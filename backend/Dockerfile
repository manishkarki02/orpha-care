# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.18.0
ARG PNPM_VERSION=10.20.0


# ==================================================
# Base
# ==================================================
FROM node:${NODE_VERSION}-alpine AS base

ARG PNPM_VERSION

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app


# ==================================================
# All dependencies
# ==================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile


# ==================================================
# Development
# ==================================================
FROM deps AS dev

ENV NODE_ENV=development

COPY . .

EXPOSE 8000

CMD ["pnpm", "dev"]


# ==================================================
# Build
# ==================================================
FROM deps AS build

COPY . .

RUN pnpm prisma:generate
RUN pnpm build


# ==================================================
# Migration runner
# ==================================================
FROM deps AS migration

ENV NODE_ENV=production

COPY prisma ./prisma
COPY prisma.config.ts ./

CMD ["pnpm", "prisma", "migrate", "deploy"]


# ==================================================
# Production dependencies
# ==================================================
FROM base AS prod-deps

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile


# ==================================================
# Production
# ==================================================
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=prod-deps \
    --chown=node:node \
    /app/node_modules ./node_modules

COPY --from=build \
    --chown=node:node \
    /app/dist ./dist

COPY --chown=node:node package.json ./

USER node

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]

CMD ["node", "dist/index.js"]