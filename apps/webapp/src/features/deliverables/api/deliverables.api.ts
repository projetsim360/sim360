import { api } from '@/lib/api-client';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  UserDeliverable,
  DeliverableEvaluation,
  DeliverableTemplate,
  DeliverableFilters,
  CreateDeliverableDto,
  ApprovalStatus,
} from '../types/deliverables.types';

const QUERY_KEYS = {
  all: (simId: string) => ['deliverables', simId] as const,
  detail: (simId: string, id: string) => ['deliverables', simId, id] as const,
  evaluation: (simId: string, id: string) =>
    ['deliverables', simId, id, 'evaluation'] as const,
  template: (simId: string, id: string) =>
    ['deliverables', simId, id, 'template'] as const,
  reference: (simId: string, id: string) =>
    ['deliverables', simId, id, 'reference'] as const,
};

export const deliverablesApi = {
  getDeliverables: (simId: string, filters?: DeliverableFilters) => {
    const params = new URLSearchParams();
    if (filters?.phase !== undefined) params.set('phase', String(filters.phase));
    if (filters?.status) params.set('status', filters.status);
    const qs = params.toString();
    return api.get<{ data: UserDeliverable[]; summary: { validated: number; total: number } }>(
      `/simulations/${simId}/deliverables${qs ? `?${qs}` : ''}`,
    ).then((res) => res.data);
  },

  getDeliverable: (simId: string, id: string) =>
    api.get<UserDeliverable>(`/simulations/${simId}/deliverables/${id}`),

  createDeliverable: (simId: string, data: CreateDeliverableDto) =>
    api.post<UserDeliverable>(`/simulations/${simId}/deliverables`, data),

  saveContent: (simId: string, id: string, content: string) =>
    api.patch<UserDeliverable>(
      `/simulations/${simId}/deliverables/${id}/content`,
      { content },
    ),

  submitDeliverable: (simId: string, id: string) =>
    api.post<UserDeliverable>(
      `/simulations/${simId}/deliverables/${id}/submit`,
    ),

  getEvaluation: (simId: string, id: string) =>
    api.get<DeliverableEvaluation>(
      `/simulations/${simId}/deliverables/${id}/evaluation`,
    ),

  getTemplate: (simId: string, id: string) =>
    api.get<DeliverableTemplate>(
      `/simulations/${simId}/deliverables/${id}/template`,
    ),

  getReference: (simId: string, id: string) =>
    api.get<{ referenceExample: string }>(
      `/simulations/${simId}/deliverables/${id}/reference`,
    ),

  reviseDeliverable: (simId: string, id: string) =>
    api.post<UserDeliverable>(
      `/simulations/${simId}/deliverables/${id}/revise`,
    ),

  // Delegation
  assignToExpert: (simId: string, id: string, teamMemberId: string, instructions?: string) =>
    api.post<UserDeliverable>(`/simulations/${simId}/deliverables/${id}/assign`, {
      teamMemberId,
      instructions,
    }),

  requestRevision: (simId: string, id: string, feedback: string) =>
    api.post<UserDeliverable>(`/simulations/${simId}/deliverables/${id}/request-revision`, {
      feedback,
    }),

  // Approval
  defineApprovalChain: (
    simId: string,
    id: string,
    chain: Array<{ role: string; memberId: string }>,
  ) =>
    api.post<UserDeliverable>(`/simulations/${simId}/deliverables/${id}/approval-chain`, {
      chain,
    }),

  submitForApproval: (simId: string, id: string) =>
    api.post<UserDeliverable>(`/simulations/${simId}/deliverables/${id}/submit-approval`),

  getApprovalStatus: (simId: string, id: string) =>
    api.get<ApprovalStatus>(`/simulations/${simId}/deliverables/${id}/approval-status`),
};

// ---------- Query hooks ----------

export const useDeliverables = (
  simId: string,
  filters?: DeliverableFilters,
) =>
  useQuery({
    queryKey: [...QUERY_KEYS.all(simId), filters],
    queryFn: () => deliverablesApi.getDeliverables(simId, filters),
    enabled: !!simId,
  });

export const useDeliverable = (simId: string, id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.detail(simId, id),
    queryFn: () => deliverablesApi.getDeliverable(simId, id),
    enabled: !!simId && !!id,
  });

export const useDeliverableEvaluation = (simId: string, id: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.evaluation(simId, id),
    queryFn: () => deliverablesApi.getEvaluation(simId, id),
    enabled: !!simId && !!id && enabled,
  });

export const useDeliverableTemplate = (simId: string, id: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.template(simId, id),
    queryFn: () => deliverablesApi.getTemplate(simId, id),
    enabled: !!simId && !!id && enabled,
  });

export const useDeliverableReference = (simId: string, id: string, enabled = true) =>
  useQuery({
    queryKey: QUERY_KEYS.reference(simId, id),
    queryFn: () => deliverablesApi.getReference(simId, id),
    enabled: !!simId && !!id && enabled,
  });

// ---------- Mutation hooks ----------

export const useCreateDeliverable = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDeliverableDto) =>
      deliverablesApi.createDeliverable(simId, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

export const useSaveContent = (simId: string, id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      deliverablesApi.saveContent(simId, id, content),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.detail(simId, id),
      }),
  });
};

export const useSubmitDeliverable = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliverablesApi.submitDeliverable(simId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

export const useReviseDeliverable = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliverablesApi.reviseDeliverable(simId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

// ---------- Delegation hooks ----------

export const useAssignToExpert = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      teamMemberId,
      instructions,
    }: {
      id: string;
      teamMemberId: string;
      instructions?: string;
    }) => deliverablesApi.assignToExpert(simId, id, teamMemberId, instructions),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

export const useRequestRevision = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
      deliverablesApi.requestRevision(simId, id, feedback),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

// ---------- Approval hooks ----------

export const useDefineApprovalChain = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      chain,
    }: {
      id: string;
      chain: Array<{ role: string; memberId: string }>;
    }) => deliverablesApi.defineApprovalChain(simId, id, chain),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

export const useSubmitForApproval = (simId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliverablesApi.submitForApproval(simId, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.all(simId) }),
  });
};

export const useApprovalStatus = (simId: string, id: string, enabled = true) =>
  useQuery({
    queryKey: [...QUERY_KEYS.detail(simId, id), 'approval'] as const,
    queryFn: () => deliverablesApi.getApprovalStatus(simId, id),
    enabled: !!simId && !!id && enabled,
  });
