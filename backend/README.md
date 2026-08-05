# OrphaCare API

REST API for OrphaCare, built with Express 5, TypeScript, Prisma 7 and PostgreSQL, with
Redis for token and user caching.

## Prerequisites

- Node.js 22+
- pnpm 10+
- PostgreSQL 14+
- Redis 6+
- SMTP credentials — email verification and password reset will not work without them

## Setup

```bash
cd backend
pnpm install
cp .env.sample .env       # fill in the values, see below
pnpm prisma:generate      # generate the Prisma client into src/generated/prisma
pnpm prisma:migrate       # apply migrations
pnpm dev                  # http://localhost:8000
```

Configuration is validated by Zod at startup ([src/config/env.config.ts](src/config/env.config.ts)).
If a variable is missing or malformed the process exits immediately with the reason rather
than failing later at runtime.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | no | `3000` | Port the API listens on |
| `API_URL` | **yes** | — | Public base URL of this API; used to build upload URLs |
| `DATABASE_URL` | **yes** | — | PostgreSQL connection string |
| `FRONTEND_URL` | no | `http://localhost:5173` | Used in verification and password-reset links |
| `SWAGGER_HOST` | no | `localhost:3000` | Host the Swagger UI issues requests against |
| `CORS_ORIGIN` | **yes** | — | Comma-separated list of allowed origins |
| `ACCESS_TOKEN_SECRET` | **yes** | — | JWT signing secret, minimum 10 characters |
| `ACCESS_TOKEN_EXPIRY` | no | `1800` | Access-token lifetime in seconds |
| `REFRESH_TOKEN_SECRET` | **yes** | — | Refresh-token signing secret, minimum 10 characters |
| `REFRESH_TOKEN_EXPIRY` | no | `604800` | Refresh-token lifetime in seconds |
| `SMTP_HOST` | **yes** | — | SMTP server host |
| `SMTP_PORT` | **yes** | — | SMTP server port |
| `SMTP_USER` | **yes** | — | SMTP username |
| `SMTP_PASS` | **yes** | — | SMTP password |
| `SMTP_FROM` | **yes** | — | From address on outgoing mail |
| `REDIS_URL` | no | `redis://localhost:6379` | Redis connection string |

Generate the token secrets with `openssl rand -hex 64`.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Development server with hot reload (tsx watch) |
| `pnpm build` | Type-check and compile to `dist/` |
| `pnpm start` | Run the compiled build |
| `pnpm test` | Run the Vitest suite |
| `pnpm prisma:generate` | Regenerate the Prisma client |
| `pnpm prisma:migrate` | Create and apply a development migration |
| `pnpm prisma:studio` | Open Prisma Studio |
| `pnpm biome:check` | Lint and format check |
| `pnpm biome:lint` | Lint and format with autofix |

## API surface

Every route is mounted under `/api` by [src/common/routes/index.ts](src/common/routes/index.ts):

| Prefix | Feature |
|---|---|
| `/api/auth` | Signup, verification, signin, refresh, signout, password reset |
| `/api/kids` | Children listed for adoption |
| `/api/adoption-requests` | Adoption request lifecycle |
| `/api/reports` | Missing-child reports |
| `/api/donations` | Donations and fulfilment status |
| `/api/volunteers` | Volunteers |

Interactive documentation is generated from JSDoc annotations on the route files and served
at `http://localhost:8000/api-docs`.

## Project structure

```text
prisma/
  schema.prisma          Models, enums and indexes
  migrations/            Applied migration history
src/
  app.ts                 Express app: CORS, parsers, static uploads, router, error handler
  index.ts               Server entry point
  common/
    middlewares/         Token, role, validation and global error middleware
    routes/index.ts      Mounts every feature router under /api
    services/            Redis and mail helpers
    utils/               Response, error, file and query-builder helpers
    validation/          Shared Zod schemas
    types/               Shared request, response and user types
  config/                Environment, mail, multer, query and Swagger configuration
  db/
    index.ts             Prisma client, extended and raw
    extensions/          Soft-delete client extension
    repository/          Soft-delete and restore execution helpers
  features/              auth · kids · adoption · report · donation · task · volunteer
  generated/prisma/      Generated Prisma client — do not edit
```

## Conventions

**Feature modules.** Each feature follows `route → schema → controller → service → repository`.
Routes attach middleware and Swagger docs; schemas validate body, params, query and files;
controllers translate HTTP only; services own business rules and transactions; repositories
own soft-delete writes.

**Soft delete.** `User`, `KidsForAdoption`, `AdoptionRequest`, `MissingReport`, `Task` and
`Donation` are soft-deleted. The extended client exported as `prisma` injects
`deletedAt: null` into reads and updates and rejects direct writes to `deletedAt`. Deletion
and restoration go through `internalPrisma` and the repository helpers, which cascade to
related records.

**Authorization.** `accessTokenValidator` populates `res.locals.userId` and `res.locals.role`.
`requireRole(...)` gates a route by role. Per-record ownership is checked in the service —
never in the query builder, and never assumed from the role alone.

**List queries.** Declare filters, ranges, searchable paths and default sort in
[src/config/query.config.ts](src/config/query.config.ts), then pass the validated query
through `buildPrismaQuery`. Add `deletedAt: null` and ownership conditions in the service,
around the `where` the builder returns.

**Errors.** Throw the typed classes from
[src/common/utils/errorClass.utils.ts](src/common/utils/errorClass.utils.ts); the global
error middleware converts them into the standard response shape.
