// components/editor/DesignPanel.tsx
// Right sidebar — property controls for selected Fabric.js objects.
//
// PER-CHARACTER STYLING — HOW IT WORKS:
// ────────────────────────────────────────
// The fundamental problem: clicking ANY button in this panel fires a blur
// on the Fabric Textbox, which sets isEditing=false and wipes selectionStart/
// selectionEnd BEFORE onClick runs. Every previous approach failed because of
// this race.
//
// THE ONLY RELIABLE FIX:
//   Use onMouseDown + e.preventDefault() on every style button/control.
//   preventDefault() stops the browser from moving focus away from the canvas
//   textbox, so isEditing stays true and selectionStart/End are intact when
//   our handler fires. Then setSelectionStyles() works correctly.
//
// For <input> and <select> elements (which need focus themselves) we use a
// savedSelectionRef that captures start/end on every text:selection:changed
// event, and restore via enterEditing() + setSelectionStart/End before
// applying the style.

import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bold, Italic, Underline,
  AlignLeft, AlignCenter, AlignRight,
  Trash2, BringToFront, SendToBack,
  Type, Square, ImageIcon, Palette,
} from "lucide-react";
import { GOOGLE_FONTS } from "./FabricPageCanvas";
import { useBookTextStyleStore } from "@/lib/store/bookTextStyleStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  selectedObj: fabric.Object | null;
  canvas: fabric.Canvas | null;
  projectId?: string;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

type ObjKind = "text" | "shape" | "image" | "none";

function getKind(obj: fabric.Object | null): ObjKind {
  if (!obj) return "none";
  if (obj instanceof fabric.IText || obj instanceof fabric.Text) return "text";
  if (obj instanceof fabric.Image) return "image";
  if (obj instanceof fabric.Rect || obj instanceof fabric.Circle || obj instanceof fabric.Ellipse)
    return "shape";
  return "shape";
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-white/10 space-y-3">
      <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  );
}

// ─── Colour swatch ────────────────────────────────────────────────────────────

function ColorInput({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="relative w-8 h-8 rounded-lg overflow-hidden border-2 border-white/20 cursor-pointer shrink-0 shadow-inner">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
        />
        <div className="w-full h-full" style={{ backgroundColor: value || "#ffffff" }} />
      </label>
      <span className="text-xs text-white/60 truncate">{label}</span>
      <span className="ml-auto text-[10px] font-mono text-white/40">{value}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DesignPanel({
  selectedObj, canvas, projectId, onDelete, onBringForward, onSendBackward,
}: Props) {
  const kind = getKind(selectedObj);
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate((n) => n + 1);
  const setStyle = useBookTextStyleStore((s) => s.setStyle);

  // Saved selection snapshot — updated on every text:selection:changed event.
  // This lets us restore the selection for input/select controls that must
  // take focus (and therefore blur the canvas textbox).
  const savedSel = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => { rerender(); }, [selectedObj]);

  // ── Wire up canvas listeners ──────────────────────────────────────────────
  useEffect(() => {
    if (!canvas) return;

    const onSelChange = () => {
      const active = canvas.getActiveObject() as fabric.IText | null;
      if (active?.isEditing &&
          active.selectionStart !== undefined &&
          active.selectionEnd !== undefined &&
          active.selectionStart !== active.selectionEnd) {
        savedSel.current = { start: active.selectionStart, end: active.selectionEnd };
      }
      rerender();
    };

    const onCleared = () => { savedSel.current = null; rerender(); };

    canvas.on("text:selection:changed" as any, onSelChange);
    canvas.on("selection:cleared", onCleared);
    canvas.on("text:editing:exited" as any, onCleared);
    return () => {
      canvas.off("text:selection:changed" as any, onSelChange);
      canvas.off("selection:cleared", onCleared);
      canvas.off("text:editing:exited" as any, onCleared);
    };
  }, [canvas]);

  // ── Core style applier ────────────────────────────────────────────────────
  //
  // CASE A — button controls (Bold, Italic, etc.):
  //   Called via onMouseDown with e.preventDefault() already called by the
  //   caller. The textbox is still in editing mode, selection is intact.
  //   We apply setSelectionStyles() directly.
  //
  // CASE B — input/select controls (font size, font family):
  //   These controls must take focus, so the textbox blurs first.
  //   We use savedSel to restore the selection via enterEditing() before
  //   applying the style.

  const applyStyle = (
    t: fabric.IText,
    style: Record<string, unknown>,
    forceRange?: { start: number; end: number },
  ) => {
    const tb = t as fabric.Textbox;
    const range = forceRange ?? (
      t.isEditing &&
      t.selectionStart !== undefined &&
      t.selectionEnd !== undefined &&
      t.selectionStart !== t.selectionEnd
        ? { start: t.selectionStart, end: t.selectionEnd }
        : null
    );

    if (range) {
      // Ensure we're in editing mode with the right selection
      if (!t.isEditing) {
        t.enterEditing();
        t.setSelectionStart(range.start);
        t.setSelectionEnd(range.end);
      }
      tb.setSelectionStyles(style as fabric.ITextOptions, range.start, range.end);
    } else {
      // No selection — apply to whole object
      t.set(style as Partial<fabric.IText>);
    }

    if (t instanceof fabric.Textbox) tb.initDimensions();
    canvas?.renderAll();
    rerender();
  };

  // Read style from current selection or object level
  const readStyle = (t: fabric.IText, prop: string): unknown => {
    const active = canvas?.getActiveObject() as fabric.IText | null;
    const sel = active?.isEditing && active === t ? {
      start: t.selectionStart ?? 0,
      end: t.selectionEnd ?? 0,
    } : savedSel.current;

    if (sel && sel.start !== sel.end) {
      const styles = (t as fabric.Textbox).getSelectionStyles(sel.start, sel.start + 1);
      if (styles.length > 0 && prop in styles[0]) return styles[0][prop];
    }
    return (t as any)[prop];
  };

  const hasActiveSelection = (): boolean => {
    const t = selectedObj as fabric.IText | null;
    if (!t) return false;
    if (t.isEditing &&
        t.selectionStart !== undefined &&
        t.selectionEnd !== undefined &&
        t.selectionStart !== t.selectionEnd) return true;
    return savedSel.current !== null;
  };

  const setAndRender = (cb: () => void) => { cb(); canvas?.renderAll(); rerender(); };

  const getTextObj = () =>
    selectedObj instanceof fabric.IText || selectedObj instanceof fabric.Text
      ? (selectedObj as fabric.IText) : null;

  const opacity = selectedObj ? Math.round((selectedObj.opacity ?? 1) * 100) : 100;
  const fill = typeof selectedObj?.fill === "string" ? selectedObj.fill : "#000000";

  // ── Empty state ───────────────────────────────────────────────────────────

  if (kind === "none") {
    return (
      <div className="w-[220px] shrink-0 bg-[#1a1d23] border-l border-white/10 flex flex-col h-full">
        <div className="px-4 py-3 border-b border-white/10">
          <p className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Properties</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
            <Palette className="w-5 h-5 text-white/30" />
          </div>
          <p className="text-xs text-white/30 leading-relaxed">
            Select an element on the canvas to edit its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[220px] shrink-0 bg-[#1a1d23] border-l border-white/10 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
          {kind === "text"  && <Type      className="w-3 h-3 text-primary" />}
          {kind === "shape" && <Square    className="w-3 h-3 text-primary" />}
          {kind === "image" && <ImageIcon className="w-3 h-3 text-primary" />}
        </div>
        <p className="text-xs font-semibold text-white capitalize">{kind}</p>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={onBringForward} title="Bring forward"
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition">
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button onClick={onSendBackward} title="Send backward"
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition">
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} title="Delete"
            className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── TEXT controls ──────────────────────────────────────────────────── */}
      {kind === "text" && (() => {
        const t = getTextObj()!;

        const fontFamily  = (readStyle(t, "fontFamily")  as string)  || "Nunito";
        const fontSize    = (readStyle(t, "fontSize")    as number)  || 16;
        const fontWeight  = (readStyle(t, "fontWeight")  as string)  || "normal";
        const fontStyle   = (readStyle(t, "fontStyle")   as string)  || "normal";
        const underline   = (readStyle(t, "underline")   as boolean) || false;
        const textFill    = (readStyle(t, "fill")        as string)  || "#ffffff";
        const textAlign   = (t.textAlign as string) || "left"; // always object-level

        const selActive = hasActiveSelection();

        return (
          <>
            {selActive && (
              <div className="mx-4 mt-3 px-2 py-1.5 rounded-md bg-primary/15 border border-primary/30">
                <p className="text-[10px] text-primary/80 text-center font-medium">
                  ✦ Styling selected text only
                </p>
              </div>
            )}

            <Section label="Font">
              {/* Font family — needs focus so uses savedSel restore path */}
              <Select
                value={fontFamily}
                onValueChange={(v) => {
                  const saved = savedSel.current;
                  applyStyle(t, { fontFamily: v }, saved ?? undefined);
                  // Only update global preview style when no text is selected —
                  // per-word selection styles must NOT leak into the preview layout.
                  if (projectId && !hasActiveSelection()) setStyle(projectId, { fontFamily: v });
                }}
              >
                <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-52 bg-[#22252e] border-white/10">
                  {GOOGLE_FONTS.map((f) => (
                    <SelectItem key={f} value={f}
                      className="text-white/80 text-xs hover:bg-white/10"
                      style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font size — input needs focus, uses savedSel restore */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-white/50 shrink-0 w-8">Size</Label>
                <Input
                  type="number" min={8} max={160}
                  value={fontSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    const saved = savedSel.current;
                    applyStyle(t, { fontSize: n }, saved ?? undefined);
                    if (projectId && !hasActiveSelection()) setStyle(projectId, { fontSize: n });
                  }}
                  className="h-7 bg-white/5 border-white/10 text-white text-xs"
                />
              </div>

              {/* Bold / Italic / Underline
                  ✅ onMouseDown + e.preventDefault() = no blur = selection intact */}
              <div className="flex gap-1">
                {([
                  {
                    icon: Bold,
                    active: fontWeight === "bold",
                    onMouseDown: (e: React.MouseEvent) => {
                      e.preventDefault();
                      const nextBold = fontWeight !== "bold";
                      applyStyle(t, { fontWeight: nextBold ? "bold" : "normal" });
                      if (projectId && !hasActiveSelection()) setStyle(projectId, { bold: nextBold });
                    },
                  },
                  {
                    icon: Italic,
                    active: fontStyle === "italic",
                    onMouseDown: (e: React.MouseEvent) => {
                      e.preventDefault();
                      const nextItalic = fontStyle !== "italic";
                      applyStyle(t, { fontStyle: nextItalic ? "italic" : "normal" });
                      if (projectId && !hasActiveSelection()) setStyle(projectId, { italic: nextItalic });
                    },
                  },
                  {
                    icon: Underline,
                    active: underline,
                    onMouseDown: (e: React.MouseEvent) => {
                      e.preventDefault();
                      applyStyle(t, { underline: !underline });
                    },
                  },
                ] as const).map(({ icon: Icon, active, onMouseDown }, i) => (
                  <button
                    key={i}
                    onMouseDown={onMouseDown}
                    className={cn(
                      "flex-1 h-7 rounded flex items-center justify-center transition select-none",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              {/* Alignment — always object-level, no per-char support in Fabric */}
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => {
                  const icons = { left: AlignLeft, center: AlignCenter, right: AlignRight };
                  const Icon = icons[align];
                  return (
                    <button
                      key={align}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setAndRender(() => t.set("textAlign", align));
                        if (projectId && !hasActiveSelection()) setStyle(projectId, { textAlign: align });
                      }}
                      className={cn(
                        "flex-1 h-7 rounded flex items-center justify-center transition select-none",
                        textAlign === align
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section label="Colour">
              {/* Text colour — color picker input, uses savedSel restore */}
              <ColorInput
                label="Text colour"
                value={textFill}
                onChange={(v) => {
                  const saved = savedSel.current;
                  applyStyle(t, { fill: v }, saved ?? undefined);
                  if (projectId && !hasActiveSelection()) setStyle(projectId, { textColor: v });
                }}
              />
              <ColorInput
                label="Background"
                value={typeof t.backgroundColor === "string" ? t.backgroundColor : "transparent"}
                onChange={(v) => setAndRender(() => t.set("backgroundColor", v))}
              />
            </Section>

            <Section label="Spacing">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Line height</span>
                  <span className="text-xs text-white/30">{(t.lineHeight ?? 1.2).toFixed(1)}</span>
                </div>
                <Slider min={1} max={3} step={0.1} value={[t.lineHeight ?? 1.2]}
                  onValueChange={([v]) => setAndRender(() => t.set("lineHeight", v))}
                  className="[&_.bg-primary]:bg-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Letter spacing</span>
                  <span className="text-xs text-white/30">{t.charSpacing ?? 0}</span>
                </div>
                <Slider min={-50} max={200} step={5} value={[t.charSpacing ?? 0]}
                  onValueChange={([v]) => setAndRender(() => t.set("charSpacing", v))} />
              </div>
            </Section>
          </>
        );
      })()}

      {/* ── SHAPE controls ─────────────────────────────────────────────────── */}
      {kind === "shape" && (
        <>
          <Section label="Fill">
            <ColorInput label="Fill colour" value={fill}
              onChange={(v) => setAndRender(() => selectedObj!.set("fill", v))} />
            <ColorInput label="Stroke colour"
              value={typeof selectedObj?.stroke === "string" ? selectedObj.stroke : "#000000"}
              onChange={(v) => setAndRender(() => selectedObj!.set("stroke", v))} />
            <div className="flex items-center gap-2">
              <Label className="text-xs text-white/50 w-20 shrink-0">Stroke width</Label>
              <Input type="number" min={0} max={20} value={selectedObj?.strokeWidth ?? 0}
                onChange={(e) => setAndRender(() => selectedObj!.set("strokeWidth", Number(e.target.value)))}
                className="h-7 bg-white/5 border-white/10 text-white text-xs" />
            </div>
          </Section>
          {selectedObj instanceof fabric.Rect && (
            <Section label="Corners">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-white/50 w-20 shrink-0">Radius</Label>
                <Input type="number" min={0} max={200}
                  value={(selectedObj as fabric.Rect).rx ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAndRender(() => (selectedObj as fabric.Rect).set({ rx: v, ry: v }));
                  }}
                  className="h-7 bg-white/5 border-white/10 text-white text-xs" />
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── IMAGE controls ─────────────────────────────────────────────────── */}
      {kind === "image" && (
        <Section label="Image">
          <p className="text-xs text-white/40">Use opacity and transform handles to adjust.</p>
        </Section>
      )}

      {/* ── OPACITY ────────────────────────────────────────────────────────── */}
      <Section label="Opacity">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Opacity</span>
            <span className="text-xs text-white/30">{opacity}%</span>
          </div>
          <Slider min={0} max={100} step={1} value={[opacity]}
            onValueChange={([v]) => setAndRender(() => selectedObj!.set("opacity", v / 100))} />
        </div>
      </Section>

      {/* ── POSITION ───────────────────────────────────────────────────────── */}
      <Section label="Position">
        <div className="grid grid-cols-2 gap-2">
          {(["left", "top"] as const).map((prop) => (
            <div key={prop} className="space-y-1">
              <Label className="text-[10px] text-white/40 uppercase">{prop}</Label>
              <Input type="number"
                value={Math.round((selectedObj?.[prop] as number) ?? 0)}
                onChange={(e) => setAndRender(() => selectedObj!.set(prop, Number(e.target.value)))}
                className="h-7 bg-white/5 border-white/10 text-white text-xs" />
            </div>
          ))}
          {(["scaleX", "scaleY"] as const).map((prop) => (
            <div key={prop} className="space-y-1">
              <Label className="text-[10px] text-white/40 uppercase">
                {prop === "scaleX" ? "Scale W" : "Scale H"}
              </Label>
              <Input type="number" step={0.05}
                value={Number((selectedObj?.[prop] ?? 1).toFixed(2))}
                onChange={(e) => setAndRender(() => selectedObj!.set(prop, Number(e.target.value)))}
                className="h-7 bg-white/5 border-white/10 text-white text-xs" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}