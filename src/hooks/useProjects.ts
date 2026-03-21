// src/hooks/useProjects.ts
// Complete project hooks — CRUD + summary + step tracking + layout + publish

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi, type CreateProjectInput, type UpdateProjectInput } from '@/lib/api/projects.api';
import { useAuthStore } from '@/lib/store/authStore';
import type { Project, ProjectSummary } from '@/lib/api/types';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const PROJECTS_KEY = ['projects'] as const;
export const projectKey = (id: string) => ['projects', id] as const;
export const projectSummaryKey = (id: string) => ['projects', id, 'summary'] as const;

// ─── List ─────────────────────────────────────────────────────────────────────

export function useProjects(params?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, params],
    queryFn: () => projectsApi.list(params),
    staleTime: 60_000,
  });
}

// ─── Get one ──────────────────────────────────────────────────────────────────

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKey(id ?? ''),
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

// ─── Summary (lightweight stats + characters) ─────────────────────────────────

export function useProjectSummary(id: string | undefined) {
  return useQuery<ProjectSummary>({
    queryKey: projectSummaryKey(id ?? ''),
    queryFn: () => projectsApi.getSummary(id!),
    enabled: !!id,
    staleTime: 20_000,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess: (created: Project) => {
      qc.setQueryData(projectKey(created.id), created);
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(id, data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKey(id) });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: (_res: unknown, id: string) => {
      qc.removeQueries({ queryKey: projectKey(id) });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export function useDuplicateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.duplicate(id),
    onSuccess: (created: Project) => {
      qc.setQueryData(projectKey(created.id), created);
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

// ─── Step tracking (5-step flow) ──────────────────────────────────────────────

export function useAdvanceStep(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ step, complete = true }: { step: number; complete?: boolean }) =>
      projectsApi.advanceStep(id, step, complete),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKey(id) });
      await qc.invalidateQueries({ queryKey: projectSummaryKey(id) });
    },
  });
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export function useGenerateLayout(id: string) {
  const qc = useQueryClient();
  const refreshUser = useAuthStore(s => s.refreshUser);
  return useMutation({
    mutationFn: () => projectsApi.generateLayout(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKey(id) });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
      refreshUser();
    },
  });
}

// ─── Publish ──────────────────────────────────────────────────────────────────

export function usePublishProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isPublic = true) => projectsApi.publish(id, isPublic),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: projectKey(id) });
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}