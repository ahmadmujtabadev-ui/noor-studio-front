// components/editor/PageNavigator.tsx
// Left sidebar — scrollable list of page thumbnails.

import React from "react";
import { cn } from "@/lib/utils";
import type { BookPage } from "@/hooks/useBookEditor";
import { BookMarked, BookOpen, FileText, AlignLeft, Image as ImgIcon } from "lucide-react";

interface Props {
  pages: BookPage[];
  currentIdx: number;
  onSelect: (idx: number) => void;
}

function pageIcon(type: BookPage["type"]) {
  if (type === "front-cover" || type === "back-cover") return <BookMarked className="w-3 h-3" />;
  if (type === "chapter-opener")  return <BookOpen className="w-3 h-3" />;
  if (type === "text-page")       return <AlignLeft className="w-3 h-3" />;
  if (type === "chapter-moment")  return <ImgIcon className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
}

/** text-page thumbnails use a warm cream background (matches the canvas) */
function placeholderBg(type: BookPage["type"]) {
  return type === "text-page" ? "#fffef7" : "#2a2d35";
}

export function PageNavigator({ pages, currentIdx, onSelect }: Props) {
  console.log("Rendering PageNavigator with pages:", pages);
  return (
    <div className="flex flex-col h-full bg-[#1a1d23] border-r border-white/10 w-[148px] shrink-0">
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">
          Pages
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-1.5 px-2 scrollbar-thin scrollbar-thumb-white/10">
        {pages.map((page, idx) => (
          <button
            key={page.id}
            onClick={() => onSelect(idx)}
            className={cn(
              "w-full rounded-lg overflow-hidden border-2 transition-all group",
              idx === currentIdx
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-transparent hover:border-white/20"
            )}
          >
            {/* Thumbnail */}
            <div
              className="relative w-full aspect-[3/4]"
              style={{ backgroundColor: placeholderBg(page.type) }}
            >
              {page.thumbnail ? (
                <img
                  src={page.thumbnail}
                  alt={page.label}
                  className="w-full h-full object-cover"
                />
              ) : page.imageUrl ? (
                <img
                  src={page.imageUrl}
                  alt={page.label}
                  className="w-full h-full object-cover opacity-70"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 px-2">
                  <div className={page.type === "text-page" ? "text-amber-800/30" : "text-white/20"}>
                    {pageIcon(page.type)}
                  </div>
                  {page.type === "text-page" && (
                    <div className="w-full space-y-0.5 px-1">
                      {[70, 90, 80, 90, 60].map((w, i) => (
                        <div key={i} className="h-px rounded" style={{ width: `${w}%`, backgroundColor: "#c9a84c44" }} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Page number badge */}
              <div className="absolute bottom-1 right-1 bg-black/60 text-white/80 text-[9px] font-semibold px-1 rounded">
                {idx + 1}
              </div>

              {/* Active glow overlay */}
              {idx === currentIdx && (
                <div className="absolute inset-0 ring-2 ring-inset ring-primary/60 rounded pointer-events-none" />
              )}
            </div>

            {/* Label */}
            <div
              className={cn(
                "px-1.5 py-1 text-left",
                idx === currentIdx ? "bg-primary/10" : "bg-[#22252e]"
              )}
            >
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-[9px]",
                    idx === currentIdx ? "text-primary" : "text-white/40"
                  )}
                >
                  {pageIcon(page.type)}
                </span>
                <p
                  className={cn(
                    "text-[10px] font-medium truncate leading-tight",
                    idx === currentIdx ? "text-white" : "text-white/50"
                  )}
                >
                  {page.label}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="px-3 py-2.5 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">
          {pages.length} page{pages.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
