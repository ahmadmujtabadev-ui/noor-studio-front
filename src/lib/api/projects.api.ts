import { api } from "./client";
import type { Project, ProjectSummary } from "./types";

export interface CreateProjectInput {
  universeId?: string;
  knowledgeBaseId?: string;
  characterIds?: string[];
  title: string;
  ageRange?: string;
  chapterCount?: number;
  template?: string;
  learningObjective?: string;
  authorName?: string;
  trimSize?: string;
  language?: string;
  bookStyle?: Record<string, unknown>;
  storyIdea?: string;
}

export interface UpdateProjectInput {
  title?: string;
  ageRange?: string;
  chapterCount?: number;
  template?: string;
  learningObjective?: string;
  authorName?: string;
  trimSize?: string;
  language?: string;
  status?: string;
  currentStage?: string;
  currentStep?: number;
  characterIds?: string[];
  bookStyle?: Record<string, unknown>;
  imageWidth?: number;
  imageHeight?: number;
  stepsComplete?: {
    story?: boolean;
    spreads?: boolean;
    style?: boolean;
    images?: boolean;
    editor?: boolean;
  };
  artifacts?: Record<string, unknown>;
}

export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AdvanceStepResponse {
  message: string;
  currentStep: number;
  stepsComplete?: {
    story?: boolean;
    spreads?: boolean;
    style?: boolean;
    images?: boolean;
    editor?: boolean;
  };
}

export interface PublishResponse {
  shareUrl: string;
  shareToken: string;
  publishedAt: string;
}

export interface LayoutResponse {
  layout: Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* Project review types                                                       */
/* -------------------------------------------------------------------------- */

export type ReviewStageId =
  | "story"
  | "structure"
  | "chapters"
  | "spreads"
  | "humanize"
  | "illustrations"
  | "cover"
  | "layout"
  | "export";

export interface ReviewStageStatus {
  stage: ReviewStageId;
  approved: boolean;
  approvedAt?: string | null;
  approvedBy?: string | null;
  status?: "draft" | "edited" | "approved" | "rejected" | "generated";
  notes?: string;
  updatedAt?: string | null;
}

export interface ReviewContextResponse {
  projectId: string;
  spreadOnly: boolean;
  chapterBook: boolean;
  ageRange?: string;
  currentStep?: number;
  status?: string;
  title?: string;
  outline?: Record<string, unknown> | null;
  storyText?: string | null;
  spreads?: Array<Record<string, unknown>>;
  chapters?: Array<Record<string, unknown>>;
  humanized?: Array<Record<string, unknown>>;
  illustrations?: Array<Record<string, unknown>>;
  spreadIllustrations?: Array<Record<string, unknown>>;
  cover?: Record<string, unknown> | null;
  layout?: Record<string, unknown> | null;
  review?: ReviewStageStatus[];
}

export interface SaveReviewSectionRequest {
  stage: ReviewStageId;
  data: Record<string, unknown>;
}

export interface SaveReviewSectionResponse {
  message: string;
  stage: ReviewStageId;
  updatedAt: string;
}

export interface ApproveReviewStageRequest {
  stage: ReviewStageId;
  notes?: string;
}

export interface ApproveReviewStageResponse {
  message: string;
  stage: ReviewStageId;
  approved: true;
  approvedAt: string;
}

export interface ResetReviewStageRequest {
  stage: ReviewStageId;
  reason?: string;
}

export interface ResetReviewStageResponse {
  message: string;
  stage: ReviewStageId;
  approved: false;
  resetAt: string;
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export const projectsApi = {
  list: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ProjectListResponse> =>
    api.get("/api/projects", { params }),

  get: (id: string): Promise<Project> => api.get(`/api/projects/${id}`),

  getSummary: (id: string): Promise<ProjectSummary> =>
    api.get(`/api/projects/${id}/summary`),

  create: (data: CreateProjectInput): Promise<Project> =>
    api.post("/api/projects", data),

  update: (id: string, data: UpdateProjectInput): Promise<Project> =>
    api.put(`/api/projects/${id}`, data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/api/projects/${id}`),

  duplicate: (id: string): Promise<Project> =>
    api.post(`/api/projects/${id}/duplicate`),

  advanceStep: (
    id: string,
    step: number,
    complete = true,
  ): Promise<AdvanceStepResponse> =>
    api.patch(`/api/projects/${id}/step`, { step, complete }),

  generateLayout: (id: string): Promise<LayoutResponse> =>
    api.post(`/api/projects/${id}/layout`),

  publish: (id: string, isPublic = true): Promise<PublishResponse> =>
    api.post(`/api/projects/${id}/publish`, { isPublic }),

  /* ---------------------------------------------------------------------- */
  /* Review workflow                                                        */
  /* ---------------------------------------------------------------------- */

  getReviewContext: (id: string): Promise<ReviewContextResponse> =>
    api.get(`/api/projects/${id}/review`),

  saveReviewSection: (
    id: string,
    payload: SaveReviewSectionRequest,
  ): Promise<SaveReviewSectionResponse> =>
    api.put(`/api/projects/${id}/review`, payload),

  approveReviewStage: (
    id: string,
    payload: ApproveReviewStageRequest,
  ): Promise<ApproveReviewStageResponse> =>
    api.post(`/api/projects/${id}/review/approve`, payload),

  resetReviewStage: (
    id: string,
    payload: ResetReviewStageRequest,
  ): Promise<ResetReviewStageResponse> =>
    api.post(`/api/projects/${id}/review/reset`, payload),
};