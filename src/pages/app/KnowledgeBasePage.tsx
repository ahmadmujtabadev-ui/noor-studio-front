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
  Plus, Trash2, BookOpen, Loader2, Database, BookMarked,
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
  useCoverTemplates, useKBTemplates,
} from "@/hooks/useKnowledgeBase";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import { COVER_TEMPLATE_SVG_MAP, COVER_TEMPLATE_PNG_MAP } from "@/components/shared/CoverTemplateSvgs";
import {
  TIME_OF_DAY_OPTIONS, CAMERA_HINT_OPTIONS, TONE_OPTIONS, COLOR_STYLE_OPTIONS,
  KB_TEMPLATE_SVG_MAP, ISLAMIC_VALUE_PRESETS,
  DUA_CONTEXT_OPTIONS, VOCAB_TYPE_OPTIONS,
  SPEAKING_STYLE_OPTIONS, FAITH_TONE_OPTIONS, LITERARY_ROLE_OPTIONS,
  PAGE_LAYOUT_OPTIONS, ILLUSTRATION_STYLE_OPTIONS, TITLE_PLACEMENT_OPTIONS,
  FAITH_EXPRESSION_PRESETS,
  DUA_STYLE_OPTIONS,
  ISLAMIC_TRAIT_PRESETS,
} from "@/components/shared/KBFieldIcons";
import { VisualPicker } from "@/components/shared/VisualPicker";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import type { KnowledgeBase } from "@/lib/api/types";
import { useSearchParams, useNavigate } from "react-router-dom";
import { KBFaithLanguageStepper } from "@/components/kb/KBFaithLanguageStepper";
import { KBBackgroundSettings } from "@/components/kb/KBBackgroundSettings";
import { KBBookFormatting } from "@/components/kb/KBBookFormatting";
import { KBCoverDesign } from "@/components/kb/KBCoverDesign";
import { KBCharacterVoiceBuilder } from "@/components/kb/KBCharacterVoiceBuilder";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { SubscriptionGateModal } from "@/components/shared/SubscriptionGateModal";

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
  { id: "islamicValues", label: "Islamic Values", icon: Moon, color: "text-violet-600", group: "Core" },
  { id: "duas", label: "Du'as", icon: HandHeart, color: "text-blue-600", group: "Core" },
  { id: "vocabulary", label: "Vocabulary", icon: Languages, color: "text-orange-600", group: "Core" },
  { id: "avoidTopics", label: "Avoid Topics", icon: Ban, color: "text-red-500", group: "Core" },
  { id: "characterGuides", label: "Character Voice", icon: UserRound, color: "text-emerald-600", group: "Story" },
  { id: "backgroundSettings", label: "Background", icon: TreePine, color: "text-teal-600", group: "Visual" },
  { id: "bookFormatting", label: "Book Format", icon: ListOrdered, color: "text-amber-600", group: "Book" },
  { id: "coverDesign", label: "Cover Design", icon: Frame, color: "text-rose-600", group: "Cover" },
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
    label: "Background",
    description: "Scene backgrounds, lighting, locations & visual style",
    sections: ["backgroundSettings"],
  },
  {
    id: "bookFormat",
    label: "Book Format",
    description: "Book pacing, word count & layout rules per age group",
    sections: ["bookFormatting"],
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
  islamicValues: { bg: "bg-violet-50", iconBg: "bg-violet-100", border: "border-violet-200", text: "text-violet-700" },
  duas: { bg: "bg-blue-50", iconBg: "bg-blue-100", border: "border-blue-200", text: "text-blue-700" },
  vocabulary: { bg: "bg-orange-50", iconBg: "bg-orange-100", border: "border-orange-200", text: "text-orange-700" },
  avoidTopics: { bg: "bg-red-50", iconBg: "bg-red-100", border: "border-red-200", text: "text-red-700" },
  characterGuides: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", border: "border-emerald-200", text: "text-emerald-700" },
  backgroundSettings: { bg: "bg-teal-50", iconBg: "bg-teal-100", border: "border-teal-200", text: "text-teal-700" },
  bookFormatting: { bg: "bg-amber-50", iconBg: "bg-amber-100", border: "border-amber-200", text: "text-amber-700" },
  underSixDesign: { bg: "bg-lime-50", iconBg: "bg-lime-100", border: "border-lime-200", text: "text-lime-700" },
  coverDesign: { bg: "bg-rose-50", iconBg: "bg-rose-100", border: "border-rose-200", text: "text-rose-700" },
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

// ─── Cover Design Section ─────────────────────────────────────────────────────

interface CoverDesignSectionProps {
  cd: any;
  brandingRules: string[];
  characterComposition: string[];
  optionalAddons: string[];
  islamicMotifs: string[];
  avoidCover: string[];
  selectedTplId: string | null;
  patch: (partial: object) => void;
}

function CoverDesignSection({
  cd, brandingRules, characterComposition, optionalAddons, islamicMotifs, avoidCover, selectedTplId, patch,
}: CoverDesignSectionProps) {
  const { data: templates = [] } = useCoverTemplates();

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Cover artwork rules injected into every cover generation prompt. Start by picking a visual style below, then refine the details.
      </p>

      {/* ── Visual Template Picker ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-rose-700 dark:text-rose-400">Cover Style Template</Label>
        <p className="text-xs text-muted-foreground">Pick the overall visual style that AI will use when generating your book covers. You can still override any detail below.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {templates.map((tpl) => {
            const SvgComponent = COVER_TEMPLATE_SVG_MAP[tpl._id];
            const isSelected = selectedTplId === tpl._id;
            return (
              <button
                key={tpl._id}
                type="button"
                onClick={() => patch({ selectedCoverTemplate: isSelected ? null : tpl._id })}
                className={cn(
                  "group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all duration-200 text-left hover:shadow-md",
                  isSelected
                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 shadow-md"
                    : "border-border hover:border-rose-300 bg-background"
                )}
              >
                {/* Thumbnail */}
                <div className="w-full rounded-lg overflow-hidden shadow-sm" style={{ aspectRatio: "5/7" }}>
                  {COVER_TEMPLATE_PNG_MAP[tpl._id] ? (
                    <img
                      src={COVER_TEMPLATE_PNG_MAP[tpl._id]}
                      alt={tpl.name}
                      className="w-full h-full object-cover"
                    />
                  ) : SvgComponent ? <SvgComponent /> : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Frame className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {/* Name */}
                <span className={cn(
                  "text-xs font-medium text-center leading-tight",
                  isSelected ? "text-rose-700 dark:text-rose-400" : "text-foreground"
                )}>
                  {tpl.name}
                </span>
                {/* Palette dots */}
                <div className="flex gap-1">
                  {tpl.palette.slice(0, 4).map((hex: string) => (
                    <span key={hex} className="w-3 h-3 rounded-full border border-white/50 shadow-sm" style={{ backgroundColor: hex }} />
                  ))}
                </div>
                {/* Selected checkmark */}
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedTplId && templates.find(t => t._id === selectedTplId) && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 p-3 space-y-1">
            {(() => {
              const tpl = templates.find(t => t._id === selectedTplId)!;
              return (
                <>
                  <p className="text-xs font-medium text-rose-700 dark:text-rose-400">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-medium">Typography:</span> {tpl.typography}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-medium">Atmosphere:</span> {tpl.atmosphere}</p>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── Fine-tune details ──────────────────────────────────────────────── */}
      <div className="space-y-4 pt-2 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fine-tune Details</p>

        {/* ── Title Placement visual picker ── */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Title Placement</Label>
          <div className="grid grid-cols-3 gap-2">
            {TITLE_PLACEMENT_OPTIONS.map(opt => {
              const isSel = cd.titlePlacement === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => patch({ titlePlacement: isSel ? "" : opt.value })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-center hover:shadow-sm",
                    isSel ? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 shadow-sm" : "border-border hover:border-rose-300 bg-background"
                  )}>
                  <div className="w-12 h-12">{opt.icon}</div>
                  <span className={cn("text-[10px] font-semibold", isSel ? "text-rose-700" : "text-foreground")}>{opt.label}</span>
                </button>
              );
            })}
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
    </div>
  );
}

// ─── Inline custom-tag inputs (extracted to respect rules of hooks) ───────────
function CustomTraitInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <>
      <Input value={val} onChange={e => setVal(e.target.value)}
        placeholder="Add custom trait…" className="text-xs h-8 flex-1"
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
      <Button variant="outline" size="sm" className="h-8 px-2"
        onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
        <Plus className="w-3 h-3" />
      </Button>
    </>
  );
}

function CustomExprInput({ onAdd }: { onAdd: (v: string) => void }) {
  const [val, setVal] = useState("");
  return (
    <>
      <Input value={val} onChange={e => setVal(e.target.value)}
        placeholder="e.g. Copies parent's wudu without being asked…" className="text-xs h-8 flex-1"
        onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
      <Button variant="outline" size="sm" className="h-8 px-2"
        onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
        <Plus className="w-3 h-3" />
      </Button>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const { data: kbs = [], isLoading } = useKnowledgeBases();
  const createMutation = useCreateKnowledgeBase();
  const deleteMutation = useDeleteKnowledgeBase();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { canCreateKnowledgeBase, limits, usage } = usePlanLimits();
  const [kbGateOpen, setKbGateOpen] = useState(false);

  const handleOpenCreate = () => {
    if (!canCreateKnowledgeBase) { setKbGateOpen(true); return; }
    setShowCreate(true);
  };
  const { universes } = useUniverses();

  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [newItem, setNewItem] = useState("");

  // Sync active workflow/section from the sidebar store
  const kbNav = useKbNavStore();
  const activeWorkflow = kbNav.activeWorkflow as WorkflowId;
  const activeSection = kbNav.activeSection as SectionId;
  const setActiveSection = (id: SectionId) => kbNav.setKbNav(activeWorkflow, id);
  const setActiveWorkflow = (id: WorkflowId) => {
    const wf = WORKFLOWS.find(w => w.id === id);
    kbNav.setKbNav(id, wf ? (wf.sections[0] as SectionId) : activeSection);
  };

  // When a KB is selected, reset to first section
  useEffect(() => {
    if (selectedKB) kbNav.setKbNav("faith", "islamicValues");
  }, [selectedKB?._id ?? selectedKB?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Structured new-item states
  const [newDua, setNewDua] = useState({ arabic: "", transliteration: "", meaning: "", when: "" });
  const [newVocab, setNewVocab] = useState({ word: "", definition: "", example: "", type: "" });
  const [newCharGuide, setNewCharGuide] = useState<CharacterGuide>({
    characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "",
    personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [],
    duaStyle: "", islamicTraits: [], faithExamples: [],
  });
  const [selectedCharName, setSelectedCharName] = useState<string>("");

  // Create form — name + universe + optional starter template
  const [form, setForm] = useState({ name: "", universeId: "", starterTemplateId: "" });
  const [createStep, setCreateStep] = useState<"template" | "details">("template");
  const { data: kbTemplates = [] } = useKBTemplates();

  const updateMutation = useUpdateKnowledgeBase(selectedKB?.id || "");
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

      // Apply starter template fields if one was selected
      if (form.starterTemplateId) {
        const tpl = kbTemplates.find((t: any) => t._id === form.starterTemplateId);
        if (tpl) {
          const filled = await knowledgeBasesApi.update(
            created.id || (created as any)._id,
            {
              islamicValues: tpl.islamicValues || [],
              duas: tpl.duas || [],
              avoidTopics: tpl.avoidTopics || [],
              backgroundSettings: tpl.backgroundSettings,
              coverDesign: tpl.coverDesign,
              bookFormatting: tpl.bookFormatting,
              underSixDesign: tpl.underSixDesign,
            } as any
          );
          setSelectedKB(filled as any);
        } else {
          setSelectedKB(created);
        }
      } else {
        setSelectedKB(created);
      }

      toast({ title: "Knowledge base created" });
      setShowCreate(false);
      setForm({ name: "", universeId: "", starterTemplateId: "" });
      setCreateStep("template");
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
      case "islamicValues": return kb.islamicValues?.length || 0;
      case "duas": return kb.duas?.length || 0;
      case "vocabulary": return kb.vocabulary?.length || 0;
      case "avoidTopics": return kb.avoidTopics?.length || 0;
      case "characterGuides": return kb.characterGuides?.length || 0;
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
        const customItems = items.filter(v => !ISLAMIC_VALUE_PRESETS.some(p => p.value === v));
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tap the illustrated tiles to add Islamic values. They're woven into every story and illustration prompt.
            </p>

            {items.length === 0 && (
              <div className="rounded-xl border border-violet-200 bg-violet-50 dark:bg-violet-950/30 px-4 py-3">
                <p className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-0.5">Start here — pick your core values</p>
                <p className="text-xs text-violet-600 dark:text-violet-400">
                  These Islamic themes shape every chapter, illustration prompt, and du'a placement. Select at least 2–3 for best AI results.
                </p>
              </div>
            )}

            {/* Visual preset tiles */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ISLAMIC_VALUE_PRESETS.map(preset => {
                const isSelected = items.includes(preset.value);
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? items.filter(v => v !== preset.value)
                        : [...items, preset.value];
                      save({ islamicValues: next });
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-center hover:shadow-sm",
                      isSelected
                        ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-sm"
                        : "border-border hover:border-violet-300 bg-background"
                    )}
                  >
                    <div className="w-11 h-11">{preset.icon}</div>
                    <span className={cn(
                      "text-[10px] font-semibold leading-tight",
                      isSelected ? "text-violet-700 dark:text-violet-400" : "text-foreground"
                    )}>
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                        <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom text values (not from presets) */}
            {customItems.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Custom Values</p>
                {customItems.map(v => (
                  <ItemRow key={v} text={v} onRemove={() => save({ islamicValues: items.filter(item => item !== v) })} />
                ))}
              </div>
            )}

            {/* Custom input */}
            <AddRow placeholder="Add a custom value e.g. Gratitude toward nature..." value={newItem} onChange={setNewItem}
              onAdd={() => { if (!newItem.trim()) return; save({ islamicValues: [...items, newItem.trim()] }); setNewItem(""); }}
              loading={updateMutation.isPending} />
          </div>
        );
      }

      case "duas": {
        const duas = getArr<any>("duas");
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Du'as placed naturally in story moments. AI uses the "when" context to decide the right placement.</p>

            {/* Existing du'a cards — styled beautifully */}
            {duas.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {duas.map((d: any, i: number) => {
                  const contextOpt = DUA_CONTEXT_OPTIONS.find(o => o.value === d.when);
                  return (
                    <div key={i} className="relative rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20 p-4 group">
                      <button
                        onClick={() => save({ duas: duas.filter((_: any, j: number) => j !== i) })}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      {/* Arabic text */}
                      {d.arabic && (
                        <p className="text-right text-lg font-semibold text-blue-900 dark:text-blue-200 leading-loose mb-1" dir="rtl" lang="ar">
                          {d.arabic}
                        </p>
                      )}
                      {/* Transliteration */}
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-300 italic">{d.transliteration}</p>
                      {/* Meaning */}
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">"{d.meaning}"</p>
                      {/* When context chip */}
                      {d.when && (
                        <div className="mt-2 flex items-center gap-1.5">
                          {contextOpt && <span className="w-5 h-5 shrink-0">{contextOpt.icon}</span>}
                          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                            {d.when}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!duas.length && (
              <div className="text-center py-8 border-2 border-dashed border-blue-100 rounded-xl">
                <p className="text-sm text-muted-foreground">No du'as yet — add the first one below</p>
              </div>
            )}

            {/* Add du'a form */}
            <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
              <SectionLabel>Add Du'a</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Arabic (optional)</Label>
                  <Input placeholder="بِسْمِ اللَّهِ" value={newDua.arabic} onChange={e => setNewDua({ ...newDua, arabic: e.target.value })} className="text-right" dir="rtl" lang="ar" /></div>
                <div><Label className="text-xs">Transliteration *</Label>
                  <Input placeholder="Bismillah" value={newDua.transliteration} onChange={e => setNewDua({ ...newDua, transliteration: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Meaning *</Label>
                  <Input placeholder="In the name of Allah" value={newDua.meaning} onChange={e => setNewDua({ ...newDua, meaning: e.target.value })} /></div>
              </div>

              {/* Visual context picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">When is it used? (tap to pick)</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {DUA_CONTEXT_OPTIONS.map(opt => {
                    const isSel = newDua.when === opt.value;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setNewDua({ ...newDua, when: isSel ? "" : opt.value })}
                        className={cn(
                          "flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 transition-all text-center",
                          isSel ? "border-blue-500 bg-blue-50" : "border-border hover:border-blue-300"
                        )}>
                        <div className="w-8 h-8">{opt.icon}</div>
                        <span className="text-[9px] font-medium leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
                {!DUA_CONTEXT_OPTIONS.some(o => o.value === newDua.when) && (
                  <Input className="text-xs mt-1" placeholder="Or type a custom context…"
                    value={newDua.when} onChange={e => setNewDua({ ...newDua, when: e.target.value })} />
                )}
              </div>

              <Button variant="outline" size="sm" disabled={!newDua.transliteration || !newDua.meaning || updateMutation.isPending}
                onClick={() => { save({ duas: [...duas, { ...newDua }] }); setNewDua({ arabic: "", transliteration: "", meaning: "", when: "" }); }}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                Add Du'a
              </Button>
            </div>
          </div>
        );
      }

      case "vocabulary": {
        const vocab = getArr<any>("vocabulary");
        const vocabType = (newVocab as any).type || "";
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Islamic/Arabic vocabulary. AI uses these correctly in prose and they appear in glossary pages.</p>

            {/* Visual word cards */}
            {vocab.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vocab.map((v: any, i: number) => {
                  const typeOpt = VOCAB_TYPE_OPTIONS.find(o => o.value === v.type);
                  return (
                    <div key={i} className="relative rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 p-4 group">
                      <button
                        onClick={() => save({ vocabulary: vocab.filter((_: any, j: number) => j !== i) })}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-start gap-3">
                        {typeOpt && <div className="w-10 h-10 shrink-0">{typeOpt.icon}</div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-orange-900 dark:text-orange-200">{v.word}</p>
                          <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">{v.definition}</p>
                          {v.example && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic">e.g. {v.example}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {!vocab.length && (
              <div className="text-center py-8 border-2 border-dashed border-orange-100 rounded-xl">
                <p className="text-sm text-muted-foreground">No vocabulary yet — add the first word below</p>
              </div>
            )}

            {/* Add word form */}
            <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
              <SectionLabel>Add Word</SectionLabel>

              {/* Word type visual picker */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Word Type (tap to pick)</Label>
                <div className="grid grid-cols-5 gap-2">
                  {VOCAB_TYPE_OPTIONS.map(opt => {
                    const isSel = vocabType === opt.value;
                    return (
                      <button key={opt.value} type="button"
                        onClick={() => setNewVocab({ ...newVocab, type: isSel ? "" : opt.value })}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center",
                          isSel ? "border-orange-500 bg-orange-50" : "border-border hover:border-orange-300"
                        )}>
                        <div className="w-9 h-9">{opt.icon}</div>
                        <span className="text-[9px] font-medium leading-tight">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Word *</Label>
                  <Input placeholder="Alhamdulillah" value={newVocab.word} onChange={e => setNewVocab({ ...newVocab, word: e.target.value })} /></div>
                <div><Label className="text-xs">Definition *</Label>
                  <Input placeholder="All praise is for Allah" value={newVocab.definition} onChange={e => setNewVocab({ ...newVocab, definition: e.target.value })} /></div>
                <div className="col-span-2"><Label className="text-xs">Story Example (shows AI how to use it naturally)</Label>
                  <Input placeholder='"Alhamdulillah!" said Zahra, hugging her mama.' value={newVocab.example} onChange={e => setNewVocab({ ...newVocab, example: e.target.value })} /></div>
              </div>
              <Button variant="outline" size="sm" disabled={!newVocab.word || !newVocab.definition || updateMutation.isPending}
                onClick={() => { save({ vocabulary: [...vocab, { ...newVocab }] }); setNewVocab({ word: "", definition: "", example: "", type: "" }); }}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                Add Word
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
        return (
          <KBBackgroundSettings
            bs={bs}
            onSave={async (update) => { await save(update as any); }}
            isSaving={updateMutation.isPending}
          />
        );
      }

      case "bookFormatting": {
        return (
          <KBBookFormatting
            kb={selectedKB}
            onSave={async (update) => { await save(update as any); }}
            isSaving={updateMutation.isPending}
          />
        );
      }


      case "coverDesign": {
        const cd = (selectedKB as any)?.coverDesign || {};
        return (
          <KBCoverDesign
            cd={cd}
            onSave={async (update) => { await save(update as any); }}
            isSaving={updateMutation.isPending}
          />
        );
      }

      case "underSixDesign": {
        const u = (selectedKB as any)?.underSixDesign || {};
        const fontPreferences = u.fontPreferences || [];
        const specialRules = u.specialRules || [];
        const patchU = (partial: object) => save({ underSixDesign: { ...u, ...partial } } as any);

        const WORD_COUNT_TILES = [
          { value: 5, label: "5 words", desc: "Tiny tots", color: "bg-lime-100 border-lime-400" },
          { value: 10, label: "10 words", desc: "Picture book", color: "bg-green-100 border-green-400" },
          { value: 15, label: "15 words", desc: "Early reader", color: "bg-teal-100 border-teal-400" },
          { value: 20, label: "20 words", desc: "Short story", color: "bg-cyan-100 border-cyan-400" },
        ];
        const currentWords = u.maxWordsPerSpread ?? 10;

        return (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Layout, text, and illustration rules for spreads-only books (ages under 6).</p>

            {/* ── Max Words visual tiles ── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Max Words Per Spread — tap to choose</Label>
              <div className="grid grid-cols-4 gap-2">
                {WORD_COUNT_TILES.map(t => (
                  <button key={t.value} type="button"
                    onClick={() => patchU({ maxWordsPerSpread: t.value })}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center",
                      currentWords === t.value ? t.color + " shadow-sm" : "border-border hover:border-lime-300 bg-background"
                    )}>
                    <span className="text-2xl font-black text-foreground">{t.value}</span>
                    <span className="text-[10px] font-semibold">{t.label}</span>
                    <span className="text-[9px] text-muted-foreground">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Page Layout visual picker ── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Page Layout — how is each spread structured?</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAGE_LAYOUT_OPTIONS.map(opt => {
                  const isSel = u.pageLayout === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => patchU({ pageLayout: isSel ? "" : opt.value })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-center hover:shadow-sm",
                        isSel ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-sm" : "border-border hover:border-lime-300 bg-background"
                      )}>
                      <div className="w-12 h-12">{opt.icon}</div>
                      <span className={cn("text-[10px] font-semibold leading-tight", isSel ? "text-lime-700" : "text-foreground")}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Illustration Style visual picker ── */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Illustration Style — how should artwork look?</Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {ILLUSTRATION_STYLE_OPTIONS.map(opt => {
                  const isSel = u.illustrationStyle === opt.value;
                  return (
                    <button key={opt.value} type="button"
                      onClick={() => patchU({ illustrationStyle: isSel ? "" : opt.value })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-center hover:shadow-sm",
                        isSel ? "border-lime-500 bg-lime-50 dark:bg-lime-950/30 shadow-sm" : "border-border hover:border-lime-300 bg-background"
                      )}>
                      <div className="w-11 h-11">{opt.icon}</div>
                      <span className={cn("text-[10px] font-semibold leading-tight", isSel ? "text-lime-700" : "text-foreground")}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Reading type + other fields ── */}
            <div className="grid grid-cols-2 gap-3">
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
              <div>
                <Label className="text-xs">Color Palette</Label>
                <Input placeholder="e.g. Bright, joyful, high contrast"
                  defaultValue={u.colorPalette || ""} onBlur={e => patchU({ colorPalette: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Font Style</Label>
                <Input placeholder="e.g. Rounded, large, dyslexia-friendly"
                  defaultValue={u.fontStyle || ""} onBlur={e => patchU({ fontStyle: e.target.value })} />
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
          <KBCharacterVoiceBuilder
            characters={universeChars}
            guides={guides as any}
            isSaving={updateMutation.isPending}
            onSave={(guide) => {
              const { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples, ...rest } = guide as any;
              save({ characterGuides: [...guides.filter((g: CharacterGuide) => g.characterName !== guide.characterName), { ...rest, characterName: guide.characterName, faithGuide: { faithTone, faithExpressions, duaStyle, islamicTraits, faithExamples } }] } as any);
            }}
            onDelete={(name) => {
              save({ characterGuides: guides.filter((g: CharacterGuide) => g.characterName !== name) } as any);
            }}
          />
        );

      }

      default: return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeWorkflowDef = WORKFLOWS.find(w => w.id === activeWorkflow);
  const currentSections = SECTIONS.filter(s => activeWorkflowDef?.sections.includes(s.id as any));
  const FULL_WIDTH_SECTIONS = new Set(["characterGuides", "backgroundSettings", "bookFormatting", "coverDesign"]);

  return (
    <>
    <SubscriptionGateModal
      open={kbGateOpen}
      onOpenChange={setKbGateOpen}
      workflow="knowledge-base"
      reason="limit"
      usageInfo={{ used: usage.knowledgeBases, limit: limits.knowledgeBases, label: "knowledge bases" }}
    />
    <AppLayout
      title="Knowledge Base"
      subtitle="Define the universe rules that shape every story, chapter, and illustration"
      actions={
        <Button variant="hero" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />New Knowledge Base
        </Button>
      }
    >
      {/* ── Active KB selector (replaces chip bar) ────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground shrink-0">Active Knowledge Base</p>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select
              value={selectedKB?.id || selectedKB?._id || ""}
              onValueChange={(id) => {
                const kb = kbs.find((k: KnowledgeBase) => k.id === id || (k as any)._id === id);
                if (kb) { setSelectedKB(kb); kbNav.setKbNav("faith", "islamicValues"); setNewItem(""); setCollapsedSections(new Set()); }
              }}
            >
              <SelectTrigger className="w-64 h-9">
                <BookMarked className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
                <SelectValue placeholder="Select a knowledge base…" />
              </SelectTrigger>
              <SelectContent>
                {kbs.map((kb: KnowledgeBase) => {
                  const id = kb.id || (kb as any)._id;
                  return (
                    <SelectItem key={id} value={id}>
                      {kb.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Delete selected KB */}
        {selectedKB && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive gap-1.5 shrink-0"
            onClick={() => setShowDelete(selectedKB.id || (selectedKB as any)._id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>
        )}
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
          <Button variant="hero" onClick={handleOpenCreate}>
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
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 text-xs border-violet-300 text-violet-700 hover:bg-violet-50 hover:border-violet-400"
              onClick={() => navigate("/app/kb-templates")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Browse Templates
            </Button>
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

          {/* ── Faith & Language → single stepper card ── */}
          {activeWorkflow === "faith" ? (
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5">
                <KBFaithLanguageStepper
                  kb={selectedKB}
                  onSave={async (update) => { await save(update as any); }}
                  isSaving={updateMutation.isPending}
                />
              </div>
            </div>
          ) : (
            /* All other tabs — single-column full-width cards */
            <div className="space-y-5">
              {currentSections.map(sec => {
                const style = SECTION_STYLE[sec.id];
                const Icon = sec.icon;
                const count = getSectionCount(sec.id);
                const isCollapsed = collapsedSections.has(sec.id);

                return (
                  <div key={sec.id} className="rounded-2xl border overflow-hidden bg-card shadow-sm">
                    {/* Card header */}
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
                      <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0", isCollapsed && "-rotate-90")} />
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
          )}
        </>
      )}

      {/* ── Create Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={open => { setShowCreate(open); if (!open) { setCreateStep("template"); setForm({ name: "", universeId: "", starterTemplateId: "" }); } }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {createStep === "template" ? "Choose a Starter Template" : "Name Your Knowledge Base"}
            </DialogTitle>
            <DialogDescription>
              {createStep === "template"
                ? "Pick a pre-built template to jumpstart your Knowledge Base with values, du'as, and scene rules — or start blank."
                : "Give your Knowledge Base a name and link it to a universe."}
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold", createStep === "template" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>1</span>
            <span className={createStep === "template" ? "text-foreground font-medium" : ""}>Choose Template</span>
            <span className="text-muted-foreground">→</span>
            <span className={cn("flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold", createStep === "details" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>2</span>
            <span className={createStep === "details" ? "text-foreground font-medium" : ""}>Details</span>
          </div>

          {createStep === "template" ? (
            <div className="space-y-3 py-2">
              {/* Blank option */}
              <button
                type="button"
                onClick={() => { setForm(f => ({ ...f, starterTemplateId: "" })); }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3",
                  form.starterTemplateId === ""
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                )}
              >
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-semibold">Start Blank</p>
                  <p className="text-xs text-muted-foreground">Empty KB — fill everything yourself</p>
                </div>
                {form.starterTemplateId === "" && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                )}
              </button>

              {/* Template grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {kbTemplates.map((tpl: any) => {
                  const SvgComp = KB_TEMPLATE_SVG_MAP[tpl._id];
                  const isSelected = form.starterTemplateId === tpl._id;
                  return (
                    <button
                      key={tpl._id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, starterTemplateId: tpl._id }))}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:shadow-md text-center",
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"
                      )}
                    >
                      {/* SVG thumbnail */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden shadow-sm">
                        {SvgComp ? <SvgComp /> : <div className="w-full h-full bg-muted flex items-center justify-center text-2xl">{tpl.icon}</div>}
                      </div>
                      <div>
                        <p className="text-xs font-semibold leading-tight">{tpl.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{tpl.ageRange}</p>
                      </div>
                      {/* Palette dots */}
                      <div className="flex gap-1">
                        {tpl.palette?.slice(0, 4).map((hex: string) => (
                          <span key={hex} className="w-2.5 h-2.5 rounded-full border border-white/50" style={{ backgroundColor: hex }} />
                        ))}
                      </div>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Template description preview */}
              {form.starterTemplateId && (() => {
                const tpl = kbTemplates.find((t: any) => t._id === form.starterTemplateId);
                return tpl ? (
                  <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{tpl.icon} {tpl.name}</span> — {tpl.description}
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {tpl.islamicValues?.slice(0, 3).map((v: string) => (
                        <span key={v} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px]">{v}</span>
                      ))}
                      {(tpl.islamicValues?.length ?? 0) > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{tpl.islamicValues.length - 3} more values</span>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g., Zubair Universe — Full KB" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onKeyDown={e => { if (e.key === "Enter") handleCreate(); }}
                  autoFocus />
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
              {form.starterTemplateId && (() => {
                const tpl = kbTemplates.find((t: any) => t._id === form.starterTemplateId);
                return tpl ? (
                  <div className="flex items-center gap-2 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                    <span>{tpl.icon}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Template: {tpl.name}</span>
                    <span className="text-muted-foreground">— will be pre-filled after creation</span>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowCreate(false); setCreateStep("template"); setForm({ name: "", universeId: "", starterTemplateId: "" }); }}>
              Cancel
            </Button>
            {createStep === "template" ? (
              <Button variant="hero" onClick={() => setCreateStep("details")}>
                Next →
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateStep("template")}>← Back</Button>
                <Button variant="hero" onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Create
                </Button>
              </>
            )}
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
    </>
  );
}