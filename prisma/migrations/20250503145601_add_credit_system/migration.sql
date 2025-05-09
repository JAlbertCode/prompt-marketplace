-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN "creatorFee" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PromptFlow" ADD COLUMN "unlockPrice" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 1000;

-- CreateTable
CREATE TABLE "UnlockedFlow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnlockedFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "itemId" TEXT,
    "itemType" TEXT,
    "creatorId" TEXT,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnlockedFlow_userId_flowId_key" ON "UnlockedFlow"("userId", "flowId");

-- AddForeignKey
ALTER TABLE "UnlockedFlow" ADD CONSTRAINT "UnlockedFlow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnlockedFlow" ADD CONSTRAINT "UnlockedFlow_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
