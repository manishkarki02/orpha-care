# OrphaCare Roadmap

Upgrade options, ordered by leverage. Current state and features are in [README.md](README.md) — this file only lists what could be built next and why.

## 1. Adoption approval workflow (highest value)

The core domain logic the product is missing. Today an adoption request is just a row in a join table; admins can see pending requests but can't act on them.

- Add `status` to `AdoptionRequest`: `PENDING → UNDER_REVIEW → APPROVED | REJECTED` (+ `decidedBy`, `decidedAt`).
- Admin-only approve/reject endpoints.
- On approval — inside a **single transaction**: mark the kid `isAdopted`, set adopter, auto-reject all competing requests for the same kid. Two admins approving competing requests concurrently must not both succeed.
- Frontend: approve/reject actions on the admin dashboard, request status visible to the user.
- This is a state machine + transaction + authorization exercise — design it before coding it.

## 2. Statuses for reports and donation

- `MissingReport`: `OPEN → FOUND → CLOSED`, admin-controlled transitions.
- `Donation`: `PLEDGED → RECEIVED → DISTRIBUTED` if physical logistics should be tracked.
- Consider a status-history/audit table for sensitive workflows.

## 3. Ownership authorization

Enforce consistently: users can only update/delete **their own** reports/donation/requests; admins can manage everything. Add tests that prove a user cannot touch another user's records.

## 4. Pagination, search, and filters

List endpoints currently return everything. Add `page`/`limit`, sorting, and filters (province, age, gender, status, donation type) on the API, and matching UI (filter bar, paginated tables) on list pages.

## 5. Test coverage

Currently: auth service + adoption service + one frontend component test. Extend to:

- Donation/report/volunteer services.
- The approval workflow above (including the concurrent-approval case).
- Frontend form validation and protected-route behavior.

## 6. Infrastructure

- **Uploads**: move from local disk to Cloudinary/S3 (local files don't survive deploys).
- **Docker Compose**: backend + frontend + Postgres + Redis for one-command local setup.
- **Deploy**: a live demo (backend + Postgres + Redis, static frontend) makes the project portfolio-usable.

## 7. Product ideas (later)

- Volunteer _applications_ (apply → admin approves) instead of an open volunteer list.
- Contact/visibility controls on missing-child reports (public listing vs. private contact details).
- Notifications (email on request approval, report status change).
- User dashboard stats and admin analytics.

## Ethical note

The `Caste` enum has already been removed from `KidsForAdoption` — keep it that way. More broadly: this is a child-welfare domain, so treat photos, geolocation of missing children, and adopter/child personal data as sensitive by default (visibility rules, no public exposure of contact details, audit trails on sensitive actions).
