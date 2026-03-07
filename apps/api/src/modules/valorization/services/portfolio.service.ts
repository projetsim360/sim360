import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async getPortfolio(simulationId: string, userId: string, tenantId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      include: {
        scenario: { select: { id: true, title: true, sector: true, difficulty: true, description: true } },
        kpis: true,
        phases: { orderBy: { order: 'asc' }, select: { id: true, name: true, order: true, status: true } },
        userDeliverables: {
          include: {
            evaluations: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: {
                id: true,
                revisionNumber: true,
                score: true,
                grade: true,
                positives: true,
                improvements: true,
                missingElements: true,
                recommendations: true,
                createdAt: true,
              },
            },
          },
          orderBy: { phaseOrder: 'asc' },
        },
        competencyBadges: {
          where: { userId },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        meetings: {
          select: { id: true, title: true, status: true, phaseOrder: true },
          orderBy: { createdAt: 'asc' },
        },
        decisions: {
          select: { id: true, title: true, selectedOption: true, phaseOrder: true },
          orderBy: { phaseOrder: 'asc' },
        },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');
    if (simulation.tenantId !== tenantId) throw new ForbiddenException('Acces refuse');

    // Compute deliverable stats
    const deliverables = simulation.userDeliverables;
    const evaluatedDeliverables = deliverables.filter((d) => d.evaluations.length > 0);
    const validatedDeliverables = deliverables.filter((d) => d.status === 'VALIDATED');
    const avgScore = evaluatedDeliverables.length > 0
      ? evaluatedDeliverables.reduce((sum, d) => sum + (d.evaluations[0]?.score ?? 0), 0) / evaluatedDeliverables.length
      : null;

    // Publish export event
    await this.eventPublisher.publish(
      EventType.PORTFOLIO_EXPORTED,
      AggregateType.COMPETENCY_BADGE,
      simulationId,
      { simulationId, scenarioTitle: simulation.scenario.title, format: 'json' },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 1,
      },
    );

    return {
      simulation: {
        id: simulation.id,
        status: simulation.status,
        startedAt: simulation.startedAt,
        completedAt: simulation.completedAt,
        totalDurationMinutes: simulation.totalDurationMinutes,
      },
      scenario: simulation.scenario,
      kpis: simulation.kpis
        ? {
            budget: simulation.kpis.budget,
            schedule: simulation.kpis.schedule,
            quality: simulation.kpis.quality,
            teamMorale: simulation.kpis.teamMorale,
            riskLevel: simulation.kpis.riskLevel,
          }
        : null,
      phases: simulation.phases,
      badge: simulation.competencyBadges[0] ?? null,
      deliverables: deliverables.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        phaseOrder: d.phaseOrder,
        status: d.status,
        revisionNumber: d.revisionNumber,
        evaluation: d.evaluations[0] ?? null,
      })),
      meetings: simulation.meetings,
      decisions: simulation.decisions,
      stats: {
        totalDeliverables: deliverables.length,
        evaluatedDeliverables: evaluatedDeliverables.length,
        validatedDeliverables: validatedDeliverables.length,
        averageDeliverableScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
        totalMeetings: simulation.meetings.length,
        completedMeetings: simulation.meetings.filter((m) => m.status === 'COMPLETED').length,
        totalDecisions: simulation.decisions.length,
        phasesCompleted: simulation.phases.filter((p) => p.status === 'COMPLETED').length,
        totalPhases: simulation.phases.length,
      },
    };
  }
}
