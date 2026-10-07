import { api } from '@/lib/api-client';
import type { ActionItem, CreateActionItemInput, UpdateActionItemInput } from '../types/action-item.types';

export const actionItemsApi = {
  list: (simulationId: string, meetingId?: string) =>
    api.get<ActionItem[]>(
      `/simulations/${simulationId}/action-items${meetingId ? `?meetingId=${encodeURIComponent(meetingId)}` : ''}`,
    ),
  create: (simulationId: string, input: CreateActionItemInput) =>
    api.post<ActionItem>(`/simulations/${simulationId}/action-items`, input),
  update: (id: string, input: UpdateActionItemInput) => api.patch<ActionItem>(`/action-items/${id}`, input),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`/action-items/${id}`),
};
