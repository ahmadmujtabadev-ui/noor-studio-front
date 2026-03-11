import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeBasesApi, type CreateKBInput, type UpdateKBInput } from '@/lib/api/knowledgeBases.api';

export const KBS_KEY = ['knowledge-bases'] as const;
export const kbKey = (id: string) => ['knowledge-bases', id] as const;

export function useKnowledgeBases(universeId?: string) {
  return useQuery({
    queryKey: universeId ? ['knowledge-bases', { universeId }] : KBS_KEY,
    queryFn: () => knowledgeBasesApi.list(universeId ? { universeId } : undefined),
    staleTime: 2 * 60 * 1000,
  });
}

export function useKnowledgeBase(id: string | undefined) {
  return useQuery({
    queryKey: kbKey(id!),
    queryFn: () => knowledgeBasesApi.get(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useKnowledgeBaseByUniverse(universeId: string | undefined) {
  return useQuery({
    queryKey: ['knowledge-bases', { universeId }],
    queryFn: () => knowledgeBasesApi.getByUniverse(universeId!),
    enabled: !!universeId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateKBInput) => knowledgeBasesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KBS_KEY }),
  });
}

export function useUpdateKnowledgeBase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateKBInput) => knowledgeBasesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: kbKey(id) });
      qc.invalidateQueries({ queryKey: KBS_KEY });
    },
  });
}

export function useDeleteKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeBasesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KBS_KEY }),
  });
}
