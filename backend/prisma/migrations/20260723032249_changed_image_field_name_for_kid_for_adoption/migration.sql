/*
  Warnings:

  - You are about to drop the column `picture` on the `kids_for_adoption` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kids_for_adoption" DROP COLUMN "picture",
ADD COLUMN     "image" TEXT;
