# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.18.0
ARG PNPM_VERSION=10.20.0

# ---------------------------------
# BASE
# ---------------------------------
FROM node:${NODE_VERSION}-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable \
    && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# ---------------------------------
# Dependencies installation for development and building
# ---------------------------------
FROM base as deps

COPY package.json pnpm-lock.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---------------------------------
# Development includes source and dev dependencies
# ---------------------------------
FROM deps as dev

ENV NODE_ENV=development

COPY . .

EXPOSE 3000

CMD [ "pnpm", "dev" ]


# ---------------------------------
# Build : Compiles the application
# ---------------------------------
FROM deps as build

COPY . .

RUN pnpm prisma:generate
RUN pnpm build

# --------------------------------------------------
# Production dependencies
# Installs only runtime dependencies
# --------------------------------------------------
FROM base AS prod-deps

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --prod --frozen-lockfile

# --------------------------------------------------
# Production runtime
# Contains only compiled code and runtime dependencies
# --------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

RUN apk add --no-cache dumb-init

COPY --from=prod-deps \
    --chown=node:node /app/node_modules ./node_modules

COPY --from=build \
    --chown=node:node /app/dist ./dist

COPY --chown=node:node package.json ./

USER node

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]