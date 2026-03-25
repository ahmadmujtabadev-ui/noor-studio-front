import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  BookOpen,
  FolderKanban,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useCharacters } from "@/hooks/useCharacters";
import { useUser } from "@/hooks/useAuth";
import type { Project, PipelineStage } from "@/lib/api/types";

type ListResponse<T> =
  | T[]
  | {
      items?: T[];
      data?: T[];
      results?: T[];
      projects?: T[];
      characters?: T[];
    }
  | null
  | undefined;

function extractArray<T>(
  input: ListResponse<T>,
  preferredKeys: Array<"items" | "data" | "results" | "projects" | "characters"> = []
): T[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];

  for (const key of preferredKeys) {
    const value = input[key];
    if (Array.isArray(value)) return value;
  }

  const fallbackKeys: Array<"items" | "data" | "results" | "projects" | "characters"> = [
    "items",
    "data",
    "results",
    "projects",
    "characters",
  ];

  for (const key of fallbackKeys) {
    const value = input[key];
    if (Array.isArray(value)) return value;
  }

  return [];
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "Unknown";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

function getProjectStatus(project: Project): "Draft" | "In Progress" | "Completed" {
  const pipeline = Array.isArray(project.pipeline) ? project.pipeline : [];
  const total = pipeline.length;

  if (!total) return "Draft";

  const completed = pipeline.filter(
    (stage: PipelineStage) => stage?.status === "completed"
  ).length;

  if (completed === 0) return "Draft";
  if (completed === total) return "Completed";
  return "In Progress";
}

function getProgress(project: Project): number {
  const pipeline = Array.isArray(project.pipeline) ? project.pipeline : [];
  const total = pipeline.length;

  if (!total) return 0;

  const completed = pipeline.filter(
    (stage: PipelineStage) => stage?.status === "completed"
  ).length;

  return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
}

function getProjectId(project: Project): string {
  return String((project as Project & { _id?: string }).id ?? (project as Project & { _id?: string })._id ?? "");
}

function getProjectTitle(project: Project): string {
  return project.title?.trim() || "Untitled Project";
}

function getProjectAgeRange(project: Project): string {
  return project.ageRange?.trim() || "All ages";
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useUser();

  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjects();

  const {
    data: charactersResponse,
    isLoading: charsLoading,
    error: charactersError,
  } = useCharacters();

  const projects = useMemo(
    () => extractArray<Project>(projectsResponse as ListResponse<Project>, ["projects", "items", "data", "results"]),
    [projectsResponse]
  );

  const characters = useMemo(
    () =>
      extractArray<unknown>(
        charactersResponse as ListResponse<unknown>,
        ["characters", "items", "data", "results"]
      ),
    [charactersResponse]
  );

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aTime = new Date(a.updatedAt ?? 0).getTime();
      const bTime = new Date(b.updatedAt ?? 0).getTime();
      return bTime - aTime;
    });
  }, [projects]);

  const isStatsLoading = projectsLoading || charsLoading;
  const hasListError = Boolean(projectsError || charactersError);

  const stats = useMemo(
    () => [
      {
        label: "Characters",
        value: String(characters.length),
        icon: Users,
        color: "bg-teal-100 text-primary",
      },
      {
        label: "Books",
        value: String(projects.length),
        icon: BookOpen,
        color: "bg-gold-100 text-gold-600",
      },
      {
        label: "Projects",
        value: String(projects.length),
        icon: FolderKanban,
        color: "bg-coral-100 text-coral-500",
      },
    ],
    [characters.length, projects.length]
  );

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || "Author"}
            </h1>
            <p className="text-muted-foreground">
              {user?.credits ?? 0} credits available
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/app/characters/new">
              <Button variant="soft">
                <Plus className="mr-2 h-4 w-4" />
                New Character
              </Button>
            </Link>

            <Link to="/app/books/new">
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                New Book
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="card-premium flex items-center gap-4 p-6">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>

              <div>
                {isStatsLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card-premium p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>

            {sortedProjects.length > 5 && (
              <Link to="/app/projects" className="text-sm text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasListError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Failed to load dashboard data
              </h3>
              <p className="text-sm text-muted-foreground">
                Please refresh the page or verify the projects and characters API responses.
              </p>
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>

              <h3 className="mb-2 text-lg font-semibold">No Projects Yet</h3>

              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Create your first book project to start generating Islamic children&apos;s stories.
              </p>

              <Link to="/app/books/new">
                <Button variant="hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Book
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProjects.slice(0, 5).map((project) => {
                const projectId = getProjectId(project);
                const status = getProjectStatus(project);
                const progress = getProgress(project);

                return (
                  <div
                    key={projectId || getProjectTitle(project)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                    onClick={() => {
                      if (projectId) navigate(`/app/projects/${projectId}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && projectId) {
                        e.preventDefault();
                        navigate(`/app/projects/${projectId}`);
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-teal text-white">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {getProjectTitle(project)}
                        </p>

                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{formatTimeAgo(project.updatedAt)}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{getProjectAgeRange(project)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex shrink-0 items-center gap-4">
                      <div className="hidden items-center gap-2 sm:flex">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              progress === 100 ? "bg-primary" : "bg-gold-500"
                            )}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground">{progress}%</span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          status === "Completed" &&
                            "border-primary/30 bg-primary/10 text-primary",
                          status === "In Progress" &&
                            "border-gold-200 bg-gold-100 text-gold-600",
                          status === "Draft" && "bg-muted text-muted-foreground"
                        )}
                      >
                        {status}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (projectId) navigate(`/app/projects/${projectId}`);
                        }}
                        disabled={!projectId}
                      >
                        Open
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}