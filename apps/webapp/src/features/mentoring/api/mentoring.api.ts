import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { MentorReview, MentoringSession } from '../types/mentoring.types';

const QUERY_KEYS = {
  pendingReviews: ['mentoring', 'reviews', 'pending'] as const,
  review: (evaluationId: string) => ['mentoring', 'reviews', evaluationId] as const,
  sessions: ['mentoring', 'sessions'] as const,
  session: (id: string) => ['mentoring', 'sessions', id] as const,
};

export const mentoringApi = {
  // Reviews
  createReview: (data: {
    evaluationId: string;
    humanScore: number;
    leadershipScore?: number;
    diplomacyScore?: number;
    postureScore?: number;
    feedback: string;
    recommendations?: string;
  }) => api.post<MentorReview>('/mentoring/reviews', data),

  getReview: (evaluationId: string) =>
    api.get<MentorReview>(`/mentoring/reviews/${evaluationId}`),

  getPendingReviews: () =>
    api.get<MentorReview[]>('/mentoring/reviews/pending'),

  updateReview: (id: string, data: Partial<MentorReview>) =>
    api.put<MentorReview>(`/mentoring/reviews/${id}`, data),

  // Sessions
  createSession: (data: {
    simulationId: string;
    learnerId: string;
    type?: string;
    notes?: string;
  }) => api.post<MentoringSession>('/mentoring/sessions', data),

  getSessions: () =>
    api.get<MentoringSession[]>('/mentoring/sessions'),

  getSession: (id: string) =>
    api.get<MentoringSession>(`/mentoring/sessions/${id}`),

  sendMessage: (sessionId: string, content: string) =>
    api.post<MentoringSession>(`/mentoring/sessions/${sessionId}/messages`, { content }),

  completeSession: (id: string) =>
    api.patch<MentoringSession>(`/mentoring/sessions/${id}/complete`),
};

// ── Query hooks ──────────────────────────────────────────────────────

export const usePendingReviews = () =>
  useQuery({
    queryKey: QUERY_KEYS.pendingReviews,
    queryFn: () => mentoringApi.getPendingReviews(),
  });

export const useReview = (evaluationId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.review(evaluationId),
    queryFn: () => mentoringApi.getReview(evaluationId),
    enabled: !!evaluationId,
  });

export const useMentoringSessions = () =>
  useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: () => mentoringApi.getSessions(),
  });

export const useMentoringSession = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => mentoringApi.getSession(id),
    enabled: !!id,
  });

// ── Mutation hooks ───────────────────────────────────────────────────

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mentoringApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingReviews });
    },
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mentoringApi.createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
  });
};

export const useCompleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mentoringApi.completeSession(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.session(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.sessions });
    },
  });
};
