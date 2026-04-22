// components/editor/FabricPageCanvas.tsx
//
// FIXED v3 — bulletproof persistence via layoutKey.
//
// Strategy change:
//   Instead of saving a giant fabricJson with a baked image (which relies on
//   the image's src URL surviving serialisation + backend sanitization), we
//   save a small `layoutKey` string on the page (e.g. "text-top") plus any
//   user text edits extracted from the canvas.
//
//   On EVERY page load:
//     1. If page.layoutKey is set: rebuild the template fresh, bake the
//        image from page.imageUrl, then re-apply the user's saved text edits.
//     2. Otherwise: use the legacy fabricJson path or the default page type
//        renderer.
//
//   This means the image is ALWAYS re-baked from the current URL — no
//   reliance on the saved JSON having a valid image src. Text edits made
//   by the user after applying the layout are preserved.

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { fabric } from "fabric";
import type { BookPage, BookPageType } from "@/hooks/useBookEditor";
import {
  getTemplateFabricJson,
  LAYOUT_TEMPLATES,
  LayoutTemplateKey,
} from "@/lib/layoutTemplates";

export const PAGE_W = 750;
export const PAGE_H = 1000;

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
  text: string, textWidth: number, availableHeight: number,
  lineHeight = 1.65, fillRatio = 0.80,
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

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function readRawRect(obj: fabric.Object): { left: number; top: number; width: number; height: number } {
  const w = (obj.width ?? 0) * (obj.scaleX ?? 1);
  const h = (obj.height ?? 0) * (obj.scaleY ?? 1);
  const rawLeft = obj.left ?? 0;
  const rawTop = obj.top ?? 0;

  const originX = obj.originX ?? "left";
  const originY = obj.originY ?? "top";

  const left = originX === "center" ? rawLeft - w / 2
             : originX === "right"  ? rawLeft - w
             : rawLeft;
  const top  = originY === "center" ? rawTop - h / 2
             : originY === "bottom" ? rawTop - h
             : rawTop;

  return { left, top, width: w, height: h };
}

function coverFitGeometry(
  naturalW: number, naturalH: number,
  clip: { left: number; top: number; width: number; height: number },
): { left: number; top: number; scale: number; drawW: number; drawH: number } {
  const s = (naturalW > 0 && naturalH > 0)
    ? Math.max(clip.width / naturalW, clip.height / naturalH)
    : 1;
  const drawW = naturalW * s;
  const drawH = naturalH * s;
  return {
    left: clip.left + (clip.width - drawW) / 2,
    top:  clip.top  + (clip.height - drawH) / 2,
    scale: s,
    drawW, drawH,
  };
}

// ─── Image preload ────────────────────────────────────────────────────────────

function preloadFabricImageRaw(url: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    if (!url || typeof url !== "string") {
      reject(new Error("empty image url"));
      return;
    }
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) { reject(new Error("fabric.Image.fromURL returned null")); return; }
        resolve(img);
      },
      { crossOrigin: "anonymous" },
    );
  });
}

function trimImageWhitespace(
  sourceCanvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D,
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
  const out = document.createElement("canvas");
  out.width = croppedW; out.height = croppedH;
  const outCtx = out.getContext("2d");
  if (!outCtx) return sourceCanvas;
  outCtx.drawImage(sourceCanvas, left, top, croppedW, croppedH, 0, 0, croppedW, croppedH);
  return out;
}

function preloadFabricImageTrimmed(url: string): Promise<fabric.Image> {
  return new Promise((resolve, reject) => {
    const htmlImg = new Image();
    htmlImg.crossOrigin = "anonymous";

    const makeFabricImg = (src: string) => {
      fabric.Image.fromURL(
        src,
        (img) => {
          if (!img) { reject(new Error("fabric.Image.fromURL returned null")); return; }
          resolve(img);
        },
        { crossOrigin: "anonymous" },
      );
    };

    htmlImg.onload = () => {
      try {
        const off = document.createElement("canvas");
        off.width  = htmlImg.naturalWidth  || PAGE_W;
        off.height = htmlImg.naturalHeight || PAGE_H;
        const ctx = off.getContext("2d");
        if (!ctx) { makeFabricImg(url); return; }
        ctx.drawImage(htmlImg, 0, 0);
        const trimmed = trimImageWhitespace(off, ctx);
        makeFabricImg((trimmed ?? off).toDataURL("image/png"));
      } catch {
        makeFabricImg(url);
      }
    };
    htmlImg.onerror = () => makeFabricImg(url);
    htmlImg.src = url;
  });
}

// ─── FontCombo definitions (unchanged) ────────────────────────────────────────

export interface FontCombo {
  id: string; label: string; preview: string;
  heading: { text: string; fontFamily: string; fontSize: number; fontWeight: string; fill: string; fontStyle?: string };
  sub: { text: string; fontFamily: string; fontSize: number; fill: string; fontStyle?: string; charSpacing?: number };
}

export const FONT_COMBOS: FontCombo[] = [
  { id: "bold-editorial", label: "Bold Editorial", preview: "Heading", heading: { text: "Bold Editorial", fontFamily: "Playfair Display", fontSize: 42, fontWeight: "bold", fill: "#1a1a2e" }, sub: { text: "Elegant subtitle text", fontFamily: "Raleway", fontSize: 16, fill: "#4a4a6a" } },
  { id: "modern-clean", label: "Modern Clean", preview: "Modern", heading: { text: "Modern Clean", fontFamily: "Montserrat", fontSize: 40, fontWeight: "bold", fill: "#0d0d0d" }, sub: { text: "SUBTITLE TEXT HERE", fontFamily: "Lato", fontSize: 13, fill: "#888888", charSpacing: 200 } },
  { id: "elegant-script", label: "Elegant Script", preview: "Elegant", heading: { text: "Elegant Script", fontFamily: "Dancing Script", fontSize: 46, fontWeight: "bold", fill: "#2d2d2d" }, sub: { text: "FINE PRINT DETAIL", fontFamily: "Cinzel", fontSize: 13, fill: "#8b6914", charSpacing: 150 } },
  { id: "playful-fun", label: "Playful Fun", preview: "Playful", heading: { text: "Playful Fun", fontFamily: "Fredoka One", fontSize: 44, fontWeight: "bold", fill: "#e63946" }, sub: { text: "A fun and friendly subtitle", fontFamily: "Nunito", fontSize: 18, fill: "#457b9d" } },
  { id: "arabic-modern", label: "Arabic Modern", preview: "Arabic", heading: { text: "Arabic Modern", fontFamily: "Cairo", fontSize: 40, fontWeight: "bold", fill: "#1d3557" }, sub: { text: "الخط الحديث العربي", fontFamily: "Amiri", fontSize: 18, fill: "#457b9d", fontStyle: "italic" } },
  { id: "cinematic", label: "Cinematic", preview: "Cinematic", heading: { text: "CINEMATIC", fontFamily: "Oswald", fontSize: 44, fontWeight: "bold", fill: "#ffffff" }, sub: { text: "CINEMATIC UNIVERSE", fontFamily: "Raleway", fontSize: 15, fill: "#aaaaaa", charSpacing: 100 } },
];

export type EditorTool = "select" | "text" | "rect" | "circle" | "image" | "triangle" | "line" | "star" | "speech-bubble";

// Payload fired when a layout is applied — contains what the parent needs
// to persist so the layout can be rebuilt on next load.
export interface LayoutAppliedPayload {
  layoutKey: LayoutTemplateKey;
  bodyText: string | null;
  bodyTextStyles: BodyTextStyles | null;
  fabricJson: object;
  thumbnail: string;
}

/**
 * BodyTextStyles — captures user style overrides on the body-text textbox
 * so they survive template rebuild on reload. Each property is OPTIONAL —
 * if undefined, the template default is used.
 */
export interface BodyTextStyles {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: string;
  underline?: boolean;
  fill?: string;
  textAlign?: string;
  lineHeight?: number;
  charSpacing?: number;
  backgroundColor?: string;
  // Per-character styles map from Fabric Textbox
  // Shape: { lineIdx: { charIdx: { fontWeight, fill, ... } } }
  styles?: Record<string, Record<string, Record<string, unknown>>>;
  // If present, overrides left/top/width (user moved/resized the textbox)
  left?: number;
  top?: number;
  width?: number;
}

export interface FabricCanvasHandle {
  addText: () => void; addRect: () => void; addCircle: () => void; addTriangle: () => void;
  addLine: () => void; addStar: () => void; addSpeechBubble: () => void;
  addFontCombo: (c: FontCombo) => void; addImageFromUrl: (url: string) => void;
  deleteSelected: () => void; bringForward: () => void; sendBackward: () => void;
  getCanvas: () => fabric.Canvas | null;
  toJSON: () => object | null;
  toDataURL: () => string;
  setTool: (t: EditorTool) => void;
  applyLayout: (layoutKey: LayoutTemplateKey, imageUrl: string | undefined, bodyText: string | undefined, onDone: (payload: LayoutAppliedPayload) => void) => void;
  nudgeLayoutText: () => boolean;
  // NEW: extract current body-text styles (for parent to save)
  extractBodyTextStyles: () => BodyTextStyles | null;
  // NEW: undo/redo snapshot API
  snapshotState: () => object | null;
  restoreState: (json: object) => Promise<void>;
}

interface Props {
  page: BookPage;
  scale: number;
  tool: EditorTool;
  onSelectionChange: (obj: fabric.Object | null) => void;
  onCanvasChange: (json: object, thumbnail: string) => void;
  onLayoutComplete?: (payload: LayoutAppliedPayload) => void;
  reloadNonce?: number;
}

// ─── buildInlineImageLayout (unchanged) ───────────────────────────────────────

async function buildInlineImageLayout(
  page: BookPage, canvas: fabric.Canvas,
  isAlive: () => boolean, cancelled: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    if (cancelled() || !isAlive()) { resolve(); return; }
    const TEXT_ZONE_H = Math.round(PAGE_H * 0.55);
    const IMG_TOP = TEXT_ZONE_H, IMG_H = PAGE_H - IMG_TOP;
    const TXT_LEFT = 40, TXT_W = PAGE_W - 80;
    const textBg = new fabric.Rect({ left: 0, top: 0, width: PAGE_W, height: TEXT_ZONE_H, fill: "#fffef7", selectable: false, evented: false });
    (textBg as any).__background = true;
    canvas.add(textBg);
    const divLine = new fabric.Line([20, TEXT_ZONE_H, PAGE_W - 20, TEXT_ZONE_H], { stroke: "#c9a84c80", strokeWidth: 1, selectable: false, evented: false });
    (divLine as any).__background = true;
    canvas.add(divLine);

    preloadFabricImageTrimmed(page.imageUrl).then(async (img) => {
      if (cancelled() || !isAlive()) { resolve(); return; }
      const el = (img as any)._element as HTMLImageElement | undefined;
      const natW = el?.naturalWidth || (img as any).width || IMG_H;
      const natH = el?.naturalHeight || (img as any).height || IMG_H;
      const clip = { left: 0, top: IMG_TOP, width: PAGE_W, height: IMG_H };
      const geom = coverFitGeometry(natW, natH, clip);
      img.set({
        originX: "left", originY: "top",
        left: geom.left, top: geom.top,
        scaleX: geom.scale, scaleY: geom.scale,
        selectable: false, evented: false,
        lockMovementX: true, lockMovementY: true,
      });
      img.clipPath = new fabric.Rect({
        left: clip.left, top: clip.top, width: clip.width, height: clip.height,
        absolutePositioned: true,
      });
      (img as any).__background = true;
      canvas.add(img);

      await preloadFonts(["400 26px Lato", "700 26px Lato", "400 12px Cinzel", "700 12px Cinzel"]);
      if (cancelled() || !isAlive()) { resolve(); return; }
      let cursor = 20;
      if (page.subTitle) {
        const hdr = new fabric.Textbox(page.subTitle, { left: TXT_LEFT, top: cursor, width: TXT_W, fontSize: 11, fontFamily: "Cinzel", fill: "#8b6914", textAlign: "center", charSpacing: 160 } as fabric.ITextOptions);
        (hdr as any)._role = "chapter-header";
        canvas.add(hdr); cursor += 32;
      }
      if (page.text) {
        const availH = TEXT_ZONE_H - cursor - 24, LH = 1.6;
        const norm = page.text.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
        const fontSize = calcBodyFontSize(norm, TXT_W, availH, LH, 0.88);
        const body = new fabric.Textbox(norm, { left: TXT_LEFT, top: cursor, width: TXT_W, fontSize, fontFamily: "Lato", fill: "#2c1e0f", textAlign: "left", lineHeight: LH, splitByGrapheme: false } as fabric.ITextOptions);
        (body as any)._role = "body-text";
        canvas.add(body);
      }
      canvas.renderAll(); resolve();
    });
  });
}

type InitObj = Partial<fabric.ITextOptions> & { text: string; _role: string; _wrap?: boolean };

function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
  const out: InitObj[] = [];
  if (type === "front-cover") {
    if (page.title) out.push({ _role: "title", text: page.title, _wrap: true, left: 50, top: 60, fontSize: 52, fontFamily: "Fredoka One", fontWeight: "bold", fill: "#ffffff", textAlign: "center", width: PAGE_W - 100, lineHeight: 1.2, shadow: "2px 4px 12px rgba(0,0,0,0.8)" });
    if (page.text) out.push({ _role: "author", text: page.text.length > 80 ? page.text.slice(0, 77) + "…" : page.text, _wrap: true, left: 50, top: PAGE_H - 80, fontSize: 20, fontFamily: "Nunito", fontStyle: "italic", fill: "#ffffff", textAlign: "center", width: PAGE_W - 100, shadow: "1px 2px 6px rgba(0,0,0,0.7)" });
  } else if (type === "spread") {
    if (page.text) { const txt = page.text.length > 600 ? page.text.slice(0, 597) + "…" : page.text; out.push({ _role: "body-text", text: txt, _wrap: true, left: 40, top: PAGE_H - 220, fontSize: txt.split(/\s+/).length > 12 ? 17 : 20, fontFamily: "Nunito", fill: "#ffffff", textAlign: "center", width: PAGE_W - 80, lineHeight: 1.55, shadow: "1px 1px 5px rgba(0,0,0,0.9)", backgroundColor: "rgba(0,0,0,0.38)", padding: 14 }); }
  } else if (type === "chapter-opener") {
    if (page.subTitle) out.push({ _role: "chapter-label", text: page.subTitle.toUpperCase(), _wrap: true, left: 20, top: PAGE_H * 0.58, fontSize: 16, fontFamily: "Cinzel", fontWeight: "bold", fill: "#f0c060", textAlign: "center", width: PAGE_W - 80, charSpacing: 250, shadow: "1px 1px 4px rgba(0,0,0,0.9)" });
  } else if (type === "text-page") {
    if (page.subTitle) out.push({ _role: "chapter-header", text: page.subTitle, _wrap: true, left: 40, top: 32, fontSize: 12, fontFamily: "Cinzel", fill: "#8b6914", textAlign: "center", width: PAGE_W - 80, charSpacing: 120 });
    out.push({ _role: "divider", text: "────────────────────────────────", _wrap: false, left: PAGE_W / 2, top: 58, originX: "center", fontSize: 9, fontFamily: "Merriweather", fill: "#c9a84c", textAlign: "center", width: PAGE_W - 120 });
    if (page.text) {
      const TEXT_TOP = 76, TEXT_H = PAGE_H - TEXT_TOP - 52, TEXT_W = PAGE_W - 120;
      const bodyText = page.text.length > 1400 ? page.text.slice(0, 1397) + "…" : page.text;
      const norm = bodyText.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
      const LH = 1.65;
      const fontSize = calcBodyFontSize(norm, TEXT_W, TEXT_H, LH, 0.82);
      out.push({ _role: "body-text", text: norm, _wrap: true, left: 60, top: TEXT_TOP, fontSize, fontFamily: "Lato", fill: "#2c1e0f", textAlign: "left", width: TEXT_W, lineHeight: LH, splitByGrapheme: false });
    }
    if (page.pageNum) out.push({ _role: "page-num", text: String(page.pageNum), _wrap: false, left: PAGE_W / 2, top: PAGE_H - 46, originX: "center", fontSize: 13, fontFamily: "Merriweather", fill: "#8b6914", textAlign: "center", width: 60 });
  } else if (type === "chapter-moment") {
    if (page.text) { const cap = page.text.length > 400 ? page.text.slice(0, 397) + "…" : page.text; out.push({ _role: "caption", text: cap, _wrap: true, left: 40, top: PAGE_H - 120, fontSize: 15, fontFamily: "Nunito", fontStyle: "italic", fill: "#ffffff", textAlign: "center", width: PAGE_W - 80, lineHeight: 1.4, shadow: "1px 1px 4px rgba(0,0,0,0.9)", backgroundColor: "rgba(0,0,0,0.4)", padding: 10 }); }
  } else if (type === "back-cover") {
    if (page.text) { const syn = page.text.length > 500 ? page.text.slice(0, 497) + "…" : page.text; out.push({ _role: "synopsis", text: syn, _wrap: true, left: 60, top: PAGE_H / 2 - 80, fontSize: 17, fontFamily: "Merriweather", fill: "#1a1a1a", textAlign: "center", width: PAGE_W - 120, lineHeight: 1.65, backgroundColor: "rgba(255,255,255,0.82)", padding: 22 }); }
  }
  return out;
}

function clampLoadedObjects(canvas: fabric.Canvas) {
  canvas.getObjects().forEach((obj) => {
    if ((obj as any).__background || (obj as any)._role === "image-zone" || (obj as any)._layoutBaked) { obj.selectable = false; obj.evented = false; return; }
    let dirty = false;
    const G = 20;
    if ((obj.left ?? 0) < 0) { obj.set({ left: 0 }); dirty = true; }
    if ((obj.top ?? 0) < 0) { obj.set({ top: 0 }); dirty = true; }
    const oX = obj.originX ?? "left";
    if (oX === "left" && obj.width !== undefined) { const maxW = PAGE_W - (obj.left ?? 0) - G; if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; } }
    if (oX === "center" && obj.width !== undefined) { const maxW = PAGE_W - G * 2; if (obj.width > maxW) { obj.set({ width: Math.max(maxW, 40) }); dirty = true; } }
    if (dirty && obj.type === "textbox") (obj as fabric.Textbox).initDimensions();
  });
}

function isInlineImagePage(page: BookPage): boolean {
  return page.type === "text-page" && !!page.imageUrl && page.imageUrl.trim() !== "" && page.layoutType === "text_inline_image";
}

// canvasToJson — strip legacy __background images; keep baked layout images.
function canvasToJson(canvas: fabric.Canvas): object {
  const legacyBgImages = canvas.getObjects().filter(
    (o) => (o as any).__background && o.type === "image",
  );
  legacyBgImages.forEach((o) => canvas.remove(o));
  const json = canvas.toJSON(["__background", "_role", "_layoutBaked"]);
  legacyBgImages.forEach((o) => { canvas.add(o); canvas.sendToBack(o); });
  return json;
}

// Extract the current body-text from the canvas (user may have edited it).
function extractBodyText(canvas: fabric.Canvas): string | null {
  const bodyTextObj = canvas.getObjects().find(
    (o: any) => o._role === "body-text" && o.type === "textbox",
  );
  if (bodyTextObj && typeof (bodyTextObj as any).text === "string") {
    return (bodyTextObj as any).text;
  }
  return null;
}

// Extract current style state from the body-text object. Returns null if no
// body-text found. Captures font, size, weight, style, colour, alignment,
// spacing, AND per-character styles map from setSelectionStyles.
function extractBodyTextStylesFromCanvas(canvas: fabric.Canvas): BodyTextStyles | null {
  const tb = canvas.getObjects().find(
    (o: any) => o._role === "body-text" && o.type === "textbox",
  ) as fabric.Textbox | undefined;
  if (!tb) return null;

  const styles: BodyTextStyles = {};
  if (typeof (tb as any).fontFamily === "string") styles.fontFamily = (tb as any).fontFamily;
  if (typeof (tb as any).fontSize === "number") styles.fontSize = (tb as any).fontSize;
  if ((tb as any).fontWeight !== undefined) styles.fontWeight = (tb as any).fontWeight;
  if (typeof (tb as any).fontStyle === "string") styles.fontStyle = (tb as any).fontStyle;
  if (typeof (tb as any).underline === "boolean") styles.underline = (tb as any).underline;
  if (typeof (tb as any).fill === "string") styles.fill = (tb as any).fill;
  if (typeof (tb as any).textAlign === "string") styles.textAlign = (tb as any).textAlign;
  if (typeof (tb as any).lineHeight === "number") styles.lineHeight = (tb as any).lineHeight;
  if (typeof (tb as any).charSpacing === "number") styles.charSpacing = (tb as any).charSpacing;
  if (typeof (tb as any).backgroundColor === "string") styles.backgroundColor = (tb as any).backgroundColor;

  if (typeof tb.left === "number") styles.left = tb.left;
  if (typeof tb.top === "number") styles.top = tb.top;
  if (typeof tb.width === "number") styles.width = tb.width;

  // Per-character styles map (from setSelectionStyles)
  // Shape: { [lineIdx]: { [charIdx]: {...styles} } }
  const perCharStyles = (tb as any).styles;
  if (perCharStyles && typeof perCharStyles === "object") {
    const hasAny = Object.keys(perCharStyles).some((lineIdx) => {
      const line = perCharStyles[lineIdx];
      return line && typeof line === "object" && Object.keys(line).length > 0;
    });
    if (hasAny) {
      // Deep clone to be safe for serialisation
      try {
        styles.styles = JSON.parse(JSON.stringify(perCharStyles));
      } catch { /* ignore */ }
    }
  }

  return styles;
}

// Apply saved style overrides to the body-text textbox on the canvas.
// Called after a template is rebuilt on reload.
function applyBodyTextStylesToCanvas(canvas: fabric.Canvas, styles: BodyTextStyles | null | undefined) {
  if (!styles) return;
  const tb = canvas.getObjects().find(
    (o: any) => o._role === "body-text" && o.type === "textbox",
  ) as fabric.Textbox | undefined;
  if (!tb) return;

  const opts: Record<string, unknown> = {};
  if (styles.fontFamily !== undefined) opts.fontFamily = styles.fontFamily;
  if (styles.fontSize !== undefined) opts.fontSize = styles.fontSize;
  if (styles.fontWeight !== undefined) opts.fontWeight = styles.fontWeight;
  if (styles.fontStyle !== undefined) opts.fontStyle = styles.fontStyle;
  if (styles.underline !== undefined) opts.underline = styles.underline;
  if (styles.fill !== undefined) opts.fill = styles.fill;
  if (styles.textAlign !== undefined) opts.textAlign = styles.textAlign;
  if (styles.lineHeight !== undefined) opts.lineHeight = styles.lineHeight;
  if (styles.charSpacing !== undefined) opts.charSpacing = styles.charSpacing;
  if (styles.backgroundColor !== undefined) opts.backgroundColor = styles.backgroundColor;
  if (styles.left !== undefined) opts.left = styles.left;
  if (styles.top !== undefined) opts.top = styles.top;
  if (styles.width !== undefined) opts.width = styles.width;

  try { tb.set(opts as fabric.ITextOptions); } catch { /* ignore */ }

  // Apply per-character styles (rebuilt styles object)
  if (styles.styles && typeof styles.styles === "object") {
    try {
      (tb as any).styles = JSON.parse(JSON.stringify(styles.styles));
    } catch { /* ignore */ }
  }

  try { tb.initDimensions(); } catch { /* ignore */ }
  (tb as any).dirty = true;
}

// ─── buildLayoutOnCanvas ──────────────────────────────────────────────────────
//
// The single source of truth for rendering a layout. Called from BOTH
// applyLayout (user click) AND the page-load effect (on page open).
//
// Steps:
//   1. Clear canvas
//   2. loadFromJSON(template)  → template chrome placed
//   3. Find all image-zone rects, read their geometry
//   4. Load the image from URL
//   5. For each zone: remove it, add a clone of the image positioned +
//      clipped to that zone
//   6. If bodyText is provided, override the default template body-text.
//
async function buildLayoutOnCanvas(
  canvas: fabric.Canvas,
  layoutKey: LayoutTemplateKey,
  imageUrl: string | undefined,
  bodyTextOverride: string | undefined,
  bodyTextStyles: BodyTextStyles | null | undefined,
  isStale: () => boolean,
  userObjects?: any[] | null,  // custom objects user added on top of template
): Promise<void> {
  // 1. Get a fresh template JSON (deep clone so we don't mutate the cache)
  const json = getTemplateFabricJson(layoutKey) as any;

  // 2. Override body-text if we have user-edited content
  if (bodyTextOverride && typeof bodyTextOverride === "string" && Array.isArray(json.objects)) {
    json.objects.forEach((obj: any) => {
      if (obj.type === "textbox" && obj._role === "body-text") {
        obj.text = bodyTextOverride;
      }
    });
  }

  // 3. Clear existing canvas objects.
  try {
    canvas.getObjects().slice().forEach((o) => {
      try { canvas.remove(o); } catch { /* ignore */ }
    });
    try { canvas.discardActiveObject(); } catch { /* ignore */ }
  } catch (err) {
    console.warn("[buildLayoutOnCanvas] clear failed:", err);
  }

  // 4. Set background color from template.
  if (typeof json.background === "string") {
    canvas.backgroundColor = json.background;
  }

  if (isStale()) return;

  // 5. MANUALLY construct each template object and add it to the canvas.
  //    This avoids loadFromJSON internals which race with our object
  //    removal in step 8. We explicitly pass `styles: {}` to Textbox to
  //    avoid a known Fabric bug where missing styles causes render errors.
  if (!Array.isArray(json.objects)) {
    return;
  }

  type ZoneInfo = {
    templateIdx: number;
    clip: { left: number; top: number; width: number; height: number };
  };
  const zones: ZoneInfo[] = [];
  const placedObjects: fabric.Object[] = [];

  for (let ti = 0; ti < json.objects.length; ti++) {
    const spec = json.objects[ti];
    let obj: fabric.Object | null = null;

    try {
      if (spec.type === "rect") {
        const rectOpts: fabric.IRectOptions = {
          left: spec.left ?? 0,
          top: spec.top ?? 0,
          width: spec.width ?? 100,
          height: spec.height ?? 100,
          fill: spec.fill ?? "transparent",
          originX: spec.originX ?? "left",
          originY: spec.originY ?? "top",
          selectable: spec.selectable !== false,
          evented: spec.evented !== false,
        };
        if (spec.stroke) rectOpts.stroke = spec.stroke;
        if (typeof spec.strokeWidth === "number") rectOpts.strokeWidth = spec.strokeWidth;
        if (typeof spec.rx === "number") rectOpts.rx = spec.rx;
        if (typeof spec.ry === "number") rectOpts.ry = spec.ry;
        if (typeof spec.opacity === "number") rectOpts.opacity = spec.opacity;
        obj = new fabric.Rect(rectOpts);
      } else if (spec.type === "line") {
        obj = new fabric.Line(
          [spec.x1 ?? 0, spec.y1 ?? 0, spec.x2 ?? 100, spec.y2 ?? 0],
          {
            left: spec.left ?? 0,
            top: spec.top ?? 0,
            stroke: spec.stroke ?? "#000",
            strokeWidth: spec.strokeWidth ?? 1,
            originX: spec.originX ?? "left",
            originY: spec.originY ?? "top",
            selectable: spec.selectable !== false,
            evented: spec.evented !== false,
          },
        );
      } else if (spec.type === "textbox") {
        // EXPLICITLY pass styles: {} to avoid the Fabric "undefined[0]" bug
        const tbOpts: fabric.ITextOptions = {
          left: spec.left ?? 0,
          top: spec.top ?? 0,
          width: spec.width ?? 200,
          fontSize: spec.fontSize ?? 16,
          fontFamily: spec.fontFamily ?? "Lato",
          fontWeight: spec.fontWeight ?? "normal",
          fill: spec.fill ?? "#000",
          textAlign: spec.textAlign ?? "left",
          lineHeight: spec.lineHeight ?? 1.16,
          originX: spec.originX ?? "left",
          originY: spec.originY ?? "top",
          selectable: spec.selectable !== false,
          evented: spec.evented !== false,
          styles: {},
        } as fabric.ITextOptions;
        if (spec.fontStyle) (tbOpts as any).fontStyle = spec.fontStyle;
        if (typeof spec.charSpacing === "number") (tbOpts as any).charSpacing = spec.charSpacing;
        if (spec.shadow) (tbOpts as any).shadow = spec.shadow;
        if (spec.backgroundColor) (tbOpts as any).backgroundColor = spec.backgroundColor;
        if (typeof spec.padding === "number") (tbOpts as any).padding = spec.padding;

        const tb = new fabric.Textbox(String(spec.text ?? ""), tbOpts);
        // Force dimension recalculation in case font-load affects width
        try { tb.initDimensions(); } catch { /* ignore */ }
        obj = tb;
      }
    } catch (err) {
      console.warn("[buildLayoutOnCanvas] failed to construct object", spec, err);
      continue;
    }

    if (!obj) continue;

    // Transfer metadata flags
    if (spec._role) (obj as any)._role = spec._role;
    if (spec.__background) (obj as any).__background = true;

    // Non-interactive for backgrounds and zones
    if (spec.__background || spec._role === "image-zone") {
      obj.selectable = false;
      obj.evented = false;
    }

    // Record zone info (keep rect in canvas for now as placeholder)
    if (spec._role === "image-zone") {
      const clip = readRawRect(obj);
      if (clip.width > 10 && clip.height > 10) {
        zones.push({ templateIdx: ti, clip });
      }
    }

    try {
      canvas.add(obj);
      placedObjects[ti] = obj;
    } catch (err) {
      console.warn("[buildLayoutOnCanvas] failed to add object", err);
    }
  }

  if (isStale()) return;

  // 6. Render once before baking image, so the template is visible even if
  //    the image load is slow.
  try { canvas.renderAll(); } catch { /* ignore */ }

  // 7. Defer image baking to next frame to let current render settle.
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => resolve());
    else setTimeout(() => resolve(), 16);
  });

  if (isStale()) return;

  // 8. Bake image into zones
  if (imageUrl && imageUrl.trim() && zones.length > 0) {
    let img: fabric.Image | null = null;
    try {
      img = await preloadFabricImageRaw(imageUrl);
    } catch (err) {
      console.error("[buildLayoutOnCanvas] image load failed:", err);
    }

    if (isStale()) return;

    if (img) {
      const el = (img as any)._element as HTMLImageElement | undefined;
      const natW = el?.naturalWidth || img.width || PAGE_W;
      const natH = el?.naturalHeight || img.height || PAGE_H;

      for (let zi = 0; zi < zones.length; zi++) {
        if (isStale()) return;

        const zone = zones[zi];
        const clip = zone.clip;
        const zoneObj = placedObjects[zone.templateIdx];
        if (!zoneObj) continue;

        const geom = coverFitGeometry(natW, natH, clip);

        let placed: fabric.Image | null = null;
        try {
          if (zi === 0) {
            placed = img;
          } else {
            placed = await new Promise<fabric.Image | null>((resolve) => {
              let cloneDone = false;
              const cloneTimer = setTimeout(() => {
                if (!cloneDone) { cloneDone = true; resolve(null); }
              }, 3000);
              try {
                img!.clone((cloned: fabric.Image) => {
                  if (!cloneDone) { cloneDone = true; clearTimeout(cloneTimer); resolve(cloned); }
                });
              } catch {
                if (!cloneDone) { cloneDone = true; clearTimeout(cloneTimer); resolve(null); }
              }
            });
          }
        } catch (err) {
          console.error("[buildLayoutOnCanvas] clone failed for zone", zi, err);
          continue;
        }

        if (!placed || isStale()) continue;

        const clipRect = new fabric.Rect({
          left: clip.left,
          top: clip.top,
          width: clip.width,
          height: clip.height,
          absolutePositioned: true,
        });

        placed.set({
          originX: "left",
          originY: "top",
          left: geom.left,
          top: geom.top,
          scaleX: geom.scale,
          scaleY: geom.scale,
          selectable: false,
          evented: false,
          lockMovementX: true,
          lockMovementY: true,
          clipPath: clipRect,
        } as any);
        (placed as any)._layoutBaked = true;

        // Remove zone placeholder and add image at same z-position
        const zoneIdxOnCanvas = canvas.getObjects().indexOf(zoneObj);
        try { canvas.remove(zoneObj); } catch { /* ignore */ }

        try {
          canvas.add(placed);
          if (zoneIdxOnCanvas >= 0) {
            const curIdx = canvas.getObjects().indexOf(placed);
            const steps = curIdx - zoneIdxOnCanvas;
            for (let s = 0; s < steps; s++) canvas.sendBackwards(placed, true);
          }
        } catch (err) {
          console.error("[buildLayoutOnCanvas] add image failed:", err);
        }
      }
    }
    // If image load failed, zones stay as visible placeholders.
  }

  // 9. Apply saved body-text style overrides (if any) so user formatting
  //    from prior sessions is restored on top of the freshly-built template.
  if (bodyTextStyles) {
    try {
      applyBodyTextStylesToCanvas(canvas, bodyTextStyles);
    } catch (err) {
      console.warn("[buildLayoutOnCanvas] applyBodyTextStyles failed:", err);
    }
  }

  // 10. Re-add user-authored objects (Chapter, Dots, custom shapes, etc.) that
  //     were saved on top of the template. These have no _role/__background/
  //     _layoutBaked markers and must survive template rebuilds.
  if (userObjects && Array.isArray(userObjects) && userObjects.length > 0) {
    await new Promise<void>((resolve) => {
      try {
        (fabric as any).util.enlivenObjects(
          userObjects,
          (enlivened: fabric.Object[]) => {
            if (!isStale()) {
              enlivened.forEach((obj) => {
                try { canvas.add(obj); } catch { /* ignore */ }
              });
            }
            resolve();
          },
          "fabric",
        );
        // Safety timeout in case enliven hangs
        setTimeout(resolve, 3000);
      } catch (err) {
        console.warn("[buildLayoutOnCanvas] enlivenObjects failed:", err);
        resolve();
      }
    });
  }

  if (!isStale()) {
    try { canvas.renderAll(); } catch (err) { console.warn("[buildLayoutOnCanvas] renderAll failed:", err); }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ page, scale, tool, onSelectionChange, onCanvasChange, onLayoutComplete, reloadNonce = 0 }, ref) => {

    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const toolRef = useRef<EditorTool>(tool);
    const pageIdRef = useRef<string>("");
    const pageLoadSignatureRef = useRef<string>("");
    const suppressRef = useRef(false);
    const isAliveRef = useRef(true);
    const pageLoadGenRef = useRef(0);
    const onSelectionRef = useRef(onSelectionChange);
    const onChangeRef = useRef(onCanvasChange);
    const onLayoutCompleteRef = useRef(onLayoutComplete);
    const pageRef = useRef<BookPage>(page);
    const justAppliedLayoutRef = useRef<{ pageId: string; signature: string } | null>(null);

    useEffect(() => { onSelectionRef.current = onSelectionChange; });
    useEffect(() => { onChangeRef.current = onCanvasChange; });
    useEffect(() => { onLayoutCompleteRef.current = onLayoutComplete; });
    useEffect(() => { pageRef.current = page; }, [page]);

    function live() { return isAliveRef.current ? fabricRef.current : null; }

    function applyToolMode(t: EditorTool) {
      const c = live(); if (!c) return;
      c.isDrawingMode = false;
      c.selection = t === "select";
      c.defaultCursor = t === "text" ? "text" : "default";
      c.getObjects().forEach((obj) => {
        if ((obj as any).__background || (obj as any)._role === "image-zone" || (obj as any)._layoutBaked) {
          obj.selectable = false; obj.evented = false;
        } else {
          obj.selectable = t === "select" || t === "text";
        }
      });
    }

    const firingRef = useRef(false);

    function fireChange() {
      const c = live(); if (!c || suppressRef.current || firingRef.current) return;
      firingRef.current = true;
      try {
        const json = canvasToJson(c);
        const thumb = c.toDataURL({ format: "jpeg", quality: 0.35 });
        onChangeRef.current(json, thumb);
      } catch { /* mid-clear */ }
      firingRef.current = false;
    }

    useImperativeHandle(ref, () => ({
      addText: () => {
        const c = live(); if (!c) return;
        const t = new fabric.Textbox("Type here…", { left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 20, width: 300, fontSize: 24, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "center" });
        c.add(t); c.setActiveObject(t); c.renderAll();
      },
      addRect: () => { const c = live(); if (!c) return; c.add(new fabric.Rect({ left: PAGE_W / 2 - 80, top: PAGE_H / 2 - 50, width: 160, height: 100, fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2, rx: 8, ry: 8 })); c.renderAll(); },
      addCircle: () => { const c = live(); if (!c) return; c.add(new fabric.Circle({ left: PAGE_W / 2 - 50, top: PAGE_H / 2 - 50, radius: 50, fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2 })); c.renderAll(); },
      addTriangle: () => { const c = live(); if (!c) return; c.add(new fabric.Triangle({ left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 50, width: 120, height: 100, fill: "rgba(255,255,255,0.8)", stroke: "#333", strokeWidth: 2 })); c.renderAll(); },
      addLine: () => { const c = live(); if (!c) return; c.add(new fabric.Line([0, 0, 200, 0], { stroke: "#333", strokeWidth: 3, left: PAGE_W / 2 - 100, top: PAGE_H / 2 })); c.renderAll(); },
      addStar: () => {
        const c = live(); if (!c) return;
        const pts: { x: number; y: number }[] = [];
        for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, r = i % 2 === 0 ? 60 : 25; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
        c.add(new fabric.Polygon(pts, { left: PAGE_W / 2 - 60, top: PAGE_H / 2 - 60, fill: "#f0c060", stroke: "#c9a84c", strokeWidth: 2 })); c.renderAll();
      },
      addSpeechBubble: () => { const c = live(); if (!c) return; c.add(new fabric.Path("M 0 0 Q 0 -80 80 -80 L 220 -80 Q 300 -80 300 0 Q 300 80 220 80 L 80 80 L 40 110 L 60 80 Q 0 80 0 0 Z", { left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 55, fill: "rgba(255,255,255,0.95)", stroke: "#333", strokeWidth: 2 })); c.renderAll(); },
      addFontCombo: (combo) => {
        const c = live(); if (!c) return;
        c.add(new fabric.Textbox(combo.heading.text, { left: 60, top: PAGE_H / 2 - 80, width: PAGE_W - 120, fontSize: combo.heading.fontSize, fontFamily: combo.heading.fontFamily, fontWeight: combo.heading.fontWeight, fill: combo.heading.fill, textAlign: "center", ...(combo.heading.fontStyle ? { fontStyle: combo.heading.fontStyle } : {}) }));
        const sub = new fabric.Textbox(combo.sub.text, { left: 60, top: PAGE_H / 2 + 10, width: PAGE_W - 120, fontSize: combo.sub.fontSize, fontFamily: combo.sub.fontFamily, fill: combo.sub.fill, textAlign: "center", ...(combo.sub.fontStyle ? { fontStyle: combo.sub.fontStyle } : {}), ...(combo.sub.charSpacing !== undefined ? { charSpacing: combo.sub.charSpacing } : {}) });
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
          img.set({ originX: "left", originY: "top", left: (PAGE_W - drawW) / 2, top: (PAGE_H - drawH) / 2, scaleX: s, scaleY: s });
          c.add(img); c.setActiveObject(img); c.renderAll();
        }, { crossOrigin: "anonymous" });
      },
      deleteSelected: () => { const c = live(); if (!c) return; c.getActiveObjects().forEach((o) => { if (!(o as any).__background && !(o as any)._layoutBaked) c.remove(o); }); c.discardActiveObject(); c.renderAll(); fireChange(); },
      bringForward: () => { const c = live(); if (!c) return; const o = c.getActiveObject(); if (o) c.bringForward(o); c.renderAll(); fireChange(); },
      sendBackward: () => { const c = live(); if (!c) return; const o = c.getActiveObject(); if (o) c.sendBackwards(o); c.renderAll(); fireChange(); },
      getCanvas: () => fabricRef.current,

      // ═══════════════════════════════════════════════════════════════════════
      //  applyLayout v3 — key-based, always rebuilds from template + URL
      //
      //  Returns a LayoutAppliedPayload via onDone callback. Parent saves it.
      // ═══════════════════════════════════════════════════════════════════════
      applyLayout: (
        layoutKey: LayoutTemplateKey,
        imageUrl: string | undefined,
        bodyText: string | undefined,
        onDone: (payload: LayoutAppliedPayload) => void,
      ) => {
        const c = fabricRef.current;
        if (!c) {
          onDone({ layoutKey, bodyText: bodyText ?? null, bodyTextStyles: null, fabricJson: {}, thumbnail: "" });
          return;
        }

        if (!LAYOUT_TEMPLATES[layoutKey]) {
          console.error("[applyLayout] unknown layout key:", layoutKey);
          onDone({ layoutKey, bodyText: bodyText ?? null, bodyTextStyles: null, fabricJson: {}, thumbnail: "" });
          return;
        }

        const effectiveImageUrl: string | undefined =
          (imageUrl?.trim()) ? imageUrl
            : (pageRef.current?.imageUrl?.trim()) ? pageRef.current.imageUrl
              : undefined;

        pageLoadGenRef.current += 1;
        const thisGen = pageLoadGenRef.current;
        const pageIdAtApply = pageIdRef.current;

        const isStale = () =>
          thisGen !== pageLoadGenRef.current || pageIdRef.current !== pageIdAtApply || !fabricRef.current;

        suppressRef.current = true;

        // Safety: absolute timeout so onDone ALWAYS fires within 15 seconds,
        // even if something deep in fabric hangs.
        let onDoneFired = false;
        const fireOnceDone = (payload: LayoutAppliedPayload) => {
          if (onDoneFired) return;
          onDoneFired = true;
          try { onDone(payload); } catch (err) { console.error("[applyLayout] onDone threw:", err); }
        };

        const absoluteTimeout = setTimeout(() => {
          if (onDoneFired) return;
          console.warn("[applyLayout] absolute timeout reached — forcing done");
          suppressRef.current = false;
          try {
            const json = canvasToJson(c);
            const thumb = c.toDataURL({ format: "jpeg", quality: 0.5 });
            const extractedBody = extractBodyText(c);
            fireOnceDone({
              layoutKey,
              bodyText: extractedBody ?? bodyText ?? null,
              fabricJson: json,
              thumbnail: thumb,
            });
          } catch {
            fireOnceDone({ layoutKey, bodyText: bodyText ?? null, bodyTextStyles: null, fabricJson: {}, thumbnail: "" });
          }
        }, 15000);

        // Before rebuilding, capture any user-authored objects currently on canvas
        // so they survive the template rebuild.
        const preservedUserObjects: any[] = [];
        try {
          c.getObjects().forEach((o) => {
            const isTemplate =
              !!(o as any)._role ||
              !!(o as any).__background ||
              !!(o as any)._layoutBaked;
            if (!isTemplate) {
              try {
                preservedUserObjects.push(o.toObject(["_role", "__background", "_layoutBaked"]));
              } catch { /* ignore */ }
            }
          });
        } catch { /* ignore */ }

        buildLayoutOnCanvas(
          c, layoutKey, effectiveImageUrl, bodyText, undefined, isStale,
          preservedUserObjects.length > 0 ? preservedUserObjects : null,
        ).then(() => {
          clearTimeout(absoluteTimeout);

          if (isStale()) {
            suppressRef.current = false;
            fireOnceDone({ layoutKey, bodyText: bodyText ?? null, bodyTextStyles: null, fabricJson: {}, thumbnail: "" });
            return;
          }

          applyToolMode(toolRef.current);
          try { c.renderAll(); } catch { /* ignore */ }

          // Mark justAppliedLayout for the next useEffect cycle (safety net)
          const expectedNonce = (reloadNonce ?? 0) + 1;
          justAppliedLayoutRef.current = {
            pageId: pageIdAtApply,
            signature: `${pageIdAtApply}:${expectedNonce}`,
          };

          suppressRef.current = false;

          // Build payload for parent
          let json: object = {};
          let thumb = "";
          let extractedBody: string | null = null;
          let extractedStyles: BodyTextStyles | null = null;
          try {
            json = canvasToJson(c);
            thumb = c.toDataURL({ format: "jpeg", quality: 0.5 });
            extractedBody = extractBodyText(c);
            extractedStyles = extractBodyTextStylesFromCanvas(c);
          } catch (err) {
            console.warn("[applyLayout] payload build failed:", err);
          }

          const payload: LayoutAppliedPayload = {
            layoutKey,
            bodyText: extractedBody ?? bodyText ?? null,
            bodyTextStyles: extractedStyles,
            fabricJson: json,
            thumbnail: thumb,
          };

          if (onLayoutCompleteRef.current) {
            try { onLayoutCompleteRef.current(payload); } catch { /* ignore */ }
          }

          fireOnceDone(payload);
        }).catch((err) => {
          clearTimeout(absoluteTimeout);
          console.error("[applyLayout] buildLayoutOnCanvas rejected:", err);
          suppressRef.current = false;
          // Try to build a minimal payload from whatever's on the canvas now
          let json: object = {};
          let thumb = "";
          try {
            json = canvasToJson(c);
            thumb = c.toDataURL({ format: "jpeg", quality: 0.5 });
          } catch { /* ignore */ }
          fireOnceDone({
            layoutKey,
            bodyText: bodyText ?? null,
            fabricJson: json,
            thumbnail: thumb,
          });
        });
      },

      nudgeLayoutText: () => false,

      toJSON: () => { try { const c = fabricRef.current; if (!c) return null; return canvasToJson(c); } catch { return null; } },
      toDataURL: () => { try { return fabricRef.current?.toDataURL({ format: "jpeg", quality: 0.5 }) ?? ""; } catch { return ""; } },
      setTool: (t) => { toolRef.current = t; applyToolMode(t); },

      // Extract the current body-text styles from the canvas. Used by the
      // parent to capture and persist user style edits between saves.
      extractBodyTextStyles: () => {
        try {
          const c = fabricRef.current;
          if (!c) return null;
          return extractBodyTextStylesFromCanvas(c);
        } catch { return null; }
      },

      // Undo/redo snapshot API — returns a full canvas state to be restored
      // later via restoreState(). Captures fabricJson + any baked images.
      snapshotState: () => {
        try {
          const c = fabricRef.current;
          if (!c) return null;
          return canvasToJson(c);
        } catch { return null; }
      },

      // Restore a snapshot produced by snapshotState(). Promise resolves
      // after loadFromJSON completes.
      restoreState: (json: object): Promise<void> => {
        return new Promise((resolve) => {
          const c = fabricRef.current;
          if (!c) { resolve(); return; }
          suppressRef.current = true;

          let done = false;
          const finish = () => {
            if (done) return;
            done = true;
            try {
              c.getObjects().forEach((obj) => {
                if ((obj as any).__background || (obj as any)._role === "image-zone" || (obj as any)._layoutBaked) {
                  obj.selectable = false;
                  obj.evented = false;
                }
              });
              applyToolMode(toolRef.current);
              c.renderAll();
            } catch { /* ignore */ }
            suppressRef.current = false;
            resolve();
          };
          const timer = setTimeout(finish, 5000);

          try {
            // Clear then load
            c.getObjects().slice().forEach((o) => { try { c.remove(o); } catch { /* ignore */ } });
            c.loadFromJSON(json, () => { clearTimeout(timer); finish(); });
          } catch {
            clearTimeout(timer); finish();
          }
        });
      },
    }));

    // ── Mount ──────────────────────────────────────────────────────────────────
    useEffect(() => {
      loadGoogleFonts();
      isAliveRef.current = true;
      if (!containerRef.current) return;
      const canvasEl = document.createElement("canvas");
      containerRef.current.appendChild(canvasEl);
      const fCanvas = new fabric.Canvas(canvasEl, { width: PAGE_W, height: PAGE_H, backgroundColor: "#f5f0e8", preserveObjectStacking: true, selection: true });
      fCanvas.setZoom(scale);
      fCanvas.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      fabricRef.current = fCanvas;

      fCanvas.on("mouse:down", (e) => {
        if (e.target) return;
        const ptr = fCanvas.getPointer(e.e);
        if (toolRef.current === "text") {
          const t = new fabric.Textbox("Type here…", { left: Math.min(ptr.x, PAGE_W - 310), top: Math.min(ptr.y, PAGE_H - 40), width: 300, fontSize: 20, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "left" });
          fCanvas.add(t); fCanvas.setActiveObject(t); t.enterEditing(); fCanvas.renderAll();
        } else if (toolRef.current === "rect") {
          const r = new fabric.Rect({ left: ptr.x - 60, top: ptr.y - 40, width: 120, height: 80, fill: "rgba(255,255,255,0.8)", stroke: "#555", strokeWidth: 2, rx: 6, ry: 6 });
          fCanvas.add(r); fCanvas.setActiveObject(r); fCanvas.renderAll();
        } else if (toolRef.current === "circle") {
          const ci = new fabric.Circle({ left: ptr.x - 40, top: ptr.y - 40, radius: 40, fill: "rgba(255,255,255,0.8)", stroke: "#555", strokeWidth: 2 });
          fCanvas.add(ci); fCanvas.setActiveObject(ci); fCanvas.renderAll();
        }
      });
      fCanvas.on("object:moving", (e) => {
        const obj = e.target; if (!obj || (obj as any).__background || (obj as any)._layoutBaked) return;
        const br = obj.getBoundingRect(true);
        if (br.left < 0) obj.set({ left: (obj.left ?? 0) - br.left });
        if (br.top < 0) obj.set({ top: (obj.top ?? 0) - br.top });
        if (br.left + br.width > PAGE_W) obj.set({ left: (obj.left ?? 0) - (br.left + br.width - PAGE_W) });
        if (br.top + br.height > PAGE_H) obj.set({ top: (obj.top ?? 0) - (br.top + br.height - PAGE_H) });
      });
      fCanvas.on("selection:created", (e) => { if (isAliveRef.current) onSelectionRef.current((e as any).selected?.[0] ?? null); });
      fCanvas.on("selection:updated", (e) => { if (isAliveRef.current) onSelectionRef.current((e as any).selected?.[0] ?? null); });
      fCanvas.on("selection:cleared", () => { if (isAliveRef.current) onSelectionRef.current(null); });
      fCanvas.on("object:modified", fireChange);
      fCanvas.on("object:added", () => { if (!suppressRef.current) fireChange(); });
      fCanvas.on("object:removed", fireChange);
      fCanvas.on("text:changed", fireChange);

      return () => {
        isAliveRef.current = false;
        const container = containerRef.current;
        try { fCanvas.off("mouse:down"); fCanvas.off("object:moving"); fCanvas.off("selection:created"); fCanvas.off("selection:updated"); fCanvas.off("selection:cleared"); fCanvas.off("object:modified"); fCanvas.off("object:added"); fCanvas.off("object:removed"); fCanvas.off("text:changed"); } catch { /* ignore */ }
        try { fCanvas.dispose(); } catch { /* ignore */ }
        fabricRef.current = null;
        if (container) container.innerHTML = "";
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
      const c = live(); if (!c) return;
      c.setZoom(scale); c.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale }); c.renderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    // ═══════════════════════════════════════════════════════════════════════
    //  PAGE LOAD EFFECT
    //
    //  PRIORITY ORDER:
    //    1. If page.layoutKey is set → rebuild template + bake image.
    //    2. Else if isInlineImagePage → legacy inline layout
    //    3. Else if has valid fabricJson → load it (legacy)
    //    4. Else if has imageUrl → full-bleed image + text overlay
    //    5. Else → default text renderer
    // ═══════════════════════════════════════════════════════════════════════
    useEffect(() => {
      const c = live(); if (!c) return;
      const pageLoadSignature = `${page.id}:${reloadNonce}`;

      if (justAppliedLayoutRef.current?.signature === pageLoadSignature) {
        pageLoadSignatureRef.current = pageLoadSignature;
        pageIdRef.current = page.id;
        justAppliedLayoutRef.current = null;
        return;
      }

      if (pageLoadSignatureRef.current === pageLoadSignature) return;
      pageLoadSignatureRef.current = pageLoadSignature;
      pageIdRef.current = page.id;
      justAppliedLayoutRef.current = null;

      let cancelled = false;
      const gen = ++pageLoadGenRef.current;
      suppressRef.current = true;
      c.clear();
      c.backgroundColor = page.imageUrl ? "#111111" : "#f5f0e8";

      const stale = () => cancelled || gen !== pageLoadGenRef.current || !isAliveRef.current || !fabricRef.current;
      const finish = () => {
        if (stale()) return;
        suppressRef.current = false;
        applyToolMode(toolRef.current);
        fabricRef.current!.renderAll();
        reflowTextboxes(fabricRef.current!, () => isAliveRef.current && !cancelled);
      };

      const fontSpecs = ["400 26px Lato", "700 26px Lato", "400 24px Merriweather", "700 24px Merriweather", "400 20px Nunito", "400 16px Cinzel", "700 16px Cinzel", "400 52px Fredoka One"];

      const addTextLayers = async () => {
        if (stale()) return;
        await preloadFonts(fontSpecs);
        if (stale()) return;
        buildInitialObjects(page, page.type).forEach(({ _role, _wrap, text, ...opts }) => {
          const t = _wrap ? new fabric.Textbox(text, opts as fabric.ITextOptions) : new fabric.IText(text, opts as fabric.ITextOptions);
          (t as any)._role = _role;
          fabricRef.current!.add(t);
        });
        finish();
      };

      // ── PATH 1: layoutKey-driven rendering ──
      const layoutKey = (page as any).layoutKey as LayoutTemplateKey | undefined;
      if (layoutKey && LAYOUT_TEMPLATES[layoutKey]) {
        // Use page.text as the body override; if empty, template default used
        const bodyText = typeof page.text === "string" && page.text.trim() ? page.text : undefined;
        // Saved style overrides (fontFamily, size, bold, colour, per-char styles)
        const bodyTextStyles = (page as any).bodyTextStyles as BodyTextStyles | undefined | null;

        // Extract user-authored objects (Chapter, Dots, custom shapes, etc.)
        // from the saved fabricJson. These are any objects that aren't part
        // of the template itself (no _role, no __background, no _layoutBaked).
        const savedFj = (page.fabricJson as any) ?? null;
        const userObjects: any[] = [];
        if (savedFj && Array.isArray(savedFj.objects)) {
          for (const o of savedFj.objects) {
            if (!o || typeof o !== "object") continue;
            const isTemplate = !!o._role || !!o.__background || !!o._layoutBaked;
            if (!isTemplate) userObjects.push(o);
          }
        }

        // Preload fonts first for consistent text sizing
        preloadFonts(fontSpecs).then(() => {
          if (stale()) return;
          buildLayoutOnCanvas(
            fabricRef.current!,
            layoutKey,
            page.imageUrl,
            bodyText,
            bodyTextStyles ?? null,
            stale,
            userObjects.length > 0 ? userObjects : null,
          ).then(finish).catch((err) => {
            console.error("[page-load layoutKey] buildLayoutOnCanvas rejected:", err);
            if (!stale()) {
              suppressRef.current = false;
              applyToolMode(toolRef.current);
              try { fabricRef.current!.renderAll(); } catch { /* ignore */ }
            }
          });
        }).catch((err) => {
          console.error("[page-load layoutKey] preloadFonts rejected:", err);
          if (!stale()) {
            suppressRef.current = false;
            applyToolMode(toolRef.current);
            try { fabricRef.current!.renderAll(); } catch { /* ignore */ }
          }
        });
        return () => { cancelled = true; };
      }

      const fj = page.fabricJson as any;
      const fabricHasContent = fj && Object.keys(fj).length > 0 && ((Array.isArray(fj.objects) && fj.objects.length > 0) || !!fj.backgroundImage?.src);
      const hasBakedImage = fabricHasContent && Array.isArray(fj.objects) &&
        fj.objects.some((o: any) => o._layoutBaked && o.type === "image");

      if (isInlineImagePage(page)) {
        c.backgroundColor = "#fffef7";
        buildInlineImageLayout(page, c, () => isAliveRef.current && gen === pageLoadGenRef.current, () => cancelled).then(finish);
      } else if (hasBakedImage) {
        c.loadFromJSON(page.fabricJson, () => {
          if (stale()) return;
          clampLoadedObjects(fabricRef.current!);
          fabricRef.current!.getObjects().forEach((obj) => {
            if ((obj as any).__background || (obj as any)._layoutBaked) {
              obj.selectable = false; obj.evented = false;
              (obj as any).lockMovementX = true; (obj as any).lockMovementY = true;
            }
            if ((obj as any)._role === "image-zone") fabricRef.current!.remove(obj);
          });
          finish();
        });
      } else if (fabricHasContent) {
        // Legacy fabricJson path with image-zone references
        c.loadFromJSON(page.fabricJson, async () => {
          if (stale()) return;
          clampLoadedObjects(fabricRef.current!);
          fabricRef.current!.getObjects().forEach((obj) => {
            if ((obj as any).__background || (obj as any)._role === "image-zone") { obj.selectable = false; obj.evented = false; }
          });

          // ── FIX: if no image is present on canvas but page has imageUrl,
          //    bake it as a __background full-bleed image BEHIND all text.
          //    This handles the case where user navigated away then back to a
          //    non-layout page that had full-bleed image + text overlay saved.
          const objsAfterLoad = fabricRef.current!.getObjects();
          const hasAnyImage = objsAfterLoad.some((o) => o.type === "image");
          const hasZones = objsAfterLoad.some((o: any) => o._role === "image-zone");

          if (!hasAnyImage && !hasZones && page.imageUrl && page.imageUrl.trim()) {
            try {
              const img = await preloadFabricImageTrimmed(page.imageUrl);
              if (stale()) { finish(); return; }
              const el = (img as any)._element as HTMLImageElement | undefined;
              const natW = el?.naturalWidth || img.width || PAGE_W;
              const natH = el?.naturalHeight || img.height || PAGE_H;
              const clip = { left: 0, top: 0, width: PAGE_W, height: PAGE_H };
              const geom = coverFitGeometry(natW, natH, clip);
              img.set({
                originX: "left", originY: "top",
                left: geom.left, top: geom.top,
                scaleX: geom.scale, scaleY: geom.scale,
                selectable: false, evented: false,
                lockMovementX: true, lockMovementY: true,
              });
              img.clipPath = new fabric.Rect({
                left: clip.left, top: clip.top, width: clip.width, height: clip.height,
                absolutePositioned: true,
              });
              (img as any).__background = true;
              fabricRef.current!.add(img);
              fabricRef.current!.sendToBack(img);
            } catch (err) {
              console.error("[page-load legacy] bg image bake failed:", err);
            }
          }

          if (page.imageUrl) {
            try {
              // Collect zones and bake
              const zones: { obj: fabric.Object; originalIndex: number; clip: { left: number; top: number; width: number; height: number } }[] = [];
              fabricRef.current!.getObjects().forEach((obj, i) => {
                if ((obj as any)._role === "image-zone") {
                  const clip = readRawRect(obj);
                  if (clip.width > 10 && clip.height > 10) zones.push({ obj, originalIndex: i, clip });
                }
              });
              if (zones.length > 0) {
                const img = await preloadFabricImageRaw(page.imageUrl);
                if (stale()) { finish(); return; }
                const el = (img as any)._element as HTMLImageElement | undefined;
                const natW = el?.naturalWidth || img.width || PAGE_W;
                const natH = el?.naturalHeight || img.height || PAGE_H;
                zones.forEach(({ obj }) => fabricRef.current!.remove(obj));
                for (let zi = 0; zi < zones.length; zi++) {
                  const zone = zones[zi];
                  const geom = coverFitGeometry(natW, natH, zone.clip);
                  let placed: fabric.Image;
                  if (zi === 0) placed = img;
                  else placed = await new Promise<fabric.Image>((res) => img.clone((cl: fabric.Image) => res(cl)));
                  placed.set({
                    originX: "left", originY: "top",
                    left: geom.left, top: geom.top,
                    scaleX: geom.scale, scaleY: geom.scale,
                    selectable: false, evented: false,
                    lockMovementX: true, lockMovementY: true,
                  });
                  placed.clipPath = new fabric.Rect({
                    left: zone.clip.left, top: zone.clip.top,
                    width: zone.clip.width, height: zone.clip.height,
                    absolutePositioned: true,
                  });
                  (placed as any)._layoutBaked = true;
                  fabricRef.current!.add(placed);
                  const curIdx = fabricRef.current!.getObjects().indexOf(placed);
                  const targetIdx = Math.max(0, Math.min(zone.originalIndex - zi, fabricRef.current!.getObjects().length - 1));
                  const steps = curIdx - targetIdx;
                  for (let s = 0; s < steps; s++) fabricRef.current!.sendBackwards(placed, true);
                }
              }
            } catch (err) { console.error("[page-load legacy] bake failed:", err); }
          }
          finish();
        });
      } else if (page.imageUrl) {
        preloadFabricImageTrimmed(page.imageUrl).then((img) => {
          if (stale()) return;
          const el = (img as any)._element as HTMLImageElement | undefined;
          const natW = el?.naturalWidth || img.width || PAGE_W;
          const natH = el?.naturalHeight || img.height || PAGE_H;
          const clip = { left: 0, top: 0, width: PAGE_W, height: PAGE_H };
          const geom = coverFitGeometry(natW, natH, clip);
          img.set({
            originX: "left", originY: "top",
            left: geom.left, top: geom.top,
            scaleX: geom.scale, scaleY: geom.scale,
            selectable: false, evented: false,
            lockMovementX: true, lockMovementY: true,
          });
          img.clipPath = new fabric.Rect({
            left: clip.left, top: clip.top, width: clip.width, height: clip.height,
            absolutePositioned: true,
          });
          (img as any).__background = true;
          fabricRef.current!.add(img);
          fabricRef.current!.sendToBack(img);
          addTextLayers();
        }).catch(() => addTextLayers());
      } else {
        const bgColors: Record<BookPageType, string> = { "front-cover": "#1a2744", "back-cover": "#1a2744", "spread": "#fdf8f0", "chapter-opener": "#1e3a5f", "chapter-moment": "#1e3a5f", "text-page": "#fffef7" };
        c.backgroundColor = bgColors[page.type] ?? "#f5f0e8";
        addTextLayers();
      }
      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id, reloadNonce]);

    useEffect(() => { toolRef.current = tool; applyToolMode(tool); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tool]);

    return <div ref={containerRef} style={{ lineHeight: 0, display: "block", overflow: "visible", width: PAGE_W * scale, height: PAGE_H * scale }} />;
  },
);

FabricPageCanvas.displayName = "FabricPageCanvas";
export default FabricPageCanvas;