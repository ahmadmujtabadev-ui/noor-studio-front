import { api } from './client';
import type { Character } from './types';

export interface CreateCharacterInput {
  universeId?: string;
  name: string;
  role: string;
  ageRange?: string;
  traits?: string[];
  speechStyle?: string;
  speakingStyle?: string;
  appearance?: string;
  // Visual DNA fields (sent flat, normalized by backend)
  skinTone?: string;
  eyeColor?: string;
  faceShape?: string;
  hairOrHijab?: string;
  outfitRules?: string;
  accessories?: string;
  colorPalette?: string[];
  // Modesty
  hijabAlways?: boolean;
  longSleeves?: boolean;
  looseClothing?: boolean;
  modestyNotes?: string;
  knowledgeLevel?: string;
  // Accept nested visualDNA too
  visualDNA?: {
    style?: string; gender?: string; skinTone?: string; eyeColor?: string;
    faceShape?: string; hairOrHijab?: string; outfitRules?: string;
    accessories?: string; paletteNotes?: string;
  };
  modestyRules?: { hijabAlways?: boolean; longSleeves?: boolean; looseClothing?: boolean; notes?: string };
}

export type UpdateCharacterInput = Partial<CreateCharacterInput>;

export const charactersApi = {
  list: (params?: { universeId?: string }) =>
    api.get<Character[]>('/api/characters', { params }),

  get: (id: string) => api.get<Character>(`/api/characters/${id}`),

  create: (data: CreateCharacterInput) =>
    api.post<Character>('/api/characters', data),

  update: (id: string, data: UpdateCharacterInput) =>
    api.put<Character>(`/api/characters/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/characters/${id}`),

  generatePortrait: (id: string, opts?: { style?: string; customPrompt?: string }) =>
    api.post<Character>(`/api/characters/${id}/generate-portrait`, opts || {}),

  generatePoseSheet: (id: string) =>
    api.post<Character>(`/api/characters/${id}/generate-pose-sheet`, {}),

  approve: (id: string, imageUrl?: string) =>
    api.put<Character>(`/api/characters/${id}/approve`, { imageUrl }),
};
