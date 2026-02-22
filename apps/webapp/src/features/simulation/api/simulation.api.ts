import { api } from '@/lib/api-client';

export const simulationApi = {
  // Scenarios
  getScenarios: (params?: { sector?: string; difficulty?: string }) => {
    const query = new URLSearchParams();
    if (params?.sector) query.set('sector', params.sector);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    const qs = query.toString();
    return api.get<any[]>(`/scenarios${qs ? `?${qs}` : ''}`);
  },
  getScenario: (id: string) => api.get<any>(`/scenarios/${id}`),

  // Simulations
  getSimulations: (status?: string) => {
    const qs = status ? `?status=${status}` : '';
    return api.get<any[]>(`/simulations${qs}`);
  },
  getSimulation: (id: string) => api.get<any>(`/simulations/${id}`),
  createSimulation: (scenarioId: string) =>
    api.post<any>('/simulations', { scenarioId }),
  pauseSimulation: (id: string) =>
    api.patch<any>(`/simulations/${id}/pause`),
  resumeSimulation: (id: string) =>
    api.patch<any>(`/simulations/${id}/resume`),
  advancePhase: (id: string) =>
    api.post<any>(`/simulations/${id}/advance-phase`),
  makeDecision: (simId: string, decId: string, selectedOption: number) =>
    api.post<any>(`/simulations/${simId}/decisions/${decId}/choose`, { selectedOption }),
  respondToEvent: (simId: string, evtId: string, selectedOption: number) =>
    api.post<any>(`/simulations/${simId}/events/${evtId}/respond`, { selectedOption }),
  getKpis: (id: string) => api.get<any>(`/simulations/${id}/kpis`),
  getTimeline: (id: string) => api.get<any[]>(`/simulations/${id}/timeline`),
};
