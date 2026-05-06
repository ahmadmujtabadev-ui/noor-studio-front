import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
// ChevronDown/ChevronUp retained for AdvancedBlock toggle
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SPEAKING_STYLE_OPTIONS,
  FAITH_TONE_OPTIONS,
  DUA_STYLE_OPTIONS,
  ISLAMIC_TRAIT_PRESETS,
} from "@/components/shared/KBFieldIcons";

export interface CharacterGuideData {
  characterName: string;
  speakingStyle: string;
  literaryRole: string;
  moreInfo: string;
  personalityNotes: string[];
  dialogueExamples: string[];
  faithTone: string;
  faithExpressions: string[];
  duaStyle?: string;
  islamicTraits: string[];
  faithExamples: string[];
}

interface Props {
  characters: { id?: string; _id?: string; name: string }[];
  guides: CharacterGuideData[];
  onSave: (guide: CharacterGuideData) => void;
  onDelete: (name: string) => void;
  isSaving: boolean;
  mode?: "islamic" | "universal";
}

const VOICE_EXAMPLES: Record<string, string> = {
  "Fast, buzzing, excitable — short fragmented lines": `"Oh! Did you SEE that?!"`,
  "Gentle, calm and measured — soft flowing speech": `"It's okay. We can try again."`,
  "Wise, deliberate and thoughtful — long considered lines": `"Think about it first."`,
  "Playful, silly and light-hearted — jokes and wordplay": `"Race you there! Hehe!"`,
  "Formal, dignified and poetic — elevated language": `"Indeed, patience is a gift."`,
  "Reflective, introspective and quiet — thoughtful pauses": `"...I wonder why that is."`,
};

const FAITH_EXAMPLES: Record<string, string> = {
  "Joyful & imitative — mirrors Islamic joy, frequent Alhamdulillah moments": `"Alhamdulillah! This is SO good!"`,
  "Reflective & questioning — wrestles with faith sincerely": `"But why do we do it this way?"`,
  "Warm & sincere — authentic heartfelt expressions of faith": `"I really felt Allah with me today."`,
  "Gentle & encouraging — softly guides others toward good": `"Maybe say Bismillah first?"`,
  "Bold & brave — expresses faith with confidence and courage": `"I'm not ashamed. Alhamdulillah!"`,
  "Playful & lighthearted — weaves Islam into jokes and fun": `"Race you to prayer! Hehe, Bismillah!"`,
  "Earnest & serious — takes deen very seriously, rarely jokes": `"We should not joke about salah."`,
  "Curious & exploratory — asks why, reads, full of questions": `"Why do we face the Qibla exactly?"`,
  "Quiet & private — faith is deep but inward and personal": `(closes eyes, whispers quietly)`,
  "Traditional & formal — uses classical Arabic, respects old ways": `"Assalamu alaykum wa rahmatullah."`,
  "Poetic & lyrical — speaks in metaphors, connects nature to Allah": `"Every leaf falls by His will."`,
  "Empathetic & caring — faith expressed through caring for others": `"Let me help. That's what we do."`,
};

const UNIVERSAL_STYLE_EXAMPLES: Record<string, string> = {
  "Joyful & imitative â€” mirrors Islamic joy, frequent Alhamdulillah moments": `"This is amazing! Can we try again?"`,
  "Reflective & questioning â€” wrestles with faith sincerely": `"But why does it work that way?"`,
  "Warm & sincere â€” authentic heartfelt expressions of faith": `"I felt really proud of us today."`,
  "Gentle & encouraging â€” softly guides others toward good": `"Maybe we can start with one small step."`,
  "Bold & brave â€” expresses faith with confidence and courage": `"I'm scared, but I'm still going to help."`,
  "Playful & lighthearted â€” weaves Islam into jokes and fun": `"Race you there! Last one carries the picnic basket!"`,
  "Earnest & serious â€” takes deen very seriously, rarely jokes": `"This matters, so let's do it carefully."`,
  "Curious & exploratory â€” asks why, reads, full of questions": `"What if there is another clue under the bridge?"`,
  "Quiet & private â€” faith is deep but inward and personal": `(takes a breath, then nods)`,
  "Traditional & formal â€” uses classical Arabic, respects old ways": `"Good morning. I am pleased to meet you."`,
  "Poetic & lyrical â€” speaks in metaphors, connects nature to Allah": `"Every leaf is a tiny green sail."`,
  "Empathetic & caring â€” faith expressed through caring for others": `"Let me help. That's what friends do."`,
};

const SPEAKING_STYLE_IMAGES: Record<string, string> = {
  "Fast & Buzzing": "/how they talk/fast and buzzing.png",
  "Gentle & Calm": "/how they talk/gentle and calm.png",
  "Wise & Measured": "/how they talk/wise and measured.png",
  "Playful & Silly": "/how they talk/playful and silly.png",
  "Formal & Dignified": "/how they talk/formal and diginified.png",
  Reflective: "/faith style/reflective.png",
};

const FAITH_STYLE_IMAGES: Record<string, string> = {
  Joyful: "/faith style/joyful.png",
  Reflective: "/faith style/reflective.png",
  Warm: "/faith style/warm.png",
  Gentle: "/faith style/gentle.png",
  Bold: "/faith style/bold.png",
  Playful: "/faith style/playful.png",
  Earnest: "/faith style/earnest.png",
  Curious: "/faith style/curious.png",
  Quiet: "/faith style/quiet.png",
  Traditional: "/faith style/traditional.png",
  Poetic: "/faith style/poetic.png",
  Empathetic: "/faith style/empathetic.png",
};

const TRAIT_EMOJI: Record<string, string> = {
  Patient: "🌿",
  Grateful: "💛",
  Honest: "✨",
  Brave: "🦁",
  Generous: "🎁",
  Humble: "🌸",
  Trustworthy: "🤝",
  Forgiving: "💚",
  Protective: "🛡️",
};

const EMPTY_GUIDE: CharacterGuideData = {
  characterName: "",
  speakingStyle: "",
  literaryRole: "",
  moreInfo: "",
  personalityNotes: [],
  dialogueExamples: [],
  faithTone: "",
  faithExpressions: [],
  islamicTraits: [],
  faithExamples: [],
};

const QUICK_QUOTES = [
  `"Alhamdulillah!"`,
  `"Bismillah, let's try."`,
  `"It's okay, we can do it."`,
  `"Ya Allah, help me."`,
  `"Can we do this together?"`,
  `"I want to do what's right."`,
];

const UNIVERSAL_QUICK_QUOTES = [
  `"We can figure this out together."`,
  `"I want to do what's right."`,
  `"That was kind of you."`,
  `"I'm scared, but I'll try."`,
  `"What if we look one more time?"`,
  `"No one gets left behind."`,
];

function VoiceCard({
  icon,
  image,
  label,
  example,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  image?: string;
  label: string;
  example: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border bg-white p-2.5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-sm",
        selected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border hover:border-primary/30"
      )}
    >
      <div className="h-20 w-full overflow-hidden rounded-lg bg-muted">
        {image ? (
          <img src={image} alt={label} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="mx-auto h-12 w-12 pt-3">{icon}</div>
        )}
      </div>
      <span
        className={cn(
          "text-xs font-bold leading-tight",
          selected ? "text-primary" : "text-foreground"
        )}
      >
        {label}
      </span>
      <span className="w-full line-clamp-2 text-[9px] italic leading-tight text-muted-foreground">
        {example}
      </span>
      {selected && (
        <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-white" />
        </span>
      )}
    </button>
  );
}

function ExpandableCardGrid({
  options,
  selected,
  onSelect,
  getExample,
  getImage,
}: {
  options: { value: string; label: string; icon: React.ReactNode }[];
  selected: string;
  onSelect: (v: string) => void;
  getExample: (v: string) => string;
  getImage?: (label: string) => string | undefined;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {options.map((opt) => (
        <VoiceCard
          key={opt.value}
          icon={opt.icon}
          image={getImage?.(opt.label)}
          label={opt.label}
          example={getExample(opt.value)}
          selected={selected === opt.value}
          onClick={() => onSelect(selected === opt.value ? "" : opt.value)}
        />
      ))}
    </div>
  );
}

function PillChipGrid({
  items,
  selected,
  onToggle,
}: {
  items: { value: string; label: string }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const isSel = selected.includes(item.value);

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onToggle(item.value)}
            className={cn(
              "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all",
              isSel
                ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                : "border-border bg-background text-muted-foreground hover:border-emerald-300 hover:text-foreground"
            )}
          >
            {isSel && <Check className="h-2.5 w-2.5 shrink-0" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function QuoteSelector({
  quotes = QUICK_QUOTES,
  placeholder = 'Write a line in their voice, e.g. "Bismillah, let us go."',
  selected,
  onToggle,
  onAdd,
  onRemove,
}: {
  quotes?: string[];
  placeholder?: string;
  selected: string[];
  onToggle: (q: string) => void;
  onAdd: (q: string) => void;
  onRemove: (q: string) => void;
}) {
  const [custom, setCustom] = useState("");
  const customItems = selected.filter((q) => !quotes.includes(q));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {quotes.map((q) => {
          const isSel = selected.includes(q);

          return (
            <button
              key={q}
              type="button"
              onClick={() => onToggle(q)}
              className={cn(
                "flex max-w-xs items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-left text-[11px] font-medium transition-all",
                isSel
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-border bg-background text-muted-foreground hover:border-emerald-300 hover:text-foreground"
              )}
            >
              {isSel ? (
                <Check className="h-3 w-3 shrink-0" />
              ) : (
                <Plus className="h-3 w-3 shrink-0" />
              )}
              <span className="truncate italic">{q}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder='Write a line in their voice, e.g. "Bismillah, let’s go."'
          {...{ placeholder }}
          className="h-8 flex-1 text-xs italic"
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom.trim()) {
              onAdd(custom.trim());
              setCustom("");
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 px-2"
          onClick={() => {
            if (custom.trim()) {
              onAdd(custom.trim());
              setCustom("");
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {customItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {customItems.map((q, i) => (
            <span
              key={i}
              className="flex max-w-xs items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium italic text-blue-800"
            >
              <span className="truncate">{q}</span>
              <button
                onClick={() => onRemove(q)}
                className="ml-0.5 shrink-0 hover:text-red-600"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleTagInput({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="h-8 flex-1 text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            if (val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground"
            >
              {item}
              <button
                onClick={() => onRemove(i)}
                className="ml-0.5 hover:text-destructive"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AdvancedBlock({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-dashed border-gray-300">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <span className="font-semibold">Optional details</span>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && <div className="space-y-4 px-3 pb-3">{children}</div>}
    </div>
  );
}

function LivePreview({
  guide,
  onSave,
  isSaving,
  onDelete,
  hasExisting,
}: {
  guide: CharacterGuideData;
  onSave: () => void;
  isSaving: boolean;
  onDelete: () => void;
  hasExisting: boolean;
}) {
  const name = guide.characterName || "Character";
  const voiceName =
    SPEAKING_STYLE_OPTIONS.find((o) => o.value === guide.speakingStyle)?.label ||
    "";
  const faithName =
    FAITH_TONE_OPTIONS.find((o) => o.value === guide.faithTone)?.label || "";
  const duaName = "";
  const topTraits = guide.islamicTraits.slice(0, 4);
  const exampleQuote = guide.faithExamples[0] || guide.dialogueExamples[0];

  const fields = [
    guide.speakingStyle,
    guide.faithTone,
    guide.islamicTraits.length > 0,
    guide.faithExamples.length > 0,
  ];
  const done = fields.filter(Boolean).length;
  const pct = Math.round((done / fields.length) * 100);

  return (
    <div className="sticky top-4 min-w-[220px] space-y-3 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-lg shrink-0">
          🧒
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-emerald-900">
            {name}
          </p>
          <p className="text-[10px] text-emerald-600">Voice Preview</p>
        </div>
      </div>

      <div className="space-y-1.5 text-[11px]">
        {voiceName && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 text-center">🗣️</span>
            <span className="text-gray-700">{voiceName}</span>
          </div>
        )}
        {faithName && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 text-center">🌿</span>
            <span className="text-gray-700">{faithName}</span>
          </div>
        )}
        {duaName && (
          <div className="flex items-center gap-1.5">
            <span className="w-4 text-center">🤲</span>
            <span className="text-gray-700">{duaName}</span>
          </div>
        )}

        {topTraits.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {topTraits.map((t) => (
              <span
                key={t}
                className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700"
              >
                {TRAIT_EMOJI[t] || "✦"} {t}
              </span>
            ))}
          </div>
        )}

        {exampleQuote && (
          <div className="mt-1 rounded-lg border border-emerald-100 bg-white p-2">
            <p className="line-clamp-3 text-[10px] italic text-gray-600">
              {exampleQuote}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Profile</span>
          <span className={pct === 100 ? "font-bold text-emerald-600" : ""}>
            {pct}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <Button
          size="sm"
          className="h-8 w-full bg-emerald-600 text-xs text-white hover:bg-emerald-700"
          disabled={!guide.characterName || isSaving}
          onClick={onSave}
        >
          {isSaving ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          )}
          Save Guide
        </Button>

        {hasExisting && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-full text-[11px] text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}

const TRAIT_ITEMS = ISLAMIC_TRAIT_PRESETS.map((t) => ({
  value: t.value,
  label: `${TRAIT_EMOJI[t.value] || "✦"} ${t.value}`,
}));

export function KBCharacterVoiceBuilder({
  characters,
  guides,
  onSave,
  onDelete,
  isSaving,
  mode = "islamic",
}: Props) {
  const isUniversal = mode === "universal";
  const [selectedChar, setSelectedChar] = useState<string>("");
  const [guide, setGuide] = useState<CharacterGuideData>({ ...EMPTY_GUIDE });

  const patch = (partial: Partial<CharacterGuideData>) =>
    setGuide((g) => ({ ...g, ...partial }));

  const selectChar = (name: string) => {
    setSelectedChar(name);
    setGuide({ ...EMPTY_GUIDE, characterName: name });
  };

  const existingGuide = guides.find((g) => g.characterName === selectedChar);

  const handleSave = () => {
    onSave({
      ...guide,
      characterName: selectedChar,
    });
    setSelectedChar("");
    setGuide({ ...EMPTY_GUIDE });
  };

  if (characters.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed py-10 text-center">
        <p className="mb-2 text-2xl">👥</p>
        <p className="text-sm font-semibold text-foreground">
          No characters in this universe yet
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Add characters first, then come back to build their voice guides.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Pick a character and build a simple voice profile the AI can understand easily.
      </p>

      {/* Character pills */}
      <div className="flex flex-wrap gap-2">
        {characters.map((c) => {
          const hasGuide = guides.some((g) => g.characterName === c.name);
          const isActive = selectedChar === c.name;

          return (
            <button
              key={c.id || c._id}
              type="button"
              onClick={() =>
                isActive
                  ? (setSelectedChar(""), setGuide({ ...EMPTY_GUIDE }))
                  : selectChar(c.name)
              }
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? "border-emerald-400 bg-emerald-100 text-emerald-800 shadow-sm"
                  : hasGuide
                  ? "border-emerald-200 bg-muted/50 text-foreground hover:border-emerald-400"
                  : "border-border bg-muted/30 text-muted-foreground hover:border-emerald-300 hover:text-foreground"
              )}
            >
              {hasGuide && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              )}
              {c.name}
              {isActive && <X className="ml-0.5 h-3 w-3 opacity-60" />}
            </button>
          );
        })}
      </div>

      {/* Existing guide summary */}
      {existingGuide && selectedChar && (
        <div className="space-y-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-emerald-800">
              ✓ {existingGuide.characterName}&apos;s guide is saved
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] text-destructive"
              onClick={() => onDelete(selectedChar)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Remove
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-emerald-700">
            {existingGuide.speakingStyle && (
              <span>
                🗣{" "}
                {SPEAKING_STYLE_OPTIONS.find(
                  (o) => o.value === existingGuide.speakingStyle
                )?.label || existingGuide.speakingStyle}
              </span>
            )}
            {existingGuide.faithTone && (
              <span>
                🌿{" "}
                {FAITH_TONE_OPTIONS.find(
                  (o) => o.value === existingGuide.faithTone
                )?.label || existingGuide.faithTone}
              </span>
            )}
            {false && existingGuide.duaStyle && (
              <span>
                🤲{" "}
                {DUA_STYLE_OPTIONS.find(
                  (o) => o.value === existingGuide.duaStyle
                )?.label || existingGuide.duaStyle}
              </span>
            )}
            {existingGuide.islamicTraits?.length > 0 && (
              <span>✨ {existingGuide.islamicTraits.slice(0, 3).join(", ")}</span>
            )}
          </div>
        </div>
      )}

      {/* Builder */}
      {selectedChar && !existingGuide && (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_220px]">
          <div className="space-y-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            {/* 1. Voice */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  How they talk
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Pick the speaking style that feels most natural for this character.
                </p>
              </div>

              <ExpandableCardGrid
                options={SPEAKING_STYLE_OPTIONS}
                selected={guide.speakingStyle}
                onSelect={(v) => patch({ speakingStyle: v })}
                getExample={(v) => VOICE_EXAMPLES[v] || ""}
                getImage={(label) => SPEAKING_STYLE_IMAGES[label]}
              />
            </div>

            {/* 2. Faith */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {isUniversal ? "Voice style" : "Faith style"}
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {isUniversal
                    ? "Choose how their values and emotions appear naturally in their personality."
                    : "Choose how faith appears naturally in their personality."}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-bold text-foreground">{isUniversal ? "Voice tone" : "Faith tone"}</p>
                <ExpandableCardGrid
                  options={FAITH_TONE_OPTIONS}
                  selected={guide.faithTone}
                  onSelect={(v) => patch({ faithTone: v })}
                  getExample={(v) => (isUniversal ? UNIVERSAL_STYLE_EXAMPLES[v] : FAITH_EXAMPLES[v]) || ""}
                  getImage={(label) => FAITH_STYLE_IMAGES[label]}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-bold text-foreground">Good qualities</p>
                <PillChipGrid
                  items={TRAIT_ITEMS}
                  selected={guide.islamicTraits}
                  onToggle={(v) =>
                    patch({
                      islamicTraits: guide.islamicTraits.includes(v)
                        ? guide.islamicTraits.filter((t) => t !== v)
                        : [...guide.islamicTraits, v],
                    })
                  }
                />
              </div>
            </div>

            {/* 3. Example lines */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Example lines
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Add a few lines the AI can use to understand their voice better.
                </p>
              </div>

              <QuoteSelector
                quotes={isUniversal ? UNIVERSAL_QUICK_QUOTES : QUICK_QUOTES}
                placeholder={isUniversal ? 'Write a line in their voice, e.g. "We can solve this together."' : undefined}
                selected={guide.faithExamples}
                onToggle={(q) =>
                  patch({
                    faithExamples: guide.faithExamples.includes(q)
                      ? guide.faithExamples.filter((e) => e !== q)
                      : [...guide.faithExamples, q],
                  })
                }
                onAdd={(q) =>
                  patch({ faithExamples: [...guide.faithExamples, q] })
                }
                onRemove={(q) =>
                  patch({
                    faithExamples: guide.faithExamples.filter((e) => e !== q),
                  })
                }
              />
            </div>

            {/* 4. Optional */}
            <AdvancedBlock>
              <div className="space-y-2">
                <p className="text-[12px] font-bold text-foreground">
                  Background notes
                </p>
                <Textarea
                  rows={3}
                  className="resize-none text-xs"
                  placeholder="e.g. Grew up with her Nana, asks thoughtful questions, stays calm even when worried..."
                  value={guide.moreInfo}
                  onChange={(e) => patch({ moreInfo: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-bold text-foreground">
                  AI reminders
                </p>
                <SimpleTagInput
                  items={guide.personalityNotes}
                  placeholder="e.g. Never rude. Always hopeful."
                  onAdd={(v) =>
                    patch({
                      personalityNotes: [...guide.personalityNotes, v],
                    })
                  }
                  onRemove={(i) =>
                    patch({
                      personalityNotes: guide.personalityNotes.filter(
                        (_, j) => j !== i
                      ),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <p className="text-[12px] font-bold text-foreground">
                  Extra lines
                </p>
                <SimpleTagInput
                  items={guide.dialogueExamples}
                  placeholder='e.g. "We can try again, inshaAllah."'
                  onAdd={(v) =>
                    patch({
                      dialogueExamples: [...guide.dialogueExamples, v],
                    })
                  }
                  onRemove={(i) =>
                    patch({
                      dialogueExamples: guide.dialogueExamples.filter(
                        (_, j) => j !== i
                      ),
                    })
                  }
                />
              </div>
            </AdvancedBlock>

            <Button
              className="h-9 w-full bg-emerald-600 text-sm text-white hover:bg-emerald-700"
              disabled={!selectedChar || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Save {selectedChar}&apos;s Voice Guide
            </Button>
          </div>

          <LivePreview
            guide={{ ...guide, characterName: selectedChar }}
            onSave={handleSave}
            isSaving={isSaving}
            onDelete={() => onDelete(selectedChar)}
            hasExisting={false}
          />
        </div>
      )}
    </div>
  );
}
