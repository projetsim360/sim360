import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

export interface SimulationCounts {
  pendingDecisions: number;
  pendingEvents: number;
  pendingMeetings: number;
  unreadEmails: number;
  pendingDeliverables: number;
  projectName: string;
  currentPhase: string;
  simulationStatus: string;
  budgetScore: number;
  scheduleScore: number;
  qualityScore: number;
}

const QUERY_KEY = {
  counts: (id: string) => ['simulation', id, 'counts'] as const,
};

export function useSimulationCounts(simulationId: string | null) {
  return useQuery({
    queryKey: QUERY_KEY.counts(simulationId ?? ''),
    queryFn: () => api.get<SimulationCounts>(`/simulations/${simulationId}/counts`),
    enabled: !!simulationId,
    refetchInterval: 30_000,
  });
}
