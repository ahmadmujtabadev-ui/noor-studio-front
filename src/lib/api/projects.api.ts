// src/lib/api/projects.api.ts
// Complete projects API client — CRUD + layout + publish + summary + step tracking

import { api } from './client';
import type { Project, ProjectSummary, BookStyle } from './types';

// ─── Input types ──────────────────────────────────────────────────────────────

export interface CreateProjectInput {
  // Core
  title: string;
  ageRange: string;
  // New 5-step flow
  storyIdea?: string;
  language?: string;
  chapterCount?: number;
  authorName?: string;
  learningObjective?: string;
  // Characters & universe
  universeId?: string;
  universeName?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  characterIds?: string[];
  // Book style
  bookStyle?: BookStyle;
  trimSize?: string;
  // Legacy fields
  templateType?: string;
  template?: string;
  synopsis?: string;
  setting?: string;
  layoutStyle?: string;
  exportTargets?: string[];
  spreadOnly?: boolean;
}

export type UpdateProjectInput = Partial<CreateProjectInput> & {
  artifacts?: Record<string, unknown>;
  stepsComplete?: Record<string, boolean>;
  currentStep?: number;
  status?: string;
  currentStage?: string;
};

// ─── Helper: unwrap API response ──────────────────────────────────────────────

function unwrap<T>(res: any): T {
  // Handle { data: T } wrapper
  if (res && typeof res === 'object' && 'data' in res && !('id' in res) && !('_id' in res)) {
    return res.data as T;
  }
  return res as T;
}

// ─── Projects API ─────────────────────────────────────────────────────────────

export const projectsApi = {

  // ── CRUD ──────────────────────────────────────────────────────────────────

  list: async (params?: { status?: string; page?: number; limit?: number }): Promise<Project[]> => {
    const res = await api.get('/api/projects', { params });
    const payload = unwrap<{ projects?: Project[] } | Project[]>(res);
    // Handle paginated response { projects: [], pagination: {} }
    if (payload && !Array.isArray(payload) && 'projects' in payload) {
      return (payload as { projects: Project[] }).projects;
    }
    return payload as Project[];
  },

  get: async (id: string): Promise<Project> => {
    const res = await api.get(`/api/projects/${id}`);
    return unwrap<Project>(res);
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const res = await api.post('/api/projects', data);
    return unwrap<Project>(res);
  },

  update: async (id: string, data: UpdateProjectInput): Promise<{ message: string; updatedAt: string; currentStep?: number }> => {
    const res = await api.put(`/api/projects/${id}`, data);
    return unwrap(res);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/api/projects/${id}`);
    return unwrap(res);
  },

  duplicate: async (id: string): Promise<Project> => {
    const res = await api.post(`/api/projects/${id}/duplicate`);
    return unwrap<Project>(res);
  },

  // ── Step tracking (5-step flow) ───────────────────────────────────────────

  /** Advance the project to the next step and optionally mark current as complete */
  advanceStep: async (
    id: string,
    step: number,
    complete = true,
  ): Promise<{ currentStep: number; stepsComplete: Record<string, boolean> }> => {
    const res = await api.patch(`/api/projects/${id}/step`, { step, complete });
    return unwrap(res);
  },

  // ── Summary ───────────────────────────────────────────────────────────────

  /** Lightweight summary — stats, character list, step progress */
  getSummary: async (id: string): Promise<ProjectSummary> => {
    const res = await api.get(`/api/projects/${id}/summary`);
    return unwrap<ProjectSummary>(res);
  },

  // ── Layout ────────────────────────────────────────────────────────────────

  generateLayout: async (id: string): Promise<{ layout: import('./types').ProjectLayout }> => {
    const res = await api.post(`/api/projects/${id}/layout`);
    return unwrap(res);
  },

  // ── Publish ───────────────────────────────────────────────────────────────

  publish: async (id: string, isPublic = true): Promise<{ shareUrl: string; shareToken: string; publishedAt: string }> => {
    const res = await api.post(`/api/projects/${id}/publish`, { isPublic });
    return unwrap(res);
  },
};