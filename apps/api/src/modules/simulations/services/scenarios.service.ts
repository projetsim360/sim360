import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { Difficulty, Sector, TenantPlan, PhaseType, ScenarioType } from '@prisma/client';
import { CreateScenarioDto } from '../dto/create-scenario.dto';
import { UpdateScenarioDto } from '../dto/update-scenario.dto';
import { GenerateScenarioDto } from '../dto/generate-scenario.dto';
import { ScenarioGenerationAiService } from '../../ai/services/scenario-generation-ai.service';

@Injectable()
export class ScenariosService {
  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
    private scenarioGenerationService: ScenarioGenerationAiService,
  ) {}

  async findAll(filters: { sector?: Sector; difficulty?: Difficulty; plan?: TenantPlan; scenarioType?: ScenarioType }) {
    const where: Record<string, unknown> = { isPublished: true, isArchived: false };
    if (filters.sector) where.sector = filters.sector;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.plan) where.requiredPlan = filters.plan;
    if (filters.scenarioType) where.scenarioType = filters.scenarioType;

    return this.prisma.scenario.findMany({
      where,
      include: {
        phases: { orderBy: { order: 'asc' }, select: { id: true, name: true, type: true, order: true } },
        _count: { select: { simulations: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const scenario = await this.prisma.scenario.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            meetingTemplates: true,
            decisionTemplates: true,
            randomEventTemplates: true,
          },
        },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!scenario) throw new NotFoundException('Scenario introuvable');
    return scenario;
  }

  async create(userId: string, dto: CreateScenarioDto) {
    const scenario = await this.prisma.scenario.create({
      data: {
        title: dto.title,
        description: dto.description,
        objectives: dto.objectives ?? [],
        sector: dto.sector,
        difficulty: dto.difficulty,
        estimatedDurationHours: dto.estimatedDurationHours ?? 4,
        scenarioType: dto.scenarioType ?? 'GREENFIELD',
        startingPhaseOrder: dto.startingPhaseOrder ?? 0,
        brownfieldContext: dto.brownfieldContext ? (dto.brownfieldContext as any) : undefined,
        competencies: dto.competencies ?? [],
        projectTemplate: dto.projectTemplate as any,
        initialKpis: dto.initialKpis as any,
        createdById: userId,
        phases: {
          create: dto.phases.map((phase, index) => ({
            order: index,
            name: phase.name,
            description: phase.description,
            type: phase.type as PhaseType,
            durationDays: phase.durationDays,
            completionCriteria: (phase.completionCriteria ?? {}) as any,
            meetingTemplates: phase.meetingTemplates ? { create: phase.meetingTemplates as any[] } : undefined,
            decisionTemplates: phase.decisionTemplates ? { create: phase.decisionTemplates as any[] } : undefined,
            randomEventTemplates: phase.randomEventTemplates ? { create: phase.randomEventTemplates as any[] } : undefined,
          })),
        },
      },
      include: { phases: { orderBy: { order: 'asc' } } },
    });

    await this.eventPublisher.publish(
      EventType.SCENARIO_CREATED,
      AggregateType.SCENARIO,
      scenario.id,
      { title: scenario.title, sector: scenario.sector, difficulty: scenario.difficulty },
      { actorId: userId, actorType: 'user', channels: ['socket'], priority: 1 },
    );

    return scenario;
  }

  async update(id: string, dto: UpdateScenarioDto) {
    const existing = await this.prisma.scenario.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Scenario introuvable');

    const { phases, ...data } = dto;

    return this.prisma.scenario.update({
      where: { id },
      data: data as any,
      include: { phases: { orderBy: { order: 'asc' } } },
    });
  }

  async generateWithAi(userId: string, tenantId: string, dto: GenerateScenarioDto) {
    // Load user profile if requested
    let profileData: Record<string, unknown> = {};
    if (dto.useProfile) {
      const profile = await this.prisma.userProfile.findFirst({
        where: { userId },
      });
      if (profile) {
        profileData = {
          profileType: profile.profileType,
          sector: profile.selectedSector || profile.suggestedSector,
          skills: profile.skills,
          ...((profile.customProjectData as Record<string, unknown>) ?? {}),
        };
      }
    }

    return this.scenarioGenerationService.generateAndSave(
      userId,
      {
        ...profileData,
        projectName: dto.projectName,
        projectDescription: dto.projectDescription,
        constraints: dto.constraints,
        learningObjectives: dto.learningObjectives,
        sector: dto.sector,
        difficulty: dto.difficulty,
        scenarioType: dto.scenarioType,
      },
      { tenantId, userId, operation: 'scenario_generation' },
    );
  }

  async getRecommended(userId: string, limit = 5) {
    const validSectors = ['IT', 'CONSTRUCTION', 'MARKETING', 'HEALTHCARE', 'FINANCE', 'CUSTOM'];
    const validDifficulties = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    let profile: { selectedSector?: string | null; suggestedSector?: string | null; profileType?: string | null } | null = null;
    try {
      profile = await this.prisma.userProfile.findFirst({
        where: { userId },
        select: { selectedSector: true, suggestedSector: true, profileType: true },
      });
    } catch {
      // No profile — return general recommendations
    }

    const where: Record<string, unknown> = { isPublished: true, isArchived: false };

    const sector = profile?.selectedSector || profile?.suggestedSector;
    if (sector && validSectors.includes(sector)) {
      where.sector = sector;
    }

    if (profile?.profileType) {
      const difficultyMap: Record<string, string> = {
        ZERO_EXPERIENCE: 'BEGINNER',
        BEGINNER: 'BEGINNER',
        RECONVERSION: 'INTERMEDIATE',
        REINFORCEMENT: 'ADVANCED',
      };
      const difficulty = difficultyMap[profile.profileType];
      if (difficulty && validDifficulties.includes(difficulty)) {
        where.difficulty = difficulty;
      }
    }

    return this.prisma.scenario.findMany({
      where,
      include: {
        phases: {
          orderBy: { order: 'asc' },
          select: { id: true, name: true, type: true, order: true },
        },
        _count: { select: { simulations: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
