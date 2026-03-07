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
import {
  EmailPriority,
  EmailStatus,
  SimulatedEmail,
  Simulation,
  Scenario,
} from '@prisma/client';
import { EmailGeneratorService } from './email-generator.service';
import { RespondEmailDto } from '../dto';

interface EmailFilters {
  status?: EmailStatus;
  priority?: EmailPriority;
  phaseOrder?: number;
  page?: number;
  limit?: number;
}

@Injectable()
export class SimulatedEmailsService {
  private readonly logger = new Logger(SimulatedEmailsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventPublisher: EventPublisherService,
    private readonly emailGenerator: EmailGeneratorService,
  ) {}

  // ─── Access verification ──────────────────────────────────

  private async getSimulationWithScenario(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id: simulationId, userId, tenantId },
      include: { scenario: true },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation introuvable');
    }

    return simulation;
  }

  private async findEmailOrThrow(
    emailId: string,
    simulationId: string,
    tenantId: string,
  ) {
    const email = await this.prisma.simulatedEmail.findFirst({
      where: { id: emailId, simulationId, tenantId },
    });

    if (!email) {
      throw new NotFoundException('Email introuvable');
    }

    return email;
  }

  // ─── CRUD operations ─────────────────────────────────────

  /**
   * List emails for a simulation with pagination and filters.
   */
  async findAll(
    simulationId: string,
    userId: string,
    tenantId: string,
    filters: EmailFilters = {},
  ) {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);

    const where: Record<string, unknown> = { simulationId, tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.phaseOrder !== undefined) where.phaseOrder = filters.phaseOrder;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      this.prisma.simulatedEmail.findMany({
        where,
        orderBy: [{ priority: 'asc' }, { scheduledAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.simulatedEmail.count({ where }),
    ]);

    return {
      data: emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single email and mark it as READ.
   */
  async findOne(
    simulationId: string,
    emailId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);
    const email = await this.findEmailOrThrow(emailId, simulationId, tenantId);

    // Mark as READ if currently UNREAD
    if (email.status === EmailStatus.UNREAD) {
      const updated = await this.prisma.simulatedEmail.update({
        where: { id: emailId },
        data: {
          status: EmailStatus.READ,
          readAt: new Date(),
        },
      });

      this.eventPublisher
        .publish(
          EventType.EMAIL_READ,
          AggregateType.SIMULATED_EMAIL,
          emailId,
          {
            simulationId,
            subject: email.subject,
            senderName: email.senderName,
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

    return email;
  }

  /**
   * Get unread email count for a simulation.
   */
  async getUnreadCount(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);

    const count = await this.prisma.simulatedEmail.count({
      where: {
        simulationId,
        tenantId,
        status: EmailStatus.UNREAD,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Respond to an email. AI evaluates the response.
   */
  async respond(
    simulationId: string,
    emailId: string,
    userId: string,
    tenantId: string,
    dto: RespondEmailDto,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );
    const email = await this.findEmailOrThrow(emailId, simulationId, tenantId);

    if (email.status === EmailStatus.RESPONDED) {
      throw new BadRequestException('Cet email a deja recu une reponse');
    }

    if (email.status === EmailStatus.ARCHIVED) {
      throw new BadRequestException(
        'Impossible de repondre a un email archive',
      );
    }

    // Save the response immediately
    const updated = await this.prisma.simulatedEmail.update({
      where: { id: emailId },
      data: {
        userResponse: dto.response,
        status: EmailStatus.RESPONDED,
        respondedAt: new Date(),
      },
    });

    // Evaluate response in background (fire-and-forget)
    this.evaluateResponseInBackground(
      email,
      dto.response,
      simulation,
      tenantId,
      userId,
    ).catch((err) =>
      this.logger.error(
        `Background email evaluation failed for ${emailId}: ${err.message}`,
      ),
    );

    this.eventPublisher
      .publish(
        EventType.EMAIL_RESPONDED,
        AggregateType.SIMULATED_EMAIL,
        emailId,
        {
          simulationId,
          subject: email.subject,
          senderName: email.senderName,
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
   * Archive an email.
   */
  async archive(
    simulationId: string,
    emailId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.getSimulationWithScenario(simulationId, userId, tenantId);
    const email = await this.findEmailOrThrow(emailId, simulationId, tenantId);

    if (email.status === EmailStatus.ARCHIVED) {
      throw new BadRequestException('Cet email est deja archive');
    }

    return this.prisma.simulatedEmail.update({
      where: { id: emailId },
      data: { status: EmailStatus.ARCHIVED },
    });
  }

  // ─── Generation operations ────────────────────────────────

  /**
   * Generate the welcome email pack from DRH.
   */
  async generateWelcome(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );

    // Check if a welcome email already exists
    const existing = await this.prisma.simulatedEmail.findFirst({
      where: { simulationId, tenantId, triggerType: 'welcome' },
    });

    if (existing) {
      throw new BadRequestException(
        'L\'email de bienvenue a deja ete genere pour cette simulation',
      );
    }

    const generated = await this.emailGenerator.generateWelcomeEmail(
      simulation,
      tenantId,
      userId,
    );

    const email = await this.prisma.simulatedEmail.create({
      data: {
        simulationId,
        tenantId,
        senderName: generated.senderName,
        senderRole: generated.senderRole,
        senderEmail: generated.senderEmail,
        subject: generated.subject,
        body: generated.body,
        priority: generated.priority,
        status: EmailStatus.UNREAD,
        phaseOrder: 1,
        triggerType: 'welcome',
        scheduledAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.EMAIL_GENERATED,
        AggregateType.SIMULATED_EMAIL,
        email.id,
        {
          simulationId,
          subject: email.subject,
          triggerType: 'welcome',
        },
        {
          actorId: userId,
          actorType: 'system',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return email;
  }

  /**
   * Generate emails for a given phase of the simulation.
   */
  async generateForPhase(
    simulationId: string,
    userId: string,
    tenantId: string,
    phaseOrder?: number,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );

    const targetPhase = phaseOrder ?? simulation.currentPhaseOrder;

    if (targetPhase < 1) {
      throw new BadRequestException(
        'La simulation doit etre demarree avant de generer des emails',
      );
    }

    // Check if phase emails already exist
    const existingCount = await this.prisma.simulatedEmail.count({
      where: {
        simulationId,
        tenantId,
        phaseOrder: targetPhase,
        triggerType: 'phase_start',
      },
    });

    if (existingCount > 0) {
      throw new BadRequestException(
        `Les emails de la phase ${targetPhase} ont deja ete generes`,
      );
    }

    const generatedEmails = await this.emailGenerator.generatePhaseEmails(
      simulation,
      targetPhase,
      tenantId,
      userId,
    );

    const now = new Date();
    const emails = await Promise.all(
      generatedEmails.map((generated, index) =>
        this.prisma.simulatedEmail.create({
          data: {
            simulationId,
            tenantId,
            senderName: generated.senderName,
            senderRole: generated.senderRole,
            senderEmail: generated.senderEmail,
            subject: generated.subject,
            body: generated.body,
            priority: generated.priority,
            status: EmailStatus.UNREAD,
            phaseOrder: targetPhase,
            triggerType: 'phase_start',
            scheduledAt: new Date(now.getTime() + index * 60000), // stagger by 1 min
          },
        }),
      ),
    );

    this.eventPublisher
      .publish(
        EventType.EMAIL_BATCH_GENERATED,
        AggregateType.SIMULATED_EMAIL,
        simulationId,
        {
          simulationId,
          phaseOrder: targetPhase,
          count: emails.length,
        },
        {
          actorId: userId,
          actorType: 'system',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return { data: emails, count: emails.length };
  }

  /**
   * Generate an email triggered by a random event.
   * Called externally (e.g., from SimulationsService when an event triggers).
   */
  async generateForEvent(
    simulationId: string,
    eventId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );

    const event = await this.prisma.randomEvent.findFirst({
      where: { id: eventId, simulationId },
    });

    if (!event) {
      throw new NotFoundException('Evenement introuvable');
    }

    const generated = await this.emailGenerator.generateEventEmail(
      simulation,
      event,
      tenantId,
      userId,
    );

    const email = await this.prisma.simulatedEmail.create({
      data: {
        simulationId,
        tenantId,
        senderName: generated.senderName,
        senderRole: generated.senderRole,
        senderEmail: generated.senderEmail,
        subject: generated.subject,
        body: generated.body,
        priority: generated.priority,
        status: EmailStatus.UNREAD,
        phaseOrder: event.phaseOrder,
        triggerType: 'event_reaction',
        triggerId: eventId,
        scheduledAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.EMAIL_GENERATED,
        AggregateType.SIMULATED_EMAIL,
        email.id,
        {
          simulationId,
          subject: email.subject,
          triggerType: 'event_reaction',
          eventId,
        },
        {
          actorId: userId,
          actorType: 'system',
          tenantId,
          channels: ['socket'],
          priority: 2,
        },
      )
      .catch(() => {});

    return email;
  }

  /**
   * US-5.6: Generate 2-3 simultaneous emails with different priorities.
   * These emails arrive at the same time to test prioritization skills.
   */
  async generateSimultaneousEmails(
    simulationId: string,
    phaseOrder: number,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );

    // Check if simultaneous emails already exist for this phase
    const existingCount = await this.prisma.simulatedEmail.count({
      where: {
        simulationId,
        tenantId,
        phaseOrder,
        triggerType: 'simultaneous',
      },
    });

    if (existingCount > 0) {
      this.logger.debug(
        `Simultaneous emails already generated for phase ${phaseOrder}`,
      );
      return { data: [], count: 0 };
    }

    const generatedEmails =
      await this.emailGenerator.generateSimultaneousEmails(
        simulation,
        phaseOrder,
        tenantId,
        userId,
      );

    const now = new Date();
    const emails = await Promise.all(
      generatedEmails.map((generated) =>
        this.prisma.simulatedEmail.create({
          data: {
            simulationId,
            tenantId,
            senderName: generated.senderName,
            senderRole: generated.senderRole,
            senderEmail: generated.senderEmail,
            subject: generated.subject,
            body: generated.body,
            priority: generated.priority,
            status: EmailStatus.UNREAD,
            phaseOrder,
            triggerType: 'simultaneous',
            scheduledAt: now, // All arrive at the same time
          },
        }),
      ),
    );

    this.eventPublisher
      .publish(
        EventType.EMAIL_BATCH_GENERATED,
        AggregateType.SIMULATED_EMAIL,
        simulationId,
        {
          simulationId,
          phaseOrder,
          count: emails.length,
          triggerType: 'simultaneous',
        },
        {
          actorId: userId,
          actorType: 'system',
          tenantId,
          channels: ['socket'],
          priority: 3,
        },
      )
      .catch(() => {});

    return { data: emails, count: emails.length };
  }

  /**
   * Generate a change request email from the client (US-5.8).
   */
  async generateChangeRequest(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.getSimulationWithScenario(
      simulationId,
      userId,
      tenantId,
    );

    const generated = await this.emailGenerator.generateChangeRequestEmail(
      simulation,
      tenantId,
      userId,
    );

    const email = await this.prisma.simulatedEmail.create({
      data: {
        simulationId,
        tenantId,
        senderName: generated.senderName,
        senderRole: generated.senderRole,
        senderEmail: generated.senderEmail,
        subject: generated.subject,
        body: generated.body,
        priority: generated.priority,
        status: EmailStatus.UNREAD,
        phaseOrder: simulation.currentPhaseOrder,
        triggerType: 'change_request',
        scheduledAt: new Date(),
      },
    });

    this.eventPublisher
      .publish(
        EventType.EMAIL_GENERATED,
        AggregateType.SIMULATED_EMAIL,
        email.id,
        {
          simulationId,
          subject: email.subject,
          triggerType: 'change_request',
        },
        {
          actorId: userId,
          actorType: 'system',
          tenantId,
          channels: ['socket'],
          priority: 3,
        },
      )
      .catch(() => {});

    return email;
  }

  // ─── Private helpers ──────────────────────────────────────

  private async evaluateResponseInBackground(
    email: SimulatedEmail,
    userResponse: string,
    simulation: Simulation & { scenario: Scenario },
    tenantId: string,
    userId: string,
  ): Promise<void> {
    try {
      const evaluation = await this.emailGenerator.evaluateResponse(
        email,
        userResponse,
        simulation,
        tenantId,
        userId,
      );

      await this.prisma.simulatedEmail.update({
        where: { id: email.id },
        data: {
          responseScore: evaluation.score,
          responseFeedback: evaluation.feedback,
        },
      });

      this.logger.log(
        `Email ${email.id} response evaluated: score=${evaluation.score}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to evaluate email response ${email.id}: ${(error as Error).message}`,
      );
    }
  }
}
