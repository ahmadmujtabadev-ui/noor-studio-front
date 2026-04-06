/**
 * SpreadView.tsx
 * Renders a two-page spread: [left page | spine shadow | right page]
 * Responsive — fills its container width while locking aspect ratio.
 * Uses SinglePage for each half; either side can be null → blank cream page.
 */

import React from "react";
import { cn } from "@/lib/utils";
import { SinglePage } from "./SinglePage";
import type { BookPage } from "@/hooks/useBookEditor";

// Page aspect ratio: 2:3 (portrait). Two pages side-by-side → 4:3 spread.
const SPREAD_ASPECT = "4 / 3";

interface SpreadViewProps {
  leftPage:  BookPage | null;
  rightPage: BookPage | null;
  bookTitle: string;
  /** 1-based page numbers for each side (for running headers / footers) */
  leftPageNum?:   number;
  rightPageNum?:  number;
  className?:     string;
  /** User's chosen layout — passed down to SinglePage */
  preferredLayout?: string;
}

export function SpreadView({
  leftPage,
  rightPage,
  bookTitle,
  leftPageNum     = 0,
  rightPageNum    = 0,
  className       = "",
  preferredLayout,
}: SpreadViewProps) {
  return (
    <div
      className={cn("w-full", className)}
      style={{ aspectRatio: SPREAD_ASPECT }}
    >
      {/* Outer shell: shadow + border radius */}
      <div className="relative w-full h-full flex rounded-lg overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.75),0_4px_24px_rgba(0,0,0,0.55)]">

        {/* ── Left page ────────────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {leftPage ? (
            <SinglePage
              page={leftPage}
              bookTitle={bookTitle}
              pageNum={leftPageNum}
              preferredLayout={preferredLayout}
              className="w-full h-full"
            />
          ) : (
            <BlankPage side="left" />
          )}
          {/* Left-page edge shadow */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(0,0,0,0.18))",
            }}
          />
        </div>

        {/* ── Spine shadow ─────────────────────────────────────────────────── */}
        <SpineShadow />

        {/* ── Right page ───────────────────────────────────────────────────── */}
        <div className="flex-1 relative overflow-hidden">
          {rightPage ? (
            <SinglePage
              page={rightPage}
              bookTitle={bookTitle}
              pageNum={rightPageNum}
              preferredLayout={preferredLayout}
              className="w-full h-full"
            />
          ) : (
            <BlankPage side="right" />
          )}
          {/* Right-page edge shadow */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-8"
            style={{
              background:
                "linear-gradient(to left, transparent, rgba(0,0,0,0.18))",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Spine shadow ─────────────────────────────────────────────────────────────

function SpineShadow() {
  return (
    <div
      className="relative z-10 shrink-0"
      style={{
        width: "18px",
        background:
          "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.07) 40%, rgba(0,0,0,0.07) 60%, rgba(0,0,0,0.35) 100%)",
        boxShadow: "inset -2px 0 6px rgba(0,0,0,0.2), inset 2px 0 6px rgba(0,0,0,0.2)",
      }}
    >
      {/* Center crease line */}
      <div
        className="absolute inset-y-0 left-1/2 -translate-x-px"
        style={{
          width: "1px",
          background:
            "linear-gradient(to bottom, transparent, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.25) 80%, transparent)",
        }}
      />
    </div>
  );
}

// ─── Blank page ───────────────────────────────────────────────────────────────

function BlankPage({ side }: { side: "left" | "right" }) {
  return (
    <div
      className="w-full h-full"
      style={{
        background:
          side === "left"
            ? "linear-gradient(to left, #F5F3EF, #FAF8F4)"
            : "linear-gradient(to right, #F5F3EF, #FAF8F4)",
      }}
    />
  );
}
