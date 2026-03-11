import { api } from "./client";
import type { Project } from "./types";

export interface CreateProjectInput {
  universeId?: string;
  universeName?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  title: string;
  ageRange: string;
  templateType: string;
  synopsis?: string;
  learningObjective?: string;
  setting?: string;
  characterIds?: string[];
  layoutStyle?: string;
  trimSize?: string;
  exportTargets?: string[];
}

export type UpdateProjectInput = Partial<CreateProjectInput>;

// Backend wrapper (your screenshot)
type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  status?: number;
  data: T;
};

// 1) if `api` returns axios response -> take `.data`
// 2) if it already returns payload -> keep it
function payloadOf<T>(res: any): ApiResponse<T> | T {
  return res?.data ?? res;
}

function unwrap<T>(res: ApiResponse<T> | T): T {
  if (res && typeof res === "object" && "data" in (res as any)) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const res = await api.get("/api/projects");
    return unwrap<Project[]>(payloadOf<Project[]>(res));
  },

  get: async (id: string): Promise<Project> => {
    const res = await api.get(`/api/projects/${id}`);
    return unwrap<Project>(payloadOf<Project>(res));
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const res = await api.post("/api/projects", data);
    return unwrap<Project>(payloadOf<Project>(res));
  },

  update: async (id: string, data: UpdateProjectInput): Promise<Project> => {
    const res = await api.put(`/api/projects/${id}`, data);
    return unwrap<Project>(payloadOf<Project>(res));
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await api.delete(`/api/projects/${id}`);
    return unwrap<{ message: string }>(payloadOf<{ message: string }>(res));
  },

  generateLayout: async (id: string): Promise<Project> => {
    const res = await api.post(`/api/projects/${id}/generate-layout`, {});
    return unwrap<Project>(payloadOf<Project>(res));
  },

  publish: async (id: string): Promise<Project> => {
    const res = await api.post(`/api/projects/${id}/publish`, {});
    return unwrap<Project>(payloadOf<Project>(res));
  },
};