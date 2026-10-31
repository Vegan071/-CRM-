/*
  Warnings:

  - You are about to drop the column `payMethod` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "payMethod" DROP NOT NULL,
ALTER COLUMN "price" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "payMethod",
DROP COLUMN "price";
