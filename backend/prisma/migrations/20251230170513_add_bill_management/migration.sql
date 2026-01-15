-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED', 'REFUNDED');

-- DropIndex (with IF EXISTS to prevent errors)
DROP INDEX IF EXISTS "StockRequest_branchId_idx";

-- DropIndex
DROP INDEX IF EXISTS "StockRequest_productId_idx";

-- DropIndex
DROP INDEX IF EXISTS "StockRequest_status_idx";

-- DropIndex
DROP INDEX IF EXISTS "StockTransaction_branchId_idx";

-- DropIndex
DROP INDEX IF EXISTS "StockTransaction_productId_idx";

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL DEFAULT 'ISSUED',
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "changeAmount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "internalNotes" TEXT,
    "orderId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "issuedById" TEXT NOT NULL,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "lastEditedAt" TIMESTAMP(3),
    "printedCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillHistory" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "billNumber" TEXT NOT NULL,
    "status" "BillStatus" NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "taxAmount" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "customerAddress" TEXT,
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL,
    "paidAmount" INTEGER NOT NULL,
    "changeAmount" INTEGER NOT NULL,
    "notes" TEXT,
    "internalNotes" TEXT,
    "editReason" TEXT NOT NULL,
    "changedFields" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "editedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_orderId_key" ON "Bill"("orderId");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillHistory" ADD CONSTRAINT "BillHistory_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillHistory" ADD CONSTRAINT "BillHistory_editedById_fkey" FOREIGN KEY ("editedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
