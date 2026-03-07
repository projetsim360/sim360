import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AiService } from '../ai.service';

interface ParticipantContext {
  name: string;
  role: string;
  personality: string;
  expertise: string;
  morale: number;
}

interface MeetingContext {
  scenarioTitle: string;
  phaseName: string;
  kpis: Record<string, number>;
  projectDescription?: string;
}

interface MessageEvent {
  data: string;
}

@Injectable()
export class MeetingAiService {
  constructor(private aiService: AiService) {}

  buildParticipantSystemPrompt(participant: ParticipantContext, context: MeetingContext): string {
    const cooperationInstructions = this.buildCooperationInstructions(participant);

    return [
      `Tu es ${participant.name}, ${participant.role} dans un projet de gestion.`,
      `Personnalite: ${participant.personality}. Expertise: ${participant.expertise}. Moral actuel: ${participant.morale}/100.`,
      ``,
      `Contexte du projet: "${context.scenarioTitle}" — Phase: ${context.phaseName}.`,
      context.projectDescription ? `Description: ${context.projectDescription}` : '',
      ``,
      `KPIs actuels:`,
      `- Budget: ${context.kpis.budget}/100`,
      `- Delai: ${context.kpis.schedule}/100`,
      `- Qualite: ${context.kpis.quality}/100`,
      `- Moral equipe: ${context.kpis.teamMorale}/100`,
      `- Niveau risque: ${context.kpis.riskLevel}/100`,
      ``,
      `Instructions:`,
      `- Reponds en tant que ce personnage avec sa personnalite.`,
      `- Reste concis (2-4 phrases max).`,
      `- Prends en compte les KPIs pour orienter tes preoccupations.`,
      `- Ne sors jamais du role.`,
      cooperationInstructions,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private buildCooperationInstructions(participant: ParticipantContext): string {
    const morale = participant.morale;
    const personality = participant.personality.toUpperCase();

    if (personality === 'RESISTANT' || morale < 40) {
      return [
        ``,
        `Comportement conflictuel:`,
        `- Tu es frustre et sceptique. Exprime des doutes sur les decisions prises.`,
        `- Conteste les propositions du chef de projet si elles te semblent risquees.`,
        `- Signale les problemes sans proposer de solutions. Sois direct et parfois sec.`,
        `- Si le moral est bas (${morale}/100), montre ton mecontentement ouvertement.`,
      ].join('\n');
    }

    if (personality === 'NEUTRAL' || (morale >= 40 && morale < 60)) {
      return [
        ``,
        `Comportement neutre:`,
        `- Tu es pragmatique. Tu donnes ton avis factuel sans t'engager emotionnellement.`,
        `- Tu peux exprimer des reserves ou des desaccords si les KPIs sont mauvais.`,
        `- Tu poses des questions difficiles mais restes professionnel.`,
      ].join('\n');
    }

    // COOPERATIVE or high morale
    return [
      ``,
      `Comportement cooperatif:`,
      `- Tu es constructif et propose des solutions. Tu soutiens les bonnes decisions.`,
      `- Si un KPI est critique (<30), exprime de l'inquietude de maniere constructive.`,
    ].join('\n');
  }

  async generateResponse(
    participant: ParticipantContext,
    context: MeetingContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> },
  ): Promise<string> {
    const systemPrompt = this.buildParticipantSystemPrompt(participant, context);

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-20),
      { role: 'user', content: userMessage },
    ];

    const result = await this.aiService.complete({
      prompt: userMessage,
      systemPrompt,
      systemPromptCacheKey: `meeting:${participant.name}:${context.phaseName}`,
      messages,
      maxTokens: 200,
      temperature: 0.8,
      trackingContext,
    });

    return result.content;
  }

  streamResponse(
    participant: ParticipantContext,
    context: MeetingContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> },
  ): Observable<MessageEvent> {
    const systemPrompt = this.buildParticipantSystemPrompt(participant, context);

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-20),
      { role: 'user', content: userMessage },
    ];

    return this.aiService.streamWithAnthropic({
      prompt: userMessage,
      systemPrompt,
      systemPromptCacheKey: `meeting:${participant.name}:${context.phaseName}`,
      messages,
      maxTokens: 200,
      temperature: 0.8,
      trackingContext,
    });
  }

  async generateSummary(
    meetingTitle: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    kpis: Record<string, number>,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> },
  ): Promise<string> {
    const conversationText = history
      .map((m) => `${m.role === 'user' ? 'Utilisateur' : 'Participant'}: ${m.content}`)
      .join('\n');

    const result = await this.aiService.complete({
      prompt: [
        `Resume cette reunion "${meetingTitle}".`,
        ``,
        `Conversation:`,
        conversationText,
        ``,
        `KPIs actuels: Budget ${kpis.budget}, Delai ${kpis.schedule}, Qualite ${kpis.quality}, Moral ${kpis.teamMorale}, Risque ${kpis.riskLevel}.`,
        ``,
        `Fournis exactement 3 points cles en format bullet points. Sois concis et factuel.`,
      ].join('\n'),
      maxTokens: 300,
      temperature: 0.3,
      trackingContext,
    });

    return result.content;
  }

  async generateStructuredSummary(
    meetingTitle: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    kpis: Record<string, number>,
    participantNames: string[],
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> },
  ): Promise<{
    summary: string;
    keyDecisions: string[];
    actionItems: Array<{ task: string; assignee: string; deadline?: string }>;
    kpiImpact: Record<string, number>;
  }> {
    const conversationText = history
      .map((m) => `${m.role === 'user' ? 'Chef de projet' : 'Participant'}: ${m.content}`)
      .join('\n');

    const result = await this.aiService.complete({
      prompt: [
        `Analyse cette reunion "${meetingTitle}" et produis un compte-rendu structure.`,
        ``,
        `Participants: ${participantNames.join(', ')}`,
        ``,
        `Conversation:`,
        conversationText,
        ``,
        `KPIs actuels: Budget ${kpis.budget}/100, Delai ${kpis.schedule}/100, Qualite ${kpis.quality}/100, Moral ${kpis.teamMorale}/100, Risque ${kpis.riskLevel}/100.`,
        ``,
        `Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) avec cette structure exacte:`,
        `{`,
        `  "summary": "Resume en 3-5 phrases de la reunion",`,
        `  "keyDecisions": ["Decision 1", "Decision 2"],`,
        `  "actionItems": [{"task": "Description de la tache", "assignee": "Nom du responsable", "deadline": "Echeance estimee"}],`,
        `  "kpiImpact": {"budget": 0, "schedule": 0, "quality": 0, "teamMorale": 0, "riskLevel": 0}`,
        `}`,
        ``,
        `Pour kpiImpact, estime l'impact de cette reunion sur chaque KPI (valeur entre -10 et +10).`,
        `Pour actionItems, identifie 2-4 actions concretes issues de la conversation avec un responsable parmi les participants.`,
        `Pour keyDecisions, identifie 1-3 decisions prises pendant la reunion.`,
      ].join('\n'),
      maxTokens: 800,
      temperature: 0.2,
      trackingContext,
    });

    try {
      const cleaned = result.content
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      return {
        summary: parsed.summary ?? result.content,
        keyDecisions: Array.isArray(parsed.keyDecisions) ? parsed.keyDecisions : [],
        actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
        kpiImpact: parsed.kpiImpact ?? {},
      };
    } catch {
      // Fallback if JSON parsing fails
      return {
        summary: result.content,
        keyDecisions: [],
        actionItems: [],
        kpiImpact: {},
      };
    }
  }
}
