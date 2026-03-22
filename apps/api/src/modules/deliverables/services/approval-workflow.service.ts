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
import { Prisma } from '@prisma/client';

interface ApprovalChainEntry {
  role: string;
  memberId: string;
  memberName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
}

@Injectable()
export class ApprovalWorkflowService {
  private readonly logger = new Logger(ApprovalWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Define the approval chain for a deliverable.
   */
  async defineApprovalChain(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
    chain: Array<{ role: string; memberId: string }>,
  ) {
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
      include: {
        simulation: { select: { userId: true, projectId: true } },
      },
    });
    if (!deliverable) throw new NotFoundException('Livrable introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Acces refuse');

    // Verify all members exist in the project
    const memberIds = chain.map((c) => c.memberId);
    const members = await this.prisma.projectTeamMember.findMany({
      where: {
        id: { in: memberIds },
        projectId: deliverable.simulation.projectId,
      },
    });
    if (members.length !== memberIds.length) {
      throw new BadRequestException(
        'Certains membres ne font pas partie du projet',
      );
    }

    const approvalChain: ApprovalChainEntry[] = chain.map((c) => {
      const member = members.find((m) => m.id === c.memberId)!;
      return {
        role: c.role,
        memberId: c.memberId,
        memberName: member.name,
        status: 'PENDING' as const,
      };
    });

    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: {
        approvalChain:
          approvalChain as unknown as Prisma.InputJsonValue,
      },
    });

    // Create DeliverableApproval records
    await this.prisma.deliverableApproval.createMany({
      data: chain.map((c) => ({
        deliverableId,
        reviewerMemberId: c.memberId,
        reviewerRole: c.role,
        status: 'PENDING',
      })),
    });

    return updated;
  }

  /**
   * Submit a deliverable for approval. Changes status to PENDING_APPROVAL.
   * The first reviewer in the chain will be processed by AI.
   */
  async submitForApproval(
    simulationId: string,
    deliverableId: string,
    userId: string,
    tenantId: string,
  ) {
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
      include: {
        simulation: { select: { userId: true } },
        deliverableApprovals: true,
      },
    });
    if (!deliverable) throw new NotFoundException('Livrable introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Acces refuse');
    if (!deliverable.approvalChain)
      throw new BadRequestException(
        "Aucune chaine d'approbation definie",
      );
    if (
      deliverable.status !== 'EVALUATED' &&
      deliverable.status !== 'REVISED'
    ) {
      throw new BadRequestException(
        'Le livrable doit etre evalue avant soumission pour approbation',
      );
    }

    const updated = await this.prisma.userDeliverable.update({
      where: { id: deliverableId },
      data: { status: 'PENDING_APPROVAL' },
    });

    // Auto-process first pending approval via AI
    const pendingApproval = deliverable.deliverableApprovals.find(
      (a) => a.status === 'PENDING',
    );
    if (pendingApproval) {
      this.processAiApproval(
        deliverableId,
        pendingApproval.id,
        simulationId,
        userId,
        tenantId,
      ).catch((err) =>
        this.logger.error(`Failed AI approval: ${err.message}`),
      );
    }

    await this.eventPublisher
      .publish(
        EventType.DELIVERABLE_SUBMITTED_FOR_APPROVAL,
        AggregateType.USER_DELIVERABLE,
        deliverableId,
        { title: deliverable.title },
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
   * Process an AI approval -- the reviewer agent evaluates and decides.
   */
  private async processAiApproval(
    deliverableId: string,
    approvalId: string,
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const approval = await this.prisma.deliverableApproval.findUnique({
      where: { id: approvalId },
      include: { deliverable: true },
    });
    if (!approval) return;

    // Load reviewer info
    let reviewerName = approval.reviewerRole;
    if (approval.reviewerMemberId) {
      const member = await this.prisma.projectTeamMember.findUnique({
        where: { id: approval.reviewerMemberId },
      });
      if (member) reviewerName = `${member.name} (${member.role})`;
    }

    const prompt = [
      `Tu es ${reviewerName}, en charge de valider un livrable de gestion de projet.`,
      ``,
      `Titre du livrable : ${approval.deliverable.title}`,
      `Type : ${approval.deliverable.type}`,
      ``,
      `Contenu du livrable :`,
      `---`,
      approval.deliverable.content ?? '(vide)',
      `---`,
      ``,
      `En tant que ${approval.reviewerRole}, evalue ce livrable :`,
      `1. Le document repond-il aux exigences de qualite ?`,
      `2. Les informations sont-elles completes et coherentes ?`,
      `3. Y a-t-il des erreurs ou des lacunes majeures ?`,
      ``,
      `Reponds au format JSON strict :`,
      `{ "decision": "APPROVED" ou "REJECTED", "comment": "ton commentaire detaille (2-3 phrases)" }`,
    ].join('\n');

    const result = await this.aiService.complete({
      prompt,
      maxTokens: 300,
      temperature: 0.4,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'deliverable_approval',
      },
    });

    // Parse AI response
    let decision: 'APPROVED' | 'REJECTED' = 'APPROVED';
    let comment = result.content;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        decision =
          parsed.decision === 'REJECTED' ? 'REJECTED' : 'APPROVED';
        comment = parsed.comment || result.content;
      }
    } catch {
      // If JSON parse fails, approve by default with the raw text as comment
    }

    // Update approval record
    await this.prisma.deliverableApproval.update({
      where: { id: approvalId },
      data: { status: decision, comment, reviewedAt: new Date() },
    });

    // Update the chain in the JSON field
    const deliverable = await this.prisma.userDeliverable.findUnique({
      where: { id: deliverableId },
    });
    if (deliverable?.approvalChain) {
      const chain =
        deliverable.approvalChain as unknown as ApprovalChainEntry[];
      const entry = chain.find(
        (c) => c.memberId === approval.reviewerMemberId,
      );
      if (entry) {
        entry.status = decision;
        entry.comment = comment;
      }
      await this.prisma.userDeliverable.update({
        where: { id: deliverableId },
        data: {
          approvalChain:
            chain as unknown as Prisma.InputJsonValue,
        },
      });
    }

    // Check if all approvals are done
    const allApprovals = await this.prisma.deliverableApproval.findMany(
      { where: { deliverableId } },
    );

    const allProcessed = allApprovals.every(
      (a) => a.status !== 'PENDING',
    );
    if (allProcessed) {
      const hasRejection = allApprovals.some(
        (a) => a.status === 'REJECTED',
      );
      const finalStatus = hasRejection ? 'REJECTED' : 'VALIDATED';

      await this.prisma.userDeliverable.update({
        where: { id: deliverableId },
        data: {
          status: finalStatus,
          approvedBy: hasRejection
            ? undefined
            : approval.reviewerMemberId,
          approvedAt: hasRejection ? undefined : new Date(),
          rejectionReason: hasRejection
            ? allApprovals
                .filter((a) => a.status === 'REJECTED')
                .map((a) => a.comment)
                .join(' | ')
            : undefined,
        },
      });

      // Notify user
      const eventType = hasRejection
        ? EventType.DELIVERABLE_REJECTED
        : EventType.DELIVERABLE_VALIDATED;

      await this.eventPublisher
        .publish(
          eventType,
          AggregateType.USER_DELIVERABLE,
          deliverableId,
          {
            title: approval.deliverable.title,
            decision: finalStatus,
          },
          {
            actorId: userId,
            actorType: 'system',
            tenantId,
            receiverIds: [userId],
            channels: ['socket'],
            priority: 1,
          },
        )
        .catch(() => {});
    } else {
      // Process next pending approval
      const nextPending = allApprovals.find(
        (a) => a.status === 'PENDING',
      );
      if (nextPending) {
        this.processAiApproval(
          deliverableId,
          nextPending.id,
          simulationId,
          userId,
          tenantId,
        ).catch((err) =>
          this.logger.error(
            `Failed next AI approval: ${err.message}`,
          ),
        );
      }
    }
  }

  /**
   * Get approval status for a deliverable.
   */
  async getApprovalStatus(
    simulationId: string,
    deliverableId: string,
    userId: string,
  ) {
    const deliverable = await this.prisma.userDeliverable.findFirst({
      where: { id: deliverableId, simulationId },
      include: {
        simulation: { select: { userId: true } },
        deliverableApprovals: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!deliverable) throw new NotFoundException('Livrable introuvable');
    if (deliverable.simulation.userId !== userId)
      throw new BadRequestException('Acces refuse');

    return {
      chain: deliverable.approvalChain,
      approvals: deliverable.deliverableApprovals,
      status: deliverable.status,
    };
  }
}
