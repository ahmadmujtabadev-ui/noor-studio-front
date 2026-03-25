// steps/EditorStep.tsx
import React from "react";
import { Layout, ArrowLeft, Loader2, CheckCircle2, BookOpen, FileText, Palette, PenLine, Image as ImageIcon, BookMarked } from "lucide-react";
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
  const stageChecks = [
    {
      icon: BookOpen,
      label: "Story",
      done: bb.storyReview?.status === "approved",
      detail: bb.storyReview?.current?.bookTitle || "—",
    },
    {
      icon: FileText,
      label: bb.isChapterBook ? "Chapter Outline" : "Page Structure",
      done: bb.allStructureApproved,
      detail: `${normArr(bb.structureReview?.items).filter((i: any) => i.status === "approved").length}/${normArr(bb.structureReview?.items).length} approved`,
    },
    {
      icon: Palette,
      label: "Character Style",
      done: true,
      detail: "Portraits generated",
    },
    ...(bb.isChapterBook ? [{
      icon: PenLine,
      label: "Chapter Prose",
      done: bb.allProseApproved,
      detail: `${(bb.humanizedReview.length ? bb.humanizedReview : bb.proseReview).filter((n) => n.status === "approved").length} chapters approved`,
    }] : []),
    {
      icon: ImageIcon,
      label: "Illustrations",
      done: bb.allIllusApproved,
      detail: `${bb.illustrationNodes.filter((n) => n.status === "approved").length}/${bb.illustrationNodes.length} approved`,
    },
    {
      icon: BookMarked,
      label: "Cover",
      done: bb.bothCoversApproved,
      detail: bb.bothCoversApproved ? "Front & back approved" : "Pending",
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
          <div key={i} className="flex items-center gap-4 px-5 py-3.5">
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
            <div className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              s.done
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            )}>
              {s.done ? "Done" : "Pending"}
            </div>
          </div>
        ))}
      </div>

      {!allDone && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Some stages are still pending. You can still open the editor, but the book may be incomplete.
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button onClick={bb.openEditor} disabled={bb.globalLoading} size="lg">
          {bb.globalLoading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Opening…</>
            : <><Layout className="w-4 h-4 mr-2" />Open Book Editor</>
          }
        </Button>
      </div>
    </div>
  );
}