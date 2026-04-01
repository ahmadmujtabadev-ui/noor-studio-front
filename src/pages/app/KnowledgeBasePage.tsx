import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Search, Trash2, BookOpen, Loader2, Database, BookMarked,
  // Faith & Language
  Moon, HandHeart, Languages, Ban,
  // Story & Style
  UserRound,
  // Visual & Format
  TreePine, ListOrdered, Baby,
  // Cover Design
  Frame,
  Users,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useKbNavStore } from "@/lib/store/kbNavStore";
import { useToast } from "@/hooks/use-toast";
import {
  useKnowledgeBases, useCreateKnowledgeBase, useUpdateKnowledgeBase, useDeleteKnowledgeBase,
} from "@/hooks/useKnowledgeBase";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import type { KnowledgeBase } from "@/lib/api/types";
import { useSearchParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookStructure {
  type: 'activity' | 'educational' | 'story';
  ageGroup: string;
  title: string;
  description: string;
  pageTypes: string[];
  chapterFlow: string[];
  toneNotes: string;
  faithAnchors: string[];
  avoid: string[];
}

interface CoverDesignState {
  brandingRules: string[];
  titlePlacement: string;
  characterComposition: string[];
  atmosphereMiddleGrade: string;
  atmosphereJunior: string;
  atmosphereSaeeda: string;
  typographyMiddleGrade: string;
  typographyJunior: string;
  optionalAddons: string[];
  islamicMotifs: string[];
  avoidCover: string[];
  extraNotes: string;
}

interface UnderSixDesignState {
  maxWordsPerSpread: number;
  pageLayout: string;
  fontStyle: string;
  fontPreferences: string[];
  reflectionPrompt: string;
  bonusPageContent: string;
  illustrationStyle: string;
  colorPalette: string;
  specialRules: string[];
}

interface CharacterGuide {
  characterName: string;
  speakingStyle: string;
  dialogueExamples: string[];
  moreInfo: string;
  personalityNotes: string[];
  literaryRole: string;
  faithTone: string;
  faithExpressions: string[];
  duaStyle: string;
  islamicTraits: string[];
  faithExamples: string[];
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "islamicValues",      label: "Islamic Values",  icon: Moon,        color: "text-violet-600",  group: "Core"   },
  { id: "duas",               label: "Du'as",           icon: HandHeart,   color: "text-blue-600",    group: "Core"   },
  { id: "vocabulary",         label: "Vocabulary",      icon: Languages,   color: "text-orange-600",  group: "Core"   },
  { id: "avoidTopics",        label: "Avoid Topics",    icon: Ban,         color: "text-red-500",     group: "Core"   },
  { id: "characterGuides",    label: "Character Voice", icon: UserRound,   color: "text-emerald-600", group: "Story"  },
  { id: "backgroundSettings", label: "Background",      icon: TreePine,    color: "text-teal-600",    group: "Visual" },
  { id: "bookFormatting",     label: "Book Format",     icon: ListOrdered, color: "text-amber-600",   group: "Visual" },
  { id: "underSixDesign",     label: "Under-6 Design",  icon: Baby,        color: "text-lime-600",    group: "Visual" },
  { id: "coverDesign",        label: "Cover Design",    icon: Frame,       color: "text-rose-600",    group: "Cover"  },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

// ─── Workflow tabs ────────────────────────────────────────────────────────────
const WORKFLOWS = [
  {
    id: "faith",
    label: "Faith & Language",
    description: "Islamic values, du'as, vocabulary & topics to avoid",
    sections: ["islamicValues", "duas", "vocabulary", "avoidTopics"],
  },
  {
    id: "story",
    label: "Character Voice",
    description: "Per-character speaking style, background lore & faith integration",
    sections: ["characterGuides"],
  },
  {
    id: "visual",
    label: "Visual & Format",
    description: "Scene backgrounds, book formatting & layout rules",
    sections: ["backgroundSettings", "bookFormatting", "underSixDesign"],
  },
  {
    id: "cover",
    label: "Cover Design",
    description: "Front & back cover composition, atmosphere & typography",
    sections: ["coverDesign"],
  },
] as const;

type WorkflowId = typeof WORKFLOWS[number]["id"];

// Per-section color tokens (bg + icon background)
const SECTION_STYLE: Record<string, { bg: string; iconBg: string; border: string; text: string }> = {
  islamicValues:      { bg: "bg-violet-50",  iconBg: "bg-violet-100",  border: "border-violet-200",  text: "text-violet-700"  },
  duas:               { bg: "bg-blue-50",    iconBg: "bg-blue-100",    border: "border-blue-200",    text: "text-blue-700"    },
  vocabulary:         { bg: "bg-orange-50",  iconBg: "bg-orange-100",  border: "border-orange-200",  text: "text-orange-700"  },
  avoidTopics:        { bg: "bg-red-50",     iconBg: "bg-red-100",     border: "border-red-200",     text: "text-red-700"     },
  characterGuides:    { bg: "bg-emerald-50", iconBg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700" },
  backgroundSettings: { bg: "bg-teal-50",    iconBg: "bg-teal-100",    border: "border-teal-200",    text: "text-teal-700"    },
  bookFormatting:     { bg: "bg-amber-50",   iconBg: "bg-amber-100",   border: "border-amber-200",   text: "text-amber-700"   },
  underSixDesign:     { bg: "bg-lime-50",    iconBg: "bg-lime-100",    border: "border-lime-200",    text: "text-lime-700"    },
  coverDesign:        { bg: "bg-rose-50",    iconBg: "bg-rose-100",    border: "border-rose-200",    text: "text-rose-700"    },
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function ItemRow({ text, onRemove, badge }: { text: string; onRemove: () => void; badge?: string }) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50 group gap-2">
      {badge && <Badge variant="outline" className="font-mono text-xs shrink-0 mt-0.5">{badge}</Badge>}
      <p className="text-sm flex-1 whitespace-pre-line leading-relaxed">{text}</p>
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function AddRow({ placeholder, value, onChange, onAdd, loading }: {
  placeholder: string; value: string; onChange: (v: string) => void;
  onAdd: () => void; loading?: boolean;
}) {
  return (
    <div className="flex gap-2 pt-2 border-t border-border">
      <Textarea placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        rows={2} className="flex-1 text-sm resize-none"
        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) onAdd(); }} />
      <Button variant="outline" onClick={onAdd} disabled={loading} className="self-end h-9 px-3">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{children}</p>;
}

function TagInput({ label, items, onAdd, onRemove, placeholder }: {
  label: string; items: string[]; onAdd: (v: string) => void;
  onRemove: (i: number) => void; placeholder?: string;
}) {
  const [val, setVal] = useState("");
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-1 mb-1.5">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="gap-1 text-xs">
            {item}
            <button onClick={() => onRemove(i)} className="hover:text-destructive ml-0.5">
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          className="text-xs h-8"
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
        <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const { data: kbs = [], isLoading } = useKnowledgeBases();
  const createMutation = useCreateKnowledgeBase();
  const deleteMutation = useDeleteKnowledgeBase();
  const [searchParams] = useSearchParams();
  const { universes } = useUniverses();

  const [search, setSearch]         = useState("");
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [newItem, setNewItem]       = useState("");

  // Sync active workflow/section from the sidebar store
  const kbNav = useKbNavStore();
  const activeWorkflow = kbNav.activeWorkflow as WorkflowId;
  const activeSection  = kbNav.activeSection  as SectionId;
  const setActiveSection  = (id: SectionId)  => kbNav.setKbNav(activeWorkflow, id);
  const setActiveWorkflow = (id: WorkflowId) => {
    const wf = WORKFLOWS.find(w => w.id === id);
    kbNav.setKbNav(id, wf ? (wf.sections[0] as SectionId) : activeSection);
  };

  // When a KB is selected, reset to first section
  useEffect(() => {
    if (selectedKB) kbNav.setKbNav("faith", "islamicValues");
  }, [selectedKB?._id ?? selectedKB?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showCreate, setShowCreate]         = useState(false);
  const [showDelete, setShowDelete]         = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Structured new-item states
  const [newDua, setNewDua]             = useState({ arabic: "", transliteration: "", meaning: "", when: "" });
  const [newVocab, setNewVocab]         = useState({ word: "", definition: "", example: "" });
  const [newCharGuide, setNewCharGuide] = useState<CharacterGuide>({
    characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "",
    personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [],
    duaStyle: "", islamicTraits: [], faithExamples: [],
  });
  const [selectedCharName, setSelectedCharName] = useState<string>("");

  // Create form — only name + universe
  const [form, setForm] = useState({ name: "", universeId: "" });

  const updateMutation = useUpdateKnowledgeBase(selectedKB?.id || "");
  const filteredKBs = kbs.filter((kb: KnowledgeBase) => kb.name.toLowerCase().includes(search.toLowerCase()));
  const { data: universeChars = [] } = useCharacters((selectedKB as any)?.universeId);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  async function save(update: Partial<KnowledgeBase>, successMsg = "Saved") {
    try {
      const updated = await updateMutation.mutateAsync(update as any);
      setSelectedKB(updated);
      toast({ title: successMsg });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  }

  function getArr<T = string>(field: string): T[] {
    return ((selectedKB as any)?.[field] || []) as T[];
  }

  const handleCreate = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    if (!form.universeId) { toast({ title: "Please select a universe", variant: "destructive" }); return; }
    try {
      const created = await createMutation.mutateAsync({
        name: form.name.trim(),
        universeId: form.universeId,
      });
      toast({ title: "Knowledge base created" });
      setShowCreate(false);
      setForm({ name: "", universeId: "" });
      setSelectedKB(created);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedKB?.id === id) setSelectedKB(null);
      setShowDelete(null);
      toast({ title: "Deleted" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  function getSectionCount(sectionId: string): number {
    if (!selectedKB) return 0;
    const kb = selectedKB as any;
    switch (sectionId) {
      case "islamicValues":      return kb.islamicValues?.length || 0;
      case "duas":               return kb.duas?.length || 0;
      case "vocabulary":         return kb.vocabulary?.length || 0;
      case "avoidTopics":        return kb.avoidTopics?.length || 0;
      case "characterGuides":    return kb.characterGuides?.length || 0;
      case "backgroundSettings": {
        const bs = kb.backgroundSettings || {};
        return ["junior", "middleGrade", "saeeda"].filter(k => bs[k]?.tone || bs[k]?.locations?.length).length;
      }
      case "bookFormatting": {
        const bf = kb.bookFormatting || {};
        return (bf.middleGrade?.wordCount ? 1 : 0) + (bf.junior?.wordCount ? 1 : 0);
      }
      case "underSixDesign": {
        const u = kb.underSixDesign || {};
        return u.maxWordsPerSpread || u.pageLayout ? 1 : 0;
      }
      case "coverDesign": {
        const cd = kb.coverDesign || {};
        return (cd.brandingRules?.length || 0) + (cd.islamicMotifs?.length || 0);
      }
      default: return 0;
    }
  }

  // ─── Section renderers ────────────────────────────────────────────────────

  const renderSectionContent = (sectionId: SectionId) => {
    if (!selectedKB) return null;

    switch (sectionId) {

      case "islamicValues": {
        const items = getArr<string>("islamicValues");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Core Islamic values woven into every story and illustration. Injected into all AI text and image stages.</p>
            <ScrollArea className="h-52"><div className="space-y-2">
              {items.map((v, i) => <ItemRow key={i} text={v} onRemove={() => save({ islamicValues: items.filter((_, j) => j !== i) })} />)}
              {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No values yet.</p>}
            </div></ScrollArea>
            <AddRow placeholder="e.g. Sabr — patience in hardship" value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ islamicValues: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      case "duas": {
        const duas = getArr<any>("duas");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Du'as placed naturally in story moments. AI uses the "when" field to decide placement timing.</p>
            <ScrollArea className="h-48"><div className="space-y-2">
              {duas.map((d: any, i: number) => (
                <ItemRow key={i}
                  text={`${d.arabic ? d.arabic + "\n" : ""}${d.transliteration}\n"${d.meaning}"${d.when ? "\nWhen: " + d.when : ""}`}
                  onRemove={() => save({ duas: duas.filter((_: any, j: number) => j !== i) })} />
              ))}
              {!duas.length && <p className="text-sm text-muted-foreground text-center py-6">No du'as yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Du'a</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Arabic (optional)</Label><Input placeholder="بِسْمِ اللَّهِ" value={newDua.arabic} onChange={e => setNewDua({ ...newDua, arabic: e.target.value })} /></div>
                <div><Label className="text-xs">Transliteration *</Label><Input placeholder="Bismillah" value={newDua.transliteration} onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Meaning *</Label><Input placeholder="In the name of Allah" value={newDua.meaning} onChange={e => setNewDua({ ...newDua, meaning: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">When used in story (AI uses this for placement)</Label><Input placeholder="Before eating, starting a task, waking up..." value={newDua.when} onChange={e => setNewDua({ ...newDua, when: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newDua.transliteration || !newDua.meaning || updateMutation.isPending}
                onClick={() => { save({ duas: [...duas, { ...newDua }] }); setNewDua({ arabic: "", transliteration: "", meaning: "", when: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Du'a
              </Button>
            </div>
          </div>
        );
      }

      case "vocabulary": {
        const vocab = getArr<any>("vocabulary");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Islamic/Arabic vocabulary. AI uses these correctly in prose and they appear in glossary pages.</p>
            <ScrollArea className="h-48"><div className="space-y-2">
              {vocab.map((v: any, i: number) => (
                <ItemRow key={i}
                  text={`${v.word}: ${v.definition}${v.example ? "\nUsage: " + v.example : ""}`}
                  onRemove={() => save({ vocabulary: vocab.filter((_: any, j: number) => j !== i) })} />
              ))}
              {!vocab.length && <p className="text-sm text-muted-foreground text-center py-6">No vocabulary yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Word</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Word *</Label><Input placeholder="Alhamdulillah" value={newVocab.word} onChange={e => setNewVocab({ ...newVocab, word: e.target.value })} /></div>
                <div><Label className="text-xs">Definition *</Label><Input placeholder="All praise is for Allah" value={newVocab.definition} onChange={e => setNewVocab({ ...newVocab, definition: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Story Example (shows AI how to use it naturally)</Label>
                  <Input placeholder='"Alhamdulillah!" said Zahra, hugging her mama.' value={newVocab.example} onChange={e => setNewVocab({ ...newVocab, example: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newVocab.word || !newVocab.definition || updateMutation.isPending}
                onClick={() => { save({ vocabulary: [...vocab, { ...newVocab }] }); setNewVocab({ word: "", definition: "", example: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Word
              </Button>
            </div>
          </div>
        );
      }

      case "avoidTopics": {
        const items = getArr<string>("avoidTopics");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Topics the AI must never include in text or illustrations across all stages.</p>
            <ScrollArea className="h-52"><div className="space-y-2">
              {items.map((v, i) => <ItemRow key={i} text={v} onRemove={() => save({ avoidTopics: items.filter((_, j) => j !== i) })} />)}
              {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No restrictions yet.</p>}
            </div></ScrollArea>
            <AddRow placeholder="e.g. Preachy narration, mockery of others, slang toward faith..." value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ avoidTopics: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      case "backgroundSettings": {
        const bs = (selectedKB as any)?.backgroundSettings || {};
        const patchBg = (groupKey: string, partial: object) =>
          save({ backgroundSettings: { ...bs, [groupKey]: { ...bs[groupKey], ...partial } } } as any);
        const patchBgRoot = (partial: object) =>
          save({ backgroundSettings: { ...bs, ...partial } } as any);
        const AGE_GROUPS = [
          { key: "junior",       label: "Junior (5–8)" },
          { key: "middleGrade",  label: "Middle Grade (8–13)" },
          { key: "saeeda",       label: "Saeeda Series" },
        ];
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Background environment rules per age group. Injected directly into every image generation prompt. <strong>timeOfDay</strong> and <strong>cameraHint</strong> propagate to all illustration moments.</p>
            {AGE_GROUPS.map(({ key, label }) => {
              const g = bs[key] || {};
              const locs = g.locations || [];
              const feats = g.keyFeatures || [];
              return (
                <div key={key} className="border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">Tone</Label>
                      <Input placeholder="e.g. Bright, safe, familiar" defaultValue={g.tone || ""}
                        onBlur={e => patchBg(key, { tone: e.target.value })} /></div>
                    <div><Label className="text-xs">Color Style</Label>
                      <Input placeholder="e.g. Soft palettes, gentle shadows" defaultValue={g.colorStyle || ""}
                        onBlur={e => patchBg(key, { colorStyle: e.target.value })} /></div>
                    <div><Label className="text-xs">Lighting Style</Label>
                      <Input placeholder="e.g. Golden hues for peace" defaultValue={g.lightingStyle || ""}
                        onBlur={e => patchBg(key, { lightingStyle: e.target.value })} /></div>
                    <div>
                      <Label className="text-xs">Default Time of Day</Label>
                      <Select defaultValue={g.timeOfDay || ""} onValueChange={v => patchBg(key, { timeOfDay: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select time..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="golden-hour">Golden Hour</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Default Camera Hint</Label>
                      <Select defaultValue={g.cameraHint || ""} onValueChange={v => patchBg(key, { cameraHint: v })}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select camera..." /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wide">Wide Shot</SelectItem>
                          <SelectItem value="medium">Medium Shot</SelectItem>
                          <SelectItem value="close">Close-Up</SelectItem>
                          <SelectItem value="full-body">Full Body</SelectItem>
                          <SelectItem value="over-shoulder">Over Shoulder</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label className="text-xs">Additional Notes</Label>
                      <Input placeholder="Extra rules..." defaultValue={g.additionalNotes || ""}
                        onBlur={e => patchBg(key, { additionalNotes: e.target.value })} /></div>
                  </div>
                  <TagInput label="Locations" items={locs} placeholder="e.g. bedroom, masjid, garden"
                    onAdd={v => patchBg(key, { locations: [...locs, v] })}
                    onRemove={i => patchBg(key, { locations: locs.filter((_: string, j: number) => j !== i) })} />
                  <TagInput label="Key Visual Features" items={feats} placeholder="e.g. Clear foreground separation"
                    onAdd={v => patchBg(key, { keyFeatures: [...feats, v] })}
                    onRemove={i => patchBg(key, { keyFeatures: feats.filter((_: string, j: number) => j !== i) })} />
                </div>
              );
            })}
            <div className="border rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cross-Series Rules</p>
              <TagInput label="Avoid Backgrounds (never use)" items={bs.avoidBackgrounds || []}
                placeholder="e.g. Abstract gradients, busy wallpapers"
                onAdd={v => patchBgRoot({ avoidBackgrounds: [...(bs.avoidBackgrounds || []), v] })}
                onRemove={i => patchBgRoot({ avoidBackgrounds: (bs.avoidBackgrounds || []).filter((_: string, j: number) => j !== i) })} />
              <div><Label className="text-xs">Universal Rules</Label>
                <Textarea rows={2} className="resize-none text-xs" placeholder="e.g. Every scene must feel handcrafted, not digital"
                  defaultValue={bs.universalRules || ""} onBlur={e => patchBgRoot({ universalRules: e.target.value })} />
              </div>
            </div>
          </div>
        );
      }

      case "bookFormatting": {
        const bf = (selectedKB as any)?.bookFormatting || {};
        const mg = bf.middleGrade || {};
        const jr = bf.junior || {};
        const patchMG = (partial: object) => save({ bookFormatting: { ...bf, middleGrade: { ...mg, ...partial } } } as any);
        const patchJR = (partial: object) => save({ bookFormatting: { ...bf, junior: { ...jr, ...partial } } } as any);
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Book pacing and structure rules per age group. Injected into text generation to control word count, chapter rhythm, and layout.</p>
            <div className="border rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Middle Grade (8–13)</p>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Word Count</Label><Input placeholder="20,000–35,000" defaultValue={mg.wordCount || ""} onBlur={e => patchMG({ wordCount: e.target.value })} /></div>
                <div><Label className="text-xs">Chapter Range</Label><Input placeholder="8 to 12" defaultValue={mg.chapterRange || ""} onBlur={e => patchMG({ chapterRange: e.target.value })} /></div>
                <div><Label className="text-xs">Scene Length</Label><Input placeholder="500–800 words" defaultValue={mg.sceneLength || ""} onBlur={e => patchMG({ sceneLength: e.target.value })} /></div>
              </div>
              <TagInput label="Chapter Rhythm" items={mg.chapterRhythm || []} placeholder="e.g. Hook → Scene A → Reflection → Scene B → Close"
                onAdd={v => patchMG({ chapterRhythm: [...(mg.chapterRhythm || []), v] })}
                onRemove={i => patchMG({ chapterRhythm: (mg.chapterRhythm || []).filter((_: string, j: number) => j !== i) })} />
              <TagInput label="Front Matter" items={mg.frontMatter || []} placeholder="e.g. Dedication, Map, Character list"
                onAdd={v => patchMG({ frontMatter: [...(mg.frontMatter || []), v] })}
                onRemove={i => patchMG({ frontMatter: (mg.frontMatter || []).filter((_: string, j: number) => j !== i) })} />
              <TagInput label="End Matter" items={mg.endMatter || []} placeholder="e.g. Glossary, Author note, Du'a page"
                onAdd={v => patchMG({ endMatter: [...(mg.endMatter || []), v] })}
                onRemove={i => patchMG({ endMatter: (mg.endMatter || []).filter((_: string, j: number) => j !== i) })} />
            </div>
            <div className="border rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Junior (5–8)</p>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Word Count</Label><Input placeholder="1,500–3,000" defaultValue={jr.wordCount || ""} onBlur={e => patchJR({ wordCount: e.target.value })} /></div>
                <div><Label className="text-xs">Page Count</Label><Input placeholder="24–40 pages" defaultValue={jr.pageCount || ""} onBlur={e => patchJR({ pageCount: e.target.value })} /></div>
                <div><Label className="text-xs">Segment Count</Label><Input placeholder="4–6 segments" defaultValue={jr.segmentCount || ""} onBlur={e => patchJR({ segmentCount: e.target.value })} /></div>
              </div>
              <TagInput label="Page Flow" items={jr.pageFlow || []} placeholder="e.g. Scene → Emotion → Resolution"
                onAdd={v => patchJR({ pageFlow: [...(jr.pageFlow || []), v] })}
                onRemove={i => patchJR({ pageFlow: (jr.pageFlow || []).filter((_: string, j: number) => j !== i) })} />
            </div>
          </div>
        );
      }


      case "coverDesign": {
        const cd = (selectedKB as any)?.coverDesign || {};
        const brandingRules       = cd.brandingRules        || [];
        const characterComposition= cd.characterComposition || [];
        const optionalAddons      = cd.optionalAddons       || [];
        const islamicMotifs       = cd.islamicMotifs        || [];
        const avoidCover          = cd.avoidCover           || [];

        const patch = (partial: object) => save({ coverDesign: { ...cd, ...partial } } as any);

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Cover artwork rules injected into every cover and back-cover generation prompt. Controls composition, typography, and atmosphere per age group.</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Title Placement</Label>
                <Input placeholder="e.g. Top 1/3 of cover, always visible at thumbnail size"
                  defaultValue={cd.titlePlacement || ""} onBlur={e => patch({ titlePlacement: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Atmosphere — Middle Grade</Label>
                <Textarea rows={2} className="resize-none text-xs" placeholder="Cinematic lighting, mystery item in background"
                  defaultValue={cd.atmosphere?.middleGrade || ""} onBlur={e => patch({ atmosphere: { ...cd.atmosphere, middleGrade: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Atmosphere — Junior</Label>
                <Textarea rows={2} className="resize-none text-xs" placeholder="Bright joyful colors, plot-related objects"
                  defaultValue={cd.atmosphere?.junior || ""} onBlur={e => patch({ atmosphere: { ...cd.atmosphere, junior: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Atmosphere — Saeeda</Label>
                <Textarea rows={2} className="resize-none text-xs" placeholder="Dreamlike macro-world, giant leaf, flower cave"
                  defaultValue={cd.atmosphere?.saeeda || ""} onBlur={e => patch({ atmosphere: { ...cd.atmosphere, saeeda: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Typography — Middle Grade</Label>
                <Input className="text-xs" placeholder="Serif — Literata, Alegreya"
                  defaultValue={cd.typography?.middleGrade || ""} onBlur={e => patch({ typography: { ...cd.typography, middleGrade: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Typography — Junior</Label>
                <Input className="text-xs" placeholder="Bold rounded — Fredoka, Baloo"
                  defaultValue={cd.typography?.junior || ""} onBlur={e => patch({ typography: { ...cd.typography, junior: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Extra Notes</Label>
                <Input className="text-xs" placeholder="Any other cover direction..."
                  defaultValue={cd.extraNotes || ""} onBlur={e => patch({ extraNotes: e.target.value })} />
              </div>
            </div>

            <TagInput label="Branding Rules" items={brandingRules}
              placeholder="e.g. Series logo must appear prominently"
              onAdd={v => patch({ brandingRules: [...brandingRules, v] })}
              onRemove={i => patch({ brandingRules: brandingRules.filter((_: string, j: number) => j !== i) })} />
            <TagInput label="Character Composition Rules" items={characterComposition}
              placeholder="e.g. Eye contact with reader preferred for Middle Grade"
              onAdd={v => patch({ characterComposition: [...characterComposition, v] })}
              onRemove={i => patch({ characterComposition: characterComposition.filter((_: string, j: number) => j !== i) })} />
            <TagInput label="Optional Add-ons" items={optionalAddons}
              placeholder="e.g. Icon badge, corner headshot, series number"
              onAdd={v => patch({ optionalAddons: [...optionalAddons, v] })}
              onRemove={i => patch({ optionalAddons: optionalAddons.filter((_: string, j: number) => j !== i) })} />
            <TagInput label="Islamic Motifs" items={islamicMotifs}
              placeholder="e.g. Star pattern, mashrabiya frame watermark"
              onAdd={v => patch({ islamicMotifs: [...islamicMotifs, v] })}
              onRemove={i => patch({ islamicMotifs: islamicMotifs.filter((_: string, j: number) => j !== i) })} />
            <TagInput label="Avoid on Cover" items={avoidCover}
              placeholder="e.g. Generic centered-character-only templates"
              onAdd={v => patch({ avoidCover: [...avoidCover, v] })}
              onRemove={i => patch({ avoidCover: avoidCover.filter((_: string, j: number) => j !== i) })} />
          </div>
        );
      }

      case "underSixDesign": {
        const u = (selectedKB as any)?.underSixDesign || {};
        const fontPreferences = u.fontPreferences || [];
        const specialRules    = u.specialRules    || [];
        const patchU = (partial: object) => save({ underSixDesign: { ...u, ...partial } } as any);

        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Layout, text, and illustration rules for spreads-only books (ages under 6). Controls max words, page flow, font, and emotional pattern.</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Max Words Per Spread</Label>
                <Input type="number" placeholder="10"
                  defaultValue={u.maxWordsPerSpread ?? 10}
                  onBlur={e => patchU({ maxWordsPerSpread: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">Reading Type</Label>
                <Select defaultValue={u.readingType || "parent-read"} onValueChange={v => patchU({ readingType: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parent-read">Parent-read aloud</SelectItem>
                    <SelectItem value="early-independent">Early independent reader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Page Layout</Label>
                <Input placeholder="e.g. Left full-page image, right-side text block (100–150 words max)"
                  defaultValue={u.pageLayout || ""} onBlur={e => patchU({ pageLayout: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Font Style</Label>
                <Input placeholder="e.g. Rounded, large, dyslexia-friendly"
                  defaultValue={u.fontStyle || ""} onBlur={e => patchU({ fontStyle: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Illustration Style</Label>
                <Input placeholder="e.g. Pixar-style, round shapes, soft shadows"
                  defaultValue={u.illustrationStyle || ""} onBlur={e => patchU({ illustrationStyle: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Color Palette</Label>
                <Input placeholder="e.g. Bright, joyful, high contrast"
                  defaultValue={u.colorPalette || ""} onBlur={e => patchU({ colorPalette: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Reflection Prompt (end spread)</Label>
                <Input placeholder='e.g. "Would you say sorry too?"'
                  defaultValue={u.reflectionPrompt || ""} onBlur={e => patchU({ reflectionPrompt: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Bonus Page Content</Label>
                <Input placeholder="e.g. Ayah, du'a, or line of wonder (illustrated)"
                  defaultValue={u.bonusPageContent || ""} onBlur={e => patchU({ bonusPageContent: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border rounded-lg p-3">
              <p className="col-span-3 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Emotional Pattern Per Segment</p>
              <div>
                <Label className="text-xs">Conflict / Question</Label>
                <Input className="text-xs" placeholder="e.g. Something went wrong or a question arises"
                  defaultValue={u.emotionalPattern?.conflictOrQuestion || ""}
                  onBlur={e => patchU({ emotionalPattern: { ...u.emotionalPattern, conflictOrQuestion: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Emotion / Reaction</Label>
                <Input className="text-xs" placeholder="e.g. Character feels sad or confused"
                  defaultValue={u.emotionalPattern?.emotionReaction || ""}
                  onBlur={e => patchU({ emotionalPattern: { ...u.emotionalPattern, emotionReaction: e.target.value } })} />
              </div>
              <div>
                <Label className="text-xs">Gentle Resolve / Wonder</Label>
                <Input className="text-xs" placeholder="e.g. A warm moment of learning or comfort"
                  defaultValue={u.emotionalPattern?.resolve || ""}
                  onBlur={e => patchU({ emotionalPattern: { ...u.emotionalPattern, resolve: e.target.value } })} />
              </div>
            </div>

            <TagInput label="Font Preferences" items={fontPreferences}
              placeholder="e.g. Lexend, OpenDyslexic, Fredoka"
              onAdd={v => patchU({ fontPreferences: [...fontPreferences, v] })}
              onRemove={i => patchU({ fontPreferences: fontPreferences.filter((_: string, j: number) => j !== i) })} />
            <TagInput label="Special Rules" items={specialRules}
              placeholder="e.g. One idea per spread — never cram dialogue"
              onAdd={v => patchU({ specialRules: [...specialRules, v] })}
              onRemove={i => patchU({ specialRules: specialRules.filter((_: string, j: number) => j !== i) })} />
          </div>
        );
      }

      case "characterGuides": {
        const guides = getArr<CharacterGuide>("characterGuides");
        const activeChar = universeChars.find((c: any) => c.name === selectedCharName);
        const existingGuide = guides.find((g: CharacterGuide) => g.characterName === selectedCharName);
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Select a character from your universe to define their speaking style, background lore, and faith integration.</p>

            {/* Universe character picker */}
            {universeChars.length === 0 ? (
              <div className="text-center py-6 border rounded-xl">
                <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No characters found in this universe.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {universeChars.map((c: any) => {
                  const hasGuide = guides.some((g: CharacterGuide) => g.characterName === c.name);
                  return (
                    <button key={c.id || c._id}
                      onClick={() => {
                        setSelectedCharName(c.name);
                        if (!hasGuide) {
                          setNewCharGuide({ ...newCharGuide, characterName: c.name });
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                        selectedCharName === c.name
                          ? "bg-emerald-100 border-emerald-400 text-emerald-800"
                          : "bg-muted/50 border-border hover:border-emerald-300 text-muted-foreground hover:text-foreground"
                      )}>
                      {hasGuide && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                      {c.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Existing guide summary */}
            {existingGuide && (
              <div className="border rounded-xl p-3 bg-emerald-50 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-emerald-800">{existingGuide.characterName} — guide saved</p>
                  <Button variant="ghost" size="sm" className="text-destructive h-6 px-2"
                    onClick={() => { save({ characterGuides: guides.filter((g: CharacterGuide) => g.characterName !== selectedCharName) } as any); setSelectedCharName(""); }}>
                    <Trash2 className="w-3 h-3 mr-1" /> Remove
                  </Button>
                </div>
                {existingGuide.speakingStyle && <p className="text-xs text-emerald-700">Style: {existingGuide.speakingStyle}</p>}
                {existingGuide.literaryRole && <p className="text-xs text-emerald-700">Role: {existingGuide.literaryRole}</p>}
              </div>
            )}

            {/* Add/edit form — only when a character is selected and has no guide yet */}
            {selectedCharName && !existingGuide && (
              <div className="border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Guide for {selectedCharName}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <Label className="text-xs">Speaking Style</Label>
                    <Input placeholder="e.g. Fast, buzzing, excitable — short fragmented lines"
                      value={newCharGuide.speakingStyle} onChange={e => setNewCharGuide({ ...newCharGuide, speakingStyle: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">More Info / Background Lore</Label>
                    <Textarea rows={2} className="resize-none text-xs"
                      placeholder="Extended background, personality depth, story role..."
                      value={newCharGuide.moreInfo} onChange={e => setNewCharGuide({ ...newCharGuide, moreInfo: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Literary Role</Label>
                    <Input placeholder="e.g. Carries theme of Truth vs Comfort across series"
                      value={newCharGuide.literaryRole} onChange={e => setNewCharGuide({ ...newCharGuide, literaryRole: e.target.value })} />
                  </div>
                </div>

                <TagInput label="Dialogue Examples" items={newCharGuide.dialogueExamples}
                  placeholder={`e.g. "I knew this would work!"`}
                  onAdd={v => setNewCharGuide({ ...newCharGuide, dialogueExamples: [...newCharGuide.dialogueExamples, v] })}
                  onRemove={i => setNewCharGuide({ ...newCharGuide, dialogueExamples: newCharGuide.dialogueExamples.filter((_, j) => j !== i) })} />
                <TagInput label="Personality Notes" items={newCharGuide.personalityNotes}
                  placeholder="e.g. Skeptical but morally rooted"
                  onAdd={v => setNewCharGuide({ ...newCharGuide, personalityNotes: [...newCharGuide.personalityNotes, v] })}
                  onRemove={i => setNewCharGuide({ ...newCharGuide, personalityNotes: newCharGuide.personalityNotes.filter((_, j) => j !== i) })} />

                <div className="border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Faith Guide</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Faith Tone</Label>
                      <Input placeholder="e.g. Reflective & questioning / Joyful & imitative"
                        value={newCharGuide.faithTone} onChange={e => setNewCharGuide({ ...newCharGuide, faithTone: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Du'a Style</Label>
                      <Input placeholder="e.g. Whispered in solitude under pressure"
                        value={newCharGuide.duaStyle} onChange={e => setNewCharGuide({ ...newCharGuide, duaStyle: e.target.value })} />
                    </div>
                  </div>
                  <TagInput label="Islamic Traits" items={newCharGuide.islamicTraits}
                    placeholder="e.g. Patient, grateful, honest"
                    onAdd={v => setNewCharGuide({ ...newCharGuide, islamicTraits: [...newCharGuide.islamicTraits, v] })}
                    onRemove={i => setNewCharGuide({ ...newCharGuide, islamicTraits: newCharGuide.islamicTraits.filter((_, j) => j !== i) })} />
                  <TagInput label="Faith Expressions" items={newCharGuide.faithExpressions}
                    placeholder="e.g. Copies parent's wudhu without being asked"
                    onAdd={v => setNewCharGuide({ ...newCharGuide, faithExpressions: [...newCharGuide.faithExpressions, v] })}
                    onRemove={i => setNewCharGuide({ ...newCharGuide, faithExpressions: newCharGuide.faithExpressions.filter((_, j) => j !== i) })} />
                  <TagInput label="Faith Dialogue Examples" items={newCharGuide.faithExamples}
                    placeholder={`e.g. "Allah can see us? Right now? Even in the dark?!"`}
                    onAdd={v => setNewCharGuide({ ...newCharGuide, faithExamples: [...newCharGuide.faithExamples, v] })}
                    onRemove={i => setNewCharGuide({ ...newCharGuide, faithExamples: newCharGuide.faithExamples.filter((_, j) => j !== i) })} />
                </div>

                <Button variant="outline" size="sm" disabled={!selectedCharName || updateMutation.isPending}
                  onClick={() => {
                    const { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples, ...rest } = newCharGuide;
                    save({ characterGuides: [...guides, { ...rest, characterName: selectedCharName, faithGuide: { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples } }] } as any);
                    setNewCharGuide({ characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "", personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [], duaStyle: "", islamicTraits: [], faithExamples: [] });
                    setSelectedCharName("");
                  }}>
                  <Plus className="w-4 h-4 mr-1" /> Save Guide for {selectedCharName}
                </Button>
              </div>
            )}
          </div>
        );
      }

      default: return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeWorkflowDef  = WORKFLOWS.find(w => w.id === activeWorkflow);
  const currentSections    = SECTIONS.filter(s => activeWorkflowDef?.sections.includes(s.id as any));
  const FULL_WIDTH_SECTIONS = new Set(["characterGuides", "backgroundSettings", "bookFormatting", "underSixDesign", "coverDesign"]);

  return (
    <AppLayout
      title="Knowledge Base"
      subtitle="Define the universe rules that shape every story, chapter, and illustration"
      actions={
        <Button variant="hero" onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />New Knowledge Base
        </Button>
      }
    >
      {/* ── KB Pill Bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 flex-1 overflow-x-auto pb-0.5 min-w-0">
          {isLoading ? (
            <div className="flex items-center gap-2 py-1 px-1">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : (
            filteredKBs.map((kb: KnowledgeBase) => {
              const isSelected = selectedKB?.id === kb.id;
              return (
                <button
                  key={kb.id}
                  onClick={() => { setSelectedKB(kb); kbNav.setKbNav("faith", "islamicValues"); setNewItem(""); setCollapsedSections(new Set()); }}
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all shrink-0",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  <BookMarked className="w-3.5 h-3.5 shrink-0" />
                  {kb.name}
                  {isSelected && (
                    <span
                      role="button"
                      onClick={e => { e.stopPropagation(); setShowDelete(kb.id); }}
                      className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="relative shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 w-44 text-sm"
          />
        </div>
      </div>

      {/* ── No KB empty state ───────────────────────────────────────────────── */}
      {!selectedKB && !isLoading && (
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-muted-foreground/20 p-16 text-center flex flex-col items-center justify-center min-h-[480px] bg-gradient-to-br from-violet-50/50 via-background to-pink-50/30">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center mb-5 shadow-sm">
            <Database className="w-9 h-9 text-violet-400" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Knowledge Base Selected</h3>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">
            Create a knowledge base to define Islamic values, du'as, character voices, backgrounds, book format, and cover design rules for your universe.
          </p>
          <Button variant="hero" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-2" />Create First Knowledge Base
          </Button>
          <div className="flex gap-2 mt-6 flex-wrap justify-center">
            {["🕌 Islamic Values", "🤲 Du'as", "🗣️ Character Voice", "🏞️ Background", "📖 Book Format", "🎨 Cover Design"].map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── KB Content ──────────────────────────────────────────────────────── */}
      {selectedKB && (
        <>
          {/* KB identity strip */}
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl border bg-gradient-to-r from-primary/5 via-violet-50/30 to-pink-50/20 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-200/60 flex items-center justify-center shadow-sm shrink-0">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold leading-tight truncate">{selectedKB.name}</h2>
              <p className="text-xs text-muted-foreground">Updated {new Date(selectedKB.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <span className="font-semibold text-violet-600">{selectedKB.islamicValues.length}</span> values ·{" "}
              <span className="font-semibold text-blue-600">{selectedKB.duas.length}</span> du'as ·{" "}
              <span className="font-semibold text-orange-600">{selectedKB.vocabulary.length}</span> words
            </div>
          </div>

          {/* Workflow tabs */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl mb-6 w-fit flex-wrap">
            {WORKFLOWS.map(wf => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(wf.id as WorkflowId)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeWorkflow === wf.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {wf.label}
              </button>
            ))}
          </div>

          {/* Section cards grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {currentSections.map(sec => {
              const style      = SECTION_STYLE[sec.id];
              const Icon       = sec.icon;
              const count      = getSectionCount(sec.id);
              const isCollapsed = collapsedSections.has(sec.id);
              const isFullWidth = FULL_WIDTH_SECTIONS.has(sec.id);

              return (
                <div
                  key={sec.id}
                  className={cn(
                    "rounded-2xl border overflow-hidden bg-card shadow-sm",
                    isFullWidth && "xl:col-span-2"
                  )}
                >
                  {/* Card header — click to collapse */}
                  <button
                    onClick={() => toggleCollapse(sec.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-5 py-4 transition-colors text-left",
                      style.bg,
                      isCollapsed ? "" : "border-b " + style.border
                    )}
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.iconBg)}>
                      <Icon className={cn("w-4 h-4", sec.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold", style.text)}>{sec.label}</p>
                      <p className="text-xs text-muted-foreground leading-tight truncate">
                        {WORKFLOWS.find(w => w.sections.includes(sec.id as any))?.description}
                      </p>
                    </div>
                    {count > 0 && (
                      <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0", style.iconBg, style.text)}>
                        {count}
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                        isCollapsed && "-rotate-90"
                      )}
                    />
                  </button>

                  {/* Card body */}
                  {!isCollapsed && (
                    <div className="p-5">
                      {renderSectionContent(sec.id as SectionId)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}


      {/* ── Create Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>Set up the foundational rules for your universe. Add themes, tone guides, dialogue profiles, and literary devices after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g., Zubair Universe — Full KB" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                onKeyDown={e => { if (e.key === "Enter") handleCreate(); }} />
            </div>
            <div className="space-y-2">
              <Label>Universe *</Label>
              <Select value={form.universeId} onValueChange={v => setForm({ ...form, universeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select a universe..." /></SelectTrigger>
                <SelectContent>
                  {universes.map((u: any) => (
                    <SelectItem key={u.id || u._id} value={u.id || u._id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Characters from this universe will appear in the Char. Voice tab.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ─────────────────────────────────────────────────── */}
      <Dialog open={!!showDelete} onOpenChange={open => !open && setShowDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Knowledge Base?</DialogTitle>
            <DialogDescription>This removes all themes, tone guides, dialogue profiles, literary devices, and rules. Cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => showDelete && handleDelete(showDelete)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}