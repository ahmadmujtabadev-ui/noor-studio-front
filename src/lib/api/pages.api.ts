// src/lib/api/pages.api.ts
// Complete page-level API — editing, approval, versioning, variants, editor styles

import { api } from './client';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageEditStatus = 'draft' | 'regenerated' | 'edited' | 'approved' | 'rejected';

export interface PageTextVersion {
  version: number;
  text: string;
  prompt: string | null;
  source: 'ai' | 'manual' | 'ai-regenerated';
  createdAt: string;
}

export interface PageImageVersion {
  version: number;
  imageUrl: string;
  prompt: string;
  source: 'ai' | 'ai-regenerated';
  createdAt: string;
}

export interface ImageVariant {
  variantIndex: number;
  imageUrl: string;
  prompt?: string;
  seed?: number;
  provider?: string;
  selected?: boolean;
}

export interface PageTextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  bgColor?: string;
  bgOpacity?: number;
  textAlign?: string;
  lineHeight?: number;
  letterSpacing?: number;
  bgRadius?: number;
  bgPadding?: number;
  x?: number;
  y?: number;
  width?: number;
}

export interface PageImageStyle {
  objectFit?: string;
  offsetX?: number;
  offsetY?: number;
  scale?: number;
}

export interface PageListItem {
  key: string;
  label: string;
  chapterIndex: number;
  spreadIndex: number;
  chapterTitle?: string;
  text: string | null;
  textPrompt: string | null;
  illustrationHint: string | null;
  textPosition: string;
  charactersInScene?: string[];
  characterEmotion?: Record<string, string>;
  sceneEnvironment?: string;
  imageUrl: string | null;
  imagePrompt: string | null;
  seed?: number | null;
  variants?: ImageVariant[];
  selectedVariantIndex?: number;
  status: PageEditStatus;
  notes: string;
  textStyle?: PageTextStyle | null;
  imageStyle?: PageImageStyle | null;
  layout?: string;
  textVersionCount: number;
  imageVersionCount: number;
  approvedAt: string | null;
  rejectionReason: string | null;
  updatedAt: string | null;
}

export interface PageDetail extends PageListItem {
  parsed?: Record<string, unknown>;
  spread?: Record<string, unknown>;
  illustration?: Record<string, unknown>;
  textVersions: PageTextVersion[];
  imageVersions: PageImageVersion[];
  currentTextVersion: number;
  currentImageVersion: number;
}

export interface PageListResponse {
  pages: PageListItem[];
  spreadOnly: boolean;
  summary: {
    total: number;
    draft: number;
    regenerated: number;
    edited: number;
    approved: number;
    rejected: number;
    withImages: number;
    withVariants: number;
  };
}

export interface RegeneratePageRequest {
  textPrompt?: string;
  imagePrompt?: string;
  type: 'text' | 'image' | 'both';
  variantCount?: number;
}

export interface RegeneratePageResponse {
  message: string;
  key: string;
  status: PageEditStatus;
  textResult?: unknown;
  imageResult?: {
    imageUrl: string;
    prompt: string;
    provider: string;
    variants?: ImageVariant[];
  };
  creditsCharged: number;
}

export interface PatchPageRequest {
  text?: string;
  notes?: string;
  textStyle?: PageTextStyle;
  imageStyle?: PageImageStyle;
  layout?: string;
}

export interface BookEditorStyleRequest {
  globalFont?: string;
  globalFontSize?: number;
  globalFontColor?: string;
  globalBgColor?: string;
  globalBgOpacity?: number;
  globalTextAlign?: string;
  globalLayout?: string;
}

// ─── API Client ───────────────────────────────────────────────────────────────

export const pagesApi = {

  // ── Read ──────────────────────────────────────────────────────────────────

  /** List all pages with current status (lightweight — no version history) */
  list: (projectId: string): Promise<PageListResponse> =>
    api.get(`/api/projects/${projectId}/pages`),

  /** Get full detail for one page including version history */
  get: (projectId: string, key: string): Promise<PageDetail> =>
    api.get(`/api/projects/${projectId}/pages/${key}`),

  // ── Edit ──────────────────────────────────────────────────────────────────

  /**
   * Manually edit text OR update editor styles for a page.
   * Saves version snapshot, marks status = 'edited'.
   */
  patch: (
    projectId: string,
    key: string,
    data: PatchPageRequest,
  ): Promise<{ message: string; key: string; status: PageEditStatus }> =>
    api.patch(`/api/projects/${projectId}/pages/${key}`, data),

  // ── Approval ──────────────────────────────────────────────────────────────

  approve: (
    projectId: string,
    key: string,
  ): Promise<{ message: string; key: string; status: 'approved'; approvedAt: string }> =>
    api.post(`/api/projects/${projectId}/pages/${key}/approve`),

  reject: (
    projectId: string,
    key: string,
    reason?: string,
  ): Promise<{ message: string; key: string; status: 'rejected'; reason: string }> =>
    api.post(`/api/projects/${projectId}/pages/${key}/reject`, { reason }),

  approveAll: (
    projectId: string,
  ): Promise<{ message: string; count: number }> =>
    api.post(`/api/projects/${projectId}/pages/approve-all`),

  // ── Step 4: Variant selection ─────────────────────────────────────────────

  /**
   * Select which image variant to use for a page (Step 4).
   * Updates selectedVariantIndex and imageUrl on the spread.
   */
  selectVariant: (
    projectId: string,
    key: string,
    variantIndex: number,
  ): Promise<{ message: string; key: string; variantIndex: number }> =>
    api.post(`/api/projects/${projectId}/pages/${key}/select-variant`, { variantIndex }),

  // ── Regeneration ──────────────────────────────────────────────────────────

  /** Edit prompt → regenerate → save version snapshot */
  regenerate: (
    projectId: string,
    key: string,
    data: RegeneratePageRequest,
  ): Promise<RegeneratePageResponse> =>
    api.post(`/api/projects/${projectId}/pages/${key}/regenerate`, data),

  // ── Version history ───────────────────────────────────────────────────────

  restoreVersion: (
    projectId: string,
    key: string,
    version: number,
    type: 'text' | 'image',
  ): Promise<{ message: string; key: string; type: string; version: number }> =>
    api.post(`/api/projects/${projectId}/pages/${key}/restore/${version}`, { type }),

  // ── Step 5: Book editor global style ──────────────────────────────────────

  /**
   * Save global book editor style and optionally propagate to all pages.
   * Used in Step 5 book editor.
   */
  saveBookStyle: (
    projectId: string,
    bookEditorStyle: BookEditorStyleRequest,
    applyToAll = false,
  ): Promise<{ message: string; applied: boolean }> =>
    api.post(`/api/projects/${projectId}/pages/book-style`, { bookEditorStyle, applyToAll }),

  // ── Migration ─────────────────────────────────────────────────────────────

  /** One-time: migrate old chapter-based data to spreads-only (for age < 6) */
  migrate: (
    projectId: string,
  ): Promise<{ migrated: boolean; reason?: string; spreadCount?: number; ageRange?: string }> =>
    api.post(`/api/projects/${projectId}/pages/migrate`),
};