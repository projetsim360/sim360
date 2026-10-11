-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "plan" "TenantPlan",
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- CreateTable
CREATE TABLE "billing_events" (
    "id" TEXT NOT NULL,
    "stripeEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_events_stripeEventId_key" ON "billing_events"("stripeEventId");

-- CreateIndex
CREATE INDEX "billing_events_userId_idx" ON "billing_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");

