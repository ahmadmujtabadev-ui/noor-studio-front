// steps/EditorStep.tsx
import React from "react";
import { Layout, ArrowLeft, ArrowRight, Loader2, CheckCircle2, BookOpen, FileText, Palette, PenLine, Image as ImageIcon, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { normArr } from "@/lib/api/reviewTypes";
;

interface EditorStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
}

export function EditorStep({ bb, onBack }: EditorStepProps) {
  const illStep   = bb.isChapterBook ? 4 : 3;
  const coverStep = bb.isChapterBook ? 5 : 4;

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

  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-7">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Layout className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Ready for Editor</h2>
          <p className="text-sm text-muted-foreground">
            Review approval summary below, then open the full book editor.
          </p>
        </div>
      </div>

      {/* Stage checklist */}
      <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
        {stageChecks.map((s, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 transition-colors",
              !s.done && s.step && "cursor-pointer hover:bg-muted/40"
            )}
            onClick={() => { if (!s.done && s.step) bb.setStep(s.step); }}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              s.done ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            )}>
              {s.done ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-xs text-muted-foreground truncate">{s.detail}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "text-xs font-semibold px-2 py-0.5 rounded-full",
                s.done
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              )}>
                {s.done ? "Done" : "Pending"}
              </div>
              {!s.done && s.step && (
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
              )}
            </div>
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
          <p className="mt-2 text-xs opacity-80">Click any pending row above to go back and complete it. You can still open the editor, but the book may be incomplete.</p>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button onClick={bb.openEditor} disabled={bb.globalLoading} size="lg" className="gap-2">
          {bb.globalLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" />Opening Canvas…</>
            : <><Layout className="w-4 h-4" />Open Canvas Editor</>
          }
        </Button>
      </div>
    </div>
  );
}