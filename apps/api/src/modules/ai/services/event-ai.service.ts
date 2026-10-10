import { Injectable } from '@nestjs/common';
import { AiService } from '../ai.service';

@Injectable()
export class EventAiService {
  constructor(private aiService: AiService) {}

  async generateEventDescription(
    event: { title: string; type: string; severity: string },
    kpis: Record<string, number>,
    phaseName: string,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string; metadata?: Record<string, unknown> },
  ): Promise<string> {
    const result = await this.aiService.complete({
      prompt: [
        `Génère une description immersive pour cet événement imprévu dans une simulation de gestion de projet.`,
        `Réponds en français correct, avec les accents.`,
        ``,
        `Événement: "${event.title}"`,
        `Type: ${event.type}, Sévérité: ${event.severity}`,
        `Phase actuelle: ${phaseName}`,
        `KPIs: Budget ${kpis.budget}, Délai ${kpis.schedule}, Qualité ${kpis.quality}, Moral ${kpis.teamMorale}, Risque ${kpis.riskLevel}`,
        ``,
        `Rédige 2-3 phrases immersives qui décrivent la situation de manière réaliste et engageante. Adapte le ton à la sévérité.`,
      ].join('\n'),
      maxTokens: 150,
      temperature: 0.7,
      trackingContext,
    });

    return result.content;
  }
}
