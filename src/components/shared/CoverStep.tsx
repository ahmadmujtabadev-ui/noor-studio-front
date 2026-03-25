// steps/CoverStep.tsx
import React, { useEffect } from "react";
import { BookMarked, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CoverSideNode, ImageVariant, normArr } from "@/lib/api/reviewTypes";
import { BookBuilderHook } from "@/hooks/useBookBuilder";


interface CoverSideCardProps {
  side: "front" | "back";
  node: CoverSideNode  | undefined;
  loadingKey: string | null;
  onGenerate: (side: "front" | "back", prompt?: string) => void;
  onSelect:   (side: "front" | "back", idx: number) => void;
  onApprove:  (side: "front" | "back") => void;
}

function CoverSideCard({ side, node, loadingKey, onGenerate, onSelect, onApprove }: CoverSideCardProps) {
  const [localPrompt, setLocalPrompt] = React.useState(node?.current?.prompt ?? "");
  const isGenerating = loadingKey === `cover-${side}`;
  const isApproving  = loadingKey === `cover-approve-${side}`;
  const approved     = node?.status === "approved";
  const variants     = normArr<ImageVariant>(node?.current?.variants);
  const selected     = node?.current?.selectedVariantIndex ?? 0;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden",
      approved ? "border-emerald-300 dark:border-emerald-700" : "border-border"
    )}>
      {/* Header */}
      <div className="px-4 py-3 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold capitalize">{side} Cover</span>
          {approved && (
            <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Approved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isGenerating}
            onClick={() => onGenerate(side, localPrompt !== node?.current?.prompt ? localPrompt : undefined)}
          >
            {isGenerating
              ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Generating</>
              : <><RefreshCw className="w-3 h-3 mr-1" />{variants.length ? "Regenerate" : "Generate"}</>
            }
          </Button>
          {variants.length > 0 && !approved && (
            <Button size="sm" disabled={isApproving} onClick={() => onApprove(side)}>
              {isApproving
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <><CheckCircle2 className="w-3 h-3 mr-1" />Approve</>
              }
            </Button>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="px-4 py-3 border-b border-border">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prompt</Label>
        <Textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          rows={2}
          placeholder="Override cover generation prompt…"
          className="mt-1.5 font-mono text-xs resize-none"
        />
      </div>

      {/* Variants */}
      <div className="p-4">
        {variants.length === 0 ? (
          <div className="aspect-square max-w-xs mx-auto border border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground/40">
            {isGenerating
              ? <Loader2 className="w-8 h-8 animate-spin" />
              : <ImageIcon className="w-8 h-8" />
            }
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {variants.map((v, vi) => (
              <button
                key={vi}
                onClick={() => onSelect(side, vi)}
                className={cn(
                  "rounded-xl overflow-hidden border-2 transition-all",
                  selected === vi
                    ? "border-primary ring-2 ring-primary/25 shadow-md"
                    : "border-transparent hover:border-primary/30"
                )}
              >
                <img src={v.imageUrl} alt={`Variant ${vi + 1}`} className="w-full aspect-square object-cover" />
                <div className={cn(
                  "py-1.5 text-center text-xs font-semibold",
                  selected === vi ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {selected === vi ? "Selected" : `Variant ${vi + 1}`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface CoverStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

export function CoverStep({ bb, onBack, onContinue }: CoverStepProps) {
  useEffect(() => {
    if (!bb.coverReview) bb.loadCover();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Cover</h2>
            <p className="text-sm text-muted-foreground">
              Generate front and back covers — same flow as illustrations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(["front", "back"] as const).map((side) => (
          <CoverSideCard
            key={side}
            side={side}
            node={bb.coverReview?.[side]}
            loadingKey={bb.loadingKey}
            onGenerate={bb.regenerateCover}
            onSelect={bb.selectCoverVariant}
            onApprove={bb.approveCover}
          />
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button disabled={!bb.bothCoversApproved} onClick={onContinue}>
          Continue to Editor
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}