// lib/reviewApi.ts
// All API calls for the review-first workflow — maps 1:1 to server/routes/project-review.routes.js

import { api } from "@/lib/api/client";
import { CoverReview, IllustrationNode, ProseReviewCurrent, ReviewResponse, StructureItem } from "./reviewTypes";


// ─── Bootstrap & get ─────────────────────────────────────────────────────────

export const reviewApi = {

  bootstrap: (pid: string): Promise<ReviewResponse> =>
    api.post(`/api/projects/${pid}/review/bootstrap`, {}),

  get: (pid: string): Promise<ReviewResponse> =>
    api.get(`/api/projects/${pid}/review`),

  // ─── Story ─────────────────────────────────────────────────────────────────

  patchStory: (pid: string, body: Partial<{
    bookTitle: string;
    synopsis: string;
    moral: string;
    storyText: string;
    islamicTheme: Record<string, unknown>;
    dedicationMessage: string;
  }>) =>
    api.patch(`/api/projects/${pid}/review/story`, body),

  regenerateStory: (pid: string, storyIdea?: string) =>
    api.post(`/api/projects/${pid}/review/story/regenerate`,
      storyIdea ? { storyIdea } : {}),

  approveStory: (pid: string) =>
    api.post(`/api/projects/${pid}/review/story/approve`, {}),

  // ─── Structure ─────────────────────────────────────────────────────────────

  getStructure: (pid: string) =>
    api.get(`/api/projects/${pid}/review/structure`),

  regenerateStructure: (pid: string) =>
    api.post(`/api/projects/${pid}/review/structure/regenerate`, {}),

  patchStructureItem: (pid: string, key: string, current: Partial<StructureItem["current"]>) =>
    api.patch(`/api/projects/${pid}/review/structure/${key}`, { current }),

  approveStructureItem: (pid: string, key: string) =>
    api.post(`/api/projects/${pid}/review/structure/${key}/approve`, {}),

  // ─── Chapter prose ─────────────────────────────────────────────────────────

  getChapterProse: (pid: string, chapterIndex: number) =>
    api.get(`/api/projects/${pid}/review/chapters/${chapterIndex}/prose`),

  regenerateChapterProse: (pid: string, chapterIndex: number) =>
    api.post(`/api/projects/${pid}/review/chapters/${chapterIndex}/prose/regenerate`, {}),

  patchChapterProse: (pid: string, chapterIndex: number, body: Partial<ProseReviewCurrent>) =>
    api.patch(`/api/projects/${pid}/review/chapters/${chapterIndex}/prose`, { current: body }),

  humanizeChapterProse: (pid: string, chapterIndex: number) =>
    api.post(`/api/projects/${pid}/review/chapters/${chapterIndex}/prose/humanize`, {}),

  approveChapterProse: (pid: string, chapterIndex: number) =>
    api.post(`/api/projects/${pid}/review/chapters/${chapterIndex}/prose/approve`, {}),

  // ─── Illustrations ─────────────────────────────────────────────────────────

  getIllustrations: (pid: string): Promise<{ illustrations: IllustrationNode[] }> =>
    api.get(`/api/projects/${pid}/review/illustrations`),

  patchIllustrationPrompt: (pid: string, key: string, body: { prompt?: string; illustrationHint?: string }) =>
    api.patch(`/api/projects/${pid}/review/illustrations/${key}/prompt`, body),

  regenerateIllustration: (
    pid: string,
    key: string,
    body: { variantCount?: number; prompt?: string; seed?: number; style?: string },
  ) =>
    api.post(`/api/projects/${pid}/review/illustrations/${key}/regenerate`, body),

  selectIllustrationVariant: (pid: string, key: string, variantIndex: number) =>
    api.post(`/api/projects/${pid}/review/illustrations/${key}/select-variant`, { variantIndex }),

  approveIllustration: (pid: string, key: string) =>
    api.post(`/api/projects/${pid}/review/illustrations/${key}/approve`, {}),

  // ─── Cover ─────────────────────────────────────────────────────────────────

  getCover: (pid: string): Promise<{ cover: CoverReview }> =>
    api.get(`/api/projects/${pid}/review/cover`),

  patchCoverPrompt: (pid: string, side: "front" | "back" | "spine", prompt: string) =>
    api.patch(`/api/projects/${pid}/review/cover/${side}/prompt`, { prompt }),

  regenerateCover: (
    pid: string,
    side: "front" | "back" | "spine",
    body?: { variantCount?: number; prompt?: string; seed?: number; style?: string; previewMode?: boolean },
  ) =>
    api.post(`/api/projects/${pid}/review/cover/${side}/regenerate`, body ?? {}),

  selectCoverVariant: (pid: string, side: "front" | "back" | "spine", variantIndex: number) =>
    api.post(`/api/projects/${pid}/review/cover/${side}/select-variant`, { variantIndex }),

  approveCover: (pid: string, side: "front" | "back" | "spine") =>
    api.post(`/api/projects/${pid}/review/cover/${side}/approve`, {}),
};