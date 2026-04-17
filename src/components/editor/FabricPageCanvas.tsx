// components/editor/FabricPageCanvas.tsx
//
// KEY CHANGE vs original:
//
// fireChange() and the imperative toJSON() handle now EXCLUDE __background
// image objects from serialisation. Background images are always re-added
// fresh from page.imageUrl on load — storing them in fabricJson caused:
//   1. Stale coordinates after zoom/resize
//   2. Duplicate stacked images on each reload
//   3. PDF renderer receiving corrupt coordinates
//
// The layout STRUCTURE (rects, lines, text boxes from a layout template) IS
// stored in fabricJson — that is exactly what the PDF renderer reads to
// reproduce the user's chosen layout faithfully.
//
// Everything else is identical to the original file.

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { fabric } from "fabric";
import type { BookPage, BookPageType } from "@/hooks/useBookEditor";

export const PAGE_W = 750;
export const PAGE_H = 1000;

// ─── Patch fabric v5 textBaseline ─────────────────────────────────────────────
(function patchFabricTextBaseline() {
  try {
    const proto = CanvasRenderingContext2D.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "textBaseline");
    if (!desc?.set) return;
    const orig = desc.set;
    Object.defineProperty(proto, "textBaseline", {
      ...desc,
      set(v: string) { orig.call(this, v === "alphabetical" ? "alphabetic" : v); },
    });
  } catch { /* best-effort */ }
})();

// ─── Google Fonts ─────────────────────────────────────────────────────────────
export const GOOGLE_FONTS = [
  "Fredoka One", "Baloo 2", "Nunito", "Poppins", "Playfair Display",
  "Raleway", "Amiri", "Cairo", "Merriweather", "Lato", "Oswald",
  "Montserrat", "Dancing Script", "Pacifico", "Cinzel",
];

function loadGoogleFonts() {
  const id = "noor-editor-fonts";
  if (document.getElementById(id)) return;
  const params = GOOGLE_FONTS.map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`).join("&");
  const link = document.createElement("link");
  link.id = id; link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}

async function preloadFonts(specs: string[]) {
  await Promise.allSettled(specs.map((s) => document.fonts.load(s)));
}

function reflowTextboxes(canvas: fabric.Canvas, isAlive: () => boolean) {
  document.fonts.ready.then(() => {
    if (!isAlive()) return;
    let dirty = false;
    canvas.getObjects().forEach((obj) => {
      if (obj.type === "textbox") {
        (obj as any).dirty = true;
        (obj as fabric.Textbox).initDimensions();
        dirty = true;
      }
    });
    if (dirty && isAlive()) canvas.renderAll();
  });
}

function calcBodyFontSize(
  text: string,
  textWidth: number,
  availableHeight: number,
  lineHeight = 1.65,
  fillRatio = 0.80,
): number {
  if (!text || text.length < 10) return 22;
  const AVG = 0.45;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  const targetH = availableHeight * fillRatio;
  let lo = 14, hi = 26;
  for (let i = 0; i < 10; i++) {
    const mid = (lo + hi) / 2;
    const cpl = Math.floor(textWidth / (mid * AVG));
    const lines = Math.ceil(charCount / Math.max(cpl, 1));
    const h = lines * mid * lineHeight;
    if (h < targetH) lo = mid; else hi = mid;
  }
  const minSize = wordCount < 80 ? 20 : 15;
  return Math.round(Math.max(minSize, Math.min(26, (lo + hi) / 2)));
}

function loadBgImage(
  url: string,
  canvas: fabric.Canvas,
  onDone: (img: fabric.Image) => void,
  clipRect?: { left: number; top: number; width: number; height: number },
) {
  const htmlImg = new Image();
  htmlImg.crossOrigin = "anonymous";

  htmlImg.onload = () => {
    const originalW = htmlImg.naturalWidth || PAGE_W;
    const originalH = htmlImg.naturalHeight || PAGE_H;
    const off = document.createElement("canvas");
    off.width = originalW; off.height = originalH;
    const offCtx = off.getContext("2d");
    if (!offCtx) { fallbackDirectLoad(url, canvas, onDone, clipRect); return; }
    offCtx.drawImage(htmlImg, 0, 0);
    const trimmed = trimImageWhitespace(off, offCtx);
    const finalCanvas = trimmed ?? off;
    const finalUrl = finalCanvas.toDataURL("image/png");

    fabric.Image.fromURL(finalUrl, (img) => {
      const clip = clipRect ?? { left: 0, top: 0, width: PAGE_W, height: PAGE_H };
      const el = (img as any)._element as HTMLImageElement | undefined;
      const natW = el?.naturalWidth || img.width || clip.width;
      const natH = el?.naturalHeight || img.height || clip.height;
      const s = Math.max(clip.width / natW, clip.height / natH);
      const drawW = natW * s, drawH = natH * s;
      img.set({
        originX: "left", originY: "top",
        left: clip.left + (clip.width - drawW) / 2,
        top: clip.top + (clip.height - drawH) / 2,
        scaleX: s, scaleY: s,
        selectable: false, evented: false,
        lockMovementX: true, lockMovementY: true,
      });
      img.clipPath = new fabric.Rect({
        left: clip.left, top: clip.top,
        width: clip.width, height: clip.height,
        absolutePositioned: true,
      });
      (img as any).__background = true;
      onDone(img);
    }, { crossOrigin: "anonymous" });
  };

  htmlImg.onerror = () => fallbackDirectLoad(url, canvas, onDone, clipRect);
  htmlImg.src = url;
}

function fallbackDirectLoad(
  url: string,
  canvas: fabric.Canvas,
  onDone: (img: fabric.Image) => void,
  clipRect?: { left: number; top: number; width: number; height: number },
) {
  fabric.Image.fromURL(url, (img) => {
    const clip = clipRect ?? { left: 0, top: 0, width: PAGE_W, height: PAGE_H };
    const el = (img as any)._element as HTMLImageElement | undefined;
    const natW = el?.naturalWidth || img.width || clip.width;
    const natH = el?.naturalHeight || img.height || clip.height;
    const s = Math.max(clip.width / natW, clip.height / natH);
    const drawW = natW * s, drawH = natH * s;
    img.set({
      originX: "left", originY: "top",
      left: clip.left + (clip.width - drawW) / 2,
      top: clip.top + (clip.height - drawH) / 2,
      scaleX: s, scaleY: s,
      selectable: false, evented: false,
      lockMovementX: true, lockMovementY: true,
    });
    img.clipPath = new fabric.Rect({
      left: clip.left, top: clip.top,
      width: clip.width, height: clip.height,
      absolutePositioned: true,
    });
    (img as any).__background = true;
    onDone(img);
  }, { crossOrigin: "anonymous" });
}

function trimImageWhitespace(
  sourceCanvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): HTMLCanvasElement | null {
  const { width, height } = sourceCanvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let top = height, left = width, right = -1, bottom = -1;
  const alphaThreshold = 8, whiteThreshold = 245;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      const isTransparent = a <= alphaThreshold;
      const isNearWhite = r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold && a > alphaThreshold;
      if (!isTransparent && !isNearWhite) {
        if (x < left) left = x; if (x > right) right = x;
        if (y < top) top = y; if (y > bottom) bottom = y;
      }
    }
  }
  if (right === -1 || bottom === -1) return null;
  const croppedW = right - left + 1, croppedH = bottom - top + 1;
  if (croppedW <= 0 || croppedH <= 0) return null;
  if (left === 0 && top === 0 && croppedW === width && croppedH === height) return sourceCanvas;
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = croppedW; croppedCanvas.height = croppedH;
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return sourceCanvas;
  croppedCtx.drawImage(sourceCanvas, left, top, croppedW, croppedH, 0, 0, croppedW, croppedH);
  return croppedCanvas;
}

// ─── Font combinations ────────────────────────────────────────────────────────
export interface FontCombo {
  id: string; label: string; preview: string;
  heading: { text: string; fontFamily: string; fontSize: number; fontWeight: string; fill: string; fontStyle?: string };
  sub: { text: string; fontFamily: string; fontSize: number; fill: string; fontStyle?: string; charSpacing?: number };
}

export const FONT_COMBOS: FontCombo[] = [
  {
    id: "bold-editorial", label: "Bold Editorial", preview: "Heading",
    heading: { text: "Bold Editorial", fontFamily: "Playfair Display", fontSize: 42, fontWeight: "bold", fill: "#1a1a2e" },
    sub: { text: "Elegant subtitle text", fontFamily: "Raleway", fontSize: 16, fill: "#4a4a6a" }
  },
  {
    id: "modern-clean", label: "Modern Clean", preview: "Modern",
    heading: { text: "Modern Clean", fontFamily: "Montserrat", fontSize: 40, fontWeight: "bold", fill: "#0d0d0d" },
    sub: { text: "SUBTITLE TEXT HERE", fontFamily: "Lato", fontSize: 13, fill: "#888888", charSpacing: 200 }
  },
  {
    id: "elegant-script", label: "Elegant Script", preview: "Elegant",
    heading: { text: "Elegant Script", fontFamily: "Dancing Script", fontSize: 46, fontWeight: "bold", fill: "#2d2d2d" },
    sub: { text: "FINE PRINT DETAIL", fontFamily: "Cinzel", fontSize: 13, fill: "#8b6914", charSpacing: 150 }
  },
  {
    id: "playful-fun", label: "Playful Fun", preview: "Playful",
    heading: { text: "Playful Fun", fontFamily: "Fredoka One", fontSize: 44, fontWeight: "bold", fill: "#e63946" },
    sub: { text: "A fun and friendly subtitle", fontFamily: "Nunito", fontSize: 18, fill: "#457b9d" }
  },
  {
    id: "arabic-modern", label: "Arabic Modern", preview: "Arabic",
    heading: { text: "Arabic Modern", fontFamily: "Cairo", fontSize: 40, fontWeight: "bold", fill: "#1d3557" },
    sub: { text: "الخط الحديث العربي", fontFamily: "Amiri", fontSize: 18, fill: "#457b9d", fontStyle: "italic" }
  },
  {
    id: "cinematic", label: "Cinematic", preview: "Cinematic",
    heading: { text: "CINEMATIC", fontFamily: "Oswald", fontSize: 44, fontWeight: "bold", fill: "#ffffff" },
    sub: { text: "CINEMATIC UNIVERSE", fontFamily: "Raleway", fontSize: 15, fill: "#aaaaaa", charSpacing: 100 }
  },
];

// ─── Public handle ────────────────────────────────────────────────────────────
export type EditorTool = "select" | "text" | "rect" | "circle" | "image" | "triangle" | "line" | "star" | "speech-bubble";

export interface FabricCanvasHandle {
  addText: () => void; addRect: () => void; addCircle: () => void; addTriangle: () => void;
  addLine: () => void; addStar: () => void; addSpeechBubble: () => void;
  addFontCombo: (c: FontCombo) => void; addImageFromUrl: (url: string) => void;
  deleteSelected: () => void; bringForward: () => void; sendBackward: () => void;
  getCanvas: () => fabric.Canvas | null;
  toJSON: () => object;
  toDataURL: () => string;
  setTool: (t: EditorTool) => void;
  applyLayout: (json: object, imageUrl: string | undefined, onDone: () => void) => void;
}

interface Props {
  page: BookPage; scale: number; tool: EditorTool;
  onSelectionChange: (obj: fabric.Object | null) => void;
  onCanvasChange: (json: object, thumbnail: string) => void;
}

// ─── Inline-image layout ──────────────────────────────────────────────────────
async function buildInlineImageLayout(
  page: BookPage,
  canvas: fabric.Canvas,
  isAlive: () => boolean,
  cancelled: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    if (cancelled() || !isAlive()) { resolve(); return; }
    const TEXT_ZONE_H = Math.round(PAGE_H * 0.55);
    const IMG_TOP = TEXT_ZONE_H, IMG_H = PAGE_H - IMG_TOP;
    const TXT_LEFT = 40, TXT_W = PAGE_W - 80;

    const textBg = new fabric.Rect({
      left: 0, top: 0, width: PAGE_W, height: TEXT_ZONE_H,
      fill: "#fffef7", selectable: false, evented: false,
    });
    (textBg as any).__background = true;
    canvas.add(textBg);

    const divLine = new fabric.Line([20, TEXT_ZONE_H, PAGE_W - 20, TEXT_ZONE_H], {
      stroke: "#c9a84c80", strokeWidth: 1, selectable: false, evented: false,
    });
    (divLine as any).__background = true;
    canvas.add(divLine);

    loadBgImage(page.imageUrl, canvas, async (img) => {
      if (cancelled() || !isAlive()) { resolve(); return; }
      canvas.add(img);

      await preloadFonts(["400 26px Lato", "700 26px Lato", "400 12px Cinzel", "700 12px Cinzel"]);
      if (cancelled() || !isAlive()) { resolve(); return; }

      let cursor = 20;
      if (page.subTitle) {
        const hdr = new fabric.Textbox(page.subTitle, {
          left: TXT_LEFT, top: cursor, width: TXT_W,
          fontSize: 11, fontFamily: "Cinzel", fill: "#8b6914",
          textAlign: "center", charSpacing: 160,
        } as fabric.ITextOptions);
        (hdr as any)._role = "chapter-header";
        canvas.add(hdr);
        cursor += 32;
      }

      if (page.text) {
        const availH = TEXT_ZONE_H - cursor - 24, LH = 1.6;
        const norm = page.text.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
        const fontSize = calcBodyFontSize(norm, TXT_W, availH, LH, 0.88);
        const body = new fabric.Textbox(norm, {
          left: TXT_LEFT, top: cursor, width: TXT_W,
          fontSize, fontFamily: "Lato", fill: "#2c1e0f",
          textAlign: "left", lineHeight: LH, splitByGrapheme: false,
        } as fabric.ITextOptions);
        (body as any)._role = "body-text";
        canvas.add(body);
      }

      canvas.renderAll();
      resolve();
    }, { left: 0, top: IMG_TOP, width: PAGE_W, height: IMG_H });
  });
}

// ─── Initial text layers ──────────────────────────────────────────────────────
type InitObj = Partial<fabric.ITextOptions> & { text: string; _role: string; _wrap?: boolean };

function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
  const out: InitObj[] = [];

  if (type === "front-cover") {
    if (page.title) out.push({
      _role: "title", text: page.title, _wrap: true,
      left: 50, top: 60, fontSize: 52, fontFamily: "Fredoka One", fontWeight: "bold",
      fill: "#ffffff", textAlign: "center", width: PAGE_W - 100, lineHeight: 1.2,
      shadow: "2px 4px 12px rgba(0,0,0,0.8)"
    });
    if (page.text) out.push({
      _role: "author", text: page.text.length > 80 ? page.text.slice(0, 77) + "…" : page.text,
      _wrap: true, left: 50, top: PAGE_H - 80, fontSize: 20, fontFamily: "Nunito",
      fontStyle: "italic", fill: "#ffffff", textAlign: "center", width: PAGE_W - 100,
      shadow: "1px 2px 6px rgba(0,0,0,0.7)"
    });
  } else if (type === "spread") {
    if (page.text) {
      const txt = page.text.length > 600 ? page.text.slice(0, 597) + "…" : page.text;
      out.push({
        _role: "body-text", text: txt, _wrap: true,
        left: 40, top: PAGE_H - 220, fontSize: txt.split(/\s+/).length > 12 ? 17 : 20,
        fontFamily: "Nunito", fill: "#ffffff", textAlign: "center", width: PAGE_W - 80,
        lineHeight: 1.55, shadow: "1px 1px 5px rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.38)", padding: 14
      });
    }
  } else if (type === "chapter-opener") {
    if (page.subTitle) out.push({
      _role: "chapter-label", text: page.subTitle.toUpperCase(), _wrap: true,
      left: 20, top: PAGE_H * 0.58, fontSize: 16, fontFamily: "Cinzel", fontWeight: "bold",
      fill: "#f0c060", textAlign: "center", width: PAGE_W - 80, charSpacing: 250,
      shadow: "1px 1px 4px rgba(0,0,0,0.9)"
    });
  } else if (type === "text-page") {
    if (page.subTitle) out.push({
      _role: "chapter-header", text: page.subTitle, _wrap: true,
      left: 40, top: 32, fontSize: 12, fontFamily: "Cinzel",
      fill: "#8b6914", textAlign: "center", width: PAGE_W - 80, charSpacing: 120
    });
    out.push({
      _role: "divider", text: "────────────────────────────────", _wrap: false,
      left: PAGE_W / 2, top: 58, originX: "center",
      fontSize: 9, fontFamily: "Merriweather", fill: "#c9a84c",
      textAlign: "center", width: PAGE_W - 120
    });
    if (page.text) {
      const TEXT_TOP = 76, TEXT_H = PAGE_H - TEXT_TOP - 52, TEXT_W = PAGE_W - 120;
      const MAX_CHARS = 1400;
      const bodyText = page.text.length > MAX_CHARS ? page.text.slice(0, MAX_CHARS - 3) + "…" : page.text;
      const norm = bodyText.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
      const LH = 1.65;
      const fontSize = calcBodyFontSize(norm, TEXT_W, TEXT_H, LH, 0.82);
      out.push({
        _role: "body-text", text: norm, _wrap: true,
        left: 60, top: TEXT_TOP, fontSize, fontFamily: "Lato", fill: "#2c1e0f",
        textAlign: "left", width: TEXT_W, lineHeight: LH, splitByGrapheme: false
      });
    }
    if (page.pageNum) out.push({
      _role: "page-num", text: String(page.pageNum), _wrap: false,
      left: PAGE_W / 2, top: PAGE_H - 46, originX: "center",
      fontSize: 13, fontFamily: "Merriweather", fill: "#8b6914",
      textAlign: "center", width: 60
    });
  } else if (type === "chapter-moment") {
    if (page.text) {
      const cap = page.text.length > 400 ? page.text.slice(0, 397) + "…" : page.text;
      out.push({
        _role: "caption", text: cap, _wrap: true,
        left: 40, top: PAGE_H - 120, fontSize: 15, fontFamily: "Nunito",
        fontStyle: "italic", fill: "#ffffff", textAlign: "center", width: PAGE_W - 80,
        lineHeight: 1.4, shadow: "1px 1px 4px rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.4)", padding: 10
      });
    }
  } else if (type === "back-cover") {
    if (page.text) {
      const syn = page.text.length > 500 ? page.text.slice(0, 497) + "…" : page.text;
      out.push({
        _role: "synopsis", text: syn, _wrap: true,
        left: 60, top: PAGE_H / 2 - 80, fontSize: 17, fontFamily: "Merriweather",
        fill: "#1a1a1a", textAlign: "center", width: PAGE_W - 120, lineHeight: 1.65,
        backgroundColor: "rgba(255,255,255,0.82)", padding: 22
      });
    }
  }

  return out;
}

function clampLoadedObjects(canvas: fabric.Canvas) {
  canvas.getObjects().forEach((obj) => {
    if ((obj as any).__background) { obj.selectable = false; obj.evented = false; return; }
    let dirty = false;
    const G = 20;
    if ((obj.left ?? 0) < 0) { obj.set({ left: 0 }); dirty = true; }
    if ((obj.top ?? 0) < 0) { obj.set({ top: 0 }); dirty = true; }
    const oX = obj.originX ?? "left";
    if (oX === "left" && obj.width !== undefined) {
      const maxW = PAGE_W - (obj.left ?? 0) - G;
      if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; }
    }
    if (oX === "center" && obj.width !== undefined) {
      const maxW = PAGE_W - G * 2;
      if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; }
    }
    if (dirty && obj.type === "textbox") (obj as fabric.Textbox).initDimensions();
  });
}

function isInlineImagePage(page: BookPage): boolean {
  return (
    page.type === "text-page" &&
    !!page.imageUrl && page.imageUrl.trim() !== "" &&
    page.layoutType === "text_inline_image"
  );
}

// ─── KEY HELPER: serialise canvas WITHOUT background image objects ────────────
//
// Background images are always re-added fresh from page.imageUrl on load.
// They must NOT be stored in fabricJson because:
//   - Their left/top/scale are computed at runtime for current zoom/size
//   - Storing stale coords breaks the PDF renderer (wrong position/crop)
//   - Reloading causes duplicate stacked images
//
// Layout structure rects/lines/textboxes ARE stored — they define the layout.

function canvasToJson(canvas: fabric.Canvas): object {
  // Step 1: Remove __background IMAGE objects temporarily
  const bgImages = canvas.getObjects().filter(
    (o) => (o as any).__background && o.type === "image"
  );
  bgImages.forEach((o) => canvas.remove(o));

  // Step 2: Serialise (now only contains layout structure + user objects)
  const json = canvas.toJSON(["__background", "_role"]);

  // Step 3: Re-add background images
  bgImages.forEach((o) => {
    canvas.add(o);
    canvas.sendToBack(o);
  });

  return json;
}

// ─── Component ────────────────────────────────────────────────────────────────
const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ page, scale, tool, onSelectionChange, onCanvasChange }, ref) => {
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

    function live() { return isAliveRef.current ? fabricRef.current : null; }
    // ─── NEW HELPER: insert image at correct z-position ───────────────────────
    // For layouts with an image-zone rect, the image must sit AT that rect's
    // stack index — not at the very back (which puts it under bg color rects).
    // For full-bleed (no image-zone), sendToBack is correct.
    function insertImageAtZone(
      canvas: fabric.Canvas,
      img: fabric.Image,
      imageZoneIndex: number,
    ) {
      canvas.add(img);
      if (imageZoneIndex >= 0) {
        // Move image down from top of stack to the image-zone's position
        const objects = canvas.getObjects();
        const currentIdx = objects.length - 1; // just added = top
        const stepsBack = currentIdx - imageZoneIndex;
        for (let i = 0; i < stepsBack; i++) {
          canvas.sendBackwards(img, true);
        }
      } else {
        canvas.sendToBack(img);
      }
    }

    function applyToolMode(t: EditorTool) {
      const c = live(); if (!c) return;
      c.isDrawingMode = false;
      c.selection = t === "select";
      c.defaultCursor = t === "text" ? "text" : "default";
      c.getObjects().forEach((obj) => {
        if ((obj as any).__background) { obj.selectable = false; obj.evented = false; }
        else obj.selectable = t === "select" || t === "text";
      });
    }

    // ── KEY FIX: fireChange uses canvasToJson which strips background images ──
    function fireChange() {
      const c = live(); if (!c || suppressRef.current) return;
      try {
        const json = canvasToJson(c);
        const thumb = c.toDataURL({ format: "jpeg", quality: 0.35 });
        onChangeRef.current(json, thumb);
      } catch { /* mid-clear */ }
    }

    useImperativeHandle(ref, () => ({
      addText: () => {
        const c = live(); if (!c) return;
        const t = new fabric.Textbox("Type here…", {
          left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 20, width: 300,
          fontSize: 24, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "center"
        });
        c.add(t); c.setActiveObject(t); c.renderAll();
      },
      addRect: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Rect({
          left: PAGE_W / 2 - 80, top: PAGE_H / 2 - 50, width: 160, height: 100,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2, rx: 8, ry: 8
        }));
        c.renderAll();
      },
      addCircle: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Circle({
          left: PAGE_W / 2 - 50, top: PAGE_H / 2 - 50, radius: 50,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2
        }));
        c.renderAll();
      },
      addTriangle: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Triangle({
          left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 50, width: 120, height: 100,
          fill: "rgba(255,255,255,0.8)", stroke: "#333", strokeWidth: 2
        }));
        c.renderAll();
      },
      addLine: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Line([0, 0, 200, 0], {
          stroke: "#333", strokeWidth: 3,
          left: PAGE_W / 2 - 100, top: PAGE_H / 2
        }));
        c.renderAll();
      },
      addStar: () => {
        const c = live(); if (!c) return;
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) {
          const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 === 0 ? 60 : 25;
          pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
        }
        c.add(new fabric.Polygon(pts, {
          left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 60,
          fill: "#f0c060", stroke: "#c9a84c", strokeWidth: 2
        }));
        c.renderAll();
      },
      addSpeechBubble: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Path(
          "M 0 0 Q 0 -80 80 -80 L 220 -80 Q 300 -80 300 0 Q 300 80 220 80 L 80 80 L 40 110 L 60 80 Q 0 80 0 0 Z",
          {
            left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 55,
            fill: "rgba(255,255,255,0.95)", stroke: "#333", strokeWidth: 2
          }
        ));
        c.renderAll();
      },
      addFontCombo: (combo) => {
        const c = live(); if (!c) return;
        c.add(new fabric.Textbox(combo.heading.text, {
          left: 60, top: PAGE_H / 2 - 80, width: PAGE_W - 120,
          fontSize: combo.heading.fontSize, fontFamily: combo.heading.fontFamily,
          fontWeight: combo.heading.fontWeight, fill: combo.heading.fill, textAlign: "center",
          ...(combo.heading.fontStyle ? { fontStyle: combo.heading.fontStyle } : {})
        }));
        const sub = new fabric.Textbox(combo.sub.text, {
          left: 60, top: PAGE_H / 2 + 10, width: PAGE_W - 120,
          fontSize: combo.sub.fontSize, fontFamily: combo.sub.fontFamily,
          fill: combo.sub.fill, textAlign: "center",
          ...(combo.sub.fontStyle ? { fontStyle: combo.sub.fontStyle } : {}),
          ...(combo.sub.charSpacing !== undefined ? { charSpacing: combo.sub.charSpacing } : {})
        });
        c.add(sub); c.setActiveObject(sub); c.renderAll();
      },
      addImageFromUrl: (url) => {
        fabric.Image.fromURL(url, (img) => {
          const c = live(); if (!c) return;
          const el = (img as any)._element as HTMLImageElement | undefined;
          const natW = el?.naturalWidth || img.width || PAGE_W;
          const natH = el?.naturalHeight || img.height || PAGE_H;
          const s = Math.min((PAGE_W * 0.8) / natW, (PAGE_H * 0.8) / natH);
          const drawW = natW * s, drawH = natH * s;
          img.set({
            originX: "left", originY: "top",
            left: (PAGE_W - drawW) / 2, top: (PAGE_H - drawH) / 2,
            scaleX: s, scaleY: s,
          });
          c.add(img); c.setActiveObject(img); c.renderAll();
        }, { crossOrigin: "anonymous" });
      },
      deleteSelected: () => {
        const c = live(); if (!c) return;
        c.getActiveObjects().forEach((o) => { if (!(o as any).__background) c.remove(o); });
        c.discardActiveObject(); c.renderAll(); fireChange();
      },
      bringForward: () => {
        const c = live(); if (!c) return;
        const o = c.getActiveObject(); if (o) c.bringForward(o); c.renderAll(); fireChange();
      },
      sendBackward: () => {
        const c = live(); if (!c) return;
        const o = c.getActiveObject(); if (o) c.sendBackwards(o); c.renderAll(); fireChange();
      },
      getCanvas: () => fabricRef.current,
      applyLayout: (json: object, imageUrl: string | undefined, onDone: () => void) => {
        const c = fabricRef.current;
        if (!c) { onDone(); return; }

        suppressRef.current = true;

        c.loadFromJSON(json, () => {
          if (!fabricRef.current) {
            suppressRef.current = false;
            onDone();
            return;
          }

          const canvas = fabricRef.current;

          canvas.getObjects().forEach((obj) => {
            if ((obj as any).__background) {
              obj.selectable = false;
              obj.evented = false;
            }
          });

          applyToolMode(toolRef.current);

          if (!imageUrl) {
            canvas.renderAll();
            suppressRef.current = false;
            fireChange();
            onDone();
            return;
          }

          // Find image-zone rect and its stack index
          const allObjects = canvas.getObjects();
          const imageZoneIndex = allObjects.findIndex(
            (o) => (o as any)._role === "image-zone"
          );
          const imageZone = imageZoneIndex >= 0
            ? allObjects[imageZoneIndex] as fabric.Rect
            : undefined;

          // Read clip bounds directly from rect properties (not getScaledWidth)
          const clipRect = imageZone
            ? {
              left: imageZone.left ?? 0,
              top: imageZone.top ?? 0,
              width: (imageZone.width ?? PAGE_W) * (imageZone.scaleX ?? 1),
              height: (imageZone.height ?? PAGE_H) * (imageZone.scaleY ?? 1),
            }
            : { left: 0, top: 0, width: PAGE_W, height: PAGE_H };

          // Hide placeholder
          if (imageZone) {
            imageZone.set({ visible: false, opacity: 0 });
            canvas.renderAll();
          }

          // ✅ Preload with HTMLImageElement to get REAL naturalWidth/Height
          // fabric.Image.fromURL callback gets width=0 until element fully loads
          const htmlImg = new Image();
          htmlImg.crossOrigin = "anonymous";

          const placeImage = () => {
            if (!fabricRef.current) {
              suppressRef.current = false;
              onDone();
              return;
            }

            const natW = htmlImg.naturalWidth || clipRect.width;
            const natH = htmlImg.naturalHeight || clipRect.height;
            const s = Math.max(clipRect.width / natW, clipRect.height / natH);
            const drawW = natW * s;
            const drawH = natH * s;

            const fabricImg = new fabric.Image(htmlImg, {
              originX: "left",
              originY: "top",
              left: clipRect.left + (clipRect.width - drawW) / 2,
              top: clipRect.top + (clipRect.height - drawH) / 2,
              scaleX: s,
              scaleY: s,
              selectable: false,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
            });

            fabricImg.clipPath = new fabric.Rect({
              left: clipRect.left,
              top: clipRect.top,
              width: clipRect.width,
              height: clipRect.height,
              absolutePositioned: true,
            });

            (fabricImg as any).__background = true;

            // Insert at correct z-index
            fabricRef.current.add(fabricImg);
            if (imageZoneIndex >= 0) {
              const objs = fabricRef.current.getObjects();
              const currentIdx = objs.length - 1;
              const stepsBack = currentIdx - imageZoneIndex;
              for (let i = 0; i < stepsBack; i++) {
                fabricRef.current.sendBackwards(fabricImg, true);
              }
            } else {
              fabricRef.current.sendToBack(fabricImg);
            }

            fabricRef.current.renderAll();
            suppressRef.current = false;
            fireChange();
            onDone();
          };

          htmlImg.onload = placeImage;
          htmlImg.onerror = () => {
            // Fallback: try fabric.Image.fromURL directly
            fabric.Image.fromURL(imageUrl, (img) => {
              if (!fabricRef.current) {
                suppressRef.current = false;
                onDone();
                return;
              }
              const natW = (img as any)._element?.naturalWidth || clipRect.width;
              const natH = (img as any)._element?.naturalHeight || clipRect.height;
              const s = Math.max(clipRect.width / natW, clipRect.height / natH);
              const drawW = natW * s, drawH = natH * s;
              img.set({
                originX: "left", originY: "top",
                left: clipRect.left + (clipRect.width - drawW) / 2,
                top: clipRect.top + (clipRect.height - drawH) / 2,
                scaleX: s, scaleY: s,
                selectable: false, evented: false,
              });
              img.clipPath = new fabric.Rect({
                left: clipRect.left, top: clipRect.top,
                width: clipRect.width, height: clipRect.height,
                absolutePositioned: true,
              });
              (img as any).__background = true;
              fabricRef.current.add(img);
              fabricRef.current.sendToBack(img);
              fabricRef.current.renderAll();
              suppressRef.current = false;
              fireChange();
              onDone();
            }, { crossOrigin: "anonymous" });
          };

          htmlImg.src = imageUrl;
        });
      },

      // ── toJSON: excludes background IMAGE objects ──────────────────────────
      // Background images are re-added fresh from page.imageUrl on every load.
      // Storing them in fabricJson causes stale coordinates + duplicate images.
      // Layout structure rects/lines/textboxes ARE stored — they define layout.
      toJSON: () => {
        try {
          const c = fabricRef.current;
          if (!c) return {};
          return canvasToJson(c);
        } catch { return {}; }
      },

      toDataURL: () => {
        try { return fabricRef.current?.toDataURL({ format: "jpeg", quality: 0.5 }) ?? ""; }
        catch { return ""; }
      },
      setTool: (t) => { toolRef.current = t; applyToolMode(t); },
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
        backgroundColor: "#f5f0e8", preserveObjectStacking: true, selection: true,
      });
      fCanvas.setZoom(scale);
      fCanvas.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      fabricRef.current = fCanvas;

      // ... all event listeners stay the same ...

      return () => {
        isAliveRef.current = false;
        // ✅ FIX: Set null AFTER dispose, and clear DOM AFTER dispose
        // dispose() needs the canvas element to still exist in the DOM
        // so we must NOT clear innerHTML before calling it.
        const container = containerRef.current;
        try {
          fCanvas.dispose();
        } catch {
          /* ignore disposal errors */
        }
        fabricRef.current = null;
        // Clear the container only after Fabric has finished disposing
        if (container) container.innerHTML = "";
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
        reflowTextboxes(fabricRef.current, () => isAliveRef.current && !cancelled);
      };

      const fontSpecs = [
        "400 26px Lato", "700 26px Lato",
        "400 24px Merriweather", "700 24px Merriweather",
        "400 20px Nunito", "400 16px Cinzel", "700 16px Cinzel", "400 52px Fredoka One",
      ];

      const addTextLayers = async () => {
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;
        await preloadFonts(fontSpecs);
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;
        buildInitialObjects(page, page.type).forEach(({ _role, _wrap, text, ...opts }) => {
          const t = _wrap
            ? new fabric.Textbox(text, opts as fabric.ITextOptions)
            : new fabric.IText(text, opts as fabric.ITextOptions);
          (t as any)._role = _role;
          fabricRef.current!.add(t);
        });
        finish();
      };

      const fj = page.fabricJson as any;
      const fabricHasContent =
        fj && Object.keys(fj).length > 0 &&
        ((Array.isArray(fj.objects) && fj.objects.length > 0) || !!fj.backgroundImage?.src);

      if (isInlineImagePage(page)) {
        c.backgroundColor = "#fffef7";
        buildInlineImageLayout(page, c, () => isAliveRef.current, () => cancelled).then(finish);

      } else if (fabricHasContent) {
        c.loadFromJSON(page.fabricJson, () => {
          if (cancelled || !isAliveRef.current || !fabricRef.current) return;
          clampLoadedObjects(fabricRef.current);

          if (page.imageUrl) {
            const allObjs = fabricRef.current.getObjects();
            const imageZoneIndex = allObjs.findIndex(
              (o) => (o as any)._role === "image-zone"
            );
            const imageZone = imageZoneIndex >= 0
              ? allObjs[imageZoneIndex] as fabric.Rect
              : undefined;

            const clipRect = imageZone
              ? {
                  left: imageZone.left ?? 0,
                  top: imageZone.top ?? 0,
                  width: (imageZone.width ?? PAGE_W) * (imageZone.scaleX ?? 1),
                  height: (imageZone.height ?? PAGE_H) * (imageZone.scaleY ?? 1),
                }
              : { left: 0, top: 0, width: PAGE_W, height: PAGE_H };

            if (imageZone) imageZone.set({ visible: false, opacity: 0 });

            const htmlImg = new Image();
            htmlImg.crossOrigin = "anonymous";

            htmlImg.onload = () => {
              if (cancelled || !isAliveRef.current || !fabricRef.current) return;
              const natW = htmlImg.naturalWidth || clipRect.width;
              const natH = htmlImg.naturalHeight || clipRect.height;
              const s = Math.max(clipRect.width / natW, clipRect.height / natH);
              const drawW = natW * s, drawH = natH * s;

              const fabricImg = new fabric.Image(htmlImg, {
                originX: "left", originY: "top",
                left: clipRect.left + (clipRect.width - drawW) / 2,
                top: clipRect.top + (clipRect.height - drawH) / 2,
                scaleX: s, scaleY: s,
                selectable: false, evented: false,
                lockMovementX: true, lockMovementY: true,
              });
              fabricImg.clipPath = new fabric.Rect({
                left: clipRect.left, top: clipRect.top,
                width: clipRect.width, height: clipRect.height,
                absolutePositioned: true,
              });
              (fabricImg as any).__background = true;
              insertImageAtZone(fabricRef.current!, fabricImg, imageZoneIndex);
              finish();
            };

            htmlImg.onerror = () => {
              if (cancelled || !isAliveRef.current || !fabricRef.current) return;
              loadBgImage(page.imageUrl, fabricRef.current!, (img) => {
                if (cancelled || !isAliveRef.current || !fabricRef.current) return;
                fabricRef.current!.add(img);
                fabricRef.current!.sendToBack(img);
                finish();
              });
            };

            htmlImg.src = page.imageUrl;
          } else {
            finish();
          }
        }); // ← closes loadFromJSON callback

      } else if (page.imageUrl) {
        // No saved fabricJson but has an image — fresh page with bg image
        loadBgImage(page.imageUrl, c, (img) => {
          if (cancelled || !isAliveRef.current || !fabricRef.current) return;
          fabricRef.current!.add(img);
          fabricRef.current!.sendToBack(img);
          addTextLayers();
        });

      } else {
        // No image, no saved JSON — plain colored background
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
      <div ref={containerRef} style={{
        lineHeight: 0, display: "block", overflow: "visible",
        width: PAGE_W * scale, height: PAGE_H * scale,
      }} />
    );
  },
);

FabricPageCanvas.displayName = "FabricPageCanvas";
export default FabricPageCanvas;
 