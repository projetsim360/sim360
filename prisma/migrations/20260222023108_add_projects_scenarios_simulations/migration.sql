-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SimulationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('IT', 'CONSTRUCTION', 'MARKETING', 'HEALTHCARE', 'FINANCE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "PhaseType" AS ENUM ('INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSURE');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RandomEventType" AS ENUM ('RISK', 'OPPORTUNITY', 'CONSTRAINT', 'STAKEHOLDER');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "objectives" TEXT[],
    "sector" "Sector" NOT NULL DEFAULT 'IT',
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedDurationHours" INTEGER NOT NULL DEFAULT 4,
    "requiredPlan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "competencies" TEXT[],
    "projectTemplate" JSONB NOT NULL,
    "initialKpis" JSONB NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_phases" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PhaseType" NOT NULL,
    "durationDays" INTEGER NOT NULL DEFAULT 5,
    "completionCriteria" JSONB,

    CONSTRAINT "scenario_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_templates" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'STEERING',
    "objectives" TEXT[],
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "participants" JSONB NOT NULL,

    CONSTRAINT "meeting_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_templates" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "optimalOption" INTEGER,
    "timeLimitSeconds" INTEGER,

    CONSTRAINT "decision_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_event_templates" (
    "id" TEXT NOT NULL,
    "phaseId" TEXT NOT NULL,
    "type" "RandomEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "options" JSONB NOT NULL,
    "triggerConditions" JSONB,

    CONSTRAINT "random_event_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "client" TEXT,
    "sector" "Sector" NOT NULL DEFAULT 'IT',
    "description" TEXT,
    "initialBudget" DOUBLE PRECISION NOT NULL,
    "currentBudget" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3) NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_team_members" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "expertise" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "personality" TEXT NOT NULL DEFAULT 'COOPERATIVE',
    "availability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "morale" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "avatar" TEXT,

    CONSTRAINT "project_team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliverables" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "phaseOrder" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "qualityScore" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "dependencies" TEXT[],

    CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "SimulationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentPhaseOrder" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalDurationMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_kpis" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "budget" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "schedule" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "quality" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "teamMorale" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "riskLevel" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulation_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_phases" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PhaseType" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'LOCKED',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "simulation_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "phaseOrder" INTEGER NOT NULL,
    "templateId" TEXT,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" INTEGER,
    "decidedAt" TIMESTAMP(3),
    "kpiImpact" JSONB,
    "timeLimitSeconds" INTEGER,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "random_events" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "phaseOrder" INTEGER NOT NULL,
    "templateId" TEXT,
    "type" "RandomEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "options" JSONB NOT NULL,
    "selectedOption" INTEGER,
    "resolvedAt" TIMESTAMP(3),
    "kpiImpact" JSONB,

    CONSTRAINT "random_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scenarios_sector_difficulty_idx" ON "scenarios"("sector", "difficulty");

-- CreateIndex
CREATE INDEX "scenarios_isPublished_idx" ON "scenarios"("isPublished");

-- CreateIndex
CREATE INDEX "scenario_phases_scenarioId_idx" ON "scenario_phases"("scenarioId");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_phases_scenarioId_order_key" ON "scenario_phases"("scenarioId", "order");

-- CreateIndex
CREATE INDEX "meeting_templates_phaseId_idx" ON "meeting_templates"("phaseId");

-- CreateIndex
CREATE INDEX "decision_templates_phaseId_idx" ON "decision_templates"("phaseId");

-- CreateIndex
CREATE INDEX "random_event_templates_phaseId_idx" ON "random_event_templates"("phaseId");

-- CreateIndex
CREATE INDEX "projects_tenantId_idx" ON "projects"("tenantId");

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");

-- CreateIndex
CREATE INDEX "project_team_members_projectId_idx" ON "project_team_members"("projectId");

-- CreateIndex
CREATE INDEX "deliverables_projectId_idx" ON "deliverables"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "simulations_projectId_key" ON "simulations"("projectId");

-- CreateIndex
CREATE INDEX "simulations_tenantId_idx" ON "simulations"("tenantId");

-- CreateIndex
CREATE INDEX "simulations_userId_idx" ON "simulations"("userId");

-- CreateIndex
CREATE INDEX "simulations_status_idx" ON "simulations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_kpis_simulationId_key" ON "simulation_kpis"("simulationId");

-- CreateIndex
CREATE INDEX "simulation_phases_simulationId_idx" ON "simulation_phases"("simulationId");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_phases_simulationId_order_key" ON "simulation_phases"("simulationId", "order");

-- CreateIndex
CREATE INDEX "decisions_simulationId_idx" ON "decisions"("simulationId");

-- CreateIndex
CREATE INDEX "random_events_simulationId_idx" ON "random_events"("simulationId");

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_phases" ADD CONSTRAINT "scenario_phases_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_templates" ADD CONSTRAINT "meeting_templates_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "scenario_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_templates" ADD CONSTRAINT "decision_templates_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "scenario_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_event_templates" ADD CONSTRAINT "random_event_templates_phaseId_fkey" FOREIGN KEY ("phaseId") REFERENCES "scenario_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_team_members" ADD CONSTRAINT "project_team_members_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_kpis" ADD CONSTRAINT "simulation_kpis_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_phases" ADD CONSTRAINT "simulation_phases_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "random_events" ADD CONSTRAINT "random_events_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
