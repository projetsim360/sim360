-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'TEXT';

-- CreateTable
CREATE TABLE "ai_token_usage" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "simulationId" TEXT,
    "operation" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_token_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_token_quotas" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "monthlyInputLimit" INTEGER NOT NULL DEFAULT 500000,
    "monthlyOutputLimit" INTEGER NOT NULL DEFAULT 200000,
    "currentMonthInput" INTEGER NOT NULL DEFAULT 0,
    "currentMonthOutput" INTEGER NOT NULL DEFAULT 0,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_token_quotas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_token_usage_tenantId_createdAt_idx" ON "ai_token_usage"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_token_usage_userId_createdAt_idx" ON "ai_token_usage"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_token_quotas_tenantId_key" ON "ai_token_quotas"("tenantId");

-- AddForeignKey
ALTER TABLE "ai_token_quotas" ADD CONSTRAINT "ai_token_quotas_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
