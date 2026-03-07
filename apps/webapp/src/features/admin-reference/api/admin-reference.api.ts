import { api } from '@/lib/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  DeliverableTemplate,
  CreateDeliverableTemplateDto,
  UpdateDeliverableTemplateDto,
  DeliverableTemplateFilters,
  ReferenceDocument,
  CreateReferenceDocumentDto,
  UpdateReferenceDocumentDto,
  ReferenceDocumentFilters,
} from '../types/admin-reference.types';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const TEMPLATE_QUERY_KEYS = {
  all: ['deliverable-templates'] as const,
  list: (filters?: DeliverableTemplateFilters) => ['deliverable-templates', 'list', filters] as const,
  detail: (id: string) => ['deliverable-templates', id] as const,
  versions: (id: string) => ['deliverable-templates', id, 'versions'] as const,
};

export const DOCUMENT_QUERY_KEYS = {
  all: ['reference-documents'] as const,
  list: (filters?: ReferenceDocumentFilters) => ['reference-documents', 'list', filters] as const,
  detail: (id: string) => ['reference-documents', id] as const,
  versions: (id: string) => ['reference-documents', id, 'versions'] as const,
};

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

function buildQueryString(params?: Record<string, unknown>): string {
  if (!params) return '';
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export const deliverableTemplateApi = {
  getTemplates: (params?: DeliverableTemplateFilters) =>
    api.get<PaginatedResponse<DeliverableTemplate>>(`/admin/deliverable-templates${buildQueryString(params)}`).then((res) => res.data),

  getTemplate: (id: string) =>
    api.get<DeliverableTemplate>(`/admin/deliverable-templates/${id}`),

  createTemplate: (data: CreateDeliverableTemplateDto) =>
    api.post<DeliverableTemplate>('/admin/deliverable-templates', data),

  updateTemplate: (id: string, data: UpdateDeliverableTemplateDto) =>
    api.put<DeliverableTemplate>(`/admin/deliverable-templates/${id}`, data),

  toggleTemplate: (id: string) =>
    api.patch<DeliverableTemplate>(`/admin/deliverable-templates/${id}/toggle`),

  getTemplateVersions: (id: string) =>
    api.get<DeliverableTemplate[]>(`/admin/deliverable-templates/${id}/versions`),
};

export const referenceDocumentApi = {
  getDocuments: (params?: ReferenceDocumentFilters) =>
    api.get<PaginatedResponse<ReferenceDocument>>(`/admin/reference-documents${buildQueryString(params)}`).then((res) => res.data),

  getDocument: (id: string) =>
    api.get<ReferenceDocument>(`/admin/reference-documents/${id}`),

  createDocument: (data: CreateReferenceDocumentDto) =>
    api.post<ReferenceDocument>('/admin/reference-documents', data),

  updateDocument: (id: string, data: UpdateReferenceDocumentDto) =>
    api.put<ReferenceDocument>(`/admin/reference-documents/${id}`, data),

  getDocumentVersions: (id: string) =>
    api.get<ReferenceDocument[]>(`/admin/reference-documents/${id}/versions`),
};

// ---------------------------------------------------------------------------
// TanStack Query Hooks — Deliverable Templates
// ---------------------------------------------------------------------------

export const useDeliverableTemplates = (filters?: DeliverableTemplateFilters) =>
  useQuery({
    queryKey: TEMPLATE_QUERY_KEYS.list(filters),
    queryFn: () => deliverableTemplateApi.getTemplates(filters),
  });

export const useDeliverableTemplate = (id: string) =>
  useQuery({
    queryKey: TEMPLATE_QUERY_KEYS.detail(id),
    queryFn: () => deliverableTemplateApi.getTemplate(id),
    enabled: !!id,
  });

export const useCreateDeliverableTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliverableTemplateApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_QUERY_KEYS.all });
    },
  });
};

export const useUpdateDeliverableTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDeliverableTemplateDto }) =>
      deliverableTemplateApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_QUERY_KEYS.all });
    },
  });
};

export const useToggleDeliverableTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliverableTemplateApi.toggleTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEMPLATE_QUERY_KEYS.all });
    },
  });
};

// ---------------------------------------------------------------------------
// TanStack Query Hooks — Reference Documents
// ---------------------------------------------------------------------------

export const useReferenceDocuments = (filters?: ReferenceDocumentFilters) =>
  useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(filters),
    queryFn: () => referenceDocumentApi.getDocuments(filters),
  });

export const useReferenceDocument = (id: string) =>
  useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.detail(id),
    queryFn: () => referenceDocumentApi.getDocument(id),
    enabled: !!id,
  });

export const useCreateReferenceDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: referenceDocumentApi.createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
    },
  });
};

export const useUpdateReferenceDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReferenceDocumentDto }) =>
      referenceDocumentApi.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_QUERY_KEYS.all });
    },
  });
};
