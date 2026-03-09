import { Injectable, Inject, forwardRef, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType, CacheEvict } from '@sim360/core';
import { Prisma, SimulationStatus, TenantPlan } from '@prisma/client';
import { CreateSimulationDto } from '../dto/create-simulation.dto';
import { MakeDecisionDto } from '../dto/make-decision.dto';
import { RespondEventDto } from '../dto/respond-event.dto';
import { KpiEngineService, KpiImpact } from './kpi-engine.service';
import { SimulatedEmailsService } from '@/modules/simulated-emails/services/simulated-emails.service';
import { ProfileConfigService } from '@/modules/profile/services/profile-config.service';

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
  private readonly logger = new Logger(SimulationsService.name);

  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
    private kpiEngine: KpiEngineService,
    @Inject(forwardRef(() => SimulatedEmailsService))
    private simulatedEmailsService: SimulatedEmailsService,
    private profileConfigService: ProfileConfigService,
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

        // Notify user about pending decisions
        for (const tpl of firstPhase.decisionTemplates) {
          this.eventPublisher.publish(
            EventType.DECISION_PRESENTED,
            AggregateType.DECISION,
            simulation.id,
            { title: tpl.title, simulationId: simulation.id, phaseOrder: 0 },
            { actorId: userId, actorType: 'system', tenantId, receiverIds: [userId], channels: ['socket'], priority: 2 },
          ).catch(() => {});
        }
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

      // Create UserDeliverables from project template
      if (projectTemplate.deliverables && Array.isArray(projectTemplate.deliverables)) {
        const deliverableDefs = projectTemplate.deliverables as Array<{
          name: string;
          description?: string;
          phaseOrder: number;
          dueDate?: string;
          type?: string;
        }>;

        if (deliverableDefs.length > 0) {
          const deadlineDays = projectTemplate.deadlineDays ?? 180;
          await tx.userDeliverable.createMany({
            data: deliverableDefs.map((del) => ({
              simulationId: simulation.id,
              title: del.name,
              type: del.type ?? del.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
              phaseOrder: del.phaseOrder,
              dueDate: del.dueDate
                ? new Date(del.dueDate)
                : new Date(Date.now() + ((del.phaseOrder + 1) / scenario.phases.length) * deadlineDays * 24 * 60 * 60 * 1000),
            })),
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

    // US-5.1: Auto-generate welcome email from DRH
    this.simulatedEmailsService
      .generateWelcome(result.id, userId, tenantId)
      .catch((err) =>
        this.logger.warn(`Failed to generate welcome email for simulation ${result.id}: ${err.message}`),
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

        return { sim: finalSim, createdDecisionTitles: [] as string[], triggeredEventTitles: [] as Array<{ title: string; severity: string }> };
      }

      // Activate next phase
      await tx.simulationPhase.updateMany({
        where: { simulationId: id, order: nextPhaseOrder },
        data: { status: 'ACTIVE', startedAt: new Date() },
      });

      // Instantiate decisions for next phase
      const nextScenarioPhase = scenarioPhases.find((p) => p.order === nextPhaseOrder);
      const createdDecisionTitles: string[] = [];
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
        createdDecisionTitles.push(...nextScenarioPhase.decisionTemplates.map((t) => t.title));
      }

      // Evaluate and potentially trigger random events
      const kpis = simulation.kpis;
      const triggeredEventTitles: Array<{ title: string; severity: string }> = [];
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
          triggeredEventTitles.push(...eventsToCreate.map((t) => ({ title: t.title, severity: t.severity })));
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

      const sim = await tx.simulation.update({
        where: { id },
        data: { currentPhaseOrder: nextPhaseOrder },
        include: SIMULATION_INCLUDE,
      });

      return { sim, createdDecisionTitles, triggeredEventTitles };
    });

    // Notify current phase completed
    const completedPhase = simulation.phases.find((p) => p.order === simulation.currentPhaseOrder);
    if (completedPhase) {
      this.eventPublisher.publish(
        EventType.SIMULATION_PHASE_COMPLETED,
        AggregateType.SIMULATION,
        id,
        { phaseName: completedPhase.name, phaseOrder: completedPhase.order, simulationId: id },
        { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket', 'email'], priority: 2 },
      ).catch(() => {});
    }

    const eventType = result.sim.status === 'COMPLETED'
      ? EventType.SIMULATION_COMPLETED
      : EventType.SIMULATION_PHASE_ADVANCED;

    await this.eventPublisher.publish(
      eventType,
      AggregateType.SIMULATION,
      id,
      {
        status: result.sim.status,
        phaseOrder: result.sim.currentPhaseOrder,
        phaseName: nextPhase?.name ?? 'Terminee',
      },
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket'], priority: 2 },
    );

    // Notify about new decisions
    for (const title of result.createdDecisionTitles) {
      this.eventPublisher.publish(
        EventType.DECISION_PRESENTED,
        AggregateType.DECISION,
        id,
        { title, simulationId: id, phaseOrder: nextPhaseOrder },
        { actorId: userId, actorType: 'system', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket'], priority: 2 },
      ).catch(() => {});
    }

    // Notify about triggered random events
    for (const evt of result.triggeredEventTitles) {
      this.eventPublisher.publish(
        EventType.RANDOM_EVENT_TRIGGERED,
        AggregateType.RANDOM_EVENT,
        id,
        { title: evt.title, severity: evt.severity, simulationId: id, phaseOrder: nextPhaseOrder },
        { actorId: userId, actorType: 'system', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket'], priority: 3 },
      ).catch(() => {});
    }

    // US-5.6: Auto-generate simultaneous emails with different priorities for the new phase
    if (result.sim.status !== 'COMPLETED') {
      this.simulatedEmailsService
        .generateSimultaneousEmails(id, nextPhaseOrder, userId, simulation.tenantId)
        .catch((err) =>
          this.logger.warn(`Failed to generate simultaneous emails for phase ${nextPhaseOrder}: ${err.message}`),
        );

      // US-5.8: Generate change request email from client during Execution or Surveillance phases
      if (nextPhaseOrder >= 3 && nextPhaseOrder <= 4) {
        this.simulatedEmailsService
          .generateChangeRequest(id, userId, simulation.tenantId)
          .catch((err) =>
            this.logger.warn(`Failed to generate change request email: ${err.message}`),
          );
      }
    }

    return result.sim;
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
        // Sync Project.currentBudget from KPI percentage
        tx.project.update({
          where: { id: simulation.projectId },
          data: {
            currentBudget: Math.round(simulation.project.initialBudget * newKpis.budget / 100),
          },
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
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket'], priority: 1 },
    );

    // Check for critical KPIs and notify
    this.publishCriticalKpiAlerts(simulationId, newKpis, userId, simulation.tenantId);

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
        // Sync Project.currentBudget from KPI percentage
        tx.project.update({
          where: { id: simulation.projectId },
          data: {
            currentBudget: Math.round(simulation.project.initialBudget * newKpis.budget / 100),
          },
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
      { actorId: userId, actorType: 'user', tenantId: simulation.tenantId, receiverIds: [userId], channels: ['socket'], priority: 1 },
    );

    // Check for critical KPIs and notify
    this.publishCriticalKpiAlerts(simulationId, newKpis, userId, simulation.tenantId);

    return updatedEvent;
  }

  /**
   * US-6.3: Rollback a decision — reverse KPI impact and reset decision.
   * Allowed rollbacks depend on the user's profile type.
   */
  @CacheEvict({ pattern: 'dashboard:global:*' })
  async rollbackDecision(simulationId: string, decisionId: string, userId: string, tenantId: string) {
    const simulation = await this.findOne(simulationId, userId);
    if (simulation.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La simulation n\'est pas en cours');
    }

    const decision = await this.prisma.decision.findUnique({ where: { id: decisionId } });
    if (!decision || decision.simulationId !== simulationId) {
      throw new NotFoundException('Decision introuvable');
    }
    if (decision.selectedOption === null) {
      throw new BadRequestException('Cette decision n\'a pas encore ete prise');
    }

    // Check profile-based rollback limit
    const adaptation = await this.profileConfigService.getAdaptationForUser(userId, tenantId);
    if (adaptation.maxRollbacks <= 0) {
      throw new ForbiddenException('Votre profil ne permet pas de revenir sur vos decisions');
    }

    // Count existing rollbacks for this simulation (stored as KPI snapshots with trigger 'rollback')
    const rollbackCount = await this.prisma.simulationKpiSnapshot.count({
      where: { simulationId, trigger: 'rollback' },
    });

    if (rollbackCount >= adaptation.maxRollbacks) {
      throw new ForbiddenException(
        `Vous avez atteint le nombre maximum de retours en arriere (${adaptation.maxRollbacks})`,
      );
    }

    // Reverse the KPI impact
    const kpiImpact = (decision.kpiImpact as KpiImpact) ?? {};
    const reversedImpact: KpiImpact = {};
    if (kpiImpact.budget !== undefined) reversedImpact.budget = -kpiImpact.budget;
    if (kpiImpact.schedule !== undefined) reversedImpact.schedule = -kpiImpact.schedule;
    if (kpiImpact.quality !== undefined) reversedImpact.quality = -kpiImpact.quality;
    if (kpiImpact.teamMorale !== undefined) reversedImpact.teamMorale = -kpiImpact.teamMorale;
    if (kpiImpact.riskLevel !== undefined) reversedImpact.riskLevel = -kpiImpact.riskLevel;

    const currentKpis = simulation.kpis!;
    const newKpis = this.kpiEngine.applyImpact(
      {
        budget: currentKpis.budget,
        schedule: currentKpis.schedule,
        quality: currentKpis.quality,
        teamMorale: currentKpis.teamMorale,
        riskLevel: currentKpis.riskLevel,
      },
      reversedImpact,
    );

    const updatedDecision = await this.prisma.$transaction(async (tx) => {
      const [dec] = await Promise.all([
        tx.decision.update({
          where: { id: decisionId },
          data: {
            selectedOption: null,
            decidedAt: null,
            kpiImpact: Prisma.DbNull,
          },
        }),
        tx.simulationKpi.update({
          where: { simulationId },
          data: newKpis,
        }),
        // Sync Project.currentBudget from KPI percentage
        tx.project.update({
          where: { id: simulation.projectId },
          data: {
            currentBudget: Math.round(simulation.project.initialBudget * newKpis.budget / 100),
          },
        }),
      ]);
      await this.recordKpiSnapshot(tx, simulationId, simulation.currentPhaseOrder, 'rollback', decisionId);
      return dec;
    });

    await this.eventPublisher.publish(
      EventType.DECISION_ROLLBACK,
      AggregateType.DECISION,
      decisionId,
      {
        simulationId,
        title: decision.title,
        rollbackNumber: rollbackCount + 1,
        maxRollbacks: adaptation.maxRollbacks,
      },
      { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 2 },
    );

    // Publish KPI update for real-time
    await this.eventPublisher.publish(
      EventType.KPI_UPDATED,
      AggregateType.SIMULATION,
      simulationId,
      { simulationId, kpis: newKpis },
      { actorId: userId, actorType: 'user', tenantId, receiverIds: [userId], channels: ['socket'], priority: 1 },
    );

    return {
      decision: updatedDecision,
      rollbacksUsed: rollbackCount + 1,
      rollbacksRemaining: adaptation.maxRollbacks - rollbackCount - 1,
    };
  }

  async getCounts(id: string, userId: string, tenantId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        tenantId: true,
        status: true,
        currentPhaseOrder: true,
        project: { select: { name: true } },
      },
    });

    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.tenantId !== tenantId) throw new ForbiddenException('Acces refuse');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    const [
      pendingDecisions,
      pendingEvents,
      pendingMeetings,
      unreadEmails,
      pendingDeliverables,
    ] = await Promise.all([
      this.prisma.decision.count({
        where: { simulationId: id, selectedOption: null },
      }),
      this.prisma.randomEvent.count({
        where: { simulationId: id, resolvedAt: null },
      }),
      this.prisma.meeting.count({
        where: {
          simulationId: id,
          phaseOrder: simulation.currentPhaseOrder,
          status: 'SCHEDULED',
        },
      }),
      this.prisma.simulatedEmail.count({
        where: { simulationId: id, status: 'UNREAD' },
      }),
      this.prisma.userDeliverable.count({
        where: {
          simulationId: id,
          status: { in: ['DRAFT', 'REVISED'] },
        },
      }),
    ]);

    return {
      simulationId: id,
      pendingDecisions,
      pendingEvents,
      pendingMeetings,
      unreadEmails,
      pendingDeliverables,
      simulationStatus: simulation.status,
      currentPhase: simulation.currentPhaseOrder,
      projectName: simulation.project.name,
    };
  }

  async getKpiHistory(id: string, userId: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    const snapshots = await this.prisma.simulationKpiSnapshot.findMany({
      where: { simulationId: id },
      orderBy: { takenAt: 'asc' },
    });

    // Enrich snapshots with inflection point data (link to decision/event that triggered the change)
    const enriched = await Promise.all(
      snapshots.map(async (snap) => {
        let triggerInfo: { type: string; title: string; id: string } | null = null;

        if (snap.trigger === 'decision' && snap.triggerId) {
          const decision = await this.prisma.decision.findUnique({
            where: { id: snap.triggerId },
            select: { id: true, title: true },
          });
          if (decision) triggerInfo = { type: 'decision', title: decision.title, id: decision.id };
        } else if (snap.trigger === 'event' && snap.triggerId) {
          const evt = await this.prisma.randomEvent.findUnique({
            where: { id: snap.triggerId },
            select: { id: true, title: true },
          });
          if (evt) triggerInfo = { type: 'event', title: evt.title, id: evt.id };
        } else if (snap.trigger === 'meeting' && snap.triggerId) {
          const meeting = await this.prisma.meeting.findUnique({
            where: { id: snap.triggerId },
            select: { id: true, title: true },
          });
          if (meeting) triggerInfo = { type: 'meeting', title: meeting.title, id: meeting.id };
        }

        return { ...snap, triggerInfo };
      }),
    );

    return enriched;
  }

  async getSimulationDashboard(id: string, userId: string) {
    const simulation = await this.findOne(id, userId);
    const kpis = simulation.kpis;
    const currentPhase = simulation.phases.find((p) => p.order === simulation.currentPhaseOrder);
    const totalPhases = simulation.phases.length;

    // KPI gauges with thresholds
    const kpiGauges = kpis
      ? {
          budget: { value: kpis.budget, critical: kpis.budget < 30 },
          schedule: { value: kpis.schedule, critical: kpis.schedule < 30 },
          quality: { value: kpis.quality, critical: kpis.quality < 30 },
          teamMorale: { value: kpis.teamMorale, critical: kpis.teamMorale < 30 },
          riskLevel: { value: kpis.riskLevel, warning: kpis.riskLevel > 70 },
        }
      : null;

    // Global score
    const globalScore = kpis
      ? Math.round(
          (kpis.budget * 0.25 +
            kpis.schedule * 0.25 +
            kpis.quality * 0.25 +
            kpis.teamMorale * 0.15 +
            (100 - kpis.riskLevel) * 0.1) *
            10,
        ) / 10
      : 0;

    // Pending actions
    const pendingDecisions = simulation.decisions.filter((d) => d.selectedOption === null);
    const pendingEvents = simulation.randomEvents.filter((e) => !e.resolvedAt);
    const scheduledMeetings = simulation.meetings.filter(
      (m) => m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS',
    );

    // Recent activity (last 5 events from timeline)
    const recentTimeline = await this.getTimeline(id, userId);

    // Phase progression
    const phaseProgression = simulation.phases.map((p) => ({
      order: p.order,
      name: p.name,
      status: p.status,
      type: p.type,
    }));

    // Critical alerts
    const criticalAlerts: string[] = [];
    if (kpis) {
      if (kpis.budget < 30) criticalAlerts.push(`Budget critique (${Math.round(kpis.budget)}%)`);
      if (kpis.schedule < 30) criticalAlerts.push(`Delai critique (${Math.round(kpis.schedule)}%)`);
      if (kpis.quality < 30) criticalAlerts.push(`Qualite critique (${Math.round(kpis.quality)}%)`);
      if (kpis.teamMorale < 30) criticalAlerts.push(`Moral equipe critique (${Math.round(kpis.teamMorale)}%)`);
      if (kpis.riskLevel > 70) criticalAlerts.push(`Niveau de risque eleve (${Math.round(kpis.riskLevel)}%)`);
    }

    return {
      simulationId: id,
      status: simulation.status,
      scenarioTitle: simulation.scenario.title,
      projectName: simulation.project.name,
      globalScore,
      kpiGauges,
      currentPhase: currentPhase
        ? { order: currentPhase.order, name: currentPhase.name, type: currentPhase.type }
        : null,
      phaseProgression,
      totalPhases,
      pendingActions: {
        decisions: pendingDecisions.map((d) => ({ id: d.id, title: d.title, timeLimitSeconds: d.timeLimitSeconds })),
        events: pendingEvents.map((e) => ({ id: e.id, title: e.title, severity: e.severity })),
        meetings: scheduledMeetings.map((m) => ({ id: m.id, title: m.title, status: m.status })),
      },
      criticalAlerts,
      recentTimeline: recentTimeline.slice(0, 5),
    };
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

  private publishCriticalKpiAlerts(
    simulationId: string,
    kpis: { budget: number; schedule: number; quality: number; teamMorale: number; riskLevel: number },
    userId: string,
    tenantId: string,
  ) {
    const checks: Array<{ kpiName: string; value: number; critical: boolean }> = [
      { kpiName: 'Budget', value: kpis.budget, critical: kpis.budget < 30 },
      { kpiName: 'Delai', value: kpis.schedule, critical: kpis.schedule < 30 },
      { kpiName: 'Qualite', value: kpis.quality, critical: kpis.quality < 30 },
      { kpiName: 'Moral equipe', value: kpis.teamMorale, critical: kpis.teamMorale < 30 },
      { kpiName: 'Risque', value: kpis.riskLevel, critical: kpis.riskLevel > 70 },
    ];

    for (const check of checks) {
      if (check.critical) {
        this.eventPublisher.publish(
          EventType.KPI_CRITICAL,
          AggregateType.SIMULATION,
          simulationId,
          { simulationId, kpiName: check.kpiName, value: Math.round(check.value) },
          { actorId: 'system', actorType: 'system', tenantId, receiverIds: [userId], channels: ['socket'], priority: 3 },
        ).catch(() => {});
      }
    }
  }
}
