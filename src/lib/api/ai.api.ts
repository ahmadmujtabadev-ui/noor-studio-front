// src/lib/api/ai.api.ts
// Complete AI API client — all 5 steps of the new book creation flow

import { api } from './client';
import type {
  AIStatusResponse,
  TextGenerateResponse,
  ImageGenerateResponse,
  CostEstimateResponse,
} from './types';

// ─── Text generation request types ────────────────────────────────────────────

export interface RunStageOptions {
  chapterIndex?: number;
  spreadIndex?: number;
  customPrompt?: string;
  storyIdea?: string;
  customNote?: string;
  [key: string]: unknown;
}

export interface GenerateImageOptions {
  task: string;
  projectId: string;
  chapterIndex?: number;
  spreadIndex?: number;
  style?: string;
  customPrompt?: string;
  seed?: number;
  variantCount?: number;
  characterId?: string;
  selectedStyle?: string;
  traceId?: string;
}

// ─── AI API client ────────────────────────────────────────────────────────────

export const aiApi = {

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 1 — STORY GENERATION
  // User enters a short idea → AI generates complete story
  // ══════════════════════════════════════════════════════════════════════════

  /** Generate complete story from a short idea (Step 1) */
  generateStory: (projectId: string, storyIdea: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'story', projectId, storyIdea }),

  /** Generate dedication page */
  generateDedication: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'dedication', projectId }),

  /** Generate Islamic theme/reference page */
  generateTheme: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'theme', projectId }),

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 2 — SPREAD PLANNING
  // Characters, pages, book structure → all spreads with text + scene hints
  // ══════════════════════════════════════════════════════════════════════════

  /** Break story into illustrated spreads (Step 2 — new endpoint) */
  generateSpreadPlan: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'spreadPlanning', projectId }),

  /** Generate all chapters (age >= 6) or all spreads (age < 6) */
  generateChapters: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'chapters', projectId }),

  /** Generate all spreads explicitly (age < 6 spread-only books) */
  generateSpreads: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'spreads', projectId }),

  /** Humanize/polish all chapters or spreads */
  humanize: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'humanize', projectId }),

  /** Re-run a single spread with custom instruction */
  rerunSpread: (
    projectId: string,
    spreadIndex: number,
    customPrompt: string,
    chapterIndex = 0,
  ): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', {
      stage: 'spreadRerun',
      projectId,
      spreadIndex,
      chapterIndex,
      customPrompt,
    }),

  /** Legacy: generate outline */
  generateOutline: (projectId: string): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'outline', projectId }),

  /** Legacy: generate single chapter */
  generateChapter: (projectId: string, chapterIndex: number): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', { stage: 'chapter', projectId, chapterIndex }),

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 3 — CHARACTER STYLING
  // User selects a visual style → AI generates styled character portrait
  // ══════════════════════════════════════════════════════════════════════════

  /** Generate a styled character portrait (Step 3) */
  generateCharacterStyle: (
    projectId: string,
    characterId: string,
    selectedStyle: string,
  ): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'character-style',
      projectId,
      characterId,
      selectedStyle,
    }),

  // ══════════════════════════════════════════════════════════════════════════
  // STEP 4 — IMAGE SELECTION
  // Generate 4-5 variants per page → user picks best one
  // ══════════════════════════════════════════════════════════════════════════

  /** Check cost before generating (call before confirmation dialog) */
  getCostEstimate: (
    projectId: string,
    task: string,
    variantCount = 1,
  ): Promise<CostEstimateResponse> =>
    api.get('/api/ai/image/cost-estimate', {
      params: { projectId, task, variantCount },
    }),

  /** Generate multiple image variants for a single page (Step 4) */
  generateVariants: (
    projectId: string,
    spreadIndex: number,
    chapterIndex = 0,
    variantCount = 4,
    customPrompt?: string,
  ): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'illustration-variants',
      projectId,
      spreadIndex,
      chapterIndex,
      variantCount,
      ...(customPrompt ? { customPrompt } : {}),
    }),

  /** Generate all book illustrations in one go (legacy full-book run) */
  generateAllIllustrations: (projectId: string, style?: string, force = false): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'illustrations',
      projectId,
      force,
      ...(style ? { style } : {}),
    }),

  /** Generate / regenerate a single spread illustration */
  generateIllustration: (
    projectId: string,
    chapterIndex: number,
    spreadIndex = 0,
    style?: string,
  ): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'illustration',
      projectId,
      chapterIndex,
      spreadIndex,
      ...(style ? { style } : {}),
    }),

  /** Generate front cover */
  generateCover: (projectId: string, style?: string): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'cover',
      projectId,
      ...(style ? { style } : {}),
    }),

  /** Generate back cover */
  generateBackCover: (projectId: string, style?: string): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', {
      task: 'back-cover',
      projectId,
      ...(style ? { style } : {}),
    }),

  // ══════════════════════════════════════════════════════════════════════════
  // GENERIC / PIPELINE
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Generic stage runner — maps to the correct endpoint.
   * Used by ProjectWorkspacePage pipeline buttons.
   */
  runStage: (
    projectId: string,
    stage: string,
    options?: RunStageOptions,
  ): Promise<TextGenerateResponse> =>
    api.post('/api/ai/generate', {
      stage,
      projectId,
      ...options,
    }),

  /**
   * Generic image generation — used when task type varies at runtime.
   */
  generateImage: (options: GenerateImageOptions): Promise<ImageGenerateResponse> =>
    api.post('/api/ai/image/generate', options),

  // ─── Status ───────────────────────────────────────────────────────────────

  getStatus: (): Promise<AIStatusResponse> => api.get('/api/ai/status'),
};