// src/hooks/useAI.ts
// All AI hooks for the 5-step book creation flow

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai.api';
import { useAuthStore } from '@/lib/store/authStore';

// ─── After-AI helper: refresh credits + invalidate project ────────────────────

function usePostAISuccess(projectId?: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore(s => s.refreshUser);
  return async () => {
    await refreshUser();
    if (projectId) {
      await qc.invalidateQueries({ queryKey: ['projects', projectId] });
      await qc.invalidateQueries({ queryKey: ['pageList', projectId] });
    }
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — STORY GENERATION
// ══════════════════════════════════════════════════════════════════════════════

/** Generate complete story from a short idea */
export function useGenerateStory(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (storyIdea: string) => aiApi.generateStory(projectId, storyIdea),
    onSuccess,
  });
}

/** Generate dedication page */
export function useGenerateDedication(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateDedication(projectId),
    onSuccess,
  });
}

/** Generate Islamic theme page */
export function useGenerateTheme(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateTheme(projectId),
    onSuccess,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — SPREAD PLANNING
// ══════════════════════════════════════════════════════════════════════════════

/** Break story into illustrated spreads */
export function useGenerateSpreadPlan(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateSpreadPlan(projectId),
    onSuccess,
  });
}

/** Generate all chapters (age >= 6) or all spreads (age < 6) */
export function useGenerateChapters(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateChapters(projectId),
    onSuccess,
  });
}

/** Generate all spreads (explicit spread-only books) */
export function useGenerateSpreads(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateSpreads(projectId),
    onSuccess,
  });
}

/** Humanize/polish all chapters or spreads */
export function useHumanize(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.humanize(projectId),
    onSuccess,
  });
}

/** Re-run a single spread with custom instruction */
export function useRerunSpread(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: ({
      spreadIndex,
      customPrompt,
      chapterIndex = 0,
    }: {
      spreadIndex: number;
      customPrompt: string;
      chapterIndex?: number;
    }) => aiApi.rerunSpread(projectId, spreadIndex, customPrompt, chapterIndex),
    onSuccess,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — CHARACTER STYLING
// ══════════════════════════════════════════════════════════════════════════════

/** Generate a styled character portrait */
export function useGenerateCharacterStyle(projectId: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore(s => s.refreshUser);
  return useMutation({
    mutationFn: ({
      characterId,
      selectedStyle,
    }: {
      characterId: string;
      selectedStyle: string;
    }) => aiApi.generateCharacterStyle(projectId, characterId, selectedStyle),
    onSuccess: async () => {
      await refreshUser();
      await qc.invalidateQueries({ queryKey: ['projects', projectId] });
      // Also invalidate characters so the updated masterReferenceUrl shows
      await qc.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 4 — IMAGE VARIANTS
// ══════════════════════════════════════════════════════════════════════════════

/** Get cost estimate before generating */
export function useCostEstimate(projectId: string, task: string, variantCount = 1) {
  return useQuery({
    queryKey: ['costEstimate', projectId, task, variantCount],
    queryFn: () => aiApi.getCostEstimate(projectId, task, variantCount),
    enabled: !!projectId && !!task,
    staleTime: 30_000,
  });
}

/** Generate multiple image variants for a single page */
export function useGenerateVariants(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: ({
      spreadIndex,
      chapterIndex = 0,
      variantCount = 4,
      customPrompt,
    }: {
      spreadIndex: number;
      chapterIndex?: number;
      variantCount?: number;
      customPrompt?: string;
    }) => aiApi.generateVariants(projectId, spreadIndex, chapterIndex, variantCount, customPrompt),
    onSuccess,
  });
}

/** Generate all book illustrations in one go */
export function useGenerateAllIllustrations(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (style?: string) => aiApi.generateAllIllustrations(projectId, style),
    onSuccess,
  });
}

/** Generate/regenerate a single illustration */
export function useGenerateIllustration(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: ({
      chapterIndex,
      chapterNumber,
      spreadIndex = 0,
      style,
    }: {
      chapterIndex?: number;
      chapterNumber?: number;
      spreadIndex?: number;
      style?: string;
    }) => aiApi.generateIllustration(projectId, chapterIndex ?? chapterNumber ?? 0, spreadIndex, style),
    onSuccess,
  });
}

/** Generate front cover */
export function useGenerateCover(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (options?: string | {
      style?: string;
      title?: string;
      subtitle?: string;
      authorName?: string;
      prompt?: string;
    }) => aiApi.generateCover(projectId, typeof options === "string" ? options : options?.style),
    onSuccess,
  });
}

/** Generate back cover */
export function useGenerateBackCover(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (style?: string) => aiApi.generateBackCover(projectId, style),
    onSuccess,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// GENERIC / PIPELINE
// ══════════════════════════════════════════════════════════════════════════════

/** Generic stage runner — used by ProjectWorkspacePage pipeline buttons */
export function useRunStage(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: ({
      stage,
      options,
    }: {
      stage: string;
      options?: Record<string, unknown>;
    }) => aiApi.runStage(projectId, stage, options),
    onSuccess,
  });
}

/** Generic image generation — used when task varies at runtime */
export function useGenerateImage(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: (options: import('@/lib/api/ai.api').GenerateImageOptions) =>
      aiApi.generateImage(options),
    onSuccess,
  });
}

// ─── Provider status ──────────────────────────────────────────────────────────

export function useAIStatus() {
  return useQuery({
    queryKey: ['ai', 'status'],
    queryFn: aiApi.getStatus,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

// ─── Legacy exports (keep existing code working) ─────────────────────────────

export function useGenerateOutline(projectId: string) {
  const onSuccess = usePostAISuccess(projectId);
  return useMutation({
    mutationFn: () => aiApi.generateOutline(projectId),
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
  return useHumanize(projectId);
}
