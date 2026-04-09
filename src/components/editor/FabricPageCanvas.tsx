// components/editor/FabricPageCanvas.tsx
// Fabric.js canvas for a single book page.
//
// KEY ARCHITECTURE NOTES:
// ────────────────────────
// 1. React owns ONE <div ref={containerRef}> — nothing else.
//    The <canvas> element is created imperatively so React's reconciler
//    never holds a direct ref to it. This prevents the
//    "removeChild: node is not a child of this node" DOMException that
//    fires when Fabric wraps/moves the canvas element on init/dispose.
//
// 2. All async callbacks (fabric.Image.fromURL, loadFromJSON) guard with
//    `isAliveRef` (component-lifetime) + `cancelled` (per-effect-run).
//    This prevents "clearRect on null" crashes when a page switch triggers
//    unmount before an in-flight image load completes.
//
// 3. fabric.Canvas.setZoom(scale) + setDimensions is used for scaling so
//    Fabric's internal hit-testing stays in sync with the visual size.
//
// 4. TEXT FIX — font loading + Fabric v5 justify bug:
//    a) Fabric calculates Textbox line-breaks at add/load time using whatever
//       font is available at that moment. Fix: await document.fonts.load()
//       BEFORE adding any Textbox so Fabric measures with real font metrics.
//    b) Fabric v5 Textbox with textAlign:"justify" has a known bug that strips
//       inter-word spaces during line measurement, causing words to merge.
//       Fix: use textAlign:"left" for body text.
//    c) reflowTextboxes() is kept as a safety net for the loadFromJSON path.

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { fabric } from "fabric";
import type { BookPage, BookPageType } from "@/hooks/useBookEditor";

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_W = 750;
export const PAGE_H = 1000;

// ─── Patch fabric v5's invalid textBaseline value ────────────────────────────

(function patchFabricTextBaseline() {
  try {
    const proto = CanvasRenderingContext2D.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "textBaseline");
    if (!desc?.set) return;
    const originalSet = desc.set;
    Object.defineProperty(proto, "textBaseline", {
      ...desc,
      set(value: string) {
        originalSet.call(this, value === "alphabetical" ? "alphabetic" : value);
      },
    });
  } catch { /* best-effort */ }
})();

// ─── Google Fonts loader ──────────────────────────────────────────────────────

export const GOOGLE_FONTS = [
  "Fredoka One", "Baloo 2", "Nunito", "Poppins", "Playfair Display",
  "Raleway", "Amiri", "Cairo", "Merriweather", "Lato", "Oswald",
  "Montserrat", "Dancing Script", "Pacifico", "Cinzel",
];

function loadGoogleFonts() {
  const id = "noor-editor-fonts";
  if (document.getElementById(id)) return;
  const params = GOOGLE_FONTS
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`)
    .join("&");
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}

// ─── Font preloader ───────────────────────────────────────────────────────────
// Waits for specific fonts to be available before Fabric measures text.
// This ensures Textbox wraps with correct glyph widths from the start.

async function preloadFonts(specs: string[]) {
  await Promise.allSettled(specs.map((s) => document.fonts.load(s)));
}

// ─── Font-ready Textbox reflow ────────────────────────────────────────────────
// Safety net for the loadFromJSON path where we can't preload before add.
// Calls initDimensions() on every Textbox after document.fonts.ready.

function reflowTextboxes(canvas: fabric.Canvas, isAlive: () => boolean) {
  document.fonts.ready.then(() => {
    if (!isAlive()) return;
    let needsRender = false;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        const tb = obj as fabric.Textbox;
        (tb as any).dirty = true;
        tb.initDimensions();
        needsRender = true;
      }
    });
    if (needsRender && isAlive()) canvas.renderAll();
  });
}

// ─── Font combinations ────────────────────────────────────────────────────────

export interface FontCombo {
  id: string;
  label: string;
  preview: string;
  heading: {
    text: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fill: string;
    fontStyle?: string;
  };
  sub: {
    text: string;
    fontFamily: string;
    fontSize: number;
    fill: string;
    fontStyle?: string;
    charSpacing?: number;
  };
}

export const FONT_COMBOS: FontCombo[] = [
  {
    id: "bold-editorial",
    label: "Bold Editorial",
    preview: "Heading",
    heading: { text: "Bold Editorial", fontFamily: "Playfair Display", fontSize: 42, fontWeight: "bold", fill: "#1a1a2e" },
    sub: { text: "Elegant subtitle text", fontFamily: "Raleway", fontSize: 16, fill: "#4a4a6a" },
  },
  {
    id: "modern-clean",
    label: "Modern Clean",
    preview: "Modern",
    heading: { text: "Modern Clean", fontFamily: "Montserrat", fontSize: 40, fontWeight: "bold", fill: "#0d0d0d" },
    sub: { text: "SUBTITLE TEXT HERE", fontFamily: "Lato", fontSize: 13, fill: "#888888", charSpacing: 200 },
  },
  {
    id: "elegant-script",
    label: "Elegant Script",
    preview: "Elegant",
    heading: { text: "Elegant Script", fontFamily: "Dancing Script", fontSize: 46, fontWeight: "bold", fill: "#2d2d2d" },
    sub: { text: "FINE PRINT DETAIL", fontFamily: "Cinzel", fontSize: 13, fill: "#8b6914", charSpacing: 150 },
  },
  {
    id: "playful-fun",
    label: "Playful Fun",
    preview: "Playful",
    heading: { text: "Playful Fun", fontFamily: "Fredoka One", fontSize: 44, fontWeight: "bold", fill: "#e63946" },
    sub: { text: "A fun and friendly subtitle", fontFamily: "Nunito", fontSize: 18, fill: "#457b9d" },
  },
  {
    id: "arabic-modern",
    label: "Arabic Modern",
    preview: "Arabic",
    heading: { text: "Arabic Modern", fontFamily: "Cairo", fontSize: 40, fontWeight: "bold", fill: "#1d3557" },
    sub: { text: "الخط الحديث العربي", fontFamily: "Amiri", fontSize: 18, fill: "#457b9d", fontStyle: "italic" },
  },
  {
    id: "cinematic",
    label: "Cinematic",
    preview: "Cinematic",
    heading: { text: "CINEMATIC", fontFamily: "Oswald", fontSize: 44, fontWeight: "bold", fill: "#ffffff" },
    sub: { text: "CINEMATIC UNIVERSE", fontFamily: "Raleway", fontSize: 15, fill: "#aaaaaa", charSpacing: 100 },
  },
];

// ─── Public handle ────────────────────────────────────────────────────────────

export type EditorTool = "select" | "text" | "rect" | "circle" | "image" | "triangle" | "line" | "star" | "speech-bubble";

export interface FabricCanvasHandle {
  addText: () => void;
  addRect: () => void;
  addCircle: () => void;
  addTriangle: () => void;
  addLine: () => void;
  addStar: () => void;
  addSpeechBubble: () => void;
  addFontCombo: (combo: FontCombo) => void;
  addImageFromUrl: (url: string) => void;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  getCanvas: () => fabric.Canvas | null;
  toJSON: () => object;
  toDataURL: () => string;
  setTool: (tool: EditorTool) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  page: BookPage;
  scale: number;
  tool: EditorTool;
  onSelectionChange: (obj: fabric.Object | null) => void;
  onCanvasChange: (json: object, thumbnail: string) => void;
}

// ─── Initial text layers per page type ───────────────────────────────────────
//
// LAYOUT RULES:
//   • All left-anchored Textboxes: left + width ≤ PAGE_W − 20
//   • Body text: left 60 + width 630 = right edge 690 < 750 ✓
//   • _wrap:true  → fabric.Textbox  (auto word-wrap by width)
//   • _wrap:false → fabric.IText    (single line, fixed content only)
//   • NEVER use textAlign:"justify" on Textbox — Fabric v5 bug strips spaces

type InitObj = Partial<fabric.ITextOptions> & {
  text: string;
  _role: string;
  _wrap?: boolean;
};

function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
  const out: InitObj[] = [];

  // ── Front cover ──────────────────────────────────────────────────────────────
  if (type === "front-cover") {
    if (page.title)
      out.push({
        _role: "title", text: page.title, _wrap: true,
        left: 50, top: 60,
        fontSize: 52, fontFamily: "Fredoka One", fontWeight: "bold",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 100,
        lineHeight: 1.2, shadow: "2px 4px 12px rgba(0,0,0,0.8)",
      });
    if (page.text) {
      const authorLine = page.text.length > 60
        ? page.text.slice(0, 57) + "…"
        : page.text;
      out.push({
        _role: "author", text: authorLine, _wrap: true,
        left: 50, top: PAGE_H - 80,
        fontSize: 20, fontFamily: "Nunito", fontStyle: "italic",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 100,
        shadow: "1px 2px 6px rgba(0,0,0,0.7)",
      });
    }
  }

  // ── Spread ───────────────────────────────────────────────────────────────────
  else if (type === "spread") {
    if (page.text) {
      const txt = page.text.length > 240
        ? page.text.slice(0, 237) + "…"
        : page.text;
      out.push({
        _role: "body-text", text: txt, _wrap: true,
        left: 40, top: PAGE_H - 190,
        fontSize: 20, fontFamily: "Nunito",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 80,
        lineHeight: 1.55, shadow: "1px 1px 5px rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.38)", padding: 14,
      });
    }
  }

  // ── Chapter opener ────────────────────────────────────────────────────────────
  else if (type === "chapter-opener") {
    if (page.subTitle)
      out.push({
        _role: "chapter-label", text: page.subTitle.toUpperCase(), _wrap: true,
        left: 20, top: PAGE_H * 0.58,
        fontSize: 16, fontFamily: "Cinzel", fontWeight: "bold",
        fill: "#f0c060", textAlign: "center", width: PAGE_W - 80,
        charSpacing: 250, shadow: "1px 1px 4px rgba(0,0,0,0.9)",
      });
  }

  // ── Text page ─────────────────────────────────────────────────────────────────
  else if (type === "text-page") {
    if (page.subTitle)
      out.push({
        _role: "chapter-header", text: page.subTitle, _wrap: true,
        left: 40, top: 32,
        fontSize: 12, fontFamily: "Cinzel",
        fill: "#8b6914", textAlign: "center", width: PAGE_W - 80,
        charSpacing: 120,
      });

    // Short fixed decorative line — IText is fine here
    out.push({
      _role: "divider",
      text: "────────────────────────────────",
      _wrap: false,
      left: PAGE_W / 2, top: 64, originX: "center",
      fontSize: 9, fontFamily: "Merriweather",
      fill: "#c9a84c", textAlign: "center", width: PAGE_W - 120,
    });

    if (page.text) {
      const MAX_CHARS = 1200;
      const bodyText = page.text.length > MAX_CHARS
        ? page.text.slice(0, MAX_CHARS - 3) + "…"
        : page.text;

      // Normalize: collapse all whitespace/newlines into single spaces.
      // Do NOT manually insert \n — let Fabric.Textbox wrap by pixel width.
      const normalizedText = bodyText
        .replace(/\r\n|\r|\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      out.push({
        _role: "body-text",
        text: normalizedText,
        _wrap: true,
        left: 60,
        top: 90,
        fontSize: 24,
        fontFamily: "Merriweather",
        fill: "#2c1e0f",
        textAlign: "left",
        width: PAGE_W - 120,       // 630px — symmetric 60px margins each side
        lineHeight: 1.7,
        splitByGrapheme: false,
      });
    }

    if (page.pageNum)
      out.push({
        _role: "page-num", text: String(page.pageNum), _wrap: false,
        left: PAGE_W / 2, top: PAGE_H - 48, originX: "center",
        fontSize: 13, fontFamily: "Merriweather",
        fill: "#8b6914", textAlign: "center", width: 60,
      });
  }

  // ── Chapter moment ────────────────────────────────────────────────────────────
  else if (type === "chapter-moment") {
    if (page.text) {
      const cap = page.text.length > 160
        ? page.text.slice(0, 157) + "…"
        : page.text;
      out.push({
        _role: "caption", text: cap, _wrap: true,
        left: 40, top: PAGE_H - 120,
        fontSize: 15, fontFamily: "Nunito", fontStyle: "italic",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 80,
        lineHeight: 1.4, shadow: "1px 1px 4px rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.4)", padding: 10,
      });
    }
  }

  // ── Back cover ────────────────────────────────────────────────────────────────
  else if (type === "back-cover") {
    if (page.text) {
      const syn = page.text.length > 350
        ? page.text.slice(0, 347) + "…"
        : page.text;
      out.push({
        _role: "synopsis", text: syn, _wrap: true,
        left: 60, top: PAGE_H / 2 - 80,
        fontSize: 17, fontFamily: "Merriweather",
        fill: "#1a1a1a", textAlign: "center", width: PAGE_W - 120,
        lineHeight: 1.65,
        backgroundColor: "rgba(255,255,255,0.82)", padding: 22,
      });
    }
  }

  return out;
}

// ─── Clamp loaded objects within canvas bounds ────────────────────────────────

function clampLoadedObjects(canvas: fabric.Canvas) {
  canvas.getObjects().forEach((obj) => {
    if ((obj as any).__background) {
      obj.selectable = false;
      obj.evented = false;
      return;
    }
    let dirty = false;
    const GUTTER = 20;
    if ((obj.left ?? 0) < 0) { obj.set({ left: 0 }); dirty = true; }
    if ((obj.top ?? 0) < 0) { obj.set({ top: 0 }); dirty = true; }

    const originX = obj.originX ?? "left";
    if (originX === "left" && obj.width !== undefined) {
      const maxW = PAGE_W - (obj.left ?? 0) - GUTTER;
      if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; }
    }
    if (originX === "center" && obj.width !== undefined) {
      const maxW = PAGE_W - GUTTER * 2;
      if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; }
    }
    if (dirty && obj.type === "textbox") {
      (obj as fabric.Textbox).initDimensions();
    }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ page, scale, tool, onSelectionChange, onCanvasChange }, ref) => {
    console.log("Rendering FabricPageCanvas", { page });

    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const toolRef = useRef<EditorTool>(tool);
    const pageIdRef = useRef<string>("");
    const suppressRef = useRef(false);
    const isAliveRef = useRef(true);

    const onSelectionRef = useRef(onSelectionChange);
    const onChangeRef = useRef(onCanvasChange);
    useEffect(() => { onSelectionRef.current = onSelectionChange; });
    useEffect(() => { onChangeRef.current = onCanvasChange; });

    function live(): fabric.Canvas | null {
      return isAliveRef.current ? fabricRef.current : null;
    }

    function applyToolMode(t: EditorTool) {
      const c = live();
      if (!c) return;
      c.isDrawingMode = false;
      c.selection = t === "select";
      c.defaultCursor = t === "text" ? "text" : "default";
      c.getObjects().forEach((obj) => {
        if ((obj as any).__background) {
          obj.selectable = false;
          obj.evented = false;
        } else {
          obj.selectable = t === "select" || t === "text";
        }
      });
    }

    function fireChange() {
      const c = live();
      if (!c || suppressRef.current) return;
      try {
        const json = c.toJSON();
        const thumb = c.toDataURL({ format: "jpeg", quality: 0.35 });
        onChangeRef.current(json, thumb);
      } catch { /* mid-clear */ }
    }

    useImperativeHandle(ref, () => ({
      addText: () => {
        const c = live(); if (!c) return;
        const t = new fabric.Textbox("Type here…", {
          left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 20, width: 300,
          fontSize: 24, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "center",
        });
        c.add(t); c.setActiveObject(t); c.renderAll();
      },
      addRect: () => {
        const c = live(); if (!c) return;
        const r = new fabric.Rect({
          left: PAGE_W / 2 - 80, top: PAGE_H / 2 - 50, width: 160, height: 100,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2, rx: 8, ry: 8,
        });
        c.add(r); c.setActiveObject(r); c.renderAll();
      },
      addCircle: () => {
        const c = live(); if (!c) return;
        const ci = new fabric.Circle({
          left: PAGE_W / 2 - 50, top: PAGE_H / 2 - 50, radius: 50,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2,
        });
        c.add(ci); c.setActiveObject(ci); c.renderAll();
      },
      addTriangle: () => {
        const c = live(); if (!c) return;
        const tri = new fabric.Triangle({
          left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 50,
          width: 120, height: 100,
          fill: "rgba(255,255,255,0.8)", stroke: "#333", strokeWidth: 2,
        });
        c.add(tri); c.setActiveObject(tri); c.renderAll();
      },
      addLine: () => {
        const c = live(); if (!c) return;
        const line = new fabric.Line([0, 0, 200, 0], {
          stroke: "#333", strokeWidth: 3,
          left: PAGE_W / 2 - 100, top: PAGE_H / 2,
        });
        c.add(line); c.setActiveObject(line); c.renderAll();
      },
      addStar: () => {
        const c = live(); if (!c) return;
        const points: { x: number; y: number }[] = [];
        const outerR = 60, innerR = 25, numPoints = 5;
        for (let i = 0; i < numPoints * 2; i++) {
          const angle = (i * Math.PI) / numPoints - Math.PI / 2;
          const r = i % 2 === 0 ? outerR : innerR;
          points.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
        }
        const star = new fabric.Polygon(points, {
          left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 60,
          fill: "#f0c060", stroke: "#c9a84c", strokeWidth: 2,
        });
        c.add(star); c.setActiveObject(star); c.renderAll();
      },
      addSpeechBubble: () => {
        const c = live(); if (!c) return;
        const bubble = new fabric.Path(
          "M 0 0 Q 0 -80 80 -80 L 220 -80 Q 300 -80 300 0 Q 300 80 220 80 L 80 80 L 40 110 L 60 80 Q 0 80 0 0 Z",
          {
            left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 55,
            fill: "rgba(255,255,255,0.95)", stroke: "#333", strokeWidth: 2,
          },
        );
        c.add(bubble); c.setActiveObject(bubble); c.renderAll();
      },
      addFontCombo: (combo: FontCombo) => {
        const c = live(); if (!c) return;
        const heading = new fabric.Textbox(combo.heading.text, {
          left: 60, top: PAGE_H / 2 - 80,
          width: PAGE_W - 120,
          fontSize: combo.heading.fontSize,
          fontFamily: combo.heading.fontFamily,
          fontWeight: combo.heading.fontWeight,
          fill: combo.heading.fill,
          textAlign: "center",
          ...(combo.heading.fontStyle ? { fontStyle: combo.heading.fontStyle } : {}),
        });
        const sub = new fabric.Textbox(combo.sub.text, {
          left: 60, top: PAGE_H / 2 + 10,
          width: PAGE_W - 120,
          fontSize: combo.sub.fontSize,
          fontFamily: combo.sub.fontFamily,
          fill: combo.sub.fill,
          textAlign: "center",
          ...(combo.sub.fontStyle ? { fontStyle: combo.sub.fontStyle } : {}),
          ...(combo.sub.charSpacing !== undefined ? { charSpacing: combo.sub.charSpacing } : {}),
        });
        c.add(heading);
        c.add(sub);
        c.setActiveObject(sub);
        c.renderAll();
      },
      addImageFromUrl: (url: string) => {
        fabric.Image.fromURL(url, (img) => {
          const c = live(); if (!c) return;
          const s = Math.min(
            (PAGE_W * 0.5) / (img.width || 1),
            (PAGE_H * 0.5) / (img.height || 1),
          );
          img.scale(s);
          img.set({
            left: PAGE_W / 2, top: PAGE_H / 2,
            originX: "center", originY: "center",
          });
          c.add(img); c.setActiveObject(img); c.renderAll();
        }, { crossOrigin: "anonymous" });
      },
      deleteSelected: () => {
        const c = live(); if (!c) return;
        c.getActiveObjects().forEach((o) => {
          if (!(o as any).__background) c.remove(o);
        });
        c.discardActiveObject(); c.renderAll(); fireChange();
      },
      bringForward: () => {
        const c = live(); if (!c) return;
        const o = c.getActiveObject();
        if (o) c.bringForward(o); c.renderAll(); fireChange();
      },
      sendBackward: () => {
        const c = live(); if (!c) return;
        const o = c.getActiveObject();
        if (o) c.sendBackwards(o); c.renderAll(); fireChange();
      },
      getCanvas: () => fabricRef.current,
      toJSON: () => {
        try { return fabricRef.current?.toJSON() ?? {}; } catch { return {}; }
      },
      toDataURL: () => {
        try {
          return fabricRef.current?.toDataURL({ format: "jpeg", quality: 0.5 }) ?? "";
        } catch { return ""; }
      },
      setTool: (t: EditorTool) => { toolRef.current = t; applyToolMode(t); },
    }));

    // ── Mount ──────────────────────────────────────────────────────────────────
    useEffect(() => {
      loadGoogleFonts();
      isAliveRef.current = true;
      if (!containerRef.current) return;

      const canvasEl = document.createElement("canvas");
      containerRef.current.appendChild(canvasEl);

      const fCanvas = new fabric.Canvas(canvasEl, {
        width: PAGE_W, height: PAGE_H,
        backgroundColor: "#f5f0e8",
        preserveObjectStacking: true,
        selection: true,
      });
      fCanvas.setZoom(scale);
      fCanvas.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      fabricRef.current = fCanvas;

      fCanvas.on("mouse:down", (e) => {
        if (e.target) return;
        const ptr = fCanvas.getPointer(e.e);
        if (toolRef.current === "text") {
          const t = new fabric.Textbox("Type here…", {
            left: Math.min(ptr.x, PAGE_W - 310),
            top: Math.min(ptr.y, PAGE_H - 40),
            width: 300, fontSize: 20, fontFamily: "Nunito",
            fill: "#1a1a1a", textAlign: "left",
          });
          fCanvas.add(t); fCanvas.setActiveObject(t);
          t.enterEditing(); fCanvas.renderAll();
        } else if (toolRef.current === "rect") {
          const r = new fabric.Rect({
            left: ptr.x - 60, top: ptr.y - 40, width: 120, height: 80,
            fill: "rgba(255,255,255,0.8)", stroke: "#555", strokeWidth: 2, rx: 6, ry: 6,
          });
          fCanvas.add(r); fCanvas.setActiveObject(r); fCanvas.renderAll();
        } else if (toolRef.current === "circle") {
          const ci = new fabric.Circle({
            left: ptr.x - 40, top: ptr.y - 40, radius: 40,
            fill: "rgba(255,255,255,0.8)", stroke: "#555", strokeWidth: 2,
          });
          fCanvas.add(ci); fCanvas.setActiveObject(ci); fCanvas.renderAll();
        }
      });

      fCanvas.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj || (obj as any).__background) return;
        const br = obj.getBoundingRect(true);
        if (br.left < 0)
          obj.set({ left: (obj.left ?? 0) - br.left });
        if (br.top < 0)
          obj.set({ top: (obj.top ?? 0) - br.top });
        if (br.left + br.width > PAGE_W)
          obj.set({ left: (obj.left ?? 0) - (br.left + br.width - PAGE_W) });
        if (br.top + br.height > PAGE_H)
          obj.set({ top: (obj.top ?? 0) - (br.top + br.height - PAGE_H) });
      });

      fCanvas.on("selection:created", (e) => {
        if (isAliveRef.current)
          onSelectionRef.current((e as any).selected?.[0] ?? null);
      });
      fCanvas.on("selection:updated", (e) => {
        if (isAliveRef.current)
          onSelectionRef.current((e as any).selected?.[0] ?? null);
      });
      fCanvas.on("selection:cleared", () => {
        if (isAliveRef.current) onSelectionRef.current(null);
      });
      fCanvas.on("object:modified", fireChange);
      fCanvas.on("object:added", () => { if (!suppressRef.current) fireChange(); });
      fCanvas.on("object:removed", fireChange);
      fCanvas.on("text:changed", fireChange);

      return () => {
        isAliveRef.current = false;
        fabricRef.current = null;
        try { fCanvas.dispose(); } catch { /* ignore */ }
        if (containerRef.current) containerRef.current.innerHTML = "";
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Sync scale ─────────────────────────────────────────────────────────────
    useEffect(() => {
      const c = live(); if (!c) return;
      c.setZoom(scale);
      c.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      c.renderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    // ── Load page ──────────────────────────────────────────────────────────────
    useEffect(() => {
      const c = live(); if (!c) return;
      if (pageIdRef.current === page.id) return;
      pageIdRef.current = page.id;

      let cancelled = false;

      suppressRef.current = true;
      c.clear();
      c.backgroundColor = page.imageUrl ? "#111111" : "#f5f0e8";

      const finish = () => {
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;
        suppressRef.current = false;
        applyToolMode(toolRef.current);
        fabricRef.current.renderAll();
        // Safety-net reflow for loadFromJSON path
        const snap = fabricRef.current;
        reflowTextboxes(snap, () => isAliveRef.current && !cancelled);
      };

      // ✅ Preload fonts BEFORE adding Textboxes so Fabric measures correctly
      const addTextLayers = async () => {
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;

        // Wait for the fonts used in body text to be ready
        await preloadFonts([
          "400 24px Merriweather",
          "700 24px Merriweather",
          "400 20px Nunito",
          "400 16px Cinzel",
          "700 16px Cinzel",
          "400 52px Fredoka One",
        ]);

        if (cancelled || !isAliveRef.current || !fabricRef.current) return;

        buildInitialObjects(page, page.type).forEach(
          ({ _role, _wrap, text, ...opts }) => {
            const t = _wrap
              ? new fabric.Textbox(text, opts as fabric.ITextOptions)
              : new fabric.IText(text, opts as fabric.ITextOptions);
            (t as any)._role = _role;
            fabricRef.current!.add(t);
          },
        );
        finish();
      };

      if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
        c.loadFromJSON(page.fabricJson, () => {
          if (cancelled || !isAliveRef.current || !fabricRef.current) return;
          clampLoadedObjects(fabricRef.current);
          finish();
        });
      } else if (page.imageUrl) {
        fabric.Image.fromURL(
          page.imageUrl,
          (img) => {
            if (cancelled || !isAliveRef.current || !fabricRef.current) return;
            const canvas = fabricRef.current!;
            const el = (img as any)._element as HTMLImageElement | undefined;
            const natW = el?.naturalWidth || img.width || PAGE_W;
            const natH = el?.naturalHeight || img.height || PAGE_H;
            const s = Math.max(PAGE_W / natW, PAGE_H / natH);
            img.set({
              originX: "center", originY: "center",
              left: PAGE_W / 2, top: PAGE_H / 2,
              scaleX: s, scaleY: s,
              selectable: false, evented: false,
              lockMovementX: true, lockMovementY: true,
            });
            (img as any).__background = true;
            canvas.add(img);
            canvas.sendToBack(img);
            addTextLayers();
          },
          { crossOrigin: "anonymous" },
        );
      } else {
        const bgColors: Record<BookPageType, string> = {
          "front-cover": "#1a2744",
          "back-cover": "#1a2744",
          "spread": "#fdf8f0",
          "chapter-opener": "#1e3a5f",
          "chapter-moment": "#1e3a5f",
          "text-page": "#fffef7",
        };
        c.backgroundColor = bgColors[page.type] ?? "#f5f0e8";
        addTextLayers();
      }

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);

    // ── Sync tool ──────────────────────────────────────────────────────────────
    useEffect(() => {
      toolRef.current = tool;
      applyToolMode(tool);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tool]);

    return (
      <div
        ref={containerRef}
        style={{
          lineHeight: 0,
          display: "block",
          overflow: "visible",
          width: PAGE_W * scale,
          height: PAGE_H * scale,
        }}
      />
    );
  },
);

FabricPageCanvas.displayName = "FabricPageCanvas";
export default FabricPageCanvas;