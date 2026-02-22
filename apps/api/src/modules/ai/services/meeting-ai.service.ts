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
    ]
      .filter(Boolean)
      .join('\n');
  }

  async generateResponse(
    participant: ParticipantContext,
    context: MeetingContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
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
    });

    return result.content;
  }

  streamResponse(
    participant: ParticipantContext,
    context: MeetingContext,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
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
    });
  }

  async generateSummary(
    meetingTitle: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
    kpis: Record<string, number>,
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
    });

    return result.content;
  }
}
