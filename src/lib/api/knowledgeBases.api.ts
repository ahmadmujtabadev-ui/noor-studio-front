import { api } from './client';
import type { KnowledgeBase, Dua, VocabularyEntry } from './types';

export interface CreateKBInput {
  universeId?: string;
  name: string;
  islamicValues?: string[];
  duas?: Dua[];
  vocabulary?: VocabularyEntry[];
  avoidTopics?: string[];
}

export type UpdateKBInput = Partial<CreateKBInput>;

export const knowledgeBasesApi = {
  list: (params?: { universeId?: string }) =>
    api.get<KnowledgeBase[]>('/api/knowledge-bases', { params }),

  get: (id: string) => api.get<KnowledgeBase>(`/api/knowledge-bases/${id}`),

  create: (data: CreateKBInput) =>
    api.post<KnowledgeBase>('/api/knowledge-bases', data),

  update: (id: string, data: UpdateKBInput) =>
    api.put<KnowledgeBase>(`/api/knowledge-bases/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/knowledge-bases/${id}`),

  getByUniverse: (universeId: string) =>
    api.get<KnowledgeBase[]>('/api/knowledge-bases', { params: { universeId } }),

  listCoverTemplates: () =>
    api.get<CoverTemplate[]>('/api/knowledge-bases/cover-templates'),

  listKBTemplates: () =>
    api.get<KBStarterTemplate[]>('/api/knowledge-bases/kb-templates'),
};

export interface KBStarterTemplate {
  _id: string;
  name: string;
  ageRange: string;
  icon: string;
  description: string;
  palette: string[];
  islamicValues: string[];
  duas: Array<{ arabic: string; transliteration: string; meaning: string; context?: string }>;
  avoidTopics: string[];
  backgroundSettings?: Record<string, any>;
  coverDesign?: Record<string, any>;
  bookFormatting?: Record<string, any>;
  underSixDesign?: Record<string, any>;
}

export interface CoverTemplate {
  _id: string;
  name: string;
  style: string;
  palette: string[];
  description: string;
  promptDirective: string;
  typography: string;
  composition: string;
  atmosphere: string;
}
