import { Injectable } from '@nestjs/common';
import { AiService } from '../ai.service';

@Injectable()
export class EventAiService {
  constructor(private aiService: AiService) {}

  async generateEventDescription(
    event: { title: string; type: string; severity: string },
    kpis: Record<string, number>,
    phaseName: string,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string },
  ): Promise<string> {
    const result = await this.aiService.complete({
      prompt: [
        `Genere une description immersive pour cet evenement imprevu dans une simulation de gestion de projet.`,
        ``,
        `Evenement: "${event.title}"`,
        `Type: ${event.type}, Severite: ${event.severity}`,
        `Phase actuelle: ${phaseName}`,
        `KPIs: Budget ${kpis.budget}, Delai ${kpis.schedule}, Qualite ${kpis.quality}, Moral ${kpis.teamMorale}, Risque ${kpis.riskLevel}`,
        ``,
        `Redige 2-3 phrases immersives qui decrivent la situation de maniere realiste et engageante. Adapte le ton a la severite.`,
      ].join('\n'),
      maxTokens: 150,
      temperature: 0.7,
      trackingContext,
    });

    return result.content;
  }
}
