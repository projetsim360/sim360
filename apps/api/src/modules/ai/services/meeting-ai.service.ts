import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AiService } from '../ai.service';

import {
  ChatTurn,
  MeetingPromptContext,
  PromptParticipant,
  appendUserTurn,
  buildOpeningInstruction,
  buildParticipantSystemPrompt,
} from './meeting-prompts';

type TrackingContext = { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> };

/** A transcript line for summaries: `speaker` is the display name ("Chef de projet", "Marie — DAF"). */
export interface TranscriptLine {
  role: 'user' | 'assistant';
  content: string;
  speaker?: string;
}

interface MessageEvent {
  data: string;
}

function formatTranscript(history: TranscriptLine[], userLabel: string): string {
  return history
    .map((m) => `${m.speaker ?? (m.role === 'user' ? userLabel : 'Participant')}: ${m.content}`)
    .join('\n');
}

@Injectable()
export class MeetingAiService {
  constructor(private aiService: AiService) {}

  buildParticipantSystemPrompt(participant: PromptParticipant, context: MeetingPromptContext): string {
    return buildParticipantSystemPrompt(participant, context);
  }

  // No systemPromptCacheKey on purpose: the prompt depends on live KPIs, the meeting and
  // the other participants, and a name-based key leaked prompts across simulations.

  async generateResponse(
    participant: PromptParticipant,
    context: MeetingPromptContext,
    history: ChatTurn[],
    userMessage: string,
    trackingContext?: TrackingContext,
  ): Promise<string> {
    const result = await this.aiService.complete({
      prompt: userMessage,
      systemPrompt: this.buildParticipantSystemPrompt(participant, context),
      messages: appendUserTurn(history, userMessage),
      maxTokens: 220,
      temperature: 0.8,
      trackingContext,
    });

    return result.content;
  }

  streamResponse(
    participant: PromptParticipant,
    context: MeetingPromptContext,
    history: ChatTurn[],
    userMessage: string,
    trackingContext?: TrackingContext,
  ): Observable<MessageEvent> {
    return this.aiService.streamWithAnthropic({
      prompt: userMessage,
      systemPrompt: this.buildParticipantSystemPrompt(participant, context),
      messages: appendUserTurn(history, userMessage),
      maxTokens: 220,
      temperature: 0.8,
      trackingContext,
    });
  }

  /** Opening statement by the facilitator, so a meeting never starts in silence. */
  async generateOpening(
    facilitator: PromptParticipant,
    context: MeetingPromptContext,
    trackingContext?: TrackingContext,
  ): Promise<string> {
    const instruction = buildOpeningInstruction(context, facilitator);
    const result = await this.aiService.complete({
      prompt: instruction,
      systemPrompt: buildParticipantSystemPrompt(facilitator, context, { maxSentences: '3 à 5 phrases' }),
      messages: [{ role: 'user', content: `[Note de séance] ${instruction}` }],
      maxTokens: 300,
      temperature: 0.7,
      trackingContext,
    });
    return result.content.trim();
  }

  async generateSummary(
    meetingTitle: string,
    history: TranscriptLine[],
    kpis: Record<string, number>,
    trackingContext?: TrackingContext,
  ): Promise<string> {
    const conversationText = formatTranscript(history, 'Utilisateur');

    const result = await this.aiService.complete({
      prompt: [
        `Résume cette réunion « ${meetingTitle} ».`,
        ``,
        `Conversation:`,
        conversationText,
        ``,
        `Indicateurs actuels : budget ${kpis.budget}, délai ${kpis.schedule}, qualité ${kpis.quality}, moral ${kpis.teamMorale}, risque ${kpis.riskLevel}.`,
        ``,
        `Fournis exactement 3 points clés sous forme de puces. Sois concis et factuel. Écris en français correct, avec les accents.`,
      ].join('\n'),
      maxTokens: 300,
      temperature: 0.3,
      trackingContext,
    });

    return result.content;
  }

  async generateStructuredSummary(
    meetingTitle: string,
    history: TranscriptLine[],
    kpis: Record<string, number>,
    participantNames: string[],
    trackingContext?: TrackingContext,
  ): Promise<{
    summary: string;
    keyDecisions: string[];
    actionItems: Array<{ task: string; assignee: string; deadline?: string }>;
    kpiImpact: Record<string, number>;
  }> {
    const conversationText = formatTranscript(history, 'Chef de projet');

    const result = await this.aiService.complete({
      prompt: [
        `Analyse cette réunion « ${meetingTitle} » et produis un compte rendu structuré, en français correct avec les accents.`,
        ``,
        `Participants: ${participantNames.join(', ')}`,
        ``,
        `Conversation:`,
        conversationText,
        ``,
        `Indicateurs actuels : budget ${kpis.budget}/100, délai ${kpis.schedule}/100, qualité ${kpis.quality}/100, moral ${kpis.teamMorale}/100, risque ${kpis.riskLevel}/100.`,
        ``,
        `Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) avec cette structure exacte :`,
        `{`,
        `  "summary": "Résumé de la réunion en 3 à 5 phrases",`,
        `  "keyDecisions": ["Décision 1", "Décision 2"],`,
        `  "actionItems": [{"task": "Description de l'action", "assignee": "Nom du responsable", "deadline": "Échéance (ex. : fin de semaine, J+10)"}],`,
        `  "kpiImpact": {"budget": 0, "schedule": 0, "quality": 0, "teamMorale": 0, "riskLevel": 0}`,
        `}`,
        ``,
        `Pour kpiImpact, estime l'impact de cette réunion sur chaque indicateur (valeur entre -10 et +10).`,
        `Pour actionItems, identifie 2 à 4 actions concrètes issues de la conversation, avec un responsable parmi les participants ou le chef de projet.`,
        `Pour keyDecisions, identifie 1 à 3 décisions prises pendant la réunion.`,
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
