// steps/CoverStep.tsx
import React, { useEffect, useState } from "react";
import {
  BookMarked, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2,
  Loader2, ImageIcon, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CoverSideNode, ImageVariant, normArr } from "@/lib/api/reviewTypes";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import type { KnowledgeBase } from "@/lib/api/types";

// ─── KB Cover Instructions Panel ─────────────────────────────────────────────

// Returns a short, human-readable description of what the KB says about cover design.
// This is shown as reference — NOT sent to the AI as customPrompt.
function buildKbSummaryLines(kb: KnowledgeBase, side: "front" | "back"): string[] {
  const cd = kb.coverDesign;
  if (!cd) return [];
  const lines: string[] = [];
  if (cd.characterComposition?.length)
    lines.push(`Composition: ${cd.characterComposition.join(". ")}`);
  if (cd.islamicMotifs?.length)
    lines.push(`Islamic motifs: ${cd.islamicMotifs.join(", ")}`);
  if (cd.avoidCover?.length)
    lines.push(`Avoid: ${cd.avoidCover.join(", ")}`);
  if (side === "front" && cd.extraNotes)
    lines.push(cd.extraNotes);
  return lines;
}

interface KbInstructionsPanelProps {
  kb: KnowledgeBase;
}

function KbInstructionsPanel({ kb }: KbInstructionsPanelProps) {
  const [open, setOpen] = useState(true); // open by default so user sees it
  const cd = kb.coverDesign;

  const hasContent =
    cd &&
    (cd.islamicMotifs?.length ||
      cd.avoidCover?.length ||
      cd.characterComposition?.length ||
      cd.extraNotes ||
      cd.brandingRules?.length ||
      cd.titlePlacement);

  if (!hasContent) return null;

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Info className="w-3.5 h-3.5" />
          Knowledge Base — Cover Instructions
        </div>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-blue-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
        )}
      </button>
      {open && cd && (
        <div className="px-4 pb-3 space-y-2 border-t border-blue-200 dark:border-blue-800 pt-2">
          {cd.characterComposition?.length ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Character composition:</span>{" "}
              {cd.characterComposition.join(", ")}
            </p>
          ) : null}
          {cd.islamicMotifs?.length ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Islamic motifs:</span>{" "}
              {cd.islamicMotifs.join(", ")}
            </p>
          ) : null}
          {cd.avoidCover?.length ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-red-600">Avoid:</span>{" "}
              {cd.avoidCover.join(", ")}
            </p>
          ) : null}
          {cd.titlePlacement ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Title placement:</span> {cd.titlePlacement}
            </p>
          ) : null}
          {cd.brandingRules?.length ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Branding:</span>{" "}
              {cd.brandingRules.join(", ")}
            </p>
          ) : null}
          {cd.extraNotes ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Notes:</span> {cd.extraNotes}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Cover side card ──────────────────────────────────────────────────────────

interface CoverSideCardProps {
  side: "front" | "back";
  node: CoverSideNode | undefined;
  loadingKey: string | null;
  kb: KnowledgeBase | null;
  onGenerate: (side: "front" | "back", prompt?: string) => void;
  onSelect: (side: "front" | "back", idx: number) => void;
  onApprove: (side: "front" | "back") => void;
}

function CoverSideCard({
  side, node, loadingKey, kb, onGenerate, onSelect, onApprove,
}: CoverSideCardProps) {
  // User-editable additional scene notes (NOT the full auto-built system prompt)
  // Leave empty → backend auto-builds using KB + character DNA (recommended)
  // Type something → sent as customPrompt override (bypasses auto-build)
  const [userNotes, setUserNotes] = useState("");

  const isGenerating = loadingKey === `cover-${side}`;
  const isApproving  = loadingKey === `cover-approve-${side}`;
  const approved     = node?.status === "approved";
  const variants     = normArr<ImageVariant>(node?.current?.variants);
  const selected     = node?.current?.selectedVariantIndex ?? 0;

  // Only send as customPrompt if user actually typed something custom
  const promptToSend = userNotes.trim() || undefined;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden",
      approved ? "border-emerald-300 dark:border-emerald-700" : "border-border",
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
            onClick={() => onGenerate(side, promptToSend)}
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

      {/* KB Guidelines — read-only reference */}
      {kb && (() => {
        const lines = buildKbSummaryLines(kb, side);
        if (!lines.length) return null;
        return (
          <div className="px-4 py-2.5 border-b border-border bg-blue-50/40 dark:bg-blue-950/10 space-y-1">
            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              KB Cover Guidelines (auto-applied)
            </p>
            {lines.map((line, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">• {line}</p>
            ))}
          </div>
        );
      })()}

      {/* Additional scene notes */}
      <div className="px-4 py-3 border-b border-border space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Additional Scene Notes
          <span className="ml-1 font-normal normal-case text-muted-foreground/60">(optional)</span>
        </Label>
        <Textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Show Musa and Dad walking at sunset, mosque in background…"
          className="text-xs resize-none"
        />
        <p className="text-[10px] text-muted-foreground">
          {userNotes.trim()
            ? "Your notes will be sent as a custom prompt — KB guidelines and character data will still apply."
            : "Leave empty — AI will auto-generate using KB guidelines + character data."}
        </p>
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
                disabled={approved}
                className={cn(
                  "rounded-xl overflow-hidden border-2 transition-all",
                  selected === vi
                    ? "border-primary ring-2 ring-primary/25 shadow-md"
                    : "border-transparent hover:border-primary/30",
                  approved && "cursor-default",
                )}
              >
                <img src={v.imageUrl} alt={`Variant ${vi + 1}`} className="w-full aspect-square object-cover" />
                <div className={cn(
                  "py-1.5 text-center text-xs font-semibold",
                  selected === vi ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
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

// ─── CoverStep ────────────────────────────────────────────────────────────────

interface CoverStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

export function CoverStep({ bb, onBack, onContinue }: CoverStepProps) {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [kbLoading, setKbLoading] = useState(false);

  useEffect(() => {
    if (!bb.coverReview) bb.loadCover();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch KB cover instructions
  useEffect(() => {
    if (!bb.knowledgeBaseId) return;
    setKbLoading(true);
    knowledgeBasesApi.get(bb.knowledgeBaseId)
      .then(setKb)
      .catch(() => {/* silently ignore — KB is optional */})
      .finally(() => setKbLoading(false));
  }, [bb.knowledgeBaseId]);

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
              Generate front and back covers. Prompts are pre-filled from your Knowledge Base.
            </p>
          </div>
          {kbLoading && (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>
        {/* KB instructions summary (expandable) */}
        {kb && (
          <div className="mt-4">
            <KbInstructionsPanel kb={kb} />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {(["front", "back"] as const).map((side) => (
          <CoverSideCard
            key={side}
            side={side}
            node={bb.coverReview?.[side]}
            loadingKey={bb.loadingKey}
            kb={kb}
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
        <Button onClick={onContinue}>
          Continue to Editor
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
