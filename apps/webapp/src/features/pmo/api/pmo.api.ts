import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import type { PmoMessage, PmoContext, PmoHistoryResponse } from '../types/pmo.types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

export const PMO_QUERY_KEYS = {
  history: (simId: string) => ['pmo', 'history', simId] as const,
  context: (simId: string) => ['pmo', 'context', simId] as const,
};

export const pmoApi = {
  chat: (simulationId: string, message: string) => {
    const token = localStorage.getItem('sim360_access_token');
    return fetch(`${BASE_URL}/simulations/${simulationId}/pmo/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });
  },

  getHistory: (simulationId: string, page = 1, limit = 50) =>
    api.get<PmoHistoryResponse>(
      `/simulations/${simulationId}/pmo/history?page=${page}&limit=${limit}`,
    ),

  getContext: (simulationId: string) =>
    api.get<PmoContext>(`/simulations/${simulationId}/pmo/context`),

  initConversation: (simulationId: string) =>
    api.post<PmoMessage[]>(`/simulations/${simulationId}/pmo/init`),
};

export const usePmoHistory = (simulationId: string, enabled = true) =>
  useQuery({
    queryKey: PMO_QUERY_KEYS.history(simulationId),
    queryFn: () => pmoApi.getHistory(simulationId),
    enabled: !!simulationId && enabled,
  });

export const usePmoContext = (simulationId: string, enabled = true) =>
  useQuery({
    queryKey: PMO_QUERY_KEYS.context(simulationId),
    queryFn: () => pmoApi.getContext(simulationId),
    enabled: !!simulationId && enabled,
    refetchInterval: 30000,
  });
