// components/editor/DesignPanel.tsx
// Right sidebar — shows property controls for the selected Fabric.js object.

import React, { useEffect, useState } from "react";
import { fabric } from "fabric";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
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
  Type, Square, Circle as CircleIcon, ImageIcon,
  Palette,
} from "lucide-react";
import { GOOGLE_FONTS } from "./FabricPageCanvas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  selectedObj: fabric.Object | null;
  canvas: fabric.Canvas | null;
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

function ColorInput({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
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
  selectedObj, canvas, onDelete, onBringForward, onSendBackward,
}: Props) {
  const kind = getKind(selectedObj);
  const [, forceUpdate] = useState(0);
  const rerender = () => forceUpdate((n) => n + 1);

  // Re-render when selection changes so controls reflect current values
  useEffect(() => { rerender(); }, [selectedObj]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const setAndRender = (cb: () => void) => {
    cb();
    canvas?.renderAll();
    rerender();
  };

  const getTextObj = () =>
    selectedObj instanceof fabric.IText || selectedObj instanceof fabric.Text
      ? (selectedObj as fabric.IText)
      : null;

  const opacity = selectedObj ? Math.round((selectedObj.opacity ?? 1) * 100) : 100;
  const fill = typeof selectedObj?.fill === "string" ? selectedObj.fill : "#000000";

  // ─────────────────────────────────────────────────────────────────────────────

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
          {kind === "text" && <Type className="w-3 h-3 text-primary" />}
          {kind === "shape" && <Square className="w-3 h-3 text-primary" />}
          {kind === "image" && <ImageIcon className="w-3 h-3 text-primary" />}
        </div>
        <p className="text-xs font-semibold text-white capitalize">{kind}</p>

        {/* Layer actions */}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onBringForward}
            title="Bring forward"
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <BringToFront className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSendBackward}
            title="Send backward"
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            <SendToBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1 rounded hover:bg-red-500/20 text-white/50 hover:text-red-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── TEXT controls ─────────────────────────────────────────────────────── */}
      {kind === "text" && (() => {
        const t = getTextObj()!;
        return (
          <>
            <Section label="Font">
              {/* Font family */}
              <Select
                value={t.fontFamily || "Nunito"}
                onValueChange={(v) => setAndRender(() => t.set("fontFamily", v))}
              >
                <SelectTrigger className="h-8 bg-white/5 border-white/10 text-white text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-52 bg-[#22252e] border-white/10">
                  {GOOGLE_FONTS.map((f) => (
                    <SelectItem
                      key={f}
                      value={f}
                      className="text-white/80 text-xs hover:bg-white/10"
                      style={{ fontFamily: f }}
                    >
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Font size */}
              <div className="flex items-center gap-2">
                <Label className="text-xs text-white/50 shrink-0 w-8">Size</Label>
                <Input
                  type="number"
                  min={8}
                  max={160}
                  value={t.fontSize || 16}
                  onChange={(e) =>
                    setAndRender(() => t.set("fontSize", Number(e.target.value)))
                  }
                  className="h-7 bg-white/5 border-white/10 text-white text-xs"
                />
              </div>

              {/* Style toggles */}
              <div className="flex gap-1">
                {[
                  {
                    icon: Bold,
                    active: t.fontWeight === "bold",
                    action: () =>
                      t.set("fontWeight", t.fontWeight === "bold" ? "normal" : "bold"),
                  },
                  {
                    icon: Italic,
                    active: t.fontStyle === "italic",
                    action: () =>
                      t.set("fontStyle", t.fontStyle === "italic" ? "normal" : "italic"),
                  },
                  {
                    icon: Underline,
                    active: t.underline,
                    action: () => t.set("underline", !t.underline),
                  },
                ].map(({ icon: Icon, active, action }, i) => (
                  <button
                    key={i}
                    onClick={() => setAndRender(action)}
                    className={cn(
                      "flex-1 h-7 rounded flex items-center justify-center transition",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              {/* Alignment */}
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => {
                  const icons = { left: AlignLeft, center: AlignCenter, right: AlignRight };
                  const Icon = icons[align];
                  return (
                    <button
                      key={align}
                      onClick={() => setAndRender(() => t.set("textAlign", align))}
                      className={cn(
                        "flex-1 h-7 rounded flex items-center justify-center transition",
                        t.textAlign === align
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
              <ColorInput
                label="Text colour"
                value={typeof t.fill === "string" ? t.fill : "#ffffff"}
                onChange={(v) => setAndRender(() => t.set("fill", v))}
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
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[t.lineHeight ?? 1.2]}
                  onValueChange={([v]) => setAndRender(() => t.set("lineHeight", v))}
                  className="[&_.bg-primary]:bg-primary"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/50">Letter spacing</span>
                  <span className="text-xs text-white/30">{t.charSpacing ?? 0}</span>
                </div>
                <Slider
                  min={-50}
                  max={200}
                  step={5}
                  value={[t.charSpacing ?? 0]}
                  onValueChange={([v]) => setAndRender(() => t.set("charSpacing", v))}
                />
              </div>
            </Section>
          </>
        );
      })()}

      {/* ── SHAPE controls ────────────────────────────────────────────────────── */}
      {kind === "shape" && (
        <>
          <Section label="Fill">
            <ColorInput
              label="Fill colour"
              value={fill}
              onChange={(v) => setAndRender(() => selectedObj!.set("fill", v))}
            />
            <ColorInput
              label="Stroke colour"
              value={
                typeof selectedObj?.stroke === "string"
                  ? selectedObj.stroke
                  : "#000000"
              }
              onChange={(v) => setAndRender(() => selectedObj!.set("stroke", v))}
            />
            <div className="flex items-center gap-2">
              <Label className="text-xs text-white/50 w-20 shrink-0">Stroke width</Label>
              <Input
                type="number"
                min={0}
                max={20}
                value={selectedObj?.strokeWidth ?? 0}
                onChange={(e) =>
                  setAndRender(() =>
                    selectedObj!.set("strokeWidth", Number(e.target.value))
                  )
                }
                className="h-7 bg-white/5 border-white/10 text-white text-xs"
              />
            </div>
          </Section>

          {selectedObj instanceof fabric.Rect && (
            <Section label="Corners">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-white/50 w-20 shrink-0">Radius</Label>
                <Input
                  type="number"
                  min={0}
                  max={200}
                  value={(selectedObj as fabric.Rect).rx ?? 0}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAndRender(() => {
                      (selectedObj as fabric.Rect).set({ rx: v, ry: v });
                    });
                  }}
                  className="h-7 bg-white/5 border-white/10 text-white text-xs"
                />
              </div>
            </Section>
          )}
        </>
      )}

      {/* ── IMAGE controls ────────────────────────────────────────────────────── */}
      {kind === "image" && (
        <Section label="Image">
          <p className="text-xs text-white/40">Use opacity and transform handles to adjust.</p>
        </Section>
      )}

      {/* ── OPACITY (all types) ───────────────────────────────────────────────── */}
      <Section label="Opacity">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">Opacity</span>
            <span className="text-xs text-white/30">{opacity}%</span>
          </div>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[opacity]}
            onValueChange={([v]) =>
              setAndRender(() => selectedObj!.set("opacity", v / 100))
            }
          />
        </div>
      </Section>

      {/* ── POSITION ─────────────────────────────────────────────────────────── */}
      <Section label="Position">
        <div className="grid grid-cols-2 gap-2">
          {(["left", "top"] as const).map((prop) => (
            <div key={prop} className="space-y-1">
              <Label className="text-[10px] text-white/40 uppercase">{prop}</Label>
              <Input
                type="number"
                value={Math.round((selectedObj?.[prop] as number) ?? 0)}
                onChange={(e) =>
                  setAndRender(() => selectedObj!.set(prop, Number(e.target.value)))
                }
                className="h-7 bg-white/5 border-white/10 text-white text-xs"
              />
            </div>
          ))}
          {(["scaleX", "scaleY"] as const).map((prop) => (
            <div key={prop} className="space-y-1">
              <Label className="text-[10px] text-white/40 uppercase">
                {prop === "scaleX" ? "Scale W" : "Scale H"}
              </Label>
              <Input
                type="number"
                step={0.05}
                value={Number((selectedObj?.[prop] ?? 1).toFixed(2))}
                onChange={(e) =>
                  setAndRender(() => selectedObj!.set(prop, Number(e.target.value)))
                }
                className="h-7 bg-white/5 border-white/10 text-white text-xs"
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
