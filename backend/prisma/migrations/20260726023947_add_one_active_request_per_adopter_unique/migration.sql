-- An adopter may hold at most one adoption request that is still in flight.
-- Approved, Rejected and soft-deleted rows fall outside the predicate, so a user
-- whose previous request has been resolved is free to request again.
CREATE UNIQUE INDEX "adoption_requests_adopter_id_active_key" ON "adoption_requests"("adopter_id")
WHERE "status" IN ('Pending', 'UnderReview') AND "deleted_at" IS NULL;