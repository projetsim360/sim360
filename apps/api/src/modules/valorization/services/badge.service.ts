import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { randomUUID } from 'crypto';

@Injectable()
export class BadgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async findAllForUser(userId: string, tenantId: string) {
    return this.prisma.competencyBadge.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, tenantId?: string) {
    const where: Record<string, unknown> = { id };
    if (userId) where.userId = userId;
    if (tenantId) where.tenantId = tenantId;

    const badge = await this.prisma.competencyBadge.findFirst({ where });

    if (!badge) throw new NotFoundException('Badge introuvable');
    return badge;
  }

  async share(id: string, userId: string, tenantId: string, isPublic = true) {
    const badge = await this.findOne(id, userId, tenantId);

    const shareToken = badge.shareToken ?? randomUUID();

    const updated = await this.prisma.competencyBadge.update({
      where: { id },
      data: {
        shareToken,
        isPublic,
      },
    });

    await this.eventPublisher.publish(
      EventType.BADGE_SHARED,
      AggregateType.COMPETENCY_BADGE,
      id,
      { badgeTitle: badge.title, isPublic, shareToken },
      {
        actorId: userId,
        actorType: 'user',
        tenantId,
        receiverIds: [userId],
        channels: ['socket'],
        priority: 1,
      },
    );

    return updated;
  }

  async verify(shareToken: string) {
    const badge = await this.prisma.competencyBadge.findUnique({
      where: { shareToken },
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!badge) throw new NotFoundException('Badge introuvable ou lien invalide');
    if (!badge.isPublic) throw new NotFoundException('Ce badge n\'est pas public');

    // Return public-safe data (no internal IDs besides badge)
    return {
      id: badge.id,
      title: badge.title,
      description: badge.description,
      scenarioTitle: badge.scenarioTitle,
      sector: badge.sector,
      difficulty: badge.difficulty,
      globalScore: badge.globalScore,
      competencyScores: badge.competencyScores,
      strengths: badge.strengths,
      durationMinutes: badge.durationMinutes,
      createdAt: badge.createdAt,
      holder: {
        firstName: badge.user.firstName,
        lastName: badge.user.lastName,
      },
    };
  }
}
