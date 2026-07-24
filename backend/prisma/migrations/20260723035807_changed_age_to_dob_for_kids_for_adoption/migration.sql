/*
  Warnings:

  - You are about to drop the column `age` on the `kids_for_adoption` table. All the data in the column will be lost.
  - Added the required column `dob` to the `kids_for_adoption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "kids_for_adoption" DROP COLUMN "age",
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL;
