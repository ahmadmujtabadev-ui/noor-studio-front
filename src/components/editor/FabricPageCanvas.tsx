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
// fabric v5 internally sets ctx.textBaseline = 'alphabetical' which is not a
// valid CanvasTextBaseline value ('alphabetic' is). Silently remap it.

(function patchFabricTextBaseline() {
  try {
    const proto = CanvasRenderingContext2D.prototype;
    const desc  = Object.getOwnPropertyDescriptor(proto, "textBaseline");
    if (!desc?.set) return;
    const originalSet = desc.set;
    Object.defineProperty(proto, "textBaseline", {
      ...desc,
      set(value: string) {
        originalSet.call(
          this,
          value === "alphabetical" ? "alphabetic" : value,
        );
      },
    });
  } catch {
    // best-effort, ignore
  }
})();

// ─── Google Fonts loader ──────────────────────────────────────────────────────

export const GOOGLE_FONTS = [
  "Fredoka One",
  "Baloo 2",
  "Nunito",
  "Poppins",
  "Playfair Display",
  "Raleway",
  "Amiri",
  "Cairo",
  "Merriweather",
  "Lato",
  "Oswald",
  "Montserrat",
  "Dancing Script",
  "Pacifico",
  "Cinzel",
];

function loadGoogleFonts() {
  const id = "noor-editor-fonts";
  if (document.getElementById(id)) return;
  const params = GOOGLE_FONTS
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@400;700`)
    .join("&");
  const link = document.createElement("link");
  link.id   = id;
  link.rel  = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`;
  document.head.appendChild(link);
}

// ─── Public handle ────────────────────────────────────────────────────────────

export type EditorTool = "select" | "text" | "rect" | "circle" | "image";

export interface FabricCanvasHandle {
  addText:         () => void;
  addRect:         () => void;
  addCircle:       () => void;
  addImageFromUrl: (url: string) => void;
  deleteSelected:  () => void;
  bringForward:    () => void;
  sendBackward:    () => void;
  getCanvas:       () => fabric.Canvas | null;
  toJSON:          () => object;
  toDataURL:       () => string;
  setTool:         (tool: EditorTool) => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  page:              BookPage;
  scale:             number;
  tool:              EditorTool;
  onSelectionChange: (obj: fabric.Object | null) => void;
  onCanvasChange:    (json: object, thumbnail: string) => void;
}

// ─── Initial text layers per page type ───────────────────────────────────────
//
// Each page type gets a purpose-built layout:
//   front-cover    → title (top) + author (bottom)
//   spread         → short scene text panel (bottom)
//   chapter-opener → "CHAPTER X" label + chapter title (lower third)
//   text-page      → chapter label (top) + body text (center) + page num (bottom)
//   chapter-moment → optional caption (bottom strip)
//   back-cover     → synopsis text box (center)

type InitObj = Partial<fabric.ITextOptions> & { text: string; _role: string; _wrap?: boolean };

function buildInitialObjects(page: BookPage, type: BookPageType): InitObj[] {
  const out: InitObj[] = [];

  // ── Front cover ─────────────────────────────────────────────────────────────
  if (type === "front-cover") {
    if (page.title)
      out.push({
        _role: "title", text: page.title, _wrap: true,
        left: 50, top: 60,
        fontSize: 52, fontFamily: "Fredoka One", fontWeight: "bold",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 100,
        lineHeight: 1.2,
        shadow: "2px 4px 12px rgba(0,0,0,0.8)",
      });
    if (page.text) {
      const authorLine = page.text.length > 60 ? page.text.slice(0, 57) + "…" : page.text;
      out.push({
        _role: "author", text: authorLine, _wrap: true,
        left: 50, top: PAGE_H - 80,
        fontSize: 20, fontFamily: "Nunito", fontStyle: "italic",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 100,
        shadow: "1px 2px 6px rgba(0,0,0,0.7)",
      });
    }
  }

  // ── Spread (picture book) ────────────────────────────────────────────────────
  else if (type === "spread") {
    if (page.text) {
      const txt = page.text.length > 240 ? page.text.slice(0, 237) + "…" : page.text;
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
        _role: "chapter-label", text: page.subTitle.toUpperCase(), _wrap: false,
        left: PAGE_W / 2, top: PAGE_H * 0.58, originX: "center",
        fontSize: 16, fontFamily: "Cinzel", fontWeight: "bold",
        fill: "#f0c060", textAlign: "center", width: PAGE_W - 60,
        charSpacing: 250,
        shadow: "1px 1px 4px rgba(0,0,0,0.9)",
      });
    if (page.title)
      out.push({
        _role: "chapter-title", text: page.title, _wrap: true,
        left: 40, top: PAGE_H * 0.64,
        fontSize: 36, fontFamily: "Playfair Display", fontWeight: "bold",
        fill: "#ffffff", textAlign: "center", width: PAGE_W - 80,
        lineHeight: 1.3,
        shadow: "2px 3px 10px rgba(0,0,0,0.9)",
        backgroundColor: "rgba(0,0,0,0.45)", padding: 18,
      });
  }

  // ── Text page (clean prose layout) ───────────────────────────────────────────
  else if (type === "text-page") {
    // Small chapter label at top (single line — IText is fine)
    if (page.subTitle)
      out.push({
        _role: "chapter-header", text: page.subTitle, _wrap: false,
        left: PAGE_W / 2, top: 38, originX: "center",
        fontSize: 12, fontFamily: "Cinzel",
        fill: "#8b6914", textAlign: "center", width: PAGE_W - 80,
        charSpacing: 120,
      });

    // Thin decorative rule
    out.push({
      _role: "divider", text: "────────────────────────────────", _wrap: false,
      left: PAGE_W / 2, top: 64, originX: "center",
      fontSize: 9, fontFamily: "Merriweather",
      fill: "#c9a84c", textAlign: "center", width: PAGE_W - 120,
    });

    // Body text — Textbox so prose wraps within width: PAGE_W - 100 = 650px
    // Safe vertical area: top=90 → 940 (page num) = 850px
    // Merriweather 17px × 1.7 lineHeight ≈ 29px/line → ~29 lines max before page num
    if (page.text) {
      const bodyText = page.text.length > 1200 ? page.text.slice(0, 1197) + "…" : page.text;
      out.push({
        _role: "body-text", text: bodyText, _wrap: true,
        left: 50, top: 90,
        fontSize: 17, fontFamily: "Merriweather",
        fill: "#2c1e0f", textAlign: "left", width: PAGE_W - 100,
        lineHeight: 1.7,
      });
    }

    // Page number at bottom
    if (page.pageNum)
      out.push({
        _role: "page-num", text: String(page.pageNum), _wrap: false,
        left: PAGE_W / 2, top: PAGE_H - 48, originX: "center",
        fontSize: 13, fontFamily: "Merriweather",
        fill: "#8b6914", textAlign: "center", width: 60,
      });
  }

  // ── Chapter moment (illustration) ────────────────────────────────────────────
  else if (type === "chapter-moment") {
    if (page.text) {
      const cap = page.text.length > 160 ? page.text.slice(0, 157) + "…" : page.text;
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

  // ── Back cover ───────────────────────────────────────────────────────────────
  else if (type === "back-cover") {
    if (page.text) {
      const syn = page.text.length > 350 ? page.text.slice(0, 347) + "…" : page.text;
      out.push({
        _role: "synopsis", text: syn, _wrap: true,
        left: 60, top: PAGE_H / 2 - 80,
        fontSize: 17, fontFamily: "Merriweather",
        fill: "#1a1a1a", textAlign: "center", width: PAGE_W - 120,
        lineHeight: 1.65, backgroundColor: "rgba(255,255,255,0.82)", padding: 22,
      });
    }
  }

  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FabricPageCanvas = forwardRef<FabricCanvasHandle, Props>(
  ({ page, scale, tool, onSelectionChange, onCanvasChange }, ref) => {

    // ── Refs ───────────────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement>(null); // React owns this div only
    const fabricRef    = useRef<fabric.Canvas | null>(null);
    const toolRef      = useRef<EditorTool>(tool);
    const pageIdRef    = useRef<string>("");
    const suppressRef  = useRef(false);
    const isAliveRef   = useRef(true);                 // false once component unmounts

    // Keep callback refs fresh without re-registering Fabric event listeners
    const onSelectionRef = useRef(onSelectionChange);
    const onChangeRef    = useRef(onCanvasChange);
    useEffect(() => { onSelectionRef.current = onSelectionChange; });
    useEffect(() => { onChangeRef.current    = onCanvasChange; });

    // ── Helpers ────────────────────────────────────────────────────────────────

    /** Returns the canvas only if the component is still alive. */
    function live(): fabric.Canvas | null {
      return isAliveRef.current ? fabricRef.current : null;
    }

    function applyToolMode(t: EditorTool) {
      const c = live();
      if (!c) return;
      c.isDrawingMode = false;
      c.selection     = t === "select";
      c.defaultCursor = t === "text" ? "text" : "default";
      c.getObjects().forEach((obj) => {
        if ((obj as any).__background) {
          obj.selectable = false;
          obj.evented    = false;
        } else {
          obj.selectable = t === "select" || t === "text";
        }
      });
    }

    function fireChange() {
      const c = live();
      if (!c || suppressRef.current) return;
      try {
        const json  = c.toJSON();
        const thumb = c.toDataURL({ format: "jpeg", quality: 0.35 });
        onChangeRef.current(json, thumb);
      } catch { /* mid-clear — ignore */ }
    }

    // ── Imperative handle ──────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      addText: () => {
        const c = live();
        if (!c) return;
        const t = new fabric.Textbox("Type here…", {
          left: PAGE_W / 2 - 150, top: PAGE_H / 2 - 20,
          width: 300,
          fontSize: 24, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "center",
        });
        c.add(t); c.setActiveObject(t); c.renderAll();
      },
      addRect: () => {
        const c = live();
        if (!c) return;
        const r = new fabric.Rect({
          left: PAGE_W / 2 - 80, top: PAGE_H / 2 - 50,
          width: 160, height: 100,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2, rx: 8, ry: 8,
        });
        c.add(r); c.setActiveObject(r); c.renderAll();
      },
      addCircle: () => {
        const c = live();
        if (!c) return;
        const ci = new fabric.Circle({
          left: PAGE_W / 2 - 50, top: PAGE_H / 2 - 50, radius: 50,
          fill: "rgba(255,255,255,0.7)", stroke: "#333", strokeWidth: 2,
        });
        c.add(ci); c.setActiveObject(ci); c.renderAll();
      },
      addImageFromUrl: (url: string) => {
        fabric.Image.fromURL(
          url,
          (img) => {
            const c = live();
            if (!c) return;
            const s = Math.min((PAGE_W * 0.5) / (img.width || 1), (PAGE_H * 0.5) / (img.height || 1));
            img.scale(s);
            img.set({ left: PAGE_W / 2, top: PAGE_H / 2, originX: "center", originY: "center" });
            c.add(img); c.setActiveObject(img); c.renderAll();
          },
          { crossOrigin: "anonymous" },
        );
      },
      deleteSelected: () => {
        const c = live();
        if (!c) return;
        c.getActiveObjects().forEach((o) => { if (!(o as any).__background) c.remove(o); });
        c.discardActiveObject(); c.renderAll(); fireChange();
      },
      bringForward: () => {
        const c = live();
        if (!c) return;
        const o = c.getActiveObject();
        if (o) c.bringForward(o); c.renderAll(); fireChange();
      },
      sendBackward: () => {
        const c = live();
        if (!c) return;
        const o = c.getActiveObject();
        if (o) c.sendBackwards(o); c.renderAll(); fireChange();
      },
      getCanvas:  () => fabricRef.current,
      toJSON:     () => { try { return fabricRef.current?.toJSON() ?? {}; } catch { return {}; } },
      toDataURL:  () => { try { return fabricRef.current?.toDataURL({ format: "jpeg", quality: 0.5 }) ?? ""; } catch { return ""; } },
      setTool: (t: EditorTool) => { toolRef.current = t; applyToolMode(t); },
    }));

    // ── Mount: create canvas imperatively (React never owns the <canvas>) ──────
    useEffect(() => {
      loadGoogleFonts();
      isAliveRef.current = true;
      if (!containerRef.current) return;

      // Create <canvas> outside React's reconciler to avoid the
      // "removeChild: not a child" DOMException that occurs because
      // Fabric wraps/moves the canvas element on init.
      const canvasEl = document.createElement("canvas");
      containerRef.current.appendChild(canvasEl);

      const fCanvas = new fabric.Canvas(canvasEl, {
        width:  PAGE_W,
        height: PAGE_H,
        backgroundColor: "#f5f0e8",
        preserveObjectStacking: true,
        selection: true,
      });
      // Apply initial zoom so the canvas renders at the requested scale
      fCanvas.setZoom(scale);
      fCanvas.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      fabricRef.current = fCanvas;

      // ── Event listeners ──────────────────────────────────────────────────────
      fCanvas.on("mouse:down", (e) => {
        if (e.target) return;
        const ptr = fCanvas.getPointer(e.e);

        if (toolRef.current === "text") {
          // Clamp starting position so a 300px textbox always fits within the canvas
          const tx = Math.min(ptr.x, PAGE_W - 310);
          const ty = Math.min(ptr.y, PAGE_H - 40);
          const t = new fabric.Textbox("Type here…", {
            left: tx, top: ty, width: 300,
            fontSize: 20, fontFamily: "Nunito", fill: "#1a1a1a", textAlign: "left",
          });
          fCanvas.add(t); fCanvas.setActiveObject(t); t.enterEditing(); fCanvas.renderAll();

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

      // ── Boundary clamping — keep all objects within the canvas ──────────────
      fCanvas.on("object:moving", (e) => {
        const obj = e.target;
        if (!obj || (obj as any).__background) return;
        const br = obj.getBoundingRect(true);
        if (br.left < 0)                     obj.set({ left: (obj.left ?? 0) - br.left });
        if (br.top  < 0)                     obj.set({ top:  (obj.top  ?? 0) - br.top  });
        if (br.left + br.width  > PAGE_W)    obj.set({ left: (obj.left ?? 0) - (br.left + br.width  - PAGE_W) });
        if (br.top  + br.height > PAGE_H)    obj.set({ top:  (obj.top  ?? 0) - (br.top  + br.height - PAGE_H) });
      });

      fCanvas.on("selection:created", (e) => {
        if (!isAliveRef.current) return;
        onSelectionRef.current((e as any).selected?.[0] ?? null);
      });
      fCanvas.on("selection:updated", (e) => {
        if (!isAliveRef.current) return;
        onSelectionRef.current((e as any).selected?.[0] ?? null);
      });
      fCanvas.on("selection:cleared", () => {
        if (!isAliveRef.current) return;
        onSelectionRef.current(null);
      });
      fCanvas.on("object:modified", fireChange);
      fCanvas.on("object:added",    () => { if (!suppressRef.current) fireChange(); });
      fCanvas.on("object:removed",  fireChange);
      fCanvas.on("text:changed",    fireChange);

      return () => {
        // Mark dead BEFORE dispose so all in-flight callbacks bail immediately
        isAliveRef.current = false;
        fabricRef.current  = null;
        try { fCanvas.dispose(); } catch { /* ignore */ }
        // Fabric leaves behind its wrapper div — clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = "";
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Sync zoom / dimensions when scale prop changes ─────────────────────────
    useEffect(() => {
      const c = live();
      if (!c) return;
      c.setZoom(scale);
      c.setDimensions({ width: PAGE_W * scale, height: PAGE_H * scale });
      c.renderAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale]);

    // ── Load page content whenever page.id changes ─────────────────────────────
    useEffect(() => {
      const c = live();
      if (!c) return;
      if (pageIdRef.current === page.id) return;
      pageIdRef.current = page.id;

      // Per-run cancellation — prevents a stale fromURL/loadFromJSON callback
      // from touching the canvas after this effect has been superseded.
      let cancelled = false;

      suppressRef.current = true;
      c.clear();
      // Default bg — overridden below per page type or after image loads.
      // Dark bg for illustration pages so any sub-pixel gap is invisible.
      c.backgroundColor = page.imageUrl ? "#111111" : "#f5f0e8";

      const finish = () => {
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;
        suppressRef.current = false;
        applyToolMode(toolRef.current);
        fabricRef.current.renderAll();
      };

      const addTextLayers = () => {
        if (cancelled || !isAliveRef.current || !fabricRef.current) return;
        const canvas = fabricRef.current;
        buildInitialObjects(page, page.type).forEach(({ _role, _wrap, text, ...opts }) => {
          // fabric.Textbox auto-wraps within `width`; fabric.IText does not.
          // Use Textbox for any multi-line prose/title object.
          const t = _wrap
            ? new fabric.Textbox(text, opts as fabric.ITextOptions)
            : new fabric.IText(text, opts as fabric.ITextOptions);
          (t as any)._role = _role;
          canvas.add(t);
        });
        finish();
      };

      if (page.fabricJson && Object.keys(page.fabricJson).length > 0) {
        c.loadFromJSON(page.fabricJson, () => {
          if (cancelled || !isAliveRef.current || !fabricRef.current) return;
          fabricRef.current.getObjects().forEach((obj) => {
            if ((obj as any).__background) {
              obj.selectable = false;
              obj.evented    = false;
            }
          });
          finish();
        });

      } else if (page.imageUrl) {
        fabric.Image.fromURL(
          page.imageUrl,
          (img) => {
            // ← Guard: bail if unmounted OR page changed while image was loading
            if (cancelled || !isAliveRef.current || !fabricRef.current) return;
            const canvas = fabricRef.current;

            // Use naturalWidth/naturalHeight for reliable source dimensions.
            const el   = (img as any)._element as HTMLImageElement | undefined;
            const natW = el?.naturalWidth  || img.width  || PAGE_W;
            const natH = el?.naturalHeight || img.height || PAGE_H;

            // Cover-fit: scale so the image fills BOTH axes (no gap on any side).
            // Math.max guarantees scaledW >= PAGE_W AND scaledH >= PAGE_H.
            const s = Math.max(PAGE_W / natW, PAGE_H / natH);

            // Center the image — the excess is clipped by the canvas element.
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
        // Solid background per page type (used when no imageUrl)
        const bgColors: Record<BookPageType, string> = {
          "front-cover":    "#1a2744",
          "back-cover":     "#1a2744",
          "spread":         "#fdf8f0",
          "chapter-opener": "#1e3a5f",
          "chapter-moment": "#1e3a5f",
          // text-page: warm cream — the primary reading surface
          "text-page":      "#fffef7",
        };
        c.backgroundColor = bgColors[page.type] ?? "#f5f0e8";
        addTextLayers();
      }

      return () => { cancelled = true; };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page.id]);

    // ── Sync tool prop ─────────────────────────────────────────────────────────
    useEffect(() => {
      toolRef.current = tool;
      applyToolMode(tool);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tool]);

    // React ONLY renders this wrapper div — Fabric creates its own DOM inside it
    return (
      <div
        ref={containerRef}
        style={{ lineHeight: 0, display: "block" }}
      />
    );
  },
);

FabricPageCanvas.displayName = "FabricPageCanvas";

export default FabricPageCanvas;
