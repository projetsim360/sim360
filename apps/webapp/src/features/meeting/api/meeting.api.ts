import { api } from '@/lib/api-client';
import type { CustomMeetingPayload } from '../lib/custom-meeting';
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

  /** Learner-planned meeting (subject, objectives, duration, participants). */
  createCustomMeeting: (simId: string, payload: CustomMeetingPayload) =>
    api.post<Meeting>(`/simulations/${simId}/meetings`, payload),

  getMeeting: (id: string) =>
    api.get<MeetingDetail>(`/meetings/${id}`),

  startMeeting: (id: string) =>
    api.post<Meeting>(`/meetings/${id}/start`),

  /** Asks the facilitator to open the meeting. Idempotent server-side. */
  openMeeting: (id: string) =>
    api.post<{ created: boolean; messages: MeetingDetail['messages'] }>(`/meetings/${id}/open`),

  completeMeeting: (id: string) =>
    api.post<Meeting>(`/meetings/${id}/complete`),

  getSummary: (id: string) =>
    api.get<MeetingSummaryRecord>(`/meetings/${id}/summary`),

  createRealtimeSession: (id: string) =>
    api.post<{ clientSecret: string; expiresAt: number; sessionId: string; voice: string; participantId: string; participantName: string }>(
      `/meetings/${id}/realtime-session`,
    ),

  createRealtimeSessions: (id: string, participantIds?: string[]) =>
    api.post<{
      sessions: Array<{ participantId: string; participantName: string; clientSecret: string; expiresAt: number; sessionId: string; voice: string; openingInstruction?: string | null }>;
      errors: Array<{ participantId: string; error: string }>;
    }>(`/meetings/${id}/realtime-sessions`, { participantIds }),

  createRealtimeSessionForParticipant: (id: string, participantId: string) =>
    api.post<{ participantId: string; participantName: string; clientSecret: string; expiresAt: number; sessionId: string; voice: string; openingInstruction?: string | null }>(
      `/meetings/${id}/realtime-session/${participantId}`,
    ),

  saveTranscriptions: (
    id: string,
    transcriptions: Array<{ role: 'user' | 'assistant'; content: string; participantId?: string }>,
  ) =>
    api.post<{ saved: number }>(`/meetings/${id}/transcriptions`, { transcriptions }),
};
