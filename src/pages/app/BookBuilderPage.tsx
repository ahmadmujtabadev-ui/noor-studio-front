"use client";
// BookBuilderPage.tsx — 5-step AI book creation
//
// AGE MODES (matches backend getAgeProfile):
//   age first<=5      → spreads-only   short pages, no chapters
//   age avg<=8        → picture-book   chapter-like short page flow
//   age avg>8 (9+)    → chapter-book   full prose chapters generated later in editor
//
// IMPORTANT FLOW:
//   < 6   : story → spreads/page plan → portraits → illustrations → editor
//   6–8   : story → structure/pages    → portraits → illustrations → editor
//   9+    : story → chapter outline    → portraits → deferred images notice → editor
//
// For 9+ chapter-book mode:
//   - Step 2 creates chapter OUTLINE only
//   - Full chapter prose is generated in editor via backend "chapters" stage
//   - Illustration moments come after chapter generation, so Step 4 is informational/deferred

import React, { useMemo, useRef, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  BookOpen,
  Users,
  Palette,
  Image as ImageIcon,
  Layout,
  RefreshCw,
  AlertTriangle,
  Baby,
  Wand2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  CheckCircle2,
  FileText,
  Zap,
  BookMarked,
  Clock3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import { aiApi } from "@/lib/api/ai.api";
import { projectsApi } from "@/lib/api/projects.api";
import { pagesApi } from "@/lib/api/pages.api";
import { useCredits } from "@/hooks/useAuth";
import { useAuthStore } from "@/lib/store/authStore";
import type {
  Character,
  SpreadItem,
  ImageVariant,
  BookStyle,
} from "@/lib/api/types";

// ─── Age mode — matches backend exactly ───────────────────────────────────────
type AgeMode = "spreads-only" | "picture-book" | "chapter-book";

function getAgeMode(ageRange: string): AgeMode {
  const nums = ageRange.match(/\d+/g) || [];
  const first = Number(nums[0] || 8);
  const last = Number(nums[1] || first);
  const avg = (first + last) / 2;

  if (first <= 5) return "spreads-only";
  if (avg <= 8) return "picture-book";
  return "chapter-book";
}

function getStructureLabel(mode: AgeMode) {
  if (mode === "spreads-only") return "Pages";
  if (mode === "picture-book") return "Pages";
  return "Chapters";
}

// Legacy illustration slot key helper, still used for non-chapter-book flows
function illKey(isChapterBook: boolean, ci: number, si: number): string {
  return isChapterBook ? `${ci}_${si}` : `${si}`;
}

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Story",
    icon: BookOpen,
    apiHit: "Claude — story generation",
  },
  {
    id: 2,
    title: "Structure",
    icon: FileText,
    apiHit: "Claude — chapters / spreads",
  },
  {
    id: 3,
    title: "Style",
    icon: Palette,
    apiHit: "Image AI — character portrait",
  },
  {
    id: 4,
    title: "Images",
    icon: ImageIcon,
    apiHit: "Image AI — variants per illustrated page",
  },
  {
    id: 5,
    title: "Editor",
    icon: Layout,
    apiHit: "No AI — editorial",
  },
];

const AGE_RANGES = [
  {
    value: "2-4",
    label: "2–4",
    badge: "Toddler",
    color:
      "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  },
  {
    value: "4-5",
    label: "4–5",
    badge: "Spreads only",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  },
  {
    value: "6-8",
    label: "6–8",
    badge: "Picture book",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    value: "8-12",
    label: "8–12",
    badge: "Chapter book",
    color:
      "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  },
];

const ISLAMIC_THEMES = [
  { id: "sharing", label: "Sharing & Generosity", icon: "🤝" },
  { id: "honesty", label: "Honesty & Truth", icon: "✨" },
  { id: "gratitude", label: "Gratitude (Shukr)", icon: "🌸" },
  { id: "patience", label: "Patience (Sabr)", icon: "🌱" },
  { id: "kindness", label: "Kindness & Compassion", icon: "💚" },
  { id: "dua", label: "Dua & Prayer", icon: "🤲" },
  { id: "family", label: "Family & Love", icon: "🏡" },
  { id: "custom", label: "Custom / Other", icon: "⭐" },
];

const SPREAD_COUNTS = [
  { value: "6", label: "6", note: "Very short" },
  { value: "8", label: "8", note: "Short" },
  { value: "10", label: "10", note: "Standard" },
  { value: "12", label: "12", note: "Medium" },
];

const CHAPTER_COUNTS = [
  { value: "3", label: "3 chapters", note: "Short" },
  { value: "4", label: "4 chapters", note: "Standard" },
  { value: "6", label: "6 chapters", note: "Medium" },
  { value: "8", label: "8 chapters", note: "Long" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "urdu", label: "Urdu" },
  { value: "arabic", label: "Arabic" },
  { value: "bilingual", label: "Bilingual (EN+UR)" },
];

const ART_STYLES = [
  {
    id: "pixar-3d",
    name: "Pixar 3D",
    description: "Warm, vibrant, cinematic",
    preview: "🎬",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    description: "Soft, hand-painted, gentle",
    preview: "🎨",
  },
  {
    id: "flat-cartoon",
    name: "Flat Cartoon",
    description: "Bold, clean, modern",
    preview: "✏️",
  },
  {
    id: "storybook",
    name: "Storybook Classic",
    description: "Warm, illustrated, timeless",
    preview: "📖",
  },
  {
    id: "ghibli",
    name: "Ghibli-inspired",
    description: "Expressive, detailed, magical",
    preview: "🌿",
  },
];

const TRIM_SIZES = [
  { value: "8.5x8.5", label: '8.5" × 8.5"', note: "Square — most popular" },
  { value: "8x10", label: '8" × 10"', note: "Standard portrait" },
  { value: "6x9", label: '6" × 9"', note: "Chapter book" },
];

const BG_STYLES = [
  {
    id: "mixed",
    label: "Mixed",
    description: "Indoor + outdoor based on scene",
  },
  {
    id: "indoor",
    label: "Indoor only",
    description: "Warm rooms, cozy interiors",
  },
  {
    id: "outdoor",
    label: "Outdoor",
    description: "Garden, sky, nature",
  },
];

const VARIANT_OPTIONS = [
  { value: 2, note: "8 cr/page" },
  { value: 3, note: "12 cr/page" },
  { value: 4, note: "16 cr — recommended" },
  { value: 5, note: "20 cr" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  done,
}: {
  current: number;
  done: Set<number>;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all",
                done.has(s.id)
                  ? "bg-primary text-primary-foreground"
                  : current === s.id
                    ? "bg-primary/15 text-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {done.has(s.id) ? <Check className="w-4 h-4" /> : s.id}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-1 transition-all",
                  done.has(s.id) ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {STEPS.map((s) => (
          <div
            key={s.id}
            className={cn(
              "flex-1 text-center",
              current === s.id ? "text-primary" : "text-muted-foreground",
            )}
          >
            <p
              className={cn(
                "text-xs font-medium",
                current === s.id && "font-semibold",
              )}
            >
              {s.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiBadge({ step }: { step: number }) {
  const s = STEPS.find((x) => x.id === step);
  if (!s) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 w-fit">
      <Zap className="w-3 h-3 text-amber-600 shrink-0" />
      <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
        {s.apiHit}
      </span>
    </div>
  );
}

function AgeModeBanner({
  mode,
  ageRange,
}: {
  mode: AgeMode;
  ageRange: string;
}) {
  const cfg: Record<
    AgeMode,
    { icon: React.ReactNode; wrap: string; title: string; body: string }
  > = {
    "spreads-only": {
      icon: <Baby className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />,
      wrap: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
      title: `Spreads-only (ages ${ageRange})`,
      body: "Short illustrated pages, one complete sentence each. No chapters.",
    },
    "picture-book": {
      icon: <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />,
      wrap: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
      title: `Picture book (ages ${ageRange})`,
      body: "Short page-based structure with simple illustrated text.",
    },
    "chapter-book": {
      icon: <BookMarked className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />,
      wrap: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
      title: `Chapter book (ages ${ageRange})`,
      body: "Step 2 creates chapter outline. Full prose chapters are generated later in editor.",
    },
  };

  const c = cfg[mode];

  return (
    <div className={cn("flex items-start gap-2 p-3 rounded-lg border", c.wrap)}>
      {c.icon}
      <div>
        <p className="text-xs font-semibold">{c.title}</p>
        <p className="text-xs mt-0.5 opacity-80">{c.body}</p>
      </div>
    </div>
  );
}

function EditableSpread({
  spread,
  index,
  total,
  onUpdate,
  onRerun,
  isRerunning,
}: {
  spread: SpreadItem & {
    prompt?: string;
    illustrationHint?: string;
    sceneEnvironment?: string;
  };
  index: number;
  total: number;
  onUpdate: (i: number, t: string) => void;
  onRerun: (i: number, p: string) => Promise<void>;
  isRerunning: boolean;
}) {
  const [val, setVal] = useState(spread.text);
  const [showPrm, setShowPrm] = useState(false);
  const [prm, setPrm] = useState(spread.prompt || "");
  const [running, setRunning] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary">
            Page {index + 1}
          </span>
          <span className="text-xs text-muted-foreground">of {total}</span>
          {spread.sceneEnvironment && (
            <Badge variant="outline" className="text-xs">
              {spread.sceneEnvironment}
            </Badge>
          )}
        </div>
        {spread.illustrationHint && (
          <span className="text-xs text-muted-foreground truncate max-w-[160px]">
            {spread.illustrationHint.slice(0, 40)}…
          </span>
        )}
      </div>

      <div className="p-3 space-y-2">
        <textarea
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
            onUpdate(index, e.target.value);
          }}
          className="w-full text-sm leading-relaxed resize-none border-0 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 py-0.5 min-h-[40px]"
          rows={2}
          placeholder="Page text..."
        />

        {spread.prompt && (
          <button
            onClick={() => setShowPrm((o) => !o)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Wand2 className="w-3 h-3" />
            {showPrm ? "Hide" : "Edit & re-run"}
            {showPrm ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {showPrm && (
          <div className="space-y-2 pt-1">
            <Textarea
              value={prm}
              onChange={(e) => setPrm(e.target.value)}
              rows={3}
              className="text-xs font-mono resize-none bg-muted/30"
              placeholder="Custom instruction…"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                className="text-xs h-7"
                disabled={running || isRerunning || !prm.trim()}
                onClick={async () => {
                  setRunning(true);
                  try {
                    await onRerun(index, prm);
                  } finally {
                    setRunning(false);
                  }
                }}
              >
                {running ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Regenerating…
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Re-run
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChapterOutlineCard({
  chapter,
  index,
}: {
  chapter: any;
  index: number;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <button
        onClick={() => setExpanded((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {index + 1}
          </div>
          <span className="font-semibold text-sm text-left">
            {chapter.title || `Chapter ${index + 1}`}
          </span>
          <Badge variant="outline" className="text-xs">
            prose chapter
          </Badge>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="p-4 space-y-2">
          {chapter.goal && (
            <p className="text-xs text-muted-foreground">{chapter.goal}</p>
          )}
          {chapter.keyScene && (
            <p className="text-xs">
              <span className="font-semibold text-primary">Key scene: </span>
              {chapter.keyScene}
            </p>
          )}
          {chapter.duaHint && chapter.duaHint !== "none" && (
            <p className="text-xs text-green-700 dark:text-green-400">
              🤲 {chapter.duaHint}
            </p>
          )}
          {chapter.endingBeat && (
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <span className="font-semibold">Ending beat: </span>
              {chapter.endingBeat}
            </p>
          )}
          {Array.isArray(chapter.illustrationMoments) &&
            chapter.illustrationMoments.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border flex flex-wrap gap-1">
                {chapter.illustrationMoments.map((m: string, i: number) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  >
                    {m}
                  </span>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function VariantPicker({
  label,
  pageKey,
  variants,
  selectedIdx,
  onSelect,
  loading,
}: {
  label: string;
  pageKey: string;
  variants: ImageVariant[];
  selectedIdx: number;
  onSelect: (key: string, vi: number) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-muted/30 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-primary" />
          <span className="text-xs font-mono text-muted-foreground">
            {label} — generating…
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!variants.length) return null;

  return (
    <div
      className={cn(
        "rounded-xl border-2 overflow-hidden",
        selectedIdx >= 0 ? "border-primary/50" : "border-border",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-xs font-mono font-bold text-primary">{label}</span>
        {selectedIdx >= 0 && (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Variant {selectedIdx + 1}
          </Badge>
        )}
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {variants.map((v, vi) => (
          <button
            key={vi}
            onClick={() => onSelect(pageKey, vi)}
            className={cn(
              "relative rounded-lg overflow-hidden border-2 transition-all group",
              selectedIdx === vi
                ? "border-primary ring-2 ring-primary ring-offset-1"
                : "border-border hover:border-primary/50",
            )}
          >
            <img
              src={v.imageUrl}
              alt={`Variant ${vi + 1}`}
              className="w-full aspect-square object-cover"
            />
            <div
              className={cn(
                "absolute inset-0 flex items-end justify-center pb-2 transition-opacity",
                selectedIdx === vi
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            >
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  selectedIdx === vi
                    ? "bg-primary text-primary-foreground"
                    : "bg-black/60 text-white",
                )}
              >
                {selectedIdx === vi ? "✓ Selected" : `Variant ${vi + 1}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CharStyleCard({
  character,
  artStyle,
  generatedUrl,
  isGenerating,
  onGenerate,
}: {
  character: Character;
  artStyle: string;
  generatedUrl?: string;
  isGenerating: boolean;
  onGenerate: (id: string, style: string) => Promise<void>;
}) {
  const [gen, setGen] = useState(false);
  const url = generatedUrl || character.masterReferenceUrl;
  const running = gen || isGenerating;

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{character.name}</span>
          <Badge variant="outline" className="text-xs">
            {character.role}
          </Badge>
          {character.ageRange && (
            <Badge variant="outline" className="text-xs">
              age {character.ageRange}
            </Badge>
          )}
        </div>
        {url && <CheckCircle2 className="w-4 h-4 text-green-600" />}
      </div>

      <div className="p-4 flex gap-4">
        <div className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border">
          {character.imageUrl || character.poseSheetUrl ? (
            <img
              src={character.imageUrl || character.poseSheetUrl}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {running ? (
            <div className="w-20 h-20 rounded-lg bg-muted border border-border flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground mt-1">
                  Generating…
                </p>
              </div>
            </div>
          ) : url ? (
            <div className="flex gap-2 items-start">
              <div className="relative">
                <img
                  src={url}
                  alt={character.name}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-primary"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                  Portrait ready
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {artStyle}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No portrait yet.</p>
          )}

          <Button
            size="sm"
            variant={url ? "outline" : "default"}
            className="text-xs h-7"
            disabled={running}
            onClick={async () => {
              setGen(true);
              try {
                await onGenerate(character.id || character._id, artStyle);
              } finally {
                setGen(false);
              }
            }}
          >
            {running ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating…
              </>
            ) : url ? (
              <>
                <RefreshCw className="w-3 h-3 mr-1" />
                Regenerate
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1" />
                Generate portrait
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DeferredImageBlock({
  chapterCount,
}: {
  chapterCount: number;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-8 space-y-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Clock3 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300">
            Images are generated after chapters for age 9+
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
            In chapter-book mode, Step 2 only creates the chapter outline.
            The exact illustration moments appear after full prose chapters are
            generated in the editor.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-background p-4 space-y-3">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
          Correct testing flow for chapter books:
        </p>
        {[
          `1. Story is already generated`,
          `2. Outline is already generated (${chapterCount} chapters)`,
          `3. Character portraits are ready`,
          `4. In editor: run "chapters" to generate full prose chapterText`,
          `5. Then run chapter illustrations from the chapter illustration moments`,
          `6. Then humanize / layout / export`,
        ].map((line, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 shrink-0">
              {i + 1}.
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-400">{line}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-blue-300 p-4 text-center">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
          Nothing is broken here — this step is intentionally deferred for 9+
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
          That matches your updated backend chapter-book logic.
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const { universes } = useUniverses();
  const { data: allChars = [] } = useCharacters();

  const [step, setStep] = useState(1);
  const [doneSt, setDoneSt] = useState<Set<number>>(new Set());
  const [isLoading, setLoad] = useState(false);
  const pidRef = useRef<string | null>(null);

  // Step 1
  const [storyIdea, setSI] = useState("");
  const [ageRange, setAR] = useState("");
  const [theme, setTh] = useState("");
  const [lang, setLg] = useState("english");
  const [authorName, setAN] = useState("");
  const [univId, setUI] = useState("");
  const [genStory, setGS] = useState<any>(null);
  const [editTitle, setET] = useState("");
  const [editText, setETx] = useState("");

  // Step 2
  const [charIds, setCIs] = useState<string[]>([]);
  const [pageCount, setPC] = useState("10");
  const [chapCount, setCC] = useState("4");
  const [trimSize, setTrim] = useState("8.5x8.5");
  const [artStyle, setAS] = useState("pixar-3d");
  const [bgStyle, setBG] = useState("mixed");
  const [indoorDesc, setID] = useState(
    "warm playroom, beige walls, colorful rug",
  );
  const [outdoorDesc, setOD] = useState(
    "sunny garden, green grass, blue sky, flowers",
  );
  const [bookProps, setBP] = useState("");
  const [spreads, setSpr] = useState<SpreadItem[]>([]);
  const [chapters, setChaps] = useState<any[]>([]);
  const [rerunIdx, setRRI] = useState<number | null>(null);

  // Step 3
  const [portraits, setPrt] = useState<Record<string, string>>({});
  const [genPrt, setGP] = useState(false);

  // Step 4 (only for non-chapter-book flows)
  const [varCount, setVC] = useState(4);
  const [genKey, setGK] = useState<string | null>(null);
  const [allVars, setAV] = useState<Record<string, ImageVariant[]>>({});
  const [selVars, setSV] = useState<Record<string, number>>({});
  const [genAll, setGA] = useState(false);
  const [genPct, setGPct] = useState(0);

  const mode = ageRange ? getAgeMode(ageRange) : ("picture-book" as AgeMode);
  const isChapBook = mode === "chapter-book";
  const isSpreadsOnly = mode === "spreads-only";
  const structureLabel = getStructureLabel(mode);

  const selChars = useMemo(
    () =>
      (allChars as Character[]).filter((c) =>
        charIds.includes(c.id || c._id),
      ),
    [allChars, charIds],
  );

  const numPages = parseInt(pageCount, 10);
  const numChaps = parseInt(chapCount, 10);

  const step2Has = isChapBook ? chapters.length > 0 : spreads.length > 0;

  const illSlots: Array<{ ci: number; si: number; label: string }> = isChapBook
    ? []
    : spreads.map((_, si) => ({
        ci: 0,
        si,
        label: `Page ${si + 1} of ${spreads.length}`,
      }));

  const totalVarCost = illSlots.length * varCount * 4;
  const confirmedCount = Object.keys(selVars).length;
  const allImgDone = illSlots.length > 0 && confirmedCount >= illSlots.length;
  const allPrtDone =
    charIds.length === 0 ||
    charIds.every(
      (id) =>
        portraits[id] ||
        (allChars as Character[]).find((c) => (c.id || c._id) === id)
          ?.masterReferenceUrl,
    );

  const markDone = (n: number) =>
    setDoneSt((p) => new Set<number>([...Array.from(p), n]));

  const goTo = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPid = () => {
    if (!pidRef.current) throw new Error("Project not created");
    return pidRef.current;
  };

  // ── Step 1 ────────────────────────────────────────────────────────────────
  const handleGenerateStory = async () => {
    if (!storyIdea.trim()) {
      toast({ title: "Enter a story idea first", variant: "destructive" });
      return;
    }
    if (!ageRange) {
      toast({ title: "Select an age range", variant: "destructive" });
      return;
    }
    if (credits < 4) {
      toast({ title: "Insufficient credits — need 4", variant: "destructive" });
      return;
    }

    setLoad(true);
    try {
      const proj = await projectsApi.create({
        title: storyIdea.slice(0, 80),
        ageRange,
        storyIdea,
        learningObjective: theme && theme !== "custom" ? theme : undefined,
        language: lang,
        authorName: authorName || undefined,
        universeId: univId || undefined,
        chapterCount: isChapBook ? numChaps : numPages,
        trimSize,
      });

      pidRef.current = proj.id || proj._id;

      const res = await aiApi.generateStory(pidRef.current, storyIdea);
      let data = res.result as any;

      if (data?.raw && !data?.bookTitle) {
        const raw = data.raw as string;
        const titleMatch = raw.match(/"bookTitle"\s*:\s*"([^"]+)"/);
        const storyMatch = raw.match(/"storyText"\s*:\s*"((?:[^"\\]|\\.)*)"/);
        const moralMatch = raw.match(/"moral"\s*:\s*"([^"]+)"/);
        const synopsisMatch = raw.match(/"synopsis"\s*:\s*"([^"]+)"/);

        if (titleMatch) {
          data = {
            bookTitle: titleMatch[1],
            storyText: storyMatch
              ? storyMatch[1].replace(/\\n/g, "\n")
              : editText || storyIdea,
            moral: moralMatch ? moralMatch[1] : "",
            synopsis: synopsisMatch ? synopsisMatch[1] : "",
          };
        } else {
          throw new Error(
            "Story generation returned invalid JSON — please try again.",
          );
        }
      }

      if (data?.bookTitle) {
        setGS(data);
        setET(data.bookTitle || "");
        setETx(data.storyText || "");
      }

      if (data?.storyText) {
        await projectsApi.update(pidRef.current, {
          title: data.bookTitle || storyIdea.slice(0, 80),
          artifacts: { storyText: data.storyText },
        });
      }

      await refreshUser();
      markDone(1);

      toast({
        title: "Story generated!",
        description: `"${data?.bookTitle}" is ready.`,
      });
    } catch (err) {
      toast({
        title: "Story generation failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoad(false);
    }
  };

  const handleStoryApproved = async () => {
    if (!pidRef.current) return;

    await projectsApi.update(pidRef.current, {
      title: editTitle,
      chapterCount: isChapBook ? numChaps : numPages,
      artifacts: { storyText: editText },
    });

    goTo(2);
  };

  // ── Step 2 ────────────────────────────────────────────────────────────────
  const handleGenerateStructure = async () => {
    const pid = getPid();

    if (credits < 6) {
      toast({ title: "Insufficient credits — need 6", variant: "destructive" });
      return;
    }

    setLoad(true);
    try {
      const bookStyle: BookStyle = {
        artStyle,
        backgroundStyle: bgStyle,
        indoorRoomDescription: indoorDesc,
        outdoorDescription: outdoorDesc,
        bookProps: bookProps || undefined,
      };

      await projectsApi.update(pid, {
        characterIds: charIds,
        chapterCount: isChapBook ? numChaps : numPages,
        trimSize,
        bookStyle,
        artifacts: {},
      });

      const res = await aiApi.generateSpreadPlan(pid);
      const data = res.result as any;

      if (isChapBook) {
        const chaps = data?.chapters || data?.outline?.chapters || [];
        setChaps(chaps);

        if (chaps.length > 0) {
          markDone(2);
          toast({
            title: "Chapter outline ready!",
            description: `${chaps.length} chapters planned.`,
          });
        } else {
          toast({
            title: "No chapters returned — try again",
            variant: "destructive",
          });
        }
      } else {
        const spr = data?.spreads || [];
        setSpr(spr);

        if (spr.length > 0) {
          markDone(2);
          toast({
            title: "Pages planned!",
            description: `${spr.length} pages created.`,
          });
        } else {
          toast({
            title: "No pages returned — try again",
            variant: "destructive",
          });
        }
      }

      await refreshUser();
    } catch (err) {
      toast({
        title: "Structure generation failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoad(false);
    }
  };

  const updateSpreadText = useCallback((i: number, text: string) => {
    setSpr((p) => p.map((s, idx) => (idx === i ? { ...s, text } : s)));
  }, []);

  const rerunSpread = useCallback(
    async (i: number, prompt: string) => {
      const pid = getPid();
      setRRI(i);

      try {
        const res = await aiApi.rerunSpread(pid, i, prompt, 0);
        const data = res.result as any;

        if (data?.text) {
          setSpr((p) =>
            p.map((s, idx) => (idx === i ? { ...s, text: data.text, prompt } : s)),
          );
          toast({ title: `Page ${i + 1} updated ✓` });
        }
      } catch (err) {
        toast({
          title: "Re-run failed",
          description: (err as Error).message,
          variant: "destructive",
        });
      } finally {
        setRRI(null);
      }
    },
    [toast],
  );

  const handleStructureApproved = async () => {
    if (!isChapBook) {
      await projectsApi.update(getPid(), { artifacts: { spreads } });
    }
    goTo(3);
  };

  // ── Step 3 ────────────────────────────────────────────────────────────────
  const handleGeneratePortrait = async (cid: string, style: string) => {
    const pid = getPid();

    if (credits < 4) {
      toast({
        title: "Insufficient credits — need 4 per portrait",
        variant: "destructive",
      });
      return;
    }

    setGP(true);
    try {
      const res = await aiApi.generateCharacterStyle(pid, cid, style);
      const url = res.masterReferenceUrl || res.imageUrl;

      if (url) {
        setPrt((p) => ({ ...p, [cid]: url }));
        toast({ title: "Portrait generated ✓" });
      }

      await refreshUser();
    } catch (err) {
      toast({
        title: "Portrait failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setGP(false);
    }
  };

  // ── Step 4 ────────────────────────────────────────────────────────────────
  const handleGenerateSlot = async (ci: number, si: number) => {
    const pid = getPid();
    const cost = varCount * 4;
    const key = illKey(false, ci, si);

    if (credits < cost) {
      toast({
        title: `Insufficient credits — need ${cost}`,
        variant: "destructive",
      });
      return;
    }

    setGK(key);
    try {
      const res = await aiApi.generateVariants(pid, ci, si, varCount);
      if (res.variants?.length) {
        setAV((p) => ({ ...p, [key]: res.variants! }));
        setSV((p) => ({ ...p, [key]: 0 }));
      }
      await refreshUser();
    } catch (err) {
      toast({
        title: `Failed: ${key}`,
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setGK(null);
    }
  };

  const handleGenerateAll = async () => {
    const pid = getPid();

    if (credits < totalVarCost) {
      toast({
        title: `Insufficient credits — need ${totalVarCost}`,
        variant: "destructive",
      });
      return;
    }

    setGA(true);
    setGPct(0);

    for (let i = 0; i < illSlots.length; i++) {
      const { ci, si } = illSlots[i];
      const key = illKey(false, ci, si);

      setGK(key);
      setGPct(Math.round((i / illSlots.length) * 100));

      try {
        const res = await aiApi.generateVariants(pid, ci, si, varCount);
        if (res.variants?.length) {
          setAV((p) => ({ ...p, [key]: res.variants! }));
          setSV((p) => ({ ...p, [key]: 0 }));
        }
      } catch {
        // non-fatal
      }
    }

    setGPct(100);
    setGK(null);
    setGA(false);

    await refreshUser();
    markDone(4);
    toast({ title: "All illustrations generated!" });
  };

  const handleSelectVariant = async (key: string, vi: number) => {
    const pid = getPid();
    setSV((p) => ({ ...p, [key]: vi }));

    let dbKey: string;
    if (isSpreadsOnly) {
      dbKey = `s${key}`;
    } else {
      dbKey = `ch0_s${key}`;
    }

    try {
      await pagesApi.selectVariant(pid, dbKey, vi);
    } catch {
      // non-fatal
    }
  };

  // ── Step 5 ────────────────────────────────────────────────────────────────
  const handleOpenEditor = async () => {
    const pid = getPid();
    setLoad(true);

    try {
      await projectsApi.generateLayout(pid);
      await projectsApi.advanceStep(pid, 5, true);
      markDone(5);
      navigate(`/app/projects/${pid}`);
    } catch {
      navigate(`/app/projects/${pid}`);
    } finally {
      setLoad(false);
    }
  };

  return (
    <AppLayout
      title="New Book"
      subtitle="5-step AI book creation"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/app/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      }
    >
      <div className="max-w-2xl mx-auto pb-16">
        <StepIndicator current={step} done={doneSt} />

        {/* ══ STEP 1 ══════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">Your Story Idea</h2>
                <p className="text-sm text-muted-foreground">
                  Describe your story — AI expands it into a complete Islamic
                  book.
                </p>
                <ApiBadge step={1} />
              </div>

              <div className="space-y-2">
                <Label>Story idea *</Label>
                <Textarea
                  placeholder={
                    ageRange && isChapBook
                      ? "A 10-year-old girl discovers an old family journal and learns about honesty, patience, and trust in Allah through hidden stories."
                      : "A little boy named Ali has a favourite blue toy car and learns to share it with his little brother."
                  }
                  value={storyIdea}
                  onChange={(e) => setSI(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isLoading || !!genStory}
                />
                <p className="text-xs text-muted-foreground">
                  {storyIdea.length}/500 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Age range *</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((ar) => (
                    <button
                      key={ar.value}
                      type="button"
                      onClick={() => setAR(ar.value)}
                      disabled={isLoading || !!genStory}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        ageRange === ar.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      {ar.label}
                      <span
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-md font-normal",
                          ar.color,
                        )}
                      >
                        {ar.badge}
                      </span>
                    </button>
                  ))}
                </div>
                {ageRange && <AgeModeBanner mode={mode} ageRange={ageRange} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Islamic theme</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ISLAMIC_THEMES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTh(t.id)}
                        disabled={isLoading || !!genStory}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs text-left transition-all",
                          theme === t.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <span>{t.icon}</span>
                        <span className="leading-tight">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={lang} onValueChange={setLg} disabled={!!genStory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Author name</Label>
                    <Input
                      placeholder="Your name"
                      value={authorName}
                      onChange={(e) => setAN(e.target.value)}
                      disabled={!!genStory}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Universe{" "}
                      <span className="text-muted-foreground font-normal text-xs">
                        (optional)
                      </span>
                    </Label>
                    <Select
                      value={univId}
                      onValueChange={(v) => setUI(v === "none" ? "" : v)}
                      disabled={!!genStory}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {universes.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {!genStory && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateStory}
                  disabled={isLoading || !storyIdea.trim() || !ageRange}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating… (4 credits)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Story (4 credits)
                    </>
                  )}
                </Button>
              )}
            </div>

            {genStory && (
              <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-primary">
                    Review Your Story
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setGS(null);
                      setET("");
                      setETx("");
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Book title</Label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setET(e.target.value)}
                    className="font-semibold"
                  />
                </div>

                {genStory.moral && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200">
                    <p className="text-xs font-semibold text-amber-700 mb-1">
                      Islamic Moral
                    </p>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      {genStory.moral}
                    </p>
                  </div>
                )}

                {genStory.synopsis && (
                  <div className="space-y-1">
                    <Label>Synopsis</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {genStory.synopsis}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>
                    Full story text{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (edit freely — AI uses this to build{" "}
                      {isChapBook ? "chapter outline and later chapters" : "pages"}
                      )
                    </span>
                  </Label>
                  <Textarea
                    value={editText}
                    onChange={(e) => setETx(e.target.value)}
                    rows={isChapBook ? 14 : 10}
                    className="resize-none text-sm leading-relaxed"
                  />
                </div>

                {isChapBook && (
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-xs text-blue-700 dark:text-blue-400">
                    📚 Step 2 will create <strong>{numChaps} chapter outlines</strong>.
                    Full prose chapter text is generated later in the editor.
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    Story ready — review above
                  </div>
                  <Button onClick={handleStoryApproved}>
                    Looks good
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 2 ══════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-bold">
                  {isChapBook ? "Chapter Outline" : "Page Setup"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isChapBook
                    ? `AI will create ${numChaps} chapter outlines. Full prose chapters are generated later in editor.`
                    : "AI will plan illustrated page spreads with editable text and scene hints."}
                </p>
                <ApiBadge step={2} />
                <AgeModeBanner mode={mode} ageRange={ageRange} />
              </div>

              <div className="space-y-3">
                <Label>
                  Characters{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (optional but recommended)
                  </span>
                </Label>

                {(allChars as Character[]).length === 0 ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                    <Users className="w-5 h-5 text-muted-foreground/50" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        No characters yet.
                      </p>
                      <Button
                        variant="link"
                        className="text-xs p-0 h-auto"
                        onClick={() => navigate("/app/characters/new")}
                      >
                        Create a character →
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {(allChars as Character[]).map((c) => {
                      const cid = c.id || c._id;
                      const sel = charIds.includes(cid);

                      return (
                        <button
                          key={cid}
                          type="button"
                          disabled={step2Has}
                          onClick={() =>
                            setCIs((p) =>
                              sel ? p.filter((id) => id !== cid) : [...p, cid],
                            )
                          }
                          className={cn(
                            "relative p-2.5 rounded-xl border-2 text-left transition-all",
                            sel
                              ? "border-primary bg-primary/8"
                              : "border-border hover:border-primary/40",
                          )}
                        >
                          {sel && (
                            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}

                          {c.imageUrl ? (
                            <img
                              src={c.imageUrl}
                              alt={c.name}
                              className="w-full aspect-square object-cover rounded-lg mb-1.5"
                            />
                          ) : (
                            <div className="w-full aspect-square rounded-lg bg-muted mb-1.5 flex items-center justify-center">
                              <Users className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}

                          <p className="font-semibold text-xs truncate">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.role}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {isChapBook ? "Number of chapters" : "Number of pages"}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(isChapBook ? CHAPTER_COUNTS : SPREAD_COUNTS).map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        disabled={step2Has}
                        onClick={() =>
                          isChapBook ? setCC(item.value) : setPC(item.value)
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-medium transition-all",
                          (isChapBook ? chapCount : pageCount) === item.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <span className="font-semibold">{item.label}</span>{" "}
                        <span className="text-muted-foreground font-normal">
                          — {item.note}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Trim size</Label>
                  {TRIM_SIZES.map((ts) => (
                    <label
                      key={ts.value}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-xs transition-all",
                        trimSize === ts.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="trim"
                        value={ts.value}
                        checked={trimSize === ts.value}
                        onChange={() => setTrim(ts.value)}
                        className="w-3 h-3"
                      />
                      <span className="font-medium">{ts.label}</span>
                      <span className="text-muted-foreground">{ts.note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Art style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ART_STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setAS(s.id)}
                      disabled={step2Has}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        artStyle === s.id
                          ? "border-primary bg-primary/8"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{s.preview}</span>
                        {artStyle === s.id && (
                          <Check className="w-3.5 h-3.5 text-primary ml-auto" />
                        )}
                      </div>
                      <p className="font-semibold text-xs leading-tight">
                        {s.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {s.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Background style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {BG_STYLES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBG(b.id)}
                      disabled={step2Has}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left text-xs transition-all",
                        bgStyle === b.id
                          ? "border-primary bg-primary/8"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      <p className="font-semibold">{b.label}</p>
                      <p className="text-muted-foreground mt-0.5 leading-tight">
                        {b.description}
                      </p>
                    </button>
                  ))}
                </div>

                {(bgStyle === "mixed" || bgStyle === "indoor") && (
                  <Input
                    value={indoorDesc}
                    onChange={(e) => setID(e.target.value)}
                    placeholder="Indoor description…"
                    className="text-xs"
                    disabled={step2Has}
                  />
                )}

                {(bgStyle === "mixed" || bgStyle === "outdoor") && (
                  <Input
                    value={outdoorDesc}
                    onChange={(e) => setOD(e.target.value)}
                    placeholder="Outdoor description…"
                    className="text-xs"
                    disabled={step2Has}
                  />
                )}
              </div>

              {!isChapBook && (
                <div className="space-y-2">
                  <Label>
                    Recurring props{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    placeholder="e.g. blue toy car, always same shape"
                    value={bookProps}
                    onChange={(e) => setBP(e.target.value)}
                    disabled={step2Has}
                  />
                </div>
              )}

              {!step2Has && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateStructure}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating… (6 credits)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate {structureLabel} (6 credits)
                    </>
                  )}
                </Button>
              )}
            </div>

            {step2Has && (
              <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-primary">
                      {isChapBook ? "Chapter Outline Ready" : "Pages Ready"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isChapBook
                        ? `${chapters.length} prose chapters outlined`
                        : `${spreads.length} pages — edit text or re-run any page`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSpr([]);
                      setChaps([]);
                    }}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Re-plan
                  </Button>
                </div>

                {isChapBook ? (
                  <div className="space-y-2">
                    {chapters.map((ch, i) => (
                      <ChapterOutlineCard key={i} chapter={ch} index={i} />
                    ))}
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 text-xs text-blue-700 dark:text-blue-400 space-y-0.5">
                      <p className="font-semibold">✅ Correct chapter-book flow:</p>
                      <p>Step 3 → Generate character portraits</p>
                      <p>Step 4 → Skip direct image generation here</p>
                      <p>Step 5 → Open editor → run Chapters → Humanize → Illustrations</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[600px] pr-2">
                    <div className="space-y-3">
                      {spreads.map((s, i) => (
                        <EditableSpread
                          key={i}
                          spread={
                            s as SpreadItem & {
                              prompt?: string;
                              illustrationHint?: string;
                              sceneEnvironment?: string;
                            }
                          }
                          index={i}
                          total={spreads.length}
                          onUpdate={updateSpreadText}
                          onRerun={rerunSpread}
                          isRerunning={rerunIdx === i}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                )}

                <div className="flex justify-between pt-2 border-t border-border">
                  <Button variant="ghost" onClick={() => goTo(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleStructureApproved}>
                    {isChapBook ? "Approve outline" : "Approve pages"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ STEP 3 ══════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Character Portraits</h2>
              <p className="text-sm text-muted-foreground">
                Generate a styled portrait per character. This becomes the
                master visual reference for later illustration stages.
              </p>
              <ApiBadge step={3} />
            </div>

            <div className="space-y-3">
              <Label>Confirm art style</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ART_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setAS(s.id)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      artStyle === s.id
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{s.preview}</span>
                      {artStyle === s.id && (
                        <Check className="w-3.5 h-3.5 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="font-semibold text-xs">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {selChars.length === 0 ? (
              <div className="p-6 rounded-xl bg-muted/30 border border-dashed border-border text-center space-y-2">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  No characters selected — AI will use generic character
                  descriptions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selChars.map((c) => (
                  <CharStyleCard
                    key={c.id || c._id}
                    character={c}
                    artStyle={artStyle}
                    generatedUrl={portraits[c.id || c._id]}
                    isGenerating={genPrt}
                    onGenerate={handleGeneratePortrait}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => goTo(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={() => {
                  markDone(3);
                  goTo(4);
                }}
                disabled={selChars.length > 0 && !allPrtDone && genPrt}
              >
                {selChars.length > 0 && !allPrtDone ? (
                  "Generate all portraits first"
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm style
                  </>
                )}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 4 ══════════════════════════════════════════════════════ */}
        {step === 4 &&
          (isChapBook ? (
            <div className="space-y-6">
              <DeferredImageBlock chapterCount={chapters.length || numChaps} />
              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => goTo(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    markDone(4);
                    goTo(5);
                  }}
                >
                  Continue to Editor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">
                    Generate & Select Illustrations
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {spreads.length} pages total. Generate {varCount} variants
                    each, then select the best one.
                  </p>
                  <ApiBadge step={4} />
                </div>

                <div className="space-y-3">
                  <Label>Variants per page</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {VARIANT_OPTIONS.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        onClick={() => setVC(v.value)}
                        disabled={genAll}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
                          varCount === v.value
                            ? "border-primary bg-primary/8"
                            : "border-border hover:border-primary/40",
                        )}
                      >
                        <p className="font-bold text-lg">{v.value}</p>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {v.note}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        Total: {totalVarCost} credits
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                        {illSlots.length} pages × {varCount} variants × 4 credits
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        credits >= totalVarCost
                          ? "text-green-700 border-green-300"
                          : "text-red-600 border-red-300",
                      )}
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      {credits} available
                    </Badge>
                  </div>

                  {genAll && (
                    <div className="space-y-1">
                      <Progress value={genPct} className="h-1.5" />
                      <p className="text-xs text-amber-700">
                        {genPct}% — generating {illSlots.length} pages
                      </p>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleGenerateAll}
                    disabled={genAll || credits < totalVarCost}
                  >
                    {genAll ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating all {illSlots.length} pages…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate all {illSlots.length} pages ({totalVarCost} cr)
                      </>
                    )}
                  </Button>

                  {!genAll && (
                    <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
                      Or generate page-by-page below ↓
                    </p>
                  )}
                </div>
              </div>

              {illSlots.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">
                      All illustrations{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({confirmedCount}/{illSlots.length} confirmed)
                      </span>
                    </h3>
                    {allImgDone && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        All {illSlots.length} ready!
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3">
                    {illSlots.map(({ ci, si, label }) => {
                      const key = illKey(false, ci, si);

                      return (
                        <div key={key}>
                          {allVars[key] ? (
                            <VariantPicker
                              label={label}
                              pageKey={key}
                              variants={allVars[key]}
                              selectedIdx={selVars[key] ?? -1}
                              onSelect={handleSelectVariant}
                              loading={genKey === key}
                            />
                          ) : (
                            <div className="rounded-xl border border-border bg-background overflow-hidden">
                              <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30">
                                <span className="text-xs font-mono font-bold text-muted-foreground">
                                  {label}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7"
                                  onClick={() => handleGenerateSlot(ci, si)}
                                  disabled={genKey !== null || genAll}
                                >
                                  {genKey === key ? (
                                    <>
                                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                      Generating…
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      Generate ({varCount * 4} cr)
                                    </>
                                  )}
                                </Button>
                              </div>
                              <div className="p-3 grid grid-cols-2 gap-2">
                                {Array.from({
                                  length: Math.min(varCount, 4),
                                }).map((_, j) => (
                                  <div
                                    key={j}
                                    className="aspect-square rounded-lg bg-muted flex items-center justify-center border border-border"
                                  >
                                    <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => goTo(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    markDone(4);
                    goTo(5);
                  }}
                  disabled={confirmedCount === 0}
                >
                  {allImgDone ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Proceed to Editor
                    </>
                  ) : (
                    <>Continue with {confirmedCount}/{illSlots.length} confirmed</>
                  )}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}

        {/* ══ STEP 5 ══════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="rounded-2xl border border-border bg-card p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="text-xl font-bold">Your Book is Ready!</h2>
              <p className="text-sm text-muted-foreground">
                Open the editor to review, run remaining AI stages, and export
                your print-ready PDF.
              </p>
              <ApiBadge step={5} />
            </div>

            <AgeModeBanner mode={mode} ageRange={ageRange} />

            <div className="rounded-xl bg-muted/40 border border-border overflow-hidden">
              {[
                ["Title", editTitle],
                ["Age range", `${ageRange} (${mode.replace(/-/g, " ")})`],
                ["Art style", ART_STYLES.find((s) => s.id === artStyle)?.name || artStyle],
                ["Characters", selChars.length ? selChars.map((c) => c.name).join(", ") : "None"],
                isChapBook
                  ? ["Chapters", `${chapters.length} outlined chapters`]
                  : ["Pages", `${spreads.length} illustrated pages`],
                [
                  "Images",
                  isChapBook
                    ? "Deferred to editor after chapter generation"
                    : `${confirmedCount}/${illSlots.length} pages confirmed`,
                ],
              ].map(([k, v], i) => (
                <div
                  key={i}
                  className="flex justify-between items-center px-4 py-3 border-b border-border last:border-0 text-sm"
                >
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium">{v}</span>
                </div>
              ))}
            </div>

            {isChapBook ? (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-2">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  📚 In the editor — run these stages for age 9+
                </p>
                {[
                  ["Chapters", `Generate ${chapters.length} full prose chapters (chapterText)`],
                  ["Humanize", "Polish prose for flow, tone, and Islamic voice"],
                  ["Illustrations", "Generate images from chapter illustration moments"],
                  ["Cover", "Generate front and back cover"],
                  ["Layout", "Assemble final print-ready layout"],
                ].map(([label, desc], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-xs">
                      <span className="font-semibold text-blue-800 dark:text-blue-300">
                        {label}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {" "}
                        — {desc}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-2">
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                  📚 In the editor — run these stages
                </p>
                {[
                  ["Pages", `Generate ${spreads.length} pages of story text`],
                  ["Humanize", "Polish page text if needed"],
                  ["Illustrations", "Render all selected illustration variants"],
                  ["Cover", "Generate front and back cover"],
                  ["Layout", "Assemble final print-ready layout"],
                ].map(([label, desc], i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-400 shrink-0">
                      {i + 1}.
                    </span>
                    <p className="text-xs">
                      <span className="font-semibold text-blue-800 dark:text-blue-300">
                        {label}
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {" "}
                        — {desc}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Story generated",
                  detail: `"${editTitle}"`,
                  done: !!genStory,
                },
                {
                  label: isChapBook ? "Outline planned" : "Pages planned",
                  detail: isChapBook
                    ? `${chapters.length} chapters outlined`
                    : `${spreads.length} pages with text`,
                  done: step2Has,
                },
                {
                  label: "Character portraits",
                  detail: allPrtDone
                    ? `${selChars.length} portraits ready`
                    : "Skipped — add later",
                  done: allPrtDone,
                },
                {
                  label: "Images",
                  detail: isChapBook
                    ? "Deferred until editor chapter generation"
                    : `${confirmedCount}/${illSlots.length} pages confirmed`,
                  done: isChapBook ? true : allImgDone,
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 p-3 rounded-lg border",
                    item.done
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200"
                      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200",
                  )}
                >
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={cn(
                        "font-semibold text-xs",
                        item.done
                          ? "text-green-800 dark:text-green-300"
                          : "text-amber-800 dark:text-amber-300",
                      )}
                    >
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        "text-xs mt-0.5",
                        item.done
                          ? "text-green-700 dark:text-green-400"
                          : "text-amber-700 dark:text-amber-400",
                      )}
                    >
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => goTo(4)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button size="lg" onClick={handleOpenEditor} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening editor…
                  </>
                ) : (
                  <>
                    <Layout className="w-4 h-4 mr-2" />
                    Open Book Editor
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 