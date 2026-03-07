import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  RecruitmentCampaign,
  CandidateResult,
  CampaignDashboard,
  CampaignPublicInfo,
  ShortlistResult,
  ComparisonResult,
  CreateCampaignDto,
  UpdateCampaignDto,
  PaginatedResponse,
  InterviewQuestion,
} from '../types/recruitment.types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const RECRUITMENT_KEYS = {
  all: ['recruitment'] as const,
  campaigns: () => [...RECRUITMENT_KEYS.all, 'campaigns'] as const,
  campaign: (id: string) => [...RECRUITMENT_KEYS.all, 'campaigns', id] as const,
  dashboard: (id: string) => [...RECRUITMENT_KEYS.all, 'campaigns', id, 'dashboard'] as const,
  candidates: (campaignId: string) =>
    [...RECRUITMENT_KEYS.all, 'campaigns', campaignId, 'candidates'] as const,
  candidateReport: (campaignId: string, candidateId: string) =>
    [...RECRUITMENT_KEYS.all, 'campaigns', campaignId, 'candidates', candidateId] as const,
  shortlist: (campaignId: string) =>
    [...RECRUITMENT_KEYS.all, 'campaigns', campaignId, 'shortlist'] as const,
  interviewGuide: (campaignId: string, candidateId: string) =>
    [...RECRUITMENT_KEYS.all, 'campaigns', campaignId, 'candidates', candidateId, 'interview'] as const,
  publicInfo: (slug: string) => [...RECRUITMENT_KEYS.all, 'join', slug] as const,
};

// ---------------------------------------------------------------------------
// Raw API calls
// ---------------------------------------------------------------------------
export const recruitmentApi = {
  // Campaigns
  getCampaigns: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return api.get<PaginatedResponse<RecruitmentCampaign>>(
      `/recruitment/campaigns${qs ? `?${qs}` : ''}`,
    );
  },

  getCampaign: (id: string) =>
    api.get<RecruitmentCampaign>(`/recruitment/campaigns/${id}`),

  createCampaign: (data: CreateCampaignDto) =>
    api.post<RecruitmentCampaign>('/recruitment/campaigns', data),

  updateCampaign: (id: string, data: UpdateCampaignDto) =>
    api.put<RecruitmentCampaign>(`/recruitment/campaigns/${id}`, data),

  publishCampaign: (id: string) =>
    api.post<RecruitmentCampaign>(`/recruitment/campaigns/${id}/publish`),

  closeCampaign: (id: string) =>
    api.post<RecruitmentCampaign>(`/recruitment/campaigns/${id}/close`),

  archiveCampaign: (id: string) =>
    api.post<RecruitmentCampaign>(`/recruitment/campaigns/${id}/archive`),

  // Dashboard
  getCampaignDashboard: (id: string) =>
    api.get<CampaignDashboard>(`/recruitment/campaigns/${id}/dashboard`),

  // Candidates
  getCandidates: (campaignId: string, params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return api.get<PaginatedResponse<CandidateResult>>(
      `/recruitment/campaigns/${campaignId}/candidates${qs ? `?${qs}` : ''}`,
    );
  },

  getCandidateReport: (campaignId: string, candidateId: string) =>
    api.get<CandidateResult>(
      `/recruitment/campaigns/${campaignId}/candidates/${candidateId}`,
    ),

  // Shortlist
  getShortlist: (campaignId: string, count?: number) => {
    const qs = count ? `?count=${count}` : '';
    return api.get<ShortlistResult>(
      `/recruitment/campaigns/${campaignId}/shortlist${qs}`,
    );
  },

  // Compare
  compareCandidates: (campaignId: string, candidateIds: string[]) =>
    api.post<ComparisonResult>(
      `/recruitment/campaigns/${campaignId}/compare`,
      { candidateIds },
    ),

  // Interview guide
  getInterviewGuide: (campaignId: string, candidateId: string) =>
    api.get<InterviewQuestion[]>(
      `/recruitment/campaigns/${campaignId}/candidates/${candidateId}/interview-guide`,
    ),

  // Public (candidate-facing)
  getCampaignPublicInfo: (slug: string) =>
    api.get<CampaignPublicInfo>(`/recruitment/join/${slug}`),

  joinCampaign: (slug: string) =>
    api.post<{ simulationId: string }>(`/recruitment/join/${slug}/start`),
};

// ---------------------------------------------------------------------------
// TanStack Query hooks
// ---------------------------------------------------------------------------

export const useCampaigns = (params?: { status?: string }) =>
  useQuery({
    queryKey: [...RECRUITMENT_KEYS.campaigns(), params?.status ?? 'all'],
    queryFn: () => recruitmentApi.getCampaigns(params),
  });

export const useCampaign = (id: string) =>
  useQuery({
    queryKey: RECRUITMENT_KEYS.campaign(id),
    queryFn: () => recruitmentApi.getCampaign(id),
    enabled: !!id,
  });

export const useCampaignDashboard = (id: string) =>
  useQuery({
    queryKey: RECRUITMENT_KEYS.dashboard(id),
    queryFn: () => recruitmentApi.getCampaignDashboard(id),
    enabled: !!id,
  });

export const useCandidates = (campaignId: string, params?: { status?: string }) =>
  useQuery({
    queryKey: [...RECRUITMENT_KEYS.candidates(campaignId), params?.status ?? 'all'],
    queryFn: () => recruitmentApi.getCandidates(campaignId, params),
    enabled: !!campaignId,
  });

export const useCandidateReport = (campaignId: string, candidateId: string) =>
  useQuery({
    queryKey: RECRUITMENT_KEYS.candidateReport(campaignId, candidateId),
    queryFn: () => recruitmentApi.getCandidateReport(campaignId, candidateId),
    enabled: !!campaignId && !!candidateId,
  });

export const useShortlist = (campaignId: string, count?: number) =>
  useQuery({
    queryKey: [...RECRUITMENT_KEYS.shortlist(campaignId), count ?? 'default'],
    queryFn: () => recruitmentApi.getShortlist(campaignId, count),
    enabled: !!campaignId,
  });

export const useInterviewGuide = (campaignId: string, candidateId: string) =>
  useQuery({
    queryKey: RECRUITMENT_KEYS.interviewGuide(campaignId, candidateId),
    queryFn: () => recruitmentApi.getInterviewGuide(campaignId, candidateId),
    enabled: !!campaignId && !!candidateId,
  });

export const useCampaignPublicInfo = (slug: string) =>
  useQuery({
    queryKey: RECRUITMENT_KEYS.publicInfo(slug),
    queryFn: () => recruitmentApi.getCampaignPublicInfo(slug),
    enabled: !!slug,
  });

// Mutations ----------------------------------------------------------------

export const useCreateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignDto) => recruitmentApi.createCampaign(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaigns() }),
  });
};

export const useUpdateCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignDto }) =>
      recruitmentApi.updateCampaign(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaign(vars.id) });
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaigns() });
    },
  });
};

export const usePublishCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.publishCampaign(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaign(id) });
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaigns() });
    },
  });
};

export const useCloseCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.closeCampaign(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaign(id) });
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaigns() });
    },
  });
};

export const useArchiveCampaign = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => recruitmentApi.archiveCampaign(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaign(id) });
      qc.invalidateQueries({ queryKey: RECRUITMENT_KEYS.campaigns() });
    },
  });
};

export const useCompareCandidates = () =>
  useMutation({
    mutationFn: ({ campaignId, candidateIds }: { campaignId: string; candidateIds: string[] }) =>
      recruitmentApi.compareCandidates(campaignId, candidateIds),
  });

export const useJoinCampaign = () =>
  useMutation({
    mutationFn: (slug: string) => recruitmentApi.joinCampaign(slug),
  });
