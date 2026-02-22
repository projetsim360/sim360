import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { AiOrchestratorService } from '../ai/services';
import { SendMessageDto } from './dto';

interface MessageEvent {
  data: string;
}

const MEETING_INCLUDE = {
  participants: true,
  summary: true,
  messages: {
    orderBy: { createdAt: 'asc' as const },
    include: { participant: true },
  },
};

@Injectable()
export class MeetingsService {
  private readonly logger = new Logger(MeetingsService.name);

  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
    private orchestrator: AiOrchestratorService,
  ) {}

  async findAllBySimulation(
    simulationId: string,
    userId: string,
    filters?: { type?: string; phaseOrder?: number; status?: string },
  ) {
    // Verify ownership
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: simulationId },
      select: { userId: true },
    });
    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    const where: Record<string, unknown> = { simulationId };
    if (filters?.type) where.type = filters.type;
    if (filters?.phaseOrder !== undefined && filters?.phaseOrder !== null) {
      where.phaseOrder = Number(filters.phaseOrder);
    }
    if (filters?.status) where.status = filters.status;

    return this.prisma.meeting.findMany({
      where,
      orderBy: [{ phaseOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        participants: true,
        summary: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async findOne(id: string, userId: string) {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        ...MEETING_INCLUDE,
        simulation: { select: { userId: true, tenantId: true, scenarioId: true, currentPhaseOrder: true, kpis: true, scenario: { select: { title: true } }, phases: { where: { status: 'ACTIVE' }, select: { name: true } } } },
      },
    });

    if (!meeting) throw new NotFoundException('Reunion introuvable');
    if (meeting.simulation.userId !== userId) throw new ForbiddenException('Acces refuse');

    return meeting;
  }

  async start(id: string, userId: string) {
    const meeting = await this.findOne(id, userId);

    if (meeting.status !== 'SCHEDULED') {
      throw new BadRequestException('Cette reunion ne peut pas etre demarree');
    }

    const updated = await this.prisma.meeting.update({
      where: { id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: { participants: true, summary: true, _count: { select: { messages: true } } },
    });

    await this.eventPublisher.publish(
      EventType.MEETING_STARTED,
      AggregateType.MEETING,
      id,
      { title: meeting.title, simulationId: meeting.simulationId },
      {
        actorId: userId,
        actorType: 'user',
        tenantId: meeting.simulation.tenantId,
        channels: ['socket'],
        priority: 1,
      },
    );

    return updated;
  }

  sendMessage(id: string, userId: string, dto: SendMessageDto): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          const meeting = await this.findOne(id, userId);

          if (meeting.status !== 'IN_PROGRESS') {
            subscriber.next({ data: JSON.stringify({ error: 'La reunion n\'est pas en cours' }) });
            subscriber.complete();
            return;
          }

          // Enforce 100 messages limit
          const messageCount = await this.prisma.meetingMessage.count({ where: { meetingId: id } });
          if (messageCount >= 100) {
            subscriber.next({ data: JSON.stringify({ error: 'Limite de 100 messages atteinte. Veuillez cloturer la reunion.' }) });
            subscriber.complete();
            return;
          }

          // Persist user message
          await this.prisma.meetingMessage.create({
            data: { meetingId: id, content: dto.content, role: 'USER' },
          });

          // Determine responding participant
          let participant = meeting.participants[0];
          if (dto.participantId) {
            const found = meeting.participants.find((p) => p.id === dto.participantId);
            if (found) participant = found;
          }

          if (!participant) {
            subscriber.next({ data: JSON.stringify({ error: 'Aucun participant dans cette reunion' }) });
            subscriber.complete();
            return;
          }

          // Build history from last 20 messages
          const recentMessages = meeting.messages.slice(-20);
          const history = recentMessages.map((m) => ({
            role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: m.content,
          }));

          // Build context
          const kpis = meeting.simulation.kpis;
          const context = {
            scenarioTitle: meeting.simulation.scenario.title,
            phaseName: meeting.simulation.phases[0]?.name ?? 'Inconnue',
            kpis: kpis
              ? {
                  budget: kpis.budget,
                  schedule: kpis.schedule,
                  quality: kpis.quality,
                  teamMorale: kpis.teamMorale,
                  riskLevel: kpis.riskLevel,
                }
              : { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 },
            projectDescription: meeting.description ?? undefined,
          };

          const participantCtx = {
            name: participant.name,
            role: participant.role,
            personality: participant.personality ?? 'COOPERATIVE',
            expertise: 'INTERMEDIATE',
            morale: participant.cooperationLevel * 20,
          };

          // Stream AI response
          let fullResponse = '';

          const aiStream = this.orchestrator.meeting.streamResponse(
            participantCtx,
            context,
            history,
            dto.content,
          );

          await new Promise<void>((resolve, reject) => {
            aiStream.subscribe({
              next: (event) => {
                try {
                  const data = JSON.parse(event.data);
                  if (data.token) {
                    fullResponse += data.token;
                    subscriber.next(event);
                  } else if (data.done) {
                    subscriber.next(event);
                  } else if (data.error) {
                    subscriber.next(event);
                  }
                } catch {
                  subscriber.next(event);
                }
              },
              error: (err) => reject(err),
              complete: () => resolve(),
            });
          });

          // Persist AI response
          if (fullResponse) {
            await this.prisma.meetingMessage.create({
              data: {
                meetingId: id,
                participantId: participant.id,
                content: fullResponse,
                role: 'PARTICIPANT',
              },
            });
          }

          // Publish event
          this.eventPublisher.publish(
            EventType.MEETING_MESSAGE_SENT,
            AggregateType.MEETING,
            id,
            { participant: participant.name, simulationId: meeting.simulationId },
            {
              actorId: userId,
              actorType: 'user',
              tenantId: meeting.simulation.tenantId,
              channels: ['socket'],
            },
          );

          subscriber.complete();
        } catch (error: any) {
          this.logger.error(`Meeting sendMessage error: ${error.message}`);
          subscriber.next({ data: JSON.stringify({ error: error.message }) });
          subscriber.complete();
        }
      })();
    });
  }

  async complete(id: string, userId: string) {
    const meeting = await this.findOne(id, userId);

    if (meeting.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Cette reunion ne peut pas etre cloturee');
    }

    // Generate summary from full message history
    const kpis = meeting.simulation.kpis;
    const kpiValues = kpis
      ? {
          budget: kpis.budget,
          schedule: kpis.schedule,
          quality: kpis.quality,
          teamMorale: kpis.teamMorale,
          riskLevel: kpis.riskLevel,
        }
      : { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 };

    const history = meeting.messages.map((m) => ({
      role: (m.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    }));

    const participantNames = meeting.participants.map((p) => p.name);

    const structuredSummary = await this.orchestrator.meeting.generateStructuredSummary(
      meeting.title,
      history,
      kpiValues,
      participantNames,
    );

    // Persist summary, apply KPI impact, and update status
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.meetingSummary.create({
        data: {
          meetingId: id,
          summary: structuredSummary.summary,
          keyDecisions: structuredSummary.keyDecisions,
          actionItems: structuredSummary.actionItems as any,
          kpiImpact: structuredSummary.kpiImpact as any,
        },
      });

      // Apply KPI impact if any
      const impact = structuredSummary.kpiImpact;
      if (impact && Object.keys(impact).length > 0) {
        const clamp = (v: number) => Math.max(0, Math.min(100, v));
        await tx.simulationKpi.update({
          where: { simulationId: meeting.simulationId },
          data: {
            budget: clamp(kpiValues.budget + (impact.budget ?? 0)),
            schedule: clamp(kpiValues.schedule + (impact.schedule ?? 0)),
            quality: clamp(kpiValues.quality + (impact.quality ?? 0)),
            teamMorale: clamp(kpiValues.teamMorale + (impact.teamMorale ?? 0)),
            riskLevel: clamp(kpiValues.riskLevel + (impact.riskLevel ?? 0)),
          },
        });
      }

      // Record KPI snapshot after meeting impact
      if (impact && Object.keys(impact).length > 0) {
        const updatedKpis = await tx.simulationKpi.findUnique({ where: { simulationId: meeting.simulationId } });
        if (updatedKpis) {
          await tx.simulationKpiSnapshot.create({
            data: {
              simulationId: meeting.simulationId,
              phaseOrder: meeting.phaseOrder,
              trigger: 'meeting',
              triggerId: id,
              budget: updatedKpis.budget,
              schedule: updatedKpis.schedule,
              quality: updatedKpis.quality,
              teamMorale: updatedKpis.teamMorale,
              riskLevel: updatedKpis.riskLevel,
            },
          });
        }
      }

      return tx.meeting.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
        include: { participants: true, summary: true, _count: { select: { messages: true } } },
      });
    });

    await this.eventPublisher.publish(
      EventType.MEETING_COMPLETED,
      AggregateType.MEETING,
      id,
      { title: meeting.title, simulationId: meeting.simulationId },
      {
        actorId: userId,
        actorType: 'user',
        tenantId: meeting.simulation.tenantId,
        channels: ['socket'],
        priority: 2,
      },
    );

    return updated;
  }

  async getSummary(id: string, userId: string) {
    const meeting = await this.findOne(id, userId);

    const summary = await this.prisma.meetingSummary.findUnique({
      where: { meetingId: id },
    });

    if (!summary) throw new NotFoundException('Resume introuvable');
    return summary;
  }
}
