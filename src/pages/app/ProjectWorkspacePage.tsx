"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft, Loader2, Play, CheckCircle2, AlertCircle, BookOpen,
  Image as ImageIcon, Package, Layout, Download, FileText, Sparkles,
  Heart, BookMarked, Share2, RefreshCw, CreditCard, Zap, Eye,
  Clock, Edit3, ChevronDown, ChevronUp, Wand2, Baby, Check,
  X, History, ThumbsUp, ThumbsDown, RotateCcw, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePublishProject } from "@/hooks/useProjects";
import { useAuthStore, useCredits } from "@/hooks/useAuth";
import { useDownloadPdf, useExports } from "@/hooks/usePayments";
import { aiApi } from "@/lib/api/ai.api";
import { projectsApi } from "@/lib/api/projects.api";
import { pagesApi } from "@/lib/api/pages.api";
import type { PageEditStatus, PageDetail } from "@/lib/api/pages.api";
import { PIPELINE_STAGES, STAGE_CREDIT_COSTS } from "@/lib/models";
import type { Project, PipelineStage } from "@/lib/api/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { exportsApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnyObj = Record<string, unknown>;

type ExportItem = {
  id?: string; _id?: string; export_url?: string; url?: string;
  file_url?: string; pdf_url?: string; name?: string; title?: string;
  format?: string; createdAt?: string; status?: string;
};

interface MergedStage {
  id: string; label: string; creditCost: number;
  requiresStage?: string; status: string; progress: number;
  message?: string; completedAt?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STAGE_ICONS: Record<string, React.ElementType> = {
  outline: FileText, chapters: BookOpen, humanize: Sparkles,
  illustrations: ImageIcon, cover: Package, layout: Layout,
  export: Download, dedication: Heart, theme: BookMarked,
};

const STAGE_LABELS: Record<string, string> = {
  outline: "Outline", chapters: "Pages", humanize: "Humanize",
  illustrations: "Illustrations", cover: "Cover", layout: "Layout",
  export: "Export", dedication: "Dedication", theme: "Islamic Theme",
};

const ARTIFACT_KEYS: Record<string, string> = {
  outline: "outline", chapters: "chapters", humanize: "humanized",
  illustrations: "illustrations", cover: "cover", layout: "layout",
  export: "export", dedication: "dedication", theme: "themePage",
};

const STAGE_TYPE: Record<string, string> = {
  outline: "text", chapters: "text", humanize: "text",
  illustrations: "image", cover: "image", layout: "project",
  dedication: "text", theme: "text", export: "batch",
};

const STATUS_CFG: Record<PageEditStatus, { color: string; label: string; Icon: React.ElementType }> = {
  draft:       { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",     label: "Draft",       Icon: FileText     },
  regenerated: { color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",     label: "Regenerated", Icon: RefreshCw    },
  edited:      { color: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300", label: "Edited",      Icon: Edit3        },
  approved:    { color: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", label: "Approved",    Icon: CheckCircle2 },
  rejected:    { color: "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300",         label: "Rejected",    Icon: X            },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normArr<T>(v: unknown): T[] {
  if (!v) return [];
  if (Array.isArray(v)) return (v as T[]).filter(Boolean);
  const obj = v as Record<string, T>;
  const keys = Object.keys(obj).map(Number).filter(n => !isNaN(n));
  if (!keys.length) return [];
  const arr: T[] = [];
  keys.sort((a, b) => a - b).forEach(k => { arr[k] = obj[k]; });
  return arr.filter(Boolean);
}

function pid(p: Project): string { return p.id || p._id; }

function soAge(ageRange?: string): boolean {
  if (!ageRange) return false;
  const nums  = ageRange.match(/\d+/g) || [];
  const first = Number(nums[0] || 8);
  return first <= 5;  // matches backend: age <=5 = spreads-only
}

function isChapterBook(ageRange?: string): boolean {
  if (!ageRange) return false;
  const nums  = ageRange.match(/\d+/g) || [];
  const first = Number(nums[0] || 8);
  const last  = Number(nums[1] || first);
  const avg   = (first + last) / 2;
  return first > 5 && avg > 7;  // "8-12" avg=10 → chapter-book
}

function pkey(so: boolean, ci: number, si: number): string {
  return so ? `s${si}` : `ch${ci}_s${si}`;
}

function xurl(item: ExportItem): string | null {
  return item.export_url || item.url || item.file_url || item.pdf_url || null;
}

function buildPipeline(pipeline: PipelineStage[] = [], arts: AnyObj = {}): MergedStage[] {
  return PIPELINE_STAGES.map(def => {
    const live = pipeline.find(s => s.name === def.id);
    if (live) return { id: def.id, label: STAGE_LABELS[def.id] || def.label, creditCost: def.creditCost, requiresStage: def.requiresStage, status: live.status ?? "pending", progress: live.progress ?? 0, message: live.message, completedAt: live.completedAt };
    const key = ARTIFACT_KEYS[def.id];
    let data: unknown = key ? (arts[key] ?? arts[def.id]) : undefined;
    if (def.id === "chapters" && !(data as unknown[])?.length && arts.spreadOnly) data = arts.spreads;
    if (def.id === "humanize" && arts.spreadOnly) data = Array.isArray(arts.humanized) && (arts.humanized as unknown[]).length ? arts.humanized : null;
    if (def.id === "illustrations" && arts.spreadOnly) {
      const si = Array.isArray(arts.spreadIllustrations) ? arts.spreadIllustrations : [];
      const il = Array.isArray(arts.illustrations) ? arts.illustrations : [];
      data = (si as unknown[]).length ? si : (il as unknown[]).length ? il : null;
    }
    const has = Array.isArray(data) ? (data as unknown[]).length > 0 : data != null && typeof data === "object" && Object.keys(data as object).length > 0;
    return { id: def.id, label: STAGE_LABELS[def.id] || def.label, creditCost: def.creditCost, requiresStage: def.requiresStage, status: has ? "completed" : "pending", progress: has ? 100 : 0 };
  });
}

// ─── PageStatusBadge ──────────────────────────────────────────────────────────

function PageStatusBadge({ status, size = "sm" }: { status: PageEditStatus; size?: "xs" | "sm" }) {
  const c = STATUS_CFG[status] || STATUS_CFG.draft;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full font-medium", size === "xs" ? "px-1.5 py-0 text-xs" : "px-2 py-0.5 text-xs", c.color)}>
      <c.Icon className={size === "xs" ? "w-2.5 h-2.5" : "w-3 h-3"} />{c.label}
    </span>
  );
}

// ─── PromptEditor ─────────────────────────────────────────────────────────────

function PromptEditor({ label, prompt, onRerun, isRunning }: { label?: string; prompt: string; onRerun: (p: string) => void; isRunning?: boolean }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(prompt);
  useEffect(() => { setVal(prompt); }, [prompt]);
  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <span className="flex items-center gap-1.5"><Edit3 className="w-3 h-3" />{label || "AI Prompt"}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <Textarea value={val} onChange={e => setVal(e.target.value)} rows={5} className="text-xs font-mono resize-none bg-background" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setVal(prompt); setOpen(false); }}>Cancel</Button>
            <Button size="sm" className="text-xs h-7" onClick={() => { onRerun(val); setOpen(false); }} disabled={isRunning || !val.trim()}>
              {isRunning ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running…</> : <><Wand2 className="w-3 h-3 mr-1" />Regenerate</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RegenPanel ───────────────────────────────────────────────────────────────

function RegenPanel({ stageId, onRegen, running }: { stageId: string; onRegen: (id: string, note: string) => Promise<void>; running: boolean }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 mt-2">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
        <span className="flex items-center gap-1.5"><Wand2 className="w-3 h-3" />Regenerate with custom instructions</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="text-xs font-mono resize-none bg-background" placeholder="Optional: describe changes…" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setNote(""); setOpen(false); }}>Cancel</Button>
            <Button size="sm" className="text-xs h-7" onClick={async () => { await onRegen(stageId, note); setNote(""); setOpen(false); }} disabled={running}>
              {running ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running…</> : <><RefreshCw className="w-3 h-3 mr-1" />Regenerate</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── StageCard ────────────────────────────────────────────────────────────────

function StageCard({ stage, allStages, onRun, busy, so }: { stage: MergedStage; allStages: MergedStage[]; onRun: (id: string) => void; busy: boolean; so: boolean }) {
  const { status, progress, message } = stage;
  const prereq = !stage.requiresStage || allStages.find(s => s.id === stage.requiresStage)?.status === "completed";
  const canRun = prereq && status !== "running" && !busy;
  const Icon = STAGE_ICONS[stage.id] || FileText;
  const label = so && stage.id === "chapters" ? "Pages" : stage.label;
  const c = ({ pending: { wrap: "bg-background border-border", badge: "bg-muted text-muted-foreground" }, running: { wrap: "bg-blue-50 dark:bg-blue-950/30 border-blue-200", badge: "bg-blue-100 text-blue-600" }, completed: { wrap: "bg-green-50 dark:bg-green-950/20 border-green-200", badge: "bg-green-100 text-green-700" }, error: { wrap: "bg-red-50 dark:bg-red-950/20 border-destructive/30", badge: "bg-red-100 text-red-600" } } as Record<string, { wrap: string; badge: string }>)[status] ?? { wrap: "bg-background border-border", badge: "bg-muted text-muted-foreground" };
  return (
    <div className={cn("rounded-xl border-2 p-4 transition-all", c.wrap)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", status === "completed" ? "bg-green-500/15" : status === "running" ? "bg-blue-500/15" : "bg-muted/60")}>
          {status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : status === "running" ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : status === "error" ? <AlertCircle className="h-4 w-4 text-destructive" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{label}</span>
            <Badge className={cn("px-1.5 py-0 text-xs", c.badge)}>{status}</Badge>
          </div>
          {status === "running" && <div className="mt-1.5"><Progress value={progress} className="mb-1 h-1.5" />{message && <p className="text-xs text-blue-600">{message}</p>}</div>}
          {status === "error" && message && <p className="mt-0.5 truncate text-xs text-destructive">{message}</p>}
          {status === "pending" && !prereq && <p className="mt-0.5 text-xs text-muted-foreground">Requires {so && stage.requiresStage === "chapters" ? "pages" : stage.requiresStage} first</p>}
          {status === "completed" && stage.completedAt && <p className="mt-0.5 text-xs text-muted-foreground"><Clock className="mr-0.5 inline h-3 w-3" />{new Date(stage.completedAt).toLocaleTimeString()}</p>}
        </div>
        {status !== "running" && <Button size="sm" variant={status === "completed" ? "outline" : "default"} onClick={() => onRun(stage.id)} disabled={!canRun} className="shrink-0 text-xs">{status === "completed" ? <><RefreshCw className="mr-1 h-3 w-3" />Re-run</> : <><Play className="mr-1 h-3 w-3" />Run ({stage.creditCost}cr)</>}</Button>}
      </div>
    </div>
  );
}

// ─── VersionModal ─────────────────────────────────────────────────────────────

function VersionModal({ projectId, pageKey, open, onClose }: { projectId: string; pageKey: string; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [restoring, setRestoring] = useState<string | null>(null);
  const { data: detail, isLoading } = useQuery<PageDetail>({ queryKey: ["pageDetail", projectId, pageKey], queryFn: () => pagesApi.get(projectId, pageKey), enabled: open && !!pageKey });
  const restore = async (version: number, type: "text" | "image") => {
    setRestoring(`${type}-${version}`);
    try { await pagesApi.restoreVersion(projectId, pageKey, version, type); qc.invalidateQueries({ queryKey: ["projects", projectId] }); qc.invalidateQueries({ queryKey: ["pageList", projectId] }); toast({ title: `v${version} restored` }); }
    catch (e) { toast({ title: "Restore failed", description: (e as Error).message, variant: "destructive" }); }
    finally { setRestoring(null); }
  };
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><History className="w-4 h-4" />History — {pageKey}</DialogTitle><DialogDescription>Restore any previous version.</DialogDescription></DialogHeader>
        {isLoading ? <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div> : (
          <div className="space-y-5">
            {(detail?.textVersions?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Text Versions</p>
                <div className="space-y-2">{[...detail!.textVersions].reverse().map(v => (
                  <div key={v.version} className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-xs font-mono font-bold text-primary">v{v.version}</span><Badge variant="outline" className="text-xs">{v.source}</Badge><span className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</span></div><Button size="sm" variant="outline" className="text-xs h-7" onClick={() => restore(v.version, "text")} disabled={!!restoring}>{restoring === `text-${v.version}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RotateCcw className="w-3 h-3 mr-1" />Restore</>}</Button></div>
                    <p className="text-sm leading-relaxed line-clamp-3">{v.text}</p>
                  </div>
                ))}</div>
              </div>
            )}
            {(detail?.imageVersions?.length ?? 0) > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-primary" />Image Versions</p>
                <div className="grid grid-cols-2 gap-3">{[...detail!.imageVersions].reverse().map(v => (
                  <div key={v.version} className="rounded-xl border border-border bg-background overflow-hidden">
                    <img src={v.imageUrl} alt={`v${v.version}`} className="w-full aspect-square object-cover" />
                    <div className="p-2 space-y-1.5"><div className="flex items-center justify-between"><span className="text-xs font-mono font-bold text-primary">v{v.version}</span><Badge variant="outline" className="text-xs">{v.source}</Badge></div><Button size="sm" variant="outline" className="w-full text-xs h-7" onClick={() => restore(v.version, "image")} disabled={!!restoring}>{restoring === `image-${v.version}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RotateCcw className="w-3 h-3 mr-1" />Restore</>}</Button></div>
                  </div>
                ))}</div>
              </div>
            )}
            {!detail?.textVersions?.length && !detail?.imageVersions?.length && <p className="text-sm text-muted-foreground text-center py-8">No version history yet.</p>}
          </div>
        )}
        <DialogFooter><Button variant="ghost" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── SpreadCard ───────────────────────────────────────────────────────────────

function SpreadCard({ spread, illUrl, illPrompt, label, ci, si, status, spreadOnly, onTextRerun, onImageRerun, onApprove, onReject, onHistory }: {
  spread: AnyObj; illUrl?: string; illPrompt?: string; label: string;
  ci: number; si: number; status: PageEditStatus; spreadOnly: boolean;
  onTextRerun: (p: string, ci: number, si: number) => Promise<void>;
  onImageRerun: (p: string, ci: number, si: number) => Promise<void>;
  onApprove: (ci: number, si: number) => Promise<void>;
  onReject: (ci: number, si: number) => Promise<void>;
  onHistory: (key: string) => void;
}) {
  const [tRun, setTRun] = useState(false);
  const [iRun, setIRun] = useState(false);
  const text     = spread.text as string | undefined;
  const textPrmt = spread.prompt as string | undefined;
  const textPos  = (spread.textPosition as string) || "bottom";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div className={cn("rounded-xl border-2 overflow-hidden transition-all", isApproved ? "border-green-300 dark:border-green-700" : isRejected ? "border-red-300 dark:border-red-700" : "border-border")}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-muted-foreground">{label}</span>
          <PageStatusBadge status={status} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => onHistory(pkey(spreadOnly, ci, si))} title="Version history"><History className="w-3.5 h-3.5" /></Button>
          {!isApproved && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
              onClick={async () => { await onApprove(ci, si); }}>
              <ThumbsUp className="w-3 h-3 mr-1" />Approve
            </Button>
          )}
          {isApproved && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground" onClick={() => onReject(ci, si)}>
              <ThumbsDown className="w-3 h-3 mr-1" />Unapprove
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Text side */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page text</p>
          {tRun
            ? <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Generating…</div>
            : text
              ? <p className="text-sm leading-relaxed">{text}</p>
              : <p className="text-xs text-muted-foreground italic">No text yet</p>
          }
          {textPrmt && (
            <PromptEditor label="Text prompt" prompt={textPrmt}
              onRerun={async p => { setTRun(true); try { await onTextRerun(p, ci, si); } finally { setTRun(false); } }}
              isRunning={tRun}
            />
          )}
        </div>

        {/* Image side */}
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Illustration</p>
          {iRun
            ? <div className="aspect-square rounded-lg bg-muted flex items-center justify-center"><div className="text-center space-y-2"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /><p className="text-xs text-muted-foreground">Generating…</p></div></div>
            : illUrl
              ? <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={illUrl} alt={label} className="w-full aspect-square object-cover" />
                  {text && (
                    <div className={cn("absolute left-0 right-0 bg-black/55 px-2 py-1", textPos.includes("top") ? "top-0" : "bottom-0")}>
                      <p className="text-center text-xs font-medium text-white line-clamp-2">{text}</p>
                    </div>
                  )}
                </div>
              : <div className="aspect-square rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
          }
          {illPrompt && (
            <PromptEditor label="Image prompt" prompt={illPrompt}
              onRerun={async p => { setIRun(true); try { await onImageRerun(p, ci, si); } finally { setIRun(false); } }}
              isRunning={iRun}
            />
          )}
        </div>
      </div>

      {/* Rejected banner */}
      {isRejected && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-950/30 border-t border-red-200 dark:border-red-800 flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 flex-1">Rejected — regenerate or edit to fix.</p>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-red-600" onClick={() => onApprove(ci, si)}>Un-reject</Button>
        </div>
      )}
    </div>
  );
}

// ─── ArtifactViewer ───────────────────────────────────────────────────────────

function ArtifactViewer({ project, exportsList, exportsLoading, pageEdits, onTextRerun, onImageRerun, onCoverRerun, onApprove, onReject, onHistory, onRegen, regenStage }: {
  project: Project;
  exportsList: ExportItem[];
  exportsLoading: boolean;
  pageEdits: Record<string, { status: PageEditStatus }>;
  onTextRerun: (p: string, ci: number, si: number) => Promise<void>;
  onImageRerun: (p: string, ci: number, si: number) => Promise<void>;
  onCoverRerun: (p: string, task: string) => Promise<void>;
  onApprove: (ci: number, si: number) => Promise<void>;
  onReject: (ci: number, si: number) => Promise<void>;
  onHistory: (key: string) => void;
  onRegen: (stageId: string, note: string) => Promise<void>;
  regenStage: string | null;
}) {
  const arts = (project.artifacts || {}) as AnyObj;
  const so   = !!(arts.spreadOnly) || soAge(project.ageRange);

  const merged       = buildPipeline(project.pipeline, arts);
  const completedIds = merged.filter(s => s.status === "completed").map(s => s.id);

  const [tab, setTab] = useState(completedIds[0] || "");
  useEffect(() => {
    if (completedIds.length > 0 && !completedIds.includes(tab))
      setTab(completedIds[completedIds.length - 1]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedIds.join(",")]);

  if (!completedIds.length) return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-border bg-background p-12 text-center">
      <Sparkles className="mb-4 h-14 w-14 text-muted-foreground/20" />
      <h3 className="mb-2 text-lg font-semibold">No Content Yet</h3>
      <p className="text-sm text-muted-foreground">Run pipeline stages on the left to generate your book.</p>
    </div>
  );

  // ── Data accessors ─────────────────────────────────────────────────────────
  const illustrations   = normArr<AnyObj>(arts.illustrations);
  const spreadIlls      = normArr<AnyObj>(arts.spreadIllustrations);
  const textSpreads     = so ? normArr<AnyObj>(arts.spreads) : [];
  const humanizedChaps  = normArr<AnyObj>(arts.humanized);
  const rawChapters     = normArr<AnyObj>(arts.chapters);
  const textChapters    = !so ? (humanizedChaps.length ? humanizedChaps : rawChapters) : [];
  const cover           = arts.cover  as AnyObj | undefined;
  const ded             = arts.dedication as AnyObj | undefined;
  const theme           = arts.themePage  as AnyObj | undefined;
  const layout          = arts.layout     as AnyObj | undefined;
  const outline         = arts.outline    as AnyObj | undefined;

  function getIll(ci: number, si: number): { url?: string; prompt?: string } {
    if (so) {
      // spreads-only: flat spreadIllustrations array indexed by si
      const s = spreadIlls[si];
      if (s) return { url: s.imageUrl as string, prompt: s.prompt as string };
      // fallback: flatten illustrations.spreads
      let flat: AnyObj[] = [];
      illustrations.forEach(ill => { flat = flat.concat(normArr<AnyObj>(ill.spreads)); });
      const f = flat[si];
      return f ? { url: f.imageUrl as string, prompt: f.prompt as string } : {};
    }
    // picture-book and chapter-book: illustrations[ci].spreads[si]
    const ill = illustrations[ci];
    if (!ill) return {};
    const chSpreads = normArr<AnyObj>(ill.spreads);
    const sp = chSpreads[si];
    if (sp?.imageUrl) return { url: sp.imageUrl as string, prompt: sp.prompt as string };
    // fallback: check variants (legacy chapter-book single-illustration path)
    const variants = normArr<AnyObj>(ill.variants);
    const v = variants[0];
    return v?.imageUrl ? { url: v.imageUrl as string, prompt: v.prompt as string } : {};
  }

  function getStatus(ci: number, si: number): PageEditStatus {
    return (pageEdits[pkey(so, ci, si)]?.status) || "draft";
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <Tabs value={tab} onValueChange={setTab}>
        <ScrollArea className="w-full" type="scroll">
          <TabsList className="mb-4 h-auto flex-wrap gap-1">
            {completedIds.map(sid => (
              <TabsTrigger key={sid} value={sid} className="text-xs capitalize">
                {so && sid === "chapters" ? "Pages" : (STAGE_LABELS[sid] || sid)}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {/* ══ OUTLINE ══ */}
        <TabsContent value="outline" className="mt-0 space-y-3">
          {outline?.bookTitle && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Book Title</p>
              <p className="text-base font-bold">{outline.bookTitle as string}</p>
            </div>
          )}
          {outline?.moral && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Moral / Learning Goal</p>
              <p className="text-sm leading-relaxed">{outline.moral as string}</p>
            </div>
          )}
          {so
            ? normArr<AnyObj>(outline?.spreads).map((s, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/50 p-4 space-y-1">
                  <p className="font-semibold text-xs font-mono text-primary">Spread {i + 1}</p>
                  <p className="text-sm">{s.sceneDescription as string}</p>
                  {s.islamicValue && <Badge variant="outline" className="text-xs">{s.islamicValue as string}</Badge>}
                  {s.textHint && <p className="text-xs text-muted-foreground italic">{s.textHint as string}</p>}
                </div>
              ))
            : normArr<AnyObj>(outline?.chapters).map((ch, i) => (
                <div key={i} className="rounded-xl border border-border bg-muted/50 p-4 space-y-1.5">
                  <p className="font-semibold">Ch. {i + 1}: {ch.title as string || "Untitled"}</p>
                  {ch.goal    && <p className="text-xs text-muted-foreground">{ch.goal as string}</p>}
                  {ch.keyScene && <p className="text-xs bg-background rounded-lg border p-2"><span className="font-medium text-primary">Key scene: </span>{ch.keyScene as string}</p>}
                  {ch.duaHint && ch.duaHint !== "none" && <p className="text-xs text-green-700 dark:text-green-400">🤲 {ch.duaHint as string}</p>}
                </div>
              ))
          }
          <RegenPanel stageId="outline" onRegen={onRegen} running={regenStage === "outline"} />
        </TabsContent>

        {/* ══ PAGES / CHAPTERS ══ */}
        <TabsContent value="chapters" className="mt-0 space-y-4">
          {so ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                <Baby className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Spreads-only · ages {project.ageRange} · max 10 words per page</p>
              </div>
              {textSpreads.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No spreads yet — run the Pages stage.</p>
              )}
              {textSpreads.map((s, i) => {
                const ill = getIll(0, i);
                return (
                  <SpreadCard key={i} spread={s} illUrl={ill.url} illPrompt={ill.prompt}
                    label={`Spread ${i + 1} of ${textSpreads.length}`}
                    ci={0} si={i} status={getStatus(0, i)} spreadOnly={so}
                    onTextRerun={onTextRerun} onImageRerun={onImageRerun}
                    onApprove={onApprove} onReject={onReject} onHistory={onHistory}
                  />
                );
              })}
            </div>
          ) : (
            <div className="space-y-6">
              {textChapters.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No chapters yet — run the Pages stage.</p>
              )}
              {textChapters.map((ch, ci) => {
                const chSpreads = normArr<AnyObj>(ch.spreads);
                return (
                  <div key={ci} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{ci + 1}</div>
                      <p className="font-semibold text-sm">{(ch.chapterTitle as string) || (ch.title as string) || `Chapter ${ci + 1}`}</p>
                    </div>
                    {chSpreads.map((s, si) => {
                      const ill = getIll(ci, si);
                      return (
                        <SpreadCard key={si} spread={s} illUrl={ill.url} illPrompt={ill.prompt}
                          label={`Ch.${ci + 1} P${si + 1}`}
                          ci={ci} si={si} status={getStatus(ci, si)} spreadOnly={so}
                          onTextRerun={onTextRerun} onImageRerun={onImageRerun}
                          onApprove={onApprove} onReject={onReject} onHistory={onHistory}
                        />
                      );
                    })}
                    {!chSpreads.length && ch.text && (
                      <div className="rounded-xl border border-border p-4 space-y-2">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{ch.text as string}</p>
                        {ch.prompt && <PromptEditor label="Chapter prompt" prompt={ch.prompt as string} onRerun={p => onTextRerun(p, ci, 0)} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ══ HUMANIZE ══ */}
        <TabsContent value="humanize" className="mt-0 space-y-3">
          <div className="rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-700 dark:text-green-400">✓ Text polished and humanized</div>
          {so
            ? textSpreads.map((s, i) => {
                const ill = getIll(0, i);
                return (
                  <SpreadCard key={i} spread={s} illUrl={ill.url} illPrompt={ill.prompt}
                    label={`Spread ${i + 1}`} ci={0} si={i} status={getStatus(0, i)} spreadOnly={so}
                    onTextRerun={onTextRerun} onImageRerun={onImageRerun}
                    onApprove={onApprove} onReject={onReject} onHistory={onHistory}
                  />
                );
              })
            : humanizedChaps.map((ch, ci) => (
                <div key={ci} className="rounded-xl border border-border p-4 space-y-3">
                  <p className="text-sm font-semibold">Ch. {(ch.chapterNumber as number) || ci + 1}: {ch.chapterTitle as string}</p>
                  {normArr<AnyObj>(ch.spreads).map((s, si) => (
                    <div key={si} className="space-y-2 pl-3 border-l-2 border-border">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-muted-foreground">P{si + 1}</p>
                        <PageStatusBadge status={getStatus(ci, si)} size="xs" />
                      </div>
                      <p className="text-sm leading-relaxed">{s.text as string}</p>
                      {s.prompt && <PromptEditor label="Spread prompt" prompt={s.prompt as string} onRerun={p => onTextRerun(p, ci, si)} />}
                    </div>
                  ))}
                  {!normArr(ch.spreads).length && ch.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{ch.text as string}</p>}
                </div>
              ))
          }
        </TabsContent>

        {/* ══ ILLUSTRATIONS ══ */}
        <TabsContent value="illustrations" className="mt-0 space-y-4">
          {so ? (() => {
            const flat = spreadIlls.length
              ? spreadIlls
              : illustrations.reduce<AnyObj[]>((a, ill) => a.concat(normArr<AnyObj>(ill.spreads)), []);
            return flat.length === 0
              ? <p className="text-sm text-muted-foreground text-center py-8">Run the Illustrations stage to generate images.</p>
              : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {flat.map((ill, i) => (
                    <div key={i} className="rounded-xl border border-border overflow-hidden">
                      {ill.imageUrl
                        ? <img src={ill.imageUrl as string} alt={`Spread ${i + 1}`} className="w-full aspect-square object-cover" />
                        : <div className="aspect-square bg-muted flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                      }
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono font-bold text-muted-foreground">Spread {i + 1}</p>
                          <PageStatusBadge status={getStatus(0, i)} size="xs" />
                        </div>
                        {ill.prompt && <PromptEditor label="Image prompt" prompt={ill.prompt as string} onRerun={p => onImageRerun(p, 0, i)} />}
                      </div>
                    </div>
                  ))}
                </div>
              );
          })() : (
            <div className="space-y-6">
              {illustrations.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Run the Illustrations stage to generate images.</p>}
              {illustrations.map((ill, ci) => (
                <div key={ci} className="space-y-3">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary/10 text-primary rounded-md flex items-center justify-center text-xs font-bold">{ci + 1}</span>
                    Chapter {ill.chapterNumber as number || ci + 1}
                  </p>
                  {normArr<AnyObj>(ill.spreads).map((sp, si) => (
                    <div key={si} className="rounded-xl border border-border overflow-hidden">
                      {sp.imageUrl
                        ? <div className="relative"><img src={sp.imageUrl as string} alt="" className="w-full aspect-square object-cover" />{sp.text && <div className={cn("absolute left-0 right-0 bg-black/55 px-2 py-1 text-white text-xs text-center font-medium", (sp.textPosition as string)?.includes("top") ? "top-0" : "bottom-0")}>{sp.text as string}</div>}</div>
                        : <div className="aspect-square bg-muted flex items-center justify-center"><ImageIcon className="w-8 h-8 text-muted-foreground/30" /></div>
                      }
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono font-bold text-muted-foreground">Ch.{ci + 1} Spread {si + 1}</p>
                          <PageStatusBadge status={getStatus(ci, si)} size="xs" />
                        </div>
                        {sp.prompt && <PromptEditor label="Image prompt" prompt={sp.prompt as string} onRerun={p => onImageRerun(p, ci, si)} />}
                      </div>
                    </div>
                  ))}
                  {/* chapter-book: all illustrations are in spreads[] (4 per chapter) */}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══ COVER ══ */}
        <TabsContent value="cover" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
            {[
              { label: "Front cover", url: (cover?.frontUrl || cover?.imageUrl) as string, prompt: cover?.frontPrompt as string, task: "cover" },
              { label: "Back cover",  url: cover?.backUrl as string,  prompt: cover?.backPrompt as string,  task: "back-cover" },
            ].map(c => (
              <div key={c.task} className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border bg-muted/30"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{c.label}</p></div>
                <div className="p-4 space-y-3">
                  {c.url
                    ? <img src={c.url} alt={c.label} className="w-full rounded-lg border border-border" />
                    : <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center"><Package className="w-10 h-10 text-muted-foreground/30" /></div>
                  }
                  {c.prompt
                    ? <PromptEditor label={`${c.label} prompt`} prompt={c.prompt} onRerun={p => onCoverRerun(p, c.task)} />
                    : <p className="text-xs text-muted-foreground">Run Cover stage to generate.</p>
                  }
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ══ DEDICATION ══ */}
        <TabsContent value="dedication" className="mt-0">
          <div className="rounded-xl border border-border p-5 space-y-3 max-w-lg">
            {ded?.greeting && <p className="text-sm font-semibold">{ded.greeting as string}</p>}
            {ded?.message  && <p className="text-sm leading-relaxed">{ded.message as string}</p>}
            {ded?.closing  && <p className="text-xs text-muted-foreground">{ded.closing as string}</p>}
          </div>
          <RegenPanel stageId="dedication" onRegen={onRegen} running={regenStage === "dedication"} />
        </TabsContent>

        {/* ══ ISLAMIC THEME ══ */}
        <TabsContent value="theme" className="mt-0">
          <div className="rounded-xl border border-border p-5 space-y-4 max-w-lg">
            {theme?.sectionTitle && <p className="text-lg font-bold">{theme.sectionTitle as string}</p>}
            {theme?.arabicPhrase && (
              <div className="p-4 rounded-xl bg-muted/40 text-center">
                <p className="text-3xl font-bold mb-2 leading-relaxed" dir="rtl" lang="ar">{theme.arabicPhrase as string}</p>
                {theme.transliteration && <p className="text-sm font-medium text-primary">{theme.transliteration as string}</p>}
                {theme.meaning && <p className="text-xs text-muted-foreground mt-1">"{theme.meaning as string}"</p>}
              </div>
            )}
            {theme?.referenceSource && <div className="text-xs text-muted-foreground border-t border-border pt-3"><span className="font-semibold">Source: </span>{theme.referenceSource as string}</div>}
            {theme?.referenceText  && <p className="text-sm italic text-foreground/70">{theme.referenceText as string}</p>}
            {theme?.explanation    && <p className="text-sm leading-relaxed">{theme.explanation as string}</p>}
            {theme?.dailyPractice  && <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200"><span className="text-green-600">🌱</span><p className="text-xs text-green-700 dark:text-green-400">{theme.dailyPractice as string}</p></div>}
          </div>
          <RegenPanel stageId="theme" onRegen={onRegen} running={regenStage === "theme"} />
        </TabsContent>

        {/* ══ LAYOUT ══ */}
        <TabsContent value="layout" className="mt-0 space-y-4">
          {layout && (
            <div className="rounded-xl border border-border bg-muted/50 p-4 text-sm space-y-1">
              {layout.pageCount && <p><span className="font-medium">Pages:</span> {layout.pageCount as number}</p>}
              {layout.trimSize  && <p><span className="font-medium">Trim:</span>  {layout.trimSize  as string}</p>}
              {layout.format    && <p><span className="font-medium">Format:</span> {layout.format   as string}</p>}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {normArr<AnyObj>(layout?.spreads).map((sp, i) => (
              <div key={i} className="rounded-xl border border-border bg-background overflow-hidden">
                <div className="flex items-center border-b border-border px-3 py-2">
                  <p className="text-sm font-medium">Page {sp.page as number} · <span className="text-muted-foreground">{sp.type as string}</span></p>
                </div>
                <div className="p-3 space-y-1">
                  {(sp.content as AnyObj)?.title  && <p className="font-semibold text-sm">{(sp.content as AnyObj).title as string}</p>}
                  {(sp.content as AnyObj)?.text   && <p className="text-sm text-foreground/80 line-clamp-3">{(sp.content as AnyObj).text as string}</p>}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ══ EXPORT ══ */}
        <TabsContent value="export" className="mt-0 space-y-3">
          {exportsLoading
            ? <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />Loading exports…</div>
            : exportsList.length > 0
              ? exportsList.map((item, i) => {
                  const url = xurl(item);
                  return (
                    <div key={item._id || i} className="flex items-center justify-between rounded-xl border border-border p-4">
                      <div>
                        <p className="text-sm font-medium">{item.title || item.name || `Export ${i + 1}`}</p>
                        <div className="flex items-center gap-2 mt-1">{item.format && <Badge variant="outline" className="text-xs">{item.format}</Badge>}{item.status && <Badge variant="outline" className="text-xs">{item.status}</Badge>}</div>
                      </div>
                      {url ? <Button asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Download</a></Button> : <Badge className="text-xs">Processing</Badge>}
                    </div>
                  );
                })
              : <p className="text-sm text-muted-foreground">No exports yet. Run the Export stage.</p>
          }
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectWorkspacePage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits  = useCredits();
  const refreshUser = useAuthStore(s => s.refreshUser);
  const qc = useQueryClient();

  const [runningId,   setRunningId]   = useState<string | null>(null);
  const [confirmStage, setConfirmStage] = useState<string | null>(null);
  const [showShare,   setShowShare]   = useState(false);
  const [historyKey,  setHistoryKey]  = useState<string | null>(null);
  const [regenStage,  setRegenStage]  = useState<string | null>(null);

  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ["projects", id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
    refetchOnWindowFocus: true,
    refetchInterval: q => ((q.state.data as Project | undefined)?.pipeline?.some((s: PipelineStage) => s.status === "running") || runningId) ? 3000 : false,
  });

  const { data: pageListData } = useQuery({
    queryKey: ["pageList", id],
    queryFn: () => pagesApi.list(id!),
    enabled: !!id,
    staleTime: 15_000,
  });

  const pageEdits = useMemo(() => {
    const map: Record<string, { status: PageEditStatus }> = {};
    pageListData?.pages?.forEach(p => { map[p.key] = { status: p.status }; });
    return map;
  }, [pageListData]);

  const { data: exportsResp, isLoading: exportsLoading, refetch: refetchExports } = useExports(project ? pid(project) : undefined);
  const exportsList: ExportItem[] = useMemo(() => {
    if (!exportsResp) return [];
    if (Array.isArray(exportsResp)) return exportsResp as ExportItem[];
    return ((exportsResp as Record<string, unknown>)?.exports as ExportItem[]) || [];
  }, [exportsResp]);
  const latestUrl = useMemo(() => { const l = exportsList[0]; return l ? xurl(l) : null; }, [exportsList]);

  useEffect(() => {
    if (!project || !runningId) return;
    const live = project.pipeline?.find((s: PipelineStage) => s.name === runningId);
    if (live && live.status !== "running") { if (runningId === "export") refetchExports(); setRunningId(null); return; }
    const key = ARTIFACT_KEYS[runningId];
    if (key) {
      const data = (project.artifacts as AnyObj)?.[key];
      const has = Array.isArray(data) ? (data as unknown[]).length > 0 : data != null && typeof data === "object" && Object.keys(data as object).length > 0;
      if (has) { if (runningId === "export") refetchExports(); setRunningId(null); }
    }
  }, [project, runningId, refetchExports]);

  const publishMutation = usePublishProject(id!);
  const downloadPdf     = useDownloadPdf(id!);

  const arts     = (project?.artifacts || {}) as AnyObj;
  const so       = !!(arts.spreadOnly) || soAge(project?.ageRange);
  const merged   = buildPipeline(project?.pipeline, arts);
  const isRunning = !!runningId || merged.some(s => s.status === "running");
  const doneCount = merged.filter(s => s.status === "completed").length;
  const pct       = Math.round((doneCount / PIPELINE_STAGES.length) * 100);
  const exportReady = merged.find(s => s.id === "layout")?.status === "completed";
  const creditCost  = confirmStage ? (STAGE_CREDIT_COSTS[confirmStage] ?? 3) : 0;

  const dispatch = async (stageId: string) => {
    if (!project) throw new Error("No project");
    const projectId = pid(project);
    const type = STAGE_TYPE[stageId] ?? "batch";
    if (type === "image") {
      if (stageId === "illustrations") await aiApi.generateAllIllustrations(projectId);
      else if (stageId === "cover")    await aiApi.generateCover(projectId);
      else                              await aiApi.generateImage({ task: stageId, projectId });
      return;
    }
    if (type === "text")      { await aiApi.runStage(projectId, stageId); return; }
    if (stageId === "layout") { await projectsApi.generateLayout(projectId); return; }
    if (stageId === "export") { await exportsApi.list(projectId); await refetchExports(); return; }
    throw new Error(`Unknown stage: ${stageId}`);
  };

  const confirmRun = async () => {
    if (!confirmStage || !project) return;
    if (credits < creditCost) {
      toast({ title: "Insufficient Credits", description: `Need ${creditCost}, have ${credits}.`, variant: "destructive", action: <Button size="sm" variant="outline" onClick={() => navigate("/app/billing")}><CreditCard className="mr-1 h-4 w-4" />Buy Credits</Button> });
      setConfirmStage(null); return;
    }
    const sid = confirmStage;
    setConfirmStage(null); setRunningId(sid);
    try { await dispatch(sid); await qc.invalidateQueries({ queryKey: ["projects", id] }); await qc.invalidateQueries({ queryKey: ["pageList", id] }); await refreshUser(); toast({ title: "Stage complete!", description: `${STAGE_LABELS[sid]} generated.` }); }
    catch (err) { toast({ title: "Stage Failed", description: (err as Error).message, variant: "destructive" }); await qc.invalidateQueries({ queryKey: ["projects", id] }); }
    finally { setRunningId(null); }
  };

  const onTextRerun = useCallback(async (prompt: string, ci: number, si: number) => {
    if (!project) return;
    try { await aiApi.runStage(pid(project), "spreadRerun", { customPrompt: prompt, chapterIndex: ci, spreadIndex: si }); await qc.refetchQueries({ queryKey: ["projects", id] }); await qc.invalidateQueries({ queryKey: ["pageList", id] }); toast({ title: "Text regenerated ✓" }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, toast]);

  const onImageRerun = useCallback(async (prompt: string, ci: number, si: number) => {
    if (!project) return;
    try { await aiApi.generateImage({ task: "illustration", projectId: pid(project), chapterIndex: ci, spreadIndex: si, customPrompt: prompt }); await qc.refetchQueries({ queryKey: ["projects", id] }); await qc.invalidateQueries({ queryKey: ["pageList", id] }); toast({ title: "Illustration regenerated ✓" }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, toast]);

  const onCoverRerun = useCallback(async (prompt: string, task: string) => {
    if (!project) return;
    try { await aiApi.generateImage({ task, projectId: pid(project), customPrompt: prompt }); await qc.refetchQueries({ queryKey: ["projects", id] }); toast({ title: "Cover regenerated ✓" }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, toast]);

  const onApprove = useCallback(async (ci: number, si: number) => {
    if (!project) return;
    try { await pagesApi.approve(pid(project), pkey(so, ci, si)); await qc.invalidateQueries({ queryKey: ["pageList", id] }); toast({ title: "Page approved ✓" }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, so, toast]);

  const onReject = useCallback(async (ci: number, si: number) => {
    if (!project) return;
    try { await pagesApi.reject(pid(project), pkey(so, ci, si)); await qc.invalidateQueries({ queryKey: ["pageList", id] }); toast({ title: "Marked for revision" }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, so, toast]);

  const onApproveAll = useCallback(async () => {
    if (!project) return;
    try { const r = await pagesApi.approveAll(pid(project)); await qc.invalidateQueries({ queryKey: ["pageList", id] }); toast({ title: `${r.count} pages approved ✓` }); }
    catch (err) { toast({ title: "Failed", description: (err as Error).message, variant: "destructive" }); }
  }, [project, id, qc, toast]);

  const onRegen = useCallback(async (stageId: string, note: string) => {
    if (!project) return;
    setRegenStage(stageId);
    try { await aiApi.runStage(pid(project), stageId, note ? { customNote: note } : undefined); await qc.refetchQueries({ queryKey: ["projects", id] }); toast({ title: `${STAGE_LABELS[stageId] || stageId} regenerated ✓` }); }
    catch (err) { toast({ title: "Regenerate failed", description: (err as Error).message, variant: "destructive" }); }
    finally { setRegenStage(null); }
  }, [project, id, qc, toast]);

  const copyLink = () => { if (!project?.shareToken) return; navigator.clipboard.writeText(`${window.location.origin}/demo/${project.shareToken}`); toast({ title: "Link copied!" }); };

  if (isLoading) return <AppLayout title="Loading…"><div className="flex items-center justify-center py-24"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></AppLayout>;
  if (error || !project) return <AppLayout title="Not Found"><div className="py-12 text-center"><p className="mb-4 text-muted-foreground">{error ? (error as Error).message : "Project not found."}</p><Button onClick={() => navigate("/app/dashboard")}>Back</Button></div></AppLayout>;

  const subtitle = [project.ageRange, (project.templateType || project.template) ? ((project.templateType || project.template || "").charAt(0).toUpperCase() + (project.templateType || project.template || "").slice(1).replace(/-/g, " ")) : null].filter(Boolean).join(" · ");

  return (
    <AppLayout title={project.title} subtitle={subtitle} actions={
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate("/app/dashboard")}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        {project.shareToken
          ? <Button variant="outline" size="sm" onClick={copyLink}><Share2 className="mr-2 h-4 w-4" />Copy Link</Button>
          : <Button variant="outline" size="sm" onClick={async () => { try { await publishMutation.mutateAsync(); toast({ title: "Published!" }); setShowShare(true); } catch (e) { toast({ title: "Failed", description: (e as Error).message, variant: "destructive" }); } }} disabled={publishMutation.isPending || !exportReady}>{publishMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}Publish</Button>
        }
        {latestUrl ? <Button asChild size="sm"><a href={latestUrl} target="_blank" rel="noreferrer"><Download className="mr-2 h-4 w-4" />Download</a></Button>
          : exportReady ? <Button size="sm" onClick={() => downloadPdf.mutateAsync()} disabled={downloadPdf.isPending}>{downloadPdf.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}Download PDF</Button>
          : null}
      </div>
    }>
      {/* Progress */}
      <div className="mb-6 rounded-xl border border-border bg-background p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="font-semibold">Book Progress</span>{isRunning && <Badge className="animate-pulse bg-blue-100 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-300">Running…</Badge>}{so && <Badge variant="outline" className="text-xs gap-1"><Baby className="w-3 h-3" />Spreads only</Badge>}{isChapterBook(project?.ageRange) && <Badge variant="outline" className="text-xs gap-1">📚 Chapter book · 4 pages/ch</Badge>}</div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{doneCount}/{PIPELINE_STAGES.length} stages</span><span className="font-bold text-primary">{pct}%</span><Badge variant="outline"><Zap className="mr-1 h-3 w-3" />{credits} cr</Badge></div>
        </div>
        <Progress value={pct} className="h-2" />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Pipeline */}
        <div className="space-y-3 lg:col-span-2">
          <h2 className="font-semibold">Pipeline Stages</h2>
          {merged.map(stage => <StageCard key={stage.id} stage={stage} allStages={merged} onRun={sid => setConfirmStage(sid)} busy={isRunning} so={so} />)}
          {doneCount > 1 && (
            <div className="mt-2 rounded-xl border border-border bg-background p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Page Approval</p>
                {pageListData?.summary && pageListData.summary.approved < pageListData.summary.total && (
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={onApproveAll}><Check className="w-3 h-3 mr-1" />Approve All</Button>
                )}
              </div>
              {pageListData?.summary && (
                <>
                  <Progress value={pageListData.summary.total ? Math.round((pageListData.summary.approved / pageListData.summary.total) * 100) : 0} className="h-1.5" />
                  <div className="flex flex-wrap gap-2 text-xs">
                    {pageListData.summary.draft     > 0 && <span className="text-muted-foreground">{pageListData.summary.draft} draft</span>}
                    {pageListData.summary.approved  > 0 && <span className="text-green-700">{pageListData.summary.approved} approved</span>}
                    {pageListData.summary.rejected  > 0 && <span className="text-red-600">{pageListData.summary.rejected} rejected</span>}
                    {pageListData.summary.edited    > 0 && <span className="text-amber-700">{pageListData.summary.edited} edited</span>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content viewer */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 font-semibold">Generated Content</h2>
          <ArtifactViewer
            project={project}
            exportsList={exportsList}
            exportsLoading={exportsLoading}
            pageEdits={pageEdits}
            onTextRerun={onTextRerun}
            onImageRerun={onImageRerun}
            onCoverRerun={onCoverRerun}
            onApprove={onApprove}
            onReject={onReject}
            onHistory={setHistoryKey}
            onRegen={onRegen}
            regenStage={regenStage}
          />
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirmStage} onOpenChange={o => !o && setConfirmStage(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Run {confirmStage ? (so && confirmStage === "chapters" ? "Pages" : STAGE_LABELS[confirmStage]) : ""}?</DialogTitle><DialogDescription>Uses <strong>{creditCost} credits</strong>. You have <strong>{credits}</strong>.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="ghost" onClick={() => setConfirmStage(null)}>Cancel</Button><Button onClick={confirmRun} disabled={credits < creditCost}><Play className="mr-2 h-4 w-4" />Run ({creditCost} cr)</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent>
          <DialogHeader><DialogTitle>Book Published!</DialogTitle><DialogDescription>Share with anyone.</DialogDescription></DialogHeader>
          {project.shareToken && <div className="flex gap-2"><input readOnly value={`${window.location.origin}/demo/${project.shareToken}`} className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm" /><Button variant="outline" onClick={copyLink}>Copy</Button></div>}
          <DialogFooter><Button variant="ghost" onClick={() => setShowShare(false)}>Close</Button>{project.shareToken && <Button asChild><Link to={`/demo/${project.shareToken}`} target="_blank"><Eye className="mr-2 h-4 w-4" />Preview</Link></Button>}</DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version history */}
      {historyKey && <VersionModal projectId={id!} pageKey={historyKey} open={!!historyKey} onClose={() => setHistoryKey(null)} />}

      {/* Running indicator */}
      {isRunning && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-blue-200 bg-background p-4 shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <div><p className="text-sm font-medium">Running {runningId ? (so && runningId === "chapters" ? "Pages" : STAGE_LABELS[runningId]) : "stage"}…</p><p className="text-xs text-muted-foreground">Refreshing every 3s</p></div>
        </div>
      )}
    </AppLayout>
  );
}