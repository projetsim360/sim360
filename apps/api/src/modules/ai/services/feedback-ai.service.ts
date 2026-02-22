import { Injectable } from '@nestjs/common';
import { AiService } from '../ai.service';

@Injectable()
export class FeedbackAiService {
  constructor(private aiService: AiService) {}

  async generatePhaseReport(
    phase: { name: string; order: number },
    decisions: Array<{ title: string; selectedOption: number; options: any[]; kpiImpact: any }>,
    kpisBefore: Record<string, number>,
    kpisAfter: Record<string, number>,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string },
  ): Promise<string> {
    const decisionsText = decisions
      .map((d) => {
        const chosen = d.options[d.selectedOption];
        return `- "${d.title}" → "${chosen?.label}" (Impact: ${JSON.stringify(d.kpiImpact ?? {})})`;
      })
      .join('\n');

    const result = await this.aiService.complete({
      prompt: [
        `Genere un bilan pedagogique pour cette phase de simulation de gestion de projet.`,
        ``,
        `Phase: "${phase.name}" (phase ${phase.order + 1})`,
        ``,
        `Decisions prises:`,
        decisionsText || '(aucune decision)',
        ``,
        `KPIs en debut de phase: Budget ${kpisBefore.budget}, Delai ${kpisBefore.schedule}, Qualite ${kpisBefore.quality}, Moral ${kpisBefore.teamMorale}, Risque ${kpisBefore.riskLevel}`,
        `KPIs en fin de phase: Budget ${kpisAfter.budget}, Delai ${kpisAfter.schedule}, Qualite ${kpisAfter.quality}, Moral ${kpisAfter.teamMorale}, Risque ${kpisAfter.riskLevel}`,
        ``,
        `Redige un bilan en 4-5 phrases: ce qui a bien fonctionne, les points a ameliorer, et un conseil pour la phase suivante.`,
      ].join('\n'),
      maxTokens: 400,
      temperature: 0.5,
      trackingContext,
    });

    return result.content;
  }

  async generateFinalReport(
    scenarioTitle: string,
    finalKpis: Record<string, number>,
    finalScore: number,
    decisions: Array<{ title: string; selectedOption: number; options: any[]; kpiImpact: any; phaseOrder: number }>,
    phases: Array<{ name: string; order: number }>,
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string },
  ): Promise<string> {
    const phaseSummaries = phases
      .map((p) => {
        const phaseDecisions = decisions.filter((d) => d.phaseOrder === p.order);
        const decText = phaseDecisions
          .map((d) => `  - "${d.title}" → "${d.options[d.selectedOption]?.label}"`)
          .join('\n');
        return `Phase ${p.order + 1} "${p.name}":\n${decText || '  (aucune decision)'}`;
      })
      .join('\n\n');

    const result = await this.aiService.complete({
      prompt: [
        `Genere un rapport final pedagogique pour cette simulation de gestion de projet.`,
        ``,
        `Scenario: "${scenarioTitle}"`,
        `Score final: ${finalScore.toFixed(1)}/100`,
        ``,
        `KPIs finaux:`,
        `- Budget: ${finalKpis.budget}/100`,
        `- Delai: ${finalKpis.schedule}/100`,
        `- Qualite: ${finalKpis.quality}/100`,
        `- Moral equipe: ${finalKpis.teamMorale}/100`,
        `- Niveau risque: ${finalKpis.riskLevel}/100`,
        ``,
        `Historique des decisions par phase:`,
        phaseSummaries,
        ``,
        `Redige un rapport en 8-10 phrases comprenant:`,
        `1. Appreciation globale de la performance`,
        `2. Points forts (2-3)`,
        `3. Axes d'amelioration (2-3)`,
        `4. Conseil principal pour progresser`,
      ].join('\n'),
      maxTokens: 600,
      temperature: 0.5,
      trackingContext,
    });

    return result.content;
  }
}
