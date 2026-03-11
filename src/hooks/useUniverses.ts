import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { universesApi, type CreateUniverseInput, type UpdateUniverseInput } from '@/lib/api/universes.api';
import type { Universe } from '@/lib/api/types';

export const UNIVERSES_KEY = ['universes'] as const;
export const universeKey = (id: string) => ['universes', id] as const;

export function useUniverses() {
  const query = useQuery({
    queryKey: UNIVERSES_KEY,
    queryFn: universesApi.list,
    staleTime: 2 * 60 * 1000,
  });

  return {
    universes: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
}

export function useUniverse(id: string | undefined) {
  const query = useQuery({
    queryKey: universeKey(id!),
    queryFn: () => universesApi.get(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });

  return {
    universe: query.data ?? null,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
}

export function useCreateUniverse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUniverseInput) => universesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIVERSES_KEY }),
  });
}

export function useUpdateUniverse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUniverseInput) => universesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: universeKey(id) });
      qc.invalidateQueries({ queryKey: UNIVERSES_KEY });
    },
  });
}

export function useDeleteUniverse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => universesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: UNIVERSES_KEY }),
  });
}

// Legacy aliases used in old pages
export const createUniverse = universesApi.create;
export const updateUniverse = universesApi.update;
export type { Universe };
