import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/api/projects.api";
import { useAuthStore } from "@/lib/store/authStore";
import type { Project } from "@/lib/api/types";

export const PROJECTS_KEY = ["projects"] as const;
export const projectKey = (id: string) => ["projects", id] as const;

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: projectsApi.list,
    staleTime: 60 * 1000,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKey(id ?? ""),
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess: (created) => {
      // update detail cache
      qc.setQueryData(projectKey(created.id), created);

      // invalidate list so it includes the new project
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(id, data),
    onSuccess: (updated) => {
      // update detail cache immediately
      qc.setQueryData(projectKey(id), updated);

      // refresh list entries (title/cover etc.)
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: (_res, id) => {
      // remove detail cache
      qc.removeQueries({ queryKey: projectKey(id) });

      // refresh list
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useGenerateLayout(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.generateLayout(id),
    onSuccess: (updated) => {
      qc.setQueryData(projectKey(id), updated);
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });

      // refresh user credits etc.
      useAuthStore.getState().refreshUser();
    },
  });
}

export function usePublishProject(id: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData(projectKey(id), updated);
      qc.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}