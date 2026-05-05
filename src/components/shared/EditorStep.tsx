// steps/EditorStep.tsx
import { useState } from "react";
import {
  Layout, ArrowLeft, Loader2, CheckCircle2, BookOpen, FileText,
  Palette, PenLine, Image as ImageIcon, BookMarked, Download,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { normArr } from "@/lib/api/reviewTypes";
import { exportsApi } from "@/lib/api/exports.api";

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
