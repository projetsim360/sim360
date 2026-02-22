import { Injectable } from '@nestjs/common';
import { AiService } from '../ai.service';

interface DecisionContext {
  title: string;
  context: string;
  options: Array<{ label: string; description: string; kpiImpact?: Record<string, number> }>;
  selectedOption: number;
  scenarioTitle: string;
  phaseName: string;
  kpis: Record<string, number>;
}

@Injectable()
export class DecisionAiService {
  constructor(private aiService: AiService) {}

  async evaluateDecision(decision: DecisionContext): Promise<{ coaching: string; comparison: string | null }> {
    const selectedOpt = decision.options[decision.selectedOption];
    const optimalIndex = this.findOptimalOption(decision.options);
    const optimalOpt = decision.options[optimalIndex];

    const coaching = await this.getCoaching(decision, selectedOpt);

    let comparison: string | null = null;
    if (optimalIndex !== decision.selectedOption) {
      comparison = await this.compareWithOptimal(decision, selectedOpt, optimalOpt);
    }

    return { coaching, comparison };
  }

  private async getCoaching(
    decision: DecisionContext,
    selectedOpt: { label: string; description: string; kpiImpact?: Record<string, number> },
  ): Promise<string> {
    const result = await this.aiService.complete({
      prompt: [
        `Analyse cette decision de gestion de projet:`,
        ``,
        `Scenario: ${decision.scenarioTitle} — Phase: ${decision.phaseName}`,
        `Decision: "${decision.title}"`,
        `Contexte: ${decision.context}`,
        `Option choisie: "${selectedOpt.label}" — ${selectedOpt.description}`,
        ``,
        `KPIs actuels: Budget ${decision.kpis.budget}, Delai ${decision.kpis.schedule}, Qualite ${decision.kpis.quality}, Moral ${decision.kpis.teamMorale}, Risque ${decision.kpis.riskLevel}.`,
        ``,
        `Fournis un coaching constructif en 3-4 phrases:`,
        `1. Points positifs de ce choix`,
        `2. Risques ou points d'attention`,
        `3. Conseil pour la suite`,
      ].join('\n'),
      maxTokens: 300,
      temperature: 0.6,
    });

    return result.content;
  }

  private async compareWithOptimal(
    decision: DecisionContext,
    selectedOpt: { label: string; description: string },
    optimalOpt: { label: string; description: string },
  ): Promise<string> {
    const result = await this.aiService.complete({
      prompt: [
        `Compare ces deux choix de gestion de projet de maniere pedagogique:`,
        ``,
        `Decision: "${decision.title}"`,
        `Choix de l'apprenant: "${selectedOpt.label}" — ${selectedOpt.description}`,
        `Choix optimal: "${optimalOpt.label}" — ${optimalOpt.description}`,
        ``,
        `Explique en 2-3 phrases pourquoi l'option optimale aurait ete preferable, sans etre critique. Reste encourageant.`,
      ].join('\n'),
      maxTokens: 200,
      temperature: 0.5,
    });

    return result.content;
  }

  private findOptimalOption(options: Array<{ kpiImpact?: Record<string, number> }>): number {
    let bestIndex = 0;
    let bestScore = -Infinity;

    for (let i = 0; i < options.length; i++) {
      const impact = options[i].kpiImpact ?? {};
      const score =
        (impact.budget ?? 0) * 0.25 +
        (impact.schedule ?? 0) * 0.25 +
        (impact.quality ?? 0) * 0.25 +
        (impact.teamMorale ?? 0) * 0.15 -
        (impact.riskLevel ?? 0) * 0.10;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    return bestIndex;
  }
}
