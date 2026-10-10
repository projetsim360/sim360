import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';
import { CreateActionItemDto, UpdateActionItemDto } from './dto';
import { seedsFromSummary } from './action-items.util';

@Injectable()
export class ActionItemsService {
  constructor(private prisma: PrismaService) {}

  /** Loads a simulation owned by the user inside their tenant, or throws. */
  private async assertSimulation(simulationId: string, userId: string, tenantId: string) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id: simulationId, tenantId },
      select: { id: true, userId: true, tenantId: true },
    });
    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Accès refusé');
    return simulation;
  }

  private async assertItem(id: string, userId: string, tenantId: string) {
    const item = await this.prisma.actionItem.findFirst({
      where: { id, tenantId },
      include: { simulation: { select: { userId: true } } },
    });
    if (!item) throw new NotFoundException('Action introuvable');
    if (item.simulation.userId !== userId) throw new ForbiddenException('Accès refusé');
    return item;
  }

  /**
   * Copies the actions produced by the meeting summary into editable rows, once per meeting.
   * Called on meeting completion and lazily for meetings completed before this feature.
   */
  async importFromSummary(meetingId: string, tenantId: string, userId?: string) {
    const summary = await this.prisma.meetingSummary.findUnique({
      where: { meetingId },
      include: { meeting: { select: { simulationId: true, simulation: { select: { tenantId: true } } } } },
    });
    if (!summary || summary.actionItemsImported) return 0;
    if (summary.meeting.simulation.tenantId !== tenantId) return 0;

    const seeds = seedsFromSummary(summary.actionItems);
    await this.prisma.$transaction([
      ...seeds.map((seed) =>
        this.prisma.actionItem.create({
          data: {
            ...seed,
            tenantId,
            simulationId: summary.meeting.simulationId,
            meetingId,
            source: 'MEETING_SUMMARY',
            createdById: userId ?? null,
          },
        }),
      ),
      this.prisma.meetingSummary.update({ where: { meetingId }, data: { actionItemsImported: true } }),
    ]);
    return seeds.length;
  }

  async list(simulationId: string, userId: string, tenantId: string, meetingId?: string) {
    await this.assertSimulation(simulationId, userId, tenantId);

    if (meetingId) {
      await this.importFromSummary(meetingId, tenantId, userId);
    } else {
      // Import any completed meeting of this simulation that predates the feature.
      const pending = await this.prisma.meetingSummary.findMany({
        where: { actionItemsImported: false, meeting: { simulationId } },
        select: { meetingId: true },
      });
      for (const p of pending) await this.importFromSummary(p.meetingId, tenantId, userId);
    }

    return this.prisma.actionItem.findMany({
      where: { simulationId, tenantId, ...(meetingId ? { meetingId } : {}) },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
      include: { meeting: { select: { id: true, title: true } } },
    });
  }

  async create(simulationId: string, userId: string, tenantId: string, dto: CreateActionItemDto) {
    await this.assertSimulation(simulationId, userId, tenantId);
    if (dto.meetingId) {
      const meeting = await this.prisma.meeting.findFirst({ where: { id: dto.meetingId, simulationId } });
      if (!meeting) throw new NotFoundException('Réunion introuvable');
    }
    return this.prisma.actionItem.create({
      data: {
        tenantId,
        simulationId,
        meetingId: dto.meetingId ?? null,
        title: dto.title.trim(),
        assignee: dto.assignee?.trim() || null,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: dto.status ?? 'TODO',
        source: 'USER',
        createdById: userId,
      },
      include: { meeting: { select: { id: true, title: true } } },
    });
  }

  async update(id: string, userId: string, tenantId: string, dto: UpdateActionItemDto) {
    await this.assertItem(id, userId, tenantId);
    return this.prisma.actionItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.assignee !== undefined ? { assignee: dto.assignee?.trim() || null } : {}),
        ...(dto.dueDate !== undefined
          ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null, dueLabel: dto.dueDate ? null : undefined }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: { meeting: { select: { id: true, title: true } } },
    });
  }

  async remove(id: string, userId: string, tenantId: string) {
    await this.assertItem(id, userId, tenantId);
    await this.prisma.actionItem.delete({ where: { id } });
    return { deleted: true };
  }
}
