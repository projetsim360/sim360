import { api } from '@/lib/api-client';
import type { Meeting, MeetingSummary, MeetingSummaryRecord, MeetingDetail } from '../types/meeting.types';

export const meetingApi = {
  // Legacy AI endpoint
  generateSummary: (
    simulationId: string,
    meetingTitle: string,
    history: Array<{ role: 'user' | 'assistant'; content: string }>,
  ) =>
    api.post<MeetingSummary>('/ai/meeting/summary', {
      simulationId,
      meetingTitle,
      history,
    }),

  // CRUD endpoints
  listBySimulation: (simId: string) =>
    api.get<Meeting[]>(`/simulations/${simId}/meetings`),

  getMeeting: (id: string) =>
    api.get<MeetingDetail>(`/meetings/${id}`),

  startMeeting: (id: string) =>
    api.post<Meeting>(`/meetings/${id}/start`),

  completeMeeting: (id: string) =>
    api.post<Meeting>(`/meetings/${id}/complete`),

  getSummary: (id: string) =>
    api.get<MeetingSummaryRecord>(`/meetings/${id}/summary`),
};
