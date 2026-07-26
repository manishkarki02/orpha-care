-- The (kid_id, adopter_id) unique index only excluded soft-deleted rows, so a rejected
-- request permanently blocked that adopter from ever requesting the same kid again.
-- One-active-request-per-adopter is now enforced by
-- "adoption_requests_adopter_id_active_key", which is scoped by status instead.
DROP INDEX IF EXISTS "adoption_requests_kid_id_adopter_id_active_key";
