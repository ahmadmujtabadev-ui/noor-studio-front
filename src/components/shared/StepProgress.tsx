// components/StepProgress.tsx
import React from "react";
import { Check, BookOpen, FileText, Palette, PenLine, Image as ImageIcon, BookMarked, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { AgeMode, getSteps } from "@/lib/api/reviewTypes";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, FileText, Palette, PenLine, Image: ImageIcon, BookMarked, Layout,
};

interface StepProgressProps {
  mode: AgeMode;
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (step: number) => void;
}

export function StepProgress({ mode, currentStep, completedSteps, onStepClick }: StepProgressProps) {
  const steps = getSteps(mode);

  return (
    <div className="mb-10">
      {/* Steps row */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => {
          const done    = completedSteps.has(s.id);
          const active  = currentStep === s.id;
          const locked  = !done && !active && s.id > currentStep;
          const Icon    = ICON_MAP[s.icon] ?? FileText;

          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => !locked && onStepClick?.(s.id)}
                  disabled={locked}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    done  && "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30",
                    active && !done && "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg",
                    !done && !active && !locked && "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer",
                    locked && "bg-muted/50 text-muted-foreground/40 cursor-not-allowed",
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </button>
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide whitespace-nowrap",
                    active ? "text-primary" : done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground/60",
                  )}
                >
                  {s.label}
                </span>
              </div>

              {/* Connector */}
              {i < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2 mt-[-14px] rounded-full transition-colors duration-300",
                  completedSteps.has(s.id) ? "bg-emerald-400" : "bg-border",
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}