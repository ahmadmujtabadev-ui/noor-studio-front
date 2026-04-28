import { useState } from "react";
import { Plus, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconQuran, IconMasjid, IconTasbih, IconPrayerMat, IconSalah, IconBismillah, IconTawakkul, IconKindness } from "./KBIcons";

interface VocabWord {
  word: string;
  definition: string;
  example?: string;
  type?: string;
  avoid?: string;
}

interface Props {
  vocab: VocabWord[];
  onSave: (vocab: VocabWord[]) => Promise<void>;
  isSaving: boolean;
}

/** Preset vocabulary words — illustrated like the reference image */
const VOCAB_PRESETS: Array<VocabWord & {
  icon: () => JSX.Element;
  bg: string;
  border: string;
  textColor: string;
  subColor: string;
}> = [
  { word: "Quran",        definition: "The holy book of Islam, revealed to Prophet Muhammad ﷺ",         example: "Layla read from the Quran every morning after Fajr.",                              avoid: "Koran",    icon: IconQuran,       bg: "bg-emerald-50",  border: "border-emerald-200", textColor: "text-emerald-900", subColor: "text-emerald-700", type: "Quranic" },
  { word: "Salah",        definition: "The five daily prayers — the pillar of every Muslim's day",       example: "Ibrahim stopped his game and ran to join his father for Salah.",                  avoid: "Namaz",    icon: IconSalah,       bg: "bg-teal-50",     border: "border-teal-200",    textColor: "text-teal-900",    subColor: "text-teal-700",    type: "Pillar" },
  { word: "Masjid",       definition: "The mosque — the house of Allah where Muslims pray together",     example: "The family walked to the masjid for Friday prayers.",                             avoid: "Mosque",   icon: IconMasjid,     bg: "bg-blue-50",     border: "border-blue-200",    textColor: "text-blue-900",    subColor: "text-blue-700",    type: "Place" },
  { word: "Tasbih",       definition: "Prayer beads used while doing dhikr — remembering Allah",        example: "Grandma's fingers moved quietly along her tasbih.",                               icon: IconTasbih,     bg: "bg-purple-50",   border: "border-purple-200",  textColor: "text-purple-900",  subColor: "text-purple-700",  type: "Worship" },
  { word: "Bismillah",    definition: "Saying 'In the name of Allah' before starting anything",         example: "She whispered Bismillah before opening her exam paper.",                          icon: IconBismillah,  bg: "bg-green-50",    border: "border-green-200",   textColor: "text-green-900",   subColor: "text-green-700",   type: "Expression" },
  { word: "Tawakkul",     definition: "Trusting Allah completely after doing your best effort",          example: "After studying hard, he made du'a and practised tawakkul.",                       icon: IconTawakkul,   bg: "bg-sky-50",      border: "border-sky-200",     textColor: "text-sky-900",     subColor: "text-sky-700",     type: "Value" },
  { word: "Sadaqah",      definition: "Giving charity freely for the sake of Allah",                     example: "Zara put her pocket money in the sadaqah box with a smile.",                     avoid: "Charity",  icon: IconKindness,   bg: "bg-rose-50",     border: "border-rose-200",    textColor: "text-rose-900",    subColor: "text-rose-700",    type: "Pillar" },
  { word: "Prayer Mat",   definition: "The clean mat placed on the floor when praying salah",            example: "Yusuf rolled out the prayer mat and faced the qibla.",                            icon: IconPrayerMat,  bg: "bg-orange-50",   border: "border-orange-200",  textColor: "text-orange-900",  subColor: "text-orange-700",  type: "Object" },
];

/** Color palette for custom word cards (cycles through these) */
const CARD_COLORS = [
  { bg: "bg-violet-50",   border: "border-violet-200", textColor: "text-violet-900", subColor: "text-violet-700" },
  { bg: "bg-amber-50",    border: "border-amber-200",   textColor: "text-amber-900",  subColor: "text-amber-700"  },
  { bg: "bg-cyan-50",     border: "border-cyan-200",    textColor: "text-cyan-900",   subColor: "text-cyan-700"   },
  { bg: "bg-lime-50",     border: "border-lime-200",    textColor: "text-lime-900",   subColor: "text-lime-700"   },
  { bg: "bg-fuchsia-50",  border: "border-fuchsia-200", textColor: "text-fuchsia-900",subColor: "text-fuchsia-700"},
];

/** First letter avatar icon for custom words */
function WordAvatar({ word, colorIdx }: { word: string; colorIdx: number }) {
  const colors = [
    ["#7C3AED", "#EDE9FE"], ["#D97706", "#FEF3C7"], ["#0891B2", "#CFFAFE"],
    ["#65A30D", "#ECFCCB"], ["#C026D3", "#FAE8FF"],
  ];
  const [fg, bg] = colors[colorIdx % colors.length];
  return (
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <rect width="80" height="80" rx="20" fill={bg} />
      <text x="40" y="56" textAnchor="middle" fontSize="38" fill={fg} fontFamily="'Scheherazade New', serif" fontWeight="bold">
        {word.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}

export function KBVocabularyStep({ vocab, onSave, isSaving }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newWord, setNewWord] = useState<VocabWord>({ word: "", definition: "", example: "", type: "", avoid: "" });

  const presetWords = VOCAB_PRESETS.map(p => p.word);
  const addedPresetWords = vocab.map(v => v.word);

  const togglePreset = (p: typeof VOCAB_PRESETS[0]) => {
    if (addedPresetWords.includes(p.word)) {
      onSave(vocab.filter(v => v.word !== p.word));
    } else {
      onSave([...vocab, { word: p.word, definition: p.definition, example: p.example, type: p.type }]);
    }
  };

  const addCustom = () => {
    const w = newWord.word.trim();
    if (!w || !newWord.definition.trim()) return;
    onSave([...vocab, { ...newWord, word: w }]);
    setNewWord({ word: "", definition: "", example: "", type: "", avoid: "" });
    setShowForm(false);
  };

  const removeWord = (word: string) => onSave(vocab.filter(v => v.word !== word));

  const customWords = vocab.filter(v => !presetWords.includes(v.word));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1 pb-2">
        <h3 className="text-lg font-bold">Vocabulary</h3>
        <p className="text-sm text-muted-foreground">
          Tap a word to add it — AI uses these correctly in prose and glossary pages
        </p>
      </div>

      {/* ── Preset word grid — styled like the reference image ── */}
      <div className="grid grid-cols-2 gap-4">
        {VOCAB_PRESETS.map(preset => {
          const isAdded = addedPresetWords.includes(preset.word);
          const Icon = preset.icon;
          return (
            <button
              key={preset.word}
              type="button"
              onClick={() => togglePreset(preset)}
              disabled={isSaving}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg text-center",
                isAdded
                  ? `${preset.bg} ${preset.border} shadow-md`
                  : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
              )}
            >
              {/* Big icon — exactly like reference image */}
              <div className="w-16 h-16 drop-shadow-sm">
                <Icon />
              </div>
              {/* Word — bold, large */}
              <span className={cn("text-base font-extrabold leading-tight", isAdded ? preset.textColor : "text-gray-800")}>
                {preset.word}
              </span>
              {/* Prefer / avoid pair */}
              {preset.avoid && (
                <span className="flex items-center gap-1 text-[10px]">
                  <span className="rounded bg-red-100 px-1 py-0.5 text-red-600 line-through">{preset.avoid}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className={cn("rounded px-1 py-0.5 font-semibold", isAdded ? preset.textColor : "text-gray-700")}>{preset.word}</span>
                </span>
              )}
              {/* Definition snippet */}
              <span className={cn("text-[11px] leading-tight line-clamp-2", isAdded ? preset.subColor : "text-gray-500")}>
                {preset.definition.split(" ").slice(0, 6).join(" ")}…
              </span>
              {/* Added badge */}
              {isAdded && (
                <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 12 12" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Custom word cards ── */}
      {customWords.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Your Custom Words</p>
          <div className="grid grid-cols-2 gap-3">
            {customWords.map((v, i) => {
              const c = CARD_COLORS[i % CARD_COLORS.length];
              return (
                <div key={v.word} className={cn("relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-center group", c.bg, c.border)}>
                  <button
                    onClick={() => removeWord(v.word)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-14 h-14">
                    <WordAvatar word={v.word} colorIdx={i} />
                  </div>
                  <span className={cn("text-base font-extrabold", c.textColor)}>{v.word}</span>
                  <span className={cn("text-[11px] leading-tight line-clamp-2", c.subColor)}>
                    {v.definition}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Add custom word ── */}
      <button
        type="button"
        onClick={() => setShowForm(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-gray-200 text-sm font-medium text-muted-foreground hover:border-orange-300 hover:text-orange-600 transition-all"
      >
        <Plus className="w-4 h-4" />
        Add your own word
        {showForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {showForm && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Preferred term *</Label>
              <Input placeholder="Alhamdulillah" value={newWord.word}
                onChange={e => setNewWord({ ...newWord, word: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Definition *</Label>
              <Input placeholder="All praise is for Allah" value={newWord.definition}
                onChange={e => setNewWord({ ...newWord, definition: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Avoid this term instead (optional)</Label>
              <Input placeholder='e.g. "Mosque" → prefer "Masjid"' value={newWord.avoid || ""}
                onChange={e => setNewWord({ ...newWord, avoid: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs font-semibold">Story Example (optional)</Label>
              <Input placeholder='"Alhamdulillah!" said Zahra, hugging her mama.' value={newWord.example}
                onChange={e => setNewWord({ ...newWord, example: e.target.value })} />
            </div>
          </div>
          <Button variant="outline" className="w-full" disabled={!newWord.word.trim() || !newWord.definition.trim() || isSaving} onClick={addCustom}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Word
          </Button>
        </div>
      )}
    </div>
  );
}
