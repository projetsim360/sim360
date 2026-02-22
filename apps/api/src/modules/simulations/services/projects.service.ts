import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@sim360/core';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, tenantId: string) {
    return this.prisma.project.findMany({
      where: { userId, tenantId },
      include: {
        simulation: { select: { id: true, status: true, currentPhaseOrder: true } },
        _count: { select: { teamMembers: true, deliverables: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        teamMembers: true,
        deliverables: { orderBy: { phaseOrder: 'asc' } },
        simulation: {
          include: {
            kpis: true,
            phases: { orderBy: { order: 'asc' } },
            scenario: { select: { id: true, title: true, difficulty: true } },
          },
        },
      },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundException('Projet introuvable');
    }

    return project;
  }

  async getTeam(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) throw new NotFoundException('Projet introuvable');

    return this.prisma.projectTeamMember.findMany({
      where: { projectId },
    });
  }

  async getDeliverables(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) throw new NotFoundException('Projet introuvable');

    return this.prisma.deliverable.findMany({
      where: { projectId },
      orderBy: { phaseOrder: 'asc' },
    });
  }
}
