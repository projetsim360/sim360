import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import { AiService } from '@/modules/ai/ai.service';

@Injectable()
export class DeliverableDelegationService {
  private readonly logger = new Logger(DeliverableDelegationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Assign a deliverable to an AI team member for production.
   * Changes delegationType to DELEGATED.
   */
  async assignToExpert(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
    teamMemberId: string,
    instructions?: string,
  ) {
    // 1. Load deliverable and verify ownership
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
      include: {
        simulation: {
          select: { userId: true, tenantId: true, projectId: true },
        },
      },
    });
    if (!deliverable) throw new NotFoundException('Livrable introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Accès refusé');
    if (deliverable.status !== 'DRAFT' && deliverable.status !== 'REVISED') {
      throw new BadRequestException(
        'Seul un livrable en brouillon ou révision peut être délégué',
      );
    }

    // 2. Verify team member belongs to the project
    const teamMember = await this.prisma.projectTeamMember.findFirst({
      where: {
        id: teamMemberId,
        projectId: deliverable.simulation.projectId,
      },
    });
    if (!teamMember)
      throw new NotFoundException(
        "Membre d'équipe introuvable dans ce projet",
      );

    // 3. Update deliverable
    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        delegationType: 'DELEGATED',
        assignedToMemberId: teamMemberId,
        assignedToRole: teamMember.role,
      },
      include: { assignedToMember: true },
    });

    // 4. Generate AI content asynchronously
    this.generateDelegatedContent(
      deliverableId,
      simulationId,
      teamMember,
      deliverable.title,
      deliverable.type,
      instructions,
      userId,
      tenantId,
    ).catch((err) =>
      this.logger.error(
        `Failed to generate delegated content: ${err.message}`,
      ),
    );

    // 5. Publish event
    await this.eventPublisher
      .publish(
        EventType.DELIVERABLE_ASSIGNED,
        AggregateType.USER_DELIVERABLE,
        deliverableId,
        {
          title: deliverable.title,
          assignedTo: teamMember.name,
          role: teamMember.role,
        },
        {
          actorId: userId,
          actorType: 'user',
          tenantId,
          receiverIds: [userId],
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return updated;
  }

  /**
   * Generate content for a delegated deliverable using AI with the team member's persona.
   */
  private async generateDelegatedContent(
    deliverableId: string,
    simulationId: string,
    teamMember: {
      name: string;
      role: string;
      expertise: string;
      personality: string;
    },
    title: string,
    type: string,
    instructions: string | undefined,
    userId: string,
    tenantId: string,
  ) {
    const systemPrompt = [
      `Tu es ${teamMember.name}, ${teamMember.role} dans un projet.`,
      `Niveau d'expertise : ${teamMember.expertise}.`,
      `Personnalité : ${teamMember.personality}.`,
      ``,
      `Tu dois rédiger un livrable professionnel.`,
      `Réponds en français correct, avec les accents.`,
      `Adapte le niveau de détail et la qualité à ton expertise (${teamMember.expertise}).`,
      `Si ta personnalité est RESISTANT, tu peux être plus succinct ou critique.`,
      `Si ta personnalité est COOPERATIVE, tu es thorough et bien structure.`,
    ].join('\n');

    const prompt = [
      `Rédige le livrable suivant en format Markdown :`,
      ``,
      `Titre : ${title}`,
      `Type : ${type}`,
      instructions
        ? `Instructions du chef de projet : ${instructions}`
        : '',
      ``,
      `Le document doit être professionnel, structure avec des sections et sous-sections.`,
      `Inclus les éléments attendus pour ce type de livrable de gestion de projet.`,
      `Rédige en français, entre 500 et 1500 mots.`,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await this.aiService.complete({
      systemPrompt,
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'deliverable_delegation',
        metadata: {
          deliverableId,
          teamMemberRole: teamMember.role,
        },
      },
    });

    // Update the deliverable with generated content
    await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: { content: result.content, lastSavedAt: new Date() },
    });

    this.logger.log(
      `Delegated content generated for deliverable ${deliverableId} by ${teamMember.name}`,
    );
  }

  /**
   * Request revision from the assigned AI expert with feedback.
   */
  async requestRevision(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
    feedback: string,
  ) {
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: {
        id: deliverableId,
        simulationId,
        delegationType: 'DELEGATED',
      },
      include: {
        simulation: { select: { userId: true, projectId: true } },
        assignedToMember: true,
      },
    });
    if (!deliverable)
      throw new NotFoundException('Livrable délégué introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Accès refusé');
    if (!deliverable.assignedToMember)
      throw new BadRequestException('Aucun expert assigné');

    const teamMember = deliverable.assignedToMember;

    const systemPrompt = [
      `Tu es ${teamMember.name}, ${teamMember.role}.`,
      `Le chef de projet te demande de réviser un livrable que tu as rédigé.`,
      `Voici son feedback sur ta première version.`,
      `Réponds en français correct, avec les accents.`,
    ].join('\n');

    const prompt = [
      `Voici le livrable actuel :`,
      `---`,
      deliverable.content ?? '(vide)',
      `---`,
      ``,
      `Feedback du chef de projet : ${feedback}`,
      ``,
      `Révise le document en tenant compte du feedback. Conserve la structure générale mais améliore les points mentionnés.`,
      `Rédige en français, format Markdown.`,
    ].join('\n');

    const result = await this.aiService.complete({
      systemPrompt,
      prompt,
      maxTokens: 2000,
      temperature: 0.5,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'deliverable_revision_delegated',
      },
    });

    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        content: result.content,
        lastSavedAt: new Date(),
        revisionNumber: { increment: 1 },
      },
      include: { assignedToMember: true },
    });

    return updated;
  }
}
