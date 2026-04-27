// steps/CoverStep.tsx
import React, { useEffect, useState } from "react";
import {
  BookMarked, ArrowLeft, ArrowRight, RefreshCw, CheckCircle2,
  Loader2, ImageIcon, ChevronDown, ChevronUp, Info,
  Eye, EyeOff, Sparkles, BookOpen, X, Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CoverSideNode } from "@/lib/api/reviewTypes";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import type { KnowledgeBase } from "@/lib/api/types";
import { BookPreviewToggle } from "@/components/book/BookPreviewToggle";
import type { CoverSide } from "@/types/cover.types";

// ─── KB Instructions Panel ────────────────────────────────────────────────────

function KbInstructionsPanel({ kb }: { kb: KnowledgeBase }) {
  const [open, setOpen] = useState(false);
  const cd = kb.coverDesign;
  if (!cd) return null;

  const pills = [
    cd.selectedCoverTemplate && `Template: ${cd.selectedCoverTemplate}`,
    cd.colorStyle && `Palette: ${cd.colorStyle}`,
    cd.moodTheme  && `Mood: ${cd.moodTheme}`,
    cd.lightingEffects && `Lighting: ${cd.lightingEffects}`,
    cd.islamicMotifs?.length  && `Motifs: ${cd.islamicMotifs.slice(0, 2).join(", ")}`,
    cd.avoidCover?.length     && `Avoid: ${cd.avoidCover.slice(0, 2).join(", ")}`,
  ].filter(Boolean) as string[];

  if (!pills.length && !cd.characterComposition?.length && !cd.extraNotes) return null;

  return (
    <div className="rounded-xl border border-blue-200/60 dark:border-blue-800/40 bg-blue-50/40 dark:bg-blue-950/15 overflow-hidden">
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
          <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Knowledge Base — Cover Instructions</p>
          {!open && pills.length > 0 && (
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70 truncate mt-0.5">
              {pills.slice(0, 3).join(" · ")}
            </p>
          )}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-blue-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-2.5 border-t border-blue-200/40 dark:border-blue-800/30">
          {pills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pills.map((p, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {p}
                </span>
              ))}
            </div>
          )}
          {cd.characterComposition?.length ? (
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold">Character composition:</span>{" "}
              {cd.characterComposition.join(" · ")}
            </p>
          ) : null}
          {cd.titlePlacement ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Title placement:</span> {cd.titlePlacement}
            </p>
          ) : null}
          {cd.extraNotes ? (
            <p className="text-xs text-muted-foreground italic border-l-2 border-blue-200 dark:border-blue-700 pl-2.5">
              {cd.extraNotes}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Full-screen Book Preview Modal ──────────────────────────────────────────

interface PreviewModalProps {
  open: boolean;
  onClose: () => void;
  frontUrl: string | null;
  spineUrl: string | null;
  backUrl: string | null;
  spineWidth: number;
}

function PreviewModal({ open, onClose, frontUrl, spineUrl, backUrl, spineWidth }: PreviewModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/98 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <BookMarked className="w-5 h-5 text-white/70" />
          <span className="text-white font-semibold">Book Preview</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close preview"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Preview content — centered, scrollable */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <BookPreviewToggle
            frontUrl={frontUrl}
            spineUrl={spineUrl}
            backUrl={backUrl}
            spineWidth={spineWidth}
            defaultMode="flat"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Single large cover image display ────────────────────────────────────────

interface CoverImageProps {
  url: string | null;
  isGenerating: boolean;
  isSpine: boolean;
  label: string;
}

function CoverImage({ url, isGenerating, isSpine, label }: CoverImageProps) {
  // Spine is displayed as a narrow centered vertical strip, not a wide horizontal bar.
  // Covers use full-card width with 2:3 aspect ratio.
  if (isSpine) {
    return (
      <div className="flex items-center justify-center gap-6 py-2">
        {/* Narrow vertical strip — mirrors real spine proportions */}
        <div className="w-20 h-52 rounded-lg overflow-hidden shadow-lg border border-border/30 flex-shrink-0 relative">
          {isGenerating ? (
            <div className="w-full h-full bg-muted/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
            </div>
          ) : url ? (
            <img src={url} alt={label} className="w-full h-full object-cover" draggable={false} />
          ) : (
            <div className="w-full h-full bg-muted/10 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-5 h-5 text-muted-foreground/25" />
            </div>
          )}
        </div>
        <div className="text-left">
          {isGenerating ? (
            <p className="text-xs text-muted-foreground/60">Generating spine…</p>
          ) : url ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground/70">Spine generated</p>
              <p className="text-[10px] text-muted-foreground/45 max-w-[180px]">
                Narrow vertical strip shown at scale. In print this wraps between front and back covers.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground/50">Not yet generated</p>
              <p className="text-[10px] text-muted-foreground/35 max-w-[180px]">
                Optional — generates a color + typography strip for the book's spine.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="w-full aspect-[2/3] bg-muted/20 border border-dashed border-border/50 rounded-xl flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        <p className="text-xs text-muted-foreground/60">Generating {label}…</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="w-full aspect-[2/3] bg-muted/10 border border-dashed border-border/40 rounded-xl flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
        </div>
        <div className="text-center px-4">
          <p className="text-xs font-medium text-muted-foreground/50">Not yet generated</p>
          <p className="text-[10px] text-muted-foreground/35 mt-0.5">Click Generate below</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-[2/3] rounded-xl overflow-hidden shadow-xl">
      <img
        src={url}
        alt={label}
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  );
}

// ─── Cover side card ──────────────────────────────────────────────────────────

interface CoverSideCardProps {
  side: CoverSide;
  node: CoverSideNode | undefined;
  loadingKey: string | null;
  previewMode: boolean;
  onGenerate: (side: CoverSide, opts?: { prompt?: string; previewMode?: boolean }) => void;
  onApprove: (side: CoverSide) => void;
}

function CoverSideCard({ side, node, loadingKey, previewMode, onGenerate, onApprove }: CoverSideCardProps) {
  const [userNotes, setUserNotes] = useState("");

  const isGenerating = loadingKey === `cover-${side}`;
  const isApproving  = loadingKey === `cover-approve-${side}`;
  const approved     = node?.status === "approved";
  const generated    = node?.status === "generated" || node?.status === "edited";
  const isSpine      = side === "spine";

  // Primary display URL — current.imageUrl is the selected/active image
  const displayUrl = node?.current?.imageUrl || null;

  const labels: Record<CoverSide, string> = {
    front: "Front Cover",
    spine: "Spine",
    back:  "Back Cover",
  };
  const descriptions: Record<CoverSide, string> = {
    front: "Main book cover — characters, scene, and title zone",
    spine: "Narrow vertical strip — color and typography",
    back:  "Back cover — blurb zone and decorative background",
  };

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-all duration-300 bg-card",
      approved
        ? "border-emerald-300 dark:border-emerald-700 shadow-emerald-100/30 dark:shadow-emerald-950/20 shadow-lg"
        : "border-border",
    )}>
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/40 flex items-center gap-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
          approved ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-muted",
        )}>
          {approved
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            : <BookOpen className="w-4 h-4 text-muted-foreground" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{labels[side]}</h3>
            {approved && (
              <Badge className="text-[10px] h-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-0">
                Approved
              </Badge>
            )}
            {isSpine && !approved && (
              <Badge variant="outline" className="text-[10px] h-4">Optional</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{descriptions[side]}</p>
        </div>

        {/* Status indicator */}
        <div className={cn(
          "w-2 h-2 rounded-full flex-shrink-0",
          approved          ? "bg-emerald-500" :
          generated         ? "bg-primary" :
          isGenerating      ? "bg-amber-400 animate-pulse" :
          "bg-muted-foreground/25",
        )} />
      </div>

      {/* Optional scene notes (front/back only) */}
      {!isSpine && (
        <div className="px-5 pt-4 pb-3 border-b border-border/30 space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Scene Notes
            <span className="ml-1 font-normal normal-case opacity-60">(optional)</span>
          </Label>
          <Textarea
            value={userNotes}
            onChange={(e) => setUserNotes(e.target.value)}
            rows={2}
            placeholder={
              side === "front"
                ? "e.g. Show Musa and Dad walking at sunset, mosque in background…"
                : "e.g. Warm amber sky, continuation of front cover palette…"
            }
            className="text-xs resize-none border-border/60 focus:border-primary/40"
          />
          {userNotes.trim() && (
            <p className="text-[10px] text-muted-foreground/60">Custom notes will be sent alongside KB guidelines.</p>
          )}
        </div>
      )}

      {/* Image display */}
      <div className={cn("p-5", isSpine ? "" : "")}>
        <CoverImage
          url={displayUrl}
          isGenerating={isGenerating}
          isSpine={isSpine}
          label={labels[side]}
        />
      </div>

      {/* Action footer */}
      <div className="px-5 pb-5 flex items-center gap-2">
        <Button
          size="sm"
          variant={displayUrl ? "outline" : "default"}
          disabled={isGenerating || (approved && !displayUrl)}
          onClick={() => onGenerate(side, { prompt: userNotes.trim() || undefined, previewMode })}
          className="gap-1.5"
        >
          {isGenerating
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</>
            : displayUrl
              ? <><RefreshCw className="w-3.5 h-3.5" />{approved ? "Regenerate" : "Regenerate"}</>
              : <><Sparkles className="w-3.5 h-3.5" />Generate</>
          }
        </Button>

        {displayUrl && !approved && (
          <Button
            size="sm"
            disabled={isApproving}
            onClick={() => onApprove(side)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
          >
            {isApproving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <><CheckCircle2 className="w-3.5 h-3.5" />Approve</>
            }
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── CoverStep ────────────────────────────────────────────────────────────────

interface CoverSpreadPanelProps {
  frontUrl: string | null;
  spineUrl: string | null;
  backUrl: string | null;
  frontApproved: boolean;
  backApproved: boolean;
  spineApproved: boolean;
  spineWidth: number;
  previewMode: boolean;
  onPreviewModeChange: (value: boolean) => void;
}

function CoverSpreadPanel({
  frontUrl,
  spineUrl,
  backUrl,
  frontApproved,
  backApproved,
  spineApproved,
  spineWidth,
  previewMode,
  onPreviewModeChange,
}: CoverSpreadPanelProps) {
  const totalWidth = 12 + spineWidth;
  const spinePct = Math.max((spineWidth / totalWidth) * 100, 5.75);
  const coverPct = (100 - spinePct) / 2;

  const face = (side: "back" | "front", url: string | null, approved: boolean) => (
    <div className="relative h-full overflow-visible bg-[#f4c15b]" style={{ flex: `0 0 ${coverPct}%` }}>
      <div className="relative h-full overflow-hidden">
        {url ? (
          <img src={url} alt={`${side} cover`} className="h-full w-full object-cover" draggable={false} />
        ) : side === "front" ? (
          <div className="h-full w-full bg-gradient-to-b from-[#9bd5e2] via-[#f2bd58] to-[#cc8d26]">
            <div className="absolute left-[20%] right-[18%] top-[11%] h-[9%] rounded-full bg-white/80" />
            <div className="absolute left-[31%] right-[30%] top-[11%] rounded-lg border border-[#dacba9] bg-[#fbf0d2] px-2 py-2 text-center shadow-sm">
              <p className="text-lg font-bold leading-none text-[#9b5137]">Yusuf</p>
              <p className="text-lg font-bold leading-none text-[#9b5137]">Sky &</p>
              <p className="font-serif text-sm font-bold italic leading-none text-[#5e3323]">kufi</p>
            </div>
            <div className="absolute bottom-[12%] left-[33%] h-[40%] w-[25%] bg-gradient-to-b from-[#b8b3a3] to-[#8c6d42]" style={{ clipPath: "polygon(33% 0, 68% 0, 100% 32%, 82% 100%, 0 100%, 18% 32%)" }} />
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-b from-[#7b5518] via-[#edb043] to-[#f4c044]">
            <div className="absolute left-[22%] right-[22%] top-[17%] h-[38%] rounded-t-full border-2 border-white/45 bg-white/10" />
            <div className="absolute bottom-[17%] left-[14%] right-[14%] rounded border border-white/35 px-4 py-5 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">Blurb Zone</div>
            <div className="absolute left-[16%] right-[16%] top-[9%] flex justify-between text-white/65">
              {Array.from({ length: 6 }).map((_, i) => <span key={i}>•</span>)}
            </div>
          </div>
        )}
        <div className="absolute inset-[5%] border border-dashed border-emerald-500/75" />
        <div className="absolute inset-0 border border-dashed border-red-400/80" />
        {approved && <div className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Approved</div>}
      </div>
      <div className="absolute -bottom-7 left-0 right-0 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
        {side === "back" ? "Back Cover" : "Front Cover"}
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="grid gap-3 border-b border-border bg-card px-4 py-3 text-xs text-muted-foreground lg:grid-cols-[repeat(5,minmax(0,1fr))]">
        <div><span className="block text-[10px] uppercase tracking-wider">Trim size</span><span className="font-bold text-foreground">6.0&quot; x 9.0&quot;</span></div>
        <div><span className="block text-[10px] uppercase tracking-wider">Spine</span><span className="font-bold text-foreground">{spineWidth.toFixed(2)}&quot;</span></div>
        <div><span className="block text-[10px] uppercase tracking-wider">Bleed</span><span className="font-bold text-foreground">0.125&quot;</span></div>
        <div><span className="block text-[10px] uppercase tracking-wider">Resolution</span><span className="font-bold text-foreground">300 DPI</span></div>
        <label className="flex items-center justify-start gap-2 lg:justify-end">
          <Switch checked={previewMode} onCheckedChange={onPreviewModeChange} />
          <span className="font-medium text-foreground">Preview mode</span>
        </label>
      </div>
      <div className="overflow-auto px-7 pb-12 pt-8" style={{ backgroundColor: "#efe3c7", backgroundImage: "linear-gradient(rgba(124,96,46,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(124,96,46,.12) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
        <div className="mx-auto min-w-[720px] max-w-[820px]">
          <div className="mb-2 grid grid-cols-12 text-[10px] text-muted-foreground/70">
            {Array.from({ length: 12 }).map((_, i) => <span key={i}>{i + 1}&quot;</span>)}
          </div>
          <div className="relative mx-auto flex aspect-[12.5/9] w-full border-2 border-orange-400 bg-background shadow-sm">
            {face("back", backUrl, backApproved)}
            <div className="relative h-full overflow-visible bg-[#b89055]" style={{ flex: `0 0 ${spinePct}%` }}>
              <div className="relative h-full overflow-hidden">
                {spineUrl ? <img src={spineUrl} alt="spine cover" className="h-full w-full object-cover" draggable={false} /> : <div className="h-full w-full bg-gradient-to-b from-[#cfb382] to-[#9b763e]" />}
                <div className="absolute inset-x-[22%] inset-y-[6%] border border-dashed border-emerald-600/70" />
                <div className="absolute inset-0 border border-dashed border-red-400/80" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-widest text-[#5d4122]" style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>Bismillah in Kufi</div>
                {spineApproved && <CheckCircle2 className="absolute bottom-3 left-1/2 h-4 w-4 -translate-x-1/2 text-emerald-600" />}
              </div>
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">Spine</div>
            </div>
            {face("front", frontUrl, frontApproved)}
          </div>
        </div>
      </div>
    </div>
  );
}

interface CoverControlCardProps {
  side: CoverSide;
  node: CoverSideNode | undefined;
  loadingKey: string | null;
  previewMode: boolean;
  frontApproved?: boolean;
  onGenerate: (side: CoverSide, opts?: { prompt?: string; previewMode?: boolean }) => void;
  onApprove: (side: CoverSide) => void;
}

function CoverControlCard({ side, node, loadingKey, previewMode, frontApproved, onGenerate, onApprove }: CoverControlCardProps) {
  const [userNotes, setUserNotes] = useState("");
  const isGenerating = loadingKey === `cover-${side}`;
  const isApproving = loadingKey === `cover-approve-${side}`;
  const displayUrl = node?.current?.imageUrl || null;
  const approved = node?.status === "approved";
  const labels: Record<CoverSide, string> = { back: "Back Cover", spine: "Spine", front: "Front Cover" };
  const hints: Record<CoverSide, string> = { back: "Blurb zone + decorative", spine: "Title strip (optional)", front: "Characters + title scene" };
  const needsFrontFirst = side === "back" && !frontApproved;

  return (
    <div className={cn("rounded-lg border bg-card p-3 shadow-sm", approved ? "border-emerald-300" : "border-border")}>
      <div className="mb-2 flex items-center gap-2">
        {approved ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <BookOpen className="h-4 w-4 text-primary" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold">{labels[side]}</h3>{approved && <Badge className="h-5 border-0 bg-emerald-100 text-[10px] text-emerald-700">Approved</Badge>}{side === "spine" && !approved && <Badge variant="outline" className="h-5 text-[10px]">Optional</Badge>}</div>
          <p className="truncate text-xs text-muted-foreground">{hints[side]}</p>
        </div>
      </div>
      {needsFrontFirst && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
          <Info className="w-3 h-3 shrink-0" />Approve front cover first for best consistency
        </p>
      )}
      <Textarea value={userNotes} onChange={(e) => setUserNotes(e.target.value)} rows={1} placeholder={side === "spine" ? "Cream type on tan" : side === "front" ? "Musa and Dad, sunset mosque" : "Warm amber sky"} className="mb-2 min-h-[38px] resize-none text-xs" />
      <div className="flex items-center gap-2">
        <Button size="sm" variant={displayUrl ? "outline" : "default"} disabled={isGenerating} onClick={() => onGenerate(side, { prompt: userNotes.trim() || undefined, previewMode })} className="h-8 flex-1 gap-1.5 text-xs">
          {isGenerating ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Generating</> : <><RefreshCw className="h-3.5 w-3.5" />{displayUrl ? "Regen" : "Generate"}</>}
        </Button>
        {displayUrl && !approved && <Button size="sm" disabled={isApproving} onClick={() => onApprove(side)} className="h-8 gap-1.5 bg-emerald-700 text-xs text-white hover:bg-emerald-800">{isApproving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Approve</Button>}
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
  const [kb,           setKb]           = useState<KnowledgeBase | null>(null);
  const [kbLoading,    setKbLoading]    = useState(false);
  const [previewMode,  setPreviewMode]  = useState(false);
  const [showPreview,  setShowPreview]  = useState(false);

  useEffect(() => {
    if (!bb.coverReview) bb.loadCover();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!bb.knowledgeBaseId) return;
    setKbLoading(true);
    knowledgeBasesApi.get(bb.knowledgeBaseId)
      .then(setKb)
      .catch(() => {})
      .finally(() => setKbLoading(false));
  }, [bb.knowledgeBaseId]);

  const frontUrl = bb.coverReview?.front?.current?.imageUrl || null;
  const backUrl  = bb.coverReview?.back?.current?.imageUrl  || null;
  const spineUrl = bb.coverReview?.spine?.current?.imageUrl || null;

  const spineWidthInches = (() => {
    const raw = kb?.coverDesign?.spineWidth;
    if (!raw) return 0.5;
    const n = parseFloat(String(raw));
    return isNaN(n) ? 0.5 : n;
  })();

  const frontApproved = bb.coverReview?.front?.status === "approved";
  const backApproved  = bb.coverReview?.back?.status  === "approved";
  const spineApproved = bb.coverReview?.spine?.status === "approved";
  const canContinue   = frontApproved && backApproved;
  const anyGenerated  = Boolean(frontUrl || spineUrl || backUrl);
  const approvedCount = [frontApproved, spineApproved, backApproved].filter(Boolean).length;

  const statusDot = (side: "front" | "spine" | "back") => {
    const s = bb.coverReview?.[side]?.status ?? "draft";
    return (
      <div key={side} className="flex items-center gap-1.5">
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          s === "approved"                         ? "bg-emerald-500" :
          s === "generated" || s === "edited"      ? "bg-primary" :
          "bg-muted-foreground/25",
        )} />
        <span className="text-[10px] text-muted-foreground capitalize">{side}</span>
      </div>
    );
  };

  return (
    <div className="space-y-5 w-full">
      <div className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Book Builder</p>
          <h2 className="text-3xl font-bold tracking-tight">Cover Design</h2>
          <p className="text-sm text-muted-foreground">Full wrap spread: back, spine, and front laid out together for print.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {kbLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Badge className="h-9 rounded-full border-0 bg-emerald-100 px-4 text-emerald-700">{approvedCount} / 3 approved</Badge>
          {anyGenerated && <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2"><Maximize2 className="w-4 h-4" />Preview Book</Button>}
          <Button onClick={onContinue} disabled={!canContinue} className="gap-2 bg-[#083f36] hover:bg-[#0a4d42]">
            Continue to Editor
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {kb && <KbInstructionsPanel kb={kb} />}

      <CoverSpreadPanel
        frontUrl={frontUrl}
        spineUrl={spineUrl}
        backUrl={backUrl}
        frontApproved={frontApproved}
        backApproved={backApproved}
        spineApproved={spineApproved}
        spineWidth={spineWidthInches}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
      />

      {/* T-17: Sequential workflow guidance */}
      <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground mb-1">Recommended order</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded-full font-medium", frontApproved ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary")}>1. Front Cover</span>
          <span className="text-muted-foreground/40">→</span>
          <span className={cn("px-2 py-0.5 rounded-full font-medium", backApproved ? "bg-emerald-100 text-emerald-700" : frontApproved ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60")}>2. Back Cover</span>
          <span className="text-muted-foreground/40">→</span>
          <span className={cn("px-2 py-0.5 rounded-full font-medium", spineApproved ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground/60")}>3. Spine (optional)</span>
          {!frontApproved && <span className="ml-1 opacity-60">— approve front first for best back cover consistency</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {(["front", "back", "spine"] as const).map((side) => (
          <CoverControlCard
            key={side}
            side={side}
            node={bb.coverReview?.[side]}
            loadingKey={bb.loadingKey}
            previewMode={previewMode}
            frontApproved={frontApproved}
            onGenerate={(s, opts) => bb.regenerateCover(s, opts)}
            onApprove={bb.approveCover}
          />
        ))}
      </div>

      {/* ── Header ── */}
      <div className="hidden rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold">Cover Design</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Generate front, spine, and back covers. AI uses your Knowledge Base settings automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {kbLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {anyGenerated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="gap-1.5 text-xs"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Preview Book
              </Button>
            )}
          </div>
        </div>

        {/* Progress + status */}
        <div className="px-6 pb-4 flex items-center gap-3">
          {(["front", "spine", "back"] as const).map((s, i) => (
            <React.Fragment key={s}>
              {statusDot(s)}
              {i < 2 && <span className="text-muted-foreground/30 text-xs">·</span>}
            </React.Fragment>
          ))}
          <div className="ml-auto">
            {canContinue
              ? <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">✓ Ready to continue</span>
              : <span className="text-[11px] text-muted-foreground/60">Approve front + back to continue</span>
            }
          </div>
        </div>

        {/* KB panel */}
        {kb && (
          <div className="px-6 pb-5">
            <KbInstructionsPanel kb={kb} />
          </div>
        )}
      </div>

      {/* ── Preview mode toggle ── */}
      <div className="hidden items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {previewMode
            ? <Eye className="w-4 h-4 text-primary flex-shrink-0" />
            : <EyeOff className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          }
          <div>
            <p className="text-sm font-medium">Preview Mode</p>
            <p className="text-xs text-muted-foreground">
              {previewMode
                ? "AI renders title + author text directly on the cover image."
                : "Artwork only — clean zones for post-production text overlay."}
            </p>
          </div>
        </div>
        <Switch checked={previewMode} onCheckedChange={setPreviewMode} />
      </div>

      {/* ── Front + Back: full-width 2-column ── */}
      <div className="hidden grid-cols-1 md:grid-cols-2 gap-5">
        {(["front", "back"] as const).map((side) => (
          <CoverSideCard
            key={side}
            side={side}
            node={bb.coverReview?.[side]}
            loadingKey={bb.loadingKey}
            previewMode={previewMode}
            onGenerate={(s, opts) => bb.regenerateCover(s, opts)}
            onApprove={bb.approveCover}
          />
        ))}
      </div>

      {/* ── Spine: full-width compact card ── */}
      <div className="hidden">
        <CoverSideCard
          side="spine"
          node={bb.coverReview?.spine}
          loadingKey={bb.loadingKey}
          previewMode={previewMode}
          onGenerate={(s, opts) => bb.regenerateCover(s, opts)}
          onApprove={bb.approveCover}
        />
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-1">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
        <div className="flex items-center gap-3">
          {anyGenerated && (
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
              <Maximize2 className="w-4 h-4" />Preview Book
            </Button>
          )}
          <Button
            onClick={onContinue}
            disabled={!canContinue}
            className="gap-2"
          >
            Continue to Editor
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {!canContinue && (
        <p className="text-xs text-muted-foreground/60 text-center -mt-3">
          Approve the front and back covers to unlock the editor.
        </p>
      )}

      {/* ── Full-screen preview modal ── */}
      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        frontUrl={frontUrl}
        spineUrl={spineUrl}
        backUrl={backUrl}
        spineWidth={spineWidthInches}
      />
    </div>
  );
}
