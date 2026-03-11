"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Play,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Image,
  Package,
  Layout,
  Download,
  FileText,
  Sparkles,
  Share2,
  RefreshCw,
  CreditCard,
  Zap,
  Eye,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePublishProject } from "@/hooks/useProjects";
import { useAuthStore, useCredits } from "@/hooks/useAuth";
import { useDownloadPdf } from "@/hooks/usePayments";
import { aiApi } from "@/lib/api/ai.api";
import { projectsApi } from "@/lib/api/projects.api";
import { PIPELINE_STAGES, STAGE_CREDIT_COSTS } from "@/lib/models";
import type { Project, PipelineStage } from "@/lib/api/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const STAGE_ICONS: Record<string, React.ElementType> = {
  outline: FileText,
  chapters: BookOpen,
  humanize: Sparkles,
  illustrations: Image,
  cover: Package,
  layout: Layout,
  export: Download,
};

const STAGE_LABELS: Record<string, string> = {
  outline: "Outline",
  chapters: "Chapters",
  humanize: "Humanize",
  illustrations: "Illustrations",
  cover: "Cover",
  layout: "Layout",
  export: "Export",
};

type StageApiType = "text" | "image" | "project" | "batch";

const STAGE_API_TYPE: Record<string, StageApiType> = {
  outline: "text",
  chapters: "text",
  humanize: "text",
  illustrations: "image",
  cover: "image",
  layout: "project",
  export: "batch",
};

const STAGE_IMAGE_TASK: Record<string, string> = {
  illustrations: "illustrations",
  cover: "cover",
};

const ARTIFACT_STAGE_KEYS: Record<string, string> = {
  outline: "outline",
  chapters: "chapters",
  humanize: "humanized",
  illustrations: "illustrations",
  cover: "cover",
  layout: "layout",
  export: "export",
};

type IllustrationVariant = {
  variantIndex: number;
  imageUrl?: string;
  prompt?: string;
  seed?: number | null;
  selected?: boolean;
  pageRole?: string;
};

type IllustrationItem = {
  chapterNumber: number;
  variants?: IllustrationVariant[];
  selectedVariantIndex?: number;
  status?: string;
  imagesPerChapter?: number;
};

interface MergedStage {
  id: string;
  label: string;
  creditCost: number;
  requiresStage?: string;
  status: string;
  progress: number;
  message?: string;
  completedAt?: string;
}

function getMergedPipeline(
  projectPipeline: PipelineStage[] = [],
  artifacts: Record<string, any> = {}
): MergedStage[] {
  return PIPELINE_STAGES.map((def) => {
    const live = projectPipeline.find((s) => s.name === def.id);

    if (live) {
      return {
        id: def.id,
        label: def.label,
        creditCost: def.creditCost,
        requiresStage: def.requiresStage,
        status: live.status ?? "pending",
        progress: live.progress ?? 0,
        message: live.message,
        completedAt: live.completedAt,
      };
    }

    const artifactKey = ARTIFACT_STAGE_KEYS[def.id];
    const artifactData = artifactKey
      ? (artifacts[artifactKey] ?? artifacts[def.id])
      : undefined;

    const hasData = Array.isArray(artifactData)
      ? artifactData.length > 0
      : artifactData != null &&
        typeof artifactData === "object" &&
        Object.keys(artifactData).length > 0;

    const derivedStatus = hasData ? "completed" : "pending";
    const stageAiUsage = artifacts?.__aiUsage?.stages?.[def.id];

    return {
      id: def.id,
      label: def.label,
      creditCost: def.creditCost,
      requiresStage: def.requiresStage,
      status: derivedStatus,
      progress: derivedStatus === "completed" ? 100 : 0,
      message: undefined,
      completedAt: stageAiUsage?.updatedAt,
    };
  });
}

function resolveSpreadImage(project: Project, spread: any): string | null {
  const arts = (project.artifacts || {}) as Record<string, any>;
  const content = spread?.content ?? {};

  if (spread?.type === "cover") {
    return (
      arts.cover?.frontUrl ||
      arts.cover?.frontCoverUrl ||
      arts.cover?.imageUrl ||
      null
    );
  }

  if (spread?.type === "back-cover") {
    return arts.cover?.backUrl || arts.cover?.backCoverUrl || null;
  }

  if (spread?.type === "illustration") {
    const chapterIndex =
      typeof content.chapterIndex === "number"
        ? content.chapterIndex
        : typeof content.chapterNumber === "number"
        ? content.chapterNumber - 1
        : -1;

    if (chapterIndex < 0) return null;

    const illustration = arts.illustrations?.[chapterIndex];
    const variantIndex =
      typeof content.variantIndex === "number"
        ? content.variantIndex
        : illustration?.selectedVariantIndex ?? 0;

    return illustration?.variants?.[variantIndex]?.imageUrl ?? null;
  }

  return content.imageUrl ?? null;
}

function StageCard({
  stage,
  allStages,
  onRun,
  isAnyRunning,
}: {
  stage: MergedStage;
  allStages: MergedStage[];
  onRun: (id: string) => void;
  isAnyRunning: boolean;
}) {
  const { status, progress, message } = stage;

  const prerequisiteMet =
    !stage.requiresStage ||
    allStages.find((s) => s.id === stage.requiresStage)?.status === "completed";

  const canRun = prerequisiteMet && status !== "running" && !isAnyRunning;
  const Icon = STAGE_ICONS[stage.id] || FileText;

  const cfg = {
    pending: {
      wrap: "bg-background border-border",
      badge: "bg-muted text-muted-foreground",
    },
    running: {
      wrap: "bg-blue-50 dark:bg-blue-950/30 border-blue-200",
      badge: "bg-blue-100 text-blue-600",
    },
    completed: {
      wrap: "bg-green-50 dark:bg-green-950/20 border-green-200",
      badge: "bg-green-100 text-green-700",
    },
    error: {
      wrap: "bg-red-50 dark:bg-red-950/20 border-destructive/30",
      badge: "bg-red-100 text-red-600",
    },
  }[status] ?? {
    wrap: "bg-background border-border",
    badge: "bg-muted text-muted-foreground",
  };

  return (
    <div className={cn("rounded-xl border-2 p-4 transition-all", cfg.wrap)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            status === "completed"
              ? "bg-green-500/15"
              : status === "running"
              ? "bg-blue-500/15"
              : status === "error"
              ? "bg-destructive/10"
              : "bg-muted/60"
          )}
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : status === "running" ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : status === "error" ? (
            <AlertCircle className="h-5 w-5 text-destructive" />
          ) : (
            <Icon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{stage.label}</span>
            <Badge className={cn("px-1.5 py-0 text-xs", cfg.badge)}>
              {status}
            </Badge>
          </div>

          {status === "running" && (
            <div className="mt-1.5">
              <Progress value={progress} className="mb-1 h-1.5" />
              {message && <p className="text-xs text-blue-600">{message}</p>}
            </div>
          )}

          {status === "error" && message && (
            <p className="mt-0.5 truncate text-xs text-destructive">{message}</p>
          )}

          {status === "pending" && !prerequisiteMet && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Requires {stage.requiresStage} first
            </p>
          )}

          {status === "completed" && stage.completedAt && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              <Clock className="mr-0.5 inline h-3 w-3" />
              {new Date(stage.completedAt).toLocaleTimeString()}
            </p>
          )}
        </div>

        {status !== "running" && (
          <Button
            size="sm"
            variant={status === "completed" ? "outline" : "hero"}
            onClick={() => onRun(stage.id)}
            disabled={!canRun}
            className="shrink-0 text-xs"
          >
            {status === "completed" ? (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                Re-run
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" />
                Run ({stage.creditCost} cr)
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function ArtifactViewer({ project }: { project: Project }) {
  const arts = (project.artifacts || {}) as Record<string, any>;

  const artifactsWithMeta = { ...arts, __aiUsage: (project as any).aiUsage };
  const mergedPipeline = getMergedPipeline(project.pipeline, artifactsWithMeta);
  const completedIds = mergedPipeline
    .filter((s) => s.status === "completed")
    .map((s) => s.id);

  const [activeTab, setActiveTab] = useState(completedIds[0] || "");

  useEffect(() => {
    if (completedIds.length > 0 && !completedIds.includes(activeTab)) {
      setActiveTab(completedIds[completedIds.length - 1]);
    }
  }, [completedIds, activeTab]);

  if (completedIds.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-background p-12 text-center">
        <Sparkles className="mb-4 h-14 w-14 text-muted-foreground/20" />
        <h3 className="mb-2 text-lg font-semibold">No Content Yet</h3>
        <p className="text-sm text-muted-foreground">
          Run pipeline stages to generate your book content.
        </p>
      </div>
    );
  }

  const illustrations: IllustrationItem[] = arts.illustrations ?? [];

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full" type="scroll">
          <TabsList className="mb-4">
            {completedIds.map((sid) => (
              <TabsTrigger
                key={sid}
                value={sid}
                className="text-xs capitalize sm:text-sm"
              >
                {STAGE_LABELS[sid] || sid}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        <TabsContent value="outline" className="mt-0 space-y-3">
          {arts.outline?.bookTitle && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                Book Title
              </p>
              <p className="text-base font-bold">{arts.outline.bookTitle}</p>
            </div>
          )}

          {(arts.outline?.moral || arts.outline?.synopsis) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:bg-amber-950/20">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Moral
              </p>
              <p className="text-sm leading-relaxed">
                {arts.outline.moral ?? arts.outline.synopsis}
              </p>
            </div>
          )}

          {(arts.outline?.chapters || []).map((ch: any, i: number) => (
            <div
              key={i}
              className="space-y-1.5 rounded-xl border border-border bg-muted/50 p-4 text-sm"
            >
              <p className="font-semibold">
                {typeof ch === "string"
                  ? ch
                  : `Ch. ${i + 1}: ${ch.title || "Untitled"}`}
              </p>

              {ch.goal && (
                <p className="text-xs text-muted-foreground">{ch.goal}</p>
              )}

              {ch.keyScene && (
                <div className="mt-1 rounded-lg border border-border/60 bg-background p-2">
                  <span className="text-xs font-medium text-primary">
                    Key Scene:{" "}
                  </span>
                  <span className="text-xs text-foreground/70">
                    {ch.keyScene}
                  </span>
                </div>
              )}

              {ch.duaHint && ch.duaHint !== "none" && (
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">
                    🤲 Dua:
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ch.duaHint}
                  </span>
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="chapters" className="mt-0 space-y-3">
          {(arts.chapters || []).map((ch: any, i: number) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Chapter {ch.chapterNumber}: {ch.chapterTitle ?? ch.title}
                </p>
                {ch.wordCount && (
                  <Badge variant="outline" className="text-xs">
                    {ch.wordCount} words
                  </Badge>
                )}
              </div>

              <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80">
                {ch.text ?? ch.content}
              </p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="humanize" className="mt-0 space-y-3">
          <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
            ✓ Text polished
          </div>

          {(arts.humanized || []).map((ch: any, i: number) => (
            <div key={i} className="rounded-xl border border-border p-4">
              <p className="mb-2 text-sm font-semibold">
                Chapter {ch.chapterNumber}: {ch.chapterTitle}
              </p>

              <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-foreground/80">
                {ch.text}
              </p>

              {ch.changesMade?.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    {ch.changesMade.length} edits made
                  </summary>
                  <ul className="mt-2 space-y-1">
                    {ch.changesMade.map((change: string, j: number) => (
                      <li
                        key={j}
                        className="flex gap-1.5 text-xs text-muted-foreground"
                      >
                        <span className="shrink-0 text-green-500">✓</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="illustrations" className="mt-0">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {illustrations.flatMap((ill) =>
              (ill.variants ?? []).map((variant) => (
                <div
                  key={`${ill.chapterNumber}-${variant.variantIndex}`}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  {variant.imageUrl ? (
                    <img
                      src={variant.imageUrl}
                      alt={`Chapter ${ill.chapterNumber} variant ${
                        variant.variantIndex + 1
                      }`}
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center bg-muted">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2">
                    <p className="text-xs text-muted-foreground">
                      Ch. {ill.chapterNumber} • V{variant.variantIndex + 1}
                    </p>

                    {variant.selected && (
                      <Badge variant="outline" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="cover" className="mt-0">
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            {arts.cover?.frontUrl && (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={arts.cover.frontUrl} alt="Front" className="w-full" />
                <p className="p-2 text-center text-xs text-muted-foreground">
                  Front
                </p>
              </div>
            )}

            {arts.cover?.backUrl && (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={arts.cover.backUrl} alt="Back" className="w-full" />
                <p className="p-2 text-center text-xs text-muted-foreground">
                  Back
                </p>
              </div>
            )}

            {!arts.cover?.frontUrl && arts.cover?.imageUrl && (
              <div className="overflow-hidden rounded-xl border border-border">
                <img src={arts.cover.imageUrl} alt="Cover" className="w-full" />
                <p className="p-2 text-center text-xs text-muted-foreground">
                  Cover
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="layout" className="mt-0 space-y-4">
          <div className="space-y-1 rounded-xl border border-border bg-muted/50 p-4 text-sm">
            {arts.layout?.pageCount && (
              <p>
                <span className="font-medium">Pages:</span> {arts.layout.pageCount}
              </p>
            )}

            {arts.layout?.trimSize && (
              <p>
                <span className="font-medium">Trim:</span> {arts.layout.trimSize}
              </p>
            )}
          </div>

          {Array.isArray(arts.layout?.spreads) && arts.layout.spreads.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {arts.layout.spreads.map((spread: any, i: number) => {
                const resolvedImageUrl = resolveSpreadImage(project, spread);

                return (
                  <div
                    key={`${spread.page}-${spread.type}-${i}`}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <div className="flex items-center justify-between border-b border-border px-3 py-2">
                      <p className="text-sm font-medium">
                        Page {spread.page} • {spread.type}
                      </p>
                    </div>

                    <div className="space-y-3 p-3">
                      {resolvedImageUrl ? (
                        <img
                          src={resolvedImageUrl}
                          alt={`Page ${spread.page}`}
                          className="w-full rounded-lg border border-border object-cover"
                        />
                      ) : null}

                      {spread.content?.title && (
                        <p className="text-base font-semibold">{spread.content.title}</p>
                      )}

                      {spread.content?.author && (
                        <p className="text-sm text-muted-foreground">
                          By {spread.content.author}
                        </p>
                      )}

                      {spread.content?.chapterTitle && (
                        <p className="text-sm font-medium">
                          {spread.content.chapterTitle}
                        </p>
                      )}

                      {spread.content?.text && (
                        <p className="line-clamp-6 whitespace-pre-line text-sm text-foreground/80">
                          {spread.content.text}
                        </p>
                      )}

                      {Array.isArray(spread.content?.vocabulary) &&
                        spread.content.vocabulary.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Vocabulary</p>
                            <ul className="list-disc pl-5 text-sm text-foreground/80">
                              {spread.content.vocabulary.map((word: any, idx: number) => (
                                <li key={idx}>
                                  {typeof word === "string"
                                    ? word
                                    : word.word || word.term || JSON.stringify(word)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {!resolvedImageUrl &&
                        !spread.content?.title &&
                        !spread.content?.author &&
                        !spread.content?.chapterTitle &&
                        !spread.content?.text &&
                        !spread.content?.vocabulary && (
                          <p className="text-sm text-muted-foreground">
                            No preview data
                          </p>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-0">
          <p className="text-sm text-muted-foreground">
            Export files available after running the export stage.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const qc = useQueryClient();

  const [runningStageId, setRunningStageId] = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const p = query.state.data as Project | undefined;
      const serverRunning = p?.pipeline?.some(
        (s: PipelineStage) => s.status === "running"
      );
      return serverRunning || runningStageId ? 3000 : false;
    },
  });

  useEffect(() => {
    if (!project || !runningStageId) return;

    const live = project.pipeline?.find(
      (s: PipelineStage) => s.name === runningStageId
    );

    if (live && live.status !== "running") {
      setRunningStageId(null);
      return;
    }

    const artifactKey = ARTIFACT_STAGE_KEYS[runningStageId];
    if (artifactKey) {
      const artifactData = (project.artifacts as any)?.[artifactKey];
      const hasData = Array.isArray(artifactData)
        ? artifactData.length > 0
        : artifactData != null &&
          typeof artifactData === "object" &&
          Object.keys(artifactData ?? {}).length > 0;

      if (hasData) setRunningStageId(null);
    }
  }, [project, runningStageId]);

  const publishMutation = usePublishProject(id!);
  const downloadPdf = useDownloadPdf(id!);

  const artifacts = (project?.artifacts || {}) as Record<string, any>;
  const artifactsWithMeta = { ...artifacts, __aiUsage: (project as any)?.aiUsage };
  const mergedPipeline = getMergedPipeline(project?.pipeline, artifactsWithMeta);

  const isAnyRunning =
    !!runningStageId || mergedPipeline.some((s) => s.status === "running");
  const completedCount = mergedPipeline.filter(
    (s) => s.status === "completed"
  ).length;
  const overallProgress = Math.round(
    (completedCount / PIPELINE_STAGES.length) * 100
  );
  const isExportReady =
    mergedPipeline.find((s) => s.id === "layout")?.status === "completed";
  const creditCost = confirmStage
    ? (STAGE_CREDIT_COSTS[confirmStage] ?? 3)
    : 0;

  const dispatchStageApi = async (stageId: string): Promise<void> => {
    if (!project) throw new Error("Project not found");

    const apiType = STAGE_API_TYPE[stageId] ?? "batch";

    if (apiType === "image") {
      const task = STAGE_IMAGE_TASK[stageId];

      if (stageId === "illustrations") {
        await aiApi.generateImage({
          task: task ?? "illustrations",
          projectId: project.id,
        });
      } else if (stageId === "cover") {
        await aiApi.generateCover(project.id);
      } else {
        await aiApi.generateImage({
          task: task ?? stageId,
          projectId: project.id,
        });
      }

      return;
    }

    if (apiType === "text") {
      const TEXT_STAGE_API_NAME: Record<string, string> = {
        outline: "outline",
        chapters: "chapters",
        humanize: "humanize",
      };
      const apiStageName = TEXT_STAGE_API_NAME[stageId] ?? stageId;
      await aiApi.runStage(project.id, apiStageName);
      return;
    }

    if (apiType === "project") {
      if (stageId === "layout") {
        await projectsApi.generateLayout(project.id);
        return;
      }
    }

    if (apiType === "batch") {
      if (stageId === "export") {
        await aiApi.runStage(project.id, "export");
        return;
      }
    }

    throw new Error(`Unsupported stage: ${stageId}`);
  };

  const confirmRun = async () => {
    if (!confirmStage || !project) return;

    const stageId = confirmStage;
    const cost = STAGE_CREDIT_COSTS[stageId] ?? 3;

    if (credits < cost) {
      toast({
        title: "Insufficient Credits",
        description: `You need ${cost} credits. You have ${credits}.`,
        variant: "destructive",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/app/billing")}
          >
            <CreditCard className="mr-1 h-4 w-4" />
            Buy Credits
          </Button>
        ),
      });
      setConfirmStage(null);
      return;
    }

    setConfirmStage(null);
    setRunningStageId(stageId);

    try {
      await dispatchStageApi(stageId);
      await qc.invalidateQueries({ queryKey: ["projects", id] });
      await refreshUser();

      toast({
        title: "Stage complete!",
        description: `${STAGE_LABELS[stageId]} generated.`,
      });
    } catch (err) {
      toast({
        title: "Stage Failed",
        description: (err as Error).message,
        variant: "destructive",
      });

      await qc.invalidateQueries({ queryKey: ["projects", id] });
    } finally {
      setRunningStageId(null);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync();
      toast({ title: "Published!" });
      setShowShareModal(true);
    } catch (err) {
      toast({
        title: "Failed to publish",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const copyShareLink = () => {
    if (!project?.shareToken) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/demo/${project.shareToken}`
    );
    toast({ title: "Link copied!" });
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout title="Project Not Found">
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">
            {error ? (error as Error).message : "Not found."}
          </p>
          <Button onClick={() => navigate("/app/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  const subtitleParts = [
    project.ageRange,
    project.templateType
      ? project.templateType.charAt(0).toUpperCase() +
        project.templateType.slice(1).replace(/-/g, " ")
      : null,
  ].filter(Boolean);

  return (
    <AppLayout
      title={project.title}
      subtitle={subtitleParts.join(" · ")}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/app/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {project.shareToken ? (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePublish}
              disabled={publishMutation.isPending || !isExportReady}
            >
              {publishMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="mr-2 h-4 w-4" />
              )}
              Publish
            </Button>
          )}

          {isExportReady && (
            <Button
              variant="hero"
              size="sm"
              onClick={() => downloadPdf.mutateAsync()}
              disabled={downloadPdf.isPending}
            >
              {downloadPdf.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          )}
        </div>
      }
    >
      <div className="mb-6 rounded-xl border border-border bg-background p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="font-semibold">Book Progress</span>
            {isAnyRunning && (
              <Badge className="animate-pulse bg-blue-100 text-xs text-blue-600">
                Running…
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {completedCount}/{PIPELINE_STAGES.length} stages
            </span>
            <span className="font-bold text-primary">{overallProgress}%</span>
            <Badge variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              {credits} cr
            </Badge>
          </div>
        </div>

        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-semibold">Pipeline Stages</h2>

          {mergedPipeline.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              allStages={mergedPipeline}
              onRun={(sid) => setConfirmStage(sid)}
              isAnyRunning={isAnyRunning}
            />
          ))}
        </div>

        <div className="lg:col-span-3">
          <h2 className="mb-3 font-semibold">Generated Content</h2>
          <ArtifactViewer project={project} />
        </div>
      </div>

      <Dialog
        open={!!confirmStage}
        onOpenChange={(o) => !o && setConfirmStage(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Run {confirmStage ? STAGE_LABELS[confirmStage] : ""}?
            </DialogTitle>
            <DialogDescription>
              Uses <strong>{creditCost} credits</strong>. You have{" "}
              <strong>{credits}</strong>.
              {confirmStage === "illustrations" && (
                <span className="mt-1 block text-xs text-muted-foreground">
                  Will generate all book illustrations for the current age range.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmStage(null)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={confirmRun}
              disabled={credits < creditCost}
            >
              <Play className="mr-2 h-4 w-4" />
              Run ({creditCost} cr)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isAnyRunning && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-blue-200 bg-background p-4 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div>
            <p className="text-sm font-medium">
              Running {runningStageId ? STAGE_LABELS[runningStageId] : "stage"}…
            </p>
            <p className="text-xs text-muted-foreground">Refreshing every 3s</p>
          </div>
        </div>
      )}

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Published!</DialogTitle>
            <DialogDescription>
              Share with anyone using this link.
            </DialogDescription>
          </DialogHeader>

          {project.shareToken && (
            <div className="flex gap-2">
              <input
                readOnly
                value={`${window.location.origin}/demo/${project.shareToken}`}
                className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline" onClick={copyShareLink}>
                Copy
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>
              Close
            </Button>

            {project.shareToken && (
              <Button asChild variant="hero">
                <Link to={`/demo/${project.shareToken}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}