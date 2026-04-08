/**
 * BookRenderer.tsx
 * Full-screen publication-quality book preview.
 *
 * Layout:
 *   [toolbar: back | title | export]
 *   [spread view — scaled to fill remaining height]
 *   [thumbnail strip — horizontal scroll, all pages]
 *
 * Navigation: ← → keyboard, prev/next buttons, thumbnail click.
 * Spread grouping:
 *   Spread 0: [blank | front-cover]
 *   Spreads 1..N-1: pairs of middle pages [left | right]
 *   Last spread: [back-cover | blank]
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Download, ArrowLeft,
  Loader2, AlertCircle, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookEditor } from "@/hooks/useBookEditor";
import type { BookPage } from "@/hooks/useBookEditor";
import { SpreadView } from "./SpreadView";
import { SinglePage } from "./SinglePage";
import { exportBookEpub } from "@/lib/exportBookEpub";
import { exportBookPdf } from "@/lib/exportBookPdf";
import { useLayoutPreferenceStore } from "@/lib/store/layoutPreferenceStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─── Spread grouping ──────────────────────────────────────────────────────────

interface Spread {
  left:         BookPage | null;
  right:        BookPage | null;
  leftPageNum:  number;
  rightPageNum: number;
  /** Indices into the flat pages array, for thumbnail highlighting */
  leftIdx:      number | null;
  rightIdx:     number | null;
}

function buildSpreads(pages: BookPage[]): Spread[] {
  if (pages.length === 0) return [];

  const spreads: Spread[] = [];

  // Spread 0: blank left, front-cover right
  spreads.push({
    left:         null,
    right:        pages[0],
    leftPageNum:  0,
    rightPageNum: 0,
    leftIdx:      null,
    rightIdx:     0,
  });

  // Middle pages (indices 1 … length-2) paired two-by-two
  const middle = pages.slice(1, pages.length - 1);
  let runningNum = 1;
  for (let i = 0; i < middle.length; i += 2) {
    const lPage = middle[i];
    const rPage = middle[i + 1] ?? null;
    spreads.push({
      left:         lPage,
      right:        rPage,
      leftPageNum:  runningNum++,
      rightPageNum: rPage ? runningNum++ : 0,
      leftIdx:      i + 1,
      rightIdx:     rPage ? i + 2 : null,
    });
  }

  // Last spread: back-cover left, blank right (only if more than 1 page)
  if (pages.length > 1) {
    spreads.push({
      left:         pages[pages.length - 1],
      right:        null,
      leftPageNum:  0,
      rightPageNum: 0,
      leftIdx:      pages.length - 1,
      rightIdx:     null,
    });
  }

  return spreads;
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────

function PageThumb({
  page,
  index,
  isActive,
  onClick,
}: {
  page:     BookPage;
  index:    number;
  isActive: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative shrink-0 rounded overflow-hidden transition-all duration-150",
        "w-12 h-[72px] border-2",
        isActive
          ? "border-[#F5A623] shadow-[0_0_10px_rgba(245,166,35,0.5)] scale-105"
          : "border-white/10 hover:border-white/30 hover:scale-105",
      )}
      title={page.label}
    >
      {page.thumbnail ? (
        <img src={page.thumbnail} alt={page.label} className="w-full h-full object-cover" draggable={false} />
      ) : page.imageUrl ? (
        <img src={page.imageUrl} alt={page.label} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background:
              page.type === "text-page"
                ? "#FAFAF8"
                : page.type === "front-cover" || page.type === "back-cover"
                ? "#0d1117"
                : "#1B3B35",
          }}
        >
          <BookOpen className="w-4 h-4 text-white/20" />
        </div>
      )}

      {/* Page number badge */}
      <div className="absolute bottom-0 left-0 right-0 py-0.5 text-center text-[8px] font-medium bg-black/60 text-white/70 leading-none">
        {index + 1}
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BookRenderer() {
  const { toast } = useToast();
  const {
    projectId,
    projectTitle,
    isChapterBook,
    pages,
    loading,
    error,
    goBack,
  } = useBookEditor();

  const [spreadIdx,      setSpreadIdx]      = useState(0);
  const [exporting,      setExporting]      = useState(false);
  const [exportingEpub,  setExportingEpub]  = useState(false);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  // Layout preference chosen during book creation
  const { pictureLayout, chapterLayout } = useLayoutPreferenceStore();
  const preferredLayout = isChapterBook ? chapterLayout : pictureLayout;

  const spreads = useMemo(() => buildSpreads(pages), [pages]);

  const currentSpread = spreads[spreadIdx] ?? null;

  // ── Navigation ─────────────────────────────────────────────────────────────
  const canPrev = spreadIdx > 0;
  const canNext = spreadIdx < spreads.length - 1;

  const goPrev = useCallback(() => {
    if (canPrev) setSpreadIdx((i) => i - 1);
  }, [canPrev]);

  const goNext = useCallback(() => {
    if (canNext) setSpreadIdx((i) => i + 1);
  }, [canNext]);

  // Keyboard arrow navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowLeft")  goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Jump to spread containing page at `pageIdx`
  const jumpToPage = useCallback(
    (pageIdx: number) => {
      const si = spreads.findIndex(
        (s) => s.leftIdx === pageIdx || s.rightIdx === pageIdx,
      );
      if (si >= 0) setSpreadIdx(si);
    },
    [spreads],
  );

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbStripRef.current || !currentSpread) return;
    const activeIdx = currentSpread.rightIdx ?? currentSpread.leftIdx ?? 0;
    const btn = thumbStripRef.current.children[activeIdx] as HTMLElement | undefined;
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [spreadIdx, currentSpread]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!pages.length) return;
    setExporting(true);
    toast({ title: "Exporting…", description: "Rendering all pages to PDF" });
    try {
      await exportBookPdf(pages, projectTitle, {
        preferredLayout,
        onProgress: (cur, total) => {
          if (cur === total) {
            toast({ title: "PDF exported ✓" });
          }
        },
      });
    } catch (err) {
      toast({
        title:       "Export failed",
        description: (err as Error).message,
        variant:     "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [pages, projectTitle, toast]);

  // ── EPUB Export ────────────────────────────────────────────────────────────
  const handleExportEpub = useCallback(async () => {
    if (!pages.length) return;
    setExportingEpub(true);
    toast({ title: "Generating EPUB…", description: "Building e-book file" });
    try {
      await exportBookEpub(pages, projectTitle, {
        onProgress: (cur, total) => {
          if (cur === total) toast({ title: "EPUB exported ✓" });
        },
      });
    } catch (err) {
      toast({ title: "EPUB export failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setExportingEpub(false);
    }
  }, [pages, projectTitle, toast]);

  // ── Loading / error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <p className="text-white font-semibold">Loading Preview</p>
          <p className="text-white/40 text-sm">Preparing your book…</p>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white font-semibold">Failed to load book</p>
          <p className="text-white/50 text-sm">{error}</p>
          <Button onClick={goBack} variant="outline" className="text-white border-white/20">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!pages.length || !currentSpread) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="text-center">
          <p className="text-white/50">No pages to preview.</p>
          <Button onClick={goBack} variant="ghost" className="mt-4 text-white/60">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-[#0f1117] overflow-hidden select-none">

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="h-14 shrink-0 bg-[#13151a] border-b border-white/[0.07] flex items-center px-4 gap-3">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="w-px h-5 bg-white/10" />

        <h1 className="flex-1 text-white font-semibold text-sm truncate">
          {projectTitle}
        </h1>

        {/* Page counter — shows actual page numbers out of total, not spread count */}
        <span className="text-white/30 text-xs">
          {[currentSpread.leftIdx, currentSpread.rightIdx]
            .filter((i) => i !== null)
            .map((i) => i! + 1)
            .join("–")} / {pages.length}
        </span>

        <div className="w-px h-5 bg-white/10" />

        {/* EPUB export */}
        <Button
          size="sm"
          onClick={handleExportEpub}
          disabled={exportingEpub}
          className="bg-[#2D5A8E] hover:bg-[#2D5A8E]/80 text-white text-xs h-8 gap-1.5"
        >
          {exportingEpub ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookOpen className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{exportingEpub ? "Generating…" : "EPUB"}</span>
        </Button>

        {/* PDF export */}
        <Button
          size="sm"
          onClick={handleExport}
          disabled={exporting}
          className="bg-[#1B6B5A] hover:bg-[#1B6B5A]/80 text-white text-xs h-8 gap-1.5"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{exporting ? "Exporting…" : "Export PDF"}</span>
        </Button>
      </div>

      {/* ── Spread area ──────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex items-center justify-center px-4 py-6 relative">

        {/* Prev button */}
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className={cn(
            "absolute left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150",
            "bg-black/40 hover:bg-black/60 border border-white/10",
            canPrev ? "opacity-80 hover:opacity-100" : "opacity-20 cursor-not-allowed",
          )}
          aria-label="Previous spread"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Spread or single-page (covers render full portrait, no blank half) */}
        {(() => {
          const isSinglePage = !currentSpread.left || !currentSpread.right;
          const coverPage    = currentSpread.right ?? currentSpread.left;
          if (isSinglePage && coverPage) {
            return (
              <div
                className="h-full flex items-center justify-center"
                style={{ maxWidth: "calc((100vh - 14rem) * 2 / 3)" }}
              >
                <div
                  className="w-full rounded-lg overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
                  style={{ aspectRatio: "2 / 3" }}
                >
                  <SinglePage
                    page={coverPage}
                    bookTitle={projectTitle}
                    pageNum={currentSpread.rightPageNum || currentSpread.leftPageNum}
                    preferredLayout={preferredLayout}
                    projectId={projectId ?? ""}
                    className="w-full h-full"
                  />
                </div>
              </div>
            );
          }
          return (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ maxWidth: "calc((100vh - 14rem) * 4 / 3)" }}
            >
              <SpreadView
                leftPage={currentSpread.left}
                rightPage={currentSpread.right}
                bookTitle={projectTitle}
                leftPageNum={currentSpread.leftPageNum}
                rightPageNum={currentSpread.rightPageNum}
                preferredLayout={preferredLayout}
                projectId={projectId ?? ""}
                className="w-full"
              />
            </div>
          );
        })()}

        {/* Next button */}
        <button
          onClick={goNext}
          disabled={!canNext}
          className={cn(
            "absolute right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150",
            "bg-black/40 hover:bg-black/60 border border-white/10",
            canNext ? "opacity-80 hover:opacity-100" : "opacity-20 cursor-not-allowed",
          )}
          aria-label="Next spread"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── Page label ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 text-center pb-1">
        <span className="text-white/20 text-[11px]">
          {[currentSpread.left?.label, currentSpread.right?.label]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      {/* ── Thumbnail strip ───────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-[#13151a] border-t border-white/[0.07] px-4 py-3">
        <div
          ref={thumbStripRef}
          className="flex gap-2 overflow-x-auto scroll-smooth pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {pages.map((page, idx) => (
            <PageThumb
              key={page.id}
              page={page}
              index={idx}
              isActive={
                currentSpread.leftIdx === idx ||
                currentSpread.rightIdx === idx
              }
              onClick={() => jumpToPage(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
