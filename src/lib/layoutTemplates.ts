/**
 * layoutTemplates.ts — v2
 *
 * CHANGES vs v1:
 *   - "image-grid" replaced with "image-focus" — a centered image with
 *     decorative frame and caption. The old Image Grid had 4 zones and
 *     produced the empty-placeholders bug. Image Focus uses a single zone
 *     and always renders correctly.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * CRITICAL RULE FOR image-zone RECTS:
 *   - _role: "image-zone"
 *   - selectable: false
 *   - evented: false
 *   - NO __background flag (that flag strips during serialization)
 *
 * Other structural rects (bg colour panels, overlay gradients) SHOULD have
 * __background: true — they are chrome, not image targets.
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Canvas coordinate space: 750 × 1000 px (matches PAGE_W × PAGE_H)
 */

export const PAGE_W = 750;
export const PAGE_H = 1000;

export type LayoutTemplateKey =
  | "full-bleed"
  | "text-bottom"
  | "text-top"
  | "image-focus";

export interface LayoutTemplate {
  id: LayoutTemplateKey;
  label: string;
  description: string;
  category: "story" | "chapter" | "decorative";
  fabricJson: object;
}

// ─── 1. FULL BLEED ────────────────────────────────────────────────────────────
const FULL_BLEED: LayoutTemplate = {
  id: "full-bleed",
  label: "Full Bleed",
  description: "Image fills entire page, text overlay at bottom",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#111111",
    objects: [
      // Image zone — full page
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: PAGE_H,
        fill: "#1a2744",
        selectable: false, evented: false,
      },
      // Gradient overlay
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 600,
        width: PAGE_W, height: 400,
        fill: "rgba(0,0,0,0.55)",
        selectable: false, evented: false,
        __background: true,
      },
      // Story text box
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 44, top: 720, width: 662,
        text: "Your story text goes here. Edit this to add the page content.",
        fontSize: 22, fontFamily: "Nunito", fontWeight: "normal",
        fill: "#ffffff", textAlign: "center", lineHeight: 1.6,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 2. TEXT BOTTOM ───────────────────────────────────────────────────────────
const TEXT_BOTTOM: LayoutTemplate = {
  id: "text-bottom",
  label: "Text Bottom",
  description: "Illustration top, text panel below",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#fffef7",
    objects: [
      // Image zone — top 62%
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: 620,
        fill: "#c8d8e8",
        selectable: false, evented: false,
      },
      // Cream text panel — bottom 38%
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 620,
        width: PAGE_W, height: 380,
        fill: "#fffef7",
        selectable: false, evented: false,
        __background: true,
      },
      // Gold divider
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 60, top: 619,
        width: PAGE_W - 120, height: 2,
        fill: "#c9a84c",
        selectable: false, evented: false,
      },
      // Story text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 50, top: 644, width: 650,
        text: "Your story text goes here. Edit this to add the page content for this spread.",
        fontSize: 20, fontFamily: "Lato", fontWeight: "normal",
        fill: "#2c1e0f", textAlign: "center", lineHeight: 1.7,
        selectable: true, evented: true,
      },
      // Page number
      {
        type: "textbox",
        version: "5.3.1",
        _role: "page-num",
        originX: "left", originY: "top",
        left: 345, top: 952, width: 60,
        text: "1", fontSize: 13, fontFamily: "Merriweather",
        fill: "#8b6914", textAlign: "center",
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 3. TEXT TOP ──────────────────────────────────────────────────────────────
const TEXT_TOP: LayoutTemplate = {
  id: "text-top",
  label: "Text Top",
  description: "Text panel top, illustration below",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#fffef7",
    objects: [
      // Cream text panel — top 38%
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: 380,
        fill: "#fffef7",
        selectable: false, evented: false,
        __background: true,
      },
      // Story text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 50, top: 44, width: 650,
        text: "Your story text goes here. Edit this to add the page content for this spread.",
        fontSize: 20, fontFamily: "Lato", fontWeight: "normal",
        fill: "#2c1e0f", textAlign: "center", lineHeight: 1.7,
        selectable: true, evented: true,
      },
      // Gold divider line
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 380,
        x1: 60, y1: 0, x2: PAGE_W - 60, y2: 0,
        stroke: "#c9a84c", strokeWidth: 2,
        selectable: false, evented: false,
      },
      // Image zone — bottom 62%
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 380,
        width: PAGE_W, height: 620,
        fill: "#c8d8e8",
        selectable: false, evented: false,
      },
    ],
  },
};

// ─── 4. IMAGE FOCUS ─────────────────────────────────────────────────────────
// Replaces the old Image Grid. Single centered image with caption below.
const IMAGE_FOCUS: LayoutTemplate = {
  id: "image-focus",
  label: "Image Focus",
  description: "Centered image with decorative caption",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#fffef7",
    objects: [
      // Cream background
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: PAGE_H,
        fill: "#fffef7",
        selectable: false, evented: false,
        __background: true,
      },
      // Image zone — large, centered
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 50, top: 80,
        width: PAGE_W - 100, height: 680,
        fill: "#d0dce8",
        stroke: "#c9a84c",
        strokeWidth: 3,
        selectable: false, evented: false,
      },
      // Top decorative flourish
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 40,
        x1: 200, y1: 0, x2: 550, y2: 0,
        stroke: "#c9a84c", strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Gold divider above caption
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 800,
        x1: 200, y1: 0, x2: 550, y2: 0,
        stroke: "#c9a84c80", strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Caption text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 60, top: 830, width: PAGE_W - 120,
        text: "Your caption or story text goes here.",
        fontSize: 20, fontFamily: "Lato", fontStyle: "italic",
        fill: "#2c1e0f", textAlign: "center", lineHeight: 1.5,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const LAYOUT_TEMPLATES: Record<LayoutTemplateKey, LayoutTemplate> = {
  "full-bleed":   FULL_BLEED,
  "text-bottom":  TEXT_BOTTOM,
  "text-top":     TEXT_TOP,
  "image-focus":  IMAGE_FOCUS,
};

export const LAYOUT_TEMPLATE_LIST = Object.values(LAYOUT_TEMPLATES);

export function getTemplateFabricJson(key: LayoutTemplateKey): object {
  return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES[key].fabricJson));
}