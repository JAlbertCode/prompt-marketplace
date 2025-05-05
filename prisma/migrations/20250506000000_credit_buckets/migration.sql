-- CreateTable
CREATE TABLE "CreditBucket" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "remaining" INTEGER NOT NULL,
  "source" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CreditBucket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditBonus" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "monthlyBurn" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CreditBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlowUnlock" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "flowId" TEXT NOT NULL,
  "credits" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "FlowUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreditBucket_userId_idx" ON "CreditBucket"("userId");
CREATE INDEX "CreditBucket_type_idx" ON "CreditBucket"("type");

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "modelId" TEXT;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "creatorId" TEXT;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "creatorFeePercentage" INTEGER DEFAULT 0;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "itemType" TEXT DEFAULT 'completion';
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "itemId" TEXT;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "creditsUsed" INTEGER DEFAULT 0;
ALTER TABLE "CreditTransaction" ADD COLUMN IF NOT EXISTS "promptLength" TEXT DEFAULT 'medium';

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "CreditBucket" ADD CONSTRAINT "CreditBucket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditBonus" ADD CONSTRAINT "CreditBonus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowUnlock" ADD CONSTRAINT "FlowUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlowUnlock" ADD CONSTRAINT "FlowUnlock_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_idx" ON "CreditTransaction"("userId");
CREATE INDEX "CreditTransaction_creatorId_idx" ON "CreditTransaction"("creatorId");
CREATE UNIQUE INDEX "FlowUnlock_userId_flowId_key" ON "FlowUnlock"("userId", "flowId");
