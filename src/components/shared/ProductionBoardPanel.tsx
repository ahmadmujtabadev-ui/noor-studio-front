// ProductionBoardPanel.tsx
// Slide-over panel showing every book-production slot and the exact stage
// each is at. Opened by the Production button in the header.

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe, Users, Library, BookOpen, Rocket,
  Check, Lock, X, Plus, Loader2, AlertTriangle, BookCopy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useJourney } from "@/hooks/useJourney";
import type { JourneySlot } from "@/lib/api/journey.api";

// ─── Stage icon map ───────────────────────────────────────────────────────────
const STAGE_ICONS: Record<string, React.ElementType> = {
  universe:   Globe,
  characters: Users,
  kb:         Library,
  book:       BookOpen,
  editor:     Rocket,
};

function stageHref(stageId: string, projectId: string | null): string {
  switch (stageId) {
    case "universe":   return "/app/universes";
    case "characters": return "/app/characters";
    case "kb":         return "/app/knowledge-base";
    case "book":
    case "editor":     return projectId ? `/app/books/${projectId}` : "/app/books/new";
    default:           return "/app/dashboard";
  }
}

// ─── Single book slot card ────────────────────────────────────────────────────

function SlotCard({
  slot,
  isActive,
  onClose,
}: {
  slot: JourneySlot;
  isActive: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const isEmpty  = !slot.projectId;

  const handleStageClick = (sid: string) => {
    if (isEmpty && sid !== "universe" && sid !== "characters" && sid !== "kb") return;
    navigate(stageHref(sid, slot.projectId));
    onClose();
  };

  const handleCTA = () => {
    if (isEmpty) {
      navigate("/app/books/new");
    } else if (slot.currentStage) {
      navigate(stageHref(slot.currentStage, slot.projectId));
    }
    onClose();
  };

  return (
    <div className={cn(
      "rounded-xl border p-4 space-y-3 transition-colors",
      slot.isComplete
        ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
        : isActive
        ? "border-primary/30 bg-primary/5"
        : isEmpty
        ? "border-dashed border-border bg-muted/20"
        : "border-border bg-card"
    )}>
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            slot.isComplete ? "bg-emerald-500 text-white"
              : isActive ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}>
            {slot.slotIndex + 1}
          </div>
          <span className="text-sm font-semibold truncate">
            {isEmpty
              ? <span className="text-muted-foreground italic">Empty slot</span>
              : slot.title || `Book ${slot.slotIndex + 1}`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {slot.isComplete && (
            <Badge variant="outline" className="text-[10px] border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
              Complete
            </Badge>
          )}
          {isActive && !slot.isComplete && (
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary animate-pulse">
              Active
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground font-medium">
            {slot.percentComplete}%
          </span>
        </div>
      </div>

      {/* Stage pipeline */}
      <div className="flex items-center gap-0">
        {slot.stageOrder.map((sid, idx) => {
          const isDone    = slot.doneMap[sid] ?? false;
          const isCurrent = slot.currentStage === sid && !slot.isComplete;
          const isLocked  = !isDone && !isCurrent && idx > 0 && !slot.doneMap[slot.stageOrder[idx - 1]];
          const Icon      = STAGE_ICONS[sid] ?? BookOpen;
          const isLast    = idx === slot.stageOrder.length - 1;
          const clickable = (isDone || isCurrent) && !isEmpty;

          return (
            <React.Fragment key={sid}>
              <div className="flex flex-col items-center gap-1 flex-1">
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && handleStageClick(sid)}
                  title={slot.stageMeta?.[sid]?.label ?? sid}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all focus-visible:outline-none",
                    isDone && !isEmpty
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200 cursor-pointer"
                      : isCurrent
                      ? "border-2 border-primary text-primary bg-background shadow-sm cursor-pointer scale-110"
                      : (isLocked || isEmpty)
                      ? "bg-muted/60 text-muted-foreground/30"
                      : "bg-muted text-muted-foreground/50"
                  )}
                >
                  {isDone && !isEmpty
                    ? <Check className="w-3.5 h-3.5" />
                    : (isLocked || isEmpty)
                    ? <Lock className="w-3 h-3" />
                    : isCurrent
                    ? <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    : <Icon className="w-3.5 h-3.5" />}
                </button>
                <span className={cn(
                  "text-[9px] font-medium text-center leading-none",
                  isDone && !isEmpty ? "text-emerald-600 dark:text-emerald-400"
                    : isCurrent ? "text-primary"
                    : "text-muted-foreground/50"
                )}>
                  {(slot.stageMeta?.[sid]?.label ?? sid).slice(0, 5)}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 rounded-full mb-4 mx-1 transition-colors",
                  isDone && !isEmpty ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* CTA footer */}
      {!slot.isComplete && (
        <Button
          size="sm"
          variant={isActive ? "default" : "outline"}
          className="w-full h-7 text-xs gap-1.5"
          onClick={handleCTA}
        >
          {isEmpty
            ? <><Plus className="w-3 h-3" /> Start Book {slot.slotIndex + 1}</>
            : <>{slot.currentStage && (STAGE_ICONS[slot.currentStage] ? React.createElement(STAGE_ICONS[slot.currentStage], { className: "w-3 h-3" }) : null)} Continue — {slot.stageMeta?.[slot.currentStage ?? ""]?.label}</>}
        </Button>
      )}
    </div>
  );
}

// ─── Panel component ──────────────────────────────────────────────────────────

interface ProductionBoardPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ProductionBoardPanel({ open, onClose }: ProductionBoardPanelProps) {
  const { data, isLoading, isError } = useJourney();

  const filledSlots = data?.slots.filter((s) => s.projectId) ?? [];
  const doneSlots   = filledSlots.filter((s) => s.isComplete);
  const limitLabel  = data
    ? data.planLimit === -1 ? "∞" : String(data.planLimit)
    : "—";

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50",
        "flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <BookCopy className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base font-bold leading-none">Production Board</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isLoading ? "Loading…"
                  : `${doneSlots.length} of ${limitLabel} books complete`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-3">
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Could not load production data. Make sure you are connected.</span>
              </div>
            )}

            {data?.slots.map((slot, idx) => (
              <SlotCard
                key={slot.slotIndex}
                slot={slot}
                isActive={idx === data.activeSlotIdx}
                onClose={onClose}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
