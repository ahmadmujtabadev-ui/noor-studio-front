import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  onSave: (items: string[]) => Promise<void>;
  isSaving: boolean;
}

/** Illustrated "no" tiles — things to never put in the book */
const AVOID_PRESETS = [
  { label: "Violence",        value: "Violence or physical fighting between characters",                    emoji: "🥊", bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
  { label: "Scary Content",   value: "Scary, frightening or horror-themed content",                        emoji: "👻", bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-700"   },
  { label: "Rude Language",   value: "Rude words, name-calling or disrespectful language",                 emoji: "🚫", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
  { label: "Lying",           value: "Characters who lie without consequence or remorse",                  emoji: "🤥", bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
  { label: "Haram Food",      value: "Any mention of haram food or drink (pork, alcohol)",                 emoji: "🐷", bg: "bg-pink-50",   border: "border-pink-200",   text: "text-pink-700"   },
  { label: "Mockery",         value: "Mockery of religion, prayer, or Islamic practices",                  emoji: "😤", bg: "bg-rose-50",   border: "border-rose-200",   text: "text-rose-700"   },
  { label: "Bad Friendships", value: "Peer pressure or friendships that lead away from good values",       emoji: "😈", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  { label: "Sadness Only",    value: "Stories that end on sadness or hopelessness without resolution",     emoji: "😢", bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
  { label: "Gender Mixing",   value: "Inappropriate mixing of unrelated boys and girls in private settings",emoji: "⚠️", bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700"  },
  { label: "Magic/Sorcery",   value: "Magic, sorcery or witchcraft presented positively",                  emoji: "🔮", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
];

export function KBAvoidTopicsStep({ items, onSave, isSaving }: Props) {
  const [customInput, setCustomInput] = useState("");

  const toggle = (value: string) => {
    const next = items.includes(value)
      ? items.filter(v => v !== value)
      : [...items, value];
    onSave(next);
  };

  const addCustom = () => {
    const v = customInput.trim();
    if (!v || items.includes(v)) return;
    onSave([...items, v]);
    setCustomInput("");
  };

  const customItems = items.filter(v => !AVOID_PRESETS.some(p => p.value === v));

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
          const isSelected = items.includes(preset.value);
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => toggle(preset.value)}
              disabled={isSaving}
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md text-left",
                isSelected
                  ? `${preset.bg} ${preset.border} shadow-md`
                  : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
              )}
            >
              {/* Blocked icon */}
              <div className="relative shrink-0">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all",
                  isSelected ? preset.bg : "bg-gray-50"
                )}>
                  {preset.emoji}
                </div>
                {/* Big X overlay when selected */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-red-500/20">
                    <div className="text-red-600 text-2xl font-black">✕</div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-bold", isSelected ? preset.text : "text-gray-700")}>
                  {preset.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                  {preset.value}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom avoid topics */}
      {customItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Custom Rules</p>
          {customItems.map(v => (
            <div key={v} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚫</span>
                <span className="text-sm text-red-800">{v}</span>
              </div>
              <button onClick={() => onSave(items.filter(i => i !== v))} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
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
