import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService, EventPublisherService, EventType, AggregateType } from '@sim360/core';
import { ConfigService } from '@nestjs/config';
import { AiOrchestratorService, TokenTrackerService } from '../ai/services';
import {
  MeetingPromptContext,
  PromptParticipant,
  buildFallbackOpening,
  buildOpeningInstruction,
  buildParticipantSystemPrompt,
  buildSpeakerLabelledHistory,
  pickFacilitator,
} from '../ai/services/meeting-prompts';
import { CreateCustomMeetingDto, SendMessageDto } from './dto';
import { OPENING_MESSAGE_KIND, needsOpening } from './meeting-opening.util';
import { sectorLabel } from '../simulations/sector-labels';
import { seedsFromSummary } from '../action-items/action-items.util';

interface MessageEvent {
  data: string;
}

const REALTIME_MODEL = 'gpt-realtime';

const DEFAULT_KPIS = { budget: 100, schedule: 100, quality: 80, teamMorale: 75, riskLevel: 20 };


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

  /** Meetings whose opening is being generated — guards against double calls (React StrictMode, retries). */
  private readonly openingsInFlight = new Map<string, Promise<unknown>>();

  constructor(
    private prisma: PrismaService,
    private eventPublisher: EventPublisherService,
    private orchestrator: AiOrchestratorService,
    private config: ConfigService,
    private tokenTracker: TokenTrackerService,
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
    if (simulation.userId !== userId) throw new ForbiddenException('Accès refusé');

    const where: Record<string, unknown> = { simulationId };
    if (filters?.type) where.type = filters.type;
    if (filters?.phaseOrder !== undefined && filters?.phaseOrder !== null) {
      const parsed = Number(filters.phaseOrder);
      if (!isNaN(parsed)) where.phaseOrder = parsed;
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
        simulation: { select: { userId: true, tenantId: true, scenarioId: true, currentPhaseOrder: true, kpis: true, scenario: { select: { title: true, sector: true } }, phases: { where: { status: 'ACTIVE' }, select: { name: true } } } },
      },
    });

    if (!meeting) throw new NotFoundException('Réunion introuvable');
    if (meeting.simulation.userId !== userId) throw new ForbiddenException('Accès refusé');

    return meeting;
  }

  private toPromptParticipant(p: {
    id: string;
    name: string;
    role: string;
    personality: string | null;
    cooperationLevel: number;
    seniority?: string | null;
    objectives?: string | null;
    constraints?: string | null;
    communicationStyle?: string | null;
  }): PromptParticipant {
    return {
      id: p.id,
      name: p.name,
      role: p.role,
      personality: p.personality ?? 'COOPERATIVE',
      cooperationLevel: p.cooperationLevel,
      seniority: p.seniority ?? null,
      objectives: p.objectives ?? null,
      constraints: p.constraints ?? null,
      communicationStyle: p.communicationStyle ?? null,
    };
  }

  private buildPromptContext(
    meeting: Awaited<ReturnType<MeetingsService['findOne']>>,
    forParticipantId?: string,
  ): MeetingPromptContext {
    const kpis = meeting.simulation.kpis;
    return {
      scenarioTitle: meeting.simulation.scenario.title,
      sector: meeting.sector ?? sectorLabel(meeting.simulation.scenario.sector),
      phaseName: meeting.simulation.phases[0]?.name ?? 'Inconnue',
      kpis: kpis
        ? {
            budget: kpis.budget,
            schedule: kpis.schedule,
            quality: kpis.quality,
            teamMorale: kpis.teamMorale,
            riskLevel: kpis.riskLevel,
          }
        : DEFAULT_KPIS,
      projectDescription:
        [meeting.description, meeting.stakes ? `Enjeux à traiter : ${meeting.stakes}` : null].filter(Boolean).join('\n') ||
        undefined,
      meeting: {
        title: meeting.title,
        type: meeting.type,
        objectives: meeting.objectives,
        durationMinutes: meeting.durationMinutes,
        description: meeting.description,
      },
      otherParticipants: meeting.participants
        .filter((p) => p.id !== forParticipantId)
        .map((p) => this.toPromptParticipant(p)),
    };
  }

  /**
   * Produces the facilitator's opening statement for a meeting that has just started.
   * Idempotent: returns the existing messages when the meeting already has some.
   * Never throws on AI failure — falls back to a deterministic opener so the room is never silent.
   */
  async open(id: string, userId: string) {
    const inFlight = this.openingsInFlight.get(id);
    if (inFlight) {
      await inFlight.catch(() => undefined);
      return this.findOne(id, userId).then((m) => ({ created: false, messages: m.messages }));
    }

    const run = (async () => {
      const meeting = await this.findOne(id, userId);
      if (!needsOpening(meeting)) {
        return { created: false, messages: meeting.messages };
      }

      const facilitatorRow = pickFacilitator(meeting.participants.map((p) => ({ ...this.toPromptParticipant(p), id: p.id })));
      if (!facilitatorRow) {
        return { created: false, messages: meeting.messages };
      }

      const context = this.buildPromptContext(meeting, facilitatorRow.id);
      let content: string;
      try {
        content = await this.orchestrator.meeting.generateOpening(facilitatorRow, context, {
          tenantId: meeting.simulation.tenantId,
          userId,
          simulationId: meeting.simulationId,
          operation: 'meeting_opening',
          metadata: { participantName: facilitatorRow.name },
        });
      } catch (err: any) {
        this.logger.warn(`Meeting opening generation failed, using fallback: ${err?.message}`);
        content = '';
      }
      if (!content) content = buildFallbackOpening(context);

      // Re-check right before writing in case another request won the race.
      const existing = await this.prisma.meetingMessage.count({ where: { meetingId: id } });
      if (existing > 0) {
        const fresh = await this.findOne(id, userId);
        return { created: false, messages: fresh.messages };
      }

      await this.prisma.meetingMessage.create({
        data: {
          meetingId: id,
          participantId: facilitatorRow.id,
          content,
          role: 'PARTICIPANT',
          metadata: { kind: OPENING_MESSAGE_KIND },
        },
      });

      const fresh = await this.findOne(id, userId);
      return { created: true, messages: fresh.messages };
    })();

    this.openingsInFlight.set(id, run);
    try {
      return await run;
    } finally {
      this.openingsInFlight.delete(id);
    }
  }

  /**
   * Meeting planned by the learner: subject, objectives, duration, sector, stakes and a cast of
   * participants with role, personality, seniority, objectives and constraints. Attached to the
   * current phase of one of the learner's simulations (KPIs and evaluation depend on it).
   */
  async createCustom(simulationId: string, userId: string, tenantId: string, dto: CreateCustomMeetingDto) {
    const simulation = await this.prisma.simulation.findFirst({
      where: { id: simulationId, tenantId },
      select: { id: true, userId: true, status: true, currentPhaseOrder: true },
    });
    if (!simulation) throw new NotFoundException('Simulation introuvable');
    if (simulation.userId !== userId) throw new ForbiddenException('Accès refusé');
    if (simulation.status === 'COMPLETED' || simulation.status === 'ABANDONED') {
      throw new BadRequestException('Impossible de planifier une réunion dans une simulation terminée');
    }

    const objectives = dto.objectives.map((o) => o.trim()).filter(Boolean);
    const meeting = await this.prisma.meeting.create({
      data: {
        simulationId,
        phaseOrder: simulation.currentPhaseOrder,
        title: dto.title.trim(),
        description: dto.stakes?.trim() || null,
        type: 'CUSTOM',
        objectives,
        durationMinutes: dto.durationMinutes,
        mode: dto.mode ?? 'TEXT',
        isCustom: true,
        createdById: userId,
        sector: dto.sector?.trim() || null,
        stakes: dto.stakes?.trim() || null,
        participants: {
          create: dto.participants.map((p, index) => ({
            name: p.name.trim(),
            role: p.role.trim(),
            personality: p.personality ?? 'NEUTRAL',
            cooperationLevel: p.cooperationLevel ?? 3,
            seniority: p.seniority ?? null,
            objectives: p.objectives?.trim() || null,
            constraints: p.constraints?.trim() || null,
            communicationStyle: p.communicationStyle?.trim() || null,
            avatar: `/media/avatars/300-${(index % 36) + 1}.png`,
          })),
        },
      },
      include: { participants: true, summary: true, _count: { select: { messages: true } } },
    });

    return meeting;
  }

  async start(id: string, userId: string) {
    const meeting = await this.findOne(id, userId);

    if (meeting.status !== 'SCHEDULED') {
      throw new BadRequestException('Cette réunion ne peut pas être démarrée');
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
        receiverIds: [userId],
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
            subscriber.next({ data: JSON.stringify({ error: 'La réunion n\'est pas en cours' }) });
            subscriber.complete();
            return;
          }

          // Enforce 100 messages limit
          const messageCount = await this.prisma.meetingMessage.count({ where: { meetingId: id } });
          if (messageCount >= 100) {
            subscriber.next({ data: JSON.stringify({ error: 'Limite de 100 messages atteinte. Veuillez clôturer la réunion.' }) });
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
            subscriber.next({ data: JSON.stringify({ error: 'Aucun participant dans cette réunion' }) });
            subscriber.complete();
            return;
          }

          // History from the responding participant's point of view: only their own lines are
          // `assistant`, everyone else is labelled "[Nom — rôle]" so personas don't merge.
          const history = buildSpeakerLabelledHistory(meeting.messages, participant.id, 20);
          const context = this.buildPromptContext(meeting, participant.id);
          const participantCtx = this.toPromptParticipant(participant);

          // Stream AI response
          let fullResponse = '';

          const aiStream = this.orchestrator.meeting.streamResponse(
            participantCtx,
            context,
            history,
            dto.content,
            {
              tenantId: meeting.simulation.tenantId,
              userId,
              simulationId: meeting.simulationId,
              operation: 'meeting_stream',
              metadata: { participantName: participant.name, participantRole: participant.role },
            },
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
              receiverIds: [userId],
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
      throw new BadRequestException('Cette réunion ne peut pas être clôturée');
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
      speaker: m.role === 'USER' ? 'Chef de projet' : m.participant ? `${m.participant.name} (${m.participant.role})` : undefined,
    }));

    const participantNames = meeting.participants.map((p) => p.name);

    const structuredSummary = await this.orchestrator.meeting.generateStructuredSummary(
      meeting.title,
      history,
      kpiValues,
      participantNames,
      {
        tenantId: meeting.simulation.tenantId,
        userId,
        simulationId: meeting.simulationId,
        operation: 'meeting_structured_summary',
      },
    );

    // Persist summary, apply KPI impact, and update status
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.meetingSummary.create({
        data: {
          meetingId: id,
          summary: structuredSummary.summary,
          keyDecisions: structuredSummary.keyDecisions,
          actionItems: structuredSummary.actionItems as any,
          actionItemsImported: true,
          kpiImpact: structuredSummary.kpiImpact as any,
        },
      });

      // Editable follow-up actions ("Actions de suivi") seeded from the summary.
      const seeds = seedsFromSummary(structuredSummary.actionItems);
      if (seeds.length > 0) {
        await tx.actionItem.createMany({
          data: seeds.map((seed) => ({
            ...seed,
            tenantId: meeting.simulation.tenantId,
            simulationId: meeting.simulationId,
            meetingId: id,
            source: 'MEETING_SUMMARY',
            createdById: userId,
          })),
        });
      }

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
        receiverIds: [userId],
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

    if (!summary) throw new NotFoundException('Résumé introuvable');
    return summary;
  }

  /**
   * @param options.asOpener whether this participant should open an empty meeting. Defaults to
   *   true for a single-participant session (the only voice in the room), and is set to
   *   "is facilitator" when sessions are created for every participant.
   */
  async createRealtimeSession(
    id: string,
    userId: string,
    participantId?: string,
    options: { asOpener?: boolean } = {},
  ) {
    const meeting = await this.findOne(id, userId);

    if (meeting.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La réunion doit être en cours pour démarrer une session audio');
    }

    const openaiKey = this.config.get<string>('ai.openaiApiKey');
    if (!openaiKey) {
      throw new BadRequestException('Le mode audio n\'est pas configuré sur ce serveur');
    }

    // Determine target participant
    let participant = meeting.participants[0];
    if (participantId) {
      const found = meeting.participants.find((p) => p.id === participantId);
      if (found) participant = found;
      else throw new NotFoundException(`Participant ${participantId} introuvable`);
    }

    const participantIndex = meeting.participants.indexOf(participant);
    const voice = this.mapPersonalityToVoice(participant?.personality, participantIndex);

    // Same persona + realism rules as text mode, plus the conversation so far (each Realtime
    // session is independent, so without it a participant ignores what others said).
    const context = this.buildPromptContext(meeting, participant?.id);
    const facilitator = pickFacilitator(meeting.participants.map((p) => this.toPromptParticipant(p)));
    const isFacilitator = !!participant && facilitator?.id === participant.id;
    const instructions = participant
      ? this.buildRealtimeInstructions(meeting, this.toPromptParticipant(participant), context, isFacilitator)
      : 'Tu es un participant dans une réunion de gestion de projet. Réponds de manière professionnelle et concise.';

    // GA Realtime API — the beta /v1/realtime/sessions endpoint has been removed
    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session: {
          type: 'realtime',
          model: REALTIME_MODEL,
          instructions,
          audio: {
            input: {
              transcription: { model: 'gpt-4o-mini-transcribe' },
              turn_detection: { type: 'server_vad' },
            },
            output: { voice },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`OpenAI Realtime session error: ${errorText}`);
      throw new BadRequestException('Impossible de créer la session audio');
    }

    const data = await response.json();

    // Track session creation tokens (estimate: ~4 tokens per word in instructions)
    const estimatedInputTokens = Math.ceil(instructions.length / 4);
    this.tokenTracker
      .track(
        {
          tenantId: meeting.simulation.tenantId,
          userId,
          simulationId: meeting.simulationId,
          operation: 'realtime_session_create',
          metadata: {
            participantName: participant?.name,
            participantId: participant?.id,
            voice,
            sessionId: data.session?.id,
          },
        },
        'openai',
        REALTIME_MODEL,
        estimatedInputTokens,
        0,
      )
      .catch((err) => this.logger.warn(`Token tracking (session create) failed: ${err.message}`));

    return {
      participantId: participant?.id ?? null,
      participantName: participant?.name ?? 'Participant',
      isFacilitator,
      // Sent by the client as `response.create` once the data channel is open, so the
      // facilitator opens the meeting instead of waiting for the user to speak.
      openingInstruction:
        participant && (options.asOpener ?? true) && meeting.messages.length === 0
          ? // response.create instructions replace the session ones for that turn: keep the persona.
            `${instructions}\n\n${buildOpeningInstruction(context, participant)}`
          : null,
      clientSecret: data.value,
      expiresAt: data.expires_at,
      sessionId: data.session?.id,
      voice,
    };
  }

  async createRealtimeSessions(id: string, userId: string, participantIds?: string[]) {
    const meeting = await this.findOne(id, userId);

    if (meeting.status !== 'IN_PROGRESS') {
      throw new BadRequestException('La réunion doit être en cours pour démarrer les sessions audio');
    }

    // Filter participants if specific IDs provided, otherwise use all
    let targetParticipants = meeting.participants;
    if (participantIds && participantIds.length > 0) {
      targetParticipants = meeting.participants.filter((p) => participantIds.includes(p.id));
      if (targetParticipants.length === 0) {
        throw new BadRequestException('Aucun participant valide trouvé');
      }
    }

    const facilitatorId = pickFacilitator(targetParticipants.map((p) => this.toPromptParticipant(p)))?.id;

    // Create sessions in parallel
    const results = await Promise.allSettled(
      targetParticipants.map((participant) =>
        this.createRealtimeSession(id, userId, participant.id, {
          asOpener: participant.id === facilitatorId,
        }),
      ),
    );

    const sessions = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map((r) => r.value);

    const errors = results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r, i) => ({
        participantId: targetParticipants[i]?.id,
        error: r.reason?.message ?? 'Erreur inconnue',
      }));

    if (errors.length > 0) {
      this.logger.warn(`Failed to create ${errors.length} realtime sessions: ${JSON.stringify(errors)}`);
    }

    return { sessions, errors };
  }

  async saveTranscriptions(
    id: string,
    userId: string,
    transcriptions: Array<{ role: 'user' | 'assistant'; content: string; participantId?: string }>,
  ) {
    const meeting = await this.findOne(id, userId);

    const data = transcriptions.map((t) => ({
      meetingId: id,
      content: t.content,
      role: t.role === 'user' ? 'USER' : 'PARTICIPANT',
      participantId: t.participantId ?? meeting.participants[0]?.id ?? null,
    }));

    await this.prisma.meetingMessage.createMany({ data });

    // Track realtime audio tokens from transcriptions
    // OpenAI Realtime: audio tokens ~ 1 token per character / 4 (rough estimate)
    // We separate user input tokens from assistant output tokens
    const userText = transcriptions
      .filter((t) => t.role === 'user')
      .reduce((acc, t) => acc + t.content.length, 0);
    const assistantText = transcriptions
      .filter((t) => t.role === 'assistant')
      .reduce((acc, t) => acc + t.content.length, 0);

    const estimatedInputTokens = Math.ceil(userText / 4);
    const estimatedOutputTokens = Math.ceil(assistantText / 4);

    if (estimatedInputTokens > 0 || estimatedOutputTokens > 0) {
      this.tokenTracker
        .track(
          {
            tenantId: meeting.simulation.tenantId,
            userId,
            simulationId: meeting.simulationId,
            operation: 'realtime_audio_conversation',
            metadata: {
              meetingId: id,
              meetingTitle: meeting.title,
              messageCount: transcriptions.length,
              userMessages: transcriptions.filter((t) => t.role === 'user').length,
              assistantMessages: transcriptions.filter((t) => t.role === 'assistant').length,
            },
          },
          'openai',
          REALTIME_MODEL,
          estimatedInputTokens,
          estimatedOutputTokens,
        )
        .catch((err) => this.logger.warn(`Token tracking (realtime audio) failed: ${err.message}`));
    }

    return { saved: data.length };
  }

  private buildRealtimeInstructions(
    meeting: Awaited<ReturnType<MeetingsService['findOne']>>,
    participant: PromptParticipant,
    context: MeetingPromptContext,
    isFacilitator: boolean,
  ): string {
    const base = buildParticipantSystemPrompt(participant, context, { maxSentences: '2 à 4 phrases, à l\'oral' });
    const transcript = buildSpeakerLabelledHistory(meeting.messages, participant.id ?? null, 20)
      .map((t) => (t.role === 'assistant' ? `[${participant.name} (toi)] ${t.content}` : t.content))
      .join('\n');
    return [
      base,
      isFacilitator ? '\nTu es la personne qui anime cette réunion côté métier : tu ouvres la séance et tu relances quand un silence s\'installe.' : '',
      transcript ? `\nÉchanges déjà tenus dans cette réunion :\n${transcript}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private mapPersonalityToVoice(personality?: string | null, index = 0): string {
    switch (personality?.toUpperCase()) {
      case 'RESISTANT': return 'echo';
      case 'NEUTRAL': return 'sage';
      case 'COOPERATIVE': return 'coral';
      case 'AGGRESSIVE': return 'ash';
      case 'DIPLOMATIC': return 'shimmer';
    }
    const voices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse'];
    return voices[index % voices.length];
  }
}
