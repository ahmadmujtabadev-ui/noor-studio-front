import { api } from './client';
import type { CreateCharacterInput } from './characters.api';

export interface CharacterTemplate {
  _id: string;
  name: string;
  description: string;
  category: 'girl' | 'boy' | 'elder-female' | 'elder-male' | 'animal' | 'toddler' | 'teen-girl' | 'teen-boy';
  thumbnailUrl: string;
  tags: string[];
  isDefault: boolean;
  isPublic: boolean;
  createdBy?: string;
  role: string;
  ageRange: string;
  traits: string[];
  visualDNA: CreateCharacterInput['visualDNA'];
  modestyRules: CreateCharacterInput['modestyRules'];
  palettePreview?: { primary: string; secondary: string; accent: string };
  createdAt?: string;
}

export interface SaveTemplateInput {
  name: string;
  description?: string;
  category: CharacterTemplate['category'];
  characterId?: string;
  tags?: string[];
  isPublic?: boolean;
  visualDNA?: CreateCharacterInput['visualDNA'];
  modestyRules?: CreateCharacterInput['modestyRules'];
  traits?: string[];
  role?: string;
  ageRange?: string;
}

export const characterTemplatesApi = {
  list: () =>
    api.get<CharacterTemplate[]>('/api/character-templates'),

  get: (id: string) =>
    api.get<CharacterTemplate>(`/api/character-templates/${id}`),

  save: (data: SaveTemplateInput) =>
    api.post<CharacterTemplate>('/api/character-templates', data),

  updateThumbnail: (id: string, thumbnailUrl: string) =>
    api.patch<{ message: string; thumbnailUrl: string }>(
      `/api/character-templates/${id}/thumbnail`,
      { thumbnailUrl }
    ),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/character-templates/${id}`),
};
