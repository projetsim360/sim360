import { api } from '@/lib/api-client';

export interface AiUsage {
  currentMonthInput: number;
  currentMonthOutput: number;
  periodStart: string;
}

export interface AiQuota {
  monthlyInputLimit: number;
  monthlyOutputLimit: number;
  currentMonthInput: number;
  currentMonthOutput: number;
  remainingInput: number;
  remainingOutput: number;
}

export interface SimulationUsage {
  simulationId: string;
  projectName: string;
  scenarioTitle: string;
  inputTokens: number;
  outputTokens: number;
  callCount: number;
}

export interface BillingBreakdownItem {
  inputTokens: number;
  outputTokens: number;
  cost: number;
  calls: number;
}

export interface AiBilling {
  periodStart: string;
  currency: string;
  marginPercent: number;
  totalCost: number;
  totalInput: number;
  totalOutput: number;
  totalCalls: number;
  byModel: Array<BillingBreakdownItem & { model: string }>;
  byOperation: Array<BillingBreakdownItem & { operation: string }>;
  bySimulation: Array<BillingBreakdownItem & {
    simulationId: string;
    projectName: string;
    scenarioTitle: string;
  }>;
}

export const aiUsageApi = {
  getUsage: () => api.get<AiUsage>('/ai/usage'),
  getQuota: () => api.get<AiQuota>('/ai/usage/quota'),
  getUsageBySimulation: () => api.get<SimulationUsage[]>('/ai/usage/by-simulation'),
  getBilling: () => api.get<AiBilling>('/ai/usage/billing'),
  updateQuota: (monthlyInputLimit: number, monthlyOutputLimit: number) =>
    api.put('/ai/usage/quota', { monthlyInputLimit, monthlyOutputLimit }),
};
