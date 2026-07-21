-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Volunteer', 'User');

-- CreateEnum
CREATE TYPE "Province" AS ENUM ('Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'SudurPachim');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Other');

-- CreateEnum
CREATE TYPE "DonationType" AS ENUM ('Food', 'Cloth', 'Books', 'Money');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('Pending', 'Received', 'Rejected', 'Distributed');

-- CreateEnum
CREATE TYPE "AdoptionRequestStatus" AS ENUM ('Pending', 'UnderReview', 'Approved', 'Rejected');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('AdoptionHomeSurvey', 'MissingChildFollowUp');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Pending', 'InProgress', 'Submitted', 'Completed');

-- CreateEnum
CREATE TYPE "TaskResult" AS ENUM ('Suitable', 'NeedsReview', 'NotSuitable', 'PossibleMatch', 'NotFound', 'Found');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'User',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kids_for_adoption" (
    "id" TEXT NOT NULL,
    "picture" TEXT,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" "Gender" NOT NULL,
    "province" "Province" NOT NULL,
    "description" TEXT NOT NULL,
    "is_adopted" BOOLEAN NOT NULL DEFAULT false,
    "adopter_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,

    CONSTRAINT "kids_for_adoption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adoption_requests" (
    "id" TEXT NOT NULL,
    "status" "AdoptionRequestStatus" NOT NULL DEFAULT 'Pending',
    "kid_id" TEXT NOT NULL,
    "adopter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,

    CONSTRAINT "adoption_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "missing_reports" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "last_seen_address" TEXT NOT NULL,
    "last_seen_time" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "remarks" TEXT,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "image" TEXT,
    "reporter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,

    CONSTRAINT "missing_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "TaskType" NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'Pending',
    "due_date" TIMESTAMP(3),
    "result" "TaskResult",
    "remarks" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "volunteer_id" TEXT NOT NULL,
    "adoption_request_id" TEXT,
    "missing_report_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "weight" DECIMAL(10,2),
    "amount" DECIMAL(10,2),
    "type" "DonationType" NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'Pending',
    "donor_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "deleted_by_id" TEXT,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_verified_idx" ON "users"("is_verified");

-- CreateIndex
CREATE INDEX "kids_for_adoption_is_adopted_idx" ON "kids_for_adoption"("is_adopted");

-- CreateIndex
CREATE INDEX "kids_for_adoption_province_idx" ON "kids_for_adoption"("province");

-- CreateIndex
CREATE INDEX "kids_for_adoption_adopter_id_idx" ON "kids_for_adoption"("adopter_id");

-- CreateIndex
CREATE INDEX "kids_for_adoption_created_by_id_idx" ON "kids_for_adoption"("created_by_id");

-- CreateIndex
CREATE INDEX "kids_for_adoption_deleted_at_idx" ON "kids_for_adoption"("deleted_at");

-- CreateIndex
CREATE INDEX "adoption_requests_status_idx" ON "adoption_requests"("status");

-- CreateIndex
CREATE INDEX "adoption_requests_adopter_id_idx" ON "adoption_requests"("adopter_id");

-- CreateIndex
CREATE INDEX "adoption_requests_kid_id_idx" ON "adoption_requests"("kid_id");

-- CreateIndex
CREATE INDEX "adoption_requests_created_by_id_idx" ON "adoption_requests"("created_by_id");

-- CreateIndex
CREATE INDEX "adoption_requests_deleted_at_idx" ON "adoption_requests"("deleted_at");

-- CreateIndex
CREATE INDEX "missing_reports_reporter_id_idx" ON "missing_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "missing_reports_created_by_id_idx" ON "missing_reports"("created_by_id");

-- CreateIndex
CREATE INDEX "missing_reports_deleted_at_idx" ON "missing_reports"("deleted_at");

-- CreateIndex
CREATE INDEX "tasks_volunteer_id_idx" ON "tasks"("volunteer_id");

-- CreateIndex
CREATE INDEX "tasks_status_idx" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "tasks_missing_report_id_idx" ON "tasks"("missing_report_id");

-- CreateIndex
CREATE INDEX "tasks_type_idx" ON "tasks"("type");

-- CreateIndex
CREATE INDEX "tasks_adoption_request_id_idx" ON "tasks"("adoption_request_id");

-- CreateIndex
CREATE INDEX "tasks_created_by_id_idx" ON "tasks"("created_by_id");

-- CreateIndex
CREATE INDEX "tasks_deleted_at_idx" ON "tasks"("deleted_at");

-- CreateIndex
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");

-- CreateIndex
CREATE INDEX "donations_type_idx" ON "donations"("type");

-- CreateIndex
CREATE INDEX "donations_status_idx" ON "donations"("status");

-- CreateIndex
CREATE INDEX "donations_created_by_id_idx" ON "donations"("created_by_id");

-- CreateIndex
CREATE INDEX "donations_deleted_at_idx" ON "donations"("deleted_at");

-- AddForeignKey
ALTER TABLE "kids_for_adoption" ADD CONSTRAINT "kids_for_adoption_adopter_id_fkey" FOREIGN KEY ("adopter_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_for_adoption" ADD CONSTRAINT "kids_for_adoption_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_for_adoption" ADD CONSTRAINT "kids_for_adoption_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kids_for_adoption" ADD CONSTRAINT "kids_for_adoption_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_kid_id_fkey" FOREIGN KEY ("kid_id") REFERENCES "kids_for_adoption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_adopter_id_fkey" FOREIGN KEY ("adopter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adoption_requests" ADD CONSTRAINT "adoption_requests_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_reports" ADD CONSTRAINT "missing_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_reports" ADD CONSTRAINT "missing_reports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_reports" ADD CONSTRAINT "missing_reports_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missing_reports" ADD CONSTRAINT "missing_reports_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_adoption_request_id_fkey" FOREIGN KEY ("adoption_request_id") REFERENCES "adoption_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_missing_report_id_fkey" FOREIGN KEY ("missing_report_id") REFERENCES "missing_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
