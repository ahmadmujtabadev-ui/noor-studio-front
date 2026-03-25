import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Plus, Search, Trash2, BookOpen, Shield, Type, Palette, Settings,
  X, Loader2, Database, Mic2, Feather, Heart, Layers, Eye, Users,
  Mountain, Sparkles, BookMarked, Lightbulb, Image,
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
  ageGroup: string;    // e.g. "Junior (5-8)", "Middle Grade (8-13)"
  tone: string;
  locations?: string;
  style?: string;
  techniques: string;
  examples: string;
  avoid?: string;
}

interface LiteraryDevice {
  type: string;        // "metaphor" | "symbol" | "technique"
  name: string;
  meaning: string;
  example: string;
}

interface CharacterGroup {
  code: string;
  name: string;
  role: string;
  background: string;
  traits: string;
  strengths: string;
  weaknesses: string;
  fitrahNotes: string;
  appearance: string;
  samplePrompt: string;
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "islamicValues",    label: "Islamic Values",    icon: Shield,     color: "text-purple-500"  },
  { id: "duas",             label: "Duas",              icon: BookOpen,   color: "text-blue-500"    },
  { id: "vocabulary",       label: "Vocabulary",        icon: Type,       color: "text-orange-500"  },
  { id: "themes",           label: "Themes",            icon: Sparkles,   color: "text-yellow-500"  },
  { id: "toneSpectrum",     label: "Tone & Voice",      icon: Mic2,       color: "text-pink-500"    },
  { id: "backgrounds",      label: "Backgrounds",       icon: Mountain,   color: "text-teal-500"    },
  { id: "faithIntegration", label: "Faith Integration", icon: Heart,      color: "text-red-500"     },
  { id: "literaryDevices",  label: "Literary Devices",  icon: Feather,    color: "text-indigo-500"  },
  { id: "illustrationRules",label: "Illustration Rules",icon: Image,      color: "text-cyan-500"    },
  { id: "characterGroups",  label: "Character Groups",  icon: Users,      color: "text-green-500"   },
  { id: "avoidTopics",      label: "Avoid Topics",      icon: X,          color: "text-red-400"     },
  { id: "customRules",      label: "Custom Rules",      icon: Settings,   color: "text-gray-500"    },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

// ─── Empty KB form ────────────────────────────────────────────────────────────

interface KBCreateForm {
  name: string;
  islamicValues: string;
  illustrationRules: string;
  avoidTopics: string;
  customRules: string;
}

const EMPTY_FORM: KBCreateForm = {
  name: "", islamicValues: "", illustrationRules: "", avoidTopics: "", customRules: "",
};

// ─── Small reusable components ────────────────────────────────────────────────

function ItemRow({ text, onRemove }: { text: string; onRemove: () => void }) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg bg-muted/50 group">
      <p className="text-sm flex-1 pr-2 whitespace-pre-line">{text}</p>
      <button onClick={onRemove} className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0">
        <X className="w-4 h-4" />
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
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        className="flex-1 text-sm resize-none"
        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) onAdd(); }}
      />
      <Button variant="outline" onClick={onAdd} disabled={loading} className="self-end">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
      </Button>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{children}</p>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const { data: kbs = [], isLoading } = useKnowledgeBases();
  const createMutation = useCreateKnowledgeBase();
  const deleteMutation = useDeleteKnowledgeBase();
  const [searchParams] = useSearchParams();
  const universeId = searchParams.get("universeId") || undefined;

  const [search, setSearch]           = useState("");
  const [selectedKB, setSelectedKB]   = useState<KnowledgeBase | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>("islamicValues");
  const [showCreate, setShowCreate]   = useState(false);
  const [showDelete, setShowDelete]   = useState<string | null>(null);
  const [form, setForm]               = useState<KBCreateForm>(EMPTY_FORM);
  const [newItem, setNewItem]         = useState("");

  // Structured new-item states
  const [newDua, setNewDua]           = useState({ arabic: "", transliteration: "", meaning: "", when: "" });
  const [newVocab, setNewVocab]       = useState({ word: "", definition: "", example: "" });
  const [newTheme, setNewTheme]       = useState<Theme>({ name: "", coreConflict: "", emotionalBeat: "", anchorSymbol: "" });
  const [newAgeGuide, setNewAgeGuide] = useState<AgeGroupGuide>({ ageGroup: "Junior (5-8)", tone: "", locations: "", style: "", techniques: "", examples: "", avoid: "" });
  const [newDevice, setNewDevice]     = useState<LiteraryDevice>({ type: "metaphor", name: "", meaning: "", example: "" });
  const [newGroup, setNewGroup]       = useState<CharacterGroup>({ code: "", name: "", role: "", background: "", traits: "", strengths: "", weaknesses: "", fitrahNotes: "", appearance: "", samplePrompt: "" });

  const updateMutation = useUpdateKnowledgeBase(selectedKB?.id || "");

  const filteredKBs = kbs.filter((kb: KnowledgeBase) =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

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

  // ─── Create ───────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      const created = await createMutation.mutateAsync({
        name: form.name.trim(),
        universeId,
        islamicValues:     form.islamicValues.split("\n").filter(Boolean),
        illustrationRules: form.illustrationRules.split("\n").filter(Boolean),
        avoidTopics:       form.avoidTopics.split("\n").filter(Boolean),
        customRules:       form.customRules || undefined,
      });
      toast({ title: "Knowledge base created" });
      setShowCreate(false);
      setForm(EMPTY_FORM);
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

      // ── Islamic Values ─────────────────────────────────────────────────────
      case "islamicValues": {
        const items = getArr<string>("islamicValues");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Core Islamic values woven into every story and illustration.</p>
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {items.map((v, i) => (
                  <ItemRow key={i} text={v} onRemove={() => save({ islamicValues: items.filter((_, j) => j !== i) })} />
                ))}
                {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No values yet.</p>}
              </div>
            </ScrollArea>
            <AddRow placeholder="e.g. Sabr — patience in hardship" value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ islamicValues: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      // ── Duas ───────────────────────────────────────────────────────────────
      case "duas": {
        const duas = getArr<any>("duas");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Duas used in the story — used by AI to add natural dua moments.</p>
            <ScrollArea className="h-52">
              <div className="space-y-2">
                {duas.map((d: any, i: number) => (
                  <ItemRow key={i}
                    text={`${d.arabic ? d.arabic + "\n" : ""}${d.transliteration}\n"${d.meaning}"${d.when ? "\nWhen: " + d.when : ""}`}
                    onRemove={() => save({ duas: duas.filter((_: any, j: number) => j !== i) })} />
                ))}
                {!duas.length && <p className="text-sm text-muted-foreground text-center py-6">No duas yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Dua</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Arabic (optional)</Label><Input placeholder="بِسْمِ اللَّهِ" value={newDua.arabic} onChange={e => setNewDua({ ...newDua, arabic: e.target.value })} /></div>
                <div><Label className="text-xs">Transliteration *</Label><Input placeholder="Bismillah" value={newDua.transliteration} onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Meaning *</Label><Input placeholder="In the name of Allah" value={newDua.meaning} onChange={e => setNewDua({ ...newDua, meaning: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">When used in story</Label><Input placeholder="Before eating, starting a task, waking up..." value={newDua.when} onChange={e => setNewDua({ ...newDua, when: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newDua.transliteration || !newDua.meaning || updateMutation.isPending}
                onClick={() => { save({ duas: [...duas, { ...newDua }] }); setNewDua({ arabic: "", transliteration: "", meaning: "", when: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Dua
              </Button>
            </div>
          </div>
        );
      }

      // ── Vocabulary ─────────────────────────────────────────────────────────
      case "vocabulary": {
        const vocab = getArr<any>("vocabulary");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Islamic/Arabic vocabulary — used in text and glossary pages.</p>
            <ScrollArea className="h-52">
              <div className="space-y-2">
                {vocab.map((v: any, i: number) => (
                  <ItemRow key={i}
                    text={`${v.word}: ${v.definition}${v.example ? "\nExample: " + v.example : ""}`}
                    onRemove={() => save({ vocabulary: vocab.filter((_: any, j: number) => j !== i) })} />
                ))}
                {!vocab.length && <p className="text-sm text-muted-foreground text-center py-6">No vocabulary yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Word</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Word *</Label><Input placeholder="Alhamdulillah" value={newVocab.word} onChange={e => setNewVocab({ ...newVocab, word: e.target.value })} /></div>
                <div><Label className="text-xs">Definition *</Label><Input placeholder="All praise is for Allah" value={newVocab.definition} onChange={e => setNewVocab({ ...newVocab, definition: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Story Example</Label><Input placeholder='"Alhamdulillah!" said Zahra, hugging her mama.' value={newVocab.example} onChange={e => setNewVocab({ ...newVocab, example: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newVocab.word || !newVocab.definition || updateMutation.isPending}
                onClick={() => { save({ vocabulary: [...vocab, { ...newVocab }] }); setNewVocab({ word: "", definition: "", example: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Word
              </Button>
            </div>
          </div>
        );
      }

      // ── Themes ─────────────────────────────────────────────────────────────
      case "themes": {
        const themes = getArr<Theme>("themes");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Story themes — AI picks from these when building book outlines and chapter conflicts.</p>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {themes.map((t, i) => (
                  <ItemRow key={i}
                    text={`🎯 ${t.name}\nConflict: ${t.coreConflict}\nEmotional beat: ${t.emotionalBeat}\nSymbol: ${t.anchorSymbol}`}
                    onRemove={() => save({ themes: themes.filter((_, j) => j !== i) } as any)} />
                ))}
                {!themes.length && <p className="text-sm text-muted-foreground text-center py-6">No themes yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Theme</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2"><Label className="text-xs">Theme Name *</Label><Input placeholder="Truth vs Comfort" value={newTheme.name} onChange={e => setNewTheme({ ...newTheme, name: e.target.value })} /></div>
                <div><Label className="text-xs">Core Conflict *</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Telling the truth even when it hurts" value={newTheme.coreConflict} onChange={e => setNewTheme({ ...newTheme, coreConflict: e.target.value })} /></div>
                <div><Label className="text-xs">Emotional Beat *</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Risking disappointment to stay honest" value={newTheme.emotionalBeat} onChange={e => setNewTheme({ ...newTheme, emotionalBeat: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Anchor Symbol</Label><Input placeholder="Locked box, mirror, confession letter" value={newTheme.anchorSymbol} onChange={e => setNewTheme({ ...newTheme, anchorSymbol: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newTheme.name || !newTheme.coreConflict || updateMutation.isPending}
                onClick={() => { save({ themes: [...themes, { ...newTheme }] } as any); setNewTheme({ name: "", coreConflict: "", emotionalBeat: "", anchorSymbol: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Theme
              </Button>
            </div>
          </div>
        );
      }

      // ── Tone & Voice (age-group guides) ────────────────────────────────────
      case "toneSpectrum": {
        const guides = getArr<AgeGroupGuide>("toneSpectrum");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Tone, dialogue style, and narrative voice per age group — AI adapts writing style based on the book's age range.</p>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {guides.map((g, i) => (
                  <ItemRow key={i}
                    text={`[${g.ageGroup}] ${g.tone}\nTechniques: ${g.techniques}\nExamples: ${g.examples}${g.avoid ? "\nAvoid: " + g.avoid : ""}`}
                    onRemove={() => save({ toneSpectrum: guides.filter((_, j) => j !== i) } as any)} />
                ))}
                {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No tone guides yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Tone Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age Group *</Label><Input placeholder="Junior (5–8) / Middle Grade (8–13)" value={newAgeGuide.ageGroup} onChange={e => setNewAgeGuide({ ...newAgeGuide, ageGroup: e.target.value })} /></div>
                <div><Label className="text-xs">Tone Style *</Label><Input placeholder="Gentle, playful, emotionally safe" value={newAgeGuide.tone} onChange={e => setNewAgeGuide({ ...newAgeGuide, tone: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Narrative Techniques</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Repetition for rhythm, questions as learning tools..." value={newAgeGuide.techniques} onChange={e => setNewAgeGuide({ ...newAgeGuide, techniques: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Dialogue Examples</Label><Textarea rows={2} className="resize-none text-xs" placeholder='"Mama always knows!" / "Do you think that made her sad?"' value={newAgeGuide.examples} onChange={e => setNewAgeGuide({ ...newAgeGuide, examples: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Avoid for This Age Group</Label><Input placeholder="Slang, adult logic, long monologues..." value={newAgeGuide.avoid} onChange={e => setNewAgeGuide({ ...newAgeGuide, avoid: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newAgeGuide.ageGroup || !newAgeGuide.tone || updateMutation.isPending}
                onClick={() => { save({ toneSpectrum: [...guides, { ...newAgeGuide }] } as any); setNewAgeGuide({ ageGroup: "Junior (5-8)", tone: "", locations: "", style: "", techniques: "", examples: "", avoid: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Tone Guide
              </Button>
            </div>
          </div>
        );
      }

      // ── Backgrounds ────────────────────────────────────────────────────────
      case "backgrounds": {
        const guides = getArr<AgeGroupGuide>("backgroundGuides");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Background environment rules per age group — passed directly into illustration prompts.</p>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {guides.map((g, i) => (
                  <ItemRow key={i}
                    text={`[${g.ageGroup}] ${g.style || ""}\nLocations: ${g.locations || "N/A"}\nKey features: ${g.techniques}${g.avoid ? "\nAvoid: " + g.avoid : ""}`}
                    onRemove={() => save({ backgroundGuides: guides.filter((_, j) => j !== i) } as any)} />
                ))}
                {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No background guides yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Background Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age Group / Series *</Label><Input placeholder="Junior (5–8)" value={newAgeGuide.ageGroup} onChange={e => setNewAgeGuide({ ...newAgeGuide, ageGroup: e.target.value })} /></div>
                <div><Label className="text-xs">Style</Label><Input placeholder="Soft palettes, round shapes, gentle shadows" value={newAgeGuide.style || ""} onChange={e => setNewAgeGuide({ ...newAgeGuide, style: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Locations *</Label><Input placeholder="Bedroom, kitchen, masjid hallway, garden..." value={newAgeGuide.locations || ""} onChange={e => setNewAgeGuide({ ...newAgeGuide, locations: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Key Visual Features *</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Clear foreground/background contrast, no visual clutter, emotion through light..." value={newAgeGuide.techniques} onChange={e => setNewAgeGuide({ ...newAgeGuide, techniques: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Avoid</Label><Input placeholder="Abstract patterns, empty gradients, generic stock backdrops" value={newAgeGuide.avoid || ""} onChange={e => setNewAgeGuide({ ...newAgeGuide, avoid: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newAgeGuide.ageGroup || !newAgeGuide.techniques || updateMutation.isPending}
                onClick={() => { save({ backgroundGuides: [...guides, { ...newAgeGuide }] } as any); setNewAgeGuide({ ageGroup: "Junior (5-8)", tone: "", locations: "", style: "", techniques: "", examples: "", avoid: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Background Guide
              </Button>
            </div>
          </div>
        );
      }

      // ── Faith Integration ──────────────────────────────────────────────────
      case "faithIntegration": {
        const guides = getArr<AgeGroupGuide>("faithIntegration");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">How faith appears naturally in each age group — AI uses this to calibrate how Islamic content is embedded.</p>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {guides.map((g, i) => (
                  <ItemRow key={i}
                    text={`[${g.ageGroup}] ${g.tone}\nMethods: ${g.techniques}\nExamples: ${g.examples}`}
                    onRemove={() => save({ faithIntegration: guides.filter((_, j) => j !== i) } as any)} />
                ))}
                {!guides.length && <p className="text-sm text-muted-foreground text-center py-6">No faith guides yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Faith Guide</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Age Group *</Label><Input placeholder="Junior (5–8)" value={newAgeGuide.ageGroup} onChange={e => setNewAgeGuide({ ...newAgeGuide, ageGroup: e.target.value })} /></div>
                <div><Label className="text-xs">Tone *</Label><Input placeholder="Joyful, safe, filled with love of Allah" value={newAgeGuide.tone} onChange={e => setNewAgeGuide({ ...newAgeGuide, tone: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Integration Methods *</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Faith shown through habits, dua said aloud, names of Allah through action..." value={newAgeGuide.techniques} onChange={e => setNewAgeGuide({ ...newAgeGuide, techniques: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Story Examples</Label><Textarea rows={2} className="resize-none text-xs" placeholder='"Zahra smiled. Allah loves when we share." / "Imran saw his dad raise his hands. So he did too."' value={newAgeGuide.examples} onChange={e => setNewAgeGuide({ ...newAgeGuide, examples: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newAgeGuide.ageGroup || !newAgeGuide.tone || updateMutation.isPending}
                onClick={() => { save({ faithIntegration: [...guides, { ...newAgeGuide }] } as any); setNewAgeGuide({ ageGroup: "Junior (5-8)", tone: "", locations: "", style: "", techniques: "", examples: "", avoid: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Faith Guide
              </Button>
            </div>
          </div>
        );
      }

      // ── Literary Devices ───────────────────────────────────────────────────
      case "literaryDevices": {
        const devices = getArr<LiteraryDevice>("literaryDevices");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Metaphors, symbols, and techniques — AI uses these to create layered, meaningful storytelling.</p>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {devices.map((d, i) => (
                  <ItemRow key={i}
                    text={`[${d.type}] ${d.name} = ${d.meaning}${d.example ? "\nExample: " + d.example : ""}`}
                    onRemove={() => save({ literaryDevices: devices.filter((_, j) => j !== i) } as any)} />
                ))}
                {!devices.length && <p className="text-sm text-muted-foreground text-center py-6">No devices yet.</p>}
              </div>
            </ScrollArea>
            <div className="border-t pt-3 space-y-2">
              <SectionLabel>Add Device</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Type *</Label>
                  <select className="w-full text-sm border rounded-md px-3 py-2 bg-background" value={newDevice.type} onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}>
                    <option value="metaphor">Metaphor</option>
                    <option value="symbol">Symbol</option>
                    <option value="technique">Narrative Technique</option>
                    <option value="device">Literary Device</option>
                  </select>
                </div>
                <div><Label className="text-xs">Name *</Label><Input placeholder="Puddle / Broken Compass / Repetition" value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} /></div>
                <div><Label className="text-xs">Meaning / Function *</Label><Input placeholder="Temporary fear or reflection" value={newDevice.meaning} onChange={e => setNewDevice({ ...newDevice, meaning: e.target.value })} /></div>
                <div><Label className="text-xs">Story Example</Label><Input placeholder="Saeeda stared at the puddle — it showed her what she feared" value={newDevice.example} onChange={e => setNewDevice({ ...newDevice, example: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newDevice.name || !newDevice.meaning || updateMutation.isPending}
                onClick={() => { save({ literaryDevices: [...devices, { ...newDevice }] } as any); setNewDevice({ type: "metaphor", name: "", meaning: "", example: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Device
              </Button>
            </div>
          </div>
        );
      }

      // ── Illustration Rules ─────────────────────────────────────────────────
      case "illustrationRules": {
        const items = getArr<string>("illustrationRules");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Illustration style rules — injected into every image generation prompt.</p>
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {items.map((v, i) => (
                  <ItemRow key={i} text={v} onRemove={() => save({ illustrationRules: items.filter((_, j) => j !== i) })} />
                ))}
                {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No illustration rules yet.</p>}
              </div>
            </ScrollArea>
            <AddRow placeholder="e.g. All clothing must be loose and modest at all times" value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ illustrationRules: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      // ── Character Groups ───────────────────────────────────────────────────
      case "characterGroups": {
        const groups = getArr<CharacterGroup>("characterGroups");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Supporting character groups — AI uses these for secondary characters and ensemble dynamics.</p>
            <ScrollArea className="h-44">
              <Accordion type="single" collapsible className="space-y-1">
                {groups.map((g, i) => (
                  <AccordionItem key={i} value={String(i)} className="border rounded-lg px-3">
                    <AccordionTrigger className="py-2 text-sm font-medium hover:no-underline">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">{g.code}</Badge>
                        {g.name}
                        <span className="text-xs text-muted-foreground">— {g.role}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs space-y-1 pb-3">
                      <p><strong>Background:</strong> {g.background}</p>
                      <p><strong>Traits:</strong> {g.traits}</p>
                      <p><strong>Strengths:</strong> {g.strengths}</p>
                      <p><strong>Weaknesses:</strong> {g.weaknesses}</p>
                      <p><strong>Fitrah Notes:</strong> {g.fitrahNotes}</p>
                      <p><strong>Appearance:</strong> {g.appearance}</p>
                      {g.samplePrompt && <p className="italic text-muted-foreground">"{g.samplePrompt}"</p>}
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
                <div><Label className="text-xs">Story Role *</Label><Input placeholder="Rival group / Challenger / Catalyst" value={newGroup.role} onChange={e => setNewGroup({ ...newGroup, role: e.target.value })} /></div>
                <div><Label className="text-xs">Core Traits *</Label><Input placeholder="Competitive, agile, independent" value={newGroup.traits} onChange={e => setNewGroup({ ...newGroup, traits: e.target.value })} /></div>
                <div><Label className="text-xs">Background</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Originated from the garden wall, survived harsh conditions..." value={newGroup.background} onChange={e => setNewGroup({ ...newGroup, background: e.target.value })} /></div>
                <div><Label className="text-xs">Strengths / Weaknesses</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Fast and coordinated / Distrustful and impatient" value={newGroup.strengths} onChange={e => setNewGroup({ ...newGroup, strengths: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Fitrah / Spiritual Notes</Label><Input placeholder="Their motion is a form of remembrance — they bow to the mountain" value={newGroup.fitrahNotes} onChange={e => setNewGroup({ ...newGroup, fitrahNotes: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Appearance for Illustration</Label><Input placeholder="Lean grasshopper-like, angular, camouflage tones, always mid-jump" value={newGroup.appearance} onChange={e => setNewGroup({ ...newGroup, appearance: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Sample Illustration Prompt</Label><Textarea rows={2} className="resize-none text-xs" placeholder="Three Hoppers crouching on a tilted leaf, limbs tense like coiled springs..." value={newGroup.samplePrompt} onChange={e => setNewGroup({ ...newGroup, samplePrompt: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newGroup.code || !newGroup.name || updateMutation.isPending}
                onClick={() => { save({ characterGroups: [...groups, { ...newGroup }] } as any); setNewGroup({ code: "", name: "", role: "", background: "", traits: "", strengths: "", weaknesses: "", fitrahNotes: "", appearance: "", samplePrompt: "" }); }}>
                <Plus className="w-4 h-4 mr-1" /> Add Group
              </Button>
            </div>
          </div>
        );
      }

      // ── Avoid Topics ───────────────────────────────────────────────────────
      case "avoidTopics": {
        const items = getArr<string>("avoidTopics");
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Topics the AI must never include in text or illustrations.</p>
            <ScrollArea className="h-56">
              <div className="space-y-2">
                {items.map((v, i) => (
                  <ItemRow key={i} text={v} onRemove={() => save({ avoidTopics: items.filter((_, j) => j !== i) })} />
                ))}
                {!items.length && <p className="text-sm text-muted-foreground text-center py-6">No topics listed yet.</p>}
              </div>
            </ScrollArea>
            <AddRow placeholder="e.g. Preachy narration, mockery of others, slang toward faith..." value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ avoidTopics: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      // ── Custom Rules ───────────────────────────────────────────────────────
      case "customRules": {
        const current = (selectedKB as any)?.customRules || "";
        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Free-form rules injected verbatim into AI system prompts for both text and image generation.</p>
            <Textarea
              rows={10}
              className="resize-none text-sm font-mono"
              placeholder="Write any additional rules, tone guides, or constraints here. This is appended directly to every AI prompt for this knowledge base..."
              value={current}
              onChange={e => save({ customRules: e.target.value } as any)}
            />
            <p className="text-xs text-muted-foreground">Changes auto-save as you type.</p>
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
        <Button variant="hero" onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}>
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
              {!search && (
                <Button variant="hero" size="sm" onClick={() => { setForm(EMPTY_FORM); setShowCreate(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Create First KB
                </Button>
              )}
            </div>
          ) : (
            filteredKBs.map((kb: KnowledgeBase) => {
              const themeCount  = (kb as any).themes?.length || 0;
              const deviceCount = (kb as any).literaryDevices?.length || 0;
              const groupCount  = (kb as any).characterGroups?.length || 0;
              return (
                <div
                  key={kb.id}
                  onClick={() => { setSelectedKB(kb); setActiveSection("islamicValues"); setNewItem(""); }}
                  className={cn(
                    "card-glow p-4 cursor-pointer transition-all",
                    selectedKB?.id === kb.id && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookMarked className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{kb.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {kb.islamicValues.length} values · {kb.duas.length} duas · {kb.vocabulary.length} words
                        </p>
                        {(themeCount + deviceCount + groupCount) > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {themeCount > 0 && `${themeCount} themes · `}
                            {deviceCount > 0 && `${deviceCount} devices · `}
                            {groupCount > 0 && `${groupCount} groups`}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setShowDelete(kb.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── KB Detail ────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedKB ? (
            <div className="card-glow p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Database className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Knowledge Base</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Choose a knowledge base from the list to define themes, tone, faith integration, illustration rules, and more.
              </p>
            </div>
          ) : (
            <div className="card-glow p-6 space-y-5">
              <div>
                <h2 className="text-xl font-semibold">{selectedKB.name}</h2>
                <p className="text-xs text-muted-foreground">Updated {new Date(selectedKB.updatedAt).toLocaleDateString()}</p>
              </div>

              {/* Section nav */}
              <div className="flex flex-wrap gap-1.5">
                {SECTIONS.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => { setActiveSection(id); setNewItem(""); }}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeSection === id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    <Icon className={cn("w-3.5 h-3.5", activeSection !== id && color)} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Section content */}
              <div className="min-h-[320px]">
                {renderSection()}
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
            <DialogDescription>Set up the foundational rules for your universe. You can add themes, tone guides, and literary devices after creation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g., Khaled & Sumaya Universe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Islamic Values (one per line)</Label>
              <Textarea rows={3} placeholder="Honesty&#10;Sabr — patience&#10;Kindness to others" value={form.islamicValues} onChange={e => setForm({ ...form, islamicValues: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Illustration Rules (one per line)</Label>
              <Textarea rows={2} placeholder="Modest dress always&#10;Clean simple backgrounds" value={form.illustrationRules} onChange={e => setForm({ ...form, illustrationRules: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Avoid Topics (one per line)</Label>
              <Textarea rows={2} placeholder="Violence&#10;Preachy narration&#10;Sarcasm toward faith" value={form.avoidTopics} onChange={e => setForm({ ...form, avoidTopics: e.target.value })} />
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
            <DialogDescription>This will remove all themes, tone guides, literary devices, and rules. Cannot be undone.</DialogDescription>
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