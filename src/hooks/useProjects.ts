// hooks/useProjects.ts  (drop-in replacement)
// Adds review-specific mutations on top of the existing CRUD/layout/publish mutations.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects.api";
import { useAuthStore } from "@/lib/store/authStore";
import type { Project, ProjectSummary } from "@/lib/api/types";
import { reviewApi } from "@/lib/api/review.api";

/* -------------------------------------------------------------------------- */
/* Query keys                                                                 */
/* -------------------------------------------------------------------------- */

export const PROJECTS_KEY              = ["projects"] as const;
export const projectKey        = (id: string) => ["projects", id]                 as const;
export const projectSummaryKey = (id: string) => ["projects", id, "summary"]      as const;
export const projectReviewKey  = (id: string) => ["projects", id, "review"]       as const;
export const structureKey      = (id: string) => ["projects", id, "structure"]    as const;
export const illustrationsKey  = (id: string) => ["projects", id, "illustrations"] as const;
export const coverKey          = (id: string) => ["projects", id, "cover"]        as const;

/* -------------------------------------------------------------------------- */
/* Shared invalidation                                                        */
/* -------------------------------------------------------------------------- */

async function invalidateProjectFamily(qc: ReturnType<typeof useQueryClient>, id: string) {
  await Promise.all([
    qc.invalidateQueries({ queryKey: projectKey(id)         }),
    qc.invalidateQueries({ queryKey: projectSummaryKey(id)  }),
    qc.invalidateQueries({ queryKey: projectReviewKey(id)   }),
    qc.invalidateQueries({ queryKey: structureKey(id)       }),
    qc.invalidateQueries({ queryKey: illustrationsKey(id)   }),
    qc.invalidateQueries({ queryKey: coverKey(id)           }),
    qc.invalidateQueries({ queryKey: PROJECTS_KEY           }),
    qc.invalidateQueries({ queryKey: ["pageList", id]       }),
  ]);
}

/* -------------------------------------------------------------------------- */
/* List / get / summary                                                       */
/* -------------------------------------------------------------------------- */

export function useProjects(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, params ?? {}],
    queryFn:  () => projectsApi.list(params),
    staleTime: 60_000,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey:    projectKey(id ?? ""),
    queryFn:     () => projectsApi.get(id!),
    enabled:     !!id,
    staleTime:   30_000,
    refetchOnWindowFocus: true,
  });
}

export function useProjectSummary(id: string | undefined) {
  return useQuery<ProjectSummary>({
    queryKey: projectSummaryKey(id ?? ""),
    queryFn:  () => projectsApi.getSummary(id!),
    enabled:  !!id,
    staleTime: 20_000,
  });
}

/* -------------------------------------------------------------------------- */
/* Full review context (GET /review — bootstraps + hydrates all stages)      */
/* -------------------------------------------------------------------------- */

export function useProjectReview(id: string | undefined) {
  return useQuery({
    queryKey: projectReviewKey(id ?? ""),
    queryFn:  () => reviewApi.get(id!),
    enabled:  !!id,
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}

/* -------------------------------------------------------------------------- */
/* Create / update / delete / duplicate                                       */
/* -------------------------------------------------------------------------- */

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess:  async (created: Project) => {
      const id = created.id || created._id;
      if (id) qc.setQueryData(projectKey(id), created);
      await qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(id, data),
    onSuccess:  async (updated: Project) => {
      qc.setQueryData(projectKey(id), updated);
      await invalidateProjectFamily(qc, id);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess:  async (_res, id) => {
      qc.removeQueries({ queryKey: projectKey(id) });
      qc.removeQueries({ queryKey: projectSummaryKey(id) });
      qc.removeQueries({ queryKey: projectReviewKey(id) });
      await qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.duplicate(id),
    onSuccess:  async (created: Project) => {
      const id = created.id || created._id;
      if (id) qc.setQueryData(projectKey(id), created);
      await qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Step tracking                                                              */
/* -------------------------------------------------------------------------- */

export function useAdvanceStep(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ step, complete = true }: { step: number; complete?: boolean }) =>
      projectsApi.advanceStep(id, step, complete),
    onSuccess: async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Layout & publish                                                           */
/* -------------------------------------------------------------------------- */

export function useGenerateLayout(id: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: () => projectsApi.generateLayout(id),
    onSuccess:  async () => {
      await invalidateProjectFamily(qc, id);
      await refreshUser();
    },
  });
}

export function usePublishProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isPublic = true) => projectsApi.publish(id, isPublic),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Review bootstrap                                                           */
/* -------------------------------------------------------------------------- */

export function useBootstrapReview(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.bootstrap(id),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Story review                                                               */
/* -------------------------------------------------------------------------- */

export function usePatchStoryReview(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof reviewApi.patchStory>[1]) => reviewApi.patchStory(id, body),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useRegenerateStory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (storyIdea?: string) => reviewApi.regenerateStory(id, storyIdea),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useApproveStory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.approveStory(id),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Structure review                                                           */
/* -------------------------------------------------------------------------- */

export function useRegenerateStructure(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reviewApi.regenerateStructure(id),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function usePatchStructureItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, current }: { key: string; current: Record<string, unknown> }) =>
      reviewApi.patchStructureItem(id, key, current as any),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useApproveStructureItem(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => reviewApi.approveStructureItem(id, key),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Chapter prose review                                                       */
/* -------------------------------------------------------------------------- */

export function useRegenerateChapterProse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterIndex: number) => reviewApi.regenerateChapterProse(id, chapterIndex),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function usePatchChapterProse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterIndex, body }: { chapterIndex: number; body: Record<string, unknown> }) =>
      reviewApi.patchChapterProse(id, chapterIndex, body as any),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useHumanizeChapterProse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterIndex: number) => reviewApi.humanizeChapterProse(id, chapterIndex),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useApproveChapterProse(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chapterIndex: number) => reviewApi.approveChapterProse(id, chapterIndex),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Illustration review                                                        */
/* -------------------------------------------------------------------------- */

export function useIllustrations(id: string | undefined) {
  return useQuery({
    queryKey: illustrationsKey(id ?? ""),
    queryFn:  () => reviewApi.getIllustrations(id!),
    enabled:  !!id,
    staleTime: 15_000,
  });
}

export function useRegenerateIllustration(id: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: ({ key, body }: { key: string; body: { variantCount?: number; prompt?: string } }) =>
      reviewApi.regenerateIllustration(id, key, body),
    onSuccess:  async () => {
      await invalidateProjectFamily(qc, id);
      await refreshUser(); // credits may have changed
    },
  });
}

export function useSelectIllustrationVariant(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, variantIndex }: { key: string; variantIndex: number }) =>
      reviewApi.selectIllustrationVariant(id, key, variantIndex),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useApproveIllustration(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => reviewApi.approveIllustration(id, key),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

/* -------------------------------------------------------------------------- */
/* Cover review                                                               */
/* -------------------------------------------------------------------------- */

export function useCoverReview(id: string | undefined) {
  return useQuery({
    queryKey: coverKey(id ?? ""),
    queryFn:  () => reviewApi.getCover(id!),
    enabled:  !!id,
    staleTime: 15_000,
  });
}

export function useRegenerateCover(id: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  return useMutation({
    mutationFn: ({ side, body }: { side: "front" | "back"; body?: { variantCount?: number; prompt?: string } }) =>
      reviewApi.regenerateCover(id, side, body),
    onSuccess:  async () => {
      await invalidateProjectFamily(qc, id);
      await refreshUser();
    },
  });
}

export function useSelectCoverVariant(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ side, variantIndex }: { side: "front" | "back"; variantIndex: number }) =>
      reviewApi.selectCoverVariant(id, side, variantIndex),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}

export function useApproveCover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (side: "front" | "back") => reviewApi.approveCover(id, side),
    onSuccess:  async () => { await invalidateProjectFamily(qc, id); },
  });
}