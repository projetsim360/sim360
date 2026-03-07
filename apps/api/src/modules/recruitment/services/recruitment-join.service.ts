import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { CampaignStatus } from '@prisma/client';

@Injectable()
export class RecruitmentJoinService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async joinCampaign(slug: string, userId: string, tenantId: string) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { slug },
      include: {
        _count: { select: { candidateResults: true } },
        generatedScenario: {
          select: { id: true },
        },
      },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Cette campagne n\'accepte plus de candidatures');
    }

    // Check capacity
    if (campaign.maxCandidates && campaign._count.candidateResults >= campaign.maxCandidates) {
      throw new ForbiddenException('Le nombre maximum de candidats a ete atteint');
    }

    // Check user hasn't already joined
    const existing = await this.prisma.candidateResult.findUnique({
      where: { campaignId_userId: { campaignId: campaign.id, userId } },
    });

    if (existing) {
      throw new BadRequestException('Vous avez deja rejoint cette campagne');
    }

    if (!campaign.generatedScenarioId) {
      throw new BadRequestException('Le scenario de cette campagne n\'est pas encore pret');
    }

    // Load the full scenario to create a simulation
    const scenario = await this.prisma.scenario.findUnique({
      where: { id: campaign.generatedScenarioId },
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

    const projectTemplate = scenario.projectTemplate as Record<string, any>;
    const initialKpis = scenario.initialKpis as Record<string, number>;

    // Create simulation + project + candidate result in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create project
      const project = await tx.project.create({
        data: {
          tenantId: campaign.tenantId,
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

      // Create simulation
      const simulation = await tx.simulation.create({
        data: {
          projectId: project.id,
          scenarioId: scenario.id,
          userId,
          tenantId: campaign.tenantId,
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

      // Update project status
      await tx.project.update({
        where: { id: project.id },
        data: { status: 'IN_PROGRESS' },
      });

      // Create candidate result
      const candidateResult = await tx.candidateResult.create({
        data: {
          campaignId: campaign.id,
          userId,
          simulationId: simulation.id,
          status: 'IN_PROGRESS',
          currentPhase: 0,
          startedAt: new Date(),
        },
      });

      return { simulation, candidateResult };
    });

    // Publish user info for event
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    await this.eventPublisher.publish(
      EventType.CANDIDATE_JOINED,
      AggregateType.CANDIDATE_RESULT,
      result.candidateResult.id,
      {
        candidateName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        campaignTitle: campaign.title,
        campaignId: campaign.id,
      },
      {
        actorId: userId,
        actorType: 'user',
        tenantId: campaign.tenantId,
        receiverIds: [campaign.recruiterId],
        channels: ['socket'],
        priority: 2,
      },
    );

    return {
      candidateResultId: result.candidateResult.id,
      simulationId: result.simulation.id,
      campaignTitle: campaign.title,
    };
  }
}
