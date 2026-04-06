import { useMemo, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus, Users, BookOpen, FolderKanban, Clock,
  Sparkles, Loader2, ChevronLeft, ChevronRight,
  ArrowRight, LayoutGrid, BookMarked,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/hooks/useProjects";
import { useCharacters } from "@/hooks/useCharacters";
import { useUser } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { characterTemplatesApi, type CharacterTemplate } from "@/lib/api/characterTemplates.api";
import { useKBTemplates } from "@/hooks/useKnowledgeBase";
import { DEFAULT_KB_STARTER_TEMPLATES } from "@/constants/kbStarterTemplates";
import type { Project, PipelineStage } from "@/lib/api/types";

type ListResponse<T> =
  | T[]
  | { items?: T[]; data?: T[]; results?: T[]; projects?: T[]; characters?: T[] }
  | null | undefined;

function extractArray<T>(input: ListResponse<T>, preferredKeys: Array<"items"|"data"|"results"|"projects"|"characters"> = []): T[] {
  if (Array.isArray(input)) return input;
  if (!input || typeof input !== "object") return [];
  for (const key of preferredKeys) { const v = input[key]; if (Array.isArray(v)) return v; }
  for (const key of ["items","data","results","projects","characters"] as const) { const v = input[key]; if (Array.isArray(v)) return v; }
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

const STAGE_LABEL: Record<string, string> = {
  story: "Story", structure: "Structure", style: "Style",
  prose: "Writing", humanize: "Writing", illustrations: "Illustrations",
  cover: "Cover", editor: "Editor", layout: "Editor",
};
const CORE_STAGES_CHAPTER = ["story","structure","style","prose","illustrations","cover","editor"];
const CORE_STAGES_OTHER   = ["story","structure","style","illustrations","cover","editor"];

function getProjectInfo(project: Project) {
  const wf = (project as any).workflow as { mode?: string; currentStage?: string; stages?: Record<string, boolean> } | undefined;
  if (wf?.stages) {
    const stages = wf.stages;
    const isChapter = wf.mode === "chapter-book";
    const coreStages = isChapter ? CORE_STAGES_CHAPTER : CORE_STAGES_OTHER;
    const done = coreStages.filter((s) => stages[s]).length;
    const total = coreStages.length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    const isCompleted = done === total;
    const isInProgress = done > 0 && !isCompleted;
    const currentStage = wf.currentStage || "story";
    const status = isCompleted ? "Completed" : isInProgress ? (STAGE_LABEL[currentStage] || "In Progress") : "Draft";
    return { status, progress, isCompleted, isInProgress };
  }
  const pipeline = Array.isArray(project.pipeline) ? project.pipeline : [];
  if (pipeline.length > 0) {
    const completed = pipeline.filter((s: PipelineStage) => s?.status === "completed").length;
    const progress = Math.round((completed / pipeline.length) * 100);
    const isCompleted = completed === pipeline.length;
    const isInProgress = completed > 0 && !isCompleted;
    return { status: isCompleted ? "Completed" : isInProgress ? "In Progress" : "Draft", progress, isCompleted, isInProgress };
  }
  return { status: "Draft", progress: 0, isCompleted: false, isInProgress: false };
}

function getProjectId(p: Project): string { return String((p as any).id ?? (p as any)._id ?? ""); }
function getProjectTitle(p: Project): string { return p.title?.trim() || "Untitled Project"; }
function getProjectAgeRange(p: Project): string { return p.ageRange?.trim() || "All ages"; }

// ─── Horizontal scroll slider ─────────────────────────────────────────────────

function SliderSection({ title, icon: Icon, href, children, count }: {
  title: string;
  icon: React.ElementType;
  href: string;
  children: React.ReactNode;
  count?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    if (ref.current) ref.current.scrollBy({ left: dir === "l" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {count !== undefined && (
              <p className="text-xs text-muted-foreground">{count} available</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll("l")} className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => scroll("r")} className="w-7 h-7 rounded-lg border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <Link to={href}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Character template card ──────────────────────────────────────────────────

function CharTemplateCard({ tpl, onClick }: { tpl: CharacterTemplate; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-44 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden text-left group"
    >
      <div className="relative h-44 bg-muted overflow-hidden">
        {tpl.thumbnailUrl ? (
          <img src={tpl.thumbnailUrl} alt={tpl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {tpl.category === "girl" || tpl.category === "teen-girl" ? "👧" :
             tpl.category === "boy" || tpl.category === "teen-boy" ? "👦" :
             tpl.category === "elder-female" ? "👵" :
             tpl.category === "elder-male" ? "👴" :
             tpl.category === "toddler" ? "🍼" :
             tpl.category === "animal" ? "🐦" : "✨"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs font-semibold truncate drop-shadow">{tpl.name}</p>
        </div>
      </div>
      <div className="p-2.5">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{tpl.category?.replace("-", " ")}</Badge>
      </div>
    </button>
  );
}

// ─── KB template card ─────────────────────────────────────────────────────────

const KB_GRADIENTS: Record<string, string> = {
  "under-six": "from-amber-400 via-yellow-300 to-teal-300",
  "middle-grade": "from-indigo-800 via-purple-700 to-orange-500",
};

function KBTemplateCard({ tpl, onClick }: { tpl: typeof DEFAULT_KB_STARTER_TEMPLATES[0]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-52 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden text-left group"
    >
      <div className={cn("relative h-32 overflow-hidden bg-gradient-to-br", KB_GRADIENTS[tpl.ageGroup] || "from-teal-400 to-blue-500")}>
        {tpl.previewImage ? (
          <img
            src={tpl.previewImage}
            alt={tpl.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ objectPosition: tpl.ageGroup === "under-six" ? "center 55%" : "center 35%" }}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">{tpl.ageRange}</span>
        </div>
        <div className="absolute bottom-2 left-3 flex gap-1">
          {tpl.palette.map((hex) => (
            <span key={hex} className="w-3 h-3 rounded-full border border-white/50" style={{ backgroundColor: hex }} />
          ))}
        </div>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-foreground">{tpl.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tpl.tagline}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {tpl.highlightBadges.slice(0, 2).map((b) => (
            <span key={b} className="text-[10px] bg-primary/8 text-primary px-1.5 py-0.5 rounded-full border border-primary/15">{b}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useUser();

  const { data: projectsResponse, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: charactersResponse, isLoading: charsLoading, error: charactersError } = useCharacters();
  const { data: charTemplates = [], isLoading: charTplLoading } = useQuery({
    queryKey: ["character-templates"],
    queryFn: () => characterTemplatesApi.list(),
  });

  const projects = useMemo(() => extractArray<Project>(projectsResponse as ListResponse<Project>, ["projects","items","data","results"]), [projectsResponse]);
  const characters = useMemo(() => extractArray<unknown>(charactersResponse as ListResponse<unknown>, ["characters","items","data","results"]), [charactersResponse]);

  const sortedProjects = useMemo(() => [...projects].sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()), [projects]);

  const isStatsLoading = projectsLoading || charsLoading;
  const hasListError = Boolean(projectsError || charactersError);

  const stats = useMemo(() => [
    { label: "Characters", value: String(characters.length), icon: Users,        color: "bg-teal-100 text-primary" },
    { label: "Books",      value: String(projects.length),   icon: BookOpen,     color: "bg-amber-100 text-amber-600" },
    { label: "Projects",   value: String(projects.length),   icon: FolderKanban, color: "bg-rose-100 text-rose-500" },
  ], [characters.length, projects.length]);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {user?.name || "Author"}
            </h1>
            <p className="text-muted-foreground text-sm">{user?.credits ?? 0} credits available</p>
          </div>
          <div className="flex gap-3">
            <Link to="/app/characters/new">
              <Button variant="soft"><Plus className="mr-2 h-4 w-4" />New Character</Button>
            </Link>
            <Link to="/app/books/new">
              <Button variant="hero"><Plus className="mr-2 h-4 w-4" />New Book</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="card-premium flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                {isStatsLoading
                  ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  : <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                }
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Character Templates Slider */}
        <SliderSection
          title="Character Templates"
          icon={LayoutGrid}
          href="/app/character-templates"
          count={charTemplates.length}
        >
          {charTplLoading ? (
            <div className="flex items-center justify-center w-full py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : charTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-10 text-muted-foreground gap-2">
              <Users className="w-8 h-8 opacity-30" />
              <p className="text-sm">No character templates yet</p>
            </div>
          ) : (
            charTemplates.map((tpl) => (
              <CharTemplateCard
                key={tpl._id || tpl.name}
                tpl={tpl}
                onClick={() => navigate("/app/character-templates")}
              />
            ))
          )}
        </SliderSection>

        {/* KB Templates Slider */}
        <SliderSection
          title="Knowledge Base Templates"
          icon={BookMarked}
          href="/app/kb-templates"
          count={DEFAULT_KB_STARTER_TEMPLATES.length}
        >
          {DEFAULT_KB_STARTER_TEMPLATES.map((tpl) => (
            <KBTemplateCard
              key={tpl.id}
              tpl={tpl}
              onClick={() => navigate("/app/kb-templates")}
            />
          ))}
        </SliderSection>

        {/* Recent Projects */}
        <div className="card-premium p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Projects</h2>
            {sortedProjects.length > 5 && (
              <Link to="/app/projects" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : hasListError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-foreground">Failed to load dashboard data</h3>
              <p className="text-sm text-muted-foreground">Please refresh the page or verify the API responses.</p>
            </div>
          ) : sortedProjects.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No Projects Yet</h3>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">
                Create your first book project to start generating Islamic children's stories.
              </p>
              <Link to="/app/books/new">
                <Button variant="hero"><Plus className="mr-2 h-4 w-4" />Create Your First Book</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedProjects.slice(0, 5).map((project) => {
                const projectId = getProjectId(project);
                const { status, progress, isCompleted, isInProgress } = getProjectInfo(project);
                return (
                  <div
                    key={projectId || getProjectTitle(project)}
                    className="flex cursor-pointer items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                    onClick={() => { if (projectId) navigate(`/app/books/${projectId}`); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && projectId) { e.preventDefault(); navigate(`/app/books/${projectId}`); } }}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-teal text-white">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{getProjectTitle(project)}</p>
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
                            className={cn("h-full rounded-full transition-all", progress === 100 ? "bg-primary" : "bg-amber-500")}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="w-8 text-xs text-muted-foreground">{progress}%</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs whitespace-nowrap",
                          isCompleted  && "border-primary/30 bg-primary/10 text-primary",
                          isInProgress && "border-amber-200 bg-amber-100 text-amber-600",
                          !isCompleted && !isInProgress && "bg-muted text-muted-foreground"
                        )}
                      >
                        {status}
                      </Badge>
                      <Button variant="ghost" size="sm"
                        onClick={(e) => { e.stopPropagation(); if (projectId) navigate(`/app/books/${projectId}`); }}
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
