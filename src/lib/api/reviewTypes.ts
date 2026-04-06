// lib/reviewTypes.ts
// All TypeScript types for the review-first book builder workflow

export type AgeMode = "spreads-only" | "picture-book" | "chapter-book";

// ─── Review node statuses ─────────────────────────────────────────────────────
export type NodeStatus = "draft" | "generated" | "edited" | "approved";

// ─── Story review ─────────────────────────────────────────────────────────────
export interface StoryReviewCurrent {
  bookTitle: string;
  synopsis: string;
  moral: string;
  storyText: string;
  islamicTheme: Record<string, unknown>;
  dedicationMessage: string;
}

export interface StoryReview {
  status: NodeStatus;
  current: StoryReviewCurrent;
  versions: Array<{ version: number; snapshot: StoryReviewCurrent; createdAt: string }>;
  promptHistory: Array<{ prompt: string; provider: string; createdAt: string }>;
  approvedAt: string | null;
  updatedAt: string;
}

// ─── Structure review ─────────────────────────────────────────────────────────
export interface SpreadStructureItem {
  key: string;
  unitType: "spread";
  status: NodeStatus;
  current: {
    spreadIndex: number;
    chapterIndex?: number;
    text: string;
    prompt: string;
    illustrationHint: string;
    charactersInScene: string[];
    characterEmotion: Record<string, string>;
    sceneEnvironment: string;
    timeOfDay: string;
    textPosition: string;
    islamicElement: string | null;
  };
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

export interface ChapterOutlineItem {
  key: string;
  unitType: "chapter-outline";
  status: NodeStatus;
  current: {
    chapterNumber: number;
    title: string;
    goal: string;
    keyScene: string;
    duaHint: string;
    endingBeat: string;
    charactersInScene: string[];
    illustrationMoments: string[];
  };
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

export type StructureItem = SpreadStructureItem | ChapterOutlineItem;

export interface StructureReview {
  mode: AgeMode;
  items: StructureItem[];
}

// ─── Prose review ─────────────────────────────────────────────────────────────
export interface ProseReviewCurrent {
  chapterNumber: number;
  chapterTitle: string;
  chapterSummary: string;
  chapterText: string;
  islamicMoment: string;
  illustrationMoments: Array<{
    momentTitle?: string;
    illustrationHint?: string;
    charactersInScene?: string[];
    sceneEnvironment?: string;
    timeOfDay?: string;
  }>;
}

export interface ProseReviewNode {
  key: string;
  chapterIndex: number;
  status: NodeStatus;
  current: ProseReviewCurrent;
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

// ─── Humanized review ─────────────────────────────────────────────────────────
export interface HumanizedReviewCurrent {
  chapterNumber: number;
  chapterTitle: string;
  chapterSummary: string;
  chapterText: string;
  changesMade: string[];
}

export interface HumanizedReviewNode {
  key: string;
  chapterIndex: number;
  status: NodeStatus;
  current: HumanizedReviewCurrent;
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

// ─── Illustration review ──────────────────────────────────────────────────────
export interface ImageVariant {
  variantIndex: number;
  imageUrl: string;
  prompt: string;
  seed: number | null;
  selected: boolean;
  provider?: string;
}

export interface IllustrationReviewCurrent {
  imageUrl: string;
  prompt: string;
  seed: number | null;
  selectedVariantIndex: number;
  variants: ImageVariant[];
  text?: string;
  illustrationHint?: string;
  momentTitle?: string;
  charactersInScene?: string[];
  sceneEnvironment?: string;
  timeOfDay?: string;
}

export interface IllustrationNode {
  key: string;
  chapterIndex: number;
  spreadIndex: number;
  sourceType: "spread" | "chapter-moment";
  status: NodeStatus;
  current: IllustrationReviewCurrent;
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

// ─── Cover review ─────────────────────────────────────────────────────────────
export interface CoverSideNode {
  status: NodeStatus;
  current: {
    imageUrl: string;
    prompt: string;
    seed: number | null;
    selectedVariantIndex: number;
    variants: ImageVariant[];
  };
  versions: unknown[];
  approvedAt: string | null;
  updatedAt: string;
}

export interface CoverReview {
  front: CoverSideNode;
  back: CoverSideNode;
  spine?: CoverSideNode;
}

// ─── Full review object ───────────────────────────────────────────────────────
export interface ProjectReview {
  story: StoryReview;
  structure: StructureReview;
  prose: ProseReviewNode[];
  humanized: HumanizedReviewNode[];
  illustrations: IllustrationNode[];
  cover: CoverReview;
}

// ─── Review API responses ─────────────────────────────────────────────────────
export interface ReviewResponse {
  review: ProjectReview;
  workflow: {
    mode: AgeMode;
    currentStage: string;
    stages: Record<string, boolean>;
  };
  currentStep: number;
  stepsComplete: Record<string, boolean>;
  updatedAt: string;
}

// ─── Step definitions ─────────────────────────────────────────────────────────
export interface StepDef {
  id: number;
  key: string;
  label: string;
  icon: string;
}

export const SPREAD_STEPS: StepDef[] = [
  { id: 1, key: "story",         label: "Story",        icon: "BookOpen"   },
  { id: 2, key: "structure",     label: "Structure",    icon: "FileText"   },
  { id: 3, key: "style",         label: "Style",        icon: "Palette"    },
  { id: 4, key: "illustrations", label: "Illustrations", icon: "Image"     },
  { id: 5, key: "cover",         label: "Cover",        icon: "BookMarked" },
  { id: 6, key: "editor",        label: "Editor",       icon: "Layout"     },
];

export const CHAPTER_STEPS: StepDef[] = [
  { id: 1, key: "story",         label: "Story",        icon: "BookOpen"   },
  { id: 2, key: "structure",     label: "Outline",      icon: "FileText"   },
  { id: 3, key: "style",         label: "Style",        icon: "Palette"    },
  { id: 4, key: "prose",         label: "Prose",        icon: "PenLine"    },
  { id: 5, key: "illustrations", label: "Illustrations", icon: "Image"     },
  { id: 6, key: "cover",         label: "Cover",        icon: "BookMarked" },
  { id: 7, key: "editor",        label: "Editor",       icon: "Layout"     },
];

export function getSteps(mode: AgeMode): StepDef[] {
  return mode === "chapter-book" ? CHAPTER_STEPS : SPREAD_STEPS;
}

export function getAgeMode(ageRange: string): AgeMode {
  const nums = String(ageRange || "").match(/\d+/g) || [];
  const first = Number(nums[0] || 8);
  const last  = Number(nums[1] || first);
  const avg   = (first + last) / 2;
  if (first <= 5) return "spreads-only";
  if (avg  <= 8)  return "picture-book";
  return "chapter-book";
}

export function normArr<T>(value: unknown): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean) as T[];
  if (typeof value === "object") {
    const obj = value as Record<string, T>;
    return Object.keys(obj)
      .sort((a, b) => Number(a) - Number(b))
      .map((k) => obj[k])
      .filter(Boolean);
  }
  return [];
}