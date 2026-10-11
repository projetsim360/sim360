-- Schema changes of PR #5 (user-test feedback: custom meetings, participant realism,
-- action items, 15 new sectors, America/Toronto default). They had been applied locally with
-- `prisma db push` only; production never received them (meetings.isCustom missing).

-- CreateEnum
CREATE TYPE "ActionItemStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED');
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "Sector" ADD VALUE 'ENGINEERING';
ALTER TYPE "Sector" ADD VALUE 'ENERGY';
ALTER TYPE "Sector" ADD VALUE 'TRANSPORT';
ALTER TYPE "Sector" ADD VALUE 'MANUFACTURING';
ALTER TYPE "Sector" ADD VALUE 'PUBLIC_ADMINISTRATION';
ALTER TYPE "Sector" ADD VALUE 'TELECOM';
ALTER TYPE "Sector" ADD VALUE 'AEROSPACE';
ALTER TYPE "Sector" ADD VALUE 'PROFESSIONAL_SERVICES';
ALTER TYPE "Sector" ADD VALUE 'BANKING_INSURANCE';
ALTER TYPE "Sector" ADD VALUE 'NATURAL_RESOURCES';
ALTER TYPE "Sector" ADD VALUE 'LOGISTICS';
ALTER TYPE "Sector" ADD VALUE 'REAL_ESTATE';
ALTER TYPE "Sector" ADD VALUE 'EDUCATION';
ALTER TYPE "Sector" ADD VALUE 'DIGITAL_TRANSFORMATION';
ALTER TYPE "Sector" ADD VALUE 'PRODUCT_DEVELOPMENT';
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "timezone" SET DEFAULT 'America/Toronto';
-- AlterTable
ALTER TABLE "meetings" ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sector" TEXT,
ADD COLUMN     "stakes" TEXT;
-- AlterTable
ALTER TABLE "meeting_participants" ADD COLUMN     "communicationStyle" TEXT,
ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "objectives" TEXT,
ADD COLUMN     "seniority" TEXT;
-- AlterTable
ALTER TABLE "meeting_summaries" ADD COLUMN     "actionItemsImported" BOOLEAN NOT NULL DEFAULT false;
-- CreateTable
CREATE TABLE "action_items" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "meetingId" TEXT,
    "title" TEXT NOT NULL,
    "assignee" TEXT,
    "dueDate" TIMESTAMP(3),
    "dueLabel" TEXT,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'TODO',
    "source" TEXT NOT NULL DEFAULT 'USER',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "action_items_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE INDEX "action_items_tenantId_idx" ON "action_items"("tenantId");
-- CreateIndex
CREATE INDEX "action_items_simulationId_idx" ON "action_items"("simulationId");
-- CreateIndex
CREATE INDEX "action_items_meetingId_idx" ON "action_items"("meetingId");
-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
