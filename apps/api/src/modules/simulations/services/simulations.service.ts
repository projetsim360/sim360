import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType, CacheEvict } from '@sim360/core';
import { SimulationStatus, TenantPlan } from '@prisma/client';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { MakeDecisionDto } from '../dto/make-decision.dto';
import { RespondEventDto } from '../dto/respond-event.dto';
import { KpiEngineService, KpiImpact } from './kpi-engine.service';

const PLAN_LIMITS: Record<TenantPlan, number> = {
  FREE: 1,
  STARTER: 3,
  PRO: 10,
  ENTERPRISE: Infinity,
};

const SIMULATION_INCLUDE = {
  project: {
    include: {
      teamMembers: true,
      deliverables: true,
    },
  },
  scenario: { select: { id: true, title: true, difficulty: true, sector: true } },
  kpis: true,
  phases: { orderBy: { order: 'asc' as const } },
  decisions: { orderBy: { phaseOrder: 'asc' as const } },
  randomEvents: { orderBy: { phaseOrder: 'asc' as const } },
  meetings: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      participants: true,
      summary: true,
      _count: { select: { messages: true } },
    },
  },
};

@Injectable()
export class SimulationsService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
    private kpiEngine: KpiEngineService,
  ) {}

  private async recordKpiSnapshot(
    tx: any,
    simulationId: string,
    phaseOrder: number,
    trigger: string,
    triggerId?: string,
  ) {
    const kpis = await tx.simulationKpi.findUnique({ where: { simulationId } });
    if (!kpis) return;
    await tx.simulationKpiSnapshot.create({
      data: {
        simulationId,
        phaseOrder,
        trigger,
        triggerId,
        budget: kpis.budget,
        schedule: kpis.schedule,
        quality: kpis.quality,
        teamMorale: kpis.teamMorale,
        riskLevel: kpis.riskLevel,
      },
    });
  }

  async create(userId: string, tenantId: string, dto: CreateSimulationDto) {
    // 1. Check plan limits
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant introuvable');

    const activeCount = await this.prisma.simulation.count({
      where: { userId, tenantId, status: { in: ['DRAFT', 'IN_PROGRESS', 'PAUSED'] } },
    });

    const limit = PLAN_LIMITS[tenant.plan];
    if (activeCount >= limit) {
      throw new ForbiddenException(`Limite de simulations atteinte pour votre plan (${limit})`);
    }

    // 2. Load scenario with all templates
    const scenario = await this.prisma.scenario.findUnique({
      where: { id: dto.scenarioId },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            meetingTemplates: true,
            decisionTemplates: true,
            randomEventTemplates: true,
          },
        },
      },
    });

    if (!scenario) throw new NotFoundException('Scenario introuvable');
    if (!scenario.isPublished) throw new BadRequestException('Ce scenario n\'est pas encore disponible');

    const projectTemplate = scenario.projectTemplate as Record<string, any>;
    const initialKpis = scenario.initialKpis as Record<string, number>;

    // 3. Create everything in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create Project
      const project = await tx.project.create({
        data: {
          tenantId,
          userId,
          name: projectTemplate.name ?? scenario.title,
          client: projectTemplate.client,
          sector: scenario.sector,
          description: projectTemplate.description,
          initialBudget: projectTemplate.initialBudget ?? 100000,
          currentBudget: projectTemplate.initialBudget ?? 100000,
          deadline: new Date(Date.now() + (projectTemplate.deadlineDays ?? 180) * 24 * 60 * 60 * 1000),
          status: 'NOT_STARTED',
          teamMembers: projectTemplate.team
            ? {
                create: (projectTemplate.team as any[]).map((member: any, index: number) => ({
                  name: member.name,
                  role: member.role,
                  expertise: member.expertise ?? 'INTERMEDIATE',
                  personality: member.personality ?? 'COOPERATIVE',
                  availability: member.availability ?? 1.0,
                  morale: member.morale ?? 75,
                  avatar: member.avatar ?? `/media/avatars/300-${(index % 36) + 1}.png`,
                })),
              }
            : undefined,
          deliverables: projectTemplate.deliverables
            ? {
                create: (projectTemplate.deliverables as any[]).map((del: any) => ({
                  name: del.name,
                  description: del.description,
                  phaseOrder: del.phaseOrder,
                  dueDate: del.dueDate ? new Date(del.dueDate) : undefined,
                })),
              }
            : undefined,
        },
      });

      // Create Simulation
      const simulation = await tx.simulation.create({
        data: {
          projectId: project.id,
          scenarioId: scenario.id,
          userId,
          tenantId,
          status: 'IN_PROGRESS',
          currentPhaseOrder: 0,
          startedAt: new Date(),
          kpis: {
            create: {
              budget: initialKpis.budget ?? 100,
              schedule: initialKpis.schedule ?? 100,
              quality: initialKpis.quality ?? 80,
              teamMorale: initialKpis.teamMorale ?? 75,
              riskLevel: initialKpis.riskLevel ?? 20,
            },
          },
          phases: {
            create: scenario.phases.map((phase) => ({
              order: phase.order,
              name: phase.name,
              type: phase.type,
              status: phase.order === 0 ? 'ACTIVE' : 'LOCKED',
              startedAt: phase.order === 0 ? new Date() : undefined,
            })),
          },
        },
      });

      // Instantiate decisions for phase 0
      const firstPhase = scenario.phases.find((p) => p.order === 0);
      if (firstPhase?.decisionTemplates.length) {
        await tx.decision.createMany({
          data: firstPhase.decisionTemplates.map((tpl) => ({
            simulationId: simulation.id,
            phaseOrder: 0,
            templateId: tpl.id,
            title: tpl.title,
            context: tpl.context,
            options: tpl.options as any,
            timeLimitSeconds: tpl.timeLimitSeconds,
          })),
        });
      }

      // Instantiate meetings for phase 0
      if (firstPhase?.meetingTemplates.length) {
        for (const tpl of firstPhase.meetingTemplates) {
          await tx.meeting.create({
            data: {
              simulationId: simulation.id,
              phaseOrder: 0,
              templateId: tpl.id,
              title: tpl.title,
              description: tpl.description,
              type: tpl.type,
              objectives: tpl.objectives,
              durationMinutes: tpl.durationMinutes,
              participants: {
                create: (tpl.participants as any[]).map((p: any, index: number) => ({
                  name: p.name,
                  role: p.role,
                  personality: p.personality,
                  cooperationLevel: p.cooperationLevel ?? 3,
                  avatar: p.avatar ?? `/media/avatars/300-${(index % 36) + 1}.png`,
                })),
              },
            },
          });
        }
      }

      // Record initial KPI snapshot
      await this.recordKpiSnapshot(tx, simulation.id, 0, 'simulation_start');

      // Update project status
      await tx.project.update({
        where: { id: project.id },
        data: { status: 'IN_PROGRESS' },
      });

      return simulation;
    });

    // Publish event
    await this.eventPublisher.publish(
      EventType.SIMULATION_CREATED,
      AggregateType.SIMULATION,
      result.id,
      { title: scenario.title, scenarioId: scenario.id },
      { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
    );

    return this.findOne(result.id, userId);
  }

  async findAll(userId: string, tenantId: string, status?: SimulationStatus) {
    const where: Record<string, unknown> = { userId, tenantId };
    if (status) where.status = status;

    return this.prisma.simulation.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, client: true, sector: true, status: true } },
        scenario: { select: { id: true, title: true, difficulty: true, sector: true } },
        kpis: true,
        phases: { orderBy: { order: 'asc' }, select: { order: true, name: true, type: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      include: SIMULATION_INCLUDE,
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');
    return simulation;
  }

  async pause(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);
    if (simulation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Seule une simulation en cours peut etre mise en pause');
    }

    const updated = await this.prisma.simulation.update({
      where: { id },
      data: { status: 'PAUSED' },
      include: SIMULATION_INCLUDE,
    });

    await this.eventPublisher.publish(
      EventType.SIMULATION_PAUSED,
      AggregateType.SIMULATION,
      id,
      { status: 'PAUSED' },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    return updated;
  }

  async resume(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);
    if (simulation.status !== 'PAUSED') {
      throw new BadRequestException('Seule une simulation en pause peut etre reprise');
    }

    const updated = await this.prisma.simulation.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: SIMULATION_INCLUDE,
    });

    await this.eventPublisher.publish(
      EventType.SIMULATION_RESUMED,
      AggregateType.SIMULATION,
      id,
      { status: 'IN_PROGRESS' },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    return updated;
  }

  @CacheEvict({ pattern: 'dashboard:global:*' })
  async advancePhase(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);
    if (simulation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La simulation n\'est pas en cours');
    }

    const currentPhase = simulation.phases.find((p) => p.order === simulation.currentPhaseOrder);
    if (!currentPhase) throw new BadRequestException('Phase courante introuvable');

    // Check all decisions in current phase are made
    const pendingDecisions = simulation.decisions.filter(
      (d) => d.phaseOrder === simulation.currentPhaseOrder && d.selectedOption === null,
    );
    if (pendingDecisions.length > 0) {
      throw new BadRequestException(`${pendingDecisions.length} decision(s) en attente dans cette phase`);
    }

    // Check all random events in current phase are resolved
    const pendingEvents = simulation.randomEvents.filter(
      (e) => e.phaseOrder === simulation.currentPhaseOrder && e.resolvedAt === null,
    );
    if (pendingEvents.length > 0) {
      throw new BadRequestException(`${pendingEvents.length} evenement(s) non resolu(s) dans cette phase`);
    }

    // Check all meetings in current phase are completed
    const pendingMeetings = simulation.meetings.filter(
      (m) => m.phaseOrder === simulation.currentPhaseOrder && m.status !== 'COMPLETED' && m.status !== 'CANCELLED',
    );
    if (pendingMeetings.length > 0) {
      throw new BadRequestException(`${pendingMeetings.length} reunion(s) non terminee(s) dans cette phase`);
    }

    // Check KPI thresholds — block if any critical KPI is at 0
    const kpis = simulation.kpis;
    if (kpis) {
      const criticalKpis: string[] = [];
      if (kpis.budget <= 0) criticalKpis.push('Budget');
      if (kpis.schedule <= 0) criticalKpis.push('Delai');
      if (kpis.quality <= 0) criticalKpis.push('Qualite');
      if (kpis.teamMorale <= 0) criticalKpis.push('Moral equipe');
      if (criticalKpis.length > 0) {
        throw new BadRequestException(`KPI(s) critique(s) a zero : ${criticalKpis.join(', ')}. Impossible d'avancer.`);
      }
    }

    const nextPhaseOrder = simulation.currentPhaseOrder + 1;
    const nextPhase = simulation.phases.find((p) => p.order === nextPhaseOrder);

    // Load scenario phase templates for next phase
    const scenarioPhases = await this.prisma.scenarioPhase.findMany({
      where: { scenarioId: simulation.scenarioId },
      include: { decisionTemplates: true, randomEventTemplates: true, meetingTemplates: true },
      orderBy: { order: 'asc' },
    });

    const result = await this.prisma.$transaction(async (tx) => {
      // Complete current phase
      await tx.simulationPhase.updateMany({
        where: { simulationId: id, order: simulation.currentPhaseOrder },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      // Record KPI snapshot for phase advance
      await this.recordKpiSnapshot(tx, id, nextPhaseOrder, 'phase_advance');

      if (!nextPhase) {
        // Simulation complete — no more phases
        const finalSim = await tx.simulation.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            totalDurationMinutes: simulation.startedAt
              ? Math.round((Date.now() - simulation.startedAt.getTime()) / 60000)
              : undefined,
          },
          include: SIMULATION_INCLUDE,
        });

        await tx.project.update({
          where: { id: simulation.projectId },
          data: { status: 'COMPLETED' },
        });

        return finalSim;
      }

      // Activate next phase
      await tx.simulationPhase.updateMany({
        where: { simulationId: id, order: nextPhaseOrder },
        data: { status: 'ACTIVE', startedAt: new Date() },
      });

      // Instantiate decisions for next phase
      const nextScenarioPhase = scenarioPhases.find((p) => p.order === nextPhaseOrder);
      if (nextScenarioPhase?.decisionTemplates.length) {
        await tx.decision.createMany({
          data: nextScenarioPhase.decisionTemplates.map((tpl) => ({
            simulationId: id,
            phaseOrder: nextPhaseOrder,
            templateId: tpl.id,
            title: tpl.title,
            context: tpl.context,
            options: tpl.options as any,
            timeLimitSeconds: tpl.timeLimitSeconds,
          })),
        });
      }

      // Evaluate and potentially trigger random events
      const kpis = simulation.kpis;
      if (kpis && nextScenarioPhase?.randomEventTemplates.length) {
        const kpiValues = {
          budget: kpis.budget,
          schedule: kpis.schedule,
          quality: kpis.quality,
          teamMorale: kpis.teamMorale,
          riskLevel: kpis.riskLevel,
        };

        const eventsToCreate = nextScenarioPhase.randomEventTemplates.filter((tpl) =>
          this.kpiEngine.shouldTriggerEvent(tpl.probability, kpiValues, tpl.triggerConditions as any),
        );

        if (eventsToCreate.length) {
          await tx.randomEvent.createMany({
            data: eventsToCreate.map((tpl) => ({
              simulationId: id,
              phaseOrder: nextPhaseOrder,
              templateId: tpl.id,
              type: tpl.type,
              title: tpl.title,
              description: tpl.description,
              severity: tpl.severity,
              options: tpl.options as any,
            })),
          });
        }
      }

      // Instantiate meetings for next phase
      if (nextScenarioPhase?.meetingTemplates.length) {
        for (const tpl of nextScenarioPhase.meetingTemplates) {
          await tx.meeting.create({
            data: {
              simulationId: id,
              phaseOrder: nextPhaseOrder,
              templateId: tpl.id,
              title: tpl.title,
              description: tpl.description,
              type: tpl.type,
              objectives: tpl.objectives,
              durationMinutes: tpl.durationMinutes,
              participants: {
                create: (tpl.participants as any[]).map((p: any, index: number) => ({
                  name: p.name,
                  role: p.role,
                  personality: p.personality,
                  cooperationLevel: p.cooperationLevel ?? 3,
                  avatar: p.avatar ?? `/media/avatars/300-${(index % 36) + 1}.png`,
                })),
              },
            },
          });
        }
      }

      return tx.simulation.update({
        where: { id },
        data: { currentPhaseOrder: nextPhaseOrder },
        include: SIMULATION_INCLUDE,
      });
    });

    const eventType = result.status === 'COMPLETED'
      ? EventType.SIMULATION_COMPLETED
      : EventType.SIMULATION_PHASE_ADVANCED;

    await this.eventPublisher.publish(
      eventType,
      AggregateType.SIMULATION,
      id,
      {
        status: result.status,
        phaseOrder: result.currentPhaseOrder,
        phaseName: nextPhase?.name ?? 'Terminee',
      },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 2 },
    );

    return result;
  }

  @CacheEvict({ pattern: 'dashboard:global:*' })
  async makeDecision(simulationId: string, decisionId: string, userId: string, dto: MakeDecisionDto) {
    const simulation = await this.findOne(simulationId, userId);
    if (simulation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La simulation n\'est pas en cours');
    }

    const decision = await this.prisma.decision.findUnique({ where: { id: decisionId } });
    if (!decision || decision.simulationId !== simulationId) {
      throw new NotFoundException('Decision introuvable');
    }
    if (decision.selectedOption !== null) {
      throw new BadRequestException('Cette decision a deja ete prise');
    }

    const options = decision.options as any[];
    if (dto.selectedOption >= options.length) {
      throw new BadRequestException('Option invalide');
    }

    const selectedImpact: KpiImpact = options[dto.selectedOption]?.kpiImpact ?? {};

    // Apply KPI impact
    const currentKpis = simulation.kpis!;
    const newKpis = this.kpiEngine.applyImpact(
      {
        budget: currentKpis.budget,
        schedule: currentKpis.schedule,
        quality: currentKpis.quality,
        teamMorale: currentKpis.teamMorale,
        riskLevel: currentKpis.riskLevel,
      },
      selectedImpact,
    );

    const updatedDecision = await this.prisma.$transaction(async (tx) => {
      const [dec] = await Promise.all([
        tx.decision.update({
          where: { id: decisionId },
          data: {
            selectedOption: dto.selectedOption,
            decidedAt: new Date(),
            kpiImpact: selectedImpact as any,
          },
        }),
        tx.simulationKpi.update({
          where: { simulationId },
          data: newKpis,
        }),
      ]);
      await this.recordKpiSnapshot(tx, simulationId, simulation.currentPhaseOrder, 'decision', decisionId);
      return dec;
    });

    await this.eventPublisher.publish(
      EventType.DECISION_MADE,
      AggregateType.DECISION,
      decisionId,
      {
        simulationId,
        title: decision.title,
        selectedOption: dto.selectedOption,
        kpiImpact: selectedImpact,
      },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    // Publish KPI update for real-time
    await this.eventPublisher.publish(
      EventType.KPI_UPDATED,
      AggregateType.SIMULATION,
      simulationId,
      { simulationId, kpis: newKpis },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    return updatedDecision;
  }

  @CacheEvict({ pattern: 'dashboard:global:*' })
  async respondToEvent(simulationId: string, eventId: string, userId: string, dto: RespondEventDto) {
    const simulation = await this.findOne(simulationId, userId);
    if (simulation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La simulation n\'est pas en cours');
    }

    const event = await this.prisma.randomEvent.findUnique({ where: { id: eventId } });
    if (!event || event.simulationId !== simulationId) {
      throw new NotFoundException('Evenement introuvable');
    }
    if (event.resolvedAt) {
      throw new BadRequestException('Cet evenement a deja ete resolu');
    }

    const options = event.options as any[];
    if (dto.selectedOption >= options.length) {
      throw new BadRequestException('Option invalide');
    }

    const selectedImpact: KpiImpact = options[dto.selectedOption]?.kpiImpact ?? {};

    const currentKpis = simulation.kpis!;
    const newKpis = this.kpiEngine.applyImpact(
      {
        budget: currentKpis.budget,
        schedule: currentKpis.schedule,
        quality: currentKpis.quality,
        teamMorale: currentKpis.teamMorale,
        riskLevel: currentKpis.riskLevel,
      },
      selectedImpact,
    );

    const updatedEvent = await this.prisma.$transaction(async (tx) => {
      const [evt] = await Promise.all([
        tx.randomEvent.update({
          where: { id: eventId },
          data: {
            selectedOption: dto.selectedOption,
            resolvedAt: new Date(),
            kpiImpact: selectedImpact as any,
          },
        }),
        tx.simulationKpi.update({
          where: { simulationId },
          data: newKpis,
        }),
      ]);
      await this.recordKpiSnapshot(tx, simulationId, simulation.currentPhaseOrder, 'event', eventId);
      return evt;
    });

    await this.eventPublisher.publish(
      EventType.RANDOM_EVENT_RESOLVED,
      AggregateType.RANDOM_EVENT,
      eventId,
      {
        simulationId,
        title: event.title,
        selectedOption: dto.selectedOption,
      },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    // Publish KPI update for real-time
    await this.eventPublisher.publish(
      EventType.KPI_UPDATED,
      AggregateType.SIMULATION,
      simulationId,
      { simulationId, kpis: newKpis },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, channels: ['socket'], priority: 1 },
    );

    return updatedEvent;
  }

  async getKpiHistory(id: string, userId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    return this.prisma.simulationKpiSnapshot.findMany({
      where: { simulationId: id },
      orderBy: { takenAt: 'asc' },
    });
  }

  async getKpis(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);
    return simulation.kpis;
  }

  async getTimeline(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);

    const timeline: Array<{ type: string; date: Date; title: string; data: Record<string, unknown> }> = [];

    // Phase changes
    for (const phase of simulation.phases) {
      if (phase.startedAt) {
        timeline.push({
          type: 'phase_started',
          date: phase.startedAt,
          title: `Phase "${phase.name}" demarree`,
          data: { phaseOrder: phase.order, phaseName: phase.name },
        });
      }
      if (phase.completedAt) {
        timeline.push({
          type: 'phase_completed',
          date: phase.completedAt,
          title: `Phase "${phase.name}" terminee`,
          data: { phaseOrder: phase.order, phaseName: phase.name },
        });
      }
    }

    // Decisions
    for (const decision of simulation.decisions) {
      if (decision.decidedAt) {
        timeline.push({
          type: 'decision_made',
          date: decision.decidedAt,
          title: decision.title,
          data: { decisionId: decision.id, selectedOption: decision.selectedOption, kpiImpact: decision.kpiImpact },
        });
      }
    }

    // Random events
    for (const event of simulation.randomEvents) {
      timeline.push({
        type: 'event_triggered',
        date: event.resolvedAt ?? new Date(),
        title: event.title,
        data: { eventId: event.id, severity: event.severity, resolved: !!event.resolvedAt },
      });
    }

    // Sort by date descending
    timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

    return timeline;
  }
}
