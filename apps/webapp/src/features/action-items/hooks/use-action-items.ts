import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { actionItemsApi } from '../api/action-items.api';
import type { CreateActionItemInput, UpdateActionItemInput } from '../types/action-item.types';

export const actionItemsKey = (simulationId: string, meetingId?: string) =>
  ['action-items', simulationId, meetingId ?? 'all'] as const;

export function useActionItems(simulationId: string, meetingId?: string) {
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
      toast.success('Action ajoutée');
      invalidate();
    },
    onError: () => toast.error("Impossible d'ajouter l'action"),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateActionItemInput }) => actionItemsApi.update(id, input),
    onSuccess: invalidate,
    onError: () => toast.error("Impossible d'enregistrer la modification"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => actionItemsApi.remove(id),
    onSuccess: () => {
      toast.success('Action supprimée');
      invalidate();
    },
    onError: () => toast.error("Impossible de supprimer l'action"),
  });

  return { query, create, update, remove };
}
