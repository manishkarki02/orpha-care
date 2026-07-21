# OrphaCare

A child-welfare platform (Nepal context) with four domains: **missing-child reports, adoption, donation, and volunteers**. Monorepo with `backend/` (REST API) and `frontend/` (SPA), each its own pnpm package.

> Last reviewed against the actual code: 2026-07-16.
> For setup/run instructions see [backend/README.md](backend/README.md) and [frontend/README.md](frontend/README.md).
> For planned improvements see [ROADMAP.md](ROADMAP.md).

## Stack

|              |                                                                                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend      | Express 5, TypeScript, Prisma 7 + PostgreSQL, Redis (token/user caching), JWT (access + refresh), Zod validation, multer uploads, nodemailer, Swagger at `/api-docs`, Biome |
| Frontend     | React 19, Vite 7, TypeScript, TanStack Router (file-based) + TanStack Query, Zustand (auth store), Tailwind 4 + shadcn/Radix, React Hook Form + Zod, axios                  |
| Testing / CI | Vitest on both packages, GitHub Actions (`.github/workflows/ci.yml`) — build + test for backend and frontend on push/PR to `main`                                           |

## Features (implemented and wired end-to-end)

### Authentication & accounts

- Signup with email verification (+ resend), signin, signout.
- JWT access token + HTTP-only refresh-token cookie, auto-refresh in the frontend axios client (`frontend/src/lib/api.ts`).
- Forgot/reset password flow, Redis-backed token/user caching.
- Roles: `USER` and `ADMIN` (role middleware on the backend, role-aware UI).

### Adoption

- Admin CRUD for children available for adoption (with image upload).
- Public children grid on the landing page + child detail page.
- **Request adoption** from a child's detail page (disabled when already adopted/requested).
- "My adoption requests" for users; **pending-requests list for admins** (no approve/reject decision flow yet — see roadmap).

### Missing-child reports

- Create a report (name, last-seen address/time, age, lat/long, photo).
- List all reports, "my reports", report detail page. Full CRUD on the API.

### Donation

- Donation form (Food / Cloth / Books / Money, weight or amount) submitting to the real API.
- List all donation, "my donation", detail, update, delete.

### Volunteers

- Volunteer registration (name, age, picture), list and detail pages.

### Dashboard

- Role-aware: regular users get `UserDashboard` (their own activity), admins get `AdminDashboard` (platform overview + pending adoption requests).

## Repo structure

```text
backend/
  src/features/{auth,adoption,donation,report,volunteer}/   # route → schema → controller → service per feature
  src/common/          # middlewares (token, role, validator), routes index, shared types
  src/config/          # env, Swagger, multer
  prisma/schema.prisma # User, MissingReport, Donation, Volunteer, KidsForAdoption, AdoptionRequest
frontend/
  src/routes/          # TanStack Router file-based routes; routeTree.gen.ts is generated — don't hand-edit
  src/features/{auth,adoption,children,dashboard,donation,landing,reports,volunteers}/
  src/hooks/           # useCustomQuery / useCustomMutation wrappers
  src/lib/api.ts       # axios instance with token refresh
  src/store/auth-store.ts
```

## Data model (backend/prisma/schema.prisma)

- `User` — role, email verification state, relations to reports/donation/adoption requests.
- `MissingReport` — child info, last-seen data, geo coords, image, reporter.
- `Donation` — type (Food/Cloth/Books/Money), weight or amount, donor.
- `Volunteer` — standalone (no relations).
- `KidsForAdoption` — profile, province, `isAdopted`, adopter.
- `AdoptionRequest` — kid ↔ adopter join table (composite PK, **no status field yet**).

## Known limitations

- Adoption requests can be created and listed, but there is no approve/reject workflow (no status on `AdoptionRequest`).
- No pagination, search, or filters on list endpoints.
- Image uploads go to local disk, not object storage.
- Ownership authorization is thin: users' ability to edit/delete only their own records isn't consistently enforced.
- Test coverage is minimal (auth service, adoption service, one frontend component test).
- No Docker setup and no deployment; runs locally only (needs local Postgres + Redis + SMTP config).
