import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { ReferenceDocumentCategory, PhaseType } from '@prisma/client';
import { CreateReferenceDocumentDto, UpdateReferenceDocumentDto } from '../dto';

export interface ReferenceDocumentFilters {
  category?: ReferenceDocumentCategory;
  phase?: PhaseType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable()
export class ReferenceDocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(tenantId: string, userId: string, dto: CreateReferenceDocumentDto) {
    const document = await this.prisma.referenceDocument.create({
      data: {
        tenantId,
        createdById: userId,
        title: dto.title,
        category: dto.category,
        phase: dto.phase,
        pmiProcess: dto.pmiProcess,
        content: dto.content,
        term: dto.term,
        example: dto.example,
      },
    });

    this.eventPublisher
      .publish(
        EventType.REFERENCE_DOCUMENT_CREATED,
        AggregateType.REFERENCE_DOCUMENT,
        document.id,
        { title: document.title, category: document.category },
        { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
      )
      .catch(() => {});

    return document;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateReferenceDocumentDto) {
    const existing = await this.prisma.referenceDocument.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Document de reference introuvable');
    }

    // Save current version to history before updating
    await this.prisma.referenceDocumentVersion.create({
      data: {
        documentId: existing.id,
        version: existing.version,
        title: existing.title,
        category: existing.category,
        phase: existing.phase,
        pmiProcess: existing.pmiProcess,
        content: existing.content,
        term: existing.term,
        example: existing.example,
      },
    });

    // Update with incremented version
    const updated = await this.prisma.referenceDocument.update({
      where: { id },
      data: {
        ...dto,
        version: existing.version + 1,
      },
    });

    this.eventPublisher
      .publish(
        EventType.REFERENCE_DOCUMENT_UPDATED,
        AggregateType.REFERENCE_DOCUMENT,
        updated.id,
        { title: updated.title, version: updated.version, previousVersion: existing.version },
        { actorId: userId, actorType: 'user', tenantId, channels: ['socket'], priority: 1 },
      )
      .catch(() => {});

    return updated;
  }

  async findAll(tenantId: string, filters: ReferenceDocumentFilters) {
    const {
      category,
      phase,
      isActive,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: Record<string, unknown> = { tenantId };
    if (category) where.category = category;
    if (phase) where.phase = phase;
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.referenceDocument.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.referenceDocument.count({ where }),
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
    const document = await this.prisma.referenceDocument.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document de reference introuvable');
    }

    return document;
  }

  async findVersions(tenantId: string, id: string) {
    const document = await this.prisma.referenceDocument.findFirst({
      where: { id, tenantId },
      select: { id: true },
    });

    if (!document) {
      throw new NotFoundException('Document de reference introuvable');
    }

    return this.prisma.referenceDocumentVersion.findMany({
      where: { documentId: id },
      orderBy: { version: 'desc' },
    });
  }

  /**
   * Public endpoint: returns active glossary entries only.
   * No tenant scoping — glossary is shared across tenants for frontend tooltips.
   */
  async findGlossary() {
    return this.prisma.referenceDocument.findMany({
      where: {
        category: ReferenceDocumentCategory.GLOSSARY,
        isActive: true,
      },
      select: {
        id: true,
        term: true,
        content: true,
        example: true,
      },
      orderBy: { term: 'asc' },
    });
  }
}
