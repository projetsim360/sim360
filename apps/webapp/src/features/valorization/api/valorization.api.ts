import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CompetencyBadge,
  DebriefingData,
  PortfolioData,
  CvSuggestions,
  BadgeVerification,
} from '../types/valorization.types';

const QUERY_KEYS = {
  debriefing: (simId: string) => ['valorization', 'debriefing', simId] as const,
  portfolio: (simId: string) => ['valorization', 'portfolio', simId] as const,
  cvSuggestions: (simId: string) => ['valorization', 'cv-suggestions', simId] as const,
  myBadges: ['valorization', 'badges'] as const,
  badge: (id: string) => ['valorization', 'badges', id] as const,
  badgeVerification: (id: string) => ['valorization', 'badges', id, 'verify'] as const,
};

export const valorizationApi = {
  getDebriefing: (simId: string) =>
    api.get<DebriefingData>(`/simulations/${simId}/debriefing`),

  getPortfolio: (simId: string) =>
    api.get<PortfolioData>(`/simulations/${simId}/portfolio`),

  getCvSuggestions: (simId: string) =>
    api.get<CvSuggestions>(`/simulations/${simId}/cv-suggestions`),

  getMyBadges: () =>
    api.get<CompetencyBadge[]>('/users/me/badges'),

  getBadge: (id: string) =>
    api.get<CompetencyBadge>(`/badges/${id}`),

  shareBadge: (id: string) =>
    api.post<{ shareToken: string; shareUrl: string }>(`/badges/${id}/share`),

  verifyBadge: (id: string) =>
    api.get<BadgeVerification>(`/badges/${id}/verify`),
};

export const useDebriefing = (simId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.debriefing(simId),
    queryFn: () => valorizationApi.getDebriefing(simId),
    enabled: !!simId,
  });

export const usePortfolio = (simId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.portfolio(simId),
    queryFn: () => valorizationApi.getPortfolio(simId),
    enabled: !!simId,
  });

export const useCvSuggestions = (simId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.cvSuggestions(simId),
    queryFn: () => valorizationApi.getCvSuggestions(simId),
    enabled: !!simId,
  });

export const useMyBadges = () =>
  useQuery({
    queryKey: QUERY_KEYS.myBadges,
    queryFn: valorizationApi.getMyBadges,
  });

export const useBadge = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.badge(id),
    queryFn: () => valorizationApi.getBadge(id),
    enabled: !!id,
  });

export const useShareBadge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => valorizationApi.shareBadge(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.badge(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myBadges });
    },
  });
};

export const useBadgeVerification = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.badgeVerification(id),
    queryFn: () => valorizationApi.verifyBadge(id),
    enabled: !!id,
  });
