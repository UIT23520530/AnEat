-- Add enums for stock request
CREATE TYPE "StockRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "StockRequestType" AS ENUM ('RESTOCK', 'ADJUSTMENT', 'RETURN');

-- Create StockRequest table
CREATE TABLE "StockRequest" (
    "id" TEXT NOT NULL,
    "requestNumber" TEXT NOT NULL,
    "type" "StockRequestType" NOT NULL DEFAULT 'RESTOCK',
    "status" "StockRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedQuantity" INTEGER NOT NULL,
    "approvedQuantity" INTEGER,
    "notes" TEXT,
    "requestedDate" TIMESTAMP(3),
    "expectedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "rejectedReason" TEXT,
    
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockRequest_pkey" PRIMARY KEY ("id")
);

-- Create StockTransaction table for history
CREATE TABLE "StockTransaction" (
    "id" TEXT NOT NULL,
    "transactionNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "reason" TEXT,
    "reference" TEXT,
    
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "stockRequestId" TEXT,
    "orderId" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockTransaction_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "StockRequest_requestNumber_key" ON "StockRequest"("requestNumber");
CREATE UNIQUE INDEX "StockTransaction_transactionNumber_key" ON "StockTransaction"("transactionNumber");
CREATE INDEX "StockRequest_productId_idx" ON "StockRequest"("productId");
CREATE INDEX "StockRequest_branchId_idx" ON "StockRequest"("branchId");
CREATE INDEX "StockRequest_status_idx" ON "StockRequest"("status");
CREATE INDEX "StockTransaction_productId_idx" ON "StockTransaction"("productId");
CREATE INDEX "StockTransaction_branchId_idx" ON "StockTransaction"("branchId");

-- Add foreign keys
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockRequest" ADD CONSTRAINT "StockRequest_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_stockRequestId_fkey" FOREIGN KEY ("stockRequestId") REFERENCES "StockRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockTransaction" ADD CONSTRAINT "StockTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
