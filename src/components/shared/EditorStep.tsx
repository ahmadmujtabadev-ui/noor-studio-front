// steps/EditorStep.tsx
import { useState, useEffect } from "react";
import {
  Layout, ArrowLeft, Loader2, CheckCircle2, BookOpen, FileText,
  Palette, PenLine, Image as ImageIcon, BookMarked, Download,
  AlertTriangle, RefreshCw, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { normArr } from "@/lib/api/reviewTypes";
import { exportsApi } from "@/lib/api/exports.api";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import type { KnowledgeBase } from "@/lib/api/types";

// ─── Front Cover Text Editor ──────────────────────────────────────────────────

interface CoverTextPanelProps {
  bb: BookBuilderHook;
}

function CoverTextPanel({ bb }: CoverTextPanelProps) {
  const [kb, setKb]             = useState<KnowledgeBase | null>(null);
  const [title, setTitle]       = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const frontUrl = bb.coverReview?.front?.current?.imageUrl || null;
  const isRegen  = bb.loadingKey === "cover-front";

  useEffect(() => {
    if (!bb.knowledgeBaseId) return;
    knowledgeBasesApi.get(bb.knowledgeBaseId).then((data) => {
      setKb(data);
      const cd = (data as any).coverDesign || {};
      setTitle(cd.bookTitle   || "");
      setSubtitle(cd.subtitle || "");
      setAuthor(cd.authorName || "");
    }).catch(() => {});
  }, [bb.knowledgeBaseId]);

  const handleSave = async () => {
    if (!kb || !bb.knowledgeBaseId) return;
    setSaving(true);
    try {
      const cd = (kb as any).coverDesign || {};
      await knowledgeBasesApi.update(bb.knowledgeBaseId, {
        coverDesign: { ...cd, bookTitle: title, subtitle, authorName: author },
      } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndRegen = async () => {
    await handleSave();
    bb.regenerateCover("front");
  };

  if (!frontUrl && !bb.knowledgeBaseId) return null;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
          <BookMarked className="w-4 h-4 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Front Cover Text</h3>
          <p className="text-xs text-muted-foreground">Edit the title, subtitle, and author name — then regenerate to apply.</p>
        </div>
      </div>

      <div className="p-5 flex flex-col lg:flex-row gap-6">
        {/* Cover preview */}
        <div className="lg:w-44 shrink-0">
          {frontUrl ? (
            <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-border/30">
              <img src={frontUrl} alt="Front cover" className="w-full h-full object-cover" draggable={false} />
            </div>
          ) : (
            <div className="w-full aspect-[2/3] rounded-xl bg-muted/20 border border-dashed border-border/40 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Text fields */}
        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Book Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Desert of Wonders"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Subtitle / Tagline</Label>
            <Input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. A Journey Beyond the Stars"
              className="text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Author Name</Label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Zara Al-Amin"
              className="text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={handleSave}
              className="gap-1.5"
            >
              {saving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : saved
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  : <Save className="w-3.5 h-3.5" />
              }
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              size="sm"
              disabled={saving || isRegen}
              onClick={handleSaveAndRegen}
              className="gap-1.5"
            >
              {isRegen
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Regenerating…</>
                : <><RefreshCw className="w-3.5 h-3.5" />Save & Regenerate Front Cover</>
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EditorStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
}

export function EditorStep({ bb, onBack }: EditorStepProps) {
  const illStep   = bb.isChapterBook ? 4 : 3;
  const coverStep = bb.isChapterBook ? 5 : 4;

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError]     = useState<string | null>(null);

  // ── Stage checklist ──────────────────────────────────────────────────────
  const stageChecks = [
    {
      icon: BookOpen,
      label: "Story",
      done: bb.storyReview?.status === "approved",
      detail: bb.storyReview?.current?.bookTitle || "—",
      step: 1,
    },
    {
      icon: FileText,
      label: bb.isChapterBook ? "Chapter Outline" : "Page Structure",
      done: bb.allStructureApproved,
      detail: `${normArr(bb.structureReview?.items).filter((i: any) => i.status === "approved").length}/${normArr(bb.structureReview?.items).length} approved`,
      step: 2,
    },
    {
      icon: Palette,
      label: "Character Style",
      done: true,
      detail: "Portraits generated",
      step: null as number | null,
    },
    ...(bb.isChapterBook ? [{
      icon: PenLine,
      label: "Chapter Prose",
      done: bb.allProseApproved,
      detail: `${(bb.humanizedReview.length ? bb.humanizedReview : bb.proseReview).filter((n) => n.status === "approved").length} chapters approved`,
      step: 3 as number | null,
    }] : []),
    {
      icon: ImageIcon,
      label: "Illustrations",
      done: bb.allIllusApproved,
      detail: `${bb.illustrationNodes.filter((n) => n.status === "approved").length}/${bb.illustrationNodes.length} approved`,
      step: illStep as number | null,
    },
    {
      icon: BookMarked,
      label: "Cover",
      done: bb.bothCoversApproved,
      detail: bb.bothCoversApproved ? "Front & back approved" : "Pending",
      step: coverStep as number | null,
    },
  ];

  const allDone = stageChecks.every((s) => s.done);

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (!bb.projectId) return;
    setExportLoading(true);
    setExportError(null);
    try {
      await exportsApi.downloadPdf(bb.projectId, "kdp");
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-10">

      {/* ── Front cover text editing ─────────────────────────────────────── */}
      <CoverTextPanel bb={bb} />

      {/* ── Stage review ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Review & Export</h2>
            <p className="text-sm text-muted-foreground">
              Canvas Editor has opened automatically. Use the buttons below to export.
            </p>
          </div>
        </div>

        {/* Stage checklist */}
        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          {stageChecks.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-4 px-5 py-3 transition-colors",
                !s.done && s.step && "cursor-pointer hover:bg-muted/40"
              )}
              onClick={() => { if (!s.done && s.step) bb.setStep(s.step); }}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                s.done
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground truncate">{s.detail}</p>
              </div>
              <Badge variant="outline" className={cn(
                "text-[10px] font-semibold",
                s.done
                  ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                  : "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
              )}>
                {s.done ? "Done" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        {!allDone && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Still pending:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {stageChecks.filter((s) => !s.done).map((s, i) => (
                <li key={i}>{s.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs opacity-80">Click any pending row to go back.</p>
          </div>
        )}
      </div>

      {/* ── Export actions ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        {exportError && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{exportError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
          <Button
            onClick={bb.openEditor}
            disabled={bb.globalLoading}
            variant="outline"
            className="gap-2 h-11 bg-primary/10 border-primary  "
          >
            {bb.globalLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Layout className="w-4 h-4" />}
            Open Canvas Editor
          </Button>

          {/* <Button
            onClick={handleExportPdf}
            disabled={exportLoading || !bb.projectId}
            className="gap-2 h-11"
          >
            {exportLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            {exportLoading ? "Generating PDF…" : "Export for KDP Kids"}
          </Button> */}
        </div>
      </div>

      {/* ── Nav footer ──────────────────────────────────────────────────── */}
      <div className="flex justify-start pt-1">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
      </div>

    </div>
  );
}
