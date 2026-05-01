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
  Dna, ChevronRight as ChevronRightIcon,
  Download, Upload, Copy,
  CheckCircle2, CircleAlert,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useKbNavStore } from "@/lib/store/kbNavStore";
import { useGlobalJourneyStore } from "@/lib/store/globalJourneyStore";
import { useToast } from "@/hooks/use-toast";
import {
  useKnowledgeBases, useCreateKnowledgeBase, useUpdateKnowledgeBase, useDeleteKnowledgeBase,
  useCoverTemplates,
} from "@/hooks/useKnowledgeBase";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import {
  buildKBPayloadFromTemplate,
  DEFAULT_KB_STARTER_TEMPLATES,
  getKBStarterTemplateById,
} from "@/constants/kbStarterTemplates";
import { COVER_TEMPLATE_SVG_MAP, COVER_TEMPLATE_PNG_MAP } from "@/components/shared/CoverTemplateSvgs";
import {
  TIME_OF_DAY_OPTIONS, CAMERA_HINT_OPTIONS, TONE_OPTIONS, COLOR_STYLE_OPTIONS,
  KB_TEMPLATE_SVG_MAP, ISLAMIC_VALUE_PRESETS,
  DUA_CONTEXT_OPTIONS, VOCAB_TYPE_OPTIONS,
  SPEAKING_STYLE_OPTIONS, FAITH_TONE_OPTIONS, LITERARY_ROLE_OPTIONS,
  PAGE_LAYOUT_OPTIONS, ILLUSTRATION_STYLE_OPTIONS, TITLE_PLACEMENT_OPTIONS,
  FAITH_EXPRESSION_PRESETS,
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
import { KBStrengthScore } from "@/components/kb/KBStrengthScore";
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

// ─── Vocabulary starter library ───────────────────────────────────────────────
const VOCAB_STARTER = [
  { word: "Quran",        wrongTerm: "Koran",      type: "Arabic word",    definition: "The holy book of Islam, revealed to Prophet Muhammad ﷺ." },
  { word: "Salah",        wrongTerm: "Namaz",      type: "Arabic word",    definition: "The five daily prayers obligatory for every Muslim." },
  { word: "Masjid",       wrongTerm: "Mosque",     type: "Arabic word",    definition: "The place of worship for Muslims." },
  { word: "Eid",          wrongTerm: "Eid festival",type: "Arabic word",   definition: "Two annual Islamic celebrations — Eid al-Fitr and Eid al-Adha." },
  { word: "Du'a",         wrongTerm: "Dua",        type: "Arabic word",    definition: "A personal supplication or prayer made to Allah." },
  { word: "Alhamdulillah",wrongTerm: "",           type: "expression",     definition: "All praise and thanks belong to Allah." },
  { word: "Bismillah",    wrongTerm: "",           type: "expression",     definition: "In the name of Allah — said before beginning an action." },
  { word: "Insha'Allah",  wrongTerm: "Inshallah",  type: "expression",    definition: "If Allah wills — said when speaking of future plans or hopes." },
  { word: "Masha'Allah",  wrongTerm: "Mashallah",  type: "expression",    definition: "What Allah has willed — said to express admiration or gratitude." },
  { word: "SubhanAllah",  wrongTerm: "",           type: "expression",     definition: "Glory be to Allah — said in praise, wonder, or surprise." },
  { word: "Baba",         wrongTerm: "Dad / Father",type: "value word",   definition: "Affectionate Islamic term for father, used across many Muslim cultures." },
  { word: "Mama",         wrongTerm: "Mom / Mum",  type: "value word",    definition: "Affectionate term for mother." },
  { word: "Jiddo",        wrongTerm: "Grandpa",    type: "value word",    definition: "Grandfather — warm Arabic family term." },
  { word: "Teta / Tata",  wrongTerm: "Grandma",    type: "value word",    definition: "Grandmother — warm Arabic family term." },
  { word: "Khala",        wrongTerm: "Aunt",       type: "value word",    definition: "Maternal aunt — used respectfully in Muslim households." },
  { word: "Ammo",         wrongTerm: "Uncle",      type: "value word",    definition: "Paternal uncle — affectionate respectful address." },
  { word: "Sadaqah",      wrongTerm: "Charity",    type: "Arabic word",   definition: "Voluntary charitable giving for the sake of Allah." },
  { word: "Hijab",        wrongTerm: "Headscarf",  type: "Arabic word",   definition: "The Islamic modest covering worn by Muslim women." },
  { word: "Tasbih",       wrongTerm: "Prayer beads",type: "Arabic word",  definition: "Prayer beads used while doing dhikr (remembrance of Allah)." },
  { word: "Dhikr",        wrongTerm: "",           type: "Arabic word",   definition: "Remembrance of Allah through repeated phrases and supplications." },
];

// ─── Avoid Topics starter checklist ──────────────────────────────────────────
type AvoidSeverity = "all" | "under-12" | "under-6";
interface AvoidRule { topic: string; severity: AvoidSeverity; category: string; }

const AVOID_STARTER: AvoidRule[] = [
  { topic: "Magic, spells, or witchcraft in the haram sense",          severity: "all",      category: "Faith" },
  { topic: "Shirk (associating partners with Allah)",                  severity: "all",      category: "Faith" },
  { topic: "Mocking or disrespecting religious practices",             severity: "all",      category: "Faith" },
  { topic: "Romantic relationships or dating between pre-teens",       severity: "all",      category: "Appropriateness" },
  { topic: "Physical violence or graphic harm",                        severity: "all",      category: "Safety" },
  { topic: "Haram food content (pork, alcohol, intoxicants)",          severity: "all",      category: "Halal" },
  { topic: "Halloween, Christmas, or non-Islamic celebrations as Islamic", severity: "all",  category: "Faith" },
  { topic: "Inappropriate dress or immodest depictions",               severity: "all",      category: "Modesty" },
  { topic: "Jump-scares, horror, or nightmare-inducing content",       severity: "under-6",  category: "Safety" },
  { topic: "Death or grief described in graphic detail",               severity: "under-6",  category: "Safety" },
  { topic: "Bullying shown without consequence or resolution",         severity: "under-6",  category: "Safety" },
  { topic: "Preachy, lecture-style narration",                        severity: "all",      category: "Tone" },
  { topic: "Stereotyping or cultural generalisation",                  severity: "all",      category: "Tone" },
  { topic: "Conspiracy theories or divisive political content",        severity: "under-12", category: "Tone" },
];

const SEVERITY_LABELS: Record<AvoidSeverity, { label: string; color: string }> = {
  "all":      { label: "All Ages",  color: "bg-red-100 text-red-700" },
  "under-12": { label: "Under 12", color: "bg-amber-100 text-amber-700" },
  "under-6":  { label: "Under 6",  color: "bg-blue-100 text-blue-700" },
};

// ─── Workflow tabs ────────────────────────────────────────────────────────────
const WORKFLOWS = [
  {
    id: "faith",
    label: "What the stories believe",
    sublabel: "Faith & Language",
    description: "Islamic values, du'as, vocabulary & topics to avoid",
    icon: Moon,
    sections: ["islamicValues", "duas", "vocabulary", "avoidTopics"],
  },
  {
    id: "story",
    label: "How the characters sound",
    sublabel: "Character Voice",
    description: "Per-character speaking style, background lore & faith integration",
    icon: UserRound,
    sections: ["characterGuides"],
  },
  {
    id: "visual",
    label: "What the world looks like",
    sublabel: "Background",
    description: "Scene backgrounds, lighting, locations & visual style",
    icon: TreePine,
    sections: ["backgroundSettings"],
  },
  {
    id: "bookFormat",
    label: "How the books are shaped",
    sublabel: "Book Format",
    description: "Book pacing, word count & layout rules per age group",
    icon: ListOrdered,
    sections: ["bookFormatting"],
  },
  {
    id: "cover",
    label: "How the covers are branded",
    sublabel: "Cover Design",
    description: "Front & back cover composition, atmosphere & typography",
    icon: Frame,
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
  const { setKbVisited } = useGlobalJourneyStore();
  useEffect(() => { setKbVisited(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
  const [newValueHow, setNewValueHow] = useState("");
  const [newAvoidTopic, setNewAvoidTopic] = useState("");
  const [newAvoidSeverity, setNewAvoidSeverity] = useState<AvoidSeverity>("all");
  const [showDNAModal, setShowDNAModal] = useState(false);
  const [dnaModalPanel, setDnaModalPanel] = useState(0);
  const [pendingWorkflow, setPendingWorkflow] = useState<WorkflowId | null>(null);
  useEffect(() => {
    if (!localStorage.getItem("ns_kb_dna_intro_seen")) {
      setShowDNAModal(true);
    }
  }, []);

  // Sync active workflow/section from the sidebar store
  const kbNav = useKbNavStore();
  const activeWorkflow = kbNav.activeWorkflow as WorkflowId;
  const activeSection = kbNav.activeSection as SectionId;
  const setActiveSection = (id: SectionId) => kbNav.setKbNav(activeWorkflow, id);
  const setActiveWorkflow = (id: WorkflowId) => {
    const wf = WORKFLOWS.find(w => w.id === id);
    kbNav.setKbNav(id, wf ? (wf.sections[0] as SectionId) : activeSection);
  };

  // Reset navigation only when a different KB is selected (not on every save)
  useEffect(() => {
    if (!selectedKB) return;
    kbNav.setKbNav("faith", "islamicValues");
  }, [selectedKB?._id ?? selectedKB?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync completion dots whenever KB data changes (does NOT reset navigation)
  useEffect(() => {
    if (!selectedKB) return;
    const kb = selectedKB as any;
    const hasFaith = (kb.islamicValues?.length || 0) + (kb.duas?.length || 0) + (kb.vocabulary?.length || 0) + (kb.avoidTopics?.length || 0) > 0;
    const hasStory = (kb.characterGuides?.length || 0) > 0;
    const hasVisual = !!(kb.backgroundSettings?.junior?.tone || kb.backgroundSettings?.middleGrade?.tone || (kb.backgroundSettings?.junior?.locations?.length || 0) > 0 || (kb.backgroundSettings?.middleGrade?.locations?.length || 0) > 0);
    const hasBookFormat = !!(kb.bookFormatting?.middleGrade?.chapterRange || kb.bookFormatting?.middleGrade?.sceneLength || kb.underSixDesign?.pageCount || kb.underSixDesign?.maxWordsPerSpread);
    const hasCover = !!(kb.coverDesign?.brandingRules?.length || kb.coverDesign?.selectedCoverTemplate);
    const done: string[] = [];
    if (hasFaith) done.push("faith");
    if (hasStory) done.push("story");
    if (hasVisual) done.push("visual");
    if (hasBookFormat) done.push("bookFormat");
    if (hasCover) done.push("cover");
    kbNav.setCompletedWorkflows(done);
  }, [selectedKB?._id ?? selectedKB?.id, selectedKB?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // ─── Export / Import / Duplicate state ────────────────────────────────────
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [dupForm, setDupForm] = useState({ name: "", universeId: "" });

  const handleExport = async () => {
    if (!selectedKB) return;
    const id = selectedKB.id || (selectedKB as any)._id;
    setExporting(true);
    try {
      const data = await knowledgeBasesApi.exportKB(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kb-${selectedKB.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "KB exported" });
    } catch (err) {
      toast({ title: "Export failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // Prompt for name + universe via a simple approach: use selectedKB's universe or first universe
      const targetUniverseId = (selectedKB as any)?.universeId || universes[0]?.id || universes[0]?._id || "";
      if (!targetUniverseId) {
        toast({ title: "Please create a Universe first before importing", variant: "destructive" });
        return;
      }
      const baseName = data.name || file.name.replace(/\.json$/i, "");
      const kb = await knowledgeBasesApi.importKB({
        universeId: targetUniverseId,
        name: `${baseName} (imported)`,
        data,
      });
      setSelectedKB(kb as any);
      toast({ title: `"${kb.name}" imported successfully` });
    } catch (err) {
      toast({ title: "Import failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setImporting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedKB) return;
    const id = selectedKB.id || (selectedKB as any)._id;
    setDuplicating(true);
    try {
      const kb = await knowledgeBasesApi.duplicateKB(id, {
        name: dupForm.name.trim() || undefined,
        universeId: dupForm.universeId && dupForm.universeId !== "__same__" ? dupForm.universeId : undefined,
      });
      setSelectedKB(kb as any);
      setShowDuplicate(false);
      setDupForm({ name: "", universeId: "" });
      toast({ title: `"${kb.name}" duplicated` });
    } catch (err) {
      toast({ title: "Duplicate failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setDuplicating(false);
    }
  };

  useEffect(() => {
    const shouldOpenCreate = searchParams.get("create") === "1";
    if (!shouldOpenCreate) return;

    if (!canCreateKnowledgeBase) {
      setKbGateOpen(true);
      return;
    }

    const requestedTemplateId = searchParams.get("template");
    const matchedTemplate = getKBStarterTemplateById(requestedTemplateId);

    setForm((current) => ({
      ...current,
      starterTemplateId: matchedTemplate?.id ?? "",
    }));
    setCreateStep("details");
    setShowCreate(true);
    navigate("/app/knowledge-base", { replace: true });
  }, [canCreateKnowledgeBase, navigate, searchParams]);

  // Structured new-item states
  const [newDua, setNewDua] = useState({ arabic: "", transliteration: "", meaning: "", when: "" });
  const [newVocab, setNewVocab] = useState({ word: "", definition: "", example: "", type: "" });
  const [newCharGuide, setNewCharGuide] = useState<CharacterGuide>({
    characterName: "", speakingStyle: "", dialogueExamples: [], moreInfo: "",
    personalityNotes: [], literaryRole: "", faithTone: "", faithExpressions: [],
    islamicTraits: [], faithExamples: [],
  });
  const [selectedCharName, setSelectedCharName] = useState<string>("");

  // Create form — name + universe + optional starter template
  const [form, setForm] = useState({ name: "", universeId: "", starterTemplateId: "" });
  const [createStep, setCreateStep] = useState<"template" | "details">("template");
  const kbTemplates = DEFAULT_KB_STARTER_TEMPLATES;

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
        const tpl = getKBStarterTemplateById(form.starterTemplateId);
        if (tpl) {
          const filled = await knowledgeBasesApi.update(
            created.id || (created as any)._id,
            buildKBPayloadFromTemplate(tpl) as any
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
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
                      "relative w-full aspect-[3/4] rounded-xl border-2 overflow-hidden transition-all hover:shadow-md hover:scale-[1.02]",
                      isSelected
                        ? "border-violet-500 shadow-md ring-2 ring-violet-300/50"
                        : "border-border hover:border-violet-300"
                    )}
                  >
                    {/* Image fills entire card */}
                    <div className="absolute inset-0">
                      {preset.icon}
                    </div>
                    {/* Label gradient overlay at bottom */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pt-6 pb-1.5 px-1 text-center">
                      <span className="text-[11px] font-bold text-white drop-shadow-sm leading-tight">
                        {preset.label}
                      </span>
                    </div>
                    {/* Selected checkmark */}
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center shadow-md">
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
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

            {/* Custom value input */}
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Add Custom Value</p>
              <Input
                placeholder="e.g. Gratitude toward nature"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="How it should appear in stories (optional) — e.g. Characters pause to thank Allah for trees"
                value={newValueHow}
                onChange={e => setNewValueHow(e.target.value)}
                className="text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!newItem.trim() || updateMutation.isPending}
                onClick={() => {
                  if (!newItem.trim()) return;
                  const combined = newValueHow.trim()
                    ? `${newItem.trim()} — ${newValueHow.trim()}`
                    : newItem.trim();
                  save({ islamicValues: [...items, combined] });
                  setNewItem("");
                  setNewValueHow("");
                }}
              >
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                Add Value
              </Button>
            </div>
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
        const alreadyAdded = new Set(vocab.map((v: any) => v.word));
        return (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Preferred Islamic terms with wrong-term pairs. AI uses these correctly in prose and they appear in glossary pages.
            </p>

            {/* Starter library */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <SectionLabel>Starter Library — tap to add</SectionLabel>
                <span className="text-[11px] text-muted-foreground">{VOCAB_STARTER.filter(s => alreadyAdded.has(s.word)).length}/{VOCAB_STARTER.length} added</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VOCAB_STARTER.map(s => {
                  const added = alreadyAdded.has(s.word);
                  return (
                    <button
                      key={s.word}
                      type="button"
                      disabled={added || updateMutation.isPending}
                      onClick={() => save({ vocabulary: [...vocab, { word: s.word, wrongTerm: s.wrongTerm, type: s.type, definition: s.definition, example: "" }] })}
                      className={cn(
                        "relative text-left rounded-xl border-2 p-3 transition-all",
                        added
                          ? "border-emerald-300 bg-emerald-50/60 opacity-70 cursor-default dark:bg-emerald-950/20"
                          : "border-border hover:border-orange-300 hover:bg-orange-50/40 cursor-pointer"
                      )}
                    >
                      {added && <span className="absolute top-2 right-2 text-emerald-500 text-xs">✓</span>}
                      <p className="text-sm font-bold text-orange-900 dark:text-orange-200 leading-tight">{s.word}</p>
                      {s.wrongTerm && (
                        <p className="text-[10px] mt-0.5 flex items-center gap-1">
                          <span className="line-through text-red-400">{s.wrongTerm}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-emerald-700 font-medium">{s.word}</span>
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-snug">{s.definition}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Added vocabulary cards */}
            {vocab.length > 0 && (
              <div className="space-y-2">
                <SectionLabel>Your Vocabulary ({vocab.length})</SectionLabel>
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
                            {v.wrongTerm && (
                              <p className="text-[11px] mt-0.5 flex items-center gap-1 flex-wrap">
                                <span className="line-through text-red-400 bg-red-50 px-1 rounded">{v.wrongTerm}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="text-emerald-700 font-semibold">{v.word}</span>
                              </p>
                            )}
                            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">{v.definition}</p>
                            {v.example && <p className="text-[10px] text-muted-foreground mt-1 italic">e.g. {v.example}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add custom word form */}
            <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
              <SectionLabel>Add Custom Word</SectionLabel>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Word Type</Label>
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
                <div><Label className="text-xs">Correct Word *</Label>
                  <Input placeholder="Masjid" value={newVocab.word} onChange={e => setNewVocab({ ...newVocab, word: e.target.value })} /></div>
                <div><Label className="text-xs">Wrong Term to Avoid</Label>
                  <Input placeholder="Mosque" value={(newVocab as any).wrongTerm || ""} onChange={e => setNewVocab({ ...newVocab, wrongTerm: e.target.value } as any)} /></div>
                <div><Label className="text-xs">Definition *</Label>
                  <Input placeholder="Place of Islamic worship" value={newVocab.definition} onChange={e => setNewVocab({ ...newVocab, definition: e.target.value })} /></div>
                <div><Label className="text-xs">Story Example</Label>
                  <Input placeholder='"Let us go to the masjid," said Baba.' value={newVocab.example} onChange={e => setNewVocab({ ...newVocab, example: e.target.value })} /></div>
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
        const rawItems = getArr<any>("avoidTopics");
        // Normalise: legacy strings become objects; new items are already objects
        const avoidItems: AvoidRule[] = rawItems.map((item: any) =>
          typeof item === "string"
            ? { topic: item, severity: "all" as AvoidSeverity, category: "General" }
            : item
        );
        const alreadyAdded = new Set(avoidItems.map(r => r.topic));

        const removeAvoid = (idx: number) =>
          save({ avoidTopics: avoidItems.filter((_, j) => j !== idx) });

        const addFromStarter = (rule: AvoidRule) => {
          if (alreadyAdded.has(rule.topic)) return;
          save({ avoidTopics: [...avoidItems, rule] });
        };

        const addCustom = () => {
          if (!newAvoidTopic.trim()) return;
          save({ avoidTopics: [...avoidItems, { topic: newAvoidTopic.trim(), severity: newAvoidSeverity, category: "Custom" }] });
          setNewAvoidTopic("");
          setNewAvoidSeverity("all");
        };

        const groupedStarter: Record<string, AvoidRule[]> = {};
        AVOID_STARTER.forEach(r => {
          if (!groupedStarter[r.category]) groupedStarter[r.category] = [];
          groupedStarter[r.category].push(r);
        });

        return (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Topics the AI must never include in text or illustrations. Add from the starter checklist or define your own.
            </p>

            {/* Starter checklist by category */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <SectionLabel>Starter Checklist — click to add</SectionLabel>
                <span className="text-[11px] text-muted-foreground">
                  {AVOID_STARTER.filter(r => alreadyAdded.has(r.topic)).length}/{AVOID_STARTER.length} added
                </span>
              </div>
              {Object.entries(groupedStarter).map(([category, rules]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{category}</p>
                  <div className="flex flex-wrap gap-2">
                    {rules.map(rule => {
                      const added = alreadyAdded.has(rule.topic);
                      const sev = SEVERITY_LABELS[rule.severity];
                      return (
                        <button
                          key={rule.topic}
                          type="button"
                          disabled={added || updateMutation.isPending}
                          onClick={() => addFromStarter(rule)}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all",
                            added
                              ? "border-emerald-300 bg-emerald-50/60 text-emerald-700 cursor-default opacity-70 dark:bg-emerald-950/20"
                              : "border-border hover:border-red-300 hover:bg-red-50/40 cursor-pointer"
                          )}
                        >
                          {added && <span className="text-emerald-500">✓</span>}
                          <span className="leading-tight">{rule.topic}</span>
                          <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold ml-0.5", sev.color)}>
                            {sev.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Added rules list */}
            {avoidItems.length > 0 && (
              <div className="space-y-2">
                <SectionLabel>Your Rules ({avoidItems.length})</SectionLabel>
                <div className="space-y-1.5">
                  {avoidItems.map((rule, i) => {
                    const sev = SEVERITY_LABELS[rule.severity as AvoidSeverity] ?? SEVERITY_LABELS["all"];
                    return (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/40 dark:bg-red-950/10 px-3 py-2 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">{rule.topic}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn("rounded-full px-1.5 py-px text-[9px] font-semibold", sev.color)}>
                              {sev.label}
                            </span>
                            {rule.category && rule.category !== "Custom" && (
                              <span className="text-[9px] text-muted-foreground">{rule.category}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeAvoid(i)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {!avoidItems.length && (
              <p className="text-sm text-muted-foreground text-center py-4">No restrictions added yet.</p>
            )}

            {/* Custom add form */}
            <div className="border rounded-xl p-4 space-y-3 bg-muted/30">
              <SectionLabel>Add Custom Rule</SectionLabel>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Severity — who should this apply to?</Label>
                <div className="flex gap-2">
                  {(Object.entries(SEVERITY_LABELS) as [AvoidSeverity, { label: string; color: string }][]).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewAvoidSeverity(key)}
                      className={cn(
                        "flex-1 rounded-lg border-2 px-2 py-1.5 text-xs font-semibold transition-all",
                        newAvoidSeverity === key
                          ? cn("border-red-400", meta.color)
                          : "border-border hover:border-red-300 bg-background"
                      )}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Preachy, lecture-style narration..."
                  value={newAvoidTopic}
                  onChange={e => setNewAvoidTopic(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                  className="flex-1 text-sm"
                />
                <Button variant="outline" size="sm" disabled={!newAvoidTopic.trim() || updateMutation.isPending} onClick={addCustom}>
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
                  Add
                </Button>
              </div>
            </div>
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
              const { faithTone, faithExpressions, islamicTraits, faithExamples, ...rest } = guide as any;
              save({ characterGuides: [...guides.filter((g: CharacterGuide) => g.characterName !== guide.characterName), { ...rest, characterName: guide.characterName, faithGuide: { faithTone, faithExpressions, islamicTraits, faithExamples } }] } as any);
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
  const dnaStats = selectedKB ? [
    { label: "Values", value: selectedKB.islamicValues?.length || 0, tone: "text-primary" },
    { label: "Du'as", value: selectedKB.duas?.length || 0, tone: "text-emerald-600" },
    { label: "Vocab", value: selectedKB.vocabulary?.length || 0, tone: "text-secondary" },
    { label: "Voices", value: (selectedKB as any).characterGuides?.length || 0, tone: "text-primary" },
  ] : [];
  const dnaRecommendations = selectedKB ? [
    { label: "Add at least 5 values", ready: (selectedKB.islamicValues?.length || 0) >= 5, workflow: "faith" as WorkflowId },
    { label: "Add at least 5 du'as", ready: (selectedKB.duas?.length || 0) >= 5, workflow: "faith" as WorkflowId },
    { label: "Add 4 vocabulary terms", ready: (selectedKB.vocabulary?.length || 0) >= 4, workflow: "faith" as WorkflowId },
    { label: "Set character voices", ready: ((selectedKB as any).characterGuides?.length || 0) > 0, workflow: "story" as WorkflowId },
    { label: "Select background style", ready: getSectionCount("backgroundSettings") > 0, workflow: "visual" as WorkflowId },
    { label: "Define book format", ready: getSectionCount("bookFormatting") > 0, workflow: "bookFormat" as WorkflowId },
    { label: "Choose cover rules", ready: getSectionCount("coverDesign") > 0, workflow: "cover" as WorkflowId },
  ] : [];
  const completedSuggestionCount = dnaRecommendations.filter(item => item.ready).length;
  const kbAny = selectedKB as any;
  const voiceSummary = selectedKB ? (kbAny.characterGuides || []).slice(0, 4).map((g: any) =>
    `${g.characterName}: ${g.speakingStyle || g.faithGuide?.faithTone || "voice guide"}`
  ) : [];
  const backgroundSummary = selectedKB ? [
    kbAny.backgroundSettings?.junior?.tone && `Early tone: ${kbAny.backgroundSettings.junior.tone}`,
    (kbAny.backgroundSettings?.junior?.locations?.length || 0) > 0 && `Early locations: ${kbAny.backgroundSettings.junior.locations.slice(0, 4).join(", ")}`,
    kbAny.backgroundSettings?.middleGrade?.tone && `Middle tone: ${kbAny.backgroundSettings.middleGrade.tone}`,
    (kbAny.backgroundSettings?.middleGrade?.locations?.length || 0) > 0 && `Middle locations: ${kbAny.backgroundSettings.middleGrade.locations.slice(0, 4).join(", ")}`,
  ].filter(Boolean) as string[] : [];
  const bookSummary = selectedKB ? [
    kbAny.bookFormatting?.middleGrade?.chapterRange && `Chapters: ${kbAny.bookFormatting.middleGrade.chapterRange}`,
    kbAny.bookFormatting?.middleGrade?.sceneLength && `Scenes: ${kbAny.bookFormatting.middleGrade.sceneLength}`,
    kbAny.underSixDesign?.pageCount && `Under six pages: ${kbAny.underSixDesign.pageCount}`,
    kbAny.underSixDesign?.maxWordsPerSpread && `Words/spread: ${kbAny.underSixDesign.maxWordsPerSpread}`,
  ].filter(Boolean) as string[] : [];
  const coverSummary = selectedKB ? [
    kbAny.coverDesign?.selectedCoverTemplate && `Template: ${kbAny.coverDesign.selectedCoverTemplate}`,
    ...(kbAny.coverDesign?.brandingRules || []).slice(0, 3),
    ...(kbAny.coverDesign?.islamicMotifs || []).slice(0, 3),
  ].filter(Boolean) as string[] : [];
  const handleWorkflowRequest = (id: WorkflowId) => {
    const currentIndex = WORKFLOWS.findIndex(w => w.id === activeWorkflow);
    const targetIndex = WORKFLOWS.findIndex(w => w.id === id);
    const isSkippingAhead = targetIndex > currentIndex && !kbNav.completedWorkflows.has(activeWorkflow);
    const isWeak = completedSuggestionCount < Math.min(4, dnaRecommendations.length);
    if (selectedKB && (isSkippingAhead || isWeak) && id !== activeWorkflow) {
      setPendingWorkflow(id);
      return;
    }
    setActiveWorkflow(id);
  };

  return (
    <>
    <SubscriptionGateModal
      open={kbGateOpen}
      onOpenChange={setKbGateOpen}
      workflow="knowledge-base"
      reason="limit"
      usageInfo={{ used: usage.knowledgeBases, limit: limits.knowledgeBases, label: "knowledge bases" }}
    />
    {/* ── Book DNA first-use intro modal ─────────────────────────────────── */}
    <Dialog open={!!pendingWorkflow} onOpenChange={(open) => !open && setPendingWorkflow(null)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleAlert className="h-5 w-5 text-secondary" />
            Book DNA needs more detail
          </DialogTitle>
          <DialogDescription>
            Your setup is still light. Add the previous details for stronger book generation, or continue if you only want to review this section.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-xl border bg-muted/30 p-3">
          {dnaRecommendations.filter(item => !item.ready).slice(0, 5).map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => { setPendingWorkflow(null); setActiveWorkflow(item.workflow); }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-background"
            >
              <CircleAlert className="h-4 w-4 shrink-0 text-secondary" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setPendingWorkflow(null)}>Stay here</Button>
          <Button
            onClick={() => {
              if (pendingWorkflow) setActiveWorkflow(pendingWorkflow);
              setPendingWorkflow(null);
            }}
          >
            Continue anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={showDNAModal} onOpenChange={(open) => { if (!open) { localStorage.setItem("ns_kb_dna_intro_seen", "1"); setShowDNAModal(false); setDnaModalPanel(0); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Dna className="w-5 h-5 text-primary" />
            {dnaModalPanel === 0 ? "Meet your Book DNA" : dnaModalPanel === 1 ? "Fill it once, use it forever" : "Your continuity engine"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {dnaModalPanel === 0 && (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/30 dark:to-pink-950/20 p-5 text-center">
                <div className="text-4xl mb-3">🧬</div>
                <p className="text-sm font-semibold text-foreground mb-1">This is not a preferences panel.</p>
                <p className="text-sm text-muted-foreground">
                  Your Knowledge Base is the <strong>continuity engine</strong> for your entire Universe — the DNA that makes every book feel like it belongs to the same world.
                </p>
              </div>
              <p className="text-xs text-muted-foreground text-center">Every Islamic value, du'a, character voice, and cover rule you add here gets woven into every book you create automatically.</p>
            </>
          )}
          {dnaModalPanel === 1 && (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 p-5 text-center">
                <div className="text-4xl mb-3">✨</div>
                <p className="text-sm font-semibold text-foreground mb-1">One setup. Infinite books.</p>
                <p className="text-sm text-muted-foreground">
                  Invest 10 minutes completing your Book DNA today — and every book you publish will carry the same Islamic values, vocabulary, and visual style without you having to repeat yourself.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[{ emoji: "🕌", text: "Values & Du'as" }, { emoji: "🗣️", text: "Character Voices" }, { emoji: "🎨", text: "Cover Style" }].map(i => (
                  <div key={i.text} className="rounded-xl border border-border bg-muted/30 p-3">
                    <div className="text-2xl mb-1">{i.emoji}</div>
                    <p className="text-[11px] font-medium text-muted-foreground">{i.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {dnaModalPanel === 2 && (
            <>
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 p-5 text-center">
                <div className="text-4xl mb-3">🔗</div>
                <p className="text-sm font-semibold text-foreground mb-1">Every book inherits from DNA.</p>
                <p className="text-sm text-muted-foreground">
                  When you generate a book, NoorStudio automatically pulls from your DNA: the values to weave in, the du'as to place naturally, the voice each character speaks with, and the cover style to apply.
                </p>
              </div>
              <p className="text-xs text-center text-muted-foreground">Your DNA lives at the Universe level — shared across every book in that series.</p>
            </>
          )}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map(i => (
            <span key={i} className={cn("w-1.5 h-1.5 rounded-full transition-colors", i === dnaModalPanel ? "bg-primary" : "bg-muted-foreground/30")} />
          ))}
        </div>

        <DialogFooter>
          {dnaModalPanel > 0 && (
            <Button variant="ghost" onClick={() => setDnaModalPanel(p => p - 1)}>Back</Button>
          )}
          {dnaModalPanel < 2 ? (
            <Button variant="hero" onClick={() => setDnaModalPanel(p => p + 1)}>
              Next <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="hero" onClick={() => { localStorage.setItem("ns_kb_dna_intro_seen", "1"); setShowDNAModal(false); setDnaModalPanel(0); }}>
              Let's build it →
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AppLayout
      title="Book DNA"
      subtitle="The continuity engine — fills every book with the right values, voices, and visual style"
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

        {/* KB actions: Export · Import · Duplicate · Delete */}
        {selectedKB && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5"
              disabled={exporting}
              onClick={handleExport}
              title="Export KB as JSON"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Export
            </Button>

            <label
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors"
              title="Import KB from JSON file"
            >
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Import
              <input
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={handleImportFile}
                disabled={importing}
              />
            </label>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => {
                setDupForm({ name: `${selectedKB.name} (copy)`, universeId: "__same__" });
                setShowDuplicate(true);
              }}
              title="Duplicate this KB"
            >
              <Copy className="w-3.5 h-3.5" />
              Duplicate
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive gap-1.5"
              onClick={() => setShowDelete(selectedKB.id || (selectedKB as any)._id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}

        {/* Hidden import trigger for KB list (no selected KB) */}
        {!selectedKB && (
          <label
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors border border-border"
            title="Import KB from JSON file"
          >
            {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Import KB
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImportFile}
              disabled={importing}
            />
          </label>
        )}
      </div>

      {/* ── Book DNA persistent banner ──────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-2.5">
        <Dna className="w-4 h-4 text-primary shrink-0" />
        <p className="text-xs text-primary flex-1">
          <strong>Book DNA</strong> — fill this once and every book in your Universe inherits the right values, voices, and style automatically.
        </p>
        <button
          onClick={() => { setDnaModalPanel(0); setShowDNAModal(true); }}
          className="shrink-0 text-[10px] font-semibold text-primary hover:text-primary/80 underline underline-offset-2"
        >
          Learn more
        </button>
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
          <div className="mb-4 flex items-center gap-3 rounded-2xl border bg-background px-5 py-3.5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <BookMarked className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold leading-tight truncate">{selectedKB.name}</h2>
              <p className="text-xs text-muted-foreground">Updated {new Date(selectedKB.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
              <span className="font-semibold text-primary">{selectedKB.islamicValues.length}</span> values
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-emerald-600">{selectedKB.duas.length}</span> du'as
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-secondary">{selectedKB.vocabulary.length}</span> vocab
              <span className="text-muted-foreground/40">·</span>
              <span className="font-semibold text-emerald-600">{(selectedKB as any).characterGuides?.length || 0}</span> voices
              <span className="text-muted-foreground/40">·</span>
              <span className={cn(
                "font-semibold",
                kbNav.completedWorkflows.size >= 3 ? "text-primary" : "text-muted-foreground"
              )}>
                {kbNav.completedWorkflows.size}/5 tabs
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-primary/25 text-xs text-primary hover:border-primary/45 hover:bg-primary/5"
              onClick={() => navigate("/app/kb-templates")}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Browse Templates
            </Button>
          </div>

          <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
          {/* KB Strength Score */}
          <KBStrengthScore
            kb={selectedKB}
            onNavigate={(tab) => setActiveWorkflow(tab as any)}
          />

          {/* Workflow tabs */}
          <div className="rounded-2xl border bg-background p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Creation Map</p>
                <p className="text-sm font-semibold text-foreground">Build the rules every book will inherit</p>
              </div>
              <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {kbNav.completedWorkflows.size}/5 complete
              </span>
            </div>

            <div className="grid gap-2 lg:grid-cols-5">
              {WORKFLOWS.map((wf, index) => {
                const isDone = kbNav.completedWorkflows.has(wf.id);
                const active = activeWorkflow === wf.id;
                const Icon = wf.icon;
                return (
                  <button
                    key={wf.id}
                    title={wf.description}
                    onClick={() => handleWorkflowRequest(wf.id as WorkflowId)}
                    className={cn(
                      "group relative min-h-[112px] overflow-hidden rounded-xl border p-3 text-left transition-all",
                      active
                        ? "border-primary/30 bg-primary/10 shadow-sm ring-1 ring-primary/15"
                        : "border-border bg-muted/20 hover:border-primary/25 hover:bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "absolute inset-x-0 top-0 h-1 transition-colors",
                      active ? "bg-primary" : isDone ? "bg-emerald-500" : "bg-transparent"
                    )} />

                    <span className="flex items-start justify-between gap-2">
                      <span className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active ? "bg-primary text-primary-foreground" : isDone ? "bg-emerald-50 text-emerald-600" : "bg-background text-muted-foreground group-hover:text-primary"
                      )}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={cn(
                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                        isDone ? "bg-emerald-100 text-emerald-700" : active ? "bg-secondary/20 text-secondary-foreground" : "bg-background text-muted-foreground"
                      )}>
                        {isDone ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
                      </span>
                    </span>

                    <span className="mt-3 block">
                      <span className={cn("block text-sm font-bold leading-tight", active ? "text-primary" : "text-foreground")}>{wf.sublabel}</span>
                      <span className="mt-1 block text-xs leading-snug text-muted-foreground">{wf.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Faith & Language → single stepper card ── */}
          <div className="grid grid-cols-4 gap-2 rounded-2xl border bg-background p-2 shadow-sm 2xl:hidden">
            {dnaStats.map(stat => (
              <div key={stat.label} className="rounded-xl bg-muted/30 p-2 text-center">
                <p className={cn("text-base font-extrabold leading-none", stat.tone)}>{stat.value}</p>
                <p className="mt-1 text-[10px] font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {activeWorkflow === "faith" ? (
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="p-5">
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
            </div>

            <aside className="hidden 2xl:block">
              <div className="sticky top-24 space-y-4 rounded-2xl border bg-background p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Dna className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Book DNA Summary</p>
                    <p className="text-xs text-muted-foreground">{kbNav.completedWorkflows.size}/5 workflows complete</p>
                  </div>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.max(8, (kbNav.completedWorkflows.size / 5) * 100)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {dnaStats.map(stat => (
                    <div key={stat.label} className="rounded-xl border bg-muted/20 p-3">
                      <p className={cn("text-xl font-extrabold leading-none", stat.tone)}>{stat.value}</p>
                      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Next best steps</p>
                    <span className="text-[11px] font-semibold text-primary">{completedSuggestionCount}/{dnaRecommendations.length}</span>
                  </div>
                  {dnaRecommendations.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleWorkflowRequest(item.workflow)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
                    >
                      {item.ready ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <CircleAlert className="h-4 w-4 shrink-0 text-secondary" />
                      )}
                      <span className={cn("text-xs font-medium", item.ready ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground")}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>

                {(selectedKB.islamicValues?.length || 0) > 0 && (
                  <div className="space-y-2 border-t pt-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Active values</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedKB.islamicValues.slice(0, 6).map(value => (
                        <span key={value} className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          {value.split(" - ")[0]}
                        </span>
                      ))}
                      {selectedKB.islamicValues.length > 6 && (
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          +{selectedKB.islamicValues.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3 border-t pt-3">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Character voice</p>
                    {voiceSummary.length > 0 ? voiceSummary.map(item => (
                      <p key={item} className="rounded-lg bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-foreground">{item}</p>
                    )) : (
                      <p className="text-[11px] text-muted-foreground">No character voice guides selected.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Selected background</p>
                    {backgroundSummary.length > 0 ? backgroundSummary.map(item => (
                      <p key={item} className="rounded-lg bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-foreground">{item}</p>
                    )) : (
                      <p className="text-[11px] text-muted-foreground">No background settings selected.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Book format</p>
                    {bookSummary.length > 0 ? bookSummary.map(item => (
                      <p key={item} className="rounded-lg bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-foreground">{item}</p>
                    )) : (
                      <p className="text-[11px] text-muted-foreground">No book format rules selected.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cover</p>
                    {coverSummary.length > 0 ? coverSummary.map(item => (
                      <p key={item} className="rounded-lg bg-muted/40 px-2.5 py-2 text-[11px] leading-snug text-foreground">{item}</p>
                    )) : (
                      <p className="text-[11px] text-muted-foreground">No cover rules selected.</p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
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
                {kbTemplates.map((tpl) => {
                  const SvgComp = KB_TEMPLATE_SVG_MAP[tpl.id as keyof typeof KB_TEMPLATE_SVG_MAP];
                  const isSelected = form.starterTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, starterTemplateId: tpl.id }))}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:shadow-md text-center",
                        isSelected ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/40"
                      )}
                    >
                      {/* SVG thumbnail */}
                      <div className="w-20 h-24 rounded-lg overflow-hidden shadow-sm">
                        {tpl.previewImage ? (
                          <img
                            src={tpl.previewImage}
                            alt={tpl.name}
                            className="w-full h-full object-cover"
                          />
                        ) : SvgComp ? (
                          <SvgComp />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-[10px] font-semibold px-2">
                            {tpl.themeLabel}
                          </div>
                        )}
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
                const tpl = getKBStarterTemplateById(form.starterTemplateId);
                return tpl ? (
                  <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{tpl.flavourLabel} � {tpl.name}</span> - {tpl.description}
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
                const tpl = getKBStarterTemplateById(form.starterTemplateId);
                return tpl ? (
                  <div className="flex items-center gap-2 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Template: {tpl.name}</span>
                    <span className="text-muted-foreground">- {tpl.flavourLabel}, pre-filled after creation</span>
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

      {/* Duplicate KB dialog */}
      <Dialog open={showDuplicate} onOpenChange={open => !open && setShowDuplicate(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Knowledge Base</DialogTitle>
            <DialogDescription>Creates a full copy of this KB that you can customise independently.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>New name</Label>
              <Input
                value={dupForm.name}
                onChange={e => setDupForm(f => ({ ...f, name: e.target.value }))}
                placeholder={`${selectedKB?.name} (copy)`}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Target Universe <span className="text-xs text-muted-foreground">(optional — leave to keep the same)</span></Label>
              <Select
                value={dupForm.universeId}
                onValueChange={v => setDupForm(f => ({ ...f, universeId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Same as current universe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__same__">Same as current universe</SelectItem>
                  {universes.map((u: any) => (
                    <SelectItem key={u.id || u._id} value={u.id || u._id}>{u.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDuplicate(false)}>Cancel</Button>
            <Button onClick={handleDuplicate} disabled={duplicating} className="gap-1.5">
              {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              Duplicate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
    </>
  );
}
