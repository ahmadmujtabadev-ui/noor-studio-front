import { useState } from "react";
import { ChevronLeft, ChevronRight, Moon, HandHeart, Languages, Ban, CheckCircle2 } from "lucide-react";
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
}

const STEPS = [
  {
    id: "islamicValues",
    label: "Islamic Values",
    emoji: "🌙",
    icon: Moon,
    color: "text-violet-600",
    activeBg: "bg-violet-600",
    activeRing: "ring-violet-400",
    lightBg: "bg-violet-50",
    description: "Core values woven into every story",
  },
  {
    id: "duas",
    label: "Du'as",
    emoji: "🤲",
    icon: HandHeart,
    color: "text-blue-600",
    activeBg: "bg-blue-600",
    activeRing: "ring-blue-400",
    lightBg: "bg-blue-50",
    description: "Prayers placed naturally in story moments",
  },
  {
    id: "vocabulary",
    label: "Vocabulary",
    emoji: "📖",
    icon: Languages,
    color: "text-orange-600",
    activeBg: "bg-orange-500",
    activeRing: "ring-orange-400",
    lightBg: "bg-orange-50",
    description: "Islamic words used correctly in prose",
  },
  {
    id: "avoidTopics",
    label: "Avoid Topics",
    emoji: "🚫",
    icon: Ban,
    color: "text-red-600",
    activeBg: "bg-red-500",
    activeRing: "ring-red-400",
    lightBg: "bg-red-50",
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

export function KBFaithLanguageStepper({ kb, onSave, isSaving }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isFirst = step === 0;
  const isLast  = step === STEPS.length - 1;

  const saveValues    = (islamicValues: string[])  => onSave({ islamicValues });
  const saveDuas      = (duas: any[])              => onSave({ duas });
  const saveVocab     = (vocabulary: any[])        => onSave({ vocabulary });
  const saveAvoid     = (avoidTopics: string[])    => onSave({ avoidTopics });

  return (
    <div className="flex flex-col min-h-[500px]">

      {/* ── Step progress bar ── */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((s, i) => {
          const count  = getCount(kb, s.id);
          const done   = count > 0;
          const active = i === step;
          const past   = i < step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(i)}
              className="flex flex-col items-center gap-1.5 group"
              style={{ flex: 1 }}
            >
              {/* Circle */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-200 shadow-sm",
                active
                  ? `${s.activeBg} border-transparent text-white ring-4 ${s.activeRing} ring-offset-2 scale-110`
                  : done
                    ? "bg-white border-green-400 text-green-600"
                    : "bg-white border-gray-200 text-gray-400 group-hover:border-gray-400"
              )}>
                {done && !active ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <span className="text-lg">{s.emoji}</span>
                )}
              </div>
              {/* Label + count */}
              <div className="text-center">
                <p className={cn(
                  "text-[11px] font-bold leading-tight",
                  active ? s.color : done ? "text-green-600" : "text-gray-400"
                )}>
                  {s.label}
                </p>
                {count > 0 && (
                  <p className="text-[10px] text-muted-foreground">{count} added</p>
                )}
              </div>
              {/* Connector line (not after last) */}
              {i < STEPS.length - 1 && (
                <div className="absolute hidden" />
              )}
            </button>
          );
        })}
      </div>

      {/* Connector lines between circles */}
      <div className="flex items-center mb-6 px-8 -mt-10">
        {STEPS.map((_, i) => i < STEPS.length - 1 && (
          <div key={i} className="flex-1 flex items-center">
            <div className="w-full mx-1" />
            <div className={cn(
              "h-0.5 flex-1 rounded-full transition-all duration-300",
              i < step ? "bg-green-400" : "bg-gray-200"
            )} />
          </div>
        ))}
      </div>

      {/* ── Active step header ── */}
      <div className={cn("rounded-2xl p-4 mb-6 flex items-center gap-3", current.lightBg)}>
        <span className="text-3xl">{current.emoji}</span>
        <div>
          <p className={cn("text-base font-bold", current.color)}>{current.label}</p>
          <p className="text-xs text-muted-foreground">{current.description}</p>
        </div>
        {getCount(kb, current.id) > 0 && (
          <span className={cn("ml-auto text-xs font-bold px-3 py-1 rounded-full", current.lightBg, current.color, "border border-current")}>
            {getCount(kb, current.id)} added ✓
          </span>
        )}
      </div>

      {/* ── Step content ── */}
      <div className="flex-1">
        {step === 0 && (
          <KBIslamicValuesStep
            items={kb?.islamicValues || []}
            onSave={saveValues}
            isSaving={isSaving}
          />
        )}
        {step === 1 && (
          <KBDuasStep
            duas={kb?.duas || []}
            onSave={saveDuas}
            isSaving={isSaving}
          />
        )}
        {step === 2 && (
          <KBVocabularyStep
            vocab={kb?.vocabulary || []}
            onSave={saveVocab}
            isSaving={isSaving}
          />
        )}
        {step === 3 && (
          <KBAvoidTopicsStep
            items={kb?.avoidTopics || []}
            onSave={saveAvoid}
            isSaving={isSaving}
          />
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={isFirst}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i === step ? "w-6 bg-primary" : "bg-gray-200 hover:bg-gray-400"
              )}
            />
          ))}
        </div>

        <Button
          variant={isLast ? "outline" : "default"}
          onClick={() => !isLast && setStep(s => s + 1)}
          disabled={isLast}
          className="gap-2"
        >
          {isLast ? "All Done ✓" : "Next"}
          {!isLast && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
