// src/types/cover.types.ts
// TypeScript interfaces for the book cover system — front, spine, and back.

// ─── Cover URL bundle ─────────────────────────────────────────────────────────

export interface CoverUrls {
  frontUrl: string | null;
  spineUrl: string | null;
  backUrl: string | null;
}

// ─── Book preview props ───────────────────────────────────────────────────────

export interface BookPreviewProps {
  /** URL of the generated front cover image */
  frontUrl: string | null;
  /** URL of the generated spine image */
  spineUrl: string | null;
  /** URL of the generated back cover image */
  backUrl: string | null;
  /** Book width in inches (default: 6) */
  bookWidth?: number;
  /** Book height in inches (default: 9) */
  bookHeight?: number;
  /** Spine width in inches (default: 0.5) */
  spineWidth?: number;
  /** Additional CSS class */
  className?: string;
}

// ─── Cover design sub-sections (mirrors KB flat fields, structured for UI) ───

export interface CoverDesignFront {
  selectedCoverTemplate: string | null;
  bookTitle: string;
  subtitle: string;
  authorName: string;
  mainVisualConcept: string;
  characterDescription: string;
  moodTheme: string;
  colorStyle: string;
  titlePlacement: string;
  authorTaglinePlacement: string;
  typographyTitle: string;
  typographyBody: string;
  lightingEffects: string;
  foregroundLayer: string;
  midgroundLayer: string;
  backgroundLayer: string;
  islamicMotifs: string[];
  characterComposition: string[];
  characterMustInclude: string[];
  brandingRules: string[];
  optionalAddons: string[];
  avoidCover: string[];
  extraNotes: string;
}

export interface CoverDesignSpine {
  selectedSpineTemplate: string | null;
  spineColorBackground: string;
  spineTypographyStyle: string;
  spinePromptDirective: string;
  spineTitle: string;
  spineAuthor: string;
  publisherLogo: string;
}

export interface CoverDesignBack {
  selectedBackTemplate: string | null;
  backBackgroundStyle: string;
  backPromptDirective: string;
  blurb: string;
  publisherName: string;
  website: string;
  price: string;
  isbn: string;
}

export interface StructuredCoverDesign {
  frontCover: CoverDesignFront;
  spine: CoverDesignSpine;
  backCover: CoverDesignBack;
  /** Print/production settings */
  trimSize: string;
  spineWidth: string;
  bleed: string;
  resolution: string;
}

// ─── Cover generation request ─────────────────────────────────────────────────

export type CoverSide = "front" | "back" | "spine";

export interface CoverRegenerateOptions {
  variantCount?: number;
  prompt?: string;
  seed?: number;
  style?: string;
  /** When true, the AI renders visible typography on the image (preview mode) */
  previewMode?: boolean;
}

// ─── Preview display mode ─────────────────────────────────────────────────────

export type PreviewDisplayMode = "3d" | "flat";
