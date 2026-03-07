import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import {
  PrismaService,
  EventPublisherService,
  EventType,
  AggregateType,
} from '@sim360/core';
import { Observable } from 'rxjs';
import { AiService } from '@/modules/ai/ai.service';
import { PmoContextService } from './pmo-context.service';
import { DeliverableTemplatesService } from '@/modules/admin-reference/services/deliverable-templates.service';

interface MessageEvent {
  data: string;
}

@Injectable()
export class PmoService {
  private readonly logger = new Logger(PmoService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly pmoContext: PmoContextService,
    private readonly eventPublisher: EventPublisherService,
    private readonly deliverableTemplatesService: DeliverableTemplatesService,
  ) {}

  /**
   * Verify that a simulation belongs to the user and tenant.
   */
  private async verifySimulationAccess(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id: simulationId, userId, tenantId },
      select: { id: true, status: true, tenantId: true },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation introuvable');
    }

    return simulation;
  }

  /**
   * Get or create the PMO conversation for a simulation.
   */
  private async getOrCreateConversation(simulationId: string) {
    let conversation = await this.prisma.pmoConversation.findUnique({
      where: { simulationId },
    });

    if (!conversation) {
      conversation = await this.prisma.pmoConversation.create({
        data: { simulationId },
      });
    }

    return conversation;
  }

  /**
   * SSE chat with the PMO agent.
   * Saves user message, builds enriched context, streams AI response,
   * and saves assistant message on completion.
   */
  chat(
    simulationId: string,
    userId: string,
    tenantId: string,
    message: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      (async () => {
        try {
          // 1. Verify access
          await this.verifySimulationAccess(simulationId, userId, tenantId);

          // 2. Get or create conversation
          const conversation =
            await this.getOrCreateConversation(simulationId);

          // 3. Save user message
          await this.prisma.pmoMessage.create({
            data: {
              conversationId: conversation.id,
              role: 'user',
              content: message,
            },
          });

          // 4. Build enriched context and system prompt
          const context = await this.pmoContext.buildContext(simulationId);
          const systemPrompt = this.pmoContext.buildSystemPrompt(context);

          // 5. Load conversation history (last 30 messages for context window)
          const recentMessages = await this.prisma.pmoMessage.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'asc' },
            take: 30,
          });

          const aiMessages = recentMessages
            .filter((m) => m.role !== 'system')
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }));

          // 6. Check if user is asking for a template — enrich context
          const templateMatch = await this.checkTemplateRequest(
            message,
            tenantId,
            context.templates,
          );
          let enrichedPrompt = systemPrompt;
          if (templateMatch) {
            enrichedPrompt += `\n\n## Template demande par l'apprenant\nVoici le contenu du template "${templateMatch.title}" (type: ${templateMatch.type}) :\n\n${templateMatch.content}\n\nPresente ce template a l'apprenant en expliquant comment l'adapter a son projet.`;

            // Emit template request event
            this.eventPublisher
              .publish(
                EventType.PMO_TEMPLATE_REQUESTED,
                AggregateType.PMO_CONVERSATION,
                conversation.id,
                {
                  simulationId,
                  templateId: templateMatch.id,
                  templateTitle: templateMatch.title,
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
          }

          // 7. Stream AI response
          let fullResponse = '';

          const aiStream = this.aiService.stream({
            prompt: message,
            systemPrompt: enrichedPrompt,
            systemPromptCacheKey: `pmo:${simulationId}`,
            maxTokens: 2000,
            temperature: 0.7,
            messages: aiMessages,
            trackingContext: {
              tenantId,
              userId,
              simulationId,
              operation: 'pmo_chat',
            },
          });

          aiStream.subscribe({
            next: (event) => {
              const parsed = JSON.parse(event.data);
              if (parsed.token) {
                fullResponse += parsed.token;
              }
              subscriber.next(event);
            },
            error: (err) => {
              this.logger.error(
                `PMO chat streaming error: ${err.message}`,
                err.stack,
              );
              subscriber.next({
                data: JSON.stringify({
                  error: 'Erreur lors de la communication avec le PMO',
                }),
              });
              subscriber.complete();
            },
            complete: async () => {
              // 8. Save assistant message
              if (fullResponse) {
                await this.prisma.pmoMessage
                  .create({
                    data: {
                      conversationId: conversation.id,
                      role: 'assistant',
                      content: fullResponse,
                      metadata: templateMatch
                        ? { templateId: templateMatch.id }
                        : undefined,
                    },
                  })
                  .catch((err) =>
                    this.logger.error(
                      `Failed to save PMO response: ${err.message}`,
                    ),
                  );
              }

              // 9. Emit event
              this.eventPublisher
                .publish(
                  EventType.PMO_MESSAGE_SENT,
                  AggregateType.PMO_CONVERSATION,
                  conversation.id,
                  { simulationId, messageLength: message.length },
                  {
                    actorId: userId,
                    actorType: 'user',
                    tenantId,
                    channels: ['socket'],
                    priority: 1,
                  },
                )
                .catch(() => {});

              subscriber.complete();
            },
          });
        } catch (err: any) {
          this.logger.error(`PMO chat error: ${err.message}`, err.stack);
          subscriber.next({
            data: JSON.stringify({ error: err.message }),
          });
          subscriber.complete();
        }
      })();
    });
  }

  /**
   * Get paginated conversation history.
   */
  async getHistory(
    simulationId: string,
    userId: string,
    tenantId: string,
    page = 1,
    limit = 50,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    const conversation = await this.prisma.pmoConversation.findUnique({
      where: { simulationId },
    });

    if (!conversation) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.pmoMessage.findMany({
        where: { conversationId: conversation.id },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.pmoMessage.count({
        where: { conversationId: conversation.id },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get current simulation context (for UI display).
   */
  async getContext(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);
    return this.pmoContext.buildContext(simulationId);
  }

  /**
   * Initialize the PMO conversation with welcome messages.
   * Creates the conversation and generates welcome + project intro messages.
   */
  async initConversation(
    simulationId: string,
    userId: string,
    tenantId: string,
  ) {
    await this.verifySimulationAccess(simulationId, userId, tenantId);

    // Check if conversation already exists with messages
    const existing = await this.prisma.pmoConversation.findUnique({
      where: { simulationId },
      include: { messages: { take: 1 } },
    });

    if (existing && existing.messages.length > 0) {
      // Return existing messages
      const messages = await this.prisma.pmoMessage.findMany({
        where: { conversationId: existing.id },
        orderBy: { createdAt: 'asc' },
      });
      return { conversationId: existing.id, messages };
    }

    const conversation =
      existing ?? (await this.prisma.pmoConversation.create({ data: { simulationId } }));

    // Build context for personalized welcome
    const context = await this.pmoContext.buildContext(simulationId);
    const projectInfo = context.scenario.projectTemplate as Record<
      string,
      unknown
    >;

    // Generate welcome message via AI
    const welcomeResult = await this.aiService.complete({
      prompt: `Genere un message d'accueil pour un apprenant qui commence une simulation de gestion de projet. Le message doit inclure :
1. Un accueil chaleureux de la part du departement RH/PMO
2. Une presentation rapide du projet : "${projectInfo.name || 'le projet'}" pour le client "${projectInfo.client || 'le client'}" dans le secteur ${context.scenario.sector}
3. Les objectifs principaux du scenario
4. Les livrables attendus dans la premiere phase
5. Une invitation a poser des questions

Reponds en francais, en markdown, de maniere professionnelle mais chaleureuse.`,
      systemPrompt: `Tu es un PMO qui accueille un nouvel apprenant dans une simulation de gestion de projet. Le scenario est "${context.scenario.title}" de difficulte ${context.scenario.difficulty}.`,
      maxTokens: 1500,
      temperature: 0.8,
      trackingContext: {
        tenantId,
        userId,
        simulationId,
        operation: 'pmo_init',
      },
    });

    // Save system welcome message
    const systemMessage = await this.prisma.pmoMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'system',
        content: `Bienvenue dans la simulation "${context.scenario.title}". Votre PMO est a votre disposition pour vous guider.`,
      },
    });

    // Save PMO welcome message
    const assistantMessage = await this.prisma.pmoMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: welcomeResult.content,
      },
    });

    return {
      conversationId: conversation.id,
      messages: [systemMessage, assistantMessage],
    };
  }

  /**
   * Check if the user message is requesting a template.
   * Simple keyword matching — the AI will handle the nuance.
   */
  private async checkTemplateRequest(
    message: string,
    tenantId: string,
    availableTemplates: Array<{
      id: string;
      title: string;
      type: string;
      phase: string;
    }>,
  ): Promise<{
    id: string;
    title: string;
    type: string;
    content: string;
  } | null> {
    const lowerMessage = message.toLowerCase();
    const templateKeywords = [
      'template',
      'modele',
      'modele',
      'gabarit',
      'canevas',
    ];
    const hasTemplateKeyword = templateKeywords.some((k) =>
      lowerMessage.includes(k),
    );

    if (!hasTemplateKeyword || availableTemplates.length === 0) {
      return null;
    }

    // Try to find which template matches
    for (const t of availableTemplates) {
      const titleLower = t.title.toLowerCase();
      const typeLower = t.type.toLowerCase();
      if (
        lowerMessage.includes(titleLower) ||
        lowerMessage.includes(typeLower)
      ) {
        try {
          const template = await this.deliverableTemplatesService.findOne(
            tenantId,
            t.id,
          );
          return {
            id: template.id,
            title: template.title,
            type: template.type,
            content: template.content,
          };
        } catch {
          return null;
        }
      }
    }

    // If keyword found but no specific match, return first relevant template
    // The AI will decide how to handle it
    return null;
  }
}
