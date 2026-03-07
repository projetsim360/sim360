import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { PhaseType, DeliverableTemplateDifficulty, Prisma } from '@prisma/client';
import { CreateDeliverableTemplateDto, UpdateDeliverableTemplateDto } from '../dto';

export interface DeliverableTemplateFilters {
  phase?: PhaseType;
  type?: string;
  difficulty?: DeliverableTemplateDifficulty;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class DeliverableTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateDeliverableTemplateDto) {
    const template = await this.prisma.deliverableTemplate.create({
      data: {
        tenantId,
        createdById: userId,
        title: dto.title,
        type: dto.type,
        phase: dto.phase,
        description: dto.description,
        content: dto.content,
        evaluationCriteria: dto.evaluationCriteria,
        pmiProcess: dto.pmiProcess,
        difficulty: dto.difficulty ?? DeliverableTemplateDifficulty.STANDARD,
        referenceExample: dto.referenceExample,
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_TEMPLATE_CREATED,
        AggregateType.DELIVERABLE_TEMPLATE,
        template.id,
        { title: template.title, type: template.type, phase: template.phase },
        { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
      )
      .catch(() => {});

    return template;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateDeliverableTemplateDto) {
    const existing = await this.prisma.deliverableTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Template de livrable introuvable');
    }

    // Save current version to history before updating
    await this.prisma.deliverableTemplateVersion.create({
      data: {
        templateId: existing.id,
        version: existing.version,
        title: existing.title,
        type: existing.type,
        phase: existing.phase,
        description: existing.description,
        content: existing.content,
        evaluationCriteria: existing.evaluationCriteria as Prisma.InputJsonValue,
        pmiProcess: existing.pmiProcess,
        difficulty: existing.difficulty,
        referenceExample: existing.referenceExample,
      },
    });

    // Update with incremented version
    const updated = await this.prisma.deliverableTemplate.update({
      where: { id },
      data: {
        ...dto,
        evaluationCriteria: dto.evaluationCriteria
          ? (dto.evaluationCriteria as Prisma.InputJsonValue)
          : undefined,
        version: existing.version + 1,
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_TEMPLATE_UPDATED,
        AggregateType.DELIVERABLE_TEMPLATE,
        updated.id,
        { title: updated.title, version: updated.version, previousVersion: existing.version },
        { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
      )
      .catch(() => {});

    return updated;
  }

  async toggle(tenantId: string, userId: string, id: string) {
    const existing = await this.prisma.deliverableTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Template de livrable introuvable');
    }

    const updated = await this.prisma.deliverableTemplate.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_TEMPLATE_TOGGLED,
        AggregateType.DELIVERABLE_TEMPLATE,
        updated.id,
        { title: updated.title, isActive: updated.isActive },
        { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
      )
      .catch(() => {});

    return updated;
  }

  async findAll(tenantId: string, filters: DeliverableTemplateFilters) {
    const {
      phase,
      type,
      difficulty,
      isActive,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Record<string, unknown> = { tenantId };
    if (phase) where.phase = phase;
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (isActive !== undefined) where.isActive = isActive;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.deliverableTemplate.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.deliverableTemplate.count({ where }),
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

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.deliverableTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template de livrable introuvable');
    }

    return template;
  }

  async findVersions(tenantId: string, id: string) {
    // Verify the template belongs to the tenant
    const template = await this.prisma.deliverableTemplate.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!template) {
      throw new NotFoundException('Template de livrable introuvable');
    }

    return this.prisma.deliverableTemplateVersion.findMany({
      where: { templateId: id },
      orderBy: { version: 'desc' },
    });
  }
}
