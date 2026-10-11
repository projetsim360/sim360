import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { actionItemsApi } from '../api/action-items.api';
import type { CreateActionItemInput, UpdateActionItemInput } from '../types/action-item.types';
import { useT } from '@/i18n/app/use-t';

export const actionItemsKey = (simulationId: string, meetingId?: string) =>
  ['action-items', simulationId, meetingId ?? 'all'] as const;

export function useActionItems(simulationId: string, meetingId?: string) {
  const t = useT();
  const queryClient = useQueryClient();
  const key = actionItemsKey(simulationId, meetingId);
  // Any change invalidates every list of the simulation (meeting card + simulation page).
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['action-items', simulationId] });

  const query = useQuery({
    queryKey: key,
    queryFn: () => actionItemsApi.list(simulationId, meetingId),
    enabled: !!simulationId,
    staleTime: 30_000,
  });

  const create = useMutation({
    mutationFn: (input: CreateActionItemInput) => actionItemsApi.create(simulationId, input),
    onSuccess: () => {
      toast.success(t('actions.added'));
      invalidate();
    },
    onError: () => toast.error(t('actions.addError')),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateActionItemInput }) => actionItemsApi.update(id, input),
    onSuccess: invalidate,
    onError: () => toast.error(t('actions.saveError')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => actionItemsApi.remove(id),
    onSuccess: () => {
      toast.success(t('actions.deleted'));
      invalidate();
    },
    onError: () => toast.error(t('actions.deleteError')),
  });

  return { query, create, update, remove };
}
