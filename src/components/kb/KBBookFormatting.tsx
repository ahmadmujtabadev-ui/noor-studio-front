import { useMemo, useState } from "react";
import { Check, Plus, X, Baby, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormatTabKey = "middleGrade" | "underSix";

interface Props {
  kb: any;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

const AGE_TABS = [
  {
    key: "middleGrade" as const,
    label: "Middle Grade",
    sub: "Ages 8–14",
    icon: <BookOpen className="h-4 w-4" />,
    accent: "border-blue-500 bg-blue-50 dark:bg-blue-950/30",
    inactive: "border-border hover:border-blue-300",
    panelBg: "bg-blue-50/50 dark:bg-blue-950/20",
    panelBorder: "border-blue-100 dark:border-blue-900",
  },
  {
    key: "underSix" as const,
    label: "Under Six",
    sub: "Ages 3–5",
    icon: <Baby className="h-4 w-4" />,
    accent: "border-lime-500 bg-lime-50 dark:bg-lime-950/30",
    inactive: "border-border hover:border-lime-300",
    panelBg: "bg-lime-50/50 dark:bg-lime-950/20",
    panelBorder: "border-lime-100 dark:border-lime-900",
  },
] as const;

function TagPills({ items, onAdd, onRemove, placeholder }: {
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");
  const submit = () => { const t = val.trim(); if (!t) return; onAdd(t); setVal(""); };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
            {item}
            <button type="button" onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive ml-0.5">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground italic">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder} className="h-8 text-xs"
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }} />
        <Button type="button" variant="outline" size="sm" className="h-8 px-2.5" onClick={submit}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function GroupHeader({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-1">{label}</p>
  );
}

export function KBBookFormatting({ kb, onSave, isSaving }: Props) {
  const [activeTab, setActiveTab] = useState<FormatTabKey>("middleGrade");

  const bf = kb?.bookFormatting || {};
  const u6 = kb?.underSixDesign || {};

  const patchBF = (group: "middleGrade", partial: object) =>
    onSave({ bookFormatting: { ...bf, [group]: { ...(bf?.[group] || {}), ...partial } } });

  const patchU6 = (partial: object) =>
    onSave({ underSixDesign: { ...u6, ...partial } });

  const activeMeta = useMemo(() => AGE_TABS.find((t) => t.key === activeTab)!, [activeTab]);
  const mg = bf.middleGrade || {};

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Structure, pacing, and supporting material by age group.</p>

      {/* Age group toggle — compact pill row */}
      <div className="flex gap-2">
        {AGE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const hasData = tab.key === "middleGrade"
            ? Boolean(bf?.middleGrade?.chapterRange || bf?.middleGrade?.sceneLength)
            : Boolean(u6?.pageCount || u6?.maxWordsPerSpread);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium",
                isActive ? tab.accent : tab.inactive + " text-muted-foreground"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-xs text-muted-foreground font-normal">{tab.sub}</span>
              {hasData && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 shrink-0">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </button>
          );
        })}
        {isSaving && <span className="ml-auto text-xs text-muted-foreground self-center">Saving…</span>}
      </div>

      {/* Panel */}
      <div className={cn("rounded-2xl border p-5 space-y-5", activeMeta.panelBg, activeMeta.panelBorder)}>

        {/* Ages 8–14 */}
        {activeTab === "middleGrade" && (
          <>
            {/* Pacing group */}
            <div className="space-y-3">
              <GroupHeader label="Pacing" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Chapter Range</Label>
                  <Input placeholder="e.g. 8–12 chapters" className="h-8 text-xs mt-1"
                    defaultValue={mg.chapterRange || ""}
                    onBlur={(e) => patchBF("middleGrade", { chapterRange: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Scene Length</Label>
                  <Input placeholder="e.g. 300–600 words" className="h-8 text-xs mt-1"
                    defaultValue={mg.sceneLength || ""}
                    onBlur={(e) => patchBF("middleGrade", { sceneLength: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1 block">Chapter Rhythm</Label>
                <TagPills items={mg.chapterRhythm || []} placeholder="e.g. Ch 1 → Introduce world and characters"
                  onAdd={(v) => patchBF("middleGrade", { chapterRhythm: [...(mg.chapterRhythm || []), v] })}
                  onRemove={(i) => patchBF("middleGrade", { chapterRhythm: (mg.chapterRhythm || []).filter((_: string, j: number) => j !== i) })} />
              </div>
            </div>

            {/* Book Wrapping group */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <GroupHeader label="Book Wrapping" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold mb-1 block">Front Matter</Label>
                  <TagPills items={mg.frontMatter || []} placeholder="e.g. Dedication, Contents"
                    onAdd={(v) => patchBF("middleGrade", { frontMatter: [...(mg.frontMatter || []), v] })}
                    onRemove={(i) => patchBF("middleGrade", { frontMatter: (mg.frontMatter || []).filter((_: string, j: number) => j !== i) })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold mb-1 block">End Matter</Label>
                  <TagPills items={mg.endMatter || []} placeholder="e.g. Glossary, Du'a page"
                    onAdd={(v) => patchBF("middleGrade", { endMatter: [...(mg.endMatter || []), v] })}
                    onRemove={(i) => patchBF("middleGrade", { endMatter: (mg.endMatter || []).filter((_: string, j: number) => j !== i) })} />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Under Six */}
        {activeTab === "underSix" && (
          <>
            {/* Pacing group */}
            <div className="space-y-3">
              <GroupHeader label="Pacing" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Page Count</Label>
                  <Input placeholder="e.g. 24" className="h-8 text-xs mt-1"
                    value={u6.pageCount ?? ""}
                    onChange={(e) => patchU6({ pageCount: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Max Words Per Spread</Label>
                  <Input placeholder="e.g. 8–12 words" className="h-8 text-xs mt-1"
                    defaultValue={u6.maxWordsPerSpread || ""}
                    onBlur={(e) => patchU6({ maxWordsPerSpread: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold mb-1 block">Spread Structure</Label>
                <TagPills items={u6.spreadStructure || []} placeholder="e.g. Spread 1 introduction, Spread 2 discovery"
                  onAdd={(v) => patchU6({ spreadStructure: [...(u6.spreadStructure || []), v] })}
                  onRemove={(i) => patchU6({ spreadStructure: (u6.spreadStructure || []).filter((_: string, j: number) => j !== i) })} />
              </div>
            </div>

            {/* Book Wrapping group */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <GroupHeader label="Book Wrapping" />
              <div>
                <Label className="text-xs font-semibold mb-1 block">Special Rules</Label>
                <TagPills items={u6.specialRules || []} placeholder="e.g. One idea per spread, simple sentence rhythm"
                  onAdd={(v) => patchU6({ specialRules: [...(u6.specialRules || []), v] })}
                  onRemove={(i) => patchU6({ specialRules: (u6.specialRules || []).filter((_: string, j: number) => j !== i) })} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
