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
  Plus, Search, Trash2, BookOpen, Shield, Type, Palette, Settings,
  X, Loader2, Database, Mic2, Feather, Heart, Eye, Users,
  Mountain, Sparkles, BookMarked, Lightbulb, Image, MessageSquare,
  BookText, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useKnowledgeBases, useCreateKnowledgeBase, useUpdateKnowledgeBase, useDeleteKnowledgeBase,
} from "@/hooks/useKnowledgeBase";
import type { KnowledgeBase } from "@/lib/api/types";
import { useSearchParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Theme {
  name: string;
  coreConflict: string;
  emotionalBeat: string;
  anchorSymbol: string;
}

interface AgeGroupGuide {
  ageGroup: string;
  tone: string;
  techniques: string[];
  examples: string[];
  avoid: string[];
}

interface BackgroundGuide {
  series: string;
  tone: string;
  locations: string[];
  style: string;
  keyFeatures: string[];
  avoid: string[];
}

interface DialogueGuide {
  subject: string;
  subjectType: 'ageGroup' | 'character';
  rules: string[];
  examples: string[];
  avoid: string[];
}

interface LiteraryDevice {
  type: 'metaphor' | 'symbol' | 'technique' | 'device';
  name: string;
  meaning: string;
  example: string;
  series: string;
}

interface CharacterGroup {
  code: string;
  name: string;
  role: string;
  background: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  fitrahNotes: string;
  appearance: string;
  loraTag: string;
  samplePrompt: string;
}

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
  { id: "islamicValues",    label: "Islamic Values",    icon: Shield,        color: "text-violet-600",  group: "Core"   },
  { id: "duas",             label: "Du'as",             icon: BookOpen,      color: "text-blue-600",    group: "Core"   },
  { id: "vocabulary",       label: "Vocabulary",        icon: Type,          color: "text-orange-600",  group: "Core"   },
  { id: "avoidTopics",      label: "Avoid Topics",      icon: X,             color: "text-red-500",     group: "Core"   },
  { id: "themes",           label: "Story Themes",      icon: Sparkles,      color: "text-yellow-600",  group: "Story"  },
  { id: "toneSpectrum",     label: "Tone & Voice",      icon: Mic2,          color: "text-pink-600",    group: "Story"  },
  { id: "dialogueGuides",   label: "Dialogue",          icon: MessageSquare, color: "text-purple-600",  group: "Story"  },
  { id: "faithIntegration", label: "Faith",             icon: Heart,         color: "text-rose-600",    group: "Story"  },
  { id: "literaryDevices",  label: "Literary",          icon: Feather,       color: "text-indigo-600",  group: "Story"  },
  { id: "backgroundGuides", label: "Backgrounds",       icon: Mountain,      color: "text-teal-600",    group: "Visual" },
  { id: "coverDesign",      label: "Cover Design",      icon: Palette,       color: "text-rose-600",    group: "Visual" },
  { id: "illustrationRules",label: "Illustrations",     icon: Image,         color: "text-cyan-600",    group: "Visual" },
  { id: "characterGroups",  label: "Char. Groups",      icon: Users,         color: "text-green-600",   group: "Visual" },
  { id: "characterGuides",  label: "Char. Voice",       icon: Mic2,          color: "text-emerald-600", group: "Visual" },
  { id: "bookStructures",   label: "Book Structure",    icon: BookText,      color: "text-amber-600",   group: "Format" },
  { id: "underSixDesign",   label: "Under-6 Design",    icon: Eye,           color: "text-lime-600",    group: "Format" },
  { id: "customRules",      label: "Custom Rules",      icon: Settings,      color: "text-slate-600",   group: "Format" },
] as const;

type SectionId = typeof SECTIONS[number]["id"];
const GROUPS = ["Core", "Story", "Visual", "Format"] as const;

// Per-section color tokens (bg + icon background)
const SECTION_STYLE: Record<string, { bg: string; iconBg: string; border: string; text: string }> = {
  islamicValues:    { bg: "bg-violet-50",  iconBg: "bg-violet-100",  border: "border-violet-200",  text: "text-violet-700"  },
  duas:             { bg: "bg-blue-50",    iconBg: "bg-blue-100",    border: "border-blue-200",    text: "text-blue-700"    },
  vocabulary:       { bg: "bg-orange-50",  iconBg: "bg-orange-100",  border: "border-orange-200",  text: "text-orange-700"  },
  avoidTopics:      { bg: "bg-red-50",     iconBg: "bg-red-100",     border: "border-red-200",     text: "text-red-700"     },
  themes:           { bg: "bg-yellow-50",  iconBg: "bg-yellow-100",  border: "border-yellow-200",  text: "text-yellow-700"  },
  toneSpectrum:     { bg: "bg-pink-50",    iconBg: "bg-pink-100",    border: "border-pink-200",    text: "text-pink-700"    },
  dialogueGuides:   { bg: "bg-purple-50",  iconBg: "bg-purple-100",  border: "border-purple-200",  text: "text-purple-700"  },
  faithIntegration: { bg: "bg-rose-50",    iconBg: "bg-rose-100",    border: "border-rose-200",    text: "text-rose-700"    },
  literaryDevices:  { bg: "bg-indigo-50",  iconBg: "bg-indigo-100",  border: "border-indigo-200",  text: "text-indigo-700"  },
  backgroundGuides: { bg: "bg-teal-50",    iconBg: "bg-teal-100",    border: "border-teal-200",    text: "text-teal-700"    },
  coverDesign:      { bg: "bg-rose-50",    iconBg: "bg-rose-100",    border: "border-rose-200",    text: "text-rose-700"    },
  illustrationRules:{ bg: "bg-cyan-50",    iconBg: "bg-cyan-100",    border: "border-cyan-200",    text: "text-cyan-700"    },
  characterGroups:  { bg: "bg-green-50",   iconBg: "bg-green-100",   border: "border-green-200",   text: "text-green-700"   },
  characterGuides:  { bg: "bg-emerald-50", iconBg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700" },
  bookStructures:   { bg: "bg-amber-50",   iconBg: "bg-amber-100",   border: "border-amber-200",   text: "text-amber-700"   },
  underSixDesign:   { bg: "bg-lime-50",    iconBg: "bg-lime-100",    border: "border-lime-200",    text: "text-lime-700"    },
  customRules:      { bg: "bg-slate-50",   iconBg: "bg-slate-100",   border: "border-slate-200",   text: "text-slate-700"   },
};

const GROUP_PILL: Record<string, string> = {
  Core:   "bg-violet-100 text-violet-700",
  Story:  "bg-pink-100 text-pink-700",
  Visual: "bg-teal-100 text-teal-700",
  Format: "bg-amber-100 text-amber-700",
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
  const universeId = searchParams.get("universeId") || undefined;

  const [search, setSearch]             = useState("");
  const [selectedKB, setSelectedKB]     = useState<KnowledgeBase | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("islamicValues");
  const [showCreate, setShowCreate]     = useState(false);
  const [showDelete, setShowDelete]     = useState<string | null>(null);
  const [newItem, setNewItem]           = useState("");

  // Structured new-item states
  const [newDua, setNewDua]             = useState({ arabic: "", transliteration: "", meaning: "", when: "" });
  const [newVocab, setNewVocab]         = useState({ word: "", definition: "", example: "" });
  const [newTheme, setNewTheme]         = useState<Theme>({ name: "", coreConflict: "", emotionalBeat: "", anchorSymbol: "" });
  const [newDevice, setNewDevice]       = useState<LiteraryDevice>({ type: "metaphor", name: "", meaning: "", example: "", series: "All" });
  const [newGroup, setNewGroup]         = useState<CharacterGroup>({ code: "", name: "", role: "", background: "", traits: [], strengths: [], weaknesses: [], fitrahNotes: "", appearance: "", loraTag: "", samplePrompt: "" });
  const [newStructure, setNewStructure] = useState<BookStructure>({ type: "activity", ageGroup: "5-8", title: "", description: "", pageTypes: [], chapterFlow: [], toneNotes: "", faithAnchors: [], avoid: [] });

  // Age-group guide shared state — reused across toneSpectrum, faithIntegration
  const [newAgeGuide, setNewAgeGuide]   = useState<AgeGroupGuide>({ ageGroup: "Junior (5–8)", tone: "", techniques: [], examples: [], avoid: [] });
  const [newBgGuide, setNewBgGuide]     = useState<BackgroundGuide>({ series: "Junior (5–8)", tone: "", locations: [], style: "", keyFeatures: [], avoid: [] });
  const [newDialogue, setNewDialogue]   = useState<DialogueGuide>({ subject: "", subjectType: "ageGroup", rules: [], examples: [], avoid: [] });

  // New section states
  const [newCharGuide, setNewCharGuide] = useState<CharacterGuide>({
    characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "",
    personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [],
    duaStyle: "", islamicTraits: [], faithExamples: [],
  });
  const [newCoverDesign, setNewCoverDesign] = useState<CoverDesignState>({
    brandingRules: [], titlePlacement: "", characterComposition: [],
    atmosphereMiddleGrade: "", atmosphereJunior: "", atmosphereSaeeda: "",
    typographyMiddleGrade: "", typographyJunior: "",
    optionalAddons: [], islamicMotifs: [], avoidCover: [], extraNotes: "",
  });
  const [newUnderSix, setNewUnderSix] = useState<UnderSixDesignState>({
    maxWordsPerSpread: 10, pageLayout: "", fontStyle: "", fontPreferences: [],
    reflectionPrompt: "", bonusPageContent: "", illustrationStyle: "",
    colorPalette: "", specialRules: [],
  });

  // Create form
  const [form, setForm] = useState({ name: "", islamicValues: "", illustrationRules: "", avoidTopics: "", customRules: "" });

  const updateMutation = useUpdateKnowledgeBase(selectedKB?.id || "");
  const filteredKBs = kbs.filter((kb: KnowledgeBase) => kb.name.toLowerCase().includes(search.toLowerCase()));

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
    try {
      const created = await createMutation.mutateAsync({
        name: form.name.trim(), universeId,
        islamicValues: form.islamicValues.split("\n").filter(Boolean),
        illustrationRules: form.illustrationRules.split("\n").filter(Boolean),
        avoidTopics: form.avoidTopics.split("\n").filter(Boolean),
        customRules: form.customRules || undefined,
      });
      toast({ title: "Knowledge base created" });
      setShowCreate(false);
      setForm({ name: "", islamicValues: "", illustrationRules: "", avoidTopics: "", customRules: "" });
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

  // ─── Section renderers ────────────────────────────────────────────────────

  const renderSection = () => {
    if (!selectedKB) return null;

    switch (activeSection) {

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

      case "themes": {
        const themes = getArr<Theme>("themes");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Story themes. AI picks from these when building outlines and chapter conflicts.</p>
            <ScrollArea className="h-44"><div className="space-y-2">
              {themes.map((t, i) => (
                <ItemRow key={i}
                  text={`Conflict: ${t.coreConflict}\nEmotional beat: ${t.emotionalBeat}\nAnchor symbol: ${t.anchorSymbol}`}
                  badge={t.name}
                  onRemove={() => save({ themes: themes.filter((_, j) => j !== i) } as any)} />
              ))}
              {!themes.length && <p className="text-sm text-muted-foreground text-center py-6">No themes yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Theme</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><Label className="text-xs">Theme Name *</Label><Input placeholder="Truth vs Comfort" value={newTheme.name} onChange={e => setNewTheme({ ...newTheme, name: e.target.value })} /></div>
                <div><Label className="text-xs">Core Conflict *</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Telling the truth even when it hurts" value={newTheme.coreConflict} onChange={e => setNewTheme({ ...newTheme, coreConflict: e.target.value })} /></div>
                <div><Label className="text-xs">Emotional Beat</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Risking disappointment to stay honest" value={newTheme.emotionalBeat} onChange={e => setNewTheme({ ...newTheme, emotionalBeat: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Anchor Symbol (used in illustrations too)</Label><Input placeholder="Locked box, mirror, confession letter" value={newTheme.anchorSymbol} onChange={e => setNewTheme({ ...newTheme, anchorSymbol: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newTheme.name || !newTheme.coreConflict || updateMutation.isPending}
                onClick={() => { save({ themes: [...themes, { ...newTheme }] } as any); setNewTheme({ name: "", coreConflict: "", emotionalBeat: "", anchorSymbol: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Theme
              </Button>
            </div>
          </div>
        );
      }

      case "toneSpectrum": {
        const guides = getArr<AgeGroupGuide>("toneSpectrum");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tone and narrative voice per age group. AI matches this when writing story, chapters, and humanize stages.</p>
            <ScrollArea className="h-44"><div className="space-y-2">
              {guides.map((g, i) => (
                <ItemRow key={i} badge={g.ageGroup}
                  text={`Tone: ${g.tone}${g.techniques?.length ? "\nTechniques: " + g.techniques.join(" · ") : ""}${g.examples?.length ? "\nExamples: " + g.examples.slice(0, 2).map(e => `"${e}"`).join(" / ") : ""}`}
                  onRemove={() => save({ toneSpectrum: guides.filter((_, j) => j !== i) } as any)} />
              ))}
              {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No tone guides yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Tone Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age Group *</Label><Input placeholder="Junior (5–8) / Middle Grade (8–13) / Saeeda Series" value={newAgeGuide.ageGroup} onChange={e => setNewAgeGuide({ ...newAgeGuide, ageGroup: e.target.value })} /></div>
                <div><Label className="text-xs">Tone Style *</Label><Input placeholder="Gentle, playful, emotionally safe" value={newAgeGuide.tone} onChange={e => setNewAgeGuide({ ...newAgeGuide, tone: e.target.value })} /></div>
              </div>
              <TagInput label="Narrative Techniques" items={newAgeGuide.techniques}
                placeholder="e.g. Repetition for rhythm"
                onAdd={v => setNewAgeGuide({ ...newAgeGuide, techniques: [...newAgeGuide.techniques, v] })}
                onRemove={i => setNewAgeGuide({ ...newAgeGuide, techniques: newAgeGuide.techniques.filter((_, j) => j !== i) })} />
              <TagInput label="Dialogue Examples" items={newAgeGuide.examples}
                placeholder={`e.g. "Mama always knows!"`}
                onAdd={v => setNewAgeGuide({ ...newAgeGuide, examples: [...newAgeGuide.examples, v] })}
                onRemove={i => setNewAgeGuide({ ...newAgeGuide, examples: newAgeGuide.examples.filter((_, j) => j !== i) })} />
              <TagInput label="Avoid for This Age" items={newAgeGuide.avoid}
                placeholder="e.g. Slang, adult logic, long monologues"
                onAdd={v => setNewAgeGuide({ ...newAgeGuide, avoid: [...newAgeGuide.avoid, v] })}
                onRemove={i => setNewAgeGuide({ ...newAgeGuide, avoid: newAgeGuide.avoid.filter((_, j) => j !== i) })} />
              <Button variant="outline" size="sm" disabled={!newAgeGuide.ageGroup || !newAgeGuide.tone || updateMutation.isPending}
                onClick={() => { save({ toneSpectrum: [...guides, { ...newAgeGuide }] } as any); setNewAgeGuide({ ageGroup: "Junior (5–8)", tone: "", techniques: [], examples: [], avoid: [] }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Tone Guide
              </Button>
            </div>
          </div>
        );
      }

      case "dialogueGuides": {
        const guides = getArr<DialogueGuide>("dialogueGuides");
        const ageGuides = guides.filter(g => g.subjectType === 'ageGroup');
        const charGuides = guides.filter(g => g.subjectType === 'character');
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How characters speak — both per age group and for named characters like Zuzu, Basha, Noura-Bee. AI uses this verbatim when writing dialogue.</p>
            {ageGuides.length > 0 && (
              <div>
                <SectionLabel>Age Group Dialogue Rules</SectionLabel>
                <div className="space-y-2">
                  {ageGuides.map((g, i) => (
                    <ItemRow key={i} badge={g.subject}
                      text={`${g.rules?.slice(0,2).join(" · ")}${g.examples?.length ? "\n" + g.examples.slice(0,2).map((e: string) => `"${e}"`).join(" / ") : ""}`}
                      onRemove={() => save({ dialogueGuides: guides.filter(x => x !== g) } as any)} />
                  ))}
                </div>
              </div>
            )}
            {charGuides.length > 0 && (
              <div>
                <SectionLabel>Character Voice Profiles</SectionLabel>
                <div className="space-y-2">
                  {charGuides.map((g, i) => (
                    <ItemRow key={i} badge={g.subject}
                      text={`${g.rules?.slice(0,1).join(" · ")}${g.examples?.length ? "\n" + g.examples.slice(0,2).map((e: string) => `"${e}"`).join(" / ") : ""}`}
                      onRemove={() => save({ dialogueGuides: guides.filter(x => x !== g) } as any)} />
                  ))}
                </div>
              </div>
            )}
            {!guides.length && <p className="text-sm text-muted-foreground text-center py-4">No dialogue guides yet.</p>}
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Dialogue Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={newDialogue.subjectType} onValueChange={(v: any) => setNewDialogue({ ...newDialogue, subjectType: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ageGroup">Age Group Rule</SelectItem>
                      <SelectItem value="character">Named Character Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">{newDialogue.subjectType === 'character' ? 'Character Name *' : 'Age Group *'}</Label>
                  <Input placeholder={newDialogue.subjectType === 'character' ? "Zuzu / Basha / Noura-Bee" : "Junior (5–8)"}
                    value={newDialogue.subject} onChange={e => setNewDialogue({ ...newDialogue, subject: e.target.value })} />
                </div>
              </div>
              <TagInput label="Speech Rules / Traits" items={newDialogue.rules}
                placeholder="e.g. Short, clipped, buzzing with excitement"
                onAdd={v => setNewDialogue({ ...newDialogue, rules: [...newDialogue.rules, v] })}
                onRemove={i => setNewDialogue({ ...newDialogue, rules: newDialogue.rules.filter((_, j) => j !== i) })} />
              <TagInput label="Voice Examples (exact dialogue)" items={newDialogue.examples}
                placeholder={`e.g. Zoom-zoom-Zuzu's on it!`}
                onAdd={v => setNewDialogue({ ...newDialogue, examples: [...newDialogue.examples, v] })}
                onRemove={i => setNewDialogue({ ...newDialogue, examples: newDialogue.examples.filter((_, j) => j !== i) })} />
              <TagInput label="Never Say / Avoid" items={newDialogue.avoid}
                placeholder="e.g. Complex theology, adult sarcasm"
                onAdd={v => setNewDialogue({ ...newDialogue, avoid: [...newDialogue.avoid, v] })}
                onRemove={i => setNewDialogue({ ...newDialogue, avoid: newDialogue.avoid.filter((_, j) => j !== i) })} />
              <Button variant="outline" size="sm" disabled={!newDialogue.subject || updateMutation.isPending}
                onClick={() => { save({ dialogueGuides: [...guides, { ...newDialogue }] } as any); setNewDialogue({ subject: "", subjectType: "ageGroup", rules: [], examples: [], avoid: [] }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Dialogue Guide
              </Button>
            </div>
          </div>
        );
      }

      case "faithIntegration": {
        const guides = getArr<AgeGroupGuide>("faithIntegration");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How faith is embedded per age group. AI calibrates how Islamic content is woven into story and humanize stages.</p>
            <ScrollArea className="h-44"><div className="space-y-2">
              {guides.map((g, i) => (
                <ItemRow key={i} badge={g.ageGroup}
                  text={`Tone: ${g.tone}${g.techniques?.length ? "\nMethods: " + g.techniques.slice(0,2).join(" · ") : ""}${g.examples?.length ? "\n" + g.examples.slice(0,1).map(e => `"${e}"`).join("") : ""}`}
                  onRemove={() => save({ faithIntegration: guides.filter((_, j) => j !== i) } as any)} />
              ))}
              {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No faith guides yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Faith Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age Group *</Label><Input placeholder="Junior (5–8)" value={newAgeGuide.ageGroup} onChange={e => setNewAgeGuide({ ...newAgeGuide, ageGroup: e.target.value })} /></div>
                <div><Label className="text-xs">Tone *</Label><Input placeholder="Joyful, safe, filled with love of Allah" value={newAgeGuide.tone} onChange={e => setNewAgeGuide({ ...newAgeGuide, tone: e.target.value })} /></div>
              </div>
              <TagInput label="Integration Methods" items={newAgeGuide.techniques}
                placeholder="e.g. Faith shown through habits"
                onAdd={v => setNewAgeGuide({ ...newAgeGuide, techniques: [...newAgeGuide.techniques, v] })}
                onRemove={i => setNewAgeGuide({ ...newAgeGuide, techniques: newAgeGuide.techniques.filter((_, j) => j !== i) })} />
              <TagInput label="Story Examples" items={newAgeGuide.examples}
                placeholder={`e.g. "Allah loves when we share," she whispered.`}
                onAdd={v => setNewAgeGuide({ ...newAgeGuide, examples: [...newAgeGuide.examples, v] })}
                onRemove={i => setNewAgeGuide({ ...newAgeGuide, examples: newAgeGuide.examples.filter((_, j) => j !== i) })} />
              <Button variant="outline" size="sm" disabled={!newAgeGuide.ageGroup || !newAgeGuide.tone || updateMutation.isPending}
                onClick={() => { save({ faithIntegration: [...guides, { ...newAgeGuide }] } as any); setNewAgeGuide({ ageGroup: "Junior (5–8)", tone: "", techniques: [], examples: [], avoid: [] }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Faith Guide
              </Button>
            </div>
          </div>
        );
      }

      case "literaryDevices": {
        const devices = getArr<LiteraryDevice>("literaryDevices");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Metaphors, symbols, and narrative techniques. AI uses these to create layered storytelling — matched to the book's age range.</p>
            <ScrollArea className="h-44"><div className="space-y-2">
              {devices.map((d, i) => (
                <ItemRow key={i} badge={`${d.type}${d.series && d.series !== 'All' ? ' · ' + d.series : ''}`}
                  text={`${d.name} = ${d.meaning}${d.example ? "\nExample: \"" + d.example + "\"" : ""}`}
                  onRemove={() => save({ literaryDevices: devices.filter((_, j) => j !== i) } as any)} />
              ))}
              {!devices.length && <p className="text-sm text-muted-foreground text-center py-6">No devices yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Device</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Type *</Label>
                  <Select value={newDevice.type} onValueChange={(v: any) => setNewDevice({ ...newDevice, type: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metaphor">Metaphor (Natural World)</SelectItem>
                      <SelectItem value="symbol">Symbol Anchor</SelectItem>
                      <SelectItem value="technique">Narrative Technique</SelectItem>
                      <SelectItem value="device">Literary Device</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Series</Label>
                  <Select value={newDevice.series} onValueChange={v => setNewDevice({ ...newDevice, series: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Series</SelectItem>
                      <SelectItem value="Junior">Junior (5–8)</SelectItem>
                      <SelectItem value="Middle Grade">Middle Grade (8–13)</SelectItem>
                      <SelectItem value="Saeeda Series">Saeeda Series</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Name *</Label><Input placeholder="Puddle / Broken Compass / Repetition" value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} /></div>
                <div><Label className="text-xs">Meaning / Function *</Label><Input placeholder="Temporary fear or reflection" value={newDevice.meaning} onChange={e => setNewDevice({ ...newDevice, meaning: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Story Example</Label><Input placeholder="Saeeda stared at the puddle — it showed her what she feared" value={newDevice.example} onChange={e => setNewDevice({ ...newDevice, example: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newDevice.name || !newDevice.meaning || updateMutation.isPending}
                onClick={() => { save({ literaryDevices: [...devices, { ...newDevice }] } as any); setNewDevice({ type: "metaphor", name: "", meaning: "", example: "", series: "All" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Device
              </Button>
            </div>
          </div>
        );
      }

      case "backgroundGuides": {
        const guides = getArr<BackgroundGuide>("backgroundGuides");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Background environment rules per series. Injected directly into every image generation prompt.</p>
            <ScrollArea className="h-44"><div className="space-y-2">
              {guides.map((g, i) => (
                <ItemRow key={i} badge={g.series}
                  text={`${g.style ? "Style: " + g.style : ""}${g.locations?.length ? "\nLocations: " + g.locations.slice(0,3).join(", ") : ""}${g.keyFeatures?.length ? "\nKey: " + g.keyFeatures.slice(0,2).join(" · ") : ""}`}
                  onRemove={() => save({ backgroundGuides: guides.filter((_, j) => j !== i) } as any)} />
              ))}
              {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No background guides yet.</p>}
            </div></ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Background Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Series *</Label><Input placeholder="Junior (5–8) / Saeeda Series" value={newBgGuide.series} onChange={e => setNewBgGuide({ ...newBgGuide, series: e.target.value })} /></div>
                <div><Label className="text-xs">Visual Style</Label><Input placeholder="Soft palettes, round shapes, gentle shadows" value={newBgGuide.style} onChange={e => setNewBgGuide({ ...newBgGuide, style: e.target.value })} /></div>
                <div><Label className="text-xs">Mood Tone</Label><Input placeholder="Bright, safe, familiar" value={newBgGuide.tone} onChange={e => setNewBgGuide({ ...newBgGuide, tone: e.target.value })} /></div>
              </div>
              <TagInput label="Locations" items={newBgGuide.locations}
                placeholder="e.g. bedroom, masjid hallway, garden"
                onAdd={v => setNewBgGuide({ ...newBgGuide, locations: [...newBgGuide.locations, v] })}
                onRemove={i => setNewBgGuide({ ...newBgGuide, locations: newBgGuide.locations.filter((_, j) => j !== i) })} />
              <TagInput label="Key Visual Features" items={newBgGuide.keyFeatures}
                placeholder="e.g. Clear foreground/background contrast"
                onAdd={v => setNewBgGuide({ ...newBgGuide, keyFeatures: [...newBgGuide.keyFeatures, v] })}
                onRemove={i => setNewBgGuide({ ...newBgGuide, keyFeatures: newBgGuide.keyFeatures.filter((_, j) => j !== i) })} />
              <TagInput label="Avoid" items={newBgGuide.avoid}
                placeholder="e.g. Abstract patterns, empty gradients"
                onAdd={v => setNewBgGuide({ ...newBgGuide, avoid: [...newBgGuide.avoid, v] })}
                onRemove={i => setNewBgGuide({ ...newBgGuide, avoid: newBgGuide.avoid.filter((_, j) => j !== i) })} />
              <Button variant="outline" size="sm" disabled={!newBgGuide.series || updateMutation.isPending}
                onClick={() => { save({ backgroundGuides: [...guides, { ...newBgGuide }] } as any); setNewBgGuide({ series: "Junior (5–8)", tone: "", locations: [], style: "", keyFeatures: [], avoid: [] }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Background Guide
              </Button>
            </div>
          </div>
        );
      }

      case "illustrationRules": {
        const items = getArr<string>("illustrationRules");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Global illustration style rules — injected into every image generation prompt regardless of age or scene.</p>
            <ScrollArea className="h-52"><div className="space-y-2">
              {items.map((v, i) => <ItemRow key={i} text={v} onRemove={() => save({ illustrationRules: items.filter((_, j) => j !== i) })} />)}
              {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No illustration rules yet.</p>}
            </div></ScrollArea>
            <AddRow placeholder="e.g. All clothing must be loose and modest at all times" value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ illustrationRules: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      case "characterGroups": {
        const groups = getArr<CharacterGroup>("characterGroups");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Supporting character groups. Traits and voice inject into text prompts; appearance and LoRA tag inject into image prompts.</p>
            <ScrollArea className="h-44">
              <Accordion type="single" collapsible className="space-y-1">
                {groups.map((g, i) => (
                  <AccordionItem key={i} value={String(i)} className="border rounded-lg px-3">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-xs">{g.code}</Badge>
                        <span>{g.name}</span>
                        {g.loraTag && <Badge variant="secondary" className="text-xs">LoRA: {g.loraTag}</Badge>}
                        <span className="text-xs text-muted-foreground">— {g.role}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs space-y-1.5 pb-3">
                      {g.background && <p><strong>Background:</strong> {g.background}</p>}
                      {g.traits?.length > 0 && <p><strong>Traits:</strong> {g.traits.join(", ")}</p>}
                      {g.strengths?.length > 0 && <p><strong>Strengths:</strong> {g.strengths.join(", ")}</p>}
                      {g.weaknesses?.length > 0 && <p><strong>Weaknesses:</strong> {g.weaknesses.join(", ")}</p>}
                      {g.fitrahNotes && <p><strong>Fitrah:</strong> {g.fitrahNotes}</p>}
                      {g.appearance && <p><strong>Appearance:</strong> {g.appearance}</p>}
                      {g.samplePrompt && <p className="italic text-muted-foreground mt-1">"{g.samplePrompt}"</p>}
                      <Button variant="ghost" size="sm" className="text-destructive h-6 px-2 mt-1"
                        onClick={() => save({ characterGroups: groups.filter((_, j) => j !== i) } as any)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {!groups.length && <p className="text-sm text-muted-foreground text-center py-6">No character groups yet.</p>}
              </Accordion>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Character Group</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Code *</Label><Input placeholder="HOPPERS" value={newGroup.code} onChange={e => setNewGroup({ ...newGroup, code: e.target.value.toUpperCase() })} /></div>
                <div><Label className="text-xs">Name *</Label><Input placeholder="The Hoppers" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} /></div>
                <div><Label className="text-xs">Story Role *</Label><Input placeholder="Rival / Challenger / Catalyst" value={newGroup.role} onChange={e => setNewGroup({ ...newGroup, role: e.target.value })} /></div>
                <div><Label className="text-xs">LoRA Tag (image prompts)</Label><Input placeholder="HOPPERS" value={newGroup.loraTag} onChange={e => setNewGroup({ ...newGroup, loraTag: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Background</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Originated from the garden wall..." value={newGroup.background} onChange={e => setNewGroup({ ...newGroup, background: e.target.value })} /></div>
              </div>
              <TagInput label="Core Traits" items={newGroup.traits}
                placeholder="e.g. Competitive, agile, fiercely independent"
                onAdd={v => setNewGroup({ ...newGroup, traits: [...newGroup.traits, v] })}
                onRemove={i => setNewGroup({ ...newGroup, traits: newGroup.traits.filter((_, j) => j !== i) })} />
              <TagInput label="Strengths" items={newGroup.strengths}
                placeholder="e.g. Coordinated jumps, stealth and speed"
                onAdd={v => setNewGroup({ ...newGroup, strengths: [...newGroup.strengths, v] })}
                onRemove={i => setNewGroup({ ...newGroup, strengths: newGroup.strengths.filter((_, j) => j !== i) })} />
              <TagInput label="Weaknesses" items={newGroup.weaknesses}
                placeholder="e.g. Distrustful, impatient"
                onAdd={v => setNewGroup({ ...newGroup, weaknesses: [...newGroup.weaknesses, v] })}
                onRemove={i => setNewGroup({ ...newGroup, weaknesses: newGroup.weaknesses.filter((_, j) => j !== i) })} />
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><Label className="text-xs">Fitrah / Spiritual Notes (AI uses in text)</Label><Input placeholder="Their motion is a form of remembrance..." value={newGroup.fitrahNotes} onChange={e => setNewGroup({ ...newGroup, fitrahNotes: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Appearance (AI uses in image prompts)</Label><Input placeholder="Lean, angular limbs, camouflage tones, always mid-jump" value={newGroup.appearance} onChange={e => setNewGroup({ ...newGroup, appearance: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Sample Illustration Prompt</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Three Hoppers crouching on a tilted leaf, limbs tense like coiled springs..." value={newGroup.samplePrompt} onChange={e => setNewGroup({ ...newGroup, samplePrompt: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newGroup.code || !newGroup.name || updateMutation.isPending}
                onClick={() => { save({ characterGroups: [...groups, { ...newGroup }] } as any); setNewGroup({ code: "", name: "", role: "", background: "", traits: [], strengths: [], weaknesses: [], fitrahNotes: "", appearance: "", loraTag: "", samplePrompt: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Group
              </Button>
            </div>
          </div>
        );
      }

      case "bookStructures": {
        const structures = getArr<BookStructure>("bookStructures");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Activity book and educational hybrid format templates. Used when generating structured non-story books.</p>
            <ScrollArea className="h-44">
              <Accordion type="single" collapsible className="space-y-1">
                {structures.map((s, i) => (
                  <AccordionItem key={i} value={String(i)} className="border rounded-lg px-3">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{s.type}</Badge>
                        <span>{s.title}</span>
                        {s.ageGroup && <span className="text-xs text-muted-foreground">ages {s.ageGroup}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs space-y-1.5 pb-3">
                      {s.description && <p>{s.description}</p>}
                      {s.pageTypes?.length > 0 && <p><strong>Page types:</strong> {s.pageTypes.join(", ")}</p>}
                      {s.chapterFlow?.length > 0 && <p><strong>Chapter flow:</strong> {s.chapterFlow.join(" → ")}</p>}
                      {s.toneNotes && <p><strong>Tone:</strong> {s.toneNotes}</p>}
                      {s.faithAnchors?.length > 0 && <p><strong>Faith anchors:</strong> {s.faithAnchors.join(" · ")}</p>}
                      <Button variant="ghost" size="sm" className="text-destructive h-6 px-2 mt-1"
                        onClick={() => save({ bookStructures: structures.filter((_, j) => j !== i) } as any)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {!structures.length && <p className="text-sm text-muted-foreground text-center py-6">No book structures yet.</p>}
              </Accordion>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Book Structure</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Type *</Label>
                  <Select value={newStructure.type} onValueChange={(v: any) => setNewStructure({ ...newStructure, type: v })}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activity">Activity Book</SelectItem>
                      <SelectItem value="educational">Educational Hybrid</SelectItem>
                      <SelectItem value="story">Story Book</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Age Group</Label><Input placeholder="5–8" value={newStructure.ageGroup} onChange={e => setNewStructure({ ...newStructure, ageGroup: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Title *</Label><Input placeholder="Activity Book Structure" value={newStructure.title} onChange={e => setNewStructure({ ...newStructure, title: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Description</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Portals into the world of Khaled & Sumaya..." value={newStructure.description} onChange={e => setNewStructure({ ...newStructure, description: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Tone Notes</Label><Input placeholder="Wholesome, playful, warm" value={newStructure.toneNotes} onChange={e => setNewStructure({ ...newStructure, toneNotes: e.target.value })} /></div>
              </div>
              <TagInput label="Page / Activity Types" items={newStructure.pageTypes}
                placeholder="e.g. Color & Reflect, Find & Match, Mini Story Puzzles"
                onAdd={v => setNewStructure({ ...newStructure, pageTypes: [...newStructure.pageTypes, v] })}
                onRemove={i => setNewStructure({ ...newStructure, pageTypes: newStructure.pageTypes.filter((_, j) => j !== i) })} />
              <TagInput label="Chapter / Section Flow" items={newStructure.chapterFlow}
                placeholder="e.g. Story Starter → Mini Discovery → Core Learning"
                onAdd={v => setNewStructure({ ...newStructure, chapterFlow: [...newStructure.chapterFlow, v] })}
                onRemove={i => setNewStructure({ ...newStructure, chapterFlow: newStructure.chapterFlow.filter((_, j) => j !== i) })} />
              <TagInput label="Faith Anchors" items={newStructure.faithAnchors}
                placeholder="e.g. Every activity must echo kindness, sabr, teamwork"
                onAdd={v => setNewStructure({ ...newStructure, faithAnchors: [...newStructure.faithAnchors, v] })}
                onRemove={i => setNewStructure({ ...newStructure, faithAnchors: newStructure.faithAnchors.filter((_, j) => j !== i) })} />
              <Button variant="outline" size="sm" disabled={!newStructure.title || updateMutation.isPending}
                onClick={() => { save({ bookStructures: [...structures, { ...newStructure }] } as any); setNewStructure({ type: "activity", ageGroup: "5-8", title: "", description: "", pageTypes: [], chapterFlow: [], toneNotes: "", faithAnchors: [], avoid: [] }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Structure
              </Button>
            </div>
          </div>
        );
      }

      case "coverDesign": {
        const cd = (selectedKB as any)?.coverDesign || {};
        const brandingRules       = cd.brandingRules       || newCoverDesign.brandingRules;
        const characterComposition= cd.characterComposition|| newCoverDesign.characterComposition;
        const optionalAddons      = cd.optionalAddons      || newCoverDesign.optionalAddons;
        const islamicMotifs       = cd.islamicMotifs       || newCoverDesign.islamicMotifs;
        const avoidCover          = cd.avoidCover          || newCoverDesign.avoidCover;

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
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Per-character speaking style, background lore, and faith integration. Injected into text prompts when that character appears in a scene.</p>
            <ScrollArea className="h-48">
              <Accordion type="single" collapsible className="space-y-1">
                {guides.map((g, i) => (
                  <AccordionItem key={i} value={String(i)} className="border rounded-lg px-3">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{g.characterName}</Badge>
                        {g.speakingStyle && <span className="text-xs text-muted-foreground truncate max-w-[200px]">{g.speakingStyle}</span>}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs space-y-1.5 pb-3">
                      {g.speakingStyle && <p><strong>Speaking Style:</strong> {g.speakingStyle}</p>}
                      {g.dialogueExamples?.length > 0 && <p><strong>Dialogue:</strong> {g.dialogueExamples.map(e => `"${e}"`).join(" / ")}</p>}
                      {g.moreInfo && <p><strong>Background:</strong> {g.moreInfo}</p>}
                      {g.literaryRole && <p><strong>Literary Role:</strong> {g.literaryRole}</p>}
                      {g.faithTone && <p><strong>Faith Tone:</strong> {g.faithTone}</p>}
                      {g.islamicTraits?.length > 0 && <p><strong>Islamic Traits:</strong> {g.islamicTraits.join(", ")}</p>}
                      {g.faithExpressions?.length > 0 && <p><strong>Faith Expressions:</strong> {g.faithExpressions.join("; ")}</p>}
                      {g.duaStyle && <p><strong>Du'a Style:</strong> {g.duaStyle}</p>}
                      {g.faithExamples?.length > 0 && <p className="italic text-muted-foreground">{g.faithExamples.map(e => `"${e}"`).join(" / ")}</p>}
                      <Button variant="ghost" size="sm" className="text-destructive h-6 px-2 mt-1"
                        onClick={() => save({ characterGuides: guides.filter((_, j) => j !== i) } as any)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No character guides yet.</p>}
              </Accordion>
            </ScrollArea>

            <div className="border-t pt-3 space-y-3">
              <SectionLabel>Add Character Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs">Character Name *</Label>
                  <Input placeholder="e.g. Zuzu / Basha / Noura-Bee / Khaled"
                    value={newCharGuide.characterName} onChange={e => setNewCharGuide({ ...newCharGuide, characterName: e.target.value })} />
                </div>
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

              <TagInput label="Dialogue Examples" items={newCharGuide.dialogueExamples}
                placeholder={`e.g. "Zoom-zoom-Zuzu's on it!"`}
                onAdd={v => setNewCharGuide({ ...newCharGuide, dialogueExamples: [...newCharGuide.dialogueExamples, v] })}
                onRemove={i => setNewCharGuide({ ...newCharGuide, dialogueExamples: newCharGuide.dialogueExamples.filter((_, j) => j !== i) })} />
              <TagInput label="Personality Notes" items={newCharGuide.personalityNotes}
                placeholder="e.g. Skeptical but morally rooted"
                onAdd={v => setNewCharGuide({ ...newCharGuide, personalityNotes: [...newCharGuide.personalityNotes, v] })}
                onRemove={i => setNewCharGuide({ ...newCharGuide, personalityNotes: newCharGuide.personalityNotes.filter((_, j) => j !== i) })} />

              <Button variant="outline" size="sm" disabled={!newCharGuide.characterName || updateMutation.isPending}
                onClick={() => {
                  const { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples, ...rest } = newCharGuide;
                  save({ characterGuides: [...guides, { ...rest, faithGuide: { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples } }] } as any);
                  setNewCharGuide({ characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "", personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [], duaStyle: "", islamicTraits: [], faithExamples: [] });
                }}>
                <Plus className="w-4 h-4 mr-1" /> Add Character Guide
              </Button>
            </div>
          </div>
        );
      }

      case "customRules": {
        const current = (selectedKB as any)?.customRules || "";
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Free-form rules injected verbatim as the highest-priority block into every AI prompt — both text and image generation.</p>
            <Textarea rows={10} className="resize-none text-sm font-mono"
              placeholder="Write any additional rules, tone overrides, or hard constraints here. This overrides all other KB blocks..."
              value={current} onChange={e => save({ customRules: e.target.value } as any)} />
            <p className="text-xs text-muted-foreground">Changes are applied on next AI generation. This field has highest priority in all prompts.</p>
          </div>
        );
      }

      default: return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppLayout
      title="Knowledge Base"
      subtitle="Define the universe rules that shape every story, chapter, and illustration"
      actions={
        <Button variant="hero" onClick={() => { setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" />New Knowledge Base
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── KB List ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredKBs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{search ? "No results." : "No knowledge bases yet."}</p>
              {!search && <Button variant="hero" size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" />Create First KB</Button>}
            </div>
          ) : (
            filteredKBs.map((kb: KnowledgeBase) => {
              const themeCount  = (kb as any).themes?.length || 0;
              const deviceCount = (kb as any).literaryDevices?.length || 0;
              const groupCount  = (kb as any).characterGroups?.length || 0;
              const toneCount   = (kb as any).toneSpectrum?.length || 0;
              const isSelected  = selectedKB?.id === kb.id;
              return (
                <div key={kb.id}
                  onClick={() => { setSelectedKB(kb); setActiveSection("islamicValues"); setNewItem(""); }}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected
                      ? "border-primary shadow-md shadow-primary/10 bg-primary/5"
                      : "border-border hover:border-primary/40 bg-card"
                  )}>
                  {/* Top accent strip */}
                  <div className={cn("h-1.5 w-full transition-all", isSelected ? "bg-gradient-to-r from-primary via-violet-400 to-pink-400" : "bg-gradient-to-r from-muted to-muted/30 group-hover:from-primary/30 group-hover:to-violet-300/30")} />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors", isSelected ? "bg-primary/15 border border-primary/20" : "bg-muted border border-border group-hover:bg-primary/10")}>
                          <BookMarked className={cn("w-5 h-5 transition-colors", isSelected ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{kb.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium text-violet-600">{kb.islamicValues.length}</span> values ·{" "}
                            <span className="font-medium text-blue-600">{kb.duas.length}</span> du'as ·{" "}
                            <span className="font-medium text-orange-600">{kb.vocabulary.length}</span> words
                          </p>
                        </div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); setShowDelete(kb.id); }}
                        className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {(themeCount + toneCount + deviceCount + groupCount) > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {themeCount > 0  && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">✦ {themeCount} themes</span>}
                        {toneCount > 0   && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-700">♪ {toneCount} tone</span>}
                        {deviceCount > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700">◆ {deviceCount} devices</span>}
                        {groupCount > 0  && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">● {groupCount} groups</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── KB Detail ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedKB ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-muted-foreground/20 p-14 text-center flex flex-col items-center justify-center min-h-[480px] bg-gradient-to-br from-violet-50/50 via-background to-pink-50/30">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center mb-5 shadow-sm">
                <Database className="w-9 h-9 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pick a Knowledge Base</h3>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Select one from the list to start adding themes, faith guides, character voices, illustration rules, and more.
              </p>
              <div className="flex gap-2 mt-6 flex-wrap justify-center">
                {["🎨 Themes", "🕊️ Faith", "🗣️ Dialogue", "🏞️ Backgrounds"].map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{t}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
              {/* KB detail header */}
              <div className="px-6 pt-5 pb-4 border-b bg-gradient-to-r from-primary/5 via-violet-50/30 to-pink-50/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-200/60 flex items-center justify-center shadow-sm">
                    <BookMarked className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight">{selectedKB.name}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Updated {new Date(selectedKB.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">

              {/* Section nav — colorful icon card grid */}
              <div className="space-y-3">
                {GROUPS.map(group => {
                  const groupSections = SECTIONS.filter(s => s.group === group);
                  return (
                    <div key={group}>
                      <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2", GROUP_PILL[group])}>
                        {group}
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {groupSections.map(({ id, label, icon: Icon, color }) => {
                          const style = SECTION_STYLE[id];
                          const isActive = activeSection === id;
                          return (
                            <button key={id}
                              onClick={() => { setActiveSection(id as SectionId); setNewItem(""); }}
                              className={cn(
                                "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 text-center transition-all duration-150 hover:scale-105",
                                isActive
                                  ? cn(style.bg, style.border, "shadow-sm scale-105")
                                  : "border-transparent bg-muted/50 hover:bg-muted"
                              )}>
                              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center transition-colors", isActive ? style.iconBg : "bg-background/80")}>
                                <Icon className={cn("w-4 h-4 transition-colors", isActive ? color : "text-muted-foreground")} />
                              </div>
                              <span className={cn("text-[10px] font-semibold leading-tight", isActive ? style.text : "text-muted-foreground")}>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section content */}
              <div className="min-h-[320px]">
                {(() => {
                  const sec = SECTIONS.find(s => s.id === activeSection);
                  if (!sec) return null;
                  const style = SECTION_STYLE[activeSection];
                  const Icon = sec.icon;
                  return (
                    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 border", style.bg, style.border)}>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.iconBg)}>
                        <Icon className={cn("w-4.5 h-4.5", sec.color)} />
                      </div>
                      <p className={cn("text-sm font-bold", style.text)}>{sec.label}</p>
                    </div>
                  );
                })()}
                {renderSection()}
              </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
              <Input placeholder="e.g., Khaled & Sumaya Universe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Islamic Values (one per line)</Label>
              <Textarea rows={3} placeholder={"Honesty\nSabr — patience\nKindness to others"} value={form.islamicValues} onChange={e => setForm({ ...form, islamicValues: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Illustration Rules (one per line)</Label>
              <Textarea rows={2} placeholder={"Modest dress always\nClean simple backgrounds"} value={form.illustrationRules} onChange={e => setForm({ ...form, illustrationRules: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Avoid Topics (one per line)</Label>
              <Textarea rows={2} placeholder={"Violence\nPreachy narration\nSarcasm toward faith"} value={form.avoidTopics} onChange={e => setForm({ ...form, avoidTopics: e.target.value })} />
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