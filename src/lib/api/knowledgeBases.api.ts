import { api } from './client';
import type { KnowledgeBase, Dua, VocabularyEntry } from './types';

export interface CreateKBInput {
  universeId?: string;
  name: string;
  islamicValues?: string[];
  duas?: Dua[];
  vocabulary?: VocabularyEntry[];
  illustrationRules?: string[];
  avoidTopics?: string[];
  customRules?: string;
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
};
