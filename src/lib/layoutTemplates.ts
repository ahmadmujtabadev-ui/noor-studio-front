/**
 * layoutTemplates.ts
 *
 * SINGLE SOURCE OF TRUTH for all page layout templates.
 *
 * These are pure Fabric.js JSON objects. They are:
 *   1. Loaded into the Fabric canvas when user picks a layout
 *   2. Saved as fabricJson via canvas.toJSON() when user edits
 *   3. Read by renderPageHtml.js on the server to generate PDF
 *
 * This means PDF = Canvas ALWAYS — no separate rendering logic needed.
 *
 * Canvas coordinate space: 750 × 1000 px (matches PAGE_W × PAGE_H)
 */

export const PAGE_W = 750;
export const PAGE_H = 1000;

export type LayoutTemplateKey =
  | "full-bleed"
  | "text-bottom"
  | "text-top"
  | "split-panel-left"
  | "split-panel-right"
  | "two-column"
  | "chapter-opener"
  | "quote-page"
  | "image-grid";

export interface LayoutTemplate {
  id: LayoutTemplateKey;
  label: string;
  description: string;
  category: "story" | "chapter" | "decorative";
  /** Fabric JSON — loaded directly into canvas.loadFromJSON() */
  fabricJson: object;
}

// ─── 1. FULL BLEED ────────────────────────────────────────────────────────────
// Full-page illustration with text overlay at bottom
const FULL_BLEED: LayoutTemplate = {
  id: "full-bleed",
  label: "Full Bleed",
  description: "Image fills entire page, text overlay at bottom",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#111111",
    objects: [
      // Background colour block (image placeholder)
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: PAGE_H,
        fill: "#1a2744",
        selectable: false, evented: false,
        __background: true,
      },
      // Gradient overlay — bottom third darkens for text readability
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
        left: 44, top: 720,
        width: 662,
        text: "Your story text goes here. Edit this to add the page content.",
        fontSize: 22,
        fontFamily: "Nunito",
        fontWeight: "normal",
        fill: "#ffffff",
        textAlign: "center",
        lineHeight: 1.6,
        backgroundColor: "",
        padding: 0,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 2. TEXT BOTTOM ───────────────────────────────────────────────────────────
// Top 62% illustration, bottom 38% cream text panel
const TEXT_BOTTOM: LayoutTemplate = {
  id: "text-bottom",
  label: "Text Bottom",
  description: "Illustration top, text panel below",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#fffef7",
    objects: [
      // Image zone background
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: 620,
        fill: "#c8d8e8",
        selectable: false, evented: false,
        __background: true,
      },
      // Cream text panel
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
      // Gold divider line
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 620,
        x1: 60, y1: 0, x2: PAGE_W - 60, y2: 0,
        stroke: "#c9a84c",
        strokeWidth: 2,
        selectable: false, evented: false,
      },
      // Story text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 50, top: 644,
        width: 650,
        text: "Your story text goes here. Edit this to add the page content for this spread.",
        fontSize: 20,
        fontFamily: "Lato",
        fontWeight: "normal",
        fill: "#2c1e0f",
        textAlign: "center",
        lineHeight: 1.7,
        selectable: true, evented: true,
      },
      // Page number
      {
        type: "textbox",
        version: "5.3.1",
        _role: "page-num",
        originX: "left", originY: "top",
        left: 345, top: 952,
        width: 60,
        text: "1",
        fontSize: 13,
        fontFamily: "Merriweather",
        fill: "#8b6914",
        textAlign: "center",
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 3. TEXT TOP ──────────────────────────────────────────────────────────────
// Top 38% cream text panel, bottom 62% illustration
const TEXT_TOP: LayoutTemplate = {
  id: "text-top",
  label: "Text Top",
  description: "Text panel top, illustration below",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#fffef7",
    objects: [
      // Cream text panel
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
        left: 50, top: 44,
        width: 650,
        text: "Your story text goes here. Edit this to add the page content for this spread.",
        fontSize: 20,
        fontFamily: "Lato",
        fontWeight: "normal",
        fill: "#2c1e0f",
        textAlign: "center",
        lineHeight: 1.7,
        selectable: true, evented: true,
      },
      // Gold divider line
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 380,
        x1: 60, y1: 0, x2: PAGE_W - 60, y2: 0,
        stroke: "#c9a84c",
        strokeWidth: 2,
        selectable: false, evented: false,
      },
      // Image zone
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 380,
        width: PAGE_W, height: 620,
        fill: "#c8d8e8",
        selectable: false, evented: false,
        __background: true,
      },
    ],
  },
};

// ─── 4. SPLIT PANEL LEFT ─────────────────────────────────────────────────────
// Left 42% dark text panel, right 58% illustration
const SPLIT_PANEL_LEFT: LayoutTemplate = {
  id: "split-panel-left",
  label: "Split — Text Left",
  description: "Dark text panel left, illustration right",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#ffffff",
    objects: [
      // Left dark panel
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: 315, height: PAGE_H,
        fill: "#1a2744",
        selectable: false, evented: false,
        __background: true,
      },
      // Right image zone
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 315, top: 0,
        width: 435, height: PAGE_H,
        fill: "#c8d8e8",
        selectable: false, evented: false,
        __background: true,
      },
      // Gold vertical rule
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 315, top: 0,
        x1: 0, y1: 80, x2: 0, y2: PAGE_H - 80,
        stroke: "#c9a84c",
        strokeWidth: 2,
        selectable: false, evented: false,
      },
      // Chapter label top-left
      {
        type: "textbox",
        version: "5.3.1",
        _role: "chapter-header",
        originX: "left", originY: "top",
        left: 28, top: 60,
        width: 260,
        text: "CHAPTER",
        fontSize: 11,
        fontFamily: "Cinzel",
        fill: "#c9a84c",
        textAlign: "left",
        charSpacing: 220,
        selectable: true, evented: true,
      },
      // Main story text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 28, top: 110,
        width: 262,
        text: "Your story text goes here. Edit this text to add your page content. The layout holds the image on the right.",
        fontSize: 18,
        fontFamily: "Merriweather",
        fontWeight: "normal",
        fill: "#f0ede4",
        textAlign: "left",
        lineHeight: 1.75,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 5. SPLIT PANEL RIGHT ────────────────────────────────────────────────────
// Left 58% illustration, right 42% dark text panel
const SPLIT_PANEL_RIGHT: LayoutTemplate = {
  id: "split-panel-right",
  label: "Split — Text Right",
  description: "Illustration left, dark text panel right",
  category: "story",
  fabricJson: {
    version: "5.3.1",
    background: "#ffffff",
    objects: [
      // Left image zone
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: 435, height: PAGE_H,
        fill: "#c8d8e8",
        selectable: false, evented: false,
        __background: true,
      },
      // Right dark panel
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 435, top: 0,
        width: 315, height: PAGE_H,
        fill: "#1a2744",
        selectable: false, evented: false,
        __background: true,
      },
      // Gold vertical rule
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 435, top: 0,
        x1: 0, y1: 80, x2: 0, y2: PAGE_H - 80,
        stroke: "#c9a84c",
        strokeWidth: 2,
        selectable: false, evented: false,
      },
      // Chapter label
      {
        type: "textbox",
        version: "5.3.1",
        _role: "chapter-header",
        originX: "left", originY: "top",
        left: 452, top: 60,
        width: 270,
        text: "CHAPTER",
        fontSize: 11,
        fontFamily: "Cinzel",
        fill: "#c9a84c",
        textAlign: "left",
        charSpacing: 220,
        selectable: true, evented: true,
      },
      // Main story text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 452, top: 110,
        width: 270,
        text: "Your story text goes here. Edit this text to add your page content.",
        fontSize: 18,
        fontFamily: "Merriweather",
        fontWeight: "normal",
        fill: "#f0ede4",
        textAlign: "left",
        lineHeight: 1.75,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 6. TWO COLUMN ───────────────────────────────────────────────────────────
// Pure text page, two columns, cream background
const TWO_COLUMN: LayoutTemplate = {
  id: "two-column",
  label: "Two Column",
  description: "Classic two-column text page, no image",
  category: "chapter",
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
      // Chapter header
      {
        type: "textbox",
        version: "5.3.1",
        _role: "chapter-header",
        originX: "left", originY: "top",
        left: 50, top: 36,
        width: 650,
        text: "CHAPTER TITLE",
        fontSize: 12,
        fontFamily: "Cinzel",
        fill: "#8b6914",
        textAlign: "center",
        charSpacing: 180,
        selectable: true, evented: true,
      },
      // Gold rule under header
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 68,
        x1: 200, y1: 0, x2: 550, y2: 0,
        stroke: "#c9a84c80",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Left column
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 50, top: 90,
        width: 298,
        text: "Left column text goes here. This is the first column of the two-column layout. Add your story prose in this area.",
        fontSize: 17,
        fontFamily: "Lato",
        fontWeight: "normal",
        fill: "#2c1e0f",
        textAlign: "left",
        lineHeight: 1.72,
        selectable: true, evented: true,
      },
      // Column divider
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 375, top: 90,
        x1: 0, y1: 0, x2: 0, y2: 820,
        stroke: "#c9a84c40",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Right column
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text-right",
        originX: "left", originY: "top",
        left: 402, top: 90,
        width: 298,
        text: "Right column text goes here. This is the second column. Continue your story content in this area.",
        fontSize: 17,
        fontFamily: "Lato",
        fontWeight: "normal",
        fill: "#2c1e0f",
        textAlign: "left",
        lineHeight: 1.72,
        selectable: true, evented: true,
      },
      // Page number
      {
        type: "textbox",
        version: "5.3.1",
        _role: "page-num",
        originX: "left", originY: "top",
        left: 345, top: 952,
        width: 60,
        text: "1",
        fontSize: 13,
        fontFamily: "Merriweather",
        fill: "#8b6914",
        textAlign: "center",
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 7. CHAPTER OPENER ───────────────────────────────────────────────────────
// Full-bleed image with centered chapter title overlay
const CHAPTER_OPENER: LayoutTemplate = {
  id: "chapter-opener",
  label: "Chapter Opener",
  description: "Full-bleed image with dramatic chapter title",
  category: "chapter",
  fabricJson: {
    version: "5.3.1",
    background: "#0d0d1a",
    objects: [
      // Full page image zone
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: PAGE_H,
        fill: "#1a2744",
        selectable: false, evented: false,
        __background: true,
      },
      // Dark gradient overlay — center band
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 340,
        width: PAGE_W, height: 320,
        fill: "rgba(0,0,0,0.65)",
        selectable: false, evented: false,
        __background: true,
      },
      // Gold ornament line above
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 390,
        x1: 180, y1: 0, x2: 570, y2: 0,
        stroke: "#c9a84c",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
      // "CHAPTER X" label
      {
        type: "textbox",
        version: "5.3.1",
        _role: "chapter-label",
        originX: "left", originY: "top",
        left: 50, top: 408,
        width: 650,
        text: "CHAPTER ONE",
        fontSize: 14,
        fontFamily: "Cinzel",
        fontWeight: "bold",
        fill: "#c9a84c",
        textAlign: "center",
        charSpacing: 280,
        selectable: true, evented: true,
      },
      // Chapter title
      {
        type: "textbox",
        version: "5.3.1",
        _role: "title",
        originX: "left", originY: "top",
        left: 50, top: 450,
        width: 650,
        text: "The Chapter Title",
        fontSize: 44,
        fontFamily: "Playfair Display",
        fontWeight: "bold",
        fontStyle: "italic",
        fill: "#ffffff",
        textAlign: "center",
        lineHeight: 1.2,
        selectable: true, evented: true,
      },
      // Gold ornament line below
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 590,
        x1: 180, y1: 0, x2: 570, y2: 0,
        stroke: "#c9a84c",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
    ],
  },
};

// ─── 8. QUOTE PAGE ───────────────────────────────────────────────────────────
// Decorative Islamic quote / dua page
const QUOTE_PAGE: LayoutTemplate = {
  id: "quote-page",
  label: "Quote / Dua",
  description: "Decorative page for quotes, duas, or Islamic phrases",
  category: "decorative",
  fabricJson: {
    version: "5.3.1",
    background: "#fffdf5",
    objects: [
      // Parchment background
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 0,
        width: PAGE_W, height: PAGE_H,
        fill: "#fffdf5",
        selectable: false, evented: false,
        __background: true,
      },
      // Outer border
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 22, top: 22,
        width: PAGE_W - 44, height: PAGE_H - 44,
        fill: "transparent",
        stroke: "#c9a84c",
        strokeWidth: 2,
        rx: 4, ry: 4,
        selectable: false, evented: false,
      },
      // Inner border
      {
        type: "rect",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 34, top: 34,
        width: PAGE_W - 68, height: PAGE_H - 68,
        fill: "transparent",
        stroke: "#c9a84c60",
        strokeWidth: 1,
        rx: 2, ry: 2,
        selectable: false, evented: false,
      },
      // Section label
      {
        type: "textbox",
        version: "5.3.1",
        _role: "chapter-header",
        originX: "left", originY: "top",
        left: 50, top: 120,
        width: 650,
        text: "DUA OF THE DAY",
        fontSize: 12,
        fontFamily: "Cinzel",
        fill: "#8b6914",
        textAlign: "center",
        charSpacing: 220,
        selectable: true, evented: true,
      },
      // Gold rule
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 158,
        x1: 150, y1: 0, x2: 600, y2: 0,
        stroke: "#c9a84c",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Large Arabic / quote text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "arabic-text",
        originX: "left", originY: "top",
        left: 60, top: 220,
        width: 630,
        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        fontSize: 38,
        fontFamily: "Amiri",
        fontStyle: "normal",
        fill: "#2c1e0f",
        textAlign: "center",
        lineHeight: 1.6,
        selectable: true, evented: true,
      },
      // Transliteration
      {
        type: "textbox",
        version: "5.3.1",
        _role: "transliteration",
        originX: "left", originY: "top",
        left: 60, top: 370,
        width: 630,
        text: "Bismillahi r-raḥmani r-raḥīm",
        fontSize: 18,
        fontFamily: "Cinzel",
        fill: "#8b6914",
        textAlign: "center",
        charSpacing: 60,
        selectable: true, evented: true,
      },
      // Gold rule
      {
        type: "line",
        version: "5.3.1",
        originX: "left", originY: "top",
        left: 0, top: 430,
        x1: 200, y1: 0, x2: 550, y2: 0,
        stroke: "#c9a84c80",
        strokeWidth: 1,
        selectable: false, evented: false,
      },
      // Translation / meaning
      {
        type: "textbox",
        version: "5.3.1",
        _role: "translation",
        originX: "left", originY: "top",
        left: 80, top: 460,
        width: 590,
        text: "In the name of Allah, the Most Gracious, the Most Merciful",
        fontSize: 19,
        fontFamily: "Merriweather",
        fontStyle: "italic",
        fill: "#4a3520",
        textAlign: "center",
        lineHeight: 1.65,
        selectable: true, evented: true,
      },
      // Explanation
      {
        type: "textbox",
        version: "5.3.1",
        _role: "explanation",
        originX: "left", originY: "top",
        left: 80, top: 600,
        width: 590,
        text: "Add your explanation or context here. This is a great place to share the story of this phrase and its significance.",
        fontSize: 16,
        fontFamily: "Lato",
        fill: "#5c4a30",
        textAlign: "center",
        lineHeight: 1.7,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── 9. IMAGE GRID ───────────────────────────────────────────────────────────
// 2×2 image grid with caption below
const IMAGE_GRID: LayoutTemplate = {
  id: "image-grid",
  label: "Image Grid",
  description: "2×2 image placeholders with caption",
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
      // Top-left image cell
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 30, top: 30,
        width: 330, height: 430,
        fill: "#d0dce8",
        stroke: "#c9a84c40",
        strokeWidth: 1,
        selectable: true, evented: true,
      },
      // Top-right image cell
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 390, top: 30,
        width: 330, height: 430,
        fill: "#d0dce8",
        stroke: "#c9a84c40",
        strokeWidth: 1,
        selectable: true, evented: true,
      },
      // Bottom-left image cell
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 30, top: 490,
        width: 330, height: 340,
        fill: "#d0dce8",
        stroke: "#c9a84c40",
        strokeWidth: 1,
        selectable: true, evented: true,
      },
      // Bottom-right image cell
      {
        type: "rect",
        version: "5.3.1",
        _role: "image-zone",
        originX: "left", originY: "top",
        left: 390, top: 490,
        width: 330, height: 340,
        fill: "#d0dce8",
        stroke: "#c9a84c40",
        strokeWidth: 1,
        selectable: true, evented: true,
      },
      // Caption text
      {
        type: "textbox",
        version: "5.3.1",
        _role: "body-text",
        originX: "left", originY: "top",
        left: 50, top: 858,
        width: 650,
        text: "Add a caption or description for these images here.",
        fontSize: 16,
        fontFamily: "Lato",
        fontStyle: "italic",
        fill: "#5c4a30",
        textAlign: "center",
        lineHeight: 1.5,
        selectable: true, evented: true,
      },
    ],
  },
};

// ─── Registry ─────────────────────────────────────────────────────────────────

export const LAYOUT_TEMPLATES: Record<LayoutTemplateKey, LayoutTemplate> = {
  "full-bleed":       FULL_BLEED,
  "text-bottom":      TEXT_BOTTOM,
  "text-top":         TEXT_TOP,
  "split-panel-left": SPLIT_PANEL_LEFT,
  "split-panel-right":SPLIT_PANEL_RIGHT,
  "two-column":       TWO_COLUMN,
  "chapter-opener":   CHAPTER_OPENER,
  "quote-page":       QUOTE_PAGE,
  "image-grid":       IMAGE_GRID,
};

export const LAYOUT_TEMPLATE_LIST = Object.values(LAYOUT_TEMPLATES);

/**
 * Returns a deep clone of a template's fabricJson so mutations
 * on canvas never corrupt the source template object.
 */
export function getTemplateFabricJson(key: LayoutTemplateKey): object {
  return JSON.parse(JSON.stringify(LAYOUT_TEMPLATES[key].fabricJson));
}