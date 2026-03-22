import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import { UserDeliverableStatus } from '@prisma/client';
import { CreateDeliverableDto, UpdateDeliverableContentDto } from '../dto';
import { DeliverableEvaluationService } from './deliverable-evaluation.service';
import { TemplateResolverService } from './template-resolver.service';
import { ProfileConfigService } from '@/modules/profile/services';

@Injectable()
export class DeliverablesService {
  private readonly logger = new Logger(DeliverablesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly evaluationService: DeliverableEvaluationService,
    private readonly templateResolver: TemplateResolverService,
    private readonly profileConfig: ProfileConfigService,
  ) {}

  /**
   * Verify simulation belongs to user and tenant.
   */
  private async verifySimulationAccess(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id: simulationId, userId, tenantId },
      select: { id: true, tenantId: true },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation introuvable');
    }

    return simulation;
  }

  /**
   * Find a deliverable and verify it belongs to the simulation.
   */
  private async findDeliverableOrThrow(
    deliverableId: string,
    simulationId: string,
  ) {
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
    });

    if (!deliverable) {
      throw new NotFoundException('Livrable introuvable');
    }

    return deliverable;
  }

  /**
   * US-4.1: Create a new deliverable (draft).
   */
  async create(
    simulationId: string,
    userId: string,
    tenantId: string,
    dto: CreateDeliverableDto,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    // Fetch profile adaptation to determine maxRevisions
    const adaptation = await this.profileConfig.getAdaptationForUser(
      userId,
      tenantId,
    );

    // Pre-fill template content with simulation context when a template is provided
    let prefilledContent: string | undefined;
    if (dto.templateId) {
      try {
        const template = await this.prisma.deliverableTemplate.findUnique({
          where: { id: dto.templateId },
          select: { content: true },
        });
        if (template?.content) {
          prefilledContent = await this.templateResolver.resolveTemplate(
            template.content,
            simulationId,
          );
        }
      } catch (err) {
        this.logger.warn(
          `Template pre-fill failed for ${dto.templateId}: ${(err as Error).message}`,
        );
      }
    }

    const deliverable = await this.prisma.userDeliverable.create({
      data: {
        simulationId,
        templateId: dto.templateId,
        title: dto.title,
        type: dto.type,
        phaseOrder: dto.phaseOrder,
        content: prefilledContent,
        lastSavedAt: prefilledContent ? new Date() : undefined,
        status: UserDeliverableStatus.DRAFT,
        maxRevisions: adaptation.maxRevisions,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_CREATED,
        AggregateType.USER_DELIVERABLE,
        deliverable.id,
        {
          simulationId,
          title: deliverable.title,
          type: deliverable.type,
          phaseOrder: deliverable.phaseOrder,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return deliverable;
  }

  /**
   * US-4.1: Auto-save deliverable content.
   */
  async updateContent(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
    dto: UpdateDeliverableContentDto,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    // Only DRAFT or REVISED deliverables can be edited
    if (
      deliverable.status !== UserDeliverableStatus.DRAFT &&
      deliverable.status !== UserDeliverableStatus.REVISED
    ) {
      throw new BadRequestException(
        'Le livrable ne peut etre modifie que s\'il est en brouillon ou en revision',
      );
    }

    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        content: dto.content,
        lastSavedAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_SAVED,
        AggregateType.USER_DELIVERABLE,
        deliverable.id,
        { simulationId, title: deliverable.title },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * US-4.2: Submit deliverable for AI evaluation.
   */
  async submit(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    if (
      deliverable.status !== UserDeliverableStatus.DRAFT &&
      deliverable.status !== UserDeliverableStatus.REVISED
    ) {
      throw new BadRequestException(
        'Seul un livrable en brouillon ou en revision peut etre soumis',
      );
    }

    if (!deliverable.content || deliverable.content.trim().length === 0) {
      throw new BadRequestException(
        'Le livrable ne peut pas etre soumis sans contenu',
      );
    }

    // Update status to SUBMITTED
    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: UserDeliverableStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_SUBMITTED,
        AggregateType.USER_DELIVERABLE,
        deliverable.id,
        {
          simulationId,
          title: deliverable.title,
          revisionNumber: deliverable.revisionNumber,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    // Trigger evaluation in background (fire-and-forget)
    this.evaluationService
      .evaluate(updated, tenantId, userId)
      .catch((err) =>
        this.logger.error(
          `Background evaluation failed for ${deliverableId}: ${err.message}`,
        ),
      );

    return updated;
  }

  /**
   * US-4.3: List all deliverables for a simulation.
   */
  async findAll(
    simulationId: string,
    userId: string,
    tenantId: string,
    filters?: { phase?: number; status?: UserDeliverableStatus },
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    const where: Record<string, unknown> = { simulationId };
    if (filters?.phase !== undefined) where.phaseOrder = filters.phase;
    if (filters?.status) where.status = filters.status;

    const deliverables = await this.prisma.userDeliverable.findMany({
      where,
      include: {
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: [{ phaseOrder: 'asc' }, { createdAt: 'asc' }],
    });

    const validated = deliverables.filter(
      (d) => d.status === UserDeliverableStatus.VALIDATED,
    ).length;

    return {
      data: deliverables,
      summary: {
        validated,
        total: deliverables.length,
      },
    };
  }

  /**
   * US-4.3: Get a single deliverable by ID.
   */
  async findOne(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
      include: {
        evaluations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!deliverable) {
      throw new NotFoundException('Livrable introuvable');
    }

    return deliverable;
  }

  /**
   * US-4.4: Get the template associated with a deliverable.
   * Does NOT return referenceExample (visible only after evaluation).
   */
  async getTemplate(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    if (!deliverable.templateId) {
      throw new NotFoundException(
        'Aucun template associe a ce livrable',
      );
    }

    const template = await this.prisma.deliverableTemplate.findUnique({
      where: { id: deliverable.templateId },
      select: {
        id: true,
        title: true,
        type: true,
        phase: true,
        description: true,
        content: true,
        evaluationCriteria: true,
        pmiProcess: true,
        difficulty: true,
        // referenceExample is intentionally excluded
      },
    });

    if (!template) {
      throw new NotFoundException('Template introuvable');
    }

    return template;
  }

  /**
   * US-4.5: Get the latest evaluation for a deliverable.
   */
  async getEvaluation(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    const evaluation = await this.prisma.deliverableEvaluation.findFirst({
      where: { deliverableId },
      orderBy: { createdAt: 'desc' },
    });

    if (!evaluation) {
      throw new NotFoundException(
        'Aucune evaluation disponible pour ce livrable',
      );
    }

    return evaluation;
  }

  /**
   * US-4.6: Get the reference example for a deliverable.
   * Only available if the deliverable has been evaluated.
   */
  async getReferenceExample(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    // Only accessible after evaluation
    const evaluatedStatuses: UserDeliverableStatus[] = [
      UserDeliverableStatus.EVALUATED,
      UserDeliverableStatus.REVISED,
      UserDeliverableStatus.VALIDATED,
      UserDeliverableStatus.REJECTED,
    ];

    if (!evaluatedStatuses.includes(deliverable.status)) {
      throw new ForbiddenException(
        'L\'exemple de reference n\'est accessible qu\'apres evaluation du livrable',
      );
    }

    if (!deliverable.templateId) {
      return {
        templateId: null,
        title: deliverable.title,
        type: deliverable.type,
        referenceExample: null,
        message: 'Aucun exemple de reference disponible pour ce livrable. Le Jumeau Parfait est disponible uniquement pour les livrables bases sur un template de reference.',
      };
    }

    const template = await this.prisma.deliverableTemplate.findUnique({
      where: { id: deliverable.templateId },
      select: {
        id: true,
        title: true,
        type: true,
        referenceExample: true,
      },
    });

    if (!template || !template.referenceExample) {
      return {
        templateId: template?.id ?? null,
        title: template?.title ?? deliverable.title,
        type: template?.type ?? deliverable.type,
        referenceExample: null,
        message: 'Aucun exemple de reference redige pour ce template.',
      };
    }

    return {
      templateId: template.id,
      title: template.title,
      type: template.type,
      referenceExample: template.referenceExample,
    };
  }

  /**
   * US-4.8: Revise a deliverable (go back to editing mode).
   */
  async revise(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    const deliverable = await this.findDeliverableOrThrow(
      deliverableId,
      simulationId,
    );

    if (deliverable.status !== UserDeliverableStatus.EVALUATED) {
      throw new BadRequestException(
        'Seul un livrable evalue peut etre remis en revision',
      );
    }

    if (deliverable.revisionNumber >= deliverable.maxRevisions) {
      throw new BadRequestException(
        `Nombre maximum de revisions atteint (${deliverable.maxRevisions})`,
      );
    }

    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        status: UserDeliverableStatus.REVISED,
        revisionNumber: deliverable.revisionNumber + 1,
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_REVISED,
        AggregateType.USER_DELIVERABLE,
        deliverable.id,
        {
          simulationId,
          title: deliverable.title,
          revisionNumber: updated.revisionNumber,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * US-4.9 + US-4.10: Create a pre-filled meeting minutes deliverable.
   */
  async createMeetingMinutes(
    simulationId: string,
    meetingId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    // Verify meeting belongs to the simulation
    const meeting = await this.prisma.meeting.findFirst({
      where: { id: meetingId, simulationId },
      include: { participants: true },
    });

    if (!meeting) {
      throw new NotFoundException('Reunion introuvable');
    }

    if (meeting.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Le compte-rendu ne peut etre cree qu\'apres la fin de la reunion',
      );
    }

    // Check if a minutes deliverable already exists for this meeting
    const existing = await this.prisma.userDeliverable.findFirst({
      where: { simulationId, meetingId, type: 'meeting-minutes' },
    });

    if (existing) {
      throw new BadRequestException(
        'Un compte-rendu existe deja pour cette reunion',
      );
    }

    const participantsList = meeting.participants
      .map((p) => `- ${p.name} (${p.role})`)
      .join('\n');

    const prefilledContent = `# Compte-rendu de reunion

## Informations generales
- **Reunion** : ${meeting.title}
- **Type** : ${meeting.type}
- **Date** : ${meeting.completedAt?.toLocaleDateString('fr-FR') ?? 'N/A'}
- **Duree** : ${meeting.durationMinutes} minutes

## Participants
${participantsList}

## Objectifs
${meeting.objectives.map((o) => `- ${o}`).join('\n')}

## Points abordes
<!-- Completez cette section -->

## Decisions prises
<!-- Completez cette section -->

## Actions a mener
| Responsable | Action | Echeance |
|---|---|---|
| | | |

## Points en suspens
<!-- Completez cette section -->

## Prochaines etapes
<!-- Completez cette section -->
`;

    const deliverable = await this.prisma.userDeliverable.create({
      data: {
        simulationId,
        meetingId,
        title: `Compte-rendu : ${meeting.title}`,
        type: 'meeting-minutes',
        phaseOrder: meeting.phaseOrder,
        content: prefilledContent,
        status: UserDeliverableStatus.DRAFT,
        lastSavedAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.DELIVERABLE_CREATED,
        AggregateType.USER_DELIVERABLE,
        deliverable.id,
        {
          simulationId,
          meetingId,
          title: deliverable.title,
          type: 'meeting-minutes',
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          channels: ['socket'],
          priority: 1,
        },
      )
      .catch(() => {});

    // Generate AI meeting minutes in background
    this.evaluationService
      .generateMeetingMinutes(meetingId, deliverable.id, tenantId, userId)
      .catch((err) =>
        this.logger.error(
          `Background meeting minutes generation failed: ${err.message}`,
        ),
      );

    return deliverable;
  }
}
