import { api } from '@/lib/api-client';
import type { GlobalDashboard, LearnerSummary } from '../types/dashboard.types';

export const dashboardApi = {
  getGlobalDashboard: () => api.get<GlobalDashboard>('/dashboard'),
  getTrainerDashboard: (params?: { scenario?: string; period?: string }) => {
    const query = new URLSearchParams();
    if (params?.scenario) query.set('scenario', params.scenario);
    if (params?.period) query.set('period', params.period);
    const qs = query.toString();
    return api.get<LearnerSummary[]>(`/dashboard/trainer${qs ? `?${qs}` : ''}`);
  },
};
