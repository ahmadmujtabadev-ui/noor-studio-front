/**
 * LayoutStep.tsx
 * Book-builder step where users pick their preferred page layout.
 * Shows picture-book layouts (ages ≤8) or chapter-book layouts (ages >8)
 * depending on the selected age range.
 */

import React from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useLayoutPreferenceStore,
  type PictureBookLayout,
  type ChapterBookLayout,
} from "@/lib/store/layoutPreferenceStore";
import type { BookBuilderState } from "@/hooks/useBookBuilder";

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const TEAL = "#1B6B5A";
const GOLD = "#F5A623";

// ─────────────────────────────────────────────────────────────────────────────
// Mini SVG layout previews (pure CSS/SVG — no images needed)
// ─────────────────────────────────────────────────────────────────────────────

function PreviewFullBleed() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {/* Image background */}
      <rect width="120" height="80" rx="4" fill="#7BA8A0" />
      <rect width="120" height="80" rx="4" fill="url(#grad1)" />
      <defs>
        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B6B5A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* White card at bottom */}
      <rect x="8" y="50" width="104" height="24" rx="6" fill="white" fillOpacity="0.93" />
      {/* Text lines */}
      <rect x="18" y="57" width="84" height="4" rx="2" fill="#1a1a1a" fillOpacity="0.5" />
      <rect x="28" y="65" width="64" height="3" rx="2" fill="#1a1a1a" fillOpacity="0.3" />
    </svg>
  );
}

function PreviewImageLeftTextRight() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {/* Left half — image */}
      <rect x="0" y="0" width="58" height="80" rx="4" fill="#7BA8A0" />
      <rect x="0" y="0" width="58" height="80" fill={TEAL} fillOpacity="0.5" />
      {/* Right half — cream */}
      <rect x="62" y="0" width="58" height="80" rx="4" fill="#FAFAF8" />
      {/* Drop cap */}
      <text x="68" y="28" fontFamily="Georgia" fontSize="22" fill={TEAL} fontWeight="bold">A</text>
      {/* Text lines */}
      <rect x="82" y="18" width="30" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.35" />
      <rect x="68" y="28" width="44" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="36" width="44" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="44" width="36" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="52" width="44" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="60" width="30" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
    </svg>
  );
}

function PreviewImageTopTextBottom() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {/* Top image */}
      <rect width="120" height="50" rx="4" fill={TEAL} fillOpacity="0.6" />
      <rect width="120" height="50" fill="url(#grad2)" />
      <defs>
        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B6B5A" stopOpacity="0.3" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {/* Bottom band */}
      <rect x="0" y="50" width="120" height="30" rx="0" fill="#FFF9EE" />
      <rect x="0" y="50" width="120" height="1" fill={GOLD} fillOpacity="0.5" />
      {/* Text lines */}
      <rect x="20" y="58" width="80" height="3.5" rx="1.5" fill="#1a1a1a" fillOpacity="0.4" />
      <rect x="30" y="66" width="60" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.28" />
    </svg>
  );
}

function PreviewVignette() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      {/* Cream background */}
      <rect width="120" height="80" rx="4" fill="#FAFAF8" />
      {/* Dashed border */}
      <rect x="4" y="4" width="112" height="72" rx="3" fill="none" stroke={TEAL} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.3" />
      {/* Corner stars */}
      <circle cx="8" cy="8" r="3" fill={TEAL} fillOpacity="0.15" />
      <circle cx="112" cy="8" r="3" fill={GOLD} fillOpacity="0.15" />
      <circle cx="8" cy="72" r="3" fill={GOLD} fillOpacity="0.15" />
      <circle cx="112" cy="72" r="3" fill={TEAL} fillOpacity="0.15" />
      {/* Circular image */}
      <circle cx="36" cy="40" r="22" fill={TEAL} fillOpacity="0.25" stroke={GOLD} strokeWidth="1.5" strokeOpacity="0.5" />
      <circle cx="36" cy="40" r="18" fill={TEAL} fillOpacity="0.3" />
      {/* Text lines */}
      <rect x="68" y="22" width="42" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.35" />
      <rect x="68" y="31" width="42" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="40" width="35" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
      <rect x="68" y="49" width="42" height="3" rx="1.5" fill="#1a1a1a" fillOpacity="0.25" />
    </svg>
  );
}

function PreviewTwoColumn() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect width="120" height="80" rx="4" fill="#FAFAF8" />
      {/* Running header */}
      <rect x="8" y="8" width="104" height="1" fill={TEAL} fillOpacity="0.2" />
      <rect x="8" y="6" width="30" height="2" rx="1" fill={TEAL} fillOpacity="0.3" />
      <rect x="82" y="6" width="30" height="2" rx="1" fill={TEAL} fillOpacity="0.3" />
      {/* Left column text */}
      {[16, 22, 28, 34, 40, 46, 52, 58, 64].map((y) => (
        <rect key={y} x="8" y={y} width="48" height="2.5" rx="1" fill="#1a1a1a" fillOpacity={y === 16 ? 0.5 : 0.22} />
      ))}
      {/* Gutter */}
      <rect x="59" y="14" width="1" fill={TEAL} fillOpacity="0.12" height="52" />
      {/* Right column text */}
      {[16, 22, 28, 34, 40, 46, 52, 58, 64].map((y) => (
        <rect key={y} x="63" y={y} width="48" height="2.5" rx="1" fill="#1a1a1a" fillOpacity={0.22} />
      ))}
      {/* Page number footer */}
      <rect x="8" y="72" width="16" height="2" rx="1" fill={TEAL} fillOpacity="0.3" />
      <rect x="96" y="72" width="16" height="2" rx="1" fill={TEAL} fillOpacity="0.3" />
    </svg>
  );
}

function PreviewTextInlineImage() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect width="120" height="80" rx="4" fill="#FAFAF8" />
      {/* Running header */}
      <rect x="8" y="6" width="104" height="1.5" fill={TEAL} fillOpacity="0.2" />
      {/* Drop cap */}
      <text x="8" y="28" fontFamily="Georgia" fontSize="16" fill={TEAL} fontWeight="bold">A</text>
      {/* Floated image (right 38%) */}
      <rect x="76" y="14" width="36" height="36" rx="4" fill={TEAL} fillOpacity="0.25" />
      <rect x="76" y="51" width="36" height="2" rx="1" fill={TEAL} fillOpacity="0.2" />
      {/* Body text lines */}
      {[16, 22, 28, 34, 40, 46].map((y, i) => (
        <rect key={y} x="8" y={y} width={i < 4 ? 60 : 104} height="2.5" rx="1" fill="#1a1a1a" fillOpacity={0.22} />
      ))}
      {[54, 60, 66, 72].map((y) => (
        <rect key={y} x="8" y={y} width="104" height="2.5" rx="1" fill="#1a1a1a" fillOpacity={0.22} />
      ))}
    </svg>
  );
}

function PreviewDecorativeFullText() {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full">
      <rect width="120" height="80" rx="4" fill="#FAFAF8" />
      {/* Dashed border */}
      <rect x="4" y="4" width="112" height="72" rx="4" fill="none" stroke={TEAL} strokeWidth="0.8" strokeDasharray="4 3" strokeOpacity="0.35" />
      {/* Corner ornaments */}
      <circle cx="8" cy="8" r="3" fill={TEAL} fillOpacity="0.18" />
      <circle cx="112" cy="8" r="3" fill={GOLD} fillOpacity="0.18" />
      <circle cx="8" cy="72" r="3" fill={GOLD} fillOpacity="0.18" />
      <circle cx="112" cy="72" r="3" fill={TEAL} fillOpacity="0.18" />
      {/* Gold card with Arabic text */}
      <rect x="14" y="16" width="92" height="48" rx="4" fill={GOLD} fillOpacity="0.08" />
      <rect x="14" y="16" width="4" height="48" rx="2" fill={GOLD} fillOpacity="0.7" />
      {/* Arabic text (RTL, bigger) */}
      <rect x="30" y="22" width="68" height="4" rx="2" fill="#1a1a1a" fillOpacity="0.4" />
      <rect x="40" y="30" width="52" height="4" rx="2" fill="#1a1a1a" fillOpacity="0.35" />
      {/* Divider */}
      <rect x="30" y="40" width="60" height="1" fill={GOLD} fillOpacity="0.5" />
      {/* English text */}
      <rect x="20" y="46" width="80" height="3" rx="1.5" fill="#333" fillOpacity="0.3" />
      <rect x="30" y="53" width="60" height="3" rx="1.5" fill="#333" fillOpacity="0.22" />
    </svg>
  );
}

// ─── Layout option config ─────────────────────────────────────────────────────

interface LayoutOption<T extends string> {
  id:          T;
  label:       string;
  description: string;
  preview:     React.ReactNode;
  bestFor:     string;
}

const PICTURE_LAYOUTS: LayoutOption<PictureBookLayout>[] = [
  {
    id:          "full_bleed",
    label:       "Full Bleed",
    description: "Image fills the whole page, text card overlaid at bottom.",
    preview:     <PreviewFullBleed />,
    bestFor:     "Action scenes & landscapes",
  },
  {
    id:          "image_left_text_right",
    label:       "Image + Text",
    description: "Left half is full image, right half is white with large drop-cap text.",
    preview:     <PreviewImageLeftTextRight />,
    bestFor:     "Character moments & dialogue",
  },
  {
    id:          "image_top_text_bottom",
    label:       "Stack",
    description: "Image fills top 62%, warm accent band at bottom with centered text.",
    preview:     <PreviewImageTopTextBottom />,
    bestFor:     "Rhymes & short verses",
  },
  {
    id:          "vignette",
    label:       "Vignette",
    description: "Circular image on cream page with Islamic corner ornaments and text beside.",
    preview:     <PreviewVignette />,
    bestFor:     "Calm, decorative pages",
  },
];

const CHAPTER_LAYOUTS: LayoutOption<ChapterBookLayout>[] = [
  {
    id:          "two_column",
    label:       "Two Column",
    description: "Classic two-column prose with running headers and outer page numbers.",
    preview:     <PreviewTwoColumn />,
    bestFor:     "Long prose chapters",
  },
  {
    id:          "text_inline_image",
    label:       "Inline Image",
    description: "Single-column body with chapter illustration floated right at 38%.",
    preview:     <PreviewTextInlineImage />,
    bestFor:     "Story chapters with artwork",
  },
  {
    id:          "decorative_full_text",
    label:       "Hadith / Ayah",
    description: "Ornamental border with Arabic pull-quote and English translation. Gold accent.",
    preview:     <PreviewDecorativeFullText />,
    bestFor:     "Quranic verses & hadith",
  },
];

// ─── Single option card ───────────────────────────────────────────────────────

function LayoutCard<T extends string>({
  option,
  selected,
  onSelect,
}: {
  option:   LayoutOption<T>;
  selected: boolean;
  onSelect: (id: T) => void;
}) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className={cn(
        "group relative flex flex-col rounded-2xl border-2 overflow-hidden text-left transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5",
        selected
          ? "border-[#F5A623] shadow-[0_0_0_1px_#F5A62330,0_8px_24px_rgba(245,166,35,0.15)]"
          : "border-border hover:border-[#1B6B5A]/40",
      )}
    >
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center shadow">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Preview */}
      <div
        className={cn(
          "w-full overflow-hidden border-b",
          selected ? "border-[#F5A623]/30" : "border-border/50",
        )}
        style={{ aspectRatio: "3 / 2", background: "#F8F7F4" }}
      >
        <div className="w-full h-full p-3">
          {option.preview}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1">
        <p
          className={cn("font-semibold text-sm mb-1", selected ? "text-[#F5A623]" : "text-foreground")}
        >
          {option.label}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2">
          {option.description}
        </p>
        <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {option.bestFor}
        </span>
      </div>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface LayoutStepProps {
  bb:         BookBuilderState & { isChapterBook: boolean };
  onBack:     () => void;
  onContinue: () => void;
}

export function LayoutStep({ bb, onBack, onContinue }: LayoutStepProps) {
  const { pictureLayout, chapterLayout, setPictureLayout, setChapterLayout } =
    useLayoutPreferenceStore();

  const isPicture = !bb.isChapterBook;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Your Layout</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
          {isPicture
            ? "Pick how each story page looks. Images and text will follow this layout throughout your book."
            : "Pick your chapter text layout. This controls how prose, illustrations, and special content appear."}
        </p>
      </div>

      {/* Layout grid */}
      {isPicture ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PICTURE_LAYOUTS.map((opt) => (
            <LayoutCard
              key={opt.id}
              option={opt}
              selected={pictureLayout === opt.id}
              onSelect={setPictureLayout}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CHAPTER_LAYOUTS.map((opt) => (
            <LayoutCard
              key={opt.id}
              option={opt}
              selected={chapterLayout === opt.id}
              onSelect={setChapterLayout}
            />
          ))}
        </div>
      )}

      {/* Selected summary */}
      <div
        className="flex items-center gap-3 rounded-xl px-5 py-4 border"
        style={{ borderColor: `${TEAL}25`, background: `${TEAL}08` }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${TEAL}20` }}>
          <Check className="w-4 h-4" style={{ color: TEAL }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {isPicture
              ? PICTURE_LAYOUTS.find((o) => o.id === pictureLayout)?.label
              : CHAPTER_LAYOUTS.find((o) => o.id === chapterLayout)?.label}{" "}
            selected
          </p>
          <p className="text-xs text-muted-foreground">
            {isPicture
              ? PICTURE_LAYOUTS.find((o) => o.id === pictureLayout)?.description
              : CHAPTER_LAYOUTS.find((o) => o.id === chapterLayout)?.description}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onContinue} className="gap-2 bg-[#1B6B5A] hover:bg-[#1B6B5A]/90 text-white">
          Continue to Illustrations
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
