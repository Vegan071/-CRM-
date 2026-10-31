-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "collegeGroupId" TEXT;

-- CreateTable
CREATE TABLE "CollegeGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CollegeGroup_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CollegeGroup" ("id", "name", "createdAt", "updatedAt", "deletedAt")
SELECT g."id", g."name", g."createdAt", g."updatedAt", g."deletedAt"
FROM "Group" g
WHERE NOT EXISTS (SELECT 1 FROM "Enrollment" e WHERE e."groupId" = g."id")
  AND NOT EXISTS (SELECT 1 FROM "GroupTeacher" t WHERE t."groupId" = g."id");

UPDATE "AuditLog" SET "entity" = 'CollegeGroup'
WHERE "entity" = 'Group' AND "entityId" IN (SELECT "id" FROM "CollegeGroup");

DELETE FROM "Group" WHERE "id" IN (SELECT "id" FROM "CollegeGroup");

DROP INDEX "Group_name_active_key";
CREATE UNIQUE INDEX "CollegeGroup_name_active_key"
    ON "CollegeGroup" (lower("name")) WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "CollegeGroup_deletedAt_createdAt_id_idx" ON "CollegeGroup"("deletedAt", "createdAt", "id");

-- CreateIndex
CREATE INDEX "Student_collegeGroupId_idx" ON "Student"("collegeGroupId");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_collegeGroupId_fkey" FOREIGN KEY ("collegeGroupId") REFERENCES "CollegeGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
