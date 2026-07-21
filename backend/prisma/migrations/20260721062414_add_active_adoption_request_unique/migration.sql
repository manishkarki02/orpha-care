CREATE UNIQUE INDEX "adoption_requests_kid_id_adopter_id_active_key" ON "adoption_requests"("kid_id", "adopter_id")
WHERE "deleted_at" IS NULL;