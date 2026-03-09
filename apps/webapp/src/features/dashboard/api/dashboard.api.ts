import { api } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';
import type { DashboardSummary, GlobalDashboard, LearnerSummary } from '../types/dashboard.types';

const DASHBOARD_KEYS = {
  all: ['dashboard'] as const,
  summary: ['dashboard', 'summary'] as const,
  global: ['dashboard', 'global'] as const,
};

export const dashboardApi = {
  getGlobalDashboard: () => api.get<GlobalDashboard>('/dashboard'),
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
  getTrainerDashboard: (params?: { scenario?: string; period?: string }) => {
    const query = new URLSearchParams();
    if (params?.scenario) query.set('scenario', params.scenario);
    if (params?.period) query.set('period', params.period);
    const qs = query.toString();
    return api.get<LearnerSummary[]>(`/dashboard/trainer${qs ? `?${qs}` : ''}`);
  },
};

export const useDashboardSummary = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.summary,
    queryFn: dashboardApi.getSummary,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useGlobalDashboard = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.global,
    queryFn: dashboardApi.getGlobalDashboard,
    staleTime: 5 * 60 * 1000,
  });
