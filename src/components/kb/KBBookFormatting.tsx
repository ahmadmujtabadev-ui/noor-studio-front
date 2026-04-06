import { useMemo, useState } from "react";
import {
  Check,
  Plus,
  X,
  Baby,
  BookOpen,
  Files,
  Image as ImageIcon,
  ScrollText,
} from "lucide-react";
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
    description:
      "Chapter-based structure for older readers with scenes, rhythm, and supporting matter.",
    icon: <BookOpen className="h-5 w-5" />,
    image: "/background/format-8-14-header.png",
    active: "border-blue-500 ring-4 ring-blue-100 shadow-lg",
    inactive: "border-slate-200 hover:border-blue-300 hover:shadow-md",
    panelBg: "bg-blue-50/50",
    panelBorder: "border-blue-100",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    key: "underSix" as const,
    label: "Under Six",
    sub: "Ages 3–5",
    description:
      "Simple picture-book structure focused on page count and short spread-friendly storytelling.",
    icon: <Baby className="h-5 w-5" />,
    image: "/background/format-under-6-header.png",
    active: "border-lime-500 ring-4 ring-lime-100 shadow-lg",
    inactive: "border-slate-200 hover:border-lime-300 hover:shadow-md",
    panelBg: "bg-lime-50/50",
    panelBorder: "border-lime-100",
    iconBg: "bg-lime-100 text-lime-700",
  },
] as const;

const FORMAT_FIELD_IMAGES = {
  middleGrade: {
    chapterRhythm: "/background/format-chapter-rhythm.png",
    sceneLength: "/background/format-scene-length.png",
    frontMatter: "/background/format-front-matter.png",
    endMatter: "/background/format-end-matter.png",
  },
  underSix: {
    pageCount: "/background/format-page-count.png",
    maxWordsPerSpread: "/background/format-max-words.png",
    spreadStructure: "/background/format-spread-structure.png",
  },
} as const;

function FieldPreview({
  src,
  title,
  description,
}: {
  src: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[16/10] w-full overflow-hidden bg-slate-50">
        <img src={src} alt={title} className="h-full w-full object-cover" />
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

function TagPills({
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

  const submit = () => {
    const next = val.trim();
    if (!next) return;
    onAdd(next);
    setVal("");
  };

  return (
    <div className="space-y-2">
      <div className="flex min-h-[34px] flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="ml-0.5 text-slate-400 transition hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs italic text-muted-foreground">
            None added yet
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="h-10 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-10 px-3"
          onClick={submit}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-white p-2 shadow-sm">{icon}</div>
      <Label className="text-xs font-semibold">{title}</Label>
    </div>
  );
}

export function KBBookFormatting({ kb, onSave, isSaving }: Props) {
  const [activeTab, setActiveTab] = useState<FormatTabKey>("middleGrade");

  const bf = kb?.bookFormatting || {};
  const u6 = kb?.underSixDesign || {};

  const patchBF = (group: "middleGrade", partial: object) =>
    onSave({
      bookFormatting: {
        ...bf,
        [group]: {
          ...(bf?.[group] || {}),
          ...partial,
        },
      },
    });

  const patchU6 = (partial: object) =>
    onSave({
      underSixDesign: {
        ...u6,
        ...partial,
      },
    });

  const activeMeta = useMemo(
    () => AGE_TABS.find((t) => t.key === activeTab)!,
    [activeTab]
  );

  const mg = bf.middleGrade || {};
  const u6PageCount = u6.pageCount ?? "";

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Define structure, pacing, and supporting material by age group. These
          rules guide book generation.
        </p>
        <p className="text-xs text-muted-foreground">
          Only one age group stays active at a time for cleaner editing.
        </p>
      </div>

      {/* Age group cards */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {AGE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const hasData =
            tab.key === "middleGrade"
              ? Boolean(bf?.middleGrade?.chapterRange) ||
                Boolean(bf?.middleGrade?.sceneLength) ||
                (bf?.middleGrade?.chapterRhythm?.length || 0) > 0 ||
                (bf?.middleGrade?.frontMatter?.length || 0) > 0 ||
                (bf?.middleGrade?.endMatter?.length || 0) > 0
              : Boolean(u6?.pageCount) ||
                Boolean(u6?.maxWordsPerSpread) ||
                (u6?.specialRules?.length || 0) > 0 ||
                (u6?.spreadStructure?.length || 0) > 0;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "group relative overflow-hidden rounded-3xl border bg-white text-left transition-all duration-200",
                isActive ? tab.active : tab.inactive
              )}
            >
              <div className="relative h-[220px] w-full overflow-hidden">
                <img
                  src={tab.image}
                  alt={`${tab.label} header`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                    {tab.icon}
                    <span>{tab.sub}</span>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    {tab.label}
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-white/85">
                    {tab.description}
                  </p>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-2">
                  {hasData && !isActive && (
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 shadow">
                      <Check className="h-4 w-4 text-white" />
                    </span>
                  )}
                  {isActive && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900 shadow-md">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div
        className={cn(
          "rounded-3xl border p-6 shadow-sm",
          activeMeta.panelBg,
          activeMeta.panelBorder
        )}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
              {activeMeta.icon}
              <span>{activeMeta.label}</span>
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-900">
              {activeMeta.label} Book Formatting
            </h3>
            <p className="mt-1 text-sm text-slate-600">{activeMeta.sub}</p>
          </div>

          {isSaving && (
            <div className="rounded-full border bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              Saving...
            </div>
          )}
        </div>

        {/* Ages 8–14 */}
        {activeTab === "middleGrade" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs font-semibold">Chapter Range</Label>
                <Input
                  placeholder="e.g. 8–12 chapters"
                  defaultValue={mg.chapterRange || ""}
                  onBlur={(e) =>
                    patchBF("middleGrade", {
                      chapterRange: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-3">
                <FieldPreview
                  src={FORMAT_FIELD_IMAGES.middleGrade.sceneLength}
                  title="Scene Length"
                  description="Guides how long each scene should feel during story generation."
                />
                <div>
                  <Label className="text-xs font-semibold">Scene Length</Label>
                  <Input
                    placeholder="e.g. 300–600 words per scene"
                    defaultValue={mg.sceneLength || ""}
                    onBlur={(e) =>
                      patchBF("middleGrade", {
                        sceneLength: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <FieldPreview
                src={FORMAT_FIELD_IMAGES.middleGrade.chapterRhythm}
                title="Chapter Rhythm"
                description="Controls the flow and pacing from one chapter to the next."
              />
              <SectionHeader
                icon={<ImageIcon className="h-4 w-4 text-blue-600" />}
                title="Chapter Rhythm"
              />
              <TagPills
                items={mg.chapterRhythm || []}
                placeholder="e.g. Chapter 1 → Introduce world and characters"
                onAdd={(v) =>
                  patchBF("middleGrade", {
                    chapterRhythm: [...(mg.chapterRhythm || []), v],
                  })
                }
                onRemove={(i) =>
                  patchBF("middleGrade", {
                    chapterRhythm: (mg.chapterRhythm || []).filter(
                      (_: string, j: number) => j !== i
                    ),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <FieldPreview
                src={FORMAT_FIELD_IMAGES.middleGrade.frontMatter}
                title="Front Matter"
                description="Opening book pages like dedication, contents, or character list."
              />
              <SectionHeader
                icon={<Files className="h-4 w-4 text-blue-600" />}
                title="Front Matter"
              />
              <TagPills
                items={mg.frontMatter || []}
                placeholder="e.g. Dedication, Contents, Character list"
                onAdd={(v) =>
                  patchBF("middleGrade", {
                    frontMatter: [...(mg.frontMatter || []), v],
                  })
                }
                onRemove={(i) =>
                  patchBF("middleGrade", {
                    frontMatter: (mg.frontMatter || []).filter(
                      (_: string, j: number) => j !== i
                    ),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <FieldPreview
                src={FORMAT_FIELD_IMAGES.middleGrade.endMatter}
                title="End Matter"
                description="Closing pages like glossary, du'a page, author note, or extras."
              />
              <SectionHeader
                icon={<ScrollText className="h-4 w-4 text-blue-600" />}
                title="End Matter"
              />
              <TagPills
                items={mg.endMatter || []}
                placeholder="e.g. Glossary, Author note, Du'a page"
                onAdd={(v) =>
                  patchBF("middleGrade", {
                    endMatter: [...(mg.endMatter || []), v],
                  })
                }
                onRemove={(i) =>
                  patchBF("middleGrade", {
                    endMatter: (mg.endMatter || []).filter(
                      (_: string, j: number) => j !== i
                    ),
                  })
                }
              />
            </div>
          </div>
        )}

        {/* Under Six */}
        {activeTab === "underSix" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <FieldPreview
                  src={FORMAT_FIELD_IMAGES.underSix.pageCount}
                  title="Page Count"
                  description="Sets the total length of the under-six book."
                />
                <div>
                  <Label className="text-xs font-semibold">Page Count</Label>
                  <Input
                    placeholder="e.g. 24"
                    value={u6PageCount}
                    onChange={(e) => patchU6({ pageCount: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <FieldPreview
                  src={FORMAT_FIELD_IMAGES.underSix.maxWordsPerSpread}
                  title="Max Words Per Spread"
                  description="Keeps each spread short, simple, and easy for young children."
                />
                <div>
                  <Label className="text-xs font-semibold">
                    Max Words Per Spread
                  </Label>
                  <Input
                    placeholder="e.g. 8–12 words"
                    defaultValue={u6.maxWordsPerSpread || ""}
                    onBlur={(e) =>
                      patchU6({ maxWordsPerSpread: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Special Rules</Label>
              <TagPills
                items={u6.specialRules || []}
                placeholder="e.g. Repetition, simple sentence rhythm, one clear action per spread"
                onAdd={(v) =>
                  patchU6({ specialRules: [...(u6.specialRules || []), v] })
                }
                onRemove={(i) =>
                  patchU6({
                    specialRules: (u6.specialRules || []).filter(
                      (_: string, j: number) => j !== i
                    ),
                  })
                }
              />
            </div>

            <div className="space-y-3">
              <FieldPreview
                src={FORMAT_FIELD_IMAGES.underSix.spreadStructure}
                title="Spread Structure"
                description="Defines how the story moves across picture-book spreads."
              />
              <div>
                <Label className="text-xs font-semibold">Spread Structure</Label>
                <TagPills
                  items={u6.spreadStructure || []}
                  placeholder="e.g. Spread 1 introduction, Spread 2 discovery, Spread 3 comfort"
                  onAdd={(v) =>
                    patchU6({
                      spreadStructure: [...(u6.spreadStructure || []), v],
                    })
                  }
                  onRemove={(i) =>
                    patchU6({
                      spreadStructure: (u6.spreadStructure || []).filter(
                        (_: string, j: number) => j !== i
                      ),
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}