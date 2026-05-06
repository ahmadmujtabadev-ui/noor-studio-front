import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, ChevronLeft, ChevronRight, HandHeart, Languages, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KBIslamicValuesStep } from "./KBIslamicValuesStep";
import { KBDuasStep } from "./KBDuasStep";
import { KBVocabularyStep } from "./KBVocabularyStep";
import { KBAvoidTopicsStep } from "./KBAvoidTopicsStep";

interface Props {
  kb: any;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  mode?: "islamic" | "universal";
}

const STEPS = [
  {
    id: "islamicValues",
    label: "Islamic Values",
    icon: Moon,
    color: "text-primary",
    accent: "bg-primary",
    soft: "bg-primary/5",
    border: "border-primary/20",
    description: "Core values woven into every story",
  },
  {
    id: "duas",
    label: "Du'as",
    icon: HandHeart,
    color: "text-emerald-700",
    accent: "bg-emerald-600",
    soft: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Prayers placed naturally in story moments",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    icon: Languages,
    color: "text-secondary",
    accent: "bg-secondary",
    soft: "bg-secondary/10",
    border: "border-secondary/25",
    description: "Islamic words used correctly in prose",
  },
  {
    id: "avoidTopics",
    label: "Avoid Topics",
    icon: Ban,
    color: "text-destructive",
    accent: "bg-destructive",
    soft: "bg-destructive/5",
    border: "border-destructive/20",
    description: "Content AI will never include",
  },
] as const;

function getCount(kb: any, stepId: string): number {
  switch (stepId) {
    case "islamicValues": return kb?.islamicValues?.length || 0;
    case "duas":          return kb?.duas?.length || 0;
    case "vocabulary":    return kb?.vocabulary?.length || 0;
    case "avoidTopics":   return kb?.avoidTopics?.length || 0;
    default:              return 0;
  }
}

function getSteps(mode: "islamic" | "universal") {
  return STEPS
    .filter((step) => mode === "islamic" || step.id !== "duas")
    .map((step) => {
      if (mode !== "universal") return step;
      if (step.id === "islamicValues") {
        return {
          ...step,
          label: "Core Values",
          description: "Broad values woven into every story",
        };
      }
      if (step.id === "vocabulary") {
        return {
          ...step,
          description: "Story words used consistently in prose",
        };
      }
      return step;
    });
}

export function KBFaithLanguageStepper({ kb, onSave, isSaving, activeSection, onSectionChange, mode = "islamic" }: Props) {
  const steps = useMemo(() => getSteps(mode), [mode]);
  const [step, setStep] = useState(0);
  const current = steps[step] ?? steps[0];
  const isFirst = step === 0;
  const isLast  = step === steps.length - 1;
  const CurrentIcon = current.icon;

  const saveValues = (islamicValues: string[]) => onSave({ islamicValues });
  const saveDuas   = (duas: any[]) => onSave({ duas });
  const saveVocab  = (vocabulary: any[]) => onSave({ vocabulary });
  const saveAvoid  = (avoidTopics: string[]) => onSave({ avoidTopics });
  const goToStep = (index: number) => {
    if (!steps[index]) return;
    setStep(index);
    onSectionChange?.(steps[index].id);
  };

  useEffect(() => {
    if (!activeSection) return;
    const index = steps.findIndex((s) => s.id === activeSection);
    setStep(index >= 0 ? index : 0);
  }, [activeSection, steps]);

  return (
    <div className="flex min-h-[500px] flex-col">
      <div className="mb-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => {
          const count = getCount(kb, s.id);
          const done = count > 0;
          const active = i === step;
          const Icon = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => goToStep(i)}
              className={cn(
                "group flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                active
                  ? `${s.soft} ${s.border} shadow-sm`
                  : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <span className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                active ? `${s.accent} text-white` : done ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"
              )}>
                {done && !active ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </span>
              <span className="min-w-0">
                <span className={cn("block truncate text-sm font-bold", active ? s.color : "text-foreground")}>{s.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {count > 0 ? `${count} added` : "Not started"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className={cn("mb-6 flex items-center gap-3 rounded-xl border px-4 py-3", current.soft, current.border)}>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white", current.accent)}>
          <CurrentIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className={cn("text-sm font-bold", current.color)}>{current.label}</p>
          <p className="text-xs text-muted-foreground">{current.description}</p>
        </div>
        {getCount(kb, current.id) > 0 && (
          <span className={cn("ml-auto shrink-0 rounded-full border bg-white/70 px-3 py-1 text-xs font-bold", current.border, current.color)}>
            {getCount(kb, current.id)} added
          </span>
        )}
      </div>

      <div className="flex-1">
        {step === 0 && (
          <KBIslamicValuesStep
            items={kb?.islamicValues || []}
            onSave={saveValues}
            isSaving={isSaving}
            mode={mode}
          />
        )}
        {current.id === "duas" && (
          <KBDuasStep
            duas={kb?.duas || []}
            onSave={saveDuas}
            isSaving={isSaving}
          />
        )}
        {current.id === "vocabulary" && (
          <KBVocabularyStep
            vocab={kb?.vocabulary || []}
            onSave={saveVocab}
            isSaving={isSaving}
            mode={mode}
          />
        )}
        {current.id === "avoidTopics" && (
          <KBAvoidTopicsStep
            items={kb?.avoidTopics || []}
            onSave={saveAvoid}
            isSaving={isSaving}
            mode={mode}
          />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-5">
        <Button
          variant="outline"
          onClick={() => goToStep(step - 1)}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-1.5">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => goToStep(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                i === step ? "w-7 bg-primary" : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>

        <Button
          variant={isLast ? "outline" : "default"}
          onClick={() => !isLast && goToStep(step + 1)}
          disabled={isLast}
          className="gap-2"
        >
          {isLast ? "All Done" : "Next"}
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
