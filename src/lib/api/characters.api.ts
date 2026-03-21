import { api } from './client';
import type { Character } from './types';

export interface PromptConfigInput {
  masterSystemNote?: string;
  portraitPromptPrefix?: string;
  portraitPromptSuffix?: string;
  posePromptPrefix?: string;
  posePromptSuffix?: string;
  scenePromptPrefix?: string;
  scenePromptSuffix?: string;
}

export interface PoseLibraryItemInput {
  poseKey: string;
  label: string;
  prompt?: string;
  imageUrl?: string;
  sourceSheetUrl?: string;
  approved?: boolean;
  priority?: number;
  useForScenes?: string[];
  notes?: string;
}

export interface CreateCharacterInput {
  universeId?: string;
  name: string;
  role: string;
  ageRange?: string;
  traits?: string[];
  speechStyle?: string;
  speakingStyle?: string;

  visualDNA?: {
    style?: string;
    gender?: string;
    ageLook?: string;

    skinTone?: string;
    eyeColor?: string;
    faceShape?: string;
    eyebrowStyle?: string;
    noseStyle?: string;
    cheekStyle?: string;

    hairStyle?: string;
    hairColor?: string;
    hairVisibility?: 'visible' | 'partially-visible' | 'hidden';

    hijabStyle?: string;
    hijabColor?: string;

    topGarmentType?: string;
    topGarmentColor?: string;
    topGarmentDetails?: string;

    bottomGarmentType?: string;
    bottomGarmentColor?: string;

    shoeType?: string;
    shoeColor?: string;

    bodyBuild?: string;
    heightFeel?: string;

    accessories?: string[];
    paletteNotes?: string;

    // legacy compatibility
    hairOrHijab?: string;
    outfitRules?: string;
  };

  modestyRules?: {
    hijabAlways?: boolean;
    longSleeves?: boolean;
    looseClothing?: boolean;
    notes?: string;
  };

  promptConfig?: PromptConfigInput;
}

export type UpdateCharacterInput = Partial<CreateCharacterInput> & {
  status?: string;
  poseLibrary?: PoseLibraryItemInput[];
  approvedPoseKeys?: string[];
};

export interface CharacterWrappedResponse {
  character: Character;
  imageUrl?: string;
  masterReferenceUrl?: string;
  poseSheetUrl?: string;
  prompt?: string;
  provider?: string;
  poseLibrary?: PoseLibraryItemInput[];
}

export interface UpdatePosePromptInput {
  prompt?: string;
  approved?: boolean;
  notes?: string;
  useForScenes?: string[];
  label?: string;
  priority?: number;
}

export interface RegeneratePoseInput {
  style?: string;
  prompt?: string;
}

export const charactersApi = {
  list: (params?: { universeId?: string }) =>
    api.get<Character[]>('/api/characters', { params }),

  get: (id: string) =>
    api.get<Character>(`/api/characters/${id}`),

  create: (data: CreateCharacterInput) =>
    api.post<Character>('/api/characters', data),

  update: (id: string, data: UpdateCharacterInput) =>
    api.put<Character>(`/api/characters/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/api/characters/${id}`),

  generatePortrait: (id: string, opts?: { style?: string }) =>
    api.post<CharacterWrappedResponse>(`/api/characters/${id}/generate-portrait`, opts || {}),

  generatePoseSheet: (
    id: string,
    body?: {
      style?: string;
      poses?: PoseLibraryItemInput[];
    }
  ) =>
    api.post<CharacterWrappedResponse>(`/api/characters/${id}/generate-pose-sheet`, body || {}),

  approve: (id: string) =>
    api.post<Character>(`/api/characters/${id}/approve`, {}),

  updatePromptConfig: (id: string, data: PromptConfigInput) =>
    api.put<Character>(`/api/characters/${id}/prompt-config`, data),

  updatePosePrompt: (id: string, poseKey: string, data: UpdatePosePromptInput) =>
    api.put<Character>(`/api/characters/${id}/poses/${poseKey}/prompt`, data),

  updatePoseLibrary: (id: string, poseLibrary: PoseLibraryItemInput[]) =>
    api.put<Character>(`/api/characters/${id}/poses`, { poseLibrary }),

  applyMasterToPoses: (id: string, body?: { style?: string }) =>
    api.post<Character>(`/api/characters/${id}/apply-master-to-poses`, body || {}),

  regeneratePose: (id: string, poseKey: string, body?: RegeneratePoseInput) =>
    api.post<CharacterWrappedResponse>(`/api/characters/${id}/poses/${poseKey}/regenerate`, body || {}),

  fixStorage: (id: string) =>
    api.post<{ character: Character; migrated: boolean }>(`/api/characters/${id}/fix-storage`, {}),
};