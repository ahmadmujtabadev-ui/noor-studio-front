// steps/IllustrationsStep.tsx
import React, { useEffect, useState } from "react";
import { Image as ImageIcon, ArrowLeft, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { illNodestoSlots, VariantGrid } from "./VarientGrid";


interface IllustrationsStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

export function IllustrationsStep({ bb, onBack, onContinue }: IllustrationsStepProps) {
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    await bb.loadIllustrations();
    setLoaded(true);
  };

  useEffect(() => {
    if (!loaded && bb.illustrationNodes.length === 0) {
      load();
    } else {
      setLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const slots   = illNodestoSlots(bb.illustrationNodes);
  const approved = bb.illustrationNodes.filter((n) => n.status === "approved").length;
  const total    = bb.illustrationNodes.length;

  const handlePromptEdit = async (key: string, prompt: string) => {
    // silently stored locally in VariantGrid — persisted on regenerate
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Illustrations</h2>
              <p className="text-sm text-muted-foreground">
                Review source text → edit prompt → generate 4 variants → pick best → approve.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {total > 0 && (
              <span className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{approved}</span>/{total} approved
              </span>
            )}
            <Button size="sm" variant="outline" disabled={bb.globalLoading} onClick={load}>
              {bb.globalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>

      {!loaded || bb.globalLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />Loading illustration slots…
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No illustration slots found. Make sure the previous steps are complete.</p>
        </div>
      ) : (
        <VariantGrid
          slots={slots}
          loadingKey={bb.loadingKey}
          onGenerate={(key, prompt) => bb.regenerateIllustration(key, { prompt, variantCount: 4 })}
          onSelect={bb.selectIllustrationVariant}
          onApprove={bb.approveIllustration}
          onPromptEdit={handlePromptEdit}
        />
      )}

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