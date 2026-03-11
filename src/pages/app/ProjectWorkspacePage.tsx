import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useCallback } from "react";
import {
  ArrowLeft, Loader2, Play, CheckCircle2, Clock, AlertCircle, BookOpen,
  Image, Package, Layout, Download, FileText, Users, Sparkles, Share2,
  RefreshCw, CreditCard, XCircle, Zap, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProject, useUpdateProject, usePublishProject } from "@/hooks/useProjects";
import { useRunStage } from "@/hooks/useAI";
import { useAuthStore, useCredits } from "@/hooks/useAuth";
import { useDownloadPdf } from "@/hooks/usePayments";
import { aiApi } from "@/lib/api/ai.api";
import { projectsApi } from "@/lib/api/projects.api";
import { PIPELINE_STAGES, STAGE_CREDIT_COSTS } from "@/lib/models";
import type { Project, PipelineStage } from "@/lib/api/types";
import { useQueryClient } from "@tanstack/react-query";
import { projectKey } from "@/hooks/useProjects";

// ─── Stage icons ─────────────────────────────────────────────────────────────

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

// ─── Stage Card Component ─────────────────────────────────────────────────────

function StageCard({
  stage,
  project,
  onRun,
  isRunning,
}: {
  stage: { id: string; label: string; creditCost: number; requiresStage?: string };
  project: Project;
  onRun: (stageId: string) => void;
  isRunning: boolean;
}) {
  const pipeline = project?.pipeline ?? [];

  const pipelineStage = pipeline.find((s) => s.name === stage.id);
  const status = pipelineStage?.status ?? "pending";
  const progress = pipelineStage?.progress ?? 0;
  const message = pipelineStage?.message ?? "";

  const prerequisiteMet =
    !stage.requiresStage ||
    pipeline.some((s) => s.name === stage.requiresStage && s.status === "completed");

  const canRun = prerequisiteMet && status !== "running" && !isRunning;
  const Icon = STAGE_ICONS[stage.id] || FileText;

  const statusConfig = {
    pending: { color: "text-muted-foreground", bg: "bg-muted/30", badgeBg: "bg-muted text-muted-foreground" },
    running: { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30", badgeBg: "bg-blue-100 text-blue-600" },
    completed: { color: "text-green-600", bg: "bg-green-50 dark:bg-green-950/30", badgeBg: "bg-green-100 text-green-600" },
    error: { color: "text-destructive", bg: "bg-destructive/5", badgeBg: "bg-red-100 text-red-600" },
  }[status] ?? { color: "text-muted-foreground", bg: "bg-muted/30", badgeBg: "bg-muted text-muted-foreground" };

  return (
    <div className={cn("card-glow p-5 transition-all", statusConfig.bg)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", status === "completed" ? "bg-green-500/20" : "bg-primary/10")}>
            {status === "completed" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : status === "running" ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : status === "error" ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : (
              <Icon className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">{stage.label}</p>
              <Badge className={cn("text-xs", statusConfig.badgeBg)}>{status}</Badge>
            </div>
            {status === "running" && (
              <div className="mt-2">
                <Progress value={progress} className="h-1.5 mb-1" />
                {message && <p className="text-xs text-muted-foreground">{message}</p>}
              </div>
            )}
            {status === "error" && message && (
              <p className="text-xs text-destructive mt-1">{message}</p>
            )}
            {!prerequisiteMet && (
              <p className="text-xs text-muted-foreground mt-1">
                Requires {stage.requiresStage} stage first
              </p>
            )}
          </div>
        </div>

        {status !== "running" && (
          <Button
            size="sm"
            variant={status === "completed" ? "outline" : "hero"}
            onClick={() => onRun(stage.id)}
            disabled={!canRun}
            className="shrink-0"
          >
            {status === "completed" ? (
              <><RefreshCw className="w-3 h-3 mr-1" />Re-run</>
            ) : (
              <><Play className="w-3 h-3 mr-1" />Run ({stage.creditCost} cr)</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Artifact Viewer ──────────────────────────────────────────────────────────

function ArtifactViewer({ project }: { project: Project }) {
  const pipeline = project?.pipeline ?? [];
  const completedStages = pipeline
    .filter((s) => s.status === "completed")
    .map((s) => s.name);

  const [activeTab, setActiveTab] = useState(completedStages[0] || "outline");

  if (completedStages.length === 0) {
    return (
      <div className="card-glow p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Sparkles className="w-16 h-16 text-muted-foreground/20 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Content Yet</h3>
        <p className="text-muted-foreground">Run pipeline stages to generate your book content.</p>
      </div>
    );
  }

  const artifacts = project.artifacts || {};

  return (
    <div className="card-glow p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <ScrollArea className="w-full" type="scroll">
          <TabsList className="mb-4">
            {completedStages.map((stageId) => (
              <TabsTrigger key={stageId} value={stageId} className="capitalize">
                {STAGE_LABELS[stageId] || stageId}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* Outline */}
        {artifacts.outline && (
          <TabsContent value="outline" className="space-y-4">
            <h3 className="font-semibold text-lg">Story Outline</h3>
            {artifacts.outline.synopsis && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Synopsis</p>
                <p className="text-sm">{artifacts.outline.synopsis}</p>
              </div>
            )}
            <div className="space-y-2">
              {(Array.isArray(artifacts.outline.chapters) ? artifacts.outline.chapters : []).map((ch, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-sm font-medium mb-1">
                    {typeof ch === "string" ? ch : `Chapter ${idx + 1}: ${(ch as { title?: string }).title || "Untitled"}`}
                  </p>
                  {typeof ch !== "string" && (ch as { goal?: string }).goal && (
                    <p className="text-xs text-muted-foreground">{(ch as { goal: string }).goal}</p>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Chapters */}
        {artifacts.chapters && (
          <TabsContent value="chapters" className="space-y-4">
            <h3 className="font-semibold text-lg">Chapters</h3>
            {(artifacts.chapters || []).map((ch, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Chapter {ch.chapterNumber}: {ch.title}</p>
                  <Badge variant="outline">{ch.wordCount} words</Badge>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {ch.content?.slice(0, 600)}{ch.content?.length > 600 ? "…" : ""}
                </p>
              </div>
            ))}
          </TabsContent>
        )}

        {/* Humanize */}
        {artifacts.humanize && (
          <TabsContent value="humanize" className="space-y-4">
            <h3 className="font-semibold text-lg">Humanized Text</h3>
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✓ Text has been polished and reviewed at{" "}
                {artifacts.humanize.reviewedAt
                  ? new Date(artifacts.humanize.reviewedAt).toLocaleDateString()
                  : "completion"}
              </p>
            </div>
            {(artifacts.humanize.chapters || []).map((ch, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-border">
                <p className="font-semibold mb-2">Chapter {ch.chapterNumber}: {ch.title}</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {ch.editedText?.slice(0, 500)}{(ch.editedText?.length ?? 0) > 500 ? "…" : ""}
                </p>
              </div>
            ))}
          </TabsContent>
        )}

        {/* Illustrations */}
        {artifacts.illustrations && (
          <TabsContent value="illustrations" className="space-y-4">
            <h3 className="font-semibold text-lg">Illustrations</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(artifacts.illustrations || []).map((ill, idx) => (
                <div key={idx} className="rounded-xl border border-border overflow-hidden">
                  {ill.imageUrl ? (
                    <img src={ill.imageUrl} alt={`Illustration ${idx + 1}`} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-muted flex items-center justify-center">
                      <Image className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">Ch. {ill.chapterNumber}</p>
                    <Badge variant="outline" className="text-xs">{ill.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        )}

        {/* Cover */}
        {artifacts.cover && (
          <TabsContent value="cover" className="space-y-4">
            <h3 className="font-semibold text-lg">Book Cover</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {artifacts.cover.frontCoverUrl && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <img src={artifacts.cover.frontCoverUrl} alt="Front Cover" className="w-full" />
                  <p className="text-center text-sm p-2 text-muted-foreground">Front Cover</p>
                </div>
              )}
              {artifacts.cover.backCoverUrl && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <img src={artifacts.cover.backCoverUrl} alt="Back Cover" className="w-full" />
                  <p className="text-center text-sm p-2 text-muted-foreground">Back Cover</p>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Layout */}
        {artifacts.layout && (
          <TabsContent value="layout" className="space-y-4">
            <h3 className="font-semibold text-lg">Layout</h3>
            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm"><span className="font-medium">Pages:</span> {artifacts.layout.pageCount}</p>
              {artifacts.layout.layoutStyle && <p className="text-sm"><span className="font-medium">Style:</span> {artifacts.layout.layoutStyle}</p>}
              {artifacts.layout.trimSize && <p className="text-sm"><span className="font-medium">Trim:</span> {artifacts.layout.trimSize}"</p>}
            </div>
          </TabsContent>
        )}

        {/* Export */}
        <TabsContent value="export">
          <h3 className="font-semibold text-lg mb-4">Export</h3>
          <p className="text-muted-foreground text-sm">Export files will be available after running the export stage.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const qc = useQueryClient();

  const { data: project, isLoading, error } = useProject(id);
  const downloadPdf = useDownloadPdf(id!);
  const publishMutation = usePublishProject(id!);

  const [runningStage, setRunningStage] = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const creditCost = confirmStage ? (STAGE_CREDIT_COSTS[confirmStage] ?? 3) : 0;

  const refreshProject = useCallback(() => {
    if (id) qc.invalidateQueries({ queryKey: projectKey(id) });
  }, [id, qc]);

  const handleRunStage = (stageId: string) => {
    setConfirmStage(stageId);
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
          <Button size="sm" variant="outline" onClick={() => navigate("/app/billing")}>
            <CreditCard className="w-4 h-4 mr-1" />Buy Credits
          </Button>
        ),
      });
      setConfirmStage(null);
      return;
    }

    setConfirmStage(null);
    setRunningStage(stageId);

    try {
      // Update stage to running in the server
      await projectsApi.update(project.id, {}).catch(() => { });

      // Call AI API to run the stage
      const result = await aiApi.runStage(project.id, stageId);

      // Refresh project and user credits
      refreshProject();
      refreshUser();

      toast({
        title: "Stage complete!",
        description: `${STAGE_LABELS[stageId] || stageId} has been generated.`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Stage failed";
      toast({ title: "Stage Failed", description: msg, variant: "destructive" });
      refreshProject();
    } finally {
      setRunningStage(null);
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync();
      toast({ title: "Project published!", description: "Your book is now publicly viewable." });
      setShowShareModal(true);
    } catch (err) {
      toast({ title: "Failed to publish", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    try {
      await downloadPdf.mutateAsync();
    } catch (err) {
      toast({ title: "Download failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const copyShareLink = () => {
    if (project?.shareToken) {
      navigator.clipboard.writeText(`${window.location.origin}/demo/${project.shareToken}`);
      toast({ title: "Link copied!" });
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Loading Project...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout title="Project Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error ? (error as Error).message : "Project not found."}</p>
          <Button onClick={() => navigate("/app/dashboard")}>Back to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  const pipeline = project?.pipeline ?? [];

  const completedCount = pipeline.filter(
    (s: PipelineStage) => s.status === "completed"
  ).length;

  const totalStages = pipeline.length > 0 ? pipeline.length : PIPELINE_STAGES.length;

  const overallProgress =
    totalStages > 0 ? Math.round((completedCount / totalStages) * 100) : 0;

  const isExportReady =
    pipeline.some(
      (s: PipelineStage) => s.name === "layout" && s.status === "completed"
    );

  return (
    <AppLayout
      title={project.title}
      subtitle={`${project.ageRange} · ${project.templateType}`}
      actions={
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate("/app/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          {project.shareToken ? (
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Share2 className="w-4 h-4 mr-2" />Copy Link
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handlePublish} disabled={publishMutation.isPending || !isExportReady}>
              {publishMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
              Publish
            </Button>
          )}
          {isExportReady && (
            <Button variant="hero" size="sm" onClick={handleDownload} disabled={downloadPdf.isPending}>
              {downloadPdf.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Download PDF
            </Button>
          )}
        </div>
      }
    >
      {/* Overall Progress Bar */}
      <div className="card-glow p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold">Book Progress</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{completedCount}/{totalStages} stages</span>
            <span className="font-bold text-primary">{overallProgress}%</span>
            <Badge variant="outline">{credits} credits</Badge>
          </div>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Pipeline Stages */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="font-semibold text-lg mb-4">Pipeline Stages</h2>
          {PIPELINE_STAGES.map((stage) => (
            <StageCard
              key={stage.id}
              stage={stage}
              project={project}
              onRun={handleRunStage}
              isRunning={!!runningStage}
            />
          ))}
        </div>

        {/* Artifact Viewer */}
        <div className="lg:col-span-3">
          <h2 className="font-semibold text-lg mb-4">Generated Content</h2>
          <ArtifactViewer project={project} />
        </div>
      </div>

      {/* Confirm Run Stage Dialog */}
      <Dialog open={!!confirmStage} onOpenChange={(open) => !open && setConfirmStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run {confirmStage ? STAGE_LABELS[confirmStage] : ""} Stage?</DialogTitle>
            <DialogDescription>
              This will use <strong>{creditCost} credits</strong> from your balance.
              You currently have <strong>{credits} credits</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            AI will generate content for this stage. Credits are only charged on success.
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmStage(null)}>Cancel</Button>
            <Button variant="hero" onClick={confirmRun} disabled={credits < creditCost}>
              <Play className="w-4 h-4 mr-2" />
              Run ({creditCost} credits)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Running Stage Overlay (non-blocking) */}
      {runningStage && (
        <div className="fixed bottom-6 right-6 bg-background border border-border rounded-xl p-4 shadow-lg flex items-center gap-3 z-50">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <div>
            <p className="font-medium text-sm">Running {STAGE_LABELS[runningStage]}...</p>
            <p className="text-xs text-muted-foreground">Please wait</p>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Published!</DialogTitle>
            <DialogDescription>Share your book with anyone using the link below.</DialogDescription>
          </DialogHeader>
          {project.shareToken && (
            <div className="flex gap-2 items-center">
              <input
                readOnly
                value={`${window.location.origin}/demo/${project.shareToken}`}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-muted text-sm"
              />
              <Button variant="outline" onClick={copyShareLink}>Copy</Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowShareModal(false)}>Close</Button>
            {project.shareToken && (
              <Button asChild variant="hero">
                <Link to={`/demo/${project.shareToken}`} target="_blank">
                  <Eye className="w-4 h-4 mr-2" />Preview
                </Link>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
