-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "payMethod" "PayMethod",
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0;
