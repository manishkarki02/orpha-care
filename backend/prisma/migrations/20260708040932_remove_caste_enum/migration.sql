/*
  Warnings:

  - You are about to drop the column `caste` on the `kids_for_adoption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kids_for_adoption" DROP COLUMN "caste";

-- DropEnum
DROP TYPE "Caste";
