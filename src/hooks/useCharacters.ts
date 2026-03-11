import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersApi, type CreateCharacterInput, type UpdateCharacterInput } from '@/lib/api/characters.api';
import { useAuthStore } from '@/lib/store/authStore';

export const CHARACTERS_KEY = ['characters'] as const;
export const characterKey = (id: string) => ['characters', id] as const;

export function useCharacters(universeId?: string) {
  return useQuery({
    queryKey: universeId ? ['characters', { universeId }] : CHARACTERS_KEY,
    queryFn: () => charactersApi.list(universeId ? { universeId } : undefined),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: characterKey(id!),
    queryFn: () => charactersApi.get(id!),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCharacterInput) => charactersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHARACTERS_KEY }),
  });
}

export function useUpdateCharacter(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCharacterInput) => charactersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CHARACTERS_KEY });
      qc.invalidateQueries({ queryKey: characterKey(id) });
    },
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => charactersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CHARACTERS_KEY }),
  });
}

export function useGeneratePortrait(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (opts?: { style?: string; customPrompt?: string }) =>
      charactersApi.generatePortrait(characterId, opts),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKey(characterId) });
      qc.invalidateQueries({ queryKey: CHARACTERS_KEY });
      useAuthStore.getState().refreshUser();
    },
  });
}

export function useGeneratePoseSheet(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => charactersApi.generatePoseSheet(characterId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKey(characterId) });
      useAuthStore.getState().refreshUser();
    },
  });
}

export function useApproveCharacter(characterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageUrl?: string) => charactersApi.approve(characterId, imageUrl),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: characterKey(characterId) });
      qc.invalidateQueries({ queryKey: CHARACTERS_KEY });
    },
  });
}
