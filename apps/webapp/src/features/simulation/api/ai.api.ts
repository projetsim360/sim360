import { api } from '@/lib/api-client';

export interface AiEvaluationResult {
  coaching: string;
  comparison: string | null;
}

export interface AiReportResult {
  report: string;
}

export const aiApi = {
  evaluateDecision: (simulationId: string, decisionId: string, selectedOption: number) =>
    api.post<AiEvaluationResult>('/ai/decision/evaluate', {
      simulationId,
      decisionId,
      selectedOption,
    }),

  getReport: (simulationId: string, type: 'phase' | 'final', phaseOrder?: number) =>
    api.post<AiReportResult>('/ai/simulation/report', {
      simulationId,
      type,
      phaseOrder,
    }),
};
