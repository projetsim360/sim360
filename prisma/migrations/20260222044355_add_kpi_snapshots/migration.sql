-- CreateTable
CREATE TABLE "simulation_kpi_snapshots" (
    "id" TEXT NOT NULL,
    "simulationId" TEXT NOT NULL,
    "phaseOrder" INTEGER NOT NULL,
    "trigger" TEXT NOT NULL,
    "triggerId" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,
    "schedule" DOUBLE PRECISION NOT NULL,
    "quality" DOUBLE PRECISION NOT NULL,
    "teamMorale" DOUBLE PRECISION NOT NULL,
    "riskLevel" DOUBLE PRECISION NOT NULL,
    "takenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_kpi_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "simulation_kpi_snapshots_simulationId_idx" ON "simulation_kpi_snapshots"("simulationId");

-- AddForeignKey
ALTER TABLE "simulation_kpi_snapshots" ADD CONSTRAINT "simulation_kpi_snapshots_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
