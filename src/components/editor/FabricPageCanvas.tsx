// components/editor/FabricPageCanvas.tsx
// Fabric.js canvas for a single book page.
//
// FIX CHANGELOG:
// ── Fix 1: Font sizing — AVG_CHAR_WIDTH_RATIO=0.45, max 26px, short-chunk min 20px.
//
// ── Fix 2: text_inline_image layout — ALWAYS rebuilds for pages with
//    layoutType="text_inline_image" + imageUrl, even if fabricJson exists.
//    Root cause of previous failure: on first load, object:added fired after
//    finish() cleared suppressRef, so autoSave wrote a fabricJson with only
//    text objects (no image). On reload, that non-empty fabricJson caused
//    loadFromJSON to run instead of buildInlineImageLayout — no image shown.
//    Fix: for text_inline_image pages, always use buildInlineImageLayout
//    regardless of fabricJson. User edits (extra text boxes etc.) on top of
//    the inline layout are saved separately and re-added after rebuild.
//
// ── Fix 3: Style persistence — fabricJson restored for all page types
//    (fixed in useBookEditor.ts). For inline-image pages we skip fabricJson
//    intentionally (see Fix 2) and rebuild fresh every time.

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { fabric } from "fabric";
import type { BookPage, BookPageType } from "@/hooks/useBookEditor";

export const PAGE_W = 750;
export const PAGE_H = 1000;

// ─── Patch fabric v5 textBaseline ─────────────────────────────────────────────
(function patchFabricTextBaseline() {
  try {
    const proto = CanvasRenderingContext2D.prototype;
    const desc  = Object.getOwnPropertyDescriptor(proto, "textBaseline");
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
  "Fredoka One","Baloo 2","Nunito","Poppins","Playfair Display",
  "Raleway","Amiri","Cairo","Merriweather","Lato","Oswald",
  "Montserrat","Dancing Script","Pacifico","Cinzel",
];

function loadGoogleFonts() {
  const id = "noor-editor-fonts";
  if (document.getElementById(id)) return;
  const params = GOOGLE_FONTS.map((f) => `family=${f.replace(/ /g,"+")}:wght@400;700`).join("&");
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

// ─── FIX 1: Dynamic font size ─────────────────────────────────────────────────
function calcBodyFontSize(
  text: string,
  textWidth: number,
  availableHeight: number,
  lineHeight = 1.65,
  fillRatio  = 0.80,
): number {
  if (!text || text.length < 10) return 22;
  const AVG = 0.45;
  const charCount = text.length;
  const wordCount = text.split(/\s+/).length;
  const targetH   = availableHeight * fillRatio;

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

// ─── Font combinations ────────────────────────────────────────────────────────
export interface FontCombo {
  id: string; label: string; preview: string;
  heading: { text: string; fontFamily: string; fontSize: number; fontWeight: string; fill: string; fontStyle?: string };
  sub: { text: string; fontFamily: string; fontSize: number; fill: string; fontStyle?: string; charSpacing?: number };
}

export const FONT_COMBOS: FontCombo[] = [
  { id:"bold-editorial", label:"Bold Editorial", preview:"Heading",
    heading:{text:"Bold Editorial",fontFamily:"Playfair Display",fontSize:42,fontWeight:"bold",fill:"#1a1a2e"},
    sub:{text:"Elegant subtitle text",fontFamily:"Raleway",fontSize:16,fill:"#4a4a6a"} },
  { id:"modern-clean", label:"Modern Clean", preview:"Modern",
    heading:{text:"Modern Clean",fontFamily:"Montserrat",fontSize:40,fontWeight:"bold",fill:"#0d0d0d"},
    sub:{text:"SUBTITLE TEXT HERE",fontFamily:"Lato",fontSize:13,fill:"#888888",charSpacing:200} },
  { id:"elegant-script", label:"Elegant Script", preview:"Elegant",
    heading:{text:"Elegant Script",fontFamily:"Dancing Script",fontSize:46,fontWeight:"bold",fill:"#2d2d2d"},
    sub:{text:"FINE PRINT DETAIL",fontFamily:"Cinzel",fontSize:13,fill:"#8b6914",charSpacing:150} },
  { id:"playful-fun", label:"Playful Fun", preview:"Playful",
    heading:{text:"Playful Fun",fontFamily:"Fredoka One",fontSize:44,fontWeight:"bold",fill:"#e63946"},
    sub:{text:"A fun and friendly subtitle",fontFamily:"Nunito",fontSize:18,fill:"#457b9d"} },
  { id:"arabic-modern", label:"Arabic Modern", preview:"Arabic",
    heading:{text:"Arabic Modern",fontFamily:"Cairo",fontSize:40,fontWeight:"bold",fill:"#1d3557"},
    sub:{text:"الخط الحديث العربي",fontFamily:"Amiri",fontSize:18,fill:"#457b9d",fontStyle:"italic"} },
  { id:"cinematic", label:"Cinematic", preview:"Cinematic",
    heading:{text:"CINEMATIC",fontFamily:"Oswald",fontSize:44,fontWeight:"bold",fill:"#ffffff"},
    sub:{text:"CINEMATIC UNIVERSE",fontFamily:"Raleway",fontSize:15,fill:"#aaaaaa",charSpacing:100} },
];

// ─── Public handle ────────────────────────────────────────────────────────────
export type EditorTool = "select"|"text"|"rect"|"circle"|"image"|"triangle"|"line"|"star"|"speech-bubble";

export interface FabricCanvasHandle {
  addText:()=>void; addRect:()=>void; addCircle:()=>void; addTriangle:()=>void;
  addLine:()=>void; addStar:()=>void; addSpeechBubble:()=>void;
  addFontCombo:(c:FontCombo)=>void; addImageFromUrl:(url:string)=>void;
  deleteSelected:()=>void; bringForward:()=>void; sendBackward:()=>void;
  getCanvas:()=>fabric.Canvas|null; toJSON:()=>object; toDataURL:()=>string;
  setTool:(t:EditorTool)=>void;
}

interface Props {
  page: BookPage; scale: number; tool: EditorTool;
  onSelectionChange:(obj:fabric.Object|null)=>void;
  onCanvasChange:(json:object,thumbnail:string)=>void;
}

// ─── Layout: text_inline_image ────────────────────────────────────────────────
//
// Matches the screenshot exactly:
//   TOP  55% : chapter header + body text (cream background, full page width)
//   BOTTOM 45% : illustration image (cover-fill, full page width)
//
// Gold horizontal divider separates the two zones.
// Always rebuilt from scratch (fabricJson ignored) — see routing comment below.

async function buildInlineImageLayout(
  page: BookPage,
  canvas: fabric.Canvas,
  isAlive: () => boolean,
  cancelled: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    if (cancelled() || !isAlive()) { resolve(); return; }

    // ── Layout (PAGE_W=750, PAGE_H=1000) ─────────────────────────────────────
    //
    //  ┌───────────────────────────────────┐  y=0
    //  │  chapter header  (Cinzel/gold)    │
    //  │  ─────────────────────────────    │
    //  │  body text fills this zone        │  y = 22..TEXT_ZONE_H-22
    //  │                               5   │  ← page number
    //  ├───────────────────────────────────┤  y = TEXT_ZONE_H (550px)
    //  │                                   │
    //  │       illustration (cover-fill)   │  y = TEXT_ZONE_H..PAGE_H
    //  │                                   │
    //  └───────────────────────────────────┘  y = PAGE_H (1000px)

    const TEXT_ZONE_H = Math.round(PAGE_H * 0.55); // 550px
    const IMG_TOP     = TEXT_ZONE_H;               // image starts exactly at divider
    const IMG_H       = PAGE_H - IMG_TOP;          // 450px
    const TXT_LEFT    = 40;
    const TXT_W       = PAGE_W - 80;               // 670px

    // 1. Cream background for entire text zone
    const textBg = new fabric.Rect({
      left: 0, top: 0, width: PAGE_W, height: TEXT_ZONE_H,
      fill: "#fffef7", selectable: false, evented: false,
    });
    (textBg as any).__background = true;
    canvas.add(textBg);

    // 2. Gold horizontal divider — drawn at TEXT_ZONE_H
    const divLine = new fabric.Line(
      [20, TEXT_ZONE_H, PAGE_W - 20, TEXT_ZONE_H],
      { stroke: "#c9a84c80", strokeWidth: 1, selectable: false, evented: false },
    );
    (divLine as any).__background = true;
    canvas.add(divLine);

    // 3. Load image — fills bottom zone flush, no gap
    fabric.Image.fromURL(
      page.imageUrl,
      async (img) => {
        if (cancelled() || !isAlive()) { resolve(); return; }

        const el   = (img as any)._element as HTMLImageElement | undefined;
        const natW = el?.naturalWidth  || img.width  || PAGE_W;
        const natH = el?.naturalHeight || img.height || IMG_H;

        // Cover-scale to fill PAGE_W × IMG_H exactly
        const s       = Math.max(PAGE_W / natW, IMG_H / natH);
        const drawW   = natW * s;
        const drawH   = natH * s;

        // Centre horizontally; pin top of drawn image to IMG_TOP
        const imgLeft = (PAGE_W - drawW) / 2;
        const imgTop  = IMG_TOP; // top of image = top of zone = no gap

        img.set({
          originX:       "left",
          originY:       "top",
          left:          imgLeft,
          top:           imgTop,
          scaleX:        s,
          scaleY:        s,
          selectable:    false,
          evented:       false,
          lockMovementX: true,
          lockMovementY: true,
        });

        // Clip to exactly [0, IMG_TOP, PAGE_W, PAGE_H]
        // Use absolutePositioned so coords are in canvas space
        img.clipPath = new fabric.Rect({
          left:               0,
          top:                IMG_TOP,
          width:              PAGE_W,
          height:             IMG_H,
          absolutePositioned: true,
        });

        (img as any).__background = true;
        canvas.add(img);

        // 4. Text layers (added after image so they render on top)
        await preloadFonts([
          "400 26px Lato", "700 26px Lato",
          "400 12px Cinzel", "700 12px Cinzel",
          "400 13px Merriweather",
        ]);
        if (cancelled() || !isAlive()) { resolve(); return; }

        let cursor = 20; // running Y inside text zone

        // Chapter header
        if (page.subTitle) {
          const hdr = new fabric.Textbox(page.subTitle, {
            left: TXT_LEFT, top: cursor, width: TXT_W,
            fontSize: 11, fontFamily: "Cinzel", fill: "#8b6914",
            textAlign: "center", charSpacing: 160,
          } as fabric.ITextOptions);
          (hdr as any)._role = "chapter-header";
          canvas.add(hdr);
          cursor += 20;

          // Short gold rule under header
          const rule = new fabric.Line(
            [PAGE_W / 2 - 60, cursor, PAGE_W / 2 + 60, cursor],
            { stroke: "#c9a84c90", strokeWidth: 1, selectable: false, evented: false },
          );
          (rule as any).__background = true;
          canvas.add(rule);
          cursor += 12;
        }

        // Body text
        if (page.text) {
          // Reserve 24px at bottom for page number
          const availH   = TEXT_ZONE_H - cursor - 24;
          const LH       = 1.6;
          const norm     = page.text.replace(/\r\n|\r|\n/g, " ").replace(/\s+/g, " ").trim();
          const fontSize = calcBodyFontSize(norm, TXT_W, availH, LH, 0.88);

          const body = new fabric.Textbox(norm, {
            left: TXT_LEFT, top: cursor, width: TXT_W,
            fontSize, fontFamily: "Lato", fill: "#2c1e0f",
            textAlign: "left", lineHeight: LH, splitByGrapheme: false,
          } as fabric.ITextOptions);
          (body as any)._role = "body-text";
          canvas.add(body);
        }

        // Page number — pinned just above the divider
        if (page.pageNum) {
          const pn = new fabric.IText(String(page.pageNum), {
            left: PAGE_W / 2, top: TEXT_ZONE_H - 20, originX: "center",
            fontSize: 11, fontFamily: "Merriweather", fill: "#8b6914",
            textAlign: "center", width: 60,
          } as fabric.ITextOptions);
          (pn as any)._role = "page-num";
          canvas.add(pn);
        }

        canvas.renderAll();
        resolve();
      },
      { crossOrigin: "anonymous" },
    );
  });
}

// ─── Initial text layers per page type ───────────────────────────────────────
type InitObj = Partial<fabric.ITextOptions> & { text:string; _role:string; _wrap?:boolean };

function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
  const out: InitObj[] = [];

  if (type === "front-cover") {
    if (page.title)
      out.push({ _role:"title", text:page.title, _wrap:true,
        left:50, top:60, fontSize:52, fontFamily:"Fredoka One", fontWeight:"bold",
        fill:"#ffffff", textAlign:"center", width:PAGE_W-100, lineHeight:1.2,
        shadow:"2px 4px 12px rgba(0,0,0,0.8)" });
    if (page.text)
      out.push({ _role:"author",
        text:page.text.length>80?page.text.slice(0,77)+"…":page.text,
        _wrap:true, left:50, top:PAGE_H-80, fontSize:20, fontFamily:"Nunito",
        fontStyle:"italic", fill:"#ffffff", textAlign:"center", width:PAGE_W-100,
        shadow:"1px 2px 6px rgba(0,0,0,0.7)" });
  }

  else if (type === "spread") {
    if (page.text) {
      const txt = page.text.length>600 ? page.text.slice(0,597)+"…" : page.text;
      out.push({ _role:"body-text", text:txt, _wrap:true,
        left:40, top:PAGE_H-220, fontSize: txt.split(/\s+/).length > 12 ? 17 : 20, fontFamily:"Nunito",
        fill:"#ffffff", textAlign:"center", width:PAGE_W-80, lineHeight:1.55,
        shadow:"1px 1px 5px rgba(0,0,0,0.9)", backgroundColor:"rgba(0,0,0,0.38)", padding:14 });
    }
  }

  else if (type === "chapter-opener") {
    if (page.subTitle)
      out.push({ _role:"chapter-label", text:page.subTitle.toUpperCase(), _wrap:true,
        left:20, top:PAGE_H*0.58, fontSize:16, fontFamily:"Cinzel", fontWeight:"bold",
        fill:"#f0c060", textAlign:"center", width:PAGE_W-80, charSpacing:250,
        shadow:"1px 1px 4px rgba(0,0,0,0.9)" });
  }

  else if (type === "text-page") {
    // NOTE: text_inline_image pages never reach here —
    // they are handled exclusively by buildInlineImageLayout().

    if (page.subTitle)
      out.push({ _role:"chapter-header", text:page.subTitle, _wrap:true,
        left:40, top:32, fontSize:12, fontFamily:"Cinzel",
        fill:"#8b6914", textAlign:"center", width:PAGE_W-80, charSpacing:120 });

    out.push({ _role:"divider", text:"────────────────────────────────", _wrap:false,
      left:PAGE_W/2, top:58, originX:"center",
      fontSize:9, fontFamily:"Merriweather", fill:"#c9a84c",
      textAlign:"center", width:PAGE_W-120 });

    if (page.text) {
      const TEXT_TOP = 76;
      const TEXT_H   = PAGE_H - TEXT_TOP - 52;
      const TEXT_W   = PAGE_W - 120;
      const MAX_CHARS = 1400;
      const bodyText  = page.text.length > MAX_CHARS
        ? page.text.slice(0,MAX_CHARS-3)+"…" : page.text;
      const norm = bodyText.replace(/\r\n|\r|\n/g," ").replace(/\s+/g," ").trim();
      const LH   = 1.65;
      const fontSize = calcBodyFontSize(norm, TEXT_W, TEXT_H, LH, 0.82);

      out.push({ _role:"body-text", text:norm, _wrap:true,
        left:60, top:TEXT_TOP, fontSize, fontFamily:"Lato", fill:"#2c1e0f",
        textAlign:"left", width:TEXT_W, lineHeight:LH, splitByGrapheme:false });
    }

    if (page.pageNum)
      out.push({ _role:"page-num", text:String(page.pageNum), _wrap:false,
        left:PAGE_W/2, top:PAGE_H-46, originX:"center",
        fontSize:13, fontFamily:"Merriweather", fill:"#8b6914",
        textAlign:"center", width:60 });
  }

  else if (type === "chapter-moment") {
    if (page.text) {
      const cap = page.text.length>400 ? page.text.slice(0,397)+"…" : page.text;
      out.push({ _role:"caption", text:cap, _wrap:true,
        left:40, top:PAGE_H-120, fontSize:15, fontFamily:"Nunito",
        fontStyle:"italic", fill:"#ffffff", textAlign:"center", width:PAGE_W-80,
        lineHeight:1.4, shadow:"1px 1px 4px rgba(0,0,0,0.9)",
        backgroundColor:"rgba(0,0,0,0.4)", padding:10 });
    }
  }

  else if (type === "back-cover") {
    if (page.text) {
      const syn = page.text.length>500 ? page.text.slice(0,497)+"…" : page.text;
      out.push({ _role:"synopsis", text:syn, _wrap:true,
        left:60, top:PAGE_H/2-80, fontSize:17, fontFamily:"Merriweather",
        fill:"#1a1a1a", textAlign:"center", width:PAGE_W-120, lineHeight:1.65,
        backgroundColor:"rgba(255,255,255,0.82)", padding:22 });
    }
  }

  return out;
}

// ─── Clamp loaded objects ─────────────────────────────────────────────────────
function clampLoadedObjects(canvas: fabric.Canvas) {
  canvas.getObjects().forEach((obj) => {
    if ((obj as any).__background) { obj.selectable=false; obj.evented=false; return; }
    let dirty = false;
    const G = 20;
    if ((obj.left??0) < 0) { obj.set({left:0}); dirty=true; }
    if ((obj.top ??0) < 0) { obj.set({top: 0}); dirty=true; }
    const oX = obj.originX ?? "left";
    if (oX==="left" && obj.width!==undefined) {
      const maxW = PAGE_W-(obj.left??0)-G;
      if (obj.width>maxW) { obj.set({width:Math.max(maxW,40)}); dirty=true; }
    }
    if (oX==="center" && obj.width!==undefined) {
      const maxW = PAGE_W-G*2;
      if (obj.width>maxW) { obj.set({width:Math.max(maxW,40)}); dirty=true; }
    }
    if (dirty && obj.type==="textbox") (obj as fabric.Textbox).initDimensions();
  });
}

// ─── Helper: is this an inline-image page? ────────────────────────────────────
function isInlineImagePage(page: BookPage): boolean {
  return (
    page.type === "text-page" &&
    !!page.imageUrl &&
    page.imageUrl.trim() !== "" &&
    page.layoutType === "text_inline_image"
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ page, scale, tool, onSelectionChange, onCanvasChange }, ref) => {
    console.log("[FabricPageCanvas] page:", page.id, "layoutType:", page.layoutType, "imageUrl:", !!page.imageUrl);

    const containerRef   = useRef<HTMLDivElement>(null);
    const fabricRef      = useRef<fabric.Canvas|null>(null);
    const toolRef        = useRef<EditorTool>(tool);
    const pageIdRef      = useRef<string>("");
    const suppressRef    = useRef(false);
    const isAliveRef     = useRef(true);
    const onSelectionRef = useRef(onSelectionChange);
    const onChangeRef    = useRef(onCanvasChange);
    useEffect(() => { onSelectionRef.current = onSelectionChange; });
    useEffect(() => { onChangeRef.current    = onCanvasChange; });

    function live() { return isAliveRef.current ? fabricRef.current : null; }

    function applyToolMode(t: EditorTool) {
      const c = live(); if (!c) return;
      c.isDrawingMode = false;
      c.selection     = t === "select";
      c.defaultCursor = t === "text" ? "text" : "default";
      c.getObjects().forEach((obj) => {
        if ((obj as any).__background) { obj.selectable=false; obj.evented=false; }
        else obj.selectable = t==="select" || t==="text";
      });
    }

    function fireChange() {
      const c = live(); if (!c || suppressRef.current) return;
      try {
        const json  = c.toJSON();
        const thumb = c.toDataURL({ format:"jpeg", quality:0.35 });
        onChangeRef.current(json, thumb);
      } catch { /* mid-clear */ }
    }

    useImperativeHandle(ref, () => ({
      addText: () => {
        const c = live(); if (!c) return;
        const t = new fabric.Textbox("Type here…", {
          left:PAGE_W/2-150, top:PAGE_H/2-20, width:300,
          fontSize:24, fontFamily:"Nunito", fill:"#1a1a1a", textAlign:"center" });
        c.add(t); c.setActiveObject(t); c.renderAll();
      },
      addRect: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Rect({ left:PAGE_W/2-80, top:PAGE_H/2-50, width:160, height:100,
          fill:"rgba(255,255,255,0.7)", stroke:"#333", strokeWidth:2, rx:8, ry:8 }));
        c.renderAll();
      },
      addCircle: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Circle({ left:PAGE_W/2-50, top:PAGE_H/2-50, radius:50,
          fill:"rgba(255,255,255,0.7)", stroke:"#333", strokeWidth:2 }));
        c.renderAll();
      },
      addTriangle: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Triangle({ left:PAGE_W/2-60, top:PAGE_H/2-50, width:120, height:100,
          fill:"rgba(255,255,255,0.8)", stroke:"#333", strokeWidth:2 }));
        c.renderAll();
      },
      addLine: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Line([0,0,200,0], { stroke:"#333", strokeWidth:3,
          left:PAGE_W/2-100, top:PAGE_H/2 }));
        c.renderAll();
      },
      addStar: () => {
        const c = live(); if (!c) return;
        const pts:{x:number;y:number}[] = [];
        for (let i=0;i<10;i++) {
          const a=(i*Math.PI)/5-Math.PI/2, r=i%2===0?60:25;
          pts.push({x:Math.cos(a)*r, y:Math.sin(a)*r});
        }
        c.add(new fabric.Polygon(pts, { left:PAGE_W/2-60, top:PAGE_H/2-60,
          fill:"#f0c060", stroke:"#c9a84c", strokeWidth:2 }));
        c.renderAll();
      },
      addSpeechBubble: () => {
        const c = live(); if (!c) return;
        c.add(new fabric.Path(
          "M 0 0 Q 0 -80 80 -80 L 220 -80 Q 300 -80 300 0 Q 300 80 220 80 L 80 80 L 40 110 L 60 80 Q 0 80 0 0 Z",
          { left:PAGE_W/2-150, top:PAGE_H/2-55,
            fill:"rgba(255,255,255,0.95)", stroke:"#333", strokeWidth:2 }));
        c.renderAll();
      },
      addFontCombo: (combo) => {
        const c = live(); if (!c) return;
        c.add(new fabric.Textbox(combo.heading.text, {
          left:60, top:PAGE_H/2-80, width:PAGE_W-120,
          fontSize:combo.heading.fontSize, fontFamily:combo.heading.fontFamily,
          fontWeight:combo.heading.fontWeight, fill:combo.heading.fill, textAlign:"center",
          ...(combo.heading.fontStyle?{fontStyle:combo.heading.fontStyle}:{}) }));
        const sub = new fabric.Textbox(combo.sub.text, {
          left:60, top:PAGE_H/2+10, width:PAGE_W-120,
          fontSize:combo.sub.fontSize, fontFamily:combo.sub.fontFamily,
          fill:combo.sub.fill, textAlign:"center",
          ...(combo.sub.fontStyle?{fontStyle:combo.sub.fontStyle}:{}),
          ...(combo.sub.charSpacing!==undefined?{charSpacing:combo.sub.charSpacing}:{}) });
        c.add(sub); c.setActiveObject(sub); c.renderAll();
      },
      addImageFromUrl: (url) => {
        fabric.Image.fromURL(url, (img) => {
          const c = live(); if (!c) return;
          const s = Math.min((PAGE_W*0.5)/(img.width||1),(PAGE_H*0.5)/(img.height||1));
          img.scale(s);
          img.set({ left:PAGE_W/2, top:PAGE_H/2, originX:"center", originY:"center" });
          c.add(img); c.setActiveObject(img); c.renderAll();
        }, { crossOrigin:"anonymous" });
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
      getCanvas:  () => fabricRef.current,
      toJSON:     () => { try { return fabricRef.current?.toJSON()??{}; } catch { return {}; } },
      toDataURL:  () => { try { return fabricRef.current?.toDataURL({format:"jpeg",quality:0.5})??""; } catch { return ""; } },
      setTool: (t) => { toolRef.current=t; applyToolMode(t); },
    }));

    // ── Mount ──────────────────────────────────────────────────────────────────
    useEffect(() => {
      loadGoogleFonts();
      isAliveRef.current = true;
      if (!containerRef.current) return;

      const canvasEl = document.createElement("canvas");
      containerRef.current.appendChild(canvasEl);

      const fCanvas = new fabric.Canvas(canvasEl, {
        width:PAGE_W, height:PAGE_H,
        backgroundColor:"#f5f0e8", preserveObjectStacking:true, selection:true,
      });
      fCanvas.setZoom(scale);
      fCanvas.setDimensions({ width:PAGE_W*scale, height:PAGE_H*scale });
      fabricRef.current = fCanvas;

      fCanvas.on("mouse:down", (e) => {
        if (e.target) return;
        const ptr = fCanvas.getPointer(e.e);
        if (toolRef.current === "text") {
          const t = new fabric.Textbox("Type here…", {
            left:Math.min(ptr.x,PAGE_W-310), top:Math.min(ptr.y,PAGE_H-40),
            width:300, fontSize:20, fontFamily:"Nunito", fill:"#1a1a1a", textAlign:"left" });
          fCanvas.add(t); fCanvas.setActiveObject(t); t.enterEditing(); fCanvas.renderAll();
        } else if (toolRef.current === "rect") {
          const r = new fabric.Rect({ left:ptr.x-60, top:ptr.y-40, width:120, height:80,
            fill:"rgba(255,255,255,0.8)", stroke:"#555", strokeWidth:2, rx:6, ry:6 });
          fCanvas.add(r); fCanvas.setActiveObject(r); fCanvas.renderAll();
        } else if (toolRef.current === "circle") {
          const ci = new fabric.Circle({ left:ptr.x-40, top:ptr.y-40, radius:40,
            fill:"rgba(255,255,255,0.8)", stroke:"#555", strokeWidth:2 });
          fCanvas.add(ci); fCanvas.setActiveObject(ci); fCanvas.renderAll();
        }
      });

      fCanvas.on("object:moving", (e) => {
        const obj = e.target; if (!obj||(obj as any).__background) return;
        const br = obj.getBoundingRect(true);
        if (br.left < 0)                obj.set({left:(obj.left??0)-br.left});
        if (br.top  < 0)                obj.set({top: (obj.top ??0)-br.top});
        if (br.left+br.width  > PAGE_W) obj.set({left:(obj.left??0)-(br.left+br.width -PAGE_W)});
        if (br.top +br.height > PAGE_H) obj.set({top: (obj.top ??0)-(br.top +br.height-PAGE_H)});
      });

      fCanvas.on("selection:created", (e) => { if(isAliveRef.current) onSelectionRef.current((e as any).selected?.[0]??null); });
      fCanvas.on("selection:updated", (e) => { if(isAliveRef.current) onSelectionRef.current((e as any).selected?.[0]??null); });
      fCanvas.on("selection:cleared",  ()  => { if(isAliveRef.current) onSelectionRef.current(null); });
      fCanvas.on("object:modified", fireChange);
      fCanvas.on("object:added",    () => { if(!suppressRef.current) fireChange(); });
      fCanvas.on("object:removed",  fireChange);
      fCanvas.on("text:changed",    fireChange);

      return () => {
        isAliveRef.current = false; fabricRef.current = null;
        try { fCanvas.dispose(); } catch { /* ignore */ }
        if (containerRef.current) containerRef.current.innerHTML = "";
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Sync scale ─────────────────────────────────────────────────────────────
    useEffect(() => {
      const c = live(); if (!c) return;
      c.setZoom(scale);
      c.setDimensions({ width:PAGE_W*scale, height:PAGE_H*scale });
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
        if (cancelled||!isAliveRef.current||!fabricRef.current) return;
        suppressRef.current = false;
        applyToolMode(toolRef.current);
        fabricRef.current.renderAll();
        reflowTextboxes(fabricRef.current, () => isAliveRef.current && !cancelled);
      };

      const fontSpecs = [
        "400 26px Lato","700 26px Lato",
        "400 24px Merriweather","700 24px Merriweather",
        "400 20px Nunito","400 16px Cinzel","700 16px Cinzel","400 52px Fredoka One",
      ];

      const addTextLayers = async () => {
        if (cancelled||!isAliveRef.current||!fabricRef.current) return;
        await preloadFonts(fontSpecs);
        if (cancelled||!isAliveRef.current||!fabricRef.current) return;
        buildInitialObjects(page, page.type).forEach(({ _role, _wrap, text, ...opts }) => {
          const t = _wrap
            ? new fabric.Textbox(text, opts as fabric.ITextOptions)
            : new fabric.IText(text, opts as fabric.ITextOptions);
          (t as any)._role = _role;
          fabricRef.current!.add(t);
        });
        finish();
      };

      // ── ROUTING LOGIC ──────────────────────────────────────────────────────
      //
      // Priority order:
      //
      // 1. INLINE IMAGE PAGE → always rebuild (ignore fabricJson)
      //    Reason: fabricJson for these pages is unreliable because the image
      //    object fires object:added after suppress clears (async load), causing
      //    autoSave to write a fabricJson with no image → broken on reload.
      //
      // 2. OTHER PAGES WITH fabricJson → loadFromJSON (full editor state restore)
      //
      // 3. PLAIN IMAGE BACKGROUND → load image, then add text layers
      //
      // 4. NO IMAGE → plain background + text layers

      if (isInlineImagePage(page)) {
        // Always rebuild inline-image layout from scratch
        c.backgroundColor = "#fffef7";
        buildInlineImageLayout(
          page, c,
          () => isAliveRef.current,
          () => cancelled,
        ).then(finish);

      } else if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
        c.loadFromJSON(page.fabricJson, () => {
          if (cancelled||!isAliveRef.current||!fabricRef.current) return;
          clampLoadedObjects(fabricRef.current);
          finish();
        });

      } else if (page.imageUrl) {
        fabric.Image.fromURL(page.imageUrl, (img) => {
          if (cancelled||!isAliveRef.current||!fabricRef.current) return;
          const canvas = fabricRef.current!;
          const el   = (img as any)._element as HTMLImageElement|undefined;
          const natW = el?.naturalWidth  || img.width  || PAGE_W;
          const natH = el?.naturalHeight || img.height || PAGE_H;
          const s    = Math.max(PAGE_W/natW, PAGE_H/natH);
          img.set({
            originX:"center", originY:"center", left:PAGE_W/2, top:PAGE_H/2,
            scaleX:s, scaleY:s, selectable:false, evented:false,
            lockMovementX:true, lockMovementY:true,
          });
          (img as any).__background = true;
          canvas.add(img); canvas.sendToBack(img);
          addTextLayers();
        }, { crossOrigin:"anonymous" });

      } else {
        const bgColors: Record<BookPageType,string> = {
          "front-cover":"#1a2744","back-cover":"#1a2744",
          "spread":"#fdf8f0","chapter-opener":"#1e3a5f",
          "chapter-moment":"#1e3a5f","text-page":"#fffef7",
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
        lineHeight:0, display:"block", overflow:"visible",
        width:PAGE_W*scale, height:PAGE_H*scale,
      }} />
    );
  },
);

FabricPageCanvas.displayName = "FabricPageCanvas";
export default FabricPageCanvas;

// // components/editor/FabricPageCanvas.tsx
// // Fabric.js canvas for a single book page.
// //
// // FIX CHANGELOG:
// // ── Fix 1: Font sizing — tuned AVG_CHAR_WIDTH_RATIO to 0.45 (correct for Lato),
// //    max font 26px, short-chunk boost (< 80 words → min 20px font).
// //
// // ── Fix 2: text_inline_image layout — layoutType "text_inline_image" + imageUrl
// //    → image in RIGHT 38% panel, text in LEFT 58% panel (correct per useBookEditor).
// //
// // ── Fix 3: Style persistence — fabricJson is now restored for text pages too.
// //    Fixed in useBookEditor.ts (remove the text-page fabricJson strip).
// //    This file handles it by always trusting fabricJson when it exists.

// import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
// import { fabric } from "fabric";
// import type { BookPage, BookPageType } from "@/hooks/useBookEditor";

// export const PAGE_W = 750;
// export const PAGE_H = 1000;

// // ─── Patch fabric v5 textBaseline ─────────────────────────────────────────────
// (function patchFabricTextBaseline() {
//   try {
//     const proto = CanvasRenderingContext2D.prototype;
//     const desc  = Object.getOwnPropertyDescriptor(proto, "textBaseline");
//     if (!desc?.set) return;
//     const orig = desc.set;
//     Object.defineProperty(proto, "textBaseline", {
//       ...desc,
//       set(v: string) { orig.call(this, v === "alphabetical" ? "alphabetic" : v); },
//     });
//   } catch { /* best-effort */ }
// })();

// // ─── Google Fonts ─────────────────────────────────────────────────────────────
// export const GOOGLE_FONTS = [
//   "Fredoka One","Baloo 2","Nunito","Poppins","Playfair Display",
//   "Raleway","Amiri","Cairo","Merriweather","Lato","Oswald",
//   "Montserrat","Dancing Script","Pacifico","Cinzel",
// ];

// function loadGoogleFonts() {
//   const id = "noor-editor-fonts";
//   if (document.getElementById(id)) return;
//   const params = GOOGLE_FONTS.map((f) => `family=${f.replace(/ /g,"+")}:wght@400;700`).join("&");
//   const link = document.createElement("link");
//   link.id = id; link.rel = "stylesheet";
//   link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
//   document.head.appendChild(link);
// }

// async function preloadFonts(specs: string[]) {
//   await Promise.allSettled(specs.map((s) => document.fonts.load(s)));
// }

// function reflowTextboxes(canvas: fabric.Canvas, isAlive: () => boolean) {
//   document.fonts.ready.then(() => {
//     if (!isAlive()) return;
//     let dirty = false;
//     canvas.getObjects().forEach((obj) => {
//       if (obj.type === "textbox") {
//         (obj as any).dirty = true;
//         (obj as fabric.Textbox).initDimensions();
//         dirty = true;
//       }
//     });
//     if (dirty && isAlive()) canvas.renderAll();
//   });
// }

// // ─── FIX 1: Dynamic font size ─────────────────────────────────────────────────
// // Lato average glyph width ≈ 0.45× fontSize (tuned empirically).
// // Short chunks (< 80 words) get min 20px so they don't look sparse.
// function calcBodyFontSize(
//   text: string,
//   textWidth: number,
//   availableHeight: number,
//   lineHeight = 1.65,
//   fillRatio  = 0.80,
// ): number {
//   if (!text || text.length < 10) return 22;
//   const AVG = 0.45;
//   const charCount = text.length;
//   const wordCount = text.split(/\s+/).length;
//   const targetH   = availableHeight * fillRatio;

//   let lo = 14, hi = 26;
//   for (let i = 0; i < 10; i++) {
//     const mid = (lo + hi) / 2;
//     const cpl = Math.floor(textWidth / (mid * AVG));
//     const lines = Math.ceil(charCount / Math.max(cpl, 1));
//     const h = lines * mid * lineHeight;
//     if (h < targetH) lo = mid; else hi = mid;
//   }

//   const minSize = wordCount < 80 ? 20 : 15;
//   return Math.round(Math.max(minSize, Math.min(26, (lo + hi) / 2)));
// }

// // ─── Font combinations ────────────────────────────────────────────────────────
// export interface FontCombo {
//   id: string; label: string; preview: string;
//   heading: { text: string; fontFamily: string; fontSize: number; fontWeight: string; fill: string; fontStyle?: string };
//   sub: { text: string; fontFamily: string; fontSize: number; fill: string; fontStyle?: string; charSpacing?: number };
// }

// export const FONT_COMBOS: FontCombo[] = [
//   { id:"bold-editorial", label:"Bold Editorial", preview:"Heading",
//     heading:{text:"Bold Editorial",fontFamily:"Playfair Display",fontSize:42,fontWeight:"bold",fill:"#1a1a2e"},
//     sub:{text:"Elegant subtitle text",fontFamily:"Raleway",fontSize:16,fill:"#4a4a6a"} },
//   { id:"modern-clean", label:"Modern Clean", preview:"Modern",
//     heading:{text:"Modern Clean",fontFamily:"Montserrat",fontSize:40,fontWeight:"bold",fill:"#0d0d0d"},
//     sub:{text:"SUBTITLE TEXT HERE",fontFamily:"Lato",fontSize:13,fill:"#888888",charSpacing:200} },
//   { id:"elegant-script", label:"Elegant Script", preview:"Elegant",
//     heading:{text:"Elegant Script",fontFamily:"Dancing Script",fontSize:46,fontWeight:"bold",fill:"#2d2d2d"},
//     sub:{text:"FINE PRINT DETAIL",fontFamily:"Cinzel",fontSize:13,fill:"#8b6914",charSpacing:150} },
//   { id:"playful-fun", label:"Playful Fun", preview:"Playful",
//     heading:{text:"Playful Fun",fontFamily:"Fredoka One",fontSize:44,fontWeight:"bold",fill:"#e63946"},
//     sub:{text:"A fun and friendly subtitle",fontFamily:"Nunito",fontSize:18,fill:"#457b9d"} },
//   { id:"arabic-modern", label:"Arabic Modern", preview:"Arabic",
//     heading:{text:"Arabic Modern",fontFamily:"Cairo",fontSize:40,fontWeight:"bold",fill:"#1d3557"},
//     sub:{text:"الخط الحديث العربي",fontFamily:"Amiri",fontSize:18,fill:"#457b9d",fontStyle:"italic"} },
//   { id:"cinematic", label:"Cinematic", preview:"Cinematic",
//     heading:{text:"CINEMATIC",fontFamily:"Oswald",fontSize:44,fontWeight:"bold",fill:"#ffffff"},
//     sub:{text:"CINEMATIC UNIVERSE",fontFamily:"Raleway",fontSize:15,fill:"#aaaaaa",charSpacing:100} },
// ];

// // ─── Public handle ────────────────────────────────────────────────────────────
// export type EditorTool = "select"|"text"|"rect"|"circle"|"image"|"triangle"|"line"|"star"|"speech-bubble";

// export interface FabricCanvasHandle {
//   addText:()=>void; addRect:()=>void; addCircle:()=>void; addTriangle:()=>void;
//   addLine:()=>void; addStar:()=>void; addSpeechBubble:()=>void;
//   addFontCombo:(c:FontCombo)=>void; addImageFromUrl:(url:string)=>void;
//   deleteSelected:()=>void; bringForward:()=>void; sendBackward:()=>void;
//   getCanvas:()=>fabric.Canvas|null; toJSON:()=>object; toDataURL:()=>string;
//   setTool:(t:EditorTool)=>void;
// }

// interface Props {
//   page: BookPage; scale: number; tool: EditorTool;
//   onSelectionChange:(obj:fabric.Object|null)=>void;
//   onCanvasChange:(json:object,thumbnail:string)=>void;
// }

// // ─── FIX 2: Inline image layout ───────────────────────────────────────────────
// // layoutType "text_inline_image" → image RIGHT 38%, text LEFT 58%
// // Matches useBookEditor.ts: img1PageIdx / img2PageIdx pages on chapter text pages.
// //
// // Right panel  : left=452, width=288px (image, cover-fill, clipped)
// // Left panel   : left=40,  width=400px (text column)
// // Gold divider : x=448

// async function buildInlineImageLayout(
//   page: BookPage,
//   canvas: fabric.Canvas,
//   isAlive: () => boolean,
//   cancelled: () => boolean,
// ): Promise<void> {
//   return new Promise((resolve) => {
//     if (cancelled() || !isAlive()) { resolve(); return; }

//     const IMG_LEFT = 452;
//     const IMG_W    = PAGE_W - IMG_LEFT - 10; // 288px
//     const TXT_LEFT = 40;
//     const TXT_W    = 400;

//     fabric.Image.fromURL(
//       page.imageUrl,
//       async (img) => {
//         if (cancelled() || !isAlive()) { resolve(); return; }

//         const el   = (img as any)._element as HTMLImageElement|undefined;
//         const natW = el?.naturalWidth  || img.width  || IMG_W;
//         const natH = el?.naturalHeight || img.height || PAGE_H;
//         const s    = Math.max(IMG_W / natW, PAGE_H / natH);

//         img.set({
//           originX:"left", originY:"top",
//           left: IMG_LEFT, top: 0,
//           scaleX: s, scaleY: s,
//           selectable:false, evented:false,
//           lockMovementX:true, lockMovementY:true,
//         });
//         // Clip to right panel
//         img.clipPath = new fabric.Rect({
//           left:0, top:0, width:IMG_W+10, height:PAGE_H,
//           absolutePositioned:false,
//         });
//         (img as any).__background = true;
//         canvas.add(img);

//         // Subtle gold vertical divider
//         const divLine = new fabric.Line([IMG_LEFT-4, 20, IMG_LEFT-4, PAGE_H-20], {
//           stroke:"#c9a84c44", strokeWidth:1, selectable:false, evented:false,
//         });
//         (divLine as any).__background = true;
//         canvas.add(divLine);

//         await preloadFonts([
//           "400 26px Lato","700 26px Lato",
//           "400 12px Cinzel","700 12px Cinzel",
//           "400 13px Merriweather",
//         ]);
//         if (cancelled() || !isAlive()) { resolve(); return; }

//         // Chapter header
//         if (page.subTitle) {
//           const hdr = new fabric.Textbox(page.subTitle, {
//             left:TXT_LEFT, top:32, width:TXT_W,
//             fontSize:11, fontFamily:"Cinzel", fill:"#8b6914",
//             textAlign:"left", charSpacing:120,
//           } as fabric.ITextOptions);
//           (hdr as any)._role = "chapter-header";
//           canvas.add(hdr);

//           const dvd = new fabric.IText("────────────────────", {
//             left:TXT_LEFT, top:52, originX:"left",
//             fontSize:9, fontFamily:"Merriweather", fill:"#c9a84c", width:TXT_W,
//           } as fabric.ITextOptions);
//           (dvd as any)._role = "divider";
//           canvas.add(dvd);
//         }

//         if (page.text) {
//           const textTop   = page.subTitle ? 72 : 40;
//           const textAvailH = PAGE_H - textTop - 52;
//           const LH = 1.65;

//           const norm = page.text.replace(/\r\n|\r|\n/g," ").replace(/\s+/g," ").trim();
//           const fontSize = calcBodyFontSize(norm, TXT_W, textAvailH, LH, 0.85);

//           const body = new fabric.Textbox(norm, {
//             left:TXT_LEFT, top:textTop, width:TXT_W,
//             fontSize, fontFamily:"Lato", fill:"#2c1e0f",
//             textAlign:"left", lineHeight:LH, splitByGrapheme:false,
//           } as fabric.ITextOptions);
//           (body as any)._role = "body-text";
//           canvas.add(body);
//         }

//         if (page.pageNum) {
//           const pn = new fabric.IText(String(page.pageNum), {
//             left:TXT_LEFT+TXT_W/2, top:PAGE_H-46, originX:"center",
//             fontSize:13, fontFamily:"Merriweather", fill:"#8b6914",
//             textAlign:"center", width:60,
//           } as fabric.ITextOptions);
//           (pn as any)._role = "page-num";
//           canvas.add(pn);
//         }

//         canvas.renderAll();
//         resolve();
//       },
//       { crossOrigin:"anonymous" },
//     );
//   });
// }

// // ─── Initial text layers per page type ───────────────────────────────────────
// type InitObj = Partial<fabric.ITextOptions> & { text:string; _role:string; _wrap?:boolean };

// function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
//   const out: InitObj[] = [];

//   if (type === "front-cover") {
//     if (page.title)
//       out.push({ _role:"title", text:page.title, _wrap:true,
//         left:50, top:60, fontSize:52, fontFamily:"Fredoka One", fontWeight:"bold",
//         fill:"#ffffff", textAlign:"center", width:PAGE_W-100, lineHeight:1.2,
//         shadow:"2px 4px 12px rgba(0,0,0,0.8)" });
//     if (page.text)
//       out.push({ _role:"author", text:page.text.length>60?page.text.slice(0,57)+"…":page.text,
//         _wrap:true, left:50, top:PAGE_H-80, fontSize:20, fontFamily:"Nunito",
//         fontStyle:"italic", fill:"#ffffff", textAlign:"center", width:PAGE_W-100,
//         shadow:"1px 2px 6px rgba(0,0,0,0.7)" });
//   }

//   else if (type === "spread") {
//     if (page.text) {
//       const txt = page.text.length>240 ? page.text.slice(0,237)+"…" : page.text;
//       out.push({ _role:"body-text", text:txt, _wrap:true,
//         left:40, top:PAGE_H-190, fontSize:20, fontFamily:"Nunito",
//         fill:"#ffffff", textAlign:"center", width:PAGE_W-80, lineHeight:1.55,
//         shadow:"1px 1px 5px rgba(0,0,0,0.9)", backgroundColor:"rgba(0,0,0,0.38)", padding:14 });
//     }
//   }

//   else if (type === "chapter-opener") {
//     if (page.subTitle)
//       out.push({ _role:"chapter-label", text:page.subTitle.toUpperCase(), _wrap:true,
//         left:20, top:PAGE_H*0.58, fontSize:16, fontFamily:"Cinzel", fontWeight:"bold",
//         fill:"#f0c060", textAlign:"center", width:PAGE_W-80, charSpacing:250,
//         shadow:"1px 1px 4px rgba(0,0,0,0.9)" });
//   }

//   else if (type === "text-page") {
//     // NOTE: text_inline_image is handled by buildInlineImageLayout() before this runs.
//     // This path handles plain text pages (no imageUrl, or layoutType !== text_inline_image).

//     if (page.subTitle)
//       out.push({ _role:"chapter-header", text:page.subTitle, _wrap:true,
//         left:40, top:32, fontSize:12, fontFamily:"Cinzel",
//         fill:"#8b6914", textAlign:"center", width:PAGE_W-80, charSpacing:120 });

//     out.push({ _role:"divider", text:"────────────────────────────────", _wrap:false,
//       left:PAGE_W/2, top:58, originX:"center",
//       fontSize:9, fontFamily:"Merriweather", fill:"#c9a84c",
//       textAlign:"center", width:PAGE_W-120 });

//     if (page.text) {
//       const TEXT_TOP = 76;
//       const TEXT_H   = PAGE_H - TEXT_TOP - 52; // ~872px
//       const TEXT_W   = PAGE_W - 120;           // 630px

//       const MAX_CHARS = 1400;
//       const bodyText  = page.text.length > MAX_CHARS
//         ? page.text.slice(0, MAX_CHARS-3)+"…"
//         : page.text;
//       const norm = bodyText.replace(/\r\n|\r|\n/g," ").replace(/\s+/g," ").trim();

//       const LH = 1.65;
//       const fontSize = calcBodyFontSize(norm, TEXT_W, TEXT_H, LH, 0.82);

//       out.push({ _role:"body-text", text:norm, _wrap:true,
//         left:60, top:TEXT_TOP, fontSize, fontFamily:"Lato", fill:"#2c1e0f",
//         textAlign:"left", width:TEXT_W, lineHeight:LH, splitByGrapheme:false });
//     }

//     if (page.pageNum)
//       out.push({ _role:"page-num", text:String(page.pageNum), _wrap:false,
//         left:PAGE_W/2, top:PAGE_H-46, originX:"center",
//         fontSize:13, fontFamily:"Merriweather", fill:"#8b6914",
//         textAlign:"center", width:60 });
//   }

//   else if (type === "chapter-moment") {
//     if (page.text) {
//       const cap = page.text.length>160 ? page.text.slice(0,157)+"…" : page.text;
//       out.push({ _role:"caption", text:cap, _wrap:true,
//         left:40, top:PAGE_H-120, fontSize:15, fontFamily:"Nunito",
//         fontStyle:"italic", fill:"#ffffff", textAlign:"center", width:PAGE_W-80,
//         lineHeight:1.4, shadow:"1px 1px 4px rgba(0,0,0,0.9)",
//         backgroundColor:"rgba(0,0,0,0.4)", padding:10 });
//     }
//   }

//   else if (type === "back-cover") {
//     if (page.text) {
//       const syn = page.text.length>350 ? page.text.slice(0,347)+"…" : page.text;
//       out.push({ _role:"synopsis", text:syn, _wrap:true,
//         left:60, top:PAGE_H/2-80, fontSize:17, fontFamily:"Merriweather",
//         fill:"#1a1a1a", textAlign:"center", width:PAGE_W-120, lineHeight:1.65,
//         backgroundColor:"rgba(255,255,255,0.82)", padding:22 });
//     }
//   }

//   return out;
// }

// // ─── Clamp loaded objects ─────────────────────────────────────────────────────
// function clampLoadedObjects(canvas: fabric.Canvas) {
//   canvas.getObjects().forEach((obj) => {
//     if ((obj as any).__background) { obj.selectable=false; obj.evented=false; return; }
//     let dirty = false;
//     const G = 20;
//     if ((obj.left??0) < 0) { obj.set({left:0}); dirty=true; }
//     if ((obj.top ??0) < 0) { obj.set({top: 0}); dirty=true; }
//     const oX = obj.originX ?? "left";
//     if (oX==="left" && obj.width!==undefined) {
//       const maxW = PAGE_W-(obj.left??0)-G;
//       if (obj.width>maxW) { obj.set({width:Math.max(maxW,40)}); dirty=true; }
//     }
//     if (oX==="center" && obj.width!==undefined) {
//       const maxW = PAGE_W-G*2;
//       if (obj.width>maxW) { obj.set({width:Math.max(maxW,40)}); dirty=true; }
//     }
//     if (dirty && obj.type==="textbox") (obj as fabric.Textbox).initDimensions();
//   });
// }

// // ─── Component ────────────────────────────────────────────────────────────────
// const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
//   ({ page, scale, tool, onSelectionChange, onCanvasChange }, ref) => {
//     console.log("Rendering FabricPageCanvas", { page });

//     const containerRef   = useRef<HTMLDivElement>(null);
//     const fabricRef      = useRef<fabric.Canvas|null>(null);
//     const toolRef        = useRef<EditorTool>(tool);
//     const pageIdRef      = useRef<string>("");
//     const suppressRef    = useRef(false);
//     const isAliveRef     = useRef(true);
//     const onSelectionRef = useRef(onSelectionChange);
//     const onChangeRef    = useRef(onCanvasChange);
//     useEffect(() => { onSelectionRef.current = onSelectionChange; });
//     useEffect(() => { onChangeRef.current    = onCanvasChange; });

//     function live() { return isAliveRef.current ? fabricRef.current : null; }

//     function applyToolMode(t: EditorTool) {
//       const c = live(); if (!c) return;
//       c.isDrawingMode = false;
//       c.selection     = t === "select";
//       c.defaultCursor = t === "text" ? "text" : "default";
//       c.getObjects().forEach((obj) => {
//         if ((obj as any).__background) { obj.selectable=false; obj.evented=false; }
//         else obj.selectable = t==="select" || t==="text";
//       });
//     }

//     function fireChange() {
//       const c = live(); if (!c || suppressRef.current) return;
//       try {
//         const json  = c.toJSON();
//         const thumb = c.toDataURL({ format:"jpeg", quality:0.35 });
//         onChangeRef.current(json, thumb);
//       } catch { /* mid-clear */ }
//     }

//     useImperativeHandle(ref, () => ({
//       addText: () => {
//         const c = live(); if (!c) return;
//         const t = new fabric.Textbox("Type here…", {
//           left:PAGE_W/2-150, top:PAGE_H/2-20, width:300,
//           fontSize:24, fontFamily:"Nunito", fill:"#1a1a1a", textAlign:"center" });
//         c.add(t); c.setActiveObject(t); c.renderAll();
//       },
//       addRect: () => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Rect({ left:PAGE_W/2-80, top:PAGE_H/2-50, width:160, height:100,
//           fill:"rgba(255,255,255,0.7)", stroke:"#333", strokeWidth:2, rx:8, ry:8 }));
//         c.renderAll();
//       },
//       addCircle: () => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Circle({ left:PAGE_W/2-50, top:PAGE_H/2-50, radius:50,
//           fill:"rgba(255,255,255,0.7)", stroke:"#333", strokeWidth:2 }));
//         c.renderAll();
//       },
//       addTriangle: () => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Triangle({ left:PAGE_W/2-60, top:PAGE_H/2-50, width:120, height:100,
//           fill:"rgba(255,255,255,0.8)", stroke:"#333", strokeWidth:2 }));
//         c.renderAll();
//       },
//       addLine: () => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Line([0,0,200,0], { stroke:"#333", strokeWidth:3,
//           left:PAGE_W/2-100, top:PAGE_H/2 }));
//         c.renderAll();
//       },
//       addStar: () => {
//         const c = live(); if (!c) return;
//         const pts:{x:number;y:number}[] = [];
//         for (let i=0;i<10;i++) {
//           const a=(i*Math.PI)/5-Math.PI/2, r=i%2===0?60:25;
//           pts.push({x:Math.cos(a)*r, y:Math.sin(a)*r});
//         }
//         c.add(new fabric.Polygon(pts, { left:PAGE_W/2-60, top:PAGE_H/2-60,
//           fill:"#f0c060", stroke:"#c9a84c", strokeWidth:2 }));
//         c.renderAll();
//       },
//       addSpeechBubble: () => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Path(
//           "M 0 0 Q 0 -80 80 -80 L 220 -80 Q 300 -80 300 0 Q 300 80 220 80 L 80 80 L 40 110 L 60 80 Q 0 80 0 0 Z",
//           { left:PAGE_W/2-150, top:PAGE_H/2-55,
//             fill:"rgba(255,255,255,0.95)", stroke:"#333", strokeWidth:2 }));
//         c.renderAll();
//       },
//       addFontCombo: (combo) => {
//         const c = live(); if (!c) return;
//         c.add(new fabric.Textbox(combo.heading.text, {
//           left:60, top:PAGE_H/2-80, width:PAGE_W-120,
//           fontSize:combo.heading.fontSize, fontFamily:combo.heading.fontFamily,
//           fontWeight:combo.heading.fontWeight, fill:combo.heading.fill, textAlign:"center",
//           ...(combo.heading.fontStyle?{fontStyle:combo.heading.fontStyle}:{}) }));
//         const sub = new fabric.Textbox(combo.sub.text, {
//           left:60, top:PAGE_H/2+10, width:PAGE_W-120,
//           fontSize:combo.sub.fontSize, fontFamily:combo.sub.fontFamily,
//           fill:combo.sub.fill, textAlign:"center",
//           ...(combo.sub.fontStyle?{fontStyle:combo.sub.fontStyle}:{}),
//           ...(combo.sub.charSpacing!==undefined?{charSpacing:combo.sub.charSpacing}:{}) });
//         c.add(sub); c.setActiveObject(sub); c.renderAll();
//       },
//       addImageFromUrl: (url) => {
//         fabric.Image.fromURL(url, (img) => {
//           const c = live(); if (!c) return;
//           const s = Math.min((PAGE_W*0.5)/(img.width||1),(PAGE_H*0.5)/(img.height||1));
//           img.scale(s);
//           img.set({ left:PAGE_W/2, top:PAGE_H/2, originX:"center", originY:"center" });
//           c.add(img); c.setActiveObject(img); c.renderAll();
//         }, { crossOrigin:"anonymous" });
//       },
//       deleteSelected: () => {
//         const c = live(); if (!c) return;
//         c.getActiveObjects().forEach((o) => { if (!(o as any).__background) c.remove(o); });
//         c.discardActiveObject(); c.renderAll(); fireChange();
//       },
//       bringForward: () => {
//         const c = live(); if (!c) return;
//         const o = c.getActiveObject(); if (o) c.bringForward(o); c.renderAll(); fireChange();
//       },
//       sendBackward: () => {
//         const c = live(); if (!c) return;
//         const o = c.getActiveObject(); if (o) c.sendBackwards(o); c.renderAll(); fireChange();
//       },
//       getCanvas:  () => fabricRef.current,
//       toJSON:     () => { try { return fabricRef.current?.toJSON()??{}; } catch { return {}; } },
//       toDataURL:  () => { try { return fabricRef.current?.toDataURL({format:"jpeg",quality:0.5})??""; } catch { return ""; } },
//       setTool: (t) => { toolRef.current=t; applyToolMode(t); },
//     }));

//     // ── Mount ──────────────────────────────────────────────────────────────────
//     useEffect(() => {
//       loadGoogleFonts();
//       isAliveRef.current = true;
//       if (!containerRef.current) return;

//       const canvasEl = document.createElement("canvas");
//       containerRef.current.appendChild(canvasEl);

//       const fCanvas = new fabric.Canvas(canvasEl, {
//         width:PAGE_W, height:PAGE_H,
//         backgroundColor:"#f5f0e8", preserveObjectStacking:true, selection:true,
//       });
//       fCanvas.setZoom(scale);
//       fCanvas.setDimensions({ width:PAGE_W*scale, height:PAGE_H*scale });
//       fabricRef.current = fCanvas;

//       fCanvas.on("mouse:down", (e) => {
//         if (e.target) return;
//         const ptr = fCanvas.getPointer(e.e);
//         if (toolRef.current === "text") {
//           const t = new fabric.Textbox("Type here…", {
//             left:Math.min(ptr.x,PAGE_W-310), top:Math.min(ptr.y,PAGE_H-40),
//             width:300, fontSize:20, fontFamily:"Nunito", fill:"#1a1a1a", textAlign:"left" });
//           fCanvas.add(t); fCanvas.setActiveObject(t); t.enterEditing(); fCanvas.renderAll();
//         } else if (toolRef.current === "rect") {
//           const r = new fabric.Rect({ left:ptr.x-60, top:ptr.y-40, width:120, height:80,
//             fill:"rgba(255,255,255,0.8)", stroke:"#555", strokeWidth:2, rx:6, ry:6 });
//           fCanvas.add(r); fCanvas.setActiveObject(r); fCanvas.renderAll();
//         } else if (toolRef.current === "circle") {
//           const ci = new fabric.Circle({ left:ptr.x-40, top:ptr.y-40, radius:40,
//             fill:"rgba(255,255,255,0.8)", stroke:"#555", strokeWidth:2 });
//           fCanvas.add(ci); fCanvas.setActiveObject(ci); fCanvas.renderAll();
//         }
//       });

//       fCanvas.on("object:moving", (e) => {
//         const obj = e.target; if (!obj||(obj as any).__background) return;
//         const br = obj.getBoundingRect(true);
//         if (br.left < 0)                    obj.set({left:(obj.left??0)-br.left});
//         if (br.top  < 0)                    obj.set({top: (obj.top ??0)-br.top});
//         if (br.left+br.width  > PAGE_W)     obj.set({left:(obj.left??0)-(br.left+br.width -PAGE_W)});
//         if (br.top +br.height > PAGE_H)     obj.set({top: (obj.top ??0)-(br.top +br.height-PAGE_H)});
//       });

//       fCanvas.on("selection:created", (e) => { if(isAliveRef.current) onSelectionRef.current((e as any).selected?.[0]??null); });
//       fCanvas.on("selection:updated", (e) => { if(isAliveRef.current) onSelectionRef.current((e as any).selected?.[0]??null); });
//       fCanvas.on("selection:cleared",  ()  => { if(isAliveRef.current) onSelectionRef.current(null); });
//       fCanvas.on("object:modified", fireChange);
//       fCanvas.on("object:added",    () => { if(!suppressRef.current) fireChange(); });
//       fCanvas.on("object:removed",  fireChange);
//       fCanvas.on("text:changed",    fireChange);

//       return () => {
//         isAliveRef.current = false; fabricRef.current = null;
//         try { fCanvas.dispose(); } catch { /* ignore */ }
//         if (containerRef.current) containerRef.current.innerHTML = "";
//       };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []);

//     // ── Sync scale ─────────────────────────────────────────────────────────────
//     useEffect(() => {
//       const c = live(); if (!c) return;
//       c.setZoom(scale);
//       c.setDimensions({ width:PAGE_W*scale, height:PAGE_H*scale });
//       c.renderAll();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [scale]);

//     // ── Load page ──────────────────────────────────────────────────────────────
//     useEffect(() => {
//       const c = live(); if (!c) return;
//       if (pageIdRef.current === page.id) return;
//       pageIdRef.current = page.id;

//       let cancelled = false;
//       suppressRef.current = true;
//       c.clear();
//       c.backgroundColor = page.imageUrl ? "#111111" : "#f5f0e8";

//       const finish = () => {
//         if (cancelled||!isAliveRef.current||!fabricRef.current) return;
//         suppressRef.current = false;
//         applyToolMode(toolRef.current);
//         fabricRef.current.renderAll();
//         reflowTextboxes(fabricRef.current, () => isAliveRef.current && !cancelled);
//       };

//       const fontSpecs = [
//         "400 26px Lato","700 26px Lato",
//         "400 24px Merriweather","700 24px Merriweather",
//         "400 20px Nunito","400 16px Cinzel","700 16px Cinzel","400 52px Fredoka One",
//       ];

//       const addTextLayers = async () => {
//         if (cancelled||!isAliveRef.current||!fabricRef.current) return;
//         await preloadFonts(fontSpecs);
//         if (cancelled||!isAliveRef.current||!fabricRef.current) return;
//         buildInitialObjects(page, page.type).forEach(({ _role, _wrap, text, ...opts }) => {
//           const t = _wrap
//             ? new fabric.Textbox(text, opts as fabric.ITextOptions)
//             : new fabric.IText(text, opts as fabric.ITextOptions);
//           (t as any)._role = _role;
//           fabricRef.current!.add(t);
//         });
//         finish();
//       };

//       // ── FIX 3: fabricJson now restored for text pages (from useBookEditor fix) ──
//       if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
//         c.loadFromJSON(page.fabricJson, () => {
//           if (cancelled||!isAliveRef.current||!fabricRef.current) return;
//           clampLoadedObjects(fabricRef.current);
//           finish();
//         });

//       // ── FIX 2: Inline image layout ─────────────────────────────────────────
//       } else if (
//         page.type === "text-page" &&
//         page.imageUrl &&
//         page.layoutType === "text_inline_image"
//       ) {
//         c.backgroundColor = "#fffef7";
//         buildInlineImageLayout(page, c, () => isAliveRef.current, () => cancelled).then(finish);

//       } else if (page.imageUrl) {
//         fabric.Image.fromURL(page.imageUrl, (img) => {
//           if (cancelled||!isAliveRef.current||!fabricRef.current) return;
//           const canvas = fabricRef.current!;
//           const el   = (img as any)._element as HTMLImageElement|undefined;
//           const natW = el?.naturalWidth  || img.width  || PAGE_W;
//           const natH = el?.naturalHeight || img.height || PAGE_H;
//           const s    = Math.max(PAGE_W/natW, PAGE_H/natH);
//           img.set({
//             originX:"center", originY:"center", left:PAGE_W/2, top:PAGE_H/2,
//             scaleX:s, scaleY:s, selectable:false, evented:false,
//             lockMovementX:true, lockMovementY:true,
//           });
//           (img as any).__background = true;
//           canvas.add(img); canvas.sendToBack(img);
//           addTextLayers();
//         }, { crossOrigin:"anonymous" });

//       } else {
//         const bgColors: Record<BookPageType,string> = {
//           "front-cover":"#1a2744","back-cover":"#1a2744",
//           "spread":"#fdf8f0","chapter-opener":"#1e3a5f",
//           "chapter-moment":"#1e3a5f","text-page":"#fffef7",
//         };
//         c.backgroundColor = bgColors[page.type] ?? "#f5f0e8";
//         addTextLayers();
//       }

//       return () => { cancelled = true; };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [page.id]);

//     // ── Sync tool ──────────────────────────────────────────────────────────────
//     useEffect(() => {
//       toolRef.current = tool;
//       applyToolMode(tool);
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [tool]);

//     return (
//       <div ref={containerRef} style={{
//         lineHeight:0, display:"block", overflow:"visible",
//         width:PAGE_W*scale, height:PAGE_H*scale,
//       }} />
//     );
//   },
// );

// FabricPageCanvas.displayName = "FabricPageCanvas";
// export default FabricPageCanvas;