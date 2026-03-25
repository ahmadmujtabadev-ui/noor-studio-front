// components/VariantGrid.tsx
// Reusable grid for viewing, selecting, and approving image variants

import React from "react";
import { RefreshCw, CheckCircle2, Loader2, ImageIcon, Edit3, Badge } from "lucide-react";
import { Button
 } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";
interface VariantSlot {
  key: string;
  label: string;
  subtitle?: string;
  status: any;
  variants: any[];
  selectedVariantIndex: number;
  prompt?: string;
  illustrationHint?: string;
}

interface VariantGridProps {
  slots: VariantSlot[];
  loadingKey: string | null;
  onGenerate: (key: string, prompt?: string) => void;
  onSelect:   (key: string, variantIndex: number) => void;
  onApprove:  (key: string) => void;
  onPromptEdit?: (key: string, prompt: string) => void;
}

export function VariantGrid({
  slots, loadingKey, onGenerate, onSelect, onApprove, onPromptEdit,
}: VariantGridProps) {
  const [editingPrompt, setEditingPrompt] = React.useState<Record<string, string>>({});
  const [showPrompt,    setShowPrompt]    = React.useState<Record<string, boolean>>({});

  return (
    <div className="space-y-4">
      {slots.map((slot) => {
        const isLoading   = loadingKey === `ill-${slot.key}` || loadingKey === `cover-${slot.key}`;
        const isApproving = loadingKey === `ill-approve-${slot.key}` || loadingKey === `cover-approve-${slot.key}`;
        const approved    = slot.status === "approved";
        const hasVariants = slot.variants.length > 0;
        const localPrompt = editingPrompt[slot.key] ?? slot.prompt ?? "";
        const promptOpen  = showPrompt[slot.key] ?? false;

        return (
          <div
            key={slot.key}
            className={cn(
              "rounded-2xl border overflow-hidden transition-all duration-200",
              approved ? "border-emerald-300 dark:border-emerald-700" : "border-border",
            )}
          >
            {/* Card header */}
            <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono font-bold text-primary shrink-0">{slot.label}</span>
                {slot.subtitle && (
                  <span className="text-xs text-muted-foreground truncate">{slot.subtitle}</span>
                )}
                {approved && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
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
                  onClick={() => setShowPrompt((p) => ({ ...p, [slot.key]: !p[slot.key] }))}
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Prompt
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs"
                  disabled={isLoading}
                  onClick={() => onGenerate(slot.key, localPrompt !== slot.prompt ? localPrompt : undefined)}
                >
                  {isLoading ? (
                    <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating</>
                  ) : (
                    <><RefreshCw className="w-3 h-3 mr-1" />{hasVariants ? "Regenerate" : "Generate"}</>
                  )}
                </Button>

                {hasVariants && !approved && (
                  <Button
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    disabled={isApproving}
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

            {/* Prompt editor */}
            {promptOpen && (
              <div className="px-4 py-3 border-b border-border bg-muted/20">
                <Textarea
                  value={localPrompt}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEditingPrompt((p) => ({ ...p, [slot.key]: v }));
                    onPromptEdit?.(slot.key, v);
                  }}
                  rows={3}
                  placeholder="Override illustration prompt…"
                  className="font-mono text-xs resize-none"
                />
              </div>
            )}

            {/* Source hint */}
            {slot.illustrationHint && (
              <div className="px-4 py-2 border-b border-border bg-muted/20">
                <p className="text-xs text-muted-foreground italic">{slot.illustrationHint}</p>
              </div>
            )}

            {/* Variant grid */}
            <div className="p-4">
              {!hasVariants ? (
                <div className="grid grid-cols-2 gap-3">
                  {isLoading
                    ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square rounded-xl" />)
                    : (
                      <div className="col-span-2 py-10 flex flex-col items-center gap-2 text-muted-foreground/40">
                        <ImageIcon className="w-8 h-8" />
                        <span className="text-sm">No variants yet — click Generate</span>
                      </div>
                    )
                  }
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {slot.variants.map((v, vi) => {
                    const isSelected = slot.selectedVariantIndex === vi;
                    return (
                      <button
                        key={vi}
                        onClick={() => onSelect(slot.key, vi)}
                        className={cn(
                          "group rounded-xl overflow-hidden border-2 transition-all duration-150 focus:outline-none",
                          isSelected
                            ? "border-primary ring-2 ring-primary/25 shadow-md"
                            : "border-transparent hover:border-primary/40",
                        )}
                      >
                        <img
                          src={v.imageUrl}
                          alt={`Variant ${vi + 1}`}
                          className="w-full aspect-square object-cover"
                        />
                        <div className={cn(
                          "py-1.5 text-center text-xs font-semibold transition-colors",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80",
                        )}>
                          {isSelected ? "Selected" : `Variant ${vi + 1}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Helper to map IllustrationNode[] → VariantSlot[]
export function illNodestoSlots(nodes: any[]): VariantSlot[] {
  return nodes.map((n) => ({
    key:                  n.key,
    label:                n.sourceType === "chapter-moment"
                            ? `Ch ${n.chapterIndex + 1} · Img ${n.spreadIndex + 1}`
                            : `Page ${n.spreadIndex + 1}`,
    subtitle:             n.current.momentTitle || n.current.illustrationHint?.slice(0, 60),
    status:               n.status,
    variants:             n.current.variants ?? [],
    selectedVariantIndex: n.current.selectedVariantIndex ?? 0,
    prompt:               n.current.prompt,
    illustrationHint:     n.current.illustrationHint,
  }));
}