/**
 * LayoutPickerPanel.tsx — v7
 *
 * Changes vs v6:
 *   - applyLayout signature changed: now passes (layoutKey, imageUrl, bodyText)
 *     and receives a payload in the done callback.
 *   - onLayoutPayload callback lets parent persist the layoutKey + bodyText +
 *     fabricJson in one atomic write.
 */

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { FabricCanvasHandle, LayoutAppliedPayload } from "./FabricPageCanvas";
import { AlertTriangle, Check, ImageOff, Loader2 } from "lucide-react";
import {
  LAYOUT_TEMPLATE_LIST,
  LayoutTemplateKey,
} from "@/lib/layoutTemplates";

const CATEGORY_LABELS: Record<string, string> = {
  story:      "Story Spreads",
  chapter:    "Chapter Pages",
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

function ImageFocusPreview() {
  return (
    <svg viewBox="0 0 60 80" className="w-full h-full">
      <rect x="0" y="0" width="60" height="80" fill="#fffef7" />
      <line x1="18" y1="4" x2="42" y2="4" stroke="#c9a84c" strokeWidth="0.5" />
      <rect x="5" y="8" width="50" height="55" fill="#c8d8e8" stroke="#c9a84c" strokeWidth="1" />
      <line x1="18" y1="66" x2="42" y2="66" stroke="#c9a84c80" strokeWidth="0.5" />
      <rect x="10" y="70" width="40" height="1.5" rx="0.5" fill="#2c1e0f55" />
      <rect x="14" y="74" width="32" height="1.5" rx="0.5" fill="#2c1e0f40" />
    </svg>
  );
}

const PREVIEW_COMPONENTS: Record<LayoutTemplateKey, React.FC> = {
  "full-bleed":   FullBleedPreview,
  "text-bottom":  TextBottomPreview,
  "text-top":     TextTopPreview,
  "image-focus":  ImageFocusPreview,
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface LayoutPickerPanelProps {
  canvasRef: React.RefObject<FabricCanvasHandle>;
  currentPage?: {
    id?: string;
    type?: string;
    text?: string;
    imageUrl?: string;
    layoutKey?: string | null;
  };
  onLayoutApplied?: (key: LayoutTemplateKey) => void;
  /**
   * Called with the layout payload immediately after applyLayout completes.
   * Parent should update local state + persist to server in this handler.
   * Return a promise that resolves once the save completes (for UI feedback).
   */
  onLayoutPayload?: (payload: LayoutAppliedPayload & { pageId: string }) => Promise<void> | void;
}

export function LayoutPickerPanel({
  canvasRef,
  currentPage,
  onLayoutApplied,
  onLayoutPayload,
}: LayoutPickerPanelProps) {
  const [appliedKey, setAppliedKey] = useState<LayoutTemplateKey | null>(
    (currentPage?.layoutKey as LayoutTemplateKey) ?? null,
  );
  const [confirmKey, setConfirmKey] = useState<LayoutTemplateKey | null>(null);
  const [status, setStatus] = useState<"idle" | "applying" | "saving" | "saved" | "error">("idle");

  const hasImage = !!(currentPage?.imageUrl?.trim());
  const isLoading = status === "applying" || status === "saving";

  // When page changes, reflect the saved layoutKey (if any)
  useEffect(() => {
    setAppliedKey((currentPage?.layoutKey as LayoutTemplateKey) ?? null);
    setConfirmKey(null);
    setStatus("idle");
  }, [currentPage?.id, currentPage?.layoutKey]);

  const byCategory: Record<string, typeof LAYOUT_TEMPLATE_LIST> = {};
  LAYOUT_TEMPLATE_LIST.forEach((t) => {
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  });

  useEffect(() => {
    if (!confirmKey) return;
    const clear = () => setConfirmKey(null);
    const timer = setTimeout(() => {
      window.addEventListener("pointerdown", clear, { capture: true });
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", clear, { capture: true });
    };
  }, [confirmKey]);

  const applyTemplate = (key: LayoutTemplateKey) => {
    const handle = canvasRef.current;
    if (!handle || isLoading) return;

    if (!hasImage) {
      console.warn("[LayoutPickerPanel] No imageUrl on currentPage.", currentPage);
    }

    setStatus("applying");
    setConfirmKey(null);

    handle.applyLayout(
      key,
      currentPage?.imageUrl,
      currentPage?.text,
      async (payload) => {
        setAppliedKey(key);
        onLayoutApplied?.(key);

        if (onLayoutPayload && currentPage?.id) {
          setStatus("saving");
          try {
            await onLayoutPayload({ ...payload, pageId: currentPage.id });
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 1800);
          } catch (err) {
            console.error("[LayoutPickerPanel] save failed:", err);
            setStatus("error");
            setTimeout(() => setStatus("idle"), 2500);
          }
        } else {
          setStatus("idle");
        }
      },
    );
  };

  const handleClick = (e: React.MouseEvent, key: LayoutTemplateKey) => {
    e.stopPropagation();
    if (isLoading) return;

    // Covers don't use layouts — they have their own rendering
    const pageType = currentPage?.type;
    if (pageType === "front-cover" || pageType === "back-cover") {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }

    // If user clicks the SAME layout that's already applied, do nothing.
    // Otherwise apply immediately (no confirm gate — lets users switch freely).
    if (appliedKey === key) return;
    applyTemplate(key);
  };

  return (
    <div className="p-3 space-y-4">

      {(currentPage?.type === "front-cover" || currentPage?.type === "back-cover") && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-blue-500/8 border border-blue-500/20">
          <ImageOff className="w-3.5 h-3.5 text-blue-400/80 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-300/80 leading-snug">
            {currentPage?.type === "front-cover" ? "Front cover" : "Back cover"} pages use a special full-page layout and can't be changed.
          </p>
        </div>
      )}

      {!hasImage && currentPage?.type !== "front-cover" && currentPage?.type !== "back-cover" && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20">
          <ImageOff className="w-3.5 h-3.5 text-amber-400/80 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-300/70 leading-snug">
            This page has no illustration — layouts will apply structure only.
          </p>
        </div>
      )}

      {status === "applying" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          <p className="text-[11px] text-primary font-medium">Applying layout…</p>
        </div>
      )}
      {status === "saving" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          <p className="text-[11px] text-primary font-medium">Saving to server…</p>
        </div>
      )}
      {status === "saved" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-emerald-400 font-medium">Saved ✓</p>
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-[11px] text-red-400 font-medium">
            {(currentPage?.type === "front-cover" || currentPage?.type === "back-cover")
              ? "Covers can't use layouts"
              : "Save failed — try again"}
          </p>
        </div>
      )}

      {Object.entries(byCategory).map(([category, templates]) => (
        <div key={category}>
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
            {CATEGORY_LABELS[category] ?? category}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => {
              const Preview    = PREVIEW_COMPONENTS[template.id];
              const isApplied  = appliedKey === template.id;
              const isConfirm  = confirmKey === template.id;
              const isCoverPage = currentPage?.type === "front-cover" || currentPage?.type === "back-cover";
              const isDisabled = isLoading || isCoverPage;

              return (
                <button
                  key={template.id}
                  onClick={(e) => handleClick(e, template.id)}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-lg overflow-hidden border-2 transition-all text-left focus:outline-none",
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : isApplied
                        ? "border-primary shadow-md shadow-primary/20"
                        : isConfirm
                          ? "border-amber-500 shadow-md shadow-amber-500/20"
                          : "border-white/10 hover:border-white/30 active:scale-[0.97] cursor-pointer"
                  )}
                  title={
                    isConfirm
                      ? "Click again to replace current page content"
                      : template.description
                  }
                >
                  <div className="aspect-[3/4] w-full bg-[#0d0f14] relative">
                    {Preview ? <Preview /> : <div className="w-full h-full bg-white/5" />}

                    {isApplied && !isLoading && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    {isConfirm && (
                      <div className="absolute inset-0 bg-black/55 flex items-center justify-center p-2">
                        <div className="bg-amber-500/95 rounded-md px-2 py-1.5 text-center">
                          <p className="text-[9px] text-white font-bold leading-tight">Replace page?</p>
                          <p className="text-[8px] text-white/80 mt-0.5">Click again to confirm</p>
                        </div>
                      </div>
                    )}

                    {isLoading && appliedKey === template.id && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "px-2 py-1.5 border-t",
                      isApplied
                        ? "bg-primary/10 border-primary/30"
                        : isConfirm
                          ? "bg-amber-500/10 border-amber-500/30"
                          : "bg-[#1c1f27] border-white/5"
                    )}
                  >
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
            Applying a layout replaces the current page content and saves
            automatically. You can edit text and colours afterwards.
          </p>
        </div>
      </div>
    </div>
  );
}