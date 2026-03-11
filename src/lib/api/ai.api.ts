import { api } from './client';
import type { AIStatusResponse, TextGenerateResponse, ImageGenerateResponse } from './types';

export const aiApi = {
  // ─── Text generation ──────────────────────────────────────────────────────

  generateOutline: (projectId: string) =>
    api.post<TextGenerateResponse>('/api/ai/text/generate', {
      stage: 'outline',
      projectId,
    }),

  generateChapter: (projectId: string, chapterIndex: number) =>
    api.post<TextGenerateResponse>('/api/ai/text/generate', {
      stage: 'chapter',
      projectId,
      chapterIndex,
    }),

  humanizeChapters: (projectId: string) =>
    api.post<TextGenerateResponse>('/api/ai/text/generate', {
      stage: 'humanize',
      projectId,
    }),

  // Generic text endpoint
  generateText: (data: { stage: string; projectId: string; chapterIndex?: number }) =>
    api.post<TextGenerateResponse>('/api/ai/text/generate', data),

  // ─── Image generation ─────────────────────────────────────────────────────

  generateIllustration: (projectId: string, chapterIndex: number, style?: string) =>
    api.post<ImageGenerateResponse>('/api/ai/image/generate', {
      task: 'illustration',
      projectId,
      chapterIndex,
      style,
    }),

  generateCover: (projectId: string, style?: string) =>
    api.post<ImageGenerateResponse>('/api/ai/image/generate', {
      task: 'cover',
      projectId,
      style,
    }),

  generateImage: (data: {
    task: string;
    projectId: string;
    chapterIndex?: number;
    style?: string;
    customPrompt?: string;
  }) => api.post<ImageGenerateResponse>('/api/ai/image/generate', data),

  // ─── Batch pipeline stage runner ─────────────────────────────────────────
  // Runs a full stage (all chapters, all illustrations) in one call
  runStage: (projectId: string, stage: string) =>
    api.post<TextGenerateResponse>('/api/ai/generate', { stage, projectId }),

  // ─── Status ───────────────────────────────────────────────────────────────

  getStatus: () => api.get<AIStatusResponse>('/api/ai/status'),
};
