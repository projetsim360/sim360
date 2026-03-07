import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  UserProfile,
  QuestionnaireData,
  AptitudeTestData,
  SkillGap,
  CustomProjectData,
  ProfileAdaptation,
} from '../types/profile.types';

const QUERY_KEYS = {
  profile: ['profile'] as const,
  adaptation: ['profile', 'adaptation'] as const,
};

export const profileApi = {
  getProfile: () => api.get<UserProfile>('/profile'),

  uploadCv: (formData: FormData) => api.upload<UserProfile>('/profile/upload-cv', formData),

  importLinkedin: () => api.post<UserProfile>('/profile/import-linkedin'),

  submitQuestionnaire: (data: QuestionnaireData) =>
    api.post<UserProfile>('/profile/questionnaire', data),

  submitAptitudeTest: (data: AptitudeTestData) =>
    api.post<UserProfile>('/profile/aptitude-test', data),

  analyzeProfile: () => api.post<UserProfile>('/profile/analyze'),

  customizeSkills: (skills: SkillGap[]) =>
    api.put<UserProfile>('/profile/skills', { skills }),

  selectSector: (data: { sector: string; difficulty?: string }) =>
    api.put<UserProfile>('/profile/sector', data),

  submitCustomProject: (data: CustomProjectData) =>
    api.post<UserProfile>('/profile/custom-project', data),

  completeOnboarding: () => api.post<UserProfile>('/profile/complete'),

  getAdaptation: () => api.get<ProfileAdaptation>('/profile/adaptation'),
};

export const useProfile = () =>
  useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: profileApi.getProfile,
  });

export const useProfileAdaptation = () =>
  useQuery({
    queryKey: QUERY_KEYS.adaptation,
    queryFn: profileApi.getAdaptation,
    staleTime: 5 * 60 * 1000,
  });

export const useUploadCv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.uploadCv,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useImportLinkedin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.importLinkedin,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useSubmitQuestionnaire = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.submitQuestionnaire,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useSubmitAptitudeTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.submitAptitudeTest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useAnalyzeProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.analyzeProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useCustomizeSkills = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.customizeSkills,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useSelectSector = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.selectSector,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useSubmitCustomProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.submitCustomProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};

export const useCompleteOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.completeOnboarding,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile }),
  });
};
