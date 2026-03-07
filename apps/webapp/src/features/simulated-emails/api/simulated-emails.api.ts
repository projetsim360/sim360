import { api } from '@/lib/api-client';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  SimulatedEmail,
  EmailFilters,
  RespondToEmailDto,
} from '../types/simulated-email.types';

const QUERY_KEYS = {
  all: (simId: string) => ['simulated-emails', simId] as const,
  detail: (simId: string, emailId: string) =>
    ['simulated-emails', simId, emailId] as const,
  unreadCount: (simId: string) =>
    ['simulated-emails', simId, 'unread-count'] as const,
};

export const simulatedEmailsApi = {
  getEmails: (simId: string, filters?: EmailFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.phase !== undefined) params.set('phase', String(filters.phase));
    const qs = params.toString();
    return api
      .get<{ data: SimulatedEmail[]; meta: Record<string, unknown> }>(
        `/simulations/${simId}/emails${qs ? `?${qs}` : ''}`,
      )
      .then((res) => res.data);
  },

  getUnreadCount: (simId: string) =>
    api.get<{ count: number }>(`/simulations/${simId}/emails/unread-count`),

  getEmail: (simId: string, emailId: string) =>
    api.get<SimulatedEmail>(`/simulations/${simId}/emails/${emailId}`),

  respond: (simId: string, emailId: string, data: RespondToEmailDto) =>
    api.post<SimulatedEmail>(
      `/simulations/${simId}/emails/${emailId}/respond`,
      data,
    ),

  archive: (simId: string, emailId: string) =>
    api.post<SimulatedEmail>(
      `/simulations/${simId}/emails/${emailId}/archive`,
    ),
};

// ---------- Query hooks ----------

export const useSimulatedEmails = (simId: string, filters?: EmailFilters) =>
  useQuery({
    queryKey: [...QUERY_KEYS.all(simId), filters],
    queryFn: () => simulatedEmailsApi.getEmails(simId, filters),
    enabled: !!simId,
  });

export const useUnreadEmailCount = (simId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.unreadCount(simId),
    queryFn: () => simulatedEmailsApi.getUnreadCount(simId),
    enabled: !!simId,
    refetchInterval: 30_000,
  });

export const useSimulatedEmail = (simId: string, emailId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.detail(simId, emailId),
    queryFn: () => simulatedEmailsApi.getEmail(simId, emailId),
    enabled: !!simId && !!emailId,
  });

// ---------- Mutation hooks ----------

export const useRespondToEmail = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      emailId,
      data,
    }: {
      emailId: string;
      data: RespondToEmailDto;
    }) => simulatedEmailsApi.respond(simId, emailId, data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(simId, variables.emailId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadCount(simId),
      });
    },
  });
};

export const useArchiveEmail = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emailId: string) =>
      simulatedEmailsApi.archive(simId, emailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.unreadCount(simId),
      });
    },
  });
};
