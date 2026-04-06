// src/components/book/BookPreviewFlat.tsx
// CSS-only flat book spread: [BACK | SPINE | FRONT]
// All three panels share a single aspect-ratio-constrained row so heights stay locked.

import React from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookPreviewProps } from "@/types/cover.types";

// ─── Individual panel ─────────────────────────────────────────────────────────

interface PanelProps {
  imageUrl: string | null;
  label: string;
  isSpine?: boolean;
  widthPct: number; // exact % of parent width — prevents intrinsic image blowout
}

function Panel({ imageUrl, label, isSpine = false, widthPct }: PanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden h-full",
        isSpine ? "bg-slate-600" : "bg-muted/40 dark:bg-muted/20",
      )}
      style={{ flex: `0 0 ${widthPct}%`, minWidth: 0 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={label}
          className={cn("w-full h-full", isSpine ? "object-contain object-center" : "object-cover")}
          draggable={false}
        />
      ) : (
        <div className={cn(
          "w-full h-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground/30 select-none",
          isSpine && "opacity-50",
        )}>
          {!isSpine && <ImageIcon className="w-7 h-7" />}
          {!isSpine && (
            <span className="text-[10px] text-center font-medium px-2">
              {label}<br />not generated
            </span>
          )}
        </div>
      )}

      {/* Label strip */}
      {!isSpine ? (
        <div className="absolute bottom-0 left-0 right-0 py-1 text-center text-[9px] font-medium uppercase tracking-widest bg-black/50 text-white/80 backdrop-blur-[2px]">
          {label}
        </div>
      ) : (
        // Spine label runs vertically
        <div
          className="absolute inset-0 flex items-center justify-center text-[7px] font-semibold uppercase tracking-widest text-white/60 select-none"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Spine
        </div>
      )}
    </div>
  );
}

// ─── BookPreviewFlat ──────────────────────────────────────────────────────────

export function BookPreviewFlat({
  frontUrl,
  spineUrl,
  backUrl,
  bookWidth  = 6,
  bookHeight = 9,
  spineWidth = 0.5,
  className  = "",
}: BookPreviewProps) {
  const totalW = bookWidth * 2 + spineWidth;

  // Real spine pct (e.g. 4% for 0.5" spine) — too narrow to render visually.
  // Boost to a minimum of 8% for the preview so the design is visible.
  const rawSpinePct = (spineWidth / totalW) * 100;
  const spinePct    = Math.max(rawSpinePct, 8);
  const coverPct    = (100 - spinePct) / 2;

  // Lock container height via aspect-ratio using REAL dimensions (not visual boost)
  const spreadAspect = `${totalW} / ${bookHeight}`;

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-border/50 bg-card", className)}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-border/50 bg-muted/30 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Full Wrap Preview
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {bookWidth}" × {bookHeight}" · {spineWidth}" spine
        </span>
      </div>

      {/* Spread — single row whose height is locked by aspect-ratio */}
      <div
        className="flex w-full"
        style={{ aspectRatio: spreadAspect }}
      >
        <Panel imageUrl={backUrl}  label="Back"  widthPct={coverPct} />
        <Panel imageUrl={spineUrl} label="Spine" widthPct={spinePct} isSpine />
        <Panel imageUrl={frontUrl} label="Front" widthPct={coverPct} />
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground/40 text-center">
        ← Back · Spine · Front → as laid flat for print
      </div>
    </div>
  );
}
