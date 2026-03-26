// VarientGrid.tsx — Redesigned: big selected image + small variants row
// Illustration card per spread/moment

import React, { useState } from "react";
import {
  RefreshCw, CheckCircle2, Loader2, ImageIcon, Edit3, Check,
} from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface VariantSlot {
  key: string;
  label: string;
  subtitle?: string;
  status: string;
  variants: Array<{ imageUrl: string }>;
  selectedVariantIndex: number;
  prompt?: string;
  illustrationHint?: string;
}

interface IllustrationCardProps {
  slot: VariantSlot;
  loadingKey: string | null;
  onGenerate: (key: string, prompt?: string) => void;
  onSelect: (key: string, variantIndex: number) => void;
  onApprove: (key: string) => void;
}

// ─── Single illustration card ─────────────────────────────────────────────────

export function IllustrationCard({
  slot, loadingKey, onGenerate, onSelect, onApprove,
}: IllustrationCardProps) {
  const [localPrompt, setLocalPrompt] = useState(slot.prompt ?? "");
  const [promptOpen, setPromptOpen] = useState(false);
  // Optimistic local selected index — updates instantly on click, stays in sync with slot on reload
  const [localSelected, setLocalSelected] = useState(slot.selectedVariantIndex ?? 0);

  // Sync when slot data changes (e.g., after loadIllustrations)
  React.useEffect(() => {
    setLocalSelected(slot.selectedVariantIndex ?? 0);
  }, [slot.selectedVariantIndex]);

  const isGenerating = loadingKey === `ill-${slot.key}`;
  const isApproving  = loadingKey === `ill-approve-${slot.key}`;
  const approved     = slot.status === "approved";
  const hasVariants  = slot.variants.length > 0;

  const safeSelected    = Math.min(localSelected, Math.max(0, slot.variants.length - 1));
  const selectedVariant = hasVariants ? slot.variants[safeSelected] : null;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-200 bg-card",
      approved ? "border-emerald-400 dark:border-emerald-600 shadow-sm shadow-emerald-500/10" : "border-border",
    )}>
      {/* ── Card header ── */}
      <div className="px-5 py-3 bg-muted/30 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xs font-mono font-bold text-primary shrink-0">{slot.label}</span>
          {slot.subtitle && (
            <span className="text-xs text-muted-foreground truncate max-w-xs">{slot.subtitle}</span>
          )}
          {approved && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 text-[10px] gap-1">
              <Check className="w-2.5 h-2.5" />
              Approved
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Prompt toggle */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => setPromptOpen((p) => !p)}
          >
            <Edit3 className="w-3 h-3 mr-1" />
            Prompt
          </Button>

          {/* Generate */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            disabled={isGenerating || isApproving}
            onClick={() => onGenerate(slot.key, localPrompt !== slot.prompt ? localPrompt : undefined)}
          >
            {isGenerating ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating</>
            ) : (
              <><RefreshCw className="w-3 h-3 mr-1" />{hasVariants ? "Regenerate" : "Generate"}</>
            )}
          </Button>

          {/* Approve */}
          {hasVariants && !approved && (
            <Button
              size="sm"
              className="h-7 px-2.5 text-xs"
              disabled={isApproving || isGenerating}
              onClick={() => onApprove(slot.key)}
            >
              {isApproving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <><CheckCircle2 className="w-3 h-3 mr-1" />Approve</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Prompt editor ── */}
      {promptOpen && (
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <Textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            rows={3}
            placeholder="Override illustration prompt…"
            className="font-mono text-xs resize-none"
          />
        </div>
      )}

      {/* ── Illustration hint ── */}
      {slot.illustrationHint && (
        <div className="px-5 py-2 border-b border-border bg-muted/10">
          <p className="text-xs text-muted-foreground italic line-clamp-2">{slot.illustrationHint}</p>
        </div>
      )}

      {/* ── Image content ── */}
      <div className="p-5">
        {isGenerating && !hasVariants ? (
          /* Loading skeletons */
          <div className="space-y-3">
            <Skeleton className="w-full aspect-[4/3] rounded-xl" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="aspect-square rounded-lg" />
            </div>
          </div>
        ) : !hasVariants ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/40">
            <ImageIcon className="w-10 h-10" />
            <span className="text-sm">No variants yet — click Generate</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ── BIG selected image ── */}
            <div className="relative group">
              <div className={cn(
                "w-full overflow-hidden rounded-xl border-2 transition-all",
                approved
                  ? "border-emerald-400 dark:border-emerald-600"
                  : "border-primary/30",
              )}>
                <img
                  src={selectedVariant!.imageUrl}
                  alt="Selected illustration"
                  className="w-full object-cover"
                  style={{ aspectRatio: "4/3" }}
                />
              </div>

              {/* Selected label overlay */}
              <div className={cn(
                "absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-semibold",
                approved
                  ? "bg-emerald-500 text-white"
                  : "bg-primary text-primary-foreground",
              )}>
                {approved ? (
                  <span className="flex items-center gap-1"><Check className="w-3 h-3" />Approved</span>
                ) : (
                  "Selected"
                )}
              </div>
            </div>

            {/* ── Small variant thumbnails ── */}
            {slot.variants.length > 1 && (
              <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-2 uppercase tracking-wide">
                  Choose a variant
                </p>
                <div className={cn(
                  "grid gap-2",
                  slot.variants.length <= 3 ? "grid-cols-3" : "grid-cols-4",
                )}>
                  {slot.variants.map((v, vi) => {
                    const isSelected = safeSelected === vi;
                    return (
                      <button
                        key={vi}
                        onClick={() => {
                          if (approved) return;
                          setLocalSelected(vi);  // instant visual update
                          onSelect(slot.key, vi); // persist to server
                        }}
                        disabled={approved}
                        className={cn(
                          "group/thumb relative rounded-lg overflow-hidden border-2 transition-all duration-150 focus:outline-none",
                          "aspect-square",
                          isSelected
                            ? "border-primary ring-2 ring-primary/25 shadow-md scale-[1.02]"
                            : "border-transparent hover:border-primary/40",
                          approved && "cursor-default opacity-80",
                        )}
                        title={`Variant ${vi + 1}${isSelected ? " (selected)" : ""}`}
                      >
                        <img
                          src={v.imageUrl}
                          alt={`Variant ${vi + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className={cn(
                          "absolute bottom-0 inset-x-0 py-0.5 text-center text-[10px] font-semibold",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-black/50 text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity",
                        )}>
                          {isSelected ? "✓" : `V${vi + 1}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Legacy VariantGrid wrapper (kept for CoverStep compatibility) ─────────────

interface VariantGridProps {
  slots: VariantSlot[];
  loadingKey: string | null;
  onGenerate: (key: string, prompt?: string) => void;
  onSelect: (key: string, variantIndex: number) => void;
  onApprove: (key: string) => void;
  onPromptEdit?: (key: string, prompt: string) => void;
}

export function VariantGrid({
  slots, loadingKey, onGenerate, onSelect, onApprove,
}: VariantGridProps) {
  return (
    <div className="space-y-6">
      {slots.map((slot) => (
        <IllustrationCard
          key={slot.key}
          slot={slot}
          loadingKey={loadingKey}
          onGenerate={onGenerate}
          onSelect={onSelect}
          onApprove={onApprove}
        />
      ))}
    </div>
  );
}

// ─── Helper: IllustrationNode[] → VariantSlot[] ──────────────────────────────

export function illNodestoSlots(nodes: any[]): VariantSlot[] {
  return nodes.map((n) => {
    const rawVariants: Array<{ imageUrl: string }> = n.current.variants ?? [];
    // If no variants array but imageUrl exists, synthesize a single variant so the image displays
    const effectiveVariants = rawVariants.length === 0 && n.current.imageUrl
      ? [{ imageUrl: n.current.imageUrl }]
      : rawVariants;
    return {
      key:                  n.key,
      label:                n.sourceType === "chapter-moment"
                              ? `Ch ${n.chapterIndex + 1} · Img ${n.spreadIndex + 1}`
                              : `Page ${n.spreadIndex + 1}`,
      subtitle:             n.current.momentTitle || n.current.illustrationHint?.slice(0, 80),
      status:               n.status,
      variants:             effectiveVariants,
      selectedVariantIndex: n.current.selectedVariantIndex ?? 0,
      prompt:               n.current.prompt,
      illustrationHint:     n.current.illustrationHint,
    };
  });
}
