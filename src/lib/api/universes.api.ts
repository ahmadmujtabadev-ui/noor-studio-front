import { api } from './client';
import type { Universe } from './types';

export interface CreateUniverseInput {
  name: string;
  description?: string;
  seriesBible?: string;
  tags?: string[];
  artStyle?: string;
  ageRange?: string;
  tone?: string;
}

export type UpdateUniverseInput = Partial<CreateUniverseInput>;

export const universesApi = {
  list: () => api.get<Universe[]>('/api/universes'),

  get: (id: string) => api.get<Universe>(`/api/universes/${id}`),

  create: (data: CreateUniverseInput) => api.post<Universe>('/api/universes', data),

  update: (id: string, data: UpdateUniverseInput) =>
    api.put<Universe>(`/api/universes/${id}`, data),

  delete: (id: string) => api.delete<{ message: string }>(`/api/universes/${id}`),
};
