import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { Cacheable } from '@sim360/core';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

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
