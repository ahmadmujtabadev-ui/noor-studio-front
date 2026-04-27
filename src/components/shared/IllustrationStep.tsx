// IllustrationStep.tsx — Fixed: shows all chapters, generate all button, real-time save
import React, { useEffect, useState } from "react";
import {
  Image as ImageIcon, ArrowLeft, ArrowRight, Loader2,
  RefreshCw, Sparkles, CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { IllustrationCard, illNodestoSlots } from "./VarientGrid";

interface IllustrationsStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

export function IllustrationsStep({ bb, onBack, onContinue }: IllustrationsStepProps) {
  const [loaded, setLoaded] = useState(false);
  const [globalVariantCount, setGlobalVariantCount] = useState(1);

  const load = async () => {
    await bb.loadIllustrations();
    setLoaded(true);
  };

  // Load on mount; also re-load when returning to this step
  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slots    = illNodestoSlots(bb.illustrationNodes);
  const approved = bb.illustrationNodes.filter((n) => n.status === "approved").length;
  const total    = bb.illustrationNodes.length;
  const isGeneratingAll = bb.loadingKey === "generate-all-illustrations";

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Illustrations</h2>
              <p className="text-sm text-muted-foreground">
                Generate variants → select the best → approve. All approved images power your book.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {total > 0 && (
              <div className="flex items-center gap-2 text-sm">
                {total <= 10 ? (
                  <div className="flex gap-1">
                    {Array.from({ length: total }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          i < approved ? "bg-emerald-500" : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-28 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${Math.round((approved / total) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{Math.round((approved / total) * 100)}%</span>
                  </div>
                )}
                <span className="text-muted-foreground font-medium">
                  <span className="text-foreground font-bold">{approved}</span>/{total}
                </span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={bb.globalLoading || isGeneratingAll}
              onClick={load}
            >
              {bb.globalLoading && !isGeneratingAll
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <RefreshCw className="w-3 h-3" />
              }
            </Button>
          </div>
        </div>

        {/* Generate all controls */}
        {slots.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {/* Variant count selector for bulk generate */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-background p-0.5">
              <span className="px-1.5 text-[11px] text-muted-foreground font-medium">Variants:</span>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setGlobalVariantCount(n)}
                  disabled={bb.globalLoading || isGeneratingAll}
                  className={cn(
                    "w-6 h-6 rounded text-[11px] font-semibold transition-colors",
                    globalVariantCount === n
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                  title={`Generate ${n} variant${n > 1 ? "s" : ""} per illustration`}
                >
                  {n}
                </button>
              ))}
            </div>

            <Button
              variant={isGeneratingAll ? "default" : "outline"}
              size="sm"
              disabled={bb.globalLoading || isGeneratingAll}
              onClick={() => bb.generateAllIllustrations(false, globalVariantCount)}
            >
              {isGeneratingAll ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Generating all…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5 mr-2" />Generate All</>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={bb.globalLoading || isGeneratingAll}
              onClick={() => bb.generateAllIllustrations(true, globalVariantCount)}
              title="Regenerate all from scratch — use this after updating characters"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Regenerate All
            </Button>
            {bb.allIllusApproved && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-1.5">
                <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
                All approved
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {!loaded ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading illustration slots…
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <ImageIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="font-medium text-muted-foreground">No illustration slots found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Make sure structure and prose steps are complete, then click refresh.
          </p>
          <div className="flex items-center gap-2 justify-center mt-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-3 h-3 mr-1.5" />
              Back to Structure
            </Button>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {slots.map((slot) => (
            <IllustrationCard
              key={slot.key}
              slot={slot}
              loadingKey={bb.loadingKey}
              onGenerate={(key, prompt, variantCount) =>
                bb.regenerateIllustration(key, { prompt, variantCount: variantCount ?? 1 })
              }
              onSelect={(key, vi) => bb.selectIllustrationVariant(key, vi)}
              onApprove={(key) => bb.approveIllustration(key)}
              onSavePrompt={(key, body) => bb.saveIllustrationPrompt(key, body)}
            />
          ))}
        </div>
      )}

      {/* Footer nav */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button disabled={!bb.allIllusApproved} onClick={onContinue}>
          Continue to Cover
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
