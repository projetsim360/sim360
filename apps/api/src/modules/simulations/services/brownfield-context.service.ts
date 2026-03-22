import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { Prisma } from '@prisma/client';

export interface BrownfieldContext {
  previousDecisions: BrownfieldDecision[];
  completedDeliverables: BrownfieldDeliverable[];
  accumulatedDelays: number;
  budgetUsed: number;
  knownRisks: BrownfieldRisk[];
  teamMorale: string;
  previousPmNotes: string;
}

interface BrownfieldDecision {
  phase: number;
  title: string;
  outcome: string;
  impact: 'positive' | 'negative' | 'neutral';
}

interface BrownfieldDeliverable {
  name: string;
  score: number;
  status: 'VALIDATED' | 'REJECTED';
}

interface BrownfieldRisk {
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'MITIGATED' | 'CLOSED';
}

@Injectable()
export class BrownfieldContextService {
  private readonly logger = new Logger(BrownfieldContextService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Pre-populate completed phases, decisions, KPI snapshots and meetings
   * for a Brownfield simulation starting at a phase > 0.
   */
  async populateHistoricalData(
    tx: Prisma.TransactionClient,
    simulationId: string,
    scenarioPhases: Array<{
      order: number;
      name: string;
      type: string;
      decisionTemplates: Array<{ id: string; title: string; context: string; options: any; timeLimitSeconds?: number | null }>;
      meetingTemplates: Array<{ id: string; title: string; description?: string | null; type: string; objectives: string[]; durationMinutes: number; participants: any }>;
    }>,
    startingPhaseOrder: number,
    brownfieldContext: BrownfieldContext | null,
    initialKpis: Record<string, number>,
  ) {
    const completedPhases = scenarioPhases.filter((p) => p.order < startingPhaseOrder);

    for (const phase of completedPhases) {
      // Create historical decisions (auto-resolved)
      const contextDecisions = brownfieldContext?.previousDecisions?.filter((d) => d.phase === phase.order) ?? [];

      for (const tpl of phase.decisionTemplates) {
        const contextDecision = contextDecisions.find((d) => d.title === tpl.title);
        const options = tpl.options as Array<{ label: string; kpiImpact?: Record<string, number> }>;

        // Pick the decision from context or default to first option
        const selectedOption = contextDecision
          ? options.findIndex((o) => o.label === contextDecision.outcome) !== -1
            ? options.findIndex((o) => o.label === contextDecision.outcome)
            : 0
          : 0;

        await tx.decision.create({
          data: {
            simulationId,
            phaseOrder: phase.order,
            templateId: tpl.id,
            title: tpl.title,
            context: tpl.context,
            options: tpl.options as Prisma.InputJsonValue,
            selectedOption,
            decidedAt: new Date(Date.now() - (startingPhaseOrder - phase.order) * 7 * 24 * 60 * 60 * 1000),
            kpiImpact: options[selectedOption]?.kpiImpact as Prisma.InputJsonValue ?? Prisma.JsonNull,
          },
        });
      }

      // Create historical meetings (auto-completed)
      for (const tpl of phase.meetingTemplates) {
        const participants = tpl.participants as Array<{ name: string; role: string; personality?: string; cooperationLevel?: number }>;
        await tx.meeting.create({
          data: {
            simulationId,
            phaseOrder: phase.order,
            templateId: tpl.id,
            title: tpl.title,
            description: tpl.description,
            type: tpl.type,
            objectives: tpl.objectives,
            durationMinutes: tpl.durationMinutes,
            status: 'COMPLETED',
            startedAt: new Date(Date.now() - (startingPhaseOrder - phase.order) * 7 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - (startingPhaseOrder - phase.order) * 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
            participants: {
              create: participants.map((p, index) => ({
                name: p.name,
                role: p.role,
                personality: p.personality,
                cooperationLevel: p.cooperationLevel ?? 3,
                avatar: `/media/avatars/300-${(index % 36) + 1}.png`,
              })),
            },
          },
        });
      }

      // Create KPI snapshot per completed phase
      const degradation = brownfieldContext
        ? {
            budget: initialKpis.budget - (brownfieldContext.budgetUsed * 100 * (phase.order + 1)) / startingPhaseOrder,
            schedule: initialKpis.schedule - (brownfieldContext.accumulatedDelays * (phase.order + 1)) / startingPhaseOrder,
            quality: initialKpis.quality - phase.order * 2,
            teamMorale: this.teamMoraleToNumber(brownfieldContext.teamMorale) + (startingPhaseOrder - phase.order) * 5,
            riskLevel: initialKpis.riskLevel + phase.order * 5,
          }
        : {
            budget: initialKpis.budget - phase.order * 5,
            schedule: initialKpis.schedule - phase.order * 3,
            quality: initialKpis.quality - phase.order * 2,
            teamMorale: initialKpis.teamMorale - phase.order * 3,
            riskLevel: initialKpis.riskLevel + phase.order * 5,
          };

      await tx.simulationKpiSnapshot.create({
        data: {
          simulationId,
          phaseOrder: phase.order,
          trigger: 'phase_advance',
          budget: Math.max(0, degradation.budget),
          schedule: Math.max(0, degradation.schedule),
          quality: Math.max(0, Math.min(100, degradation.quality)),
          teamMorale: Math.max(0, Math.min(100, degradation.teamMorale)),
          riskLevel: Math.max(0, Math.min(100, degradation.riskLevel)),
          takenAt: new Date(Date.now() - (startingPhaseOrder - phase.order) * 7 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Create historical user deliverables from brownfield context
    if (brownfieldContext?.completedDeliverables?.length) {
      for (const del of brownfieldContext.completedDeliverables) {
        await tx.userDeliverable.create({
          data: {
            simulationId,
            title: del.name,
            type: del.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            phaseOrder: 0,
            status: del.status === 'VALIDATED' ? 'VALIDATED' : 'REJECTED',
            content: `*Ce livrable a été produit par le précédent chef de projet.*\n\nScore obtenu : ${del.score}/100`,
          },
        });
      }
    }

    this.logger.log(
      `Populated historical data for brownfield simulation ${simulationId}: ${completedPhases.length} phases, starting at phase ${startingPhaseOrder}`,
    );
  }

  /**
   * Compute the starting KPIs for a brownfield simulation
   * based on the brownfield context (accumulated delays, budget used, etc.)
   */
  computeBrownfieldKpis(
    initialKpis: Record<string, number>,
    brownfieldContext: BrownfieldContext | null,
  ): Record<string, number> {
    if (!brownfieldContext) return initialKpis;

    const moraleValue = this.teamMoraleToNumber(brownfieldContext.teamMorale);
    const activeRisks = brownfieldContext.knownRisks?.filter((r) => r.status === 'ACTIVE').length ?? 0;

    return {
      budget: Math.max(0, (initialKpis.budget ?? 100) * (1 - brownfieldContext.budgetUsed)),
      schedule: Math.max(0, (initialKpis.schedule ?? 100) - brownfieldContext.accumulatedDelays),
      quality: Math.max(0, Math.min(100, (initialKpis.quality ?? 80) - activeRisks * 5)),
      teamMorale: Math.max(0, Math.min(100, moraleValue)),
      riskLevel: Math.min(100, (initialKpis.riskLevel ?? 20) + activeRisks * 10),
    };
  }

  private teamMoraleToNumber(morale: string): number {
    switch (morale) {
      case 'very_low':
        return 25;
      case 'low':
        return 40;
      case 'medium':
        return 60;
      case 'high':
        return 75;
      case 'very_high':
        return 90;
      default:
        return 50;
    }
  }
}
