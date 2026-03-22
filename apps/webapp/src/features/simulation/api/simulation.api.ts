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
  createSimulation: (scenarioId: string, startingPhaseOrder?: number) =>
    api.post<any>('/simulations', { scenarioId, ...(startingPhaseOrder !== undefined && { startingPhaseOrder }) }),
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
  getSimulationDashboard: (id: string) => api.get<any>(`/simulations/${id}/dashboard`),
  getKpis: (id: string) => api.get<any>(`/simulations/${id}/kpis`),
  getKpiHistory: (id: string) => api.get<any[]>(`/simulations/${id}/kpis/history`),
  getTimeline: (id: string) => api.get<any[]>(`/simulations/${id}/timeline`),

  // Handover
  getHandoverStatus: (simId: string) => api.get<any>(`/simulations/${simId}/handover`),
  completeHandover: (simId: string) => api.post<any>(`/simulations/${simId}/handover/complete`),

  // Scenario generation
  generateScenario: (params: {
    projectName?: string;
    projectDescription?: string;
    constraints?: string;
    learningObjectives?: string;
    sector?: string;
    difficulty?: string;
    scenarioType?: string;
    useProfile?: boolean;
  }) => api.post<any>('/scenarios/generate', params),

  // Recommended scenarios
  getRecommendedScenarios: (limit?: number) => {
    const qs = limit ? `?limit=${limit}` : '';
    return api.get<any[]>(`/scenarios/recommended${qs}`);
  },

  // Publish scenario (for AI-generated scenarios)
  publishScenario: (id: string) => api.put<any>(`/scenarios/${id}`, { isPublished: true }),

  // Stakeholder suggestion
  suggestStakeholders: (simId: string, charterContent?: string) =>
    api.post<any[]>(`/simulations/${simId}/stakeholders/suggest`, { charterContent }),

  applyStakeholders: (simId: string, stakeholders: Array<{ name: string; role: string; expertise: string; personality: string; morale?: number }>) =>
    api.post<any>(`/simulations/${simId}/stakeholders/apply`, { stakeholders }),
};
