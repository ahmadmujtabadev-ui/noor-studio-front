// GlobalProgressBar — Book Production Board
// Sticky sub-header that shows every book slot in the user's plan and the
// exact stage each is at. Collapsed by default (shows active slot only);
// clicking "All books" opens the full per-slot pipeline view.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Globe, Users, Library, BookOpen, Rocket,
  Check, Lock, ChevronDown, ChevronUp, Plus, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useJourney } from "@/hooks/useJourney";
import type { JourneySlot } from "@/lib/api/journey.api";
import { Button } from "@/components/ui/button";

// ─── Stage icon map ───────────────────────────────────────────────────────────
const STAGE_ICONS: Record<string, React.ElementType> = {
  universe:   Globe,
  characters: Users,
  kb:         Library,
  book:       BookOpen,
  editor:     Rocket,
};

// Navigation href for each stage + optional projectId
function stageHref(stageId: string, projectId: string | null): string {
  switch (stageId) {
    case "universe":   return "/app/universes";
    case "characters": return "/app/characters";
    case "kb":         return "/app/knowledge-base";
    case "book":       return projectId ? `/app/books/${projectId}` : "/app/books/new";
    case "editor":     return projectId ? `/app/books/${projectId}` : "/app/books/new";
    default:           return "/app/dashboard";
  }
}

// ─── Single slot row ──────────────────────────────────────────────────────────

function SlotRow({
  slot,
  isActive,
  compact = false,
}: {
  slot: JourneySlot;
  isActive: boolean;
  compact?: boolean;
}) {
  const navigate = useNavigate();
  const isEmpty  = !slot.projectId;
  const stageOrder = slot.stageOrder;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-xl transition-colors",
      isActive && !compact && "bg-primary/5 ring-1 ring-primary/15",
      !isEmpty && !compact && "hover:bg-muted/30",
    )}>
      {/* Slot label */}
      <div className={cn(
        "shrink-0 text-xs font-bold tabular-nums w-16 truncate",
        isEmpty          ? "text-muted-foreground/40"
          : slot.isComplete ? "text-emerald-600 dark:text-emerald-400"
          : isActive       ? "text-primary"
          : "text-muted-foreground"
      )}>
        {isEmpty ? (
          <span className="opacity-50">Book {slot.slotIndex + 1}</span>
        ) : (
          <span className="truncate block" title={slot.title || ""}>
            {slot.title ? slot.title.slice(0, 10) + (slot.title.length > 10 ? "…" : "") : `Book ${slot.slotIndex + 1}`}
          </span>
        )}
      </div>

      {/* Stage pipeline */}
      <div className="flex items-center gap-0 flex-1 min-w-0">
        {stageOrder.map((sid, idx) => {
          const isDone    = slot.doneMap[sid] ?? false;
          const isCurrent = slot.currentStage === sid && !slot.isComplete;
          const isLocked  = !isDone && !isCurrent && idx > 0 && !slot.doneMap[stageOrder[idx - 1]];
          const Icon      = STAGE_ICONS[sid] ?? BookOpen;
          const isLast    = idx === stageOrder.length - 1;
          const clickable = isDone || isCurrent;

          return (
            <React.Fragment key={sid}>
              <button
                type="button"
                disabled={!clickable || isEmpty}
                onClick={() => clickable && !isEmpty && navigate(stageHref(sid, slot.projectId))}
                title={slot.stageMeta?.[sid]?.label ?? sid}
                className={cn(
                  "flex items-center justify-center rounded-full transition-all shrink-0 focus-visible:outline-none",
                  compact ? "w-5 h-5" : "w-6 h-6",
                  isDone   && !isEmpty && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-200 cursor-pointer",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/30 cursor-pointer scale-110",
                  (isLocked || isEmpty) && "bg-muted/50 text-muted-foreground/30 cursor-not-allowed",
                  !isDone && !isCurrent && !isLocked && !isEmpty && "bg-muted text-muted-foreground/40",
                )}
              >
                {isDone && !isEmpty
                  ? <Check className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
                  : (isLocked || isEmpty)
                  ? <Lock className={compact ? "w-2 h-2" : "w-2.5 h-2.5"} />
                  : <Icon className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />}
              </button>

              {/* Connector */}
              {!isLast && (
                <div className={cn(
                  "h-px flex-1 min-w-[8px] max-w-[24px] rounded-full transition-colors",
                  isDone && !isEmpty ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* CTA */}
      {!compact && (
        <div className="shrink-0">
          {isEmpty ? (
            <Button
              size="sm"
              variant="outline"
              className="h-6 text-[10px] px-2 gap-1"
              onClick={() => navigate("/app/books/new")}
            >
              <Plus className="w-2.5 h-2.5" /> Start
            </Button>
          ) : slot.isComplete ? (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Complete</span>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-[10px] px-2 text-primary hover:text-primary/80"
              onClick={() => navigate(stageHref(slot.currentStage || "book", slot.projectId))}
            >
              Continue →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GlobalProgressBar() {
  const [expanded, setExpanded] = useState(false);
  const { data, isLoading }     = useJourney();

  if (isLoading) {
    return (
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading production board…</span>
      </div>
    );
  }

  if (!data) return null;

  const { slots, activeSlotIdx, planLimit } = data;
  const activeSlot   = slots[activeSlotIdx] ?? slots[0];
  const filledSlots  = slots.filter((s) => s.projectId);
  const doneCount    = filledSlots.filter((s) => s.isComplete).length;
  const limitLabel   = planLimit === -1 ? "∞" : String(planLimit);

  return (
    <div className="sticky top-16 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* ── Collapsed bar ── */}
      <div className="px-4 py-2 flex items-center gap-4">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Production
          </span>
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            doneCount === filledSlots.length && filledSlots.length > 0
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-muted text-muted-foreground"
          )}>
            {doneCount}/{limitLabel}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-5 bg-border shrink-0" />

        {/* Active slot preview (compact pipeline) */}
        {activeSlot && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-medium text-foreground truncate hidden md:inline shrink-0 max-w-[120px]">
              {activeSlot.title || `Book ${activeSlot.slotIndex + 1}`}
            </span>
            <div className="flex items-center gap-0">
              {activeSlot.stageOrder.map((sid, idx) => {
                const isDone    = activeSlot.doneMap[sid] ?? false;
                const isCurrent = activeSlot.currentStage === sid && !activeSlot.isComplete;
                const Icon      = STAGE_ICONS[sid] ?? BookOpen;
                const isLast    = idx === activeSlot.stageOrder.length - 1;

                return (
                  <React.Fragment key={sid}>
                    <div className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                      isDone    && "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
                      isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/30 scale-110",
                      !isDone && !isCurrent && "bg-muted text-muted-foreground/30",
                    )}>
                      {isDone
                        ? <Check className="w-2.5 h-2.5" />
                        : isCurrent
                        ? <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                        : <Icon className="w-2.5 h-2.5" />}
                    </div>
                    {!isLast && (
                      <div className={cn(
                        "w-3 h-px rounded-full",
                        isDone ? "bg-emerald-300 dark:bg-emerald-700" : "bg-border"
                      )} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {activeSlot.currentStage && !activeSlot.isComplete && (
              <span className="text-[10px] text-primary font-medium hidden sm:inline shrink-0">
                {activeSlot.stageMeta?.[activeSlot.currentStage]?.label}
              </span>
            )}
          </div>
        )}

        {/* Toggle */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          <span className="hidden sm:inline">{expanded ? "Hide" : `All ${slots.length} slots`}</span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5" />
            : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ── Expanded board ── */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 px-4 py-2 space-y-1 max-h-[60vh] overflow-y-auto">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 pb-1">
            <div className="w-16 shrink-0" />
            <div className="flex items-center gap-0 flex-1 min-w-0">
              {data.stageOrder.map((sid, idx) => {
                const isLast = idx === data.stageOrder.length - 1;
                return (
                  <React.Fragment key={sid}>
                    <span className="w-6 text-center text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-wider truncate shrink-0">
                      {(data.stageMeta?.[sid]?.label ?? sid).slice(0, 3)}
                    </span>
                    {!isLast && <div className="flex-1 min-w-[8px] max-w-[24px]" />}
                  </React.Fragment>
                );
              })}
            </div>
            <div className="w-16 shrink-0" />
          </div>

          {/* Slot rows */}
          {slots.map((slot, idx) => (
            <SlotRow
              key={slot.slotIndex}
              slot={slot}
              isActive={idx === activeSlotIdx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
