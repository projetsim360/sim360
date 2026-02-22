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
  decisionHistory?: Array<{ selectedOption: number; optimalOption: number; kpiImpact: Record<string, number> }>;
}

export type DecisionPattern = 'cautious' | 'aggressive' | 'balanced' | 'inconsistent';

export interface PatternAnalysis {
  pattern: DecisionPattern;
  confidence: number;
  description: string;
}

@Injectable()
export class DecisionAiService {
  constructor(private aiService: AiService) {}

  async evaluateDecision(decision: DecisionContext, trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string }): Promise<{
    score: number;
    scoreJustification: string;
    coaching: string;
    comparison: string | null;
    patternAnalysis: PatternAnalysis | null;
  }> {
    const selectedOpt = decision.options[decision.selectedOption];
    const optimalIndex = this.findOptimalOption(decision.options);
    const optimalOpt = decision.options[optimalIndex];

    const { score, justification } = this.calculateScore(decision, optimalIndex);
    const coaching = await this.getCoaching(decision, selectedOpt, trackingContext);

    let comparison: string | null = null;
    if (optimalIndex !== decision.selectedOption) {
      comparison = await this.compareWithOptimal(decision, selectedOpt, optimalOpt, trackingContext);
    }

    // Detect decision-making pattern if history available
    let patternAnalysis: PatternAnalysis | null = null;
    if (decision.decisionHistory && decision.decisionHistory.length >= 3) {
      patternAnalysis = this.detectPattern(decision.decisionHistory);
    }

    return { score, scoreJustification: justification, coaching, comparison, patternAnalysis };
  }

  private detectPattern(history: Array<{ selectedOption: number; optimalOption: number; kpiImpact: Record<string, number> }>): PatternAnalysis {
    let cautious = 0;
    let aggressive = 0;
    let optimal = 0;

    for (const entry of history) {
      const impact = entry.kpiImpact;
      const netImpact = Object.values(impact).reduce((sum, v) => sum + v, 0);
      const riskImpact = impact.riskLevel ?? 0;

      if (entry.selectedOption === entry.optimalOption) {
        optimal++;
      }

      // Cautious: consistently avoids risk (low net impact, negative risk)
      if (riskImpact < 0 && netImpact <= 5) {
        cautious++;
      }
      // Aggressive: high positive impact but accepts risk
      else if (riskImpact > 0 && netImpact > 5) {
        aggressive++;
      }
    }

    const total = history.length;
    const cautiousRatio = cautious / total;
    const aggressiveRatio = aggressive / total;
    const optimalRatio = optimal / total;

    if (cautiousRatio >= 0.6) {
      return {
        pattern: 'cautious',
        confidence: Math.round(cautiousRatio * 100),
        description: 'Vous tendez vers des choix prudents qui minimisent les risques. Cela protege vos KPIs mais peut limiter les gains potentiels.',
      };
    }

    if (aggressiveRatio >= 0.6) {
      return {
        pattern: 'aggressive',
        confidence: Math.round(aggressiveRatio * 100),
        description: 'Vous privilegiez des choix ambitieux avec des impacts forts. Cela maximise les gains potentiels mais augmente l\'exposition aux risques.',
      };
    }

    if (optimalRatio >= 0.7) {
      return {
        pattern: 'balanced',
        confidence: Math.round(optimalRatio * 100),
        description: 'Vous faites des choix equilibres et souvent optimaux. Vos decisions montrent une bonne analyse des compromis.',
      };
    }

    return {
      pattern: 'inconsistent',
      confidence: Math.round((1 - optimalRatio) * 50 + 50),
      description: 'Vos choix varient significativement. Essayez de definir une strategie coherente pour ameliorer vos resultats.',
    };
  }

  private calculateScore(
    decision: DecisionContext,
    optimalIndex: number,
  ): { score: number; justification: string } {
    const selectedImpact = decision.options[decision.selectedOption]?.kpiImpact ?? {};
    const optimalImpact = decision.options[optimalIndex]?.kpiImpact ?? {};

    // Score de base : proximite avec l'option optimale (0-60 points)
    const selectedWeighted = this.weightedScore(selectedImpact);
    const optimalWeighted = this.weightedScore(optimalImpact);

    let proximityScore: number;
    if (optimalWeighted === 0) {
      proximityScore = decision.selectedOption === optimalIndex ? 60 : 40;
    } else {
      const ratio = Math.max(0, selectedWeighted / Math.abs(optimalWeighted));
      proximityScore = Math.min(60, Math.round(ratio * 60));
    }

    // Bonus : choix optimal (0-25 points)
    const optimalBonus = decision.selectedOption === optimalIndex ? 25 : 0;

    // Bonus contextuel : KPIs critiques preserves (0-15 points)
    let contextBonus = 15;
    const criticalKpis = Object.entries(decision.kpis).filter(
      ([key, val]) => key !== 'riskLevel' && val < 40,
    );
    for (const [key] of criticalKpis) {
      const impact = selectedImpact[key] ?? 0;
      if (impact < 0) contextBonus -= 5;
    }
    contextBonus = Math.max(0, contextBonus);

    const totalScore = Math.min(100, Math.max(0, proximityScore + optimalBonus + contextBonus));

    const parts: string[] = [];
    if (decision.selectedOption === optimalIndex) {
      parts.push('Choix optimal selectionne.');
    } else {
      parts.push(`Choix sous-optimal (option optimale : "${decision.options[optimalIndex].label}").`);
    }
    if (criticalKpis.length > 0 && contextBonus < 15) {
      parts.push('Des KPIs critiques ont ete impactes negativement.');
    }

    return { score: totalScore, justification: parts.join(' ') };
  }

  private weightedScore(impact: Record<string, number>): number {
    return (
      (impact.budget ?? 0) * 0.25 +
      (impact.schedule ?? 0) * 0.25 +
      (impact.quality ?? 0) * 0.25 +
      (impact.teamMorale ?? 0) * 0.15 -
      (impact.riskLevel ?? 0) * 0.10
    );
  }

  private async getCoaching(
    decision: DecisionContext,
    selectedOpt: { label: string; description: string; kpiImpact?: Record<string, number> },
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string },
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
      trackingContext,
    });

    return result.content;
  }

  private async compareWithOptimal(
    decision: DecisionContext,
    selectedOpt: { label: string; description: string },
    optimalOpt: { label: string; description: string },
    trackingContext?: { tenantId: string; userId: string; simulationId?: string; operation: string },
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
      trackingContext,
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
