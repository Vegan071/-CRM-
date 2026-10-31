-- DropForeignKey
ALTER TABLE "GroupTeacher" DROP CONSTRAINT "GroupTeacher_groupId_fkey";

-- AlterTable
ALTER TABLE "GroupTeacher" ALTER COLUMN "groupId" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "GroupTeacher" ADD CONSTRAINT "GroupTeacher_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE UNIQUE INDEX "GroupTeacher_teacher_contract_active_key"
    ON "GroupTeacher" ("teacherId", lower("contractNumber")) WHERE "deletedAt" IS NULL;