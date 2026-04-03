import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PAGE_LAYOUT_OPTIONS, ILLUSTRATION_STYLE_OPTIONS } from "@/components/shared/KBFieldIcons";

// ─── Age group tabs ────────────────────────────────────────────────────────────
const AGE_TABS = [
  {
    key: "middleGrade",
    label: "Middle Grade",
    sub: "Ages 8–13",
    emoji: "📚",
    active: "bg-blue-600 text-white border-blue-600",
    inactive: "bg-white text-blue-700 border-blue-200 hover:border-blue-400",
    panelBg: "bg-blue-50/50",
    panelBorder: "border-blue-100",
    accent: "border-blue-500 bg-blue-50",
    accentText: "text-blue-700",
    check: "bg-blue-500",
  },
  {
    key: "junior",
    label: "Junior",
    sub: "Ages 5–8",
    emoji: "🌟",
    active: "bg-violet-600 text-white border-violet-600",
    inactive: "bg-white text-violet-700 border-violet-200 hover:border-violet-400",
    panelBg: "bg-violet-50/50",
    panelBorder: "border-violet-100",
    accent: "border-violet-500 bg-violet-50",
    accentText: "text-violet-700",
    check: "bg-violet-500",
  },
  {
    key: "underSix",
    label: "Under Six",
    sub: "Ages under 6",
    emoji: "🍼",
    active: "bg-lime-600 text-white border-lime-600",
    inactive: "bg-white text-lime-700 border-lime-200 hover:border-lime-400",
    panelBg: "bg-lime-50/50",
    panelBorder: "border-lime-100",
    accent: "border-lime-500 bg-lime-50",
    accentText: "text-lime-700",
    check: "bg-lime-500",
  },
] as const;

// ─── Simple tag pill input ─────────────────────────────────────────────────────
function TagPills({
  items, onAdd, onRemove, placeholder,
}: { items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void; placeholder: string }) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-white text-xs font-medium text-gray-700 border border-gray-200">
            {item}
            <button onClick={() => onRemove(i)} className="hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground italic">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} className="text-sm h-9"
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
        <Button variant="outline" size="sm" className="h-9 px-3"
          onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Visual option tile ────────────────────────────────────────────────────────
function OptionTile({ icon, label, selected, onClick, accent, accentText, check }: {
  icon: React.ReactNode; label: string; selected: boolean; onClick: () => void;
  accent: string; accentText: string; check: string;
}) {
  return (
    <button type="button" onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-md text-center",
        selected ? accent + " shadow-md" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
      )}>
      <div className="w-12 h-12">{icon}</div>
      <span className={cn("text-[11px] font-bold leading-tight", selected ? accentText : "text-gray-600")}>{label}</span>
      {selected && (
        <span className={cn("absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center", check)}>
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
    </button>
  );
}

// ─── Word count tiles ──────────────────────────────────────────────────────────
const UNDER_SIX_WORD_TILES = [
  { value: 5,  label: "5 words",  desc: "Tiny tots",     bg: "bg-lime-100 border-lime-400" },
  { value: 10, label: "10 words", desc: "Picture book",  bg: "bg-green-100 border-green-400" },
  { value: 15, label: "15 words", desc: "Early reader",  bg: "bg-teal-100 border-teal-400" },
  { value: 20, label: "20 words", desc: "Short story",   bg: "bg-cyan-100 border-cyan-400" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  kb: any;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

export function KBBookFormatting({ kb, onSave, isSaving }: Props) {
  const [activeTab, setActiveTab] = useState<"middleGrade" | "junior" | "underSix">("middleGrade");

  const bf = kb?.bookFormatting || {};
  const u6 = kb?.underSixDesign || {};

  const patchBF = (group: string, partial: object) =>
    onSave({ bookFormatting: { ...bf, [group]: { ...bf[group], ...partial } } });
  const patchU6 = (partial: object) =>
    onSave({ underSixDesign: { ...u6, ...partial } });

  const tab = AGE_TABS.find(t => t.key === activeTab)!;
  const mg = bf.middleGrade || {};
  const jr = bf.junior || {};
  const currentWords = u6.maxWordsPerSpread ?? 10;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Book pacing, structure & layout rules per age group — injected into every generation prompt.
      </p>

      {/* ── 3 Age group tabs ── */}
      <div className="grid grid-cols-3 gap-3">
        {AGE_TABS.map(t => {
          const isActive = activeTab === t.key;
          let hasData = false;
          if (t.key === "middleGrade") hasData = !!bf.middleGrade?.wordCount;
          if (t.key === "junior") hasData = !!bf.junior?.wordCount;
          if (t.key === "underSix") hasData = !!u6.maxWordsPerSpread || !!u6.pageLayout;
          return (
            <button key={t.key} type="button"
              onClick={() => setActiveTab(t.key as any)}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                isActive ? t.active : t.inactive
              )}>
              <span className="text-2xl">{t.emoji}</span>
              <span className="text-sm font-bold leading-tight">{t.label}</span>
              <span className={cn("text-[11px] font-medium", isActive ? "opacity-80" : "opacity-60")}>{t.sub}</span>
              {hasData && !isActive && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-green-400 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
              {isActive && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/30 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Panel ── */}
      <div className={cn("rounded-2xl border-2 p-5 space-y-6", tab.panelBg, tab.panelBorder)}>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {tab.emoji} {tab.label} Settings
        </p>

        {/* ─── MIDDLE GRADE ─── */}
        {activeTab === "middleGrade" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Word Count</Label>
                <Input placeholder="20,000–35,000" defaultValue={mg.wordCount || ""}
                  onBlur={e => patchBF("middleGrade", { wordCount: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Chapter Range</Label>
                <Input placeholder="8 to 12 chapters" defaultValue={mg.chapterRange || ""}
                  onBlur={e => patchBF("middleGrade", { chapterRange: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Scene Length</Label>
                <Input placeholder="500–800 words" defaultValue={mg.sceneLength || ""}
                  onBlur={e => patchBF("middleGrade", { sceneLength: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Chapter Rhythm</Label>
              <TagPills
                items={mg.chapterRhythm || []}
                placeholder="e.g. Hook → Scene A → Reflection → Scene B → Close"
                onAdd={v => patchBF("middleGrade", { chapterRhythm: [...(mg.chapterRhythm || []), v] })}
                onRemove={i => patchBF("middleGrade", { chapterRhythm: (mg.chapterRhythm || []).filter((_: string, j: number) => j !== i) })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Front Matter</Label>
              <TagPills
                items={mg.frontMatter || []}
                placeholder="e.g. Dedication, Map, Character list"
                onAdd={v => patchBF("middleGrade", { frontMatter: [...(mg.frontMatter || []), v] })}
                onRemove={i => patchBF("middleGrade", { frontMatter: (mg.frontMatter || []).filter((_: string, j: number) => j !== i) })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">End Matter</Label>
              <TagPills
                items={mg.endMatter || []}
                placeholder="e.g. Glossary, Author note, Du'a page"
                onAdd={v => patchBF("middleGrade", { endMatter: [...(mg.endMatter || []), v] })}
                onRemove={i => patchBF("middleGrade", { endMatter: (mg.endMatter || []).filter((_: string, j: number) => j !== i) })}
              />
            </div>
          </>
        )}

        {/* ─── JUNIOR ─── */}
        {activeTab === "junior" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Word Count</Label>
                <Input placeholder="1,500–3,000" defaultValue={jr.wordCount || ""}
                  onBlur={e => patchBF("junior", { wordCount: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Page Count</Label>
                <Input placeholder="24–40 pages" defaultValue={jr.pageCount || ""}
                  onBlur={e => patchBF("junior", { pageCount: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Segment Count</Label>
                <Input placeholder="4–6 segments" defaultValue={jr.segmentCount || ""}
                  onBlur={e => patchBF("junior", { segmentCount: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Page Flow</Label>
              <TagPills
                items={jr.pageFlow || []}
                placeholder="e.g. Scene → Emotion → Resolution"
                onAdd={v => patchBF("junior", { pageFlow: [...(jr.pageFlow || []), v] })}
                onRemove={i => patchBF("junior", { pageFlow: (jr.pageFlow || []).filter((_: string, j: number) => j !== i) })}
              />
            </div>
          </>
        )}

        {/* ─── UNDER SIX ─── */}
        {activeTab === "underSix" && (
          <>
            {/* Max Words Per Spread */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">📝 Max Words Per Spread</Label>
              <div className="grid grid-cols-4 gap-2">
                {UNDER_SIX_WORD_TILES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => patchU6({ maxWordsPerSpread: t.value })}
                    disabled={isSaving}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center hover:scale-105",
                      currentWords === t.value ? t.bg + " shadow-sm" : "border-gray-200 hover:border-lime-300 bg-white"
                    )}>
                    <span className="text-2xl font-black">{t.value}</span>
                    <span className="text-[10px] font-semibold">{t.label}</span>
                    <span className="text-[9px] text-muted-foreground">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Layout */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">📄 Page Layout</Label>
              <div className="grid grid-cols-4 gap-2">
                {PAGE_LAYOUT_OPTIONS.map(opt => (
                  <OptionTile key={opt.value} icon={opt.icon} label={opt.label}
                    selected={u6.pageLayout === opt.value}
                    onClick={() => patchU6({ pageLayout: u6.pageLayout === opt.value ? "" : opt.value })}
                    accent={tab.accent} accentText={tab.accentText} check={tab.check}
                  />
                ))}
              </div>
            </div>

            {/* Illustration Style */}
            <div className="space-y-2">
              <Label className="text-sm font-bold">🎨 Illustration Style</Label>
              <div className="grid grid-cols-4 gap-2">
                {ILLUSTRATION_STYLE_OPTIONS.map(opt => (
                  <OptionTile key={opt.value} icon={opt.icon} label={opt.label}
                    selected={u6.illustrationStyle === opt.value}
                    onClick={() => patchU6({ illustrationStyle: u6.illustrationStyle === opt.value ? "" : opt.value })}
                    accent={tab.accent} accentText={tab.accentText} check={tab.check}
                  />
                ))}
              </div>
            </div>

            {/* Reading type + other fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Reading Type</Label>
                <Select defaultValue={u6.readingType || "parent-read"} onValueChange={v => patchU6({ readingType: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent-read">Parent-read aloud</SelectItem>
                    <SelectItem value="early-independent">Early independent reader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Color Palette</Label>
                <Input placeholder="e.g. Bright, joyful, high contrast"
                  defaultValue={u6.colorPalette || ""} onBlur={e => patchU6({ colorPalette: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Font Style</Label>
                <Input placeholder="e.g. Rounded, large, dyslexia-friendly"
                  defaultValue={u6.fontStyle || ""} onBlur={e => patchU6({ fontStyle: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Reflection Prompt</Label>
                <Input placeholder='e.g. "Would you say sorry too?"'
                  defaultValue={u6.reflectionPrompt || ""} onBlur={e => patchU6({ reflectionPrompt: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs font-semibold">Bonus Page Content</Label>
                <Input placeholder="e.g. Ayah, du'a, or line of wonder (illustrated)"
                  defaultValue={u6.bonusPageContent || ""} onBlur={e => patchU6({ bonusPageContent: e.target.value })} />
              </div>
            </div>

            {/* Emotional pattern */}
            <div className="rounded-xl border border-lime-200 bg-white p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Emotional Pattern Per Segment</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Conflict / Question</Label>
                  <Input className="text-xs" placeholder="e.g. Something went wrong"
                    defaultValue={u6.emotionalPattern?.conflictOrQuestion || ""}
                    onBlur={e => patchU6({ emotionalPattern: { ...u6.emotionalPattern, conflictOrQuestion: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">Islamic Anchor</Label>
                  <Input className="text-xs" placeholder="e.g. Bismillah, du'a, or ayah"
                    defaultValue={u6.emotionalPattern?.islamicAnchor || ""}
                    onBlur={e => patchU6({ emotionalPattern: { ...u6.emotionalPattern, islamicAnchor: e.target.value } })} />
                </div>
                <div>
                  <Label className="text-xs">Resolution</Label>
                  <Input className="text-xs" placeholder="e.g. Peace restored through action"
                    defaultValue={u6.emotionalPattern?.resolution || ""}
                    onBlur={e => patchU6({ emotionalPattern: { ...u6.emotionalPattern, resolution: e.target.value } })} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
