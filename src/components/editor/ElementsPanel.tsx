// components/editor/ElementsPanel.tsx

import React, { useRef, useState } from "react";
import { fabric } from "fabric";
import { cn } from "@/lib/utils";
import {
  Type,
  Square,
  Layers,
  Upload,
  Circle,
  Triangle,
  Minus,
  Star,
  MessageSquare,
  LayoutTemplate,
} from "lucide-react";
import {
  type FabricCanvasHandle,
  type EditorTool,
  type FontCombo,
  type LayoutAppliedPayload,
  FONT_COMBOS,
  PAGE_W,
  PAGE_H,
} from "./FabricPageCanvas";
import { LayoutPickerPanel } from "./LayoutPickerPanel";

interface ElementsPanelProps {
  canvasRef: React.RefObject<FabricCanvasHandle>;
  activeTool: EditorTool;
  onToolChange: (t: EditorTool) => void;
  onImageUpload: (url: string) => void;
  currentPage?: any;
  onCommitPage?: (pageId: string, payload: any) => void;
  onLayoutPayload?: (payload: LayoutAppliedPayload & { pageId: string }) => Promise<void> | void;
}

type Tab = "layouts" | "text" | "shapes" | "elements" | "uploads";

const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "layouts", label: "Layouts", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "shapes", label: "Shapes", icon: Square },
  { id: "elements", label: "Elements", icon: Layers },
  { id: "uploads", label: "Uploads", icon: Upload },
];

const SHAPE_BUTTONS: {
  label: string;
  icon: React.FC<{ className?: string }>;
  action: (h: FabricCanvasHandle) => void;
}[] = [
    { label: "Rectangle", icon: Square, action: (h) => h.addRect() },
    { label: "Circle", icon: Circle, action: (h) => h.addCircle() },
    { label: "Triangle", icon: Triangle, action: (h) => h.addTriangle() },
    { label: "Line", icon: Minus, action: (h) => h.addLine() },
    { label: "Star", icon: Star, action: (h) => h.addStar() },
    { label: "Speech Bubble", icon: MessageSquare, action: (h) => h.addSpeechBubble() },
  ];

type DecoElement = {
  label: string;
  preview: string;
  previewStyle: React.CSSProperties;
  add: (c: fabric.Canvas) => void;
};

const DECO_ELEMENTS: DecoElement[] = [
  {
    label: "Chapter",
    preview: "CHAPTER I",
    previewStyle: { fontFamily: "Cinzel", fontSize: 10, color: "#8b6914", letterSpacing: "0.15em" },
    add: (c) => {
      const t = new fabric.IText("CHAPTER I", {
        left: PAGE_W / 2, top: PAGE_H / 2,
        originX: "center", originY: "center",
        fontSize: 16, fontFamily: "Cinzel", charSpacing: 200, fill: "#8b6914",
      });
      c.add(t); c.setActiveObject(t); c.renderAll();
    },
  },
  {
    label: "Dots",
    preview: "· · ·",
    previewStyle: { fontFamily: "Merriweather", fontSize: 18, color: "#c9a84c" },
    add: (c) => {
      const t = new fabric.IText("· · ·", {
        left: PAGE_W / 2, top: PAGE_H / 2,
        originX: "center", originY: "center",
        fontSize: 24, fontFamily: "Merriweather", fill: "#c9a84c",
      });
      c.add(t); c.setActiveObject(t); c.renderAll();
    },
  },
  {
    label: "Dashes",
    preview: "— — —",
    previewStyle: { fontFamily: "serif", fontSize: 14, color: "#888" },
    add: (c) => {
      const t = new fabric.IText("— — —", {
        left: PAGE_W / 2, top: PAGE_H / 2,
        originX: "center", originY: "center",
        fontSize: 18, fill: "#555",
      });
      c.add(t); c.setActiveObject(t); c.renderAll();
    },
  },
  {
    label: "Stars",
    preview: "★ ★ ★",
    previewStyle: { fontSize: 14, color: "#f0c060" },
    add: (c) => {
      const t = new fabric.IText("★ ★ ★", {
        left: PAGE_W / 2, top: PAGE_H / 2,
        originX: "center", originY: "center",
        fontSize: 20, fill: "#f0c060",
      });
      c.add(t); c.setActiveObject(t); c.renderAll();
    },
  },
  {
    label: "Quote",
    preview: "\u201C",
    previewStyle: { fontFamily: "Playfair Display", fontSize: 28, color: "rgba(180,160,100,0.7)" },
    add: (c) => {
      const t = new fabric.IText("\u201C", {
        left: PAGE_W / 2, top: PAGE_H / 2,
        originX: "center", originY: "center",
        fontSize: 120, fontFamily: "Playfair Display", fill: "rgba(0,0,0,0.08)",
      });
      c.add(t); c.setActiveObject(t); c.renderAll();
    },
  },
  {
    label: "Divider",
    preview: "────",
    previewStyle: { fontSize: 10, color: "#c9a84c" },
    add: (c) => {
      const line = new fabric.Line([60, 0, PAGE_W - 60, 0], {
        left: 60, top: PAGE_H / 2,
        stroke: "#c9a84c", strokeWidth: 1,
      });
      c.add(line); c.setActiveObject(line); c.renderAll();
    },
  },
];

function FontComboCard({
  combo,
  onAdd,
}: {
  combo: FontCombo;
  onAdd: (combo: FontCombo) => void;
}) {
  const useDarkCard = combo.heading.fill === "#ffffff";
  return (
    <div
      onMouseDown={(e) => { e.preventDefault(); onAdd(combo); }}
      className={cn(
        "rounded-lg shadow-sm p-3 mb-2 cursor-pointer border transition select-none",
        "hover:ring-2 hover:ring-primary",
        useDarkCard
          ? "bg-[#1a1a2e] border-white/10"
          : "bg-white border-gray-200",
      )}
    >
      <div
        style={{
          fontFamily: combo.heading.fontFamily,
          fontSize: 18,
          fontWeight: combo.heading.fontWeight as React.CSSProperties["fontWeight"],
          color: combo.heading.fill,
          lineHeight: 1.2,
          fontStyle: combo.heading.fontStyle ?? "normal",
        }}
        className="truncate"
      >
        {combo.heading.text}
      </div>
      <div
        style={{
          fontFamily: combo.sub.fontFamily,
          fontSize: 10,
          color: combo.sub.fill,
          letterSpacing: combo.sub.charSpacing
            ? `${(combo.sub.charSpacing / 1000).toFixed(3)}em`
            : undefined,
          marginTop: 3,
          fontStyle: combo.sub.fontStyle ?? "normal",
        }}
        className="truncate"
      >
        {combo.sub.text}
      </div>
    </div>
  );
}

export function ElementsPanel({
  currentPage,
  canvasRef,
  onImageUpload,
  onLayoutPayload,
}: ElementsPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("layouts");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) onImageUpload(url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) onImageUpload(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-[280px] shrink-0 bg-[#1a1d23] border-r border-white/10 flex flex-col h-full overflow-hidden">

      <div className="flex border-b border-white/10 shrink-0 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onMouseDown={(e) => { e.preventDefault(); setActiveTab(id); }}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all relative shrink-0",
              activeTab === id
                ? "text-primary"
                : "text-white/40 hover:text-white/70",
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {activeTab === id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">

        {activeTab === "layouts" && (
          <LayoutPickerPanel
            canvasRef={canvasRef}
            currentPage={currentPage}
            onLayoutPayload={onLayoutPayload}
            onLayoutApplied={() => {
              canvasRef.current?.setTool("select");
            }}
          />
        )}

        {activeTab === "text" && (
          <div className="p-3 space-y-3">
            <button
              onMouseDown={(e) => { e.preventDefault(); canvasRef.current?.addText(); }}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-lg transition"
            >
              + Add a text box
            </button>

            <div>
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
                Font combinations
              </p>
              {FONT_COMBOS.map((combo) => (
                <FontComboCard
                  key={combo.id}
                  combo={combo}
                  onAdd={(c) => canvasRef.current?.addFontCombo(c)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "shapes" && (
          <div className="p-3">
            <div className="grid grid-cols-3 gap-2">
              {SHAPE_BUTTONS.map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (canvasRef.current) action(canvasRef.current);
                  }}
                  className="rounded-xl bg-white/5 hover:bg-white/10 p-4 flex flex-col items-center gap-2 transition select-none"
                >
                  <Icon className="w-8 h-8 text-white/70" />
                  <span className="text-[11px] text-white/60">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "elements" && (
          <div className="p-3">
            <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-2">
              Decorative elements
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DECO_ELEMENTS.map(({ label, preview, previewStyle, add }) => (
                <div
                  key={label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    const c = canvasRef.current?.getCanvas();
                    if (c) add(c);
                  }}
                  className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 p-3 cursor-pointer flex flex-col items-center gap-1.5 select-none transition"
                >
                  <span style={previewStyle} className="leading-none">
                    {preview}
                  </span>
                  <span className="text-[10px] text-white/40">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "uploads" && (
          <div className="p-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onMouseDown={(e) => { e.preventDefault(); fileRef.current?.click(); }}
              className="border-2 border-dashed border-white/20 hover:border-primary/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Upload className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-sm text-white/60 font-medium text-center">
                Click to upload image
              </p>
              <p className="text-xs text-white/30 text-center">
                Drag and drop supported
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

      </div>
    </div>
  );
}