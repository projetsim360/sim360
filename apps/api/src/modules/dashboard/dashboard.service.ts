import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { Cacheable } from '@sim360/core';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // ─── Command Center Summary ──────────────────────────────
  @Cacheable({ key: 'dashboard:summary::arg0::arg1', ttl: 60 })
  async getSummary(userId: string, tenantId: string) {
    // 1. User info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, profileCompleted: true },
    });

    // 2. Simulation stats
    const [activeSimulations, completedSimulations, totalSimulations] = await Promise.all([
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'COMPLETED' } }),
      this.prisma.simulation.count({ where: { userId, tenantId } }),
    ]);

    // 3. Completed sims with KPIs for average score + score evolution
    const completedSims = await this.prisma.simulation.findMany({
      where: { userId, tenantId, status: 'COMPLETED' },
      include: {
        kpis: true,
        project: { select: { name: true } },
        scenario: { select: { title: true } },
      },
      orderBy: { completedAt: 'asc' },
    });

    const averageScore =
      completedSims.length > 0
        ? Math.round(
            (completedSims.reduce((sum, s) => {
              if (!s.kpis) return sum;
              return (
                sum +
                s.kpis.budget * 0.25 +
                s.kpis.schedule * 0.25 +
                s.kpis.quality * 0.25 +
                s.kpis.teamMorale * 0.15 +
                (100 - s.kpis.riskLevel) * 0.1
              );
            }, 0) /
              completedSims.length) *
              10,
          ) / 10
        : 0;

    // 4. Getting started checklist
    const [firstDeliverableSubmitted, firstBadge, firstPortfolioShared] = await Promise.all([
      this.prisma.userDeliverable.findFirst({
        where: {
          simulation: { userId, tenantId },
          status: { in: ['SUBMITTED', 'EVALUATED', 'VALIDATED'] },
        },
        select: { id: true },
      }),
      this.prisma.competencyBadge.findFirst({
        where: { userId, tenantId },
        select: { id: true },
      }),
      this.prisma.competencyBadge.findFirst({
        where: { userId, tenantId, isPublic: true },
        select: { id: true },
      }),
    ]);

    const gettingStartedFlags = {
      profileCompleted: user?.profileCompleted ?? false,
      firstSimulationLaunched: totalSimulations > 0,
      firstDeliverableSubmitted: !!firstDeliverableSubmitted,
      firstDebriefingViewed: !!firstBadge,
      firstPortfolioShared: !!firstPortfolioShared,
    };

    const completedSteps = Object.values(gettingStartedFlags).filter(Boolean).length;
    const gettingStarted = {
      ...gettingStartedFlags,
      completionPercent: Math.round((completedSteps / 5) * 100),
    };

    // 5. Pending actions counts
    const [pendingDecisions, pendingEvents, pendingMeetings, pendingEmails, pendingDeliverables] =
      await Promise.all([
        this.prisma.decision.findMany({
          where: {
            simulation: { userId, tenantId, status: 'IN_PROGRESS' },
            selectedOption: null,
          },
          select: {
            id: true,
            title: true,
            simulation: { select: { id: true, project: { select: { name: true } } } },
          },
        }),
        this.prisma.randomEvent.findMany({
          where: {
            simulation: { userId, tenantId, status: 'IN_PROGRESS' },
            resolvedAt: null,
          },
          select: {
            id: true,
            title: true,
            severity: true,
            simulation: { select: { id: true, project: { select: { name: true } } } },
          },
        }),
        this.prisma.meeting.findMany({
          where: {
            simulation: { userId, tenantId, status: 'IN_PROGRESS' },
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
          select: {
            id: true,
            title: true,
            simulation: { select: { id: true, project: { select: { name: true } } } },
          },
        }),
        this.prisma.simulatedEmail.findMany({
          where: {
            simulation: { userId, tenantId, status: 'IN_PROGRESS' },
            status: { in: ['UNREAD', 'READ'] },
          },
          select: {
            id: true,
            simulation: { select: { id: true } },
          },
        }),
        this.prisma.userDeliverable.findMany({
          where: {
            simulation: { userId, tenantId, status: 'IN_PROGRESS' },
            status: { in: ['DRAFT', 'REVISED'] },
          },
          select: {
            id: true,
            title: true,
            simulation: { select: { id: true, project: { select: { name: true } } } },
          },
        }),
      ]);

    const pendingActions = {
      decisions: pendingDecisions.length,
      events: pendingEvents.length,
      meetings: pendingMeetings.length,
      emails: pendingEmails.length,
      deliverables: pendingDeliverables.length,
    };

    // 6. Next step (priority: decisions > events > meetings > deliverables > emails > debriefing)
    const nextStep = this.computeNextStep(
      pendingDecisions,
      pendingEvents,
      pendingMeetings,
      pendingDeliverables,
      pendingEmails,
      completedSims,
      firstBadge,
    );

    // 7. Active simulations with KPIs
    const activeSims = await this.prisma.simulation.findMany({
      where: { userId, tenantId, status: 'IN_PROGRESS' },
      include: {
        project: { select: { name: true } },
        scenario: { select: { title: true } },
        kpis: true,
        phases: { orderBy: { order: 'asc' }, select: { order: true, name: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    const activeSimulationsList = activeSims.map((sim) => {
      const currentPhase = sim.phases.find((p) => p.status === 'ACTIVE');
      return {
        id: sim.id,
        projectName: sim.project.name,
        scenarioTitle: sim.scenario.title,
        currentPhase: sim.currentPhaseOrder,
        phaseName: currentPhase?.name ?? 'Inconnue',
        kpis: sim.kpis
          ? {
              budget: Math.round(sim.kpis.budget),
              schedule: Math.round(sim.kpis.schedule),
              quality: Math.round(sim.kpis.quality),
              morale: Math.round(sim.kpis.teamMorale),
              risk: Math.round(sim.kpis.riskLevel),
            }
          : null,
      };
    });

    // 8. Recent activity from domain events
    const recentEvents = await this.prisma.domainEvent.findMany({
      where: {
        tenantId,
        metadata: { path: ['actorId'], equals: userId },
      },
      orderBy: { occurredAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        aggregateType: true,
        aggregateId: true,
        data: true,
        occurredAt: true,
      },
    });

    const recentActivity = recentEvents.map((e) => ({
      id: e.id,
      type: e.type,
      aggregateType: e.aggregateType,
      aggregateId: e.aggregateId,
      data: e.data,
      occurredAt: e.occurredAt,
    }));

    // 9. Score evolution
    const scoreEvolution = completedSims.map((s) => ({
      simulationId: s.id,
      projectName: s.project.name,
      scenarioTitle: s.scenario.title,
      completedAt: s.completedAt,
      score: s.kpis
        ? Math.round(
            (s.kpis.budget * 0.25 +
              s.kpis.schedule * 0.25 +
              s.kpis.quality * 0.25 +
              s.kpis.teamMorale * 0.15 +
              (100 - s.kpis.riskLevel) * 0.1) *
              10,
          ) / 10
        : 0,
    }));

    return {
      user: {
        firstName: user?.firstName ?? '',
        profileCompleted: user?.profileCompleted ?? false,
      },
      stats: {
        activeSimulations,
        completedSimulations,
        totalSimulations,
        averageScore,
      },
      gettingStarted,
      nextStep,
      activeSimulations: activeSimulationsList,
      pendingActions,
      recentActivity,
      scoreEvolution,
    };
  }

  /**
   * Computes the most urgent next step for the user.
   * Priority: decisions > events > meetings > deliverables > emails > debriefing > all clear
   */
  private computeNextStep(
    pendingDecisions: Array<{ id: string; title: string; simulation: { id: string; project: { name: string } } }>,
    pendingEvents: Array<{ id: string; title: string; severity: string; simulation: { id: string; project: { name: string } } }>,
    pendingMeetings: Array<{ id: string; title: string; simulation: { id: string; project: { name: string } } }>,
    pendingDeliverables: Array<{ id: string; title: string; simulation: { id: string; project: { name: string } } }>,
    pendingEmails: Array<{ id: string; simulation: { id: string } }>,
    completedSims: Array<{ id: string; project: { name: string } }>,
    firstBadge: { id: string } | null,
  ) {
    if (pendingDecisions.length > 0) {
      const first = pendingDecisions[0]!;
      return {
        type: 'pending_decisions',
        count: pendingDecisions.length,
        simulationId: first.simulation.id,
        simulationName: first.simulation.project.name,
        link: `/simulations/${first.simulation.id}/decisions`,
      };
    }

    if (pendingEvents.length > 0) {
      const first = pendingEvents[0]!;
      return {
        type: 'pending_events',
        count: pendingEvents.length,
        simulationId: first.simulation.id,
        simulationName: first.simulation.project.name,
        link: `/simulations/${first.simulation.id}/events`,
      };
    }

    if (pendingMeetings.length > 0) {
      const first = pendingMeetings[0]!;
      return {
        type: 'pending_meetings',
        count: pendingMeetings.length,
        simulationId: first.simulation.id,
        simulationName: first.simulation.project.name,
        link: `/simulations/${first.simulation.id}/meetings`,
      };
    }

    if (pendingDeliverables.length > 0) {
      const first = pendingDeliverables[0]!;
      return {
        type: 'pending_deliverables',
        count: pendingDeliverables.length,
        simulationId: first.simulation.id,
        simulationName: first.simulation.project.name,
        link: `/simulations/${first.simulation.id}/deliverables`,
      };
    }

    if (pendingEmails.length > 0) {
      const first = pendingEmails[0]!;
      return {
        type: 'pending_emails',
        count: pendingEmails.length,
        simulationId: first.simulation.id,
        simulationName: '',
        link: `/simulations/${first.simulation.id}/emails`,
      };
    }

    // Debriefing available if completed sims exist but no badge yet
    if (completedSims.length > 0 && !firstBadge) {
      const first = completedSims[completedSims.length - 1]!;
      return {
        type: 'debriefing_available',
        count: 1,
        simulationId: first.id,
        simulationName: first.project.name,
        link: `/valorisation/${first.id}/debriefing`,
      };
    }

    return {
      type: 'all_clear',
      count: 0,
      simulationId: null,
      simulationName: null,
      link: null,
    };
  }

  @Cacheable({ key: 'dashboard:stats::arg0::arg1', ttl: 60 })
  async getStats(userId: string, tenantId: string) {
    const [active, completed, total] = await Promise.all([
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'COMPLETED' } }),
      this.prisma.simulation.count({ where: { userId, tenantId } }),
    ]);

    const completedSims = await this.prisma.simulation.findMany({
      where: { userId, tenantId, status: 'COMPLETED' },
      include: { kpis: true },
    });

    const avgScore =
      completedSims.length > 0
        ? completedSims.reduce((sum, s) => {
            if (!s.kpis) return sum;
            return (
              sum +
              s.kpis.budget * 0.25 +
              s.kpis.schedule * 0.25 +
              s.kpis.quality * 0.25 +
              s.kpis.teamMorale * 0.15 +
              (100 - s.kpis.riskLevel) * 0.1
            );
          }, 0) / completedSims.length
        : 0;

    const scoreEvolution = completedSims
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map((s) => ({
        simulationId: s.id,
        completedAt: s.completedAt,
        score: s.kpis
          ? Math.round(
              (s.kpis.budget * 0.25 +
                s.kpis.schedule * 0.25 +
                s.kpis.quality * 0.25 +
                s.kpis.teamMorale * 0.15 +
                (100 - s.kpis.riskLevel) * 0.1) *
                10,
            ) / 10
          : 0,
      }));

    return {
      stats: { active, completed, total, avgScore: Math.round(avgScore * 10) / 10 },
      scoreEvolution,
    };
  }

  @Cacheable({ key: 'dashboard:global::arg0::arg1', ttl: 60 })
  async getGlobalDashboard(userId: string, tenantId: string) {
    const [active, completed, total] = await Promise.all([
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'IN_PROGRESS' } }),
      this.prisma.simulation.count({ where: { userId, tenantId, status: 'COMPLETED' } }),
      this.prisma.simulation.count({ where: { userId, tenantId } }),
    ]);

    // Average score from completed simulations
    const completedSims = await this.prisma.simulation.findMany({
      where: { userId, tenantId, status: 'COMPLETED' },
      include: { kpis: true },
    });

    const avgScore =
      completedSims.length > 0
        ? completedSims.reduce((sum, s) => {
            if (!s.kpis) return sum;
            return (
              sum +
              s.kpis.budget * 0.25 +
              s.kpis.schedule * 0.25 +
              s.kpis.quality * 0.25 +
              s.kpis.teamMorale * 0.15 +
              (100 - s.kpis.riskLevel) * 0.1
            );
          }, 0) / completedSims.length
        : 0;

    // Recent activity from KPI snapshots + decisions + meetings
    const recentActivity = await this.getRecentActivity(userId, tenantId);

    // Next actions
    const nextActions = await this.getNextActions(userId, tenantId);

    // Active simulations (last 5)
    const activeSimulations = await this.prisma.simulation.findMany({
      where: { userId, tenantId, status: 'IN_PROGRESS' },
      include: {
        project: { select: { name: true } },
        kpis: true,
        scenario: { select: { title: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    });

    // Score evolution (completed simulations ordered by date)
    const scoreEvolution = completedSims
      .sort((a, b) => new Date(a.completedAt!).getTime() - new Date(b.completedAt!).getTime())
      .map((s) => ({
        simulationId: s.id,
        completedAt: s.completedAt,
        score: s.kpis
          ? Math.round(
              (s.kpis.budget * 0.25 +
                s.kpis.schedule * 0.25 +
                s.kpis.quality * 0.25 +
                s.kpis.teamMorale * 0.15 +
                (100 - s.kpis.riskLevel) * 0.1) *
                10,
            ) / 10
          : 0,
      }));

    return {
      stats: { active, completed, total, avgScore: Math.round(avgScore * 10) / 10 },
      recentActivity,
      nextActions,
      activeSimulations,
      scoreEvolution,
    };
  }

  private async getRecentActivity(userId: string, tenantId: string) {
    // Get recent decisions, meetings, and events across user's simulations
    const [recentDecisions, recentMeetings, recentEvents] = await Promise.all([
      this.prisma.decision.findMany({
        where: {
          simulation: { userId, tenantId },
          decidedAt: { not: null },
        },
        orderBy: { decidedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          decidedAt: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
      this.prisma.meeting.findMany({
        where: {
          simulation: { userId, tenantId },
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          completedAt: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
      this.prisma.randomEvent.findMany({
        where: {
          simulation: { userId, tenantId },
          resolvedAt: { not: null },
        },
        orderBy: { resolvedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          resolvedAt: true,
          severity: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
    ]);

    const activities = [
      ...recentDecisions.map((d) => ({
        type: 'decision' as const,
        title: d.title,
        date: d.decidedAt!,
        simulationId: d.simulation.id,
        projectName: d.simulation.project.name,
      })),
      ...recentMeetings.map((m) => ({
        type: 'meeting' as const,
        title: m.title,
        date: m.completedAt!,
        simulationId: m.simulation.id,
        projectName: m.simulation.project.name,
      })),
      ...recentEvents.map((e) => ({
        type: 'event' as const,
        title: e.title,
        date: e.resolvedAt!,
        simulationId: e.simulation.id,
        projectName: e.simulation.project.name,
      })),
    ];

    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
  }

  private async getNextActions(userId: string, tenantId: string) {
    const [pendingDecisions, scheduledMeetings, pendingEvents] = await Promise.all([
      this.prisma.decision.findMany({
        where: {
          simulation: { userId, tenantId, status: 'IN_PROGRESS' },
          selectedOption: null,
        },
        take: 5,
        select: {
          id: true,
          title: true,
          phaseOrder: true,
          timeLimitSeconds: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
      this.prisma.meeting.findMany({
        where: {
          simulation: { userId, tenantId, status: 'IN_PROGRESS' },
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
      this.prisma.randomEvent.findMany({
        where: {
          simulation: { userId, tenantId, status: 'IN_PROGRESS' },
          resolvedAt: null,
        },
        take: 5,
        select: {
          id: true,
          title: true,
          severity: true,
          simulation: { select: { id: true, project: { select: { name: true } } } },
        },
      }),
    ]);

    return {
      decisions: pendingDecisions.map((d) => ({
        type: 'decision' as const,
        id: d.id,
        title: d.title,
        simulationId: d.simulation.id,
        projectName: d.simulation.project.name,
        timeLimitSeconds: d.timeLimitSeconds,
      })),
      meetings: scheduledMeetings.map((m) => ({
        type: 'meeting' as const,
        id: m.id,
        title: m.title,
        status: m.status,
        simulationId: m.simulation.id,
        projectName: m.simulation.project.name,
      })),
      events: pendingEvents.map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        severity: e.severity,
        simulationId: e.simulation.id,
        projectName: e.simulation.project.name,
      })),
    };
  }

  async getTrainerDashboard(tenantId: string, filters?: { scenario?: string; period?: string }) {
    const simWhere: any = {};

    if (filters?.scenario) {
      simWhere.scenario = { title: { contains: filters.scenario, mode: 'insensitive' } };
    }

    if (filters?.period) {
      const now = new Date();
      if (filters.period === '7d') {
        simWhere.updatedAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      } else if (filters.period === '30d') {
        simWhere.updatedAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      } else if (filters.period === '90d') {
        simWhere.updatedAt = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
      }
    }

    const learners = await this.prisma.user.findMany({
      where: { tenantId, role: { in: ['MEMBER', 'VIEWER'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        simulations: {
          where: Object.keys(simWhere).length > 0 ? simWhere : undefined,
          include: { kpis: true, scenario: { select: { title: true } } },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    return learners.map((learner) => {
      const completedSims = learner.simulations.filter((s) => s.status === 'COMPLETED');
      const avgScore =
        completedSims.length > 0
          ? completedSims.reduce((sum, s) => {
              if (!s.kpis) return sum;
              return (
                sum +
                s.kpis.budget * 0.25 +
                s.kpis.schedule * 0.25 +
                s.kpis.quality * 0.25 +
                s.kpis.teamMorale * 0.15 +
                (100 - s.kpis.riskLevel) * 0.1
              );
            }, 0) / completedSims.length
          : 0;

      const alertCount = learner.simulations.filter(
        (s) => s.status === 'IN_PROGRESS' && s.kpis && (s.kpis.budget < 30 || s.kpis.schedule < 30 || s.kpis.quality < 30 || s.kpis.teamMorale < 30),
      ).length;

      return {
        id: learner.id,
        firstName: learner.firstName,
        lastName: learner.lastName,
        email: learner.email,
        avatar: learner.avatar,
        totalSimulations: learner.simulations.length,
        completedSimulations: completedSims.length,
        activeSimulations: learner.simulations.filter((s) => s.status === 'IN_PROGRESS').length,
        avgScore: Math.round(avgScore * 10) / 10,
        alertCount,
        lastSimulation: learner.simulations[0]
          ? {
              id: learner.simulations[0].id,
              status: learner.simulations[0].status,
              scenario: learner.simulations[0].scenario.title,
              updatedAt: learner.simulations[0].updatedAt,
            }
          : null,
      };
    });
  }
}
