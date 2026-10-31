/*
  Warnings:

  - You are about to drop the column `curator` on the `Group` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "curator",
ADD COLUMN     "collegeStudentsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "discountCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "listenersCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "masterId" TEXT,
ADD COLUMN     "status" "GroupStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "teacherId" TEXT,
ADD COLUMN     "totalPrice" INTEGER;

-- AlterTable
ALTER TABLE "GroupTeacher" ADD COLUMN     "contractEndDate" DATE,
ADD COLUMN     "contractStartDate" DATE,
ADD COLUMN     "serviceEndDate" DATE,
ADD COLUMN     "serviceStartDate" DATE;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "curatorId" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "isDpkStudent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "medCertNumber" TEXT,
ADD COLUMN     "medInstitution" TEXT;

-- CreateIndex
CREATE INDEX "Group_teacherId_idx" ON "Group"("teacherId");

-- CreateIndex
CREATE INDEX "Group_masterId_idx" ON "Group"("masterId");

-- CreateIndex
CREATE INDEX "Student_curatorId_idx" ON "Student"("curatorId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "Student_name_birth_active_key"
    ON "Student" (lower("fullName"), "birthDate") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Group_name_start_active_key"
    ON "Group" (lower("name"), "startDate") WHERE "deletedAt" IS NULL;