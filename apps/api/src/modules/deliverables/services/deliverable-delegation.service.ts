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
      throw new BadRequestException('Acces refuse');
    if (deliverable.status !== 'DRAFT' && deliverable.status !== 'REVISED') {
      throw new BadRequestException(
        'Seul un livrable en brouillon ou revision peut etre delegue',
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
        "Membre d'equipe introuvable dans ce projet",
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
      `Personnalite : ${teamMember.personality}.`,
      ``,
      `Tu dois rediger un livrable professionnel.`,
      `Adapte le niveau de detail et la qualite a ton expertise (${teamMember.expertise}).`,
      `Si ta personnalite est RESISTANT, tu peux etre plus succinct ou critique.`,
      `Si ta personnalite est COOPERATIVE, tu es thorough et bien structure.`,
    ].join('\n');

    const prompt = [
      `Redige le livrable suivant en format Markdown :`,
      ``,
      `Titre : ${title}`,
      `Type : ${type}`,
      instructions
        ? `Instructions du chef de projet : ${instructions}`
        : '',
      ``,
      `Le document doit etre professionnel, structure avec des sections et sous-sections.`,
      `Inclus les elements attendus pour ce type de livrable de gestion de projet.`,
      `Redige en francais, entre 500 et 1500 mots.`,
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
      throw new NotFoundException('Livrable delegue introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Acces refuse');
    if (!deliverable.assignedToMember)
      throw new BadRequestException('Aucun expert assigne');

    const teamMember = deliverable.assignedToMember;

    const systemPrompt = [
      `Tu es ${teamMember.name}, ${teamMember.role}.`,
      `Le chef de projet te demande de reviser un livrable que tu as redige.`,
      `Voici son feedback sur ta premiere version.`,
    ].join('\n');

    const prompt = [
      `Voici le livrable actuel :`,
      `---`,
      deliverable.content ?? '(vide)',
      `---`,
      ``,
      `Feedback du chef de projet : ${feedback}`,
      ``,
      `Revise le document en tenant compte du feedback. Conserve la structure generale mais ameliore les points mentionnes.`,
      `Redige en francais, format Markdown.`,
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
