// ─── Static constants used across pages ──────────────────────────────────────

export type AssetStatus = 'draft' | 'approved' | 'locked';
export type PlanTier = 'creator' | 'author' | 'studio';
export type CreditType = 'character' | 'book';
export type ProjectStage = 'outline' | 'chapters' | 'humanize' | 'illustrations' | 'cover' | 'layout' | 'export';

export const AGE_RANGES = ['2-4', '4-7', '5-8', '6-9', '8-12'];

export const CHARACTER_STYLES = [
  { id: 'pixar-3d', label: 'Pixar 3D' },
  { id: 'watercolor', label: 'Watercolor' },
  { id: 'flat-illustration', label: 'Flat Illustration' },
  { id: 'manga', label: 'Manga' },
  { id: 'pencil-sketch', label: 'Pencil Sketch' },
] as const;

export type CharacterStyle = typeof CHARACTER_STYLES[number]['id'];

export interface BookTemplate {
  id: string;
  name: string;
  description: string;
  ageRange: string;
}

export const BOOK_TEMPLATES: BookTemplate[] = [
  {
    id: 'adventure',
    name: 'Middle-Grade Adventure',
    description: 'Epic journeys with moral lessons for ages 8-12',
    ageRange: '8-12',
  },
  {
    id: 'values',
    name: 'Junior Values Story',
    description: 'Gentle tales about honesty, kindness, and sharing for ages 4-7',
    ageRange: '4-7',
  },
  {
    id: 'educational',
    name: 'Educational (Salah/Quran)',
    description: 'Learn Islamic practices through engaging illustrated stories',
    ageRange: '4-8',
  },
  {
    id: 'seerah',
    name: 'Seerah-Inspired',
    description: "Stories from the Prophet's life adapted for young readers",
    ageRange: '6-12',
  },
];

export interface PipelineStageDefinition {
  id: ProjectStage;
  label: string;
  description: string;
  creditCost: number;
  icon: string;
  requiresStage?: ProjectStage;
}

export const PIPELINE_STAGES = [
  { id: "outline",     label: "Outline",       creditCost: 3,  requiresStage: undefined },
  { id: "dedication",  label: "Dedication",    creditCost: 1,  requiresStage: "outline" },  // ← ADD
  { id: "theme",       label: "Islamic Theme", creditCost: 1,  requiresStage: "outline" },  // ← ADD
  { id: "chapters",    label: "Chapters",      creditCost: 1,  requiresStage: "outline" },
  { id: "humanize",    label: "Humanize",      creditCost: 1,  requiresStage: "chapters" },
  { id: "illustrations", label: "Illustrations", creditCost: 10, requiresStage: "chapters" },
  { id: "cover",       label: "Cover",         creditCost: 3,  requiresStage: undefined },
  { id: "layout",      label: "Layout",        creditCost: 2,  requiresStage: "illustrations" },
  { id: "export",      label: "Export",        creditCost: 2,  requiresStage: "layout" },
];

export const STAGE_CREDIT_COSTS: Record<string, number> = {
  outline:       3,
  dedication:    1,  // ← ADD
  theme:         1,  // ← ADD
  chapters:      1,
  humanize:      1,
  illustrations: 10,
  cover:         3,
  layout:        2,
  export:        2,
};

export type LayoutStyle = 'split-page' | 'full-image' | 'text-under-image';
export type TrimSize = '6x9' | '8x10' | '8.5x8.5' | '11x8.5';
export type ExportTarget = 'pdf' | 'epub' | 'print-ready-pdf';
export type TemplateType = 'adventure' | 'values' | 'educational' | 'seerah';
