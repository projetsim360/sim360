import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService, EventPublisherService } from '@sim360/core';
import {
  EventType,
  AggregateType,
} from '@sim360/core/dist/event-store/types/event.types';
import { UserRole } from '@prisma/client';
import { CreateMentorReviewDto } from '../dto';

@Injectable()
export class MentorReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
  ) {}

  async create(mentorId: string, tenantId: string, dto: CreateMentorReviewDto) {
    // Validate mentor role
    const mentor = await this.prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== UserRole.MENTOR) {
      throw new ForbiddenException('Only mentors can create reviews');
    }

    // Validate evaluation exists
    const evaluation = await this.prisma.deliverableEvaluation.findUnique({
      where: { id: dto.evaluationId },
      include: {
        deliverable: {
          include: {
            simulation: true,
          },
        },
      },
    });

    if (!evaluation) {
      throw new NotFoundException(
        `Evaluation ${dto.evaluationId} not found`,
      );
    }

    if (evaluation.deliverable.simulation.tenantId !== tenantId) {
      throw new ForbiddenException('Cross-tenant access denied');
    }

    const review = await this.prisma.mentorReview.create({
      data: {
        evaluationId: dto.evaluationId,
        mentorId,
        tenantId,
        humanScore: dto.humanScore,
        leadershipScore: dto.leadershipScore,
        diplomacyScore: dto.diplomacyScore,
        postureScore: dto.postureScore,
        feedback: dto.feedback,
        recommendations: dto.recommendations,
      },
    });

    await this.eventPublisher.publish(
      EventType.MENTOR_REVIEW_CREATED,
      AggregateType.MENTOR_REVIEW,
      review.id,
      {
        evaluationId: dto.evaluationId,
        mentorId,
        humanScore: dto.humanScore,
      },
      { actorId: mentorId, tenantId },
    );

    return review;
  }

  async findByEvaluation(evaluationId: string) {
    const review = await this.prisma.mentorReview.findUnique({
      where: { evaluationId },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (!review) {
      throw new NotFoundException(
        `No mentor review found for evaluation ${evaluationId}`,
      );
    }

    return review;
  }

  async findPending(mentorId: string, tenantId: string) {
    const evaluations = await this.prisma.deliverableEvaluation.findMany({
      where: {
        mentorReview: null,
        deliverable: {
          simulation: {
            tenantId,
          },
        },
      },
      include: {
        deliverable: {
          select: {
            id: true,
            title: true,
            type: true,
            templateId: true,
            simulation: {
              select: {
                id: true,
                user: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return evaluations;
  }

  async update(
    id: string,
    mentorId: string,
    dto: Partial<CreateMentorReviewDto>,
  ) {
    const review = await this.prisma.mentorReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Mentor review ${id} not found`);
    }

    if (review.mentorId !== mentorId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    const updated = await this.prisma.mentorReview.update({
      where: { id },
      data: {
        humanScore: dto.humanScore,
        leadershipScore: dto.leadershipScore,
        diplomacyScore: dto.diplomacyScore,
        postureScore: dto.postureScore,
        feedback: dto.feedback,
        recommendations: dto.recommendations,
      },
    });

    await this.eventPublisher.publish(
      EventType.MENTOR_REVIEW_UPDATED,
      AggregateType.MENTOR_REVIEW,
      id,
      { mentorId, humanScore: dto.humanScore },
      { actorId: mentorId, tenantId: review.tenantId },
    );

    return updated;
  }
}
