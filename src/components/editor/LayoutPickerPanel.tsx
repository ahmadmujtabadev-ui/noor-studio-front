/**
 * LayoutPickerPanel.tsx  — FIXED v2
 *
 * ROOT CAUSE OF HANG: canvas.loadFromJSON() fires object:added for every
 * deserialized object. Each fires fireChange() → autoSave() → API call.
 * With 6-10 objects per template = 6-10 concurrent save requests that
 * freeze the UI thread and cause the "hang" you're seeing.
 *
 * FIX: Uses canvasRef.current.applyLayout(json, callback) — a new method
 * on FabricCanvasHandle that sets suppressRef=true before loadFromJSON
 * and only clears it (and fires ONE save) after all objects are loaded.
 *
 * Also fixes: double-click stacking loads, no loading indicator, raw
 * canvas access that bypassed the suppress mechanism.
 */

import React, { useState } from "react";
import { fabric } from "fabric";
import { cn } from "@/lib/utils";
import type { FabricCanvasHandle } from "./FabricPageCanvas";
import { PAGE_W, PAGE_H } from "./FabricPageCanvas";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import {
  getTemplateFabricJson,
  LAYOUT_TEMPLATE_LIST,
  LayoutTemplateKey,
} from "@/lib/layoutTemplates";

const CATEGORY_LABELS: Record<string, string> = {
  story: "Story Spreads",
  chapter: "Chapter Pages",
  decorative: "Decorative",
};

// ─── SVG previews ─────────────────────────────────────────────────────────────

function FullBleedPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#1a2744" />
      <rect x="0" y="52" width="60" height="28" fill="rgba(0,0,0,0.55)" />
      <rect x="6" y="58" width="48" height="3" rx="1" fill="rgba(255,255,255,0.7)" />
      <rect x="10" y="64" width="40" height="2" rx="1" fill="rgba(255,255,255,0.45)" />
      <rect x="14" y="69" width="32" height="2" rx="1" fill="rgba(255,255,255,0.35)" />
    </svg>
  );
}

function TextBottomPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="50" fill="#c8d8e8" />
      <rect x="0" y="50" width="60" height="30" fill="#fffef7" />
      <line x1="5" y1="50" x2="55" y2="50" stroke="#c9a84c" strokeWidth="1" />
      <rect x="6" y="55" width="48" height="2" rx="1" fill="#2c1e0f70" />
      <rect x="8" y="60" width="44" height="2" rx="1" fill="#2c1e0f55" />
      <rect x="10" y="65" width="40" height="2" rx="1" fill="#2c1e0f40" />
      <rect x="22" y="74" width="16" height="2" rx="1" fill="#8b691460" />
    </svg>
  );
}

function TextTopPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="30" fill="#fffef7" />
      <rect x="6" y="5" width="48" height="2" rx="1" fill="#2c1e0f70" />
      <rect x="8" y="10" width="44" height="2" rx="1" fill="#2c1e0f55" />
      <rect x="10" y="15" width="40" height="2" rx="1" fill="#2c1e0f40" />
      <line x1="5" y1="30" x2="55" y2="30" stroke="#c9a84c" strokeWidth="1" />
      <rect x="0" y="30" width="60" height="50" fill="#c8d8e8" />
    </svg>
  );
}

function SplitLeftPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="25" height="80" fill="#1a2744" />
      <rect x="25" y="0" width="35" height="80" fill="#c8d8e8" />
      <line x1="25" y1="8" x2="25" y2="72" stroke="#c9a84c" strokeWidth="1" />
      <rect x="3" y="10" width="18" height="1.5" rx="0.5" fill="#c9a84c80" />
      <rect x="3" y="16" width="18" height="1.5" rx="0.5" fill="rgba(255,255,255,0.5)" />
      <rect x="3" y="21" width="14" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
      <rect x="3" y="26" width="18" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

function SplitRightPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="35" height="80" fill="#c8d8e8" />
      <rect x="35" y="0" width="25" height="80" fill="#1a2744" />
      <line x1="35" y1="8" x2="35" y2="72" stroke="#c9a84c" strokeWidth="1" />
      <rect x="38" y="10" width="18" height="1.5" rx="0.5" fill="#c9a84c80" />
      <rect x="38" y="16" width="18" height="1.5" rx="0.5" fill="rgba(255,255,255,0.5)" />
      <rect x="38" y="21" width="14" height="1.5" rx="0.5" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

function TwoColumnPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#fffef7" />
      <rect x="8" y="6" width="44" height="2" rx="1" fill="#8b691470" />
      <line x1="15" y1="11" x2="45" y2="11" stroke="#c9a84c60" strokeWidth="0.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <rect key={`l${i}`} x="4" y={15 + i * 7} width="23" height="1.8" rx="0.5" fill="#2c1e0f50" />
      ))}
      <line x1="30" y1="13" x2="30" y2="75" stroke="#c9a84c40" strokeWidth="0.5" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
        <rect key={`r${i}`} x="33" y={15 + i * 7} width="23" height="1.8" rx="0.5" fill="#2c1e0f50" />
      ))}
      <rect x="22" y="74" width="16" height="1.5" rx="0.5" fill="#8b691450" />
    </svg>
  );
}

function ChapterOpenerPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#1a2744" />
      <rect x="0" y="28" width="60" height="30" fill="rgba(0,0,0,0.6)" />
      <line x1="12" y1="32" x2="48" y2="32" stroke="#c9a84c" strokeWidth="0.8" />
      <rect x="10" y="35" width="40" height="2" rx="1" fill="#c9a84c90" />
      <rect x="8" y="40" width="44" height="4" rx="1" fill="rgba(255,255,255,0.85)" />
      <line x1="12" y1="54" x2="48" y2="54" stroke="#c9a84c" strokeWidth="0.8" />
    </svg>
  );
}

function QuotePagePreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#fffdf5" />
      <rect x="2" y="2" width="56" height="76" fill="none" stroke="#c9a84c" strokeWidth="1" rx="2" />
      <rect x="12" y="14" width="36" height="1.5" rx="0.5" fill="#8b691460" />
      <line x1="8" y1="19" x2="52" y2="19" stroke="#c9a84c80" strokeWidth="0.5" />
      <rect x="8" y="26" width="44" height="6" rx="1" fill="#2c1e0f30" />
      <rect x="12" y="36" width="36" height="2" rx="1" fill="#8b691450" />
      <line x1="14" y1="42" x2="46" y2="42" stroke="#c9a84c60" strokeWidth="0.5" />
      <rect x="10" y="46" width="40" height="2" rx="1" fill="#4a352050" />
      <rect x="10" y="60" width="40" height="1.5" rx="0.5" fill="#5c4a3040" />
    </svg>
  );
}

function ImageGridPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#fffef7" />
      <rect x="3" y="3" width="25" height="35" rx="1" fill="#c8d8e8" stroke="#c9a84c40" strokeWidth="0.5" />
      <rect x="32" y="3" width="25" height="35" rx="1" fill="#c8d8e8" stroke="#c9a84c40" strokeWidth="0.5" />
      <rect x="3" y="42" width="25" height="27" rx="1" fill="#c8d8e8" stroke="#c9a84c40" strokeWidth="0.5" />
      <rect x="32" y="42" width="25" height="27" rx="1" fill="#c8d8e8" stroke="#c9a84c40" strokeWidth="0.5" />
      <rect x="8" y="73" width="44" height="1.5" rx="0.5" fill="#5c4a3050" />
    </svg>
  );
}

const PREVIEW_COMPONENTS: Record<LayoutTemplateKey, React.FC> = {
  "full-bleed": FullBleedPreview,
  "text-bottom": TextBottomPreview,
  "text-top": TextTopPreview,
  "split-panel-left": SplitLeftPreview,
  "split-panel-right": SplitRightPreview,
  "two-column": TwoColumnPreview,
  "chapter-opener": ChapterOpenerPreview,
  "quote-page": QuotePagePreview,
  "image-grid": ImageGridPreview,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface LayoutPickerPanelProps {
  canvasRef: React.RefObject<FabricCanvasHandle>;
  onLayoutApplied?: (key: LayoutTemplateKey) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LayoutPickerPanel({ canvasRef, onLayoutApplied, currentPage }: any) {
  console.log("Rendering LayoutPickerPanel with currentPage:", currentPage);
  const [appliedKey, setAppliedKey] = useState<LayoutTemplateKey | null>(null);
  const [confirmKey, setConfirmKey] = useState<LayoutTemplateKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const byCategory: Record<string, typeof LAYOUT_TEMPLATE_LIST> = {};
  LAYOUT_TEMPLATE_LIST.forEach((t) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

const applyTemplate = (key: LayoutTemplateKey) => {
  const handle = canvasRef.current;
  if (!handle || isLoading) return;

  setIsLoading(true);
  setConfirmKey(null);

  const json = getTemplateFabricJson(key);

  handle.applyLayout(json, currentPage?.imageUrl, () => {
    const canvas = handle.getCanvas();
    if (canvas && currentPage?.text) {
      canvas.getObjects().forEach((obj) => {
        const role = (obj as any)._role;
        if (obj.type === "textbox" && role === "body-text") {
          (obj as fabric.Textbox).set({ text: currentPage.text! });
          (obj as fabric.Textbox).initDimensions();
        }
      });
      canvas.renderAll();
    }

    setAppliedKey(key);
    setIsLoading(false);
    onLayoutApplied?.(key);
  });
};

  const handleClick = (key: LayoutTemplateKey) => {
    if (isLoading) return;

    // Only check for user-placed objects (not __background rects)
    const canvas = canvasRef.current?.getCanvas();
    const hasUserContent = canvas
      ? canvas.getObjects().some((o) => !(o as any).__background)
      : false;

    if (hasUserContent && confirmKey !== key) {
      setConfirmKey(key);
      return;
    }

    applyTemplate(key);
  };

  return (
    <div className="p-3 space-y-4">

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          <p className="text-[11px] text-primary font-medium">Applying layout…</p>
        </div>
      )}

      {Object.entries(byCategory).map(([category, templates]) => (
        <div key={category}>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
            {CATEGORY_LABELS[category] ?? category}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => {
              const Preview = PREVIEW_COMPONENTS[template.id];
              const isApplied = appliedKey === template.id;
              const isConfirm = confirmKey === template.id;
              const isDisabled = isLoading;

              return (
                <button
                  key={template.id}
                  onMouseDown={(e) => { e.preventDefault(); handleClick(template.id); }}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-lg overflow-hidden border-2 transition-all text-left focus:outline-none",
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : isApplied
                        ? "border-primary shadow-md shadow-primary/20"
                        : isConfirm
                          ? "border-amber-500 shadow-md shadow-amber-500/20"
                          : "border-white/10 hover:border-white/25 active:scale-[0.98]",
                  )}
                  title={isConfirm ? "Click again to replace current page content" : template.description}
                >
                  <div className="aspect-[3/4] w-full bg-[#0d0f14] relative">
                    <Preview />

                    {isApplied && !isLoading && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {isConfirm && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-2">
                        <div className="bg-amber-500/95 rounded-md px-2 py-1.5 text-center">
                          <p className="text-[9px] text-white font-bold leading-tight">
                            Replace page?
                          </p>
                          <p className="text-[8px] text-white/80 mt-0.5">
                            Click again to confirm
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "px-2 py-1.5 border-t",
                    isApplied ? "bg-primary/10 border-primary/30"
                      : isConfirm ? "bg-amber-500/10 border-amber-500/30"
                        : "bg-[#1c1f27] border-white/5",
                  )}>
                    <p className="text-[11px] font-semibold text-white truncate">
                      {template.label}
                    </p>
                    <p className="text-[9px] text-white/35 truncate mt-0.5">
                      {template.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-lg bg-white/4 border border-white/8 p-2.5">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 text-amber-400/70 shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/35 leading-snug">
            Applying a layout replaces the current page content. Customise text and colours after applying.
          </p>
        </div>
      </div>
    </div>
  );
}