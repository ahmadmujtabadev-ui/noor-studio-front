import { api } from "./client";

export interface JourneySlot {
  slotIndex: number;
  projectId: string | null;
  title: string | null;
  currentStage: string | null;
  isComplete: boolean;
  percentComplete: number;
  doneMap: Record<string, boolean>;
  stageOrder: string[];
  stageMeta: Record<string, { label: string; icon: string }>;
  updatedAt: string | null;
}

export interface JourneyResponse {
  plan: string;
  planLimit: number;
  slotCap: number;
  activeSlotIdx: number;
  stageOrder: string[];
  stageMeta: Record<string, { label: string; icon: string }>;
  slots: JourneySlot[];
}

export const journeyApi = {
  get: () => api.get<JourneyResponse>("/api/user/journey"),
};
