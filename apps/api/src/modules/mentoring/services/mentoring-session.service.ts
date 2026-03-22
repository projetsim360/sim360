import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, EventPublisherService } from '@sim360/core';
import {
  EventType,
  AggregateType,
} from '@sim360/core/dist/event-store/types/event.types';
import { CreateMentoringSessionDto, SendMentoringMessageDto } from '../dto';

@Injectable()
export class MentoringSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(
    mentorId: string,
    tenantId: string,
    dto: CreateMentoringSessionDto,
  ) {
    // Validate simulation exists and belongs to tenant
    const simulation = await this.prisma.simulation.findUnique({
      where: { id: dto.simulationId },
    });

    if (!simulation) {
      throw new NotFoundException(
        `Simulation ${dto.simulationId} not found`,
      );
    }

    if (simulation.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    // Validate learner exists
    const learner = await this.prisma.user.findUnique({
      where: { id: dto.learnerId },
    });

    if (!learner) {
      throw new NotFoundException(`Learner ${dto.learnerId} not found`);
    }

    const session = await this.prisma.mentoringSession.create({
      data: {
        simulationId: dto.simulationId,
        mentorId,
        learnerId: dto.learnerId,
        tenantId,
        type: dto.type ?? 'DEBRIEFING',
        status: 'SCHEDULED',
        notes: dto.notes,
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        learner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.eventPublisher.publish(
      EventType.MENTORING_SESSION_CREATED,
      AggregateType.MENTORING_SESSION,
      session.id,
      {
        simulationId: dto.simulationId,
        mentorId,
        learnerId: dto.learnerId,
        type: session.type,
      },
      {
        actorId: mentorId,
        tenantId,
        receiverIds: [dto.learnerId],
      },
    );

    return session;
  }

  async findAll(userId: string, tenantId: string) {
    return this.prisma.mentoringSession.findMany({
      where: {
        tenantId,
        OR: [{ mentorId: userId }, { learnerId: userId }],
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        learner: { select: { id: true, firstName: true, lastName: true } },
        simulation: {
          select: {
            id: true,
            scenario: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.mentoringSession.findUnique({
      where: { id },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        learner: { select: { id: true, firstName: true, lastName: true } },
        simulation: {
          select: {
            id: true,
            scenario: { select: { id: true, title: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Mentoring session ${id} not found`);
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new ForbiddenException(
        'You are not a participant of this session',
      );
    }

    return session;
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    dto: SendMentoringMessageDto,
  ) {
    const session = await this.prisma.mentoringSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Mentoring session ${sessionId} not found`);
    }

    if (session.mentorId !== userId && session.learnerId !== userId) {
      throw new ForbiddenException(
        'You are not a participant of this session',
      );
    }

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('Cannot send messages to a completed session');
    }

    // Update session to IN_PROGRESS if still SCHEDULED
    if (session.status === 'SCHEDULED') {
      await this.prisma.mentoringSession.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    const role = session.mentorId === userId ? 'MENTOR' : 'LEARNER';
    const receiverId =
      session.mentorId === userId ? session.learnerId : session.mentorId;

    const message = await this.prisma.mentoringMessage.create({
      data: {
        sessionId,
        senderId: userId,
        role,
        content: dto.content,
      },
    });

    await this.eventPublisher.publish(
      EventType.MENTORING_MESSAGE_SENT,
      AggregateType.MENTORING_SESSION,
      sessionId,
      {
        messageId: message.id,
        senderId: userId,
        role,
      },
      {
        actorId: userId,
        tenantId: session.tenantId,
        receiverIds: [receiverId],
      },
    );

    return message;
  }

  async complete(id: string, userId: string) {
    const session = await this.prisma.mentoringSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException(`Mentoring session ${id} not found`);
    }

    if (session.mentorId !== userId) {
      throw new ForbiddenException('Only the mentor can complete a session');
    }

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('Session is already completed');
    }

    const updated = await this.prisma.mentoringSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        learner: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await this.eventPublisher.publish(
      EventType.MENTORING_SESSION_COMPLETED,
      AggregateType.MENTORING_SESSION,
      id,
      {
        mentorId: session.mentorId,
        learnerId: session.learnerId,
        type: session.type,
      },
      {
        actorId: userId,
        tenantId: session.tenantId,
        receiverIds: [session.learnerId],
      },
    );

    return updated;
  }
}
