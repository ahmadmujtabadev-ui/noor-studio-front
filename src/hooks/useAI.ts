import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai.api';
import { useAuthStore } from '@/lib/store/authStore';
import { projectKey } from './useProjects';

// Refresh user credits and invalidate project after any AI call
function usePostAISuccess(projectId?: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return () => {
    refreshUser();
    if (projectId) {
      qc.invalidateQueries({ queryKey: projectKey(projectId) });
    }
  };
}

// ── Text Generation ───────────────────────────────────────────────────────────

export function useGenerateOutline(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateOutline(projectId),
    onSuccess,
  });
}

export function useGenerateChapters(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateText({ stage: 'chapters', projectId }),
    onSuccess,
  });
}

export function useGenerateChapter(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (chapterIndex: number) => aiApi.generateChapter(projectId, chapterIndex),
    onSuccess,
  });
}

export function useHumanizeChapters(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.humanizeChapters(projectId),
    onSuccess,
  });
}

// Generic stage runner - used in ProjectWorkspace
export function useRunStage(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (stage: string) => aiApi.runStage(projectId, stage),
    onSuccess,
  });
}

// ── Image Generation ──────────────────────────────────────────────────────────

export function useGenerateIllustration(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: ({ chapterIndex, style }: { chapterIndex: number; style?: string }) =>
      aiApi.generateIllustration(projectId, chapterIndex, style),
    onSuccess,
  });
}

export function useGenerateCover(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (style?: string) => aiApi.generateCover(projectId, style),
    onSuccess,
  });
}

// ── Provider Status ───────────────────────────────────────────────────────────

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: aiApi.getStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
