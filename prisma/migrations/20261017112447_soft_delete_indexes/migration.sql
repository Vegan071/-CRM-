/*
  Warnings:

  - Changed the type of `action` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'VIEW_SECRET', 'APPROVE', 'REJECT');

-- DropIndex
DROP INDEX "Enrollment_studentId_groupId_key";

-- DropIndex
DROP INDEX "Group_deletedAt_idx";

-- DropIndex
DROP INDEX "GroupTeacher_groupId_teacherId_key";

-- DropIndex
DROP INDEX "Student_deletedAt_idx";

-- DropIndex
DROP INDEX "Teacher_deletedAt_idx";

-- AlterTable
ALTER TABLE "AuditLog" ALTER COLUMN "action" TYPE "AuditAction" USING (
  CASE "action"
    WHEN 'create' THEN 'CREATE'
    WHEN 'update' THEN 'UPDATE'
    WHEN 'delete' THEN 'DELETE'
    WHEN 'view_secret' THEN 'VIEW_SECRET'
    WHEN 'ACTIVE' THEN 'APPROVE'
    WHEN 'REJECTED' THEN 'REJECT'
  END::"AuditAction"
);

-- AlterTable
ALTER TABLE "GroupTeacher" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "TeacherPayment" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "FieldDefinition_entity_sortOrder_idx" ON "FieldDefinition"("entity", "sortOrder");

-- CreateIndex
CREATE INDEX "Group_deletedAt_createdAt_id_idx" ON "Group"("deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "GroupTeacher_groupId_idx" ON "GroupTeacher"("groupId");

-- CreateIndex
CREATE INDEX "Student_deletedAt_createdAt_id_idx" ON "Student"("deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Teacher_fullName_idx" ON "Teacher"("fullName");

-- CreateIndex
CREATE INDEX "Teacher_deletedAt_createdAt_id_idx" ON "Teacher"("deletedAt", "createdAt", "id");
-- Partial unique indexes (soft delete)
CREATE UNIQUE INDEX "Group_name_active_key"
    ON "Group" (lower("name")) WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Teacher_fullName_active_key"
    ON "Teacher" (lower("fullName")) WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Enrollment_student_group_active_key"
    ON "Enrollment" ("studentId", "groupId") WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "GroupTeacher_group_teacher_active_key"
    ON "GroupTeacher" ("groupId", "teacherId") WHERE "deletedAt" IS NULL;