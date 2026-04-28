import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AgeTier = "all" | "u6" | "mg";

interface Props {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  isSaving: boolean;
}

const AGE_TIER_LABELS: Record<AgeTier, string> = {
  all: "All ages",
  u6: "Under 6 only",
  mg: "Ages 8–14 only",
};

const AGE_TIER_COLORS: Record<AgeTier, string> = {
  all: "bg-red-100 text-red-700 border-red-300",
  u6: "bg-amber-100 text-amber-700 border-amber-300",
  mg: "bg-blue-100 text-blue-700 border-blue-300",
};

/** Illustrated "no" tiles — things to never put in the book */
const AVOID_PRESETS: { label: string; value: string; emoji: string; bg: string; border: string; text: string; defaultTier: AgeTier }[] = [
  { label: "Violence",        value: "Violence or physical fighting between characters",                     emoji: "🥊", bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    defaultTier: "all" },
  { label: "Scary Content",   value: "Scary, frightening or horror-themed content",                         emoji: "👻", bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-700",   defaultTier: "u6"  },
  { label: "Rude Language",   value: "Rude words, name-calling or disrespectful language",                  emoji: "🚫", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", defaultTier: "all" },
  { label: "Lying",           value: "Characters who lie without consequence or remorse",                   emoji: "🤥", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", defaultTier: "all" },
  { label: "Haram Food",      value: "Any mention of haram food or drink (pork, alcohol)",                  emoji: "🐷", bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-700",   defaultTier: "all" },
  { label: "Mockery",         value: "Mockery of religion, prayer, or Islamic practices",                   emoji: "😤", bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700",   defaultTier: "all" },
  { label: "Bad Friendships", value: "Peer pressure or friendships that lead away from good values",        emoji: "😈", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", defaultTier: "mg"  },
  { label: "Sadness Only",    value: "Stories that end on sadness or hopelessness without resolution",      emoji: "😢", bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   defaultTier: "u6"  },
  { label: "Gender Mixing",   value: "Inappropriate mixing of unrelated boys and girls in private settings", emoji: "⚠️", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  defaultTier: "mg"  },
  { label: "Magic/Sorcery",   value: "Magic, sorcery or witchcraft presented positively",                   emoji: "🔮", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", defaultTier: "all" },
];

function getStoredValue(value: string, tier: AgeTier) {
  return tier === "all" ? value : `${value}||${tier}`;
}

function parseStoredValue(stored: string): { value: string; tier: AgeTier } {
  const [value, tier] = stored.split("||");
  return { value, tier: (tier as AgeTier) || "all" };
}

export function KBAvoidTopicsStep({ items, onSave, isSaving }: Props) {
  const [customInput, setCustomInput] = useState("");
  const [tiers, setTiers] = useState<Record<string, AgeTier>>(() => {
    const map: Record<string, AgeTier> = {};
    items.forEach(i => {
      const { value, tier } = parseStoredValue(i);
      map[value] = tier;
    });
    return map;
  });

  const isSelected = (value: string) =>
    items.some(i => parseStoredValue(i).value === value);

  const getEffectiveTier = (value: string): AgeTier =>
    tiers[value] || AVOID_PRESETS.find(p => p.value === value)?.defaultTier || "all";

  const toggle = (value: string) => {
    if (isSelected(value)) {
      onSave(items.filter(i => parseStoredValue(i).value !== value));
    } else {
      const tier = getEffectiveTier(value);
      onSave([...items, getStoredValue(value, tier)]);
    }
  };

  const changeTier = (value: string, tier: AgeTier) => {
    setTiers(prev => ({ ...prev, [value]: tier }));
    if (isSelected(value)) {
      onSave([
        ...items.filter(i => parseStoredValue(i).value !== value),
        getStoredValue(value, tier),
      ]);
    }
  };

  const addCustom = () => {
    const v = customInput.trim();
    if (!v || items.some(i => parseStoredValue(i).value === v)) return;
    onSave([...items, v]);
    setCustomInput("");
  };

  const customItems = items.filter(i => !AVOID_PRESETS.some(p => p.value === parseStoredValue(i).value));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 pb-2">
        <h3 className="text-lg font-bold">Avoid Topics</h3>
        <p className="text-sm text-muted-foreground">
          Tap anything to block it — AI will never include these in text or illustrations
        </p>
      </div>

      {/* Big "no" tile grid */}
      <div className="grid grid-cols-2 gap-3">
        {AVOID_PRESETS.map(preset => {
          const sel = isSelected(preset.value);
          const tier = getEffectiveTier(preset.value);
          return (
            <div
              key={preset.value}
              className={cn(
                "relative flex flex-col gap-2 rounded-2xl border-2 shadow-sm transition-all duration-200",
                sel ? `${preset.bg} ${preset.border} shadow-md` : "bg-white border-gray-100"
              )}
            >
              <button
                type="button"
                onClick={() => toggle(preset.value)}
                disabled={isSaving}
                className="flex items-center gap-3 p-4 text-left hover:opacity-90 active:scale-[0.98]"
              >
                {/* Blocked icon */}
                <div className="relative shrink-0">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all",
                    sel ? preset.bg : "bg-gray-50"
                  )}>
                    {preset.emoji}
                  </div>
                  {sel && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-red-500/20">
                      <div className="text-red-600 text-2xl font-black">✕</div>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-bold", sel ? preset.text : "text-gray-700")}>
                    {preset.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                    {preset.value}
                  </p>
                </div>
              </button>

              {/* Age-tier selector — only shown when selected */}
              {sel && (
                <div className="flex gap-1 px-4 pb-3">
                  {(["all", "u6", "mg"] as AgeTier[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => changeTier(preset.value, t)}
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-all",
                        tier === t
                          ? AGE_TIER_COLORS[t]
                          : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                      )}
                    >
                      {AGE_TIER_LABELS[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom avoid topics */}
      {customItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Custom Rules</p>
          {customItems.map(stored => {
            const { value, tier } = parseStoredValue(stored);
            return (
              <div key={stored} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚫</span>
                  <span className="text-sm text-red-800">{value}</span>
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-semibold", AGE_TIER_COLORS[tier])}>
                    {AGE_TIER_LABELS[tier]}
                  </span>
                </div>
                <button onClick={() => onSave(items.filter(i => i !== stored))} className="text-muted-foreground hover:text-destructive">
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add a custom rule e.g. No talking animals…"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
          className="flex-1"
        />
        <Button variant="outline" onClick={addCustom} disabled={!customInput.trim() || isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
