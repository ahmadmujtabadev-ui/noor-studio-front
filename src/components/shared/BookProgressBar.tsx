import React from "react";
import { BookOpen, Layers, PenLine, Image, BookMarked, MonitorPlay, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  icon: React.ElementType;
}

const PICTURE_STEPS: Step[] = [
  { number: 1, label: "Story",         icon: BookOpen    },
  { number: 2, label: "Structure",     icon: Layers      },
  { number: 3, label: "Illustrations", icon: Image       },
  { number: 4, label: "Cover",         icon: BookMarked  },
  { number: 5, label: "Editor",        icon: MonitorPlay },
];

const CHAPTER_STEPS: Step[] = [
  { number: 1, label: "Story",         icon: BookOpen    },
  { number: 2, label: "Structure",     icon: Layers      },
  { number: 3, label: "Prose",         icon: PenLine     },
  { number: 4, label: "Illustrations", icon: Image       },
  { number: 5, label: "Cover",         icon: BookMarked  },
  { number: 6, label: "Editor",        icon: MonitorPlay },
];

interface BookProgressBarProps {
  currentStep: number;
  completedSteps: Set<number>;
  isChapterBook: boolean;
  onStepClick: (step: number) => void;
}

export function BookProgressBar({ currentStep, completedSteps, isChapterBook, onStepClick }: BookProgressBarProps) {
  const steps = isChapterBook ? CHAPTER_STEPS : PICTURE_STEPS;

  return (
    <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="max-w-4xl mx-auto">
        {/* Desktop — horizontal stepper */}
        <div className="hidden sm:flex items-center gap-0">
          {steps.map((step, idx) => {
            const isCompleted = completedSteps.has(step.number);
            const isCurrent   = currentStep === step.number;
            const isLocked    = !isCompleted && !isCurrent;
            const isClickable = isCompleted;
            const Icon        = step.icon;
            const isLast      = idx === steps.length - 1;

            return (
              <div key={step.number} className="flex items-center flex-1 min-w-0">
                {/* Step pill */}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick(step.number)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isCompleted && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 cursor-pointer shadow-sm",
                    isCurrent  && "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/30 cursor-default scale-105",
                    isLocked   && "bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60",
                  )}
                  title={isLocked ? "Complete previous steps to unlock" : step.label}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse shrink-0" />
                  ) : (
                    <Lock className="w-3 h-3 shrink-0 opacity-50" />
                  )}
                  <Icon className="w-3 h-3 shrink-0" />
                  <span className="hidden md:inline truncate">{step.label}</span>
                  <span className="md:hidden">{step.number}</span>
                </button>

                {/* Connector */}
                {!isLast && (
                  <div className={cn(
                    "flex-1 h-0.5 mx-1 rounded-full transition-colors",
                    isCompleted ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile — compact "Step N of M" with mini dots */}
        <div className="flex sm:hidden items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(() => {
              const cur = steps.find(s => s.number === currentStep);
              const CurIcon = cur?.icon ?? BookOpen;
              return (
                <>
                  <CurIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{cur?.label}</span>
                  <span className="text-xs text-muted-foreground">({currentStep}/{steps.length})</span>
                </>
              );
            })()}
          </div>
          <div className="flex items-center gap-1">
            {steps.map((step) => {
              const isCompleted = completedSteps.has(step.number);
              const isCurrent   = currentStep === step.number;
              return (
                <button
                  key={step.number}
                  type="button"
                  disabled={!isCompleted}
                  onClick={() => isCompleted && onStepClick(step.number)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    isCompleted ? "bg-emerald-500 cursor-pointer hover:scale-125" :
                    isCurrent   ? "bg-primary w-4 cursor-default" :
                                  "bg-muted-foreground/30 cursor-not-allowed"
                  )}
                  title={step.label}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
