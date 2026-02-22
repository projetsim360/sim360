import { Injectable } from '@nestjs/common';

export interface KpiValues {
  budget: number;
  schedule: number;
  quality: number;
  teamMorale: number;
  riskLevel: number;
}

export interface KpiImpact {
  budget?: number;
  schedule?: number;
  quality?: number;
  teamMorale?: number;
  riskLevel?: number;
}

@Injectable()
export class KpiEngineService {
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  applyImpact(current: KpiValues, impact: KpiImpact): KpiValues {
    return {
      budget: this.clamp(current.budget + (impact.budget ?? 0), 0, 100),
      schedule: this.clamp(current.schedule + (impact.schedule ?? 0), 0, 100),
      quality: this.clamp(current.quality + (impact.quality ?? 0), 0, 100),
      teamMorale: this.clamp(current.teamMorale + (impact.teamMorale ?? 0), 0, 100),
      riskLevel: this.clamp(current.riskLevel + (impact.riskLevel ?? 0), 0, 100),
    };
  }

  calculateFinalScore(kpis: KpiValues): number {
    return (
      kpis.budget * 0.25 +
      kpis.schedule * 0.25 +
      kpis.quality * 0.25 +
      kpis.teamMorale * 0.15 +
      (100 - kpis.riskLevel) * 0.10
    );
  }

  shouldTriggerEvent(probability: number, kpis: KpiValues, triggerConditions?: Record<string, number>): boolean {
    if (triggerConditions) {
      if (triggerConditions.maxBudget !== undefined && kpis.budget > triggerConditions.maxBudget) return false;
      if (triggerConditions.minBudget !== undefined && kpis.budget < triggerConditions.minBudget) return false;
      if (triggerConditions.maxQuality !== undefined && kpis.quality > triggerConditions.maxQuality) return false;
      if (triggerConditions.minRiskLevel !== undefined && kpis.riskLevel < triggerConditions.minRiskLevel) return false;
    }
    return Math.random() < probability;
  }
}
