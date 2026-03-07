import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { CampaignStatus } from '@prisma/client';
import { CreateCampaignDto, UpdateCampaignDto, QueryCampaignsDto } from '../dto';

@Injectable()
export class RecruitmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  private generateSlug(title: string): string {
    const base = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const random = Math.random().toString(36).substring(2, 8);
    return `${base}-${random}`;
  }

  async create(tenantId: string, recruiterId: string, dto: CreateCampaignDto) {
    const slug = this.generateSlug(dto.title);

    const campaign = await this.prisma.recruitmentCampaign.create({
      data: {
        tenantId,
        recruiterId,
        title: dto.title,
        slug,
        jobTitle: dto.jobTitle,
        jobDescription: dto.jobDescription,
        requiredSkills: dto.requiredSkills as any,
        experienceLevel: dto.experienceLevel,
        projectTypes: dto.projectTypes,
        culture: dto.culture,
        cultureDescription: dto.cultureDescription,
        maxCandidates: dto.maxCandidates,
      },
    });

    await this.eventPublisher.publish(
      EventType.CAMPAIGN_CREATED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      campaign.id,
      { title: campaign.title, slug: campaign.slug },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
    );

    return campaign;
  }

  async findAll(tenantId: string, recruiterId: string, query: QueryCampaignsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { tenantId, recruiterId };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { jobTitle: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.recruitmentCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { candidateResults: true } },
        },
      }),
      this.prisma.recruitmentCampaign.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, tenantId: string) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { id },
      include: {
        _count: { select: { candidateResults: true } },
        generatedScenario: {
          select: { id: true, title: true, difficulty: true, sector: true },
        },
      },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    if (campaign.tenantId !== tenantId) throw new ForbiddenException('Acces refuse');
    return campaign;
  }

  async update(id: string, tenantId: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOne(id, tenantId);
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Seule une campagne en brouillon peut etre modifiee');
    }

    const updated = await this.prisma.recruitmentCampaign.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.jobTitle && { jobTitle: dto.jobTitle }),
        ...(dto.jobDescription && { jobDescription: dto.jobDescription }),
        ...(dto.requiredSkills && { requiredSkills: dto.requiredSkills as any }),
        ...(dto.experienceLevel && { experienceLevel: dto.experienceLevel }),
        ...(dto.projectTypes && { projectTypes: dto.projectTypes }),
        ...(dto.culture !== undefined && { culture: dto.culture }),
        ...(dto.cultureDescription !== undefined && { cultureDescription: dto.cultureDescription }),
        ...(dto.maxCandidates !== undefined && { maxCandidates: dto.maxCandidates }),
      },
    });

    return updated;
  }

  async publish(id: string, tenantId: string, recruiterId: string) {
    const campaign = await this.findOne(id, tenantId);
    if (campaign.status !== CampaignStatus.DRAFT) {
      throw new BadRequestException('Seule une campagne en brouillon peut etre publiee');
    }
    if (!campaign.generatedScenarioId) {
      throw new BadRequestException('Le scenario doit etre genere avant la publication');
    }

    const updated = await this.prisma.recruitmentCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.ACTIVE,
        publishedAt: new Date(),
      },
    });

    await this.eventPublisher.publish(
      EventType.CAMPAIGN_PUBLISHED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      id,
      { title: updated.title, slug: updated.slug },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket', 'email'], priority: 2 },
    );

    return updated;
  }

  async close(id: string, tenantId: string, recruiterId: string) {
    const campaign = await this.findOne(id, tenantId);
    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Seule une campagne active peut etre fermee');
    }

    const updated = await this.prisma.recruitmentCampaign.update({
      where: { id },
      data: {
        status: CampaignStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    await this.eventPublisher.publish(
      EventType.CAMPAIGN_CLOSED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      id,
      { title: updated.title },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 2 },
    );

    return updated;
  }

  async archive(id: string, tenantId: string, recruiterId: string) {
    const campaign = await this.findOne(id, tenantId);
    if (campaign.status !== CampaignStatus.CLOSED) {
      throw new BadRequestException('Seule une campagne fermee peut etre archivee');
    }

    const updated = await this.prisma.recruitmentCampaign.update({
      where: { id },
      data: { status: CampaignStatus.ARCHIVED },
    });

    await this.eventPublisher.publish(
      EventType.CAMPAIGN_ARCHIVED,
      AggregateType.RECRUITMENT_CAMPAIGN,
      id,
      { title: updated.title },
      { actorId: recruiterId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
    );

    return updated;
  }

  async listCandidates(
    campaignId: string,
    tenantId: string,
    page = 1,
    limit = 20,
  ) {
    await this.findOne(campaignId, tenantId);

    const skip = (page - 1) * limit;
    const where = { campaignId };

    const [data, total] = await Promise.all([
      this.prisma.candidateResult.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
          simulation: {
            select: {
              id: true,
              status: true,
              currentPhaseOrder: true,
              kpis: true,
            },
          },
        },
      }),
      this.prisma.candidateResult.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCandidateReport(campaignId: string, candidateId: string, tenantId: string) {
    await this.findOne(campaignId, tenantId);

    const candidate = await this.prisma.candidateResult.findUnique({
      where: { id: candidateId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
        simulation: {
          include: {
            kpis: true,
            decisions: { orderBy: { phaseOrder: 'asc' as const } },
            randomEvents: { orderBy: { phaseOrder: 'asc' as const } },
            meetings: {
              include: {
                summary: true,
                _count: { select: { messages: true } },
              },
            },
            phases: { orderBy: { order: 'asc' as const } },
          },
        },
        campaign: {
          select: { id: true, title: true, jobTitle: true, requiredSkills: true },
        },
      },
    });

    if (!candidate) throw new NotFoundException('Candidat introuvable');
    if (candidate.campaignId !== campaignId) {
      throw new BadRequestException('Ce candidat n\'appartient pas a cette campagne');
    }

    return candidate;
  }

  async getDashboard(campaignId: string, tenantId: string) {
    const campaign = await this.findOne(campaignId, tenantId);

    const [
      totalCandidates,
      pendingCount,
      inProgressCount,
      completedCount,
      abandonedCount,
      candidateScores,
    ] = await Promise.all([
      this.prisma.candidateResult.count({ where: { campaignId } }),
      this.prisma.candidateResult.count({ where: { campaignId, status: 'PENDING' } }),
      this.prisma.candidateResult.count({ where: { campaignId, status: 'IN_PROGRESS' } }),
      this.prisma.candidateResult.count({ where: { campaignId, status: 'COMPLETED' } }),
      this.prisma.candidateResult.count({ where: { campaignId, status: 'ABANDONED' } }),
      this.prisma.candidateResult.findMany({
        where: { campaignId, status: 'COMPLETED', globalScore: { not: null } },
        select: { globalScore: true },
      }),
    ]);

    const scores = candidateScores.map((c) => c.globalScore!);
    const averageScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null;
    const completionRate = totalCandidates > 0
      ? Math.round((completedCount / totalCandidates) * 100)
      : 0;

    return {
      campaignId,
      title: campaign.title,
      status: campaign.status,
      slug: campaign.slug,
      maxCandidates: campaign.maxCandidates,
      publishedAt: campaign.publishedAt,
      closedAt: campaign.closedAt,
      stats: {
        totalCandidates,
        byStatus: {
          pending: pendingCount,
          inProgress: inProgressCount,
          completed: completedCount,
          abandoned: abandonedCount,
        },
        completionRate,
        averageScore,
      },
    };
  }

  async findBySlug(slug: string) {
    const campaign = await this.prisma.recruitmentCampaign.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        jobTitle: true,
        jobDescription: true,
        requiredSkills: true,
        experienceLevel: true,
        projectTypes: true,
        culture: true,
        cultureDescription: true,
        maxCandidates: true,
        publishedAt: true,
        _count: { select: { candidateResults: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campagne introuvable');
    return campaign;
  }
}
