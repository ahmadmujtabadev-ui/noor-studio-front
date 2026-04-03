import { useState } from "react";
import { Plus, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PRESET_DUAS } from "./KBIcons";

interface Dua {
  arabic?: string;
  transliteration: string;
  meaning: string;
  when?: string;
}

interface Props {
  duas: Dua[];
  onSave: (duas: Dua[]) => Promise<void>;
  isSaving: boolean;
}

const WHEN_OPTIONS = [
  { value: "before eating",    label: "Before Eating", emoji: "🍽️" },
  { value: "after eating",     label: "After Eating",  emoji: "✅" },
  { value: "before sleep",     label: "Before Sleep",  emoji: "🌙" },
  { value: "waking up",        label: "Waking Up",     emoji: "☀️" },
  { value: "before study",     label: "Before Study",  emoji: "📖" },
  { value: "starting a task",  label: "Starting Task", emoji: "🚀" },
  { value: "during hardship",  label: "In Hardship",   emoji: "💪" },
];

export function KBDuasStep({ duas, onSave, isSaving }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newDua, setNewDua] = useState<Dua>({ arabic: "", transliteration: "", meaning: "", when: "" });

  const presetIds = duas.map(d => d.transliteration);

  const addPreset = (p: typeof PRESET_DUAS[0]) => {
    if (presetIds.includes(p.transliteration)) {
      onSave(duas.filter(d => d.transliteration !== p.transliteration));
    } else {
      onSave([...duas, { arabic: p.arabic, transliteration: p.transliteration, meaning: p.meaning, when: p.when }]);
    }
  };

  const addCustom = () => {
    if (!newDua.transliteration || !newDua.meaning) return;
    onSave([...duas, { ...newDua }]);
    setNewDua({ arabic: "", transliteration: "", meaning: "", when: "" });
    setShowForm(false);
  };

  const removeDua = (i: number) => onSave(duas.filter((_, j) => j !== i));

  const customDuas = duas.filter(d => !PRESET_DUAS.some(p => p.transliteration === d.transliteration));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 pb-2">
        <h3 className="text-lg font-bold">Du'as</h3>
        <p className="text-sm text-muted-foreground">
          Tap a du'a to add it — AI places these naturally in the right story moments
        </p>
      </div>

      {/* ── Preset du'a cards ── */}
      <div className="space-y-3">
        {PRESET_DUAS.map(preset => {
          const isAdded = presetIds.includes(preset.transliteration);
          return (
            <button
              key={preset.transliteration}
              type="button"
              onClick={() => addPreset(preset)}
              disabled={isSaving}
              className={cn(
                "w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md active:scale-[0.99]",
                isAdded
                  ? `bg-gradient-to-r ${preset.color} ${preset.border} border-2 shadow-md`
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Arabic text */}
                  <p
                    className={cn("text-xl font-bold leading-loose text-right", preset.textColor)}
                    dir="rtl"
                    lang="ar"
                    style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                  >
                    {preset.arabic}
                  </p>
                  {/* Transliteration */}
                  <p className={cn("text-sm font-semibold italic", preset.subColor)}>
                    {preset.transliteration}
                  </p>
                  {/* Meaning */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    "{preset.meaning}"
                  </p>
                  {/* When badge */}
                  <span className={cn("inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full", preset.badge)}>
                    {preset.emoji} {preset.when}
                  </span>
                </div>
                {/* Added indicator */}
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
                  isAdded ? `bg-current ${preset.border} text-white` : "border-gray-200 bg-gray-50"
                )}>
                  {isAdded ? (
                    <svg viewBox="0 0 12 12" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Custom du'as ── */}
      {customDuas.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Custom Du'as</p>
          {customDuas.map((d, i) => (
            <div key={i} className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 group">
              <button
                onClick={() => removeDua(duas.indexOf(d))}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
              {d.arabic && (
                <p className="text-xl font-bold text-right text-blue-900 leading-loose mb-1" dir="rtl" lang="ar"
                  style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}>
                  {d.arabic}
                </p>
              )}
              <p className="text-sm font-semibold italic text-blue-700">{d.transliteration}</p>
              <p className="text-xs text-blue-600 mt-0.5">"{d.meaning}"</p>
              {d.when && <span className="mt-1 inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">{d.when}</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Add custom du'a toggle ── */}
      <button
        type="button"
        onClick={() => setShowForm(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-muted-foreground hover:border-blue-300 hover:text-blue-600 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add a custom du'a
        {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showForm && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label className="text-xs font-semibold">Arabic Text (optional)</Label>
              <Input
                placeholder="بِسْمِ اللَّهِ"
                value={newDua.arabic}
                onChange={e => setNewDua({ ...newDua, arabic: e.target.value })}
                className="text-right text-lg"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Transliteration *</Label>
              <Input placeholder="Bismillah" value={newDua.transliteration}
                onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Meaning *</Label>
              <Input placeholder="In the name of Allah" value={newDua.meaning}
                onChange={e => setNewDua({ ...newDua, meaning: e.target.value })} />
            </div>
          </div>
          {/* When picker */}
          <div>
            <Label className="text-xs font-semibold mb-2 block">When is it used?</Label>
            <div className="flex flex-wrap gap-2">
              {WHEN_OPTIONS.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setNewDua({ ...newDua, when: newDua.when === opt.value ? "" : opt.value })}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all",
                    newDua.when === opt.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                  )}>
                  <span>{opt.emoji}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <Button variant="outline" className="w-full" disabled={!newDua.transliteration || !newDua.meaning || isSaving} onClick={addCustom}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Du'a
          </Button>
        </div>
      )}
    </div>
  );
}
