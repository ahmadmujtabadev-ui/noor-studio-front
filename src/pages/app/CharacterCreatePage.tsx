import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { characterTemplatesApi } from "@/lib/api/characterTemplates.api";
import type { CharacterTemplate } from "@/lib/api/characterTemplates.api";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  User,
  Palette,
  Sparkles,
  Check,
  RefreshCw,
  Image,
  ThumbsUp,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookmarkPlus,
  Lock,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCharacter,
  useGeneratePortrait,
  useApproveCharacter,
  useGeneratePoseSheet,
} from "@/hooks/useCharacters";
import { charactersApi } from "@/lib/api/characters.api";
import { useCredits, useAuthStore } from "@/hooks/useAuth";
import { useUniverses } from "@/hooks/useUniverses";
import type { Character } from "@/lib/api/types";
import { VisualPicker } from "@/components/shared/VisualPicker";
import { CharacterAvatarPreview } from "@/components/shared/CharacterAvatarPreview";
import { GeneratingOverlay } from "@/components/shared/GeneratingOverlay";
import {
  Pixar3DSvg, WatercolorSvg, FlatIllustrationSvg, StorybookSvg, GhibliSvg,
  GirlSvg, BoySvg, AnimalSvg, CreatureSvg,
  SkinToneSwatch, SKIN_TONE_COLORS,
  EyeSwatch, EYE_COLOR_MAP,
  RoundFaceSvg, OvalFaceSvg, HeartFaceSvg, SquareFaceSvg, OvalBalancedFaceSvg, RoundYouthfulFaceSvg,
  ThickArchedBrowSvg, ThinStraightBrowSvg, BushyStraightBrowSvg, SoftRoundedBrowSvg, NaturalFullBrowSvg,
  ButtonNoseSvg, BroadFlatNoseSvg, StraightNarrowNoseSvg, RoundedSoftNoseSvg, WideNostrilsNoseSvg,
  ChubbyRosyCheekSvg, FlatSmoothCheekSvg, HighDefinedCheekSvg, DimpledCheekSvg, SoftRoundCheekSvg,
  ShortHairBoySvg, CurlyHairBoySvg, WavyHairBoySvg, SpikyHairBoySvg, AfroHairSvg, BuzzCutSvg,
  LongHairGirlSvg, CurlyLongHairSvg, BraidedHairSvg, PonytailHairSvg, BunHairSvg,
  HijabSvg, BaldSvg, WhiteShortHairSvg, GrayShortHairSvg, FeatheredCrestSvg, FurBodySvg,
  SlimBodySvg, AverageBodySvg, ChubbyBodySvg, AthleticBodySvg, StockyBodySvg,
  TallSlenderBodySvg, PetiteBodySvg, BroadShoulderBodySvg, ToddlerBodySvg, RoundFullBodySvg,
  HeightFeelSvg,
  OUTFIT_COLORS,
  LongSleeveTunicSvg, AbayaSvg, ModestBlouseSvg, SalwarKameezTopSvg, LongSleeveDressSvg, SchoolUniformBlouseSvg, LongCardiganSvg,
  TShirtSvg, LongSleeveShirtSvg, CollarShirtSvg, HoodieSvg, ThobeSvg, KurtaSvg, JacketSvg,
  WideLegTrousersSvg, LongSkirtSvg, MaxiSkirtSvg, SchoolSkirtSvg, ShalwarSvg, PalazzoPantsSvg,
  TrousersSvg, JeansSvg, ShortsSvg,
  SneakersSvg, SchoolShoesSvg, MaryJaneFlats, SandalsSvg, LeatherSandalsSvg, BootsSvg, SlippersSvg, OxfordShoesSvg,
  KhussaSvg, BalghaSlipperSvg,
  JalabiyaSvg,
} from "@/components/shared/CharacterSvgIcons";

const SKIN_TONES = [
  { value: "porcelain", label: "Porcelain" },
  { value: "fair", label: "Fair" },
  { value: "light-beige", label: "Light Beige" },
  { value: "beige", label: "Beige" },
  { value: "olive", label: "Olive" },
  { value: "warm-olive", label: "Warm Olive" },
  { value: "golden", label: "Golden" },
  { value: "tan", label: "Tan" },
  { value: "caramel", label: "Caramel" },
  { value: "medium-brown", label: "Medium Brown" },
  { value: "brown", label: "Brown" },
  { value: "dark-brown", label: "Dark Brown" },
  { value: "ebony", label: "Ebony" },
];

const EYE_COLORS = [
  { value: "dark-brown", label: "Dark Brown" },
  { value: "brown", label: "Brown" },
  { value: "hazel", label: "Hazel" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "gray", label: "Gray" },
  { value: "black", label: "Black" },
];

const FACE_SHAPES = [
  { value: "round-friendly", label: "Round & Friendly" },
  { value: "oval-gentle", label: "Oval & Gentle" },
  { value: "heart-creative", label: "Heart-shaped" },
  { value: "square-determined", label: "Square & Determined" },
  { value: "oval-balanced", label: "Oval & Balanced" },
  { value: "round-youthful", label: "Round & Soft" },
];

const HAIR_STYLES_BOY = [
  { value: "short-black", label: "Short Black" },
  { value: "short-dark-brown", label: "Short Dark Brown" },
  { value: "curly-black", label: "Curly Black" },
  { value: "wavy-dark", label: "Wavy Dark" },
  { value: "spiky-black", label: "Spiky Black" },
  { value: "afro", label: "Afro" },
  { value: "buzz-cut", label: "Buzz Cut" },
];

const HAIR_STYLES_GIRL = [
  { value: "long-black",        label: "Long Black" },
  { value: "long-dark-brown",   label: "Long Dark Brown" },
  { value: "long-brown",        label: "Long Brown" },
  { value: "shoulder-length",   label: "Shoulder Length" },
  { value: "short-bob",         label: "Short Bob" },
  { value: "side-swept",        label: "Side Swept" },
  { value: "curly-long",        label: "Long Curly" },
  { value: "curly-short",       label: "Short Curly" },
  { value: "wavy-loose",        label: "Loose Wavy" },
  { value: "braided-long",      label: "Long Braided" },
  { value: "two-braids",        label: "Two Braids" },
  { value: "ponytail-high",     label: "High Ponytail" },
  { value: "ponytail-low",      label: "Low Ponytail" },
  { value: "bun-top",           label: "Top Bun" },
  { value: "half-up-half-down", label: "Half-Up Half-Down" },
];

const HIJAB_STYLES = [
  { value: "simple-white",   label: "Simple White" },
  { value: "simple-black",   label: "Simple Black" },
  { value: "simple-beige",   label: "Beige Wrap" },
  { value: "blue-solid",     label: "Blue" },
  { value: "pink-solid",     label: "Pink" },
  { value: "purple-solid",   label: "Purple" },
  { value: "al-amira-white", label: "Al-Amira (White)" },
  { value: "al-amira-black", label: "Al-Amira (Black)" },
  { value: "shayla-drape",   label: "Shayla Drape" },
  { value: "turban-style",   label: "Turban Style" },
  { value: "khimar-long",    label: "Khimar (Long)" },
  { value: "pashmina-wrap",  label: "Pashmina Wrap" },
];

const TRAIT_OPTIONS = [
  "curious",
  "brave",
  "kind",
  "helpful",
  "gentle",
  "patient",
  "wise",
  "creative",
  "loyal",
  "confident",
  "thoughtful",
  "playful",
  "adventurous",
  "caring",
  "cheerful",
  "determined",
];

const EYEBROW_STYLES = [
  { value: "thick-arched",    label: "Thick & Arched" },
  { value: "thin-straight",   label: "Thin & Straight" },
  { value: "bushy-straight",  label: "Bushy & Straight" },
  { value: "soft-rounded",    label: "Soft & Rounded" },
  { value: "natural-full",    label: "Natural & Full" },
];

const NOSE_STYLES = [
  { value: "button",          label: "Button" },
  { value: "broad-flat",      label: "Broad & Flat" },
  { value: "straight-narrow", label: "Straight & Narrow" },
  { value: "rounded-soft",    label: "Rounded & Soft" },
  { value: "wide-nostrils",   label: "Wide Nostrils" },
];

const CHEEK_STYLES = [
  { value: "chubby-rosy",     label: "Rosy & Soft" },
  { value: "flat-smooth",     label: "Flat & Smooth" },
  { value: "high-defined",    label: "High Cheekbones" },
  { value: "dimpled",         label: "Dimpled" },
  { value: "soft-round",      label: "Soft & Round" },
];

// Use "none" as sentinel — Radix SelectItem does not allow value=""
const FACIAL_HAIR_OPTIONS = [
  { value: "none",                    label: "Clean-shaven (none)" },
  { value: "short white stubble",     label: "Short White Stubble" },
  { value: "trimmed white mustache",  label: "Trimmed White Mustache" },
  { value: "short white beard",       label: "Short White Beard" },
  { value: "full white beard",        label: "Full White Beard" },
  { value: "white goatee",            label: "White Goatee" },
  { value: "full gray beard",         label: "Full Gray Beard" },
  { value: "trimmed gray mustache",   label: "Trimmed Gray Mustache" },
  { value: "black beard trimmed",     label: "Black Beard (Trimmed)" },
  { value: "full black beard",        label: "Full Black Beard" },
];

const GLASSES_OPTIONS = [
  { value: "none",                              label: "No Glasses" },
  { value: "round black-frame glasses",         label: "Round Black Frame" },
  { value: "round gold-frame glasses",          label: "Round Gold Frame" },
  { value: "round wire-frame glasses",          label: "Round Wire Frame" },
  { value: "rectangular black-frame glasses",   label: "Rectangular Black Frame" },
  { value: "rectangular gold-frame glasses",    label: "Rectangular Gold Frame" },
  { value: "small reading glasses dark-frame",  label: "Reading Glasses (Dark)" },
];

const HAIR_STYLES_ELDER_MALE = [
  { value: "bald",                      label: "Bald" },
  { value: "bald with white hair sides", label: "Bald — White Sides" },
  { value: "short white hair",           label: "Short White Hair" },
  { value: "short gray hair",            label: "Short Gray Hair" },
  { value: "receding white hair",        label: "Receding White Hair" },
  { value: "full white hair short",      label: "Full White Hair (Short)" },
  { value: "full gray hair short",       label: "Full Gray Hair (Short)" },
];

// For non-human / creature / animal characters
const HAIR_STYLES_OTHER = [
  { value: "feathered crest on head",  label: "Feathered Crest" },
  { value: "no hair (feathers)",       label: "Feathers (no hair)" },
  { value: "no hair (scales)",         label: "Scales (no hair)" },
  { value: "no hair (fur)",            label: "Fur coat" },
  { value: "mane",                     label: "Mane" },
  { value: "fin on head",              label: "Fin on Head" },
  { value: "spikes on head",           label: "Spikes" },
  { value: "none",                     label: "None / N/A" },
];

const BODY_BUILDS = [
  "small toddler round tummy",
  "slim and lean",
  "average build",
  "athletic and fit",
  "stocky and strong",
  "petite and light",
  "tall and slender",
  "broad-shouldered",
  "soft and round",
  "round and full",
];

const HEIGHT_FEELS = [
  "very small",
  "small",
  "slightly short",
  "average height",
  "slightly tall",
  "tall",
  "very tall",
  "towers over others",
];

const TOP_GARMENT_PRESETS_BOY = [
  "t-shirt",
  "long-sleeve shirt",
  "collared shirt",
  "hoodie",
  "thobe",
  "jalabiya",
  "kurta",
  "qamis",
  "school uniform shirt",
  "jacket",
];

const TOP_GARMENT_PRESETS_GIRL = [
  "long-sleeve tunic",
  "abaya",
  "modest blouse",
  "salwar kameez top",
  "long-sleeve dress",
  "school uniform blouse",
  "long cardigan",
  "jilbab top",
];

const BOTTOM_GARMENT_PRESETS_BOY = [
  "trousers",
  "jeans",
  "shorts",
  "wide-leg pants",
  "school uniform trousers",
  "shalwar",
];

const BOTTOM_GARMENT_PRESETS_GIRL = [
  "wide-leg trousers",
  "long skirt",
  "maxi skirt",
  "school uniform skirt",
  "shalwar",
  "palazzo pants",
];

const SHOE_PRESETS = [
  "sneakers",
  "velcro sneakers",
  "school shoes",
  "Mary-Jane flats",
  "sandals",
  "leather sandals",
  "running shoes",
  "Oxford shoes",
  "indoor slippers",
  "boots",
  "slippers",
  "mary jane flats",
  "oxford shoes",
  "khussa",
  "balgha slippers",
  "open-toe sandals",
  "ballerina flats",
  "heels",
  "pumps",
];

const ACCESSORIES_PRESETS = [
  "round glasses",
  "small backpack",
  "wristband",
  "tasbih beads",
  "small Quran (mushaf)",
  "small book in hand",
  "kufi cap",
  "kite",
  "water bottle",
  "silver compass",
  "notebook",
  "smartwatch",
  "headband",
  "prayer rug (rolled)",
  "miswak stick",
  "eid card / gift",
  "small badge / pin",
  "lunchbox",
  "telescope",
  "calligraphy pen",
];

// Suggested height by numeric age
function suggestedHeightRange(age: number): string {
  if (age <= 4)  return "85–105 cm";
  if (age <= 7)  return "100–125 cm";
  if (age <= 9)  return "112–138 cm";
  if (age <= 12) return "128–155 cm";
  if (age <= 17) return "150–175 cm";
  return "155–185 cm";
}

function ageLabel(age: number): string {
  if (!age) return "";
  if (age <= 3)  return "Toddler";
  if (age <= 7)  return "Young Child";
  if (age <= 12) return "Child";
  if (age <= 17) return "Teen";
  if (age <= 30) return "Young Adult";
  if (age <= 50) return "Adult";
  return "Elder";
}
const ROLES = ["Protagonist", "Supporting", "Villain", "Elder", "Mentor", "Sidekick", "Narrator", "Comic Relief", "Other", "Main"];

// ─── Auto-suggest face details from age + face shape ─────────────────────────
function suggestFaceDetails(ageLook: string, faceShape: string, gender: string) {
  const a = ageLook.toLowerCase();
  const isToddler    = /toddler|2-4/.test(a);
  const isYoungChild = /5-7|young child/.test(a);
  const isChild      = /8-12|^child/.test(a);
  const isTeen       = /teen|13/.test(a);
  const isAdult      = /adult/.test(a);
  const isElder      = /elder|senior|elderly/.test(a);
  const isGirl       = gender === "girl";

  // ── Base recommendations by age ──
  let eyebrow = "natural-full";
  let nose    = "rounded-soft";
  let cheek   = "soft-round";

  if (isToddler || isYoungChild) {
    eyebrow = "soft-rounded";
    nose    = "button";
    cheek   = "chubby-rosy";
  } else if (isChild) {
    eyebrow = "soft-rounded";
    nose    = "button";
    cheek   = "soft-round";
  } else if (isTeen) {
    eyebrow = isGirl ? "thick-arched" : "natural-full";
    nose    = "straight-narrow";
    cheek   = "soft-round";
  } else if (isAdult) {
    eyebrow = isGirl ? "thick-arched" : "natural-full";
    nose    = "straight-narrow";
    cheek   = isGirl ? "high-defined" : "flat-smooth";
  } else if (isElder) {
    eyebrow = isGirl ? "thin-straight" : "bushy-straight";
    nose    = "broad-flat";
    cheek   = "flat-smooth";
  }

  // ── Adjust by face shape ──
  const shape = faceShape.toLowerCase();
  if (shape.includes("round") && !isElder && !isAdult) {
    cheek = "chubby-rosy";
    if (isToddler || isYoungChild || isChild) nose = "button";
  } else if (shape.includes("heart")) {
    if (!isToddler && !isYoungChild) {
      eyebrow = "thick-arched";
      cheek   = "high-defined";
    }
  } else if (shape.includes("square")) {
    if (!isToddler && !isYoungChild) eyebrow = "bushy-straight";
    cheek = isElder || isAdult ? "flat-smooth" : cheek;
  } else if (shape.includes("oval")) {
    if (!isToddler && !isYoungChild && !isChild) nose = "straight-narrow";
  }

  return { eyebrow, nose, cheek };
}

const AGE_LOOK_CHIPS = [
  { label: "Toddler (2–4)", value: "2-4 year old toddler" },
  { label: "Young Child (5–7)", value: "5-7 year old young child" },
  { label: "Child (8–12)", value: "8-12 year old child" },
  { label: "Teen (13–17)", value: "13-17 year old teenager" },
  { label: "Adult (18–40)", value: "young adult" },
  { label: "Elder (55+)", value: "elderly person, senior" },
];

const STYLES = [
  { id: "pixar-3d", label: "3D Rendered" },
  { id: "watercolor", label: "Watercolor" },
  { id: "flat-illustration", label: "Flat Illustration" },
  { id: "storybook", label: "Storybook" },
  { id: "ghibli", label: "Hand-Painted Anime" },
];

const GENERATION_COST = 4;
const POSE_SHEET_COST = 6;

const VALUES_PRESETS = [
  {
    id: "shariah-compliant" as const,
    label: "Shariah-Compliant",
    emoji: "🕌",
    desc: "Long sleeves ON, loose clothing ON, hijab ON for girls 9+",
    color: "emerald",
  },
  {
    id: "wholesome" as const,
    label: "Wholesome Universal",
    emoji: "🌟",
    desc: "Modest clothing, family-friendly",
    color: "violet",
  },
  {
    id: "custom" as const,
    label: "Custom",
    emoji: "✏️",
    desc: "Set every rule manually",
    color: "slate",
  },
] as const;
type ValuesMode = typeof VALUES_PRESETS[number]["id"];

const steps = [
  { id: 0, title: "Persona", icon: User },
  { id: 1, title: "Visual DNA", icon: Palette },
  { id: 2, title: "Generate", icon: Sparkles },
  { id: 3, title: "Pose Sheet", icon: Image },
];

// ─── Visual DNA tabs ─────────────────────────────────────────────────────────

const DNA_TABS = ["character", "face", "hair", "outfit", "body", "extras"] as const;
type DnaTab = typeof DNA_TABS[number];

const DNA_TAB_META: Record<DnaTab, { label: string; icon: string }> = {
  character: { label: "Character", icon: "🎭" },
  face:      { label: "Face",      icon: "😊" },
  hair:      { label: "Hair",      icon: "💇" },
  outfit:    { label: "Outfit",    icon: "👕" },
  body:      { label: "Body",      icon: "📏" },
  extras:    { label: "Extras",    icon: "✨" },
};

function DNATabs({ active, onChange }: { active: DnaTab; onChange: (t: DnaTab) => void }) {
  return (
    <div className="sticky top-16 z-10 -mx-1 bg-background/95 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm p-1">
      <div className="flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1">
        {DNA_TABS.map((tab, i) => {
          const meta = DNA_TAB_META[tab];
          const isActive = tab === active;
          const isPast = DNA_TABS.indexOf(active) > i;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap flex-shrink-0 transition-all duration-200",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : isPast
                  ? "text-primary hover:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <span className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0",
                isActive
                  ? "bg-white/20 text-background"
                  : isPast
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                {isPast ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span>{meta.icon} {meta.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Horizontally scrollable colour palette row for mobile — wraps normally on sm+
function ColorScrollRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="flex flex-nowrap sm:flex-wrap gap-2.5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch]">
        {children}
      </div>
      {/* Edge-fade indicator — mobile only */}
      <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent rounded-r" />
    </div>
  );
}

function PoseTile({ pose }: { pose: any }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="space-y-1">
      <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border relative">
        {pose.imageUrl && !imgError ? (
          <img
            src={pose.imageUrl}
            alt={pose.label || pose.poseKey}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : pose.imageUrl && imgError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground/60 text-[11px]">
            <AlertCircle className="w-4 h-4" />
            <span>Load failed</span>
          </div>
        ) : (
          <div className="w-full h-full animate-pulse bg-muted-foreground/10" />
        )}
      </div>
      <p className="text-xs text-center text-muted-foreground capitalize truncate">{pose.label || pose.poseKey}</p>
    </div>
  );
}

export default function CharacterCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [searchParams] = useSearchParams();
  const { universes } = useUniverses();

  // Pre-fill from template if navigated from template gallery
  const fromTemplate = (location.state as { fromTemplate?: CharacterTemplate } | null)?.fromTemplate;
  const tplVd = fromTemplate?.visualDNA || {};
  const tplMr = fromTemplate?.modestyRules || {};

  const queryClient = useQueryClient();
  const createCharacter = useCreateCharacter();

  const [currentStep, setCurrentStep] = useState(0);
  const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [dnaTab, setDnaTab] = useState<DnaTab>("face");

  const characterId = createdCharacter?.id || createdCharacter?._id || "";
  const generatePortrait = useGeneratePortrait(characterId);
  const approveCharacter = useApproveCharacter(characterId);
  const generatePoseSheet = useGeneratePoseSheet(characterId);

  const [form, setForm] = useState({
    selectedUniverseId: searchParams.get("universeId") || "",
    name: fromTemplate?.name ? `${fromTemplate.name} (copy)` : "",
    role: fromTemplate?.role ? (fromTemplate.role.charAt(0).toUpperCase() + fromTemplate.role.slice(1)) : "Protagonist",
    ageRange: fromTemplate?.ageRange ? (parseInt(fromTemplate.ageRange) || 6) : 6 as number | string,
    traits: fromTemplate?.traits || [] as string[],

    style: tplVd.style || "pixar-3d",
    gender: (tplVd.gender === "boy" || tplVd.gender === "male" ? "boy" : tplVd.gender === "animal" ? "animal" : tplVd.gender === "other" || tplVd.gender === "neutral" ? "other" : "girl") as "boy" | "girl" | "animal" | "other",
    ageLook: tplVd.ageLook || "",

    wearHijab: !!(tplVd.hijabStyle || tplVd.hijabColor || tplMr.hijabAlways),

    skinTone: tplVd.skinTone || "",
    eyeColor: tplVd.eyeColor || "",
    faceShape: tplVd.faceShape || "",
    eyebrowStyle: tplVd.eyebrowStyle || "",
    noseStyle: tplVd.noseStyle || "",
    cheekStyle: tplVd.cheekStyle || "",

    hairStyle: tplVd.hairStyle || "",
    hairColor: tplVd.hairColor || "",
    hairVisibility: (tplVd.hairVisibility || "visible") as "visible" | "partially-visible" | "hidden",

    hijabStyle: tplVd.hijabStyle || "",
    hijabColor: tplVd.hijabColor || "",

    topGarmentType: tplVd.topGarmentType || "",
    topGarmentColor: tplVd.topGarmentColor || "",
    topGarmentDetails: tplVd.topGarmentDetails || "",

    bottomGarmentType: tplVd.bottomGarmentType || "",
    bottomGarmentColor: tplVd.bottomGarmentColor || "",

    shoeType: tplVd.shoeType || "",
    shoeColor: tplVd.shoeColor || "",

    bodyBuild: tplVd.bodyBuild || "",
    heightFeel: tplVd.heightFeel || "",
    heightCm: tplVd.heightCm || 0,
    heightFeet: 0,

    facialHair: tplVd.facialHair || "none",
    glasses: tplVd.glasses || "none",

    accessoriesText: "",
    accessoriesList: tplVd.accessories || [] as string[],
    paletteNotes: tplVd.paletteNotes || "",
    outfitRules: "",

    longSleeves: tplMr.longSleeves ?? true,
    looseClothing: tplMr.looseClothing ?? true,
    modestyNotes: tplMr.notes || "",

    valuesMode: "shariah-compliant" as ValuesMode,
  });

  // T-07: default entry via templates — redirect if no template and not scratch
  useEffect(() => {
    if (!fromTemplate && !searchParams.get("scratch")) {
      navigate("/app/character-templates");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-suggest eyebrow / nose / cheek from age + face shape ───────────
  // Track the last values we auto-filled so we don't override manual changes
  const lastSuggestion = useRef({ eyebrow: "", nose: "", cheek: "" });
  useEffect(() => {
    if (!form.ageLook || !form.faceShape) return;
    const suggested = suggestFaceDetails(form.ageLook, form.faceShape, form.gender);
    const prev = lastSuggestion.current;
    setForm((f) => ({
      ...f,
      // Only overwrite a field if it is still empty OR still matches our last auto-suggestion
      eyebrowStyle: f.eyebrowStyle === "" || f.eyebrowStyle === prev.eyebrow ? suggested.eyebrow : f.eyebrowStyle,
      noseStyle:    f.noseStyle    === "" || f.noseStyle    === prev.nose    ? suggested.nose    : f.noseStyle,
      cheekStyle:   f.cheekStyle   === "" || f.cheekStyle   === prev.cheek   ? suggested.cheek   : f.cheekStyle,
    }));
    lastSuggestion.current = suggested;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ageLook, form.faceShape, form.gender]);


  const applyValuesMode = (mode: ValuesMode) => {
    setForm((f) => {
      const isGirl = f.gender === "girl";
      if (mode === "shariah-compliant") {
        return {
          ...f,
          valuesMode: mode,
          longSleeves: true,
          looseClothing: true,
          wearHijab: isGirl ? true : f.wearHijab,
        };
      }
      if (mode === "wholesome") {
        return { ...f, valuesMode: mode, longSleeves: true, looseClothing: true };
      }
      return { ...f, valuesMode: mode };
    });
  };

  const updateForm = (field: string, value: unknown) => {
    setValidationErrors((prev) => { const n = new Set(prev); n.delete(field); return n; });
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleTrait = (trait: string) => {
    setForm((f) => ({
      ...f,
      traits: f.traits.includes(trait)
        ? f.traits.filter((t) => t !== trait)
        : [...f.traits, trait].slice(0, 5),
    }));
  };

  const tryAdvance = () => {
    if (currentStep === 0) {
      const errors = new Set<string>();
      if (!form.selectedUniverseId) errors.add("selectedUniverseId");
      if (!form.name.trim()) errors.add("name");
      if (!Number(form.ageRange)) errors.add("ageRange");
      if (errors.size > 0) { setValidationErrors(errors); return; }
    }
    if (currentStep === 1) {
      const errors = new Set<string>();
      if (!form.skinTone) errors.add("skinTone");
      if (!form.eyeColor && form.gender !== "animal" && form.gender !== "other") errors.add("eyeColor");
      if (!form.faceShape) errors.add("faceShape");
      if (errors.size > 0) { setValidationErrors(errors); return; }
    }
    setValidationErrors(new Set());
    setCurrentStep((s) => s + 1);
  };

  const handleSaveAsTemplate = async () => {
    if (!createdCharacter) return;
    setSavingTemplate(true);
    try {
      const category = (
        form.gender === "boy"
          ? (ageNum >= 13 ? "teen-boy" : ageNum <= 4 ? "toddler" : "boy")
          : form.gender === "girl"
          ? (ageNum >= 13 ? "teen-girl" : ageNum <= 4 ? "toddler" : "girl")
          : "animal"
      ) as "girl" | "boy" | "elder-female" | "elder-male" | "animal" | "toddler" | "teen-girl" | "teen-boy";
      await characterTemplatesApi.save({
        name: createdCharacter.name,
        description: `${createdCharacter.role} · ${form.traits.slice(0, 3).join(", ")}`,
        category,
        characterId: createdCharacter.id || (createdCharacter as any)._id,
        tags: form.traits,
        isPublic: false,
        visualDNA: createdCharacter.visualDNA,
        modestyRules: createdCharacter.modestyRules,
        role: createdCharacter.role,
        ageRange: String(form.ageRange),
        traits: form.traits,
      });
      setTemplateSaved(true);
      toast({ title: "Saved as template!", description: `${createdCharacter.name} is now in your template library.` });
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSavingTemplate(false);
    }
  };

  const progressPct = (currentStep / (steps.length - 1)) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!form.selectedUniverseId && !!form.name.trim() && !!form.role && Number(form.ageRange) > 0;
      case 1:
        return !!form.skinTone && !!form.eyeColor && !!form.faceShape;
      case 2:
        return createdCharacter?.status === "approved";
      default:
        return true;
    }
  };

  const ageNum = Number(form.ageRange) || 0;
  const isElderAge = ageNum >= 18;
  const isElderMale = form.gender === "boy" && ageNum >= 13;
  const isOther = form.gender === "other" || form.gender === "animal";

  const ageLookImpliesHijabAge = (ageLook: string) => {
    const m = ageLook.match(/(\d+)/);
    const n = m ? parseInt(m[1]) : 0;
    return n >= 9 || /teenager|adult|elderly|senior/.test(ageLook);
  };

  const hairOptions = isOther
    ? HAIR_STYLES_OTHER
    : form.gender === "boy"
      ? (isElderMale ? HAIR_STYLES_ELDER_MALE : HAIR_STYLES_BOY)
      : form.wearHijab
        ? HIJAB_STYLES
        : HAIR_STYLES_GIRL;

  const handleCreateAndGenerate = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    if (!form.selectedUniverseId) {
      toast({ title: "Universe is required", description: "Please select a universe for this character.", variant: "destructive" });
      return;
    }

    if (credits < GENERATION_COST) {
      toast({
        title: "Insufficient credits",
        description: `You need ${GENERATION_COST} credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Merge preset chips + any custom comma-separated extras
      const customExtras = form.accessoriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const accessories = [...new Set([...form.accessoriesList, ...customExtras])];

      const char = await createCharacter.mutateAsync({
        name: form.name.trim(),
        role: form.role.toLowerCase(),
        ageRange: String(form.ageRange),
        traits: form.traits,
        universeId: form.selectedUniverseId,
        visualDNA: {
          style: form.style,
          gender: form.gender,
          ageLook: form.ageLook,

          skinTone: form.skinTone,
          eyeColor: form.eyeColor,
          faceShape: form.faceShape,
          eyebrowStyle: form.eyebrowStyle,
          noseStyle: form.noseStyle,
          cheekStyle: form.cheekStyle,

          hairStyle: form.wearHijab ? "" : form.hairStyle,
          hairColor: form.wearHijab ? "" : form.hairColor,
          hairVisibility: form.wearHijab ? "hidden" : form.hairVisibility,

          hijabStyle: form.wearHijab ? form.hijabStyle : "",
          hijabColor: form.wearHijab ? form.hijabColor : "",

          topGarmentType: form.topGarmentType,
          topGarmentColor: form.topGarmentColor,
          topGarmentDetails: form.topGarmentDetails,

          bottomGarmentType: form.bottomGarmentType,
          bottomGarmentColor: form.bottomGarmentColor,

          shoeType: form.shoeType,
          shoeColor: form.shoeColor,

          bodyBuild: form.bodyBuild,
          heightFeel: form.heightFeel,
          heightCm: form.heightCm || undefined,
          heightFeet: form.heightFeet || undefined,

          facialHair: form.facialHair === "none" ? "" : (form.facialHair || ""),
          glasses: form.glasses === "none" ? "" : (form.glasses || ""),

          accessories,
          paletteNotes: form.paletteNotes,
          hairOrHijab: form.wearHijab ? form.hijabStyle : form.hairStyle,
          outfitRules: form.outfitRules,
        },
        modestyRules: {
          hijabAlways: form.wearHijab,
          longSleeves: form.longSleeves,
          looseClothing: form.looseClothing,
          notes: form.modestyNotes,
        },
      });

      setCreatedCharacter(char);

      // Use the fresh char ID directly — the generatePortrait hook still has characterId=""
      // from the initial render and React state hasn't updated yet at this point.
      const charId = char.id || (char as any)._id || "";
      const portraitRes = await charactersApi.generatePortrait(charId, { style: form.style });
      setCreatedCharacter(portraitRes.character);

      // Auto-update template thumbnail with the newly generated portrait
      const generatedImageUrl = portraitRes.character?.imageUrl || portraitRes.imageUrl;
      if (fromTemplate && generatedImageUrl) {
        try {
          await characterTemplatesApi.updateThumbnail(fromTemplate._id, generatedImageUrl);
          queryClient.invalidateQueries({ queryKey: ["character-templates"] });
        } catch (_) {
          // non-critical — don't block the user flow
        }
      }

      await refreshUser();
      toast({
        title: "Character generated!",
        description: `${char.name} is ready for review.`,
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!createdCharacter) return;
    if (credits < GENERATION_COST) {
      toast({ title: "Insufficient credits", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const updated = await generatePortrait.mutateAsync({ style: form.style });
      setCreatedCharacter(updated.character);
      await refreshUser();
      toast({ title: "Regenerated!", description: "New portrait created." });
    } catch (err) {
      toast({
        title: "Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!createdCharacter) return;
    try {
      const updated = await approveCharacter.mutateAsync();
      setCreatedCharacter(updated);
      toast({
        title: "Approved!",
        description: `${updated.name} is ready for your books.`,
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  };

  const handleGeneratePoseSheet = async () => {
    if (!createdCharacter) return;

    if (credits < POSE_SHEET_COST) {
      toast({
        title: "Insufficient credits",
        description: `You need ${POSE_SHEET_COST} credits.`,
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPose(true);
    try {
      const updated = await generatePoseSheet.mutateAsync({ style: form.style });
      setCreatedCharacter(updated.character);
      await refreshUser();
      toast({
        title: "Pose sheet ready!",
        description: "Pose sheet and pose prompts generated.",
      });
    } catch (err) {
      toast({
        title: "Failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPose(false);
    }
  };

  return (
    <AppLayout
      title="✨ Create Character"
      subtitle="Design your character's look — it stays consistent in every illustration!"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={() => navigate("/app/character-templates")}
          >
            <LayoutGrid className="w-4 h-4 mr-2" />
            Browse Templates
          </Button>
          <Button variant="outline" onClick={() => navigate("/app/characters")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      }
    >
      {/* Generation overlay — shows for character portrait and pose sheet generation */}
      {isGenerating && (
        <GeneratingOverlay register="neutral" label="Generating character portrait" />
      )}
      {isGeneratingPose && (
        <GeneratingOverlay register="neutral" label="Generating pose sheet" />
      )}

      <div className="mx-auto w-full max-w-[1400px]">
        {/* Colorful step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, idx) => {
              const STEP_EMOJIS = ["🧑", "🎨", "✨", "🕺"];
              const emoji = STEP_EMOJIS[step.id] || "⭐";
              return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-extrabold transition-all shadow-sm",
                    currentStep > step.id
                      ? "bg-emerald-500 text-white shadow-emerald-200"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-110"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : <span>{emoji}</span>}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      "h-1 w-16 sm:w-28 mx-1 rounded-full",
                      currentStep > step.id ? "bg-gradient-to-r from-emerald-400 to-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs font-semibold px-0.5">
            {steps.map((step) => (
              <span key={step.id} className={cn(
                currentStep === step.id ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </span>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-400 via-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Template banner — shown when a template was selected */}
        {fromTemplate ? (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-2">
            <span className="text-2xl">✨</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                Pre-filled from template: <span className="italic">{fromTemplate.name}</span>
              </p>
              <p className="text-xs text-amber-600">All fields are editable — customise before generating.</p>
            </div>
            <button
              onClick={() => navigate("/app/character-templates")}
              className="text-xs text-amber-600 underline hover:text-amber-800 shrink-0"
            >
              Change template
            </button>
          </div>
        ) : (
          /* No template selected — prompt user to browse */
          <div className="flex items-center gap-3 bg-orange-50 border border-dashed border-orange-300 rounded-2xl px-4 py-3 mb-2">
            <span className="text-2xl">🎨</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-700">Start faster with a template</p>
              <p className="text-xs text-orange-500">Pre-filled visual DNA, colours, outfit — customise in seconds.</p>
            </div>
            <button
              onClick={() => navigate("/app/character-templates")}
              className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              Browse Templates →
            </button>
          </div>
        )}

        <div className="card-glow space-y-6 rounded-[32px] border border-border/70 bg-background/95 p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)] sm:p-6 xl:p-8">
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">🧑 Persona</h2>

              {/* Universe selector — required */}
              <div className="space-y-2">
                <Label>🌍 Universe <span className="text-destructive">*</span></Label>
                <Select
                  value={form.selectedUniverseId}
                  onValueChange={(v) => updateForm("selectedUniverseId", v)}
                >
                  <SelectTrigger className={cn((!form.selectedUniverseId || validationErrors.has("selectedUniverseId")) && "border-destructive")}>
                    <SelectValue placeholder="Select a universe for this character…" />
                  </SelectTrigger>
                  <SelectContent>
                    {universes.length === 0 ? (
                      <SelectItem value="__none__" disabled>No universes yet — create one first</SelectItem>
                    ) : (
                      universes.map((u) => (
                        <SelectItem key={u._id ?? u.id} value={u._id ?? u.id ?? ""}>
                          {u.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!form.selectedUniverseId && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Universe is required to generate a character
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Character Name *</Label>
                <Input
                  placeholder="e.g., Almaira, Omar, Zainab"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className={cn(validationErrors.has("name") && "border-destructive focus-visible:ring-destructive")}
                />
                {validationErrors.has("name") && (
                  <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Name is required</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={form.role} onValueChange={(v) => updateForm("role", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Age *
                    {ageNum > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        {ageLabel(ageNum)}
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    placeholder="e.g. 7, 35, 65"
                    value={form.ageRange === 0 || form.ageRange === "" ? "" : form.ageRange}
                    onChange={(e) => updateForm("ageRange", e.target.value === "" ? "" : Number(e.target.value))}
                  />
                  {ageNum > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Typical height: {suggestedHeightRange(ageNum)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Traits (pick up to 5)</Label>
                <div className="flex flex-wrap gap-2">
                  {TRAIT_OPTIONS.map((trait) => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm border-2 transition-all capitalize",
                        form.traits.includes(trait)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {trait}
                    </button>
                  ))}
                </div>

                {form.traits.length > 0 && (
                  <p className="text-xs text-primary">
                    {form.traits.length}/5 selected: {form.traits.join(", ")}
                  </p>
                )}
              </div>

            </div>
          )}

          {currentStep === 1 && (
            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">🎨 Visual DNA</h2>

              {/* ── Tab bar ─────────────────────────────────────────────────── */}
              <DNATabs active={dnaTab} onChange={(t) => { setDnaTab(t); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

              {/* ── Mobile avatar strip ─────────────────────────────────────── */}
              <div className="xl:hidden flex items-center gap-4 rounded-2xl border border-border bg-card overflow-hidden p-3">
                <div className="w-20 h-24 shrink-0 rounded-xl bg-gradient-to-b from-amber-50 to-stone-100 dark:from-stone-900/50 dark:to-stone-800/30 flex items-center justify-center">
                  <CharacterAvatarPreview
                    form={{
                      gender: form.gender, skinTone: form.skinTone, eyeColor: form.eyeColor,
                      hairStyle: form.hairStyle, hairColor: form.hairColor, wearHijab: form.wearHijab,
                      hijabStyle: form.hijabStyle, hijabColor: form.hijabColor,
                      topGarmentType: form.topGarmentType, topGarmentColor: form.topGarmentColor,
                      bottomGarmentType: form.bottomGarmentType, bottomGarmentColor: form.bottomGarmentColor,
                      shoeType: form.shoeType, shoeColor: form.shoeColor,
                      bodyBuild: form.bodyBuild, ageLook: form.ageLook,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Preview</p>
                  <div className="flex flex-wrap gap-1">
                    {form.gender && <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-full px-2 py-0.5 font-semibold capitalize">{form.gender}</span>}
                    {form.skinTone && <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 rounded-full px-2 py-0.5 font-semibold capitalize">{form.skinTone.replace(/-/g, " ")}</span>}
                    {form.wearHijab && <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full px-2 py-0.5 font-semibold">Hijab</span>}
                    {!form.skinTone && <span className="text-[10px] text-muted-foreground italic">Select options to preview</span>}
                  </div>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════
                  CHARACTER TAB — Art Style + Gender + Age
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "character" && (
                <div className="space-y-8">
                  {/* Family Values Mode */}
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Family Values Mode</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {VALUES_PRESETS.map((p) => (
                        <button key={p.id} type="button" onClick={() => applyValuesMode(p.id)}
                          className={cn("rounded-lg border-2 p-2.5 text-left text-xs transition-all",
                            form.valuesMode === p.id
                              ? "border-emerald-500 bg-white dark:bg-emerald-900/40 shadow-sm"
                              : "border-transparent bg-white/60 dark:bg-white/5 hover:border-emerald-300"
                          )}>
                          <div className="font-bold mb-0.5">{p.emoji} {p.label}</div>
                          <div className="text-muted-foreground leading-tight">{p.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Art Style */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">🎬 Art Style</Label>
                    <VisualPicker columns={5} iconSize="xl" value={form.style} onChange={(v) => updateForm("style", v)}
                      options={[
                        { value: "pixar-3d",         label: "3D Rendered",        icon: <Pixar3DSvg /> },
                        { value: "watercolor",        label: "Watercolor",         icon: <WatercolorSvg /> },
                        { value: "flat-illustration", label: "Flat Illus.",        icon: <FlatIllustrationSvg /> },
                        { value: "storybook",         label: "Storybook",          icon: <StorybookSvg /> },
                        { value: "ghibli",            label: "Anime",              icon: <GhibliSvg /> },
                      ]}
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">👤 Gender</Label>
                    <VisualPicker columns={4} iconSize="2xl" value={form.gender}
                      onChange={(v) => {
                        updateForm("gender", v);
                        if (v !== "girl") { updateForm("wearHijab", false); updateForm("hijabStyle", ""); updateForm("hijabColor", ""); }
                        else { if (ageLookImpliesHijabAge(form.ageLook)) updateForm("wearHijab", true); }
                      }}
                      options={[
                        { value: "girl",   label: "Girl",            icon: <img src="/characters/girl.png" alt="Girl" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "boy",    label: "Boy",             icon: <img src="/characters/boy.png" alt="Boy" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "animal", label: "Animal",          icon: <img src="/characters/animal.png" alt="Animal" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "other",  label: "Creature/Fantasy",icon: <img src="/characters/creaturefantasy.png" alt="Creature/Fantasy" className="w-full h-full object-contain" draggable={false} /> },
                      ]}
                    />
                    {form.gender === "girl" && (
                      <div className="flex items-center gap-3 pt-1">
                        <Switch checked={form.wearHijab} disabled={form.valuesMode === "shariah-compliant"}
                          onCheckedChange={(v) => { updateForm("wearHijab", v); if (!v) { updateForm("hijabStyle", ""); updateForm("hijabColor", ""); } }} />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Label>Wears Hijab 🧕</Label>
                            {form.valuesMode === "shariah-compliant" && <Lock className="w-3 h-3 text-emerald-600" />}
                          </div>
                          <p className="text-[11px] text-muted-foreground">Defaults ON for girls aged 9+</p>
                        </div>
                      </div>
                    )}
                    {isOther && (
                      <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                        <p className="font-semibold">🐾 Tips for animal / creature characters:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li><strong>Skin Tone</strong> → describe fur / feather / scale colour (Face tab)</li>
                          <li><strong>Hair / Texture</strong> → select a crest, fur, or scale option (Hair tab)</li>
                          <li><strong>Palette Notes</strong> → full colour scheme (Extras tab)</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Age Look */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">{isOther ? "🐾 Creature Description" : "🎂 Age Look"}</Label>
                    {!isOther ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {AGE_LOOK_CHIPS.map((chip) => (
                            <button key={chip.value} type="button"
                              onClick={() => { updateForm("ageLook", chip.value); if (form.gender === "girl" && ageLookImpliesHijabAge(chip.value)) updateForm("wearHijab", true); }}
                              className={cn("px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all",
                                form.ageLook === chip.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                              )}>{chip.label}</button>
                          ))}
                        </div>
                        <Input placeholder="Or describe custom age look…"
                          value={AGE_LOOK_CHIPS.some((c) => c.value === form.ageLook) ? "" : form.ageLook}
                          onChange={(e) => updateForm("ageLook", e.target.value)} />
                      </div>
                    ) : (
                      <Input placeholder="e.g. small cartoon bird, plump and round"
                        value={form.ageLook} onChange={(e) => updateForm("ageLook", e.target.value)} />
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  FACE TAB — Skin + Eyes + Face Shape + Advanced
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "face" && (
                <div className="space-y-8">
                  {/* Skin Tone */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">
                      {isOther ? "🐾 Fur / Feather / Scale Colour *" : "🎨 Skin Tone *"}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Locks in every illustration</span>
                    </Label>
                    {validationErrors.has("skinTone") && (
                      <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Please select a skin tone</p>
                    )}
                    {isOther ? (
                      <>
                        <VisualPicker columns={3} iconSize="xl" value={form.skinTone} onChange={(v) => updateForm("skinTone", v)}
                          options={[
                            { value: "golden fur",      label: "Golden Fur",      icon: <img src="/fur-feather/golden%20fur.png"     alt="Golden Fur"      className="w-full h-full object-contain" draggable={false} /> },
                            { value: "brown fur",       label: "Brown Fur",       icon: <img src="/fur-feather/brown%20fur.png"      alt="Brown Fur"       className="w-full h-full object-contain" draggable={false} /> },
                            { value: "white feathers",  label: "White Feathers",  icon: <img src="/fur-feather/white%20feathers.png" alt="White Feathers"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "orange feathers", label: "Orange Feathers", icon: <img src="/fur-feather/orange%20features.png" alt="Orange Feathers" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "green scales",    label: "Green Scales",    icon: <img src="/fur-feather/green%20scales.png"   alt="Green Scales"    className="w-full h-full object-contain" draggable={false} /> },
                            { value: "blue scales",     label: "Blue Scales",     icon: <img src="/fur-feather/blue%20scales.png"    alt="Blue Scales"     className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input
                          placeholder="Or describe custom fur / feather / scale colour…"
                          value={form.skinTone && !["golden fur","brown fur","white feathers","orange feathers","green scales","blue scales"].includes(form.skinTone) ? form.skinTone : ""}
                          onChange={(e) => updateForm("skinTone", e.target.value)}
                          className="mt-2"
                        />
                      </>
                    ) : (
                      <VisualPicker columns={6} iconSize="md" value={form.skinTone} onChange={(v) => updateForm("skinTone", v)}
                        options={[
                          { value: "porcelain",    label: "Porcelain",   icon: <img src="/colors/porcelain.png"          alt="Porcelain"   className="w-full h-full object-contain" draggable={false} /> },
                          { value: "fair",         label: "Fair",        icon: <img src="/colors/fair.png"               alt="Fair"        className="w-full h-full object-contain" draggable={false} /> },
                          { value: "light-beige",  label: "Light Beige", icon: <img src="/colors/light-beige.png"        alt="Light Beige" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "beige",        label: "Beige",       icon: <img src="/colors/beige.png"              alt="Beige"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "olive",        label: "Olive",       icon: <img src="/colors/olive.png"              alt="Olive"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "warm-olive",   label: "Warm Olive",  icon: <img src="/colors/warm%20olive.png"       alt="Warm Olive"  className="w-full h-full object-contain" draggable={false} /> },
                          { value: "golden",       label: "Golden",      icon: <img src="/colors/golden.png"             alt="Golden"      className="w-full h-full object-contain" draggable={false} /> },
                          { value: "tan",          label: "Tan",         icon: <img src="/colors/tan.png"                alt="Tan"         className="w-full h-full object-contain" draggable={false} /> },
                          { value: "caramel",      label: "Caramel",     icon: <img src="/colors/caramel.png"            alt="Caramel"     className="w-full h-full object-contain" draggable={false} /> },
                          { value: "medium-brown", label: "Med Brown",   icon: <img src="/colors/medium%20brown.png"    alt="Med Brown"   className="w-full h-full object-contain" draggable={false} /> },
                          { value: "brown",        label: "Brown",       icon: <img src="/colors/brown.png"              alt="Brown"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "dark-brown",   label: "Deep Brown",  icon: <img src="/colors/deep%20brown.png"      alt="Deep Brown"  className="w-full h-full object-contain" draggable={false} /> },
                        ]}
                      />
                    )}
                  </div>

                  {/* Eye Color */}
                  {!isOther && (
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">
                      👁️ Eye Color *
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Locks in every illustration</span>
                    </Label>
                    {validationErrors.has("eyeColor") && (
                      <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Please select an eye colour</p>
                    )}
                    <VisualPicker columns={4} iconSize="xl" value={form.eyeColor} onChange={(v) => updateForm("eyeColor", v)}
                      options={[
                        { value: "amber",      label: "Amber",      icon: <img src="/eyes/amber.png" alt="Amber" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "dark-brown", label: "Dark Brown", icon: <img src="/eyes/deepbrown.png" alt="Dark Brown" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "brown",      label: "Brown",      icon: <img src="/eyes/brown.png" alt="Brown" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "hazel",      label: "Hazel",      icon: <img src="/eyes/hazel.png" alt="Hazel" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "green",      label: "Green",      icon: <img src="/eyes/green.png" alt="Green" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "blue",       label: "Blue",       icon: <img src="/eyes/blue.png" alt="Blue" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "gray",       label: "Gray",       icon: <img src="/eyes/gray.png" alt="Gray" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "black",      label: "Black",      icon: <img src="/eyes/black.png" alt="Black" className="w-full h-full object-contain" draggable={false} /> },
                      ]}
                    />
                  </div>
                  )}

                  {/* Face Shape */}
                  <div className="space-y-3">
                    <Label className="text-lg font-bold">
                      {isOther ? "🐾 Head / Snout Shape" : "😊 Face Shape *"}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Locks in every illustration</span>
                    </Label>
                    {!isOther && validationErrors.has("faceShape") && (
                      <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Please select a face shape</p>
                    )}
                    {isOther ? (
                      <>
                        <VisualPicker columns={4} iconSize="xl" value={form.faceShape} onChange={(v) => updateForm("faceShape", v)}
                          options={[
                            { value: "round beak",          label: "Round Beak",     icon: <img src="/head-snout-shape/round%20beak.png"          alt="Round Beak"     className="w-full h-full object-contain" draggable={false} /> },
                            { value: "flat beak",           label: "Flat Beak",      icon: <img src="/head-snout-shape/flat%20beak.png"           alt="Flat Beak"      className="w-full h-full object-contain" draggable={false} /> },
                            { value: "short snout",         label: "Short Snout",    icon: <img src="/head-snout-shape/short%20snout.png"         alt="Short Snout"    className="w-full h-full object-contain" draggable={false} /> },
                            { value: "pointed snout",       label: "Pointed Snout",  icon: <img src="/head-snout-shape/pointed%20snout.png"       alt="Pointed Snout"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "wide muzzle",         label: "Wide Muzzle",    icon: <img src="/head-snout-shape/wide%20muzzle.png"         alt="Wide Muzzle"    className="w-full h-full object-contain" draggable={false} /> },
                            { value: "square muzzle",       label: "Square Muzzle",  icon: <img src="/head-snout-shape/square%20muzzle.png"       alt="Square Muzzle"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "big friendly muzzle", label: "Friendly Muzzle",icon: <img src="/head-snout-shape/big%20friendly%20muzzle.png" alt="Friendly Muzzle" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "soft rounded head",   label: "Rounded Head",   icon: <img src="/head-snout-shape/soft%20rounded%20head.png" alt="Rounded Head"   className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input
                          placeholder="Or describe custom head / snout shape…"
                          value={form.faceShape && !["round beak","flat beak","short snout","pointed snout","wide muzzle","square muzzle","big friendly muzzle","soft rounded head"].includes(form.faceShape) ? form.faceShape : ""}
                          onChange={(e) => updateForm("faceShape", e.target.value)}
                          className="mt-2"
                        />
                      </>
                    ) : (
                      <VisualPicker columns={3} iconSize="xl" value={form.faceShape} onChange={(v) => updateForm("faceShape", v)}
                        options={form.gender === "girl" ? [
                          { value: "round-friendly",    label: "Round",       icon: <img src="/girls%20E.%20Face%20Shape%20Cards/round.png" alt="Round" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "oval-gentle",        label: "Oval Gentle", icon: <img src="/girls%20E.%20Face%20Shape%20Cards/oval%20gentle.png" alt="Oval Gentle" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "heart-creative",     label: "Heart",       icon: <img src="/girls%20E.%20Face%20Shape%20Cards/heart.png" alt="Heart" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "square-determined",  label: "Square",      icon: <img src="/girls%20E.%20Face%20Shape%20Cards/square.png" alt="Square" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "oval-balanced",      label: "Oval",        icon: <img src="/girls%20E.%20Face%20Shape%20Cards/oval.png" alt="Oval" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "round-youthful",     label: "Round Soft",  icon: <img src="/girls%20E.%20Face%20Shape%20Cards/round%20soft.png" alt="Round Soft" className="w-full h-full object-contain" draggable={false} /> },
                        ] : [
                          { value: "round-friendly",   label: "Round",      icon: <img src="/boy-face/round.png"          alt="Round"      className="w-full h-full object-contain" draggable={false} /> },
                          { value: "oval-gentle",       label: "Oval Gentle",icon: <img src="/boy-face/oval%20gentle.png" alt="Oval Gentle" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "heart-creative",    label: "Heart",      icon: <img src="/boy-face/heart.png"         alt="Heart"      className="w-full h-full object-contain" draggable={false} /> },
                          { value: "square-determined", label: "Square",     icon: <img src="/boy-face/square.png"        alt="Square"     className="w-full h-full object-contain" draggable={false} /> },
                          { value: "oval-balanced",     label: "Oval",       icon: <img src="/boy-face/oval.png"          alt="Oval"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "round-youthful",    label: "Round Soft", icon: <img src="/boy-face/round%20soft.png" alt="Round Soft" className="w-full h-full object-contain" draggable={false} /> },
                        ]}
                      />
                    )}
                  </div>

                  {/* Advanced Details */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <button type="button" onClick={() => setShowAdvanced((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-foreground/80 hover:bg-muted/30 transition-colors">
                      <span>🔬 Advanced Details <span className="font-normal text-muted-foreground">(eyebrows, nose, cheeks, facial hair)</span>
                        {(form.eyebrowStyle || form.noseStyle || form.cheekStyle) && form.ageLook && form.faceShape && (
                          <span className="ml-2 text-[10px] font-medium text-sky-600 bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded-full">✦ Auto-suggested</span>
                        )}
                      </span>
                      {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showAdvanced && (
                      <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                        {!isOther && (
                          <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="font-bold">🪮 Eyebrow Style</Label>
                              <VisualPicker columns={3} iconSize="sm" value={form.eyebrowStyle} onChange={(v) => updateForm("eyebrowStyle", v)} allowDeselect
                                options={[
                                  { value: "thick-arched",   label: "Thick Arch",    icon: <ThickArchedBrowSvg /> },
                                  { value: "thin-straight",  label: "Thin Straight", icon: <ThinStraightBrowSvg /> },
                                  { value: "bushy-straight", label: "Bushy",         icon: <BushyStraightBrowSvg /> },
                                  { value: "soft-rounded",   label: "Soft",          icon: <SoftRoundedBrowSvg /> },
                                  { value: "natural-full",   label: "Natural",       icon: <NaturalFullBrowSvg /> },
                                ]} />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold">👃 Nose Style</Label>
                              <VisualPicker columns={3} iconSize="sm" value={form.noseStyle} onChange={(v) => updateForm("noseStyle", v)} allowDeselect
                                options={[
                                  { value: "button",          label: "Button",   icon: <ButtonNoseSvg /> },
                                  { value: "broad-flat",      label: "Broad",    icon: <BroadFlatNoseSvg /> },
                                  { value: "straight-narrow", label: "Straight", icon: <StraightNarrowNoseSvg /> },
                                  { value: "rounded-soft",    label: "Rounded",  icon: <RoundedSoftNoseSvg /> },
                                  { value: "wide-nostrils",   label: "Wide",     icon: <WideNostrilsNoseSvg /> },
                                ]} />
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold">😊 Cheek Style</Label>
                              <VisualPicker columns={3} iconSize="sm" value={form.cheekStyle} onChange={(v) => updateForm("cheekStyle", v)} allowDeselect
                                options={[
                                  { value: "chubby-rosy",  label: "Rosy",    icon: <ChubbyRosyCheekSvg /> },
                                  { value: "flat-smooth",  label: "Flat",    icon: <FlatSmoothCheekSvg /> },
                                  { value: "high-defined", label: "High",    icon: <HighDefinedCheekSvg /> },
                                  { value: "dimpled",      label: "Dimpled", icon: <DimpledCheekSvg /> },
                                  { value: "soft-round",   label: "Soft",    icon: <SoftRoundCheekSvg /> },
                                ]} />
                            </div>
                          </div>
                        )}
                        {form.gender === "boy" && (
                          <div className="space-y-2">
                            <Label className="font-bold">🧔 Facial Hair {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Recommended for elders</span>}</Label>
                            <Select value={form.facialHair} onValueChange={(v) => updateForm("facialHair", v)}>
                              <SelectTrigger><SelectValue placeholder="Select facial hair…" /></SelectTrigger>
                              <SelectContent>
                                {FACIAL_HAIR_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  HAIR TAB
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "hair" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-bold">
                      {isOther ? "🪺 Head Texture / Crest" : form.wearHijab ? "🧕 Hijab Style" : "💇 Hair Style"}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">Locks in every illustration</span>
                    </Label>
                    {/* GIRL — HIJAB */}
                    {!isOther && form.gender === "girl" && form.wearHijab && (
                      <>
                        <VisualPicker columns={4} iconSize="xl" value={form.hijabStyle} onChange={(v) => updateForm("hijabStyle", v)}
                          options={[
                            { value: "simple-white",       label: "White",        icon: <img src="/hijab/white.png"        alt="White"        className="w-full h-full object-contain" draggable={false} /> },
                            { value: "simple-black",       label: "Black",        icon: <img src="/hijab/black.png"        alt="Black"        className="w-full h-full object-contain" draggable={false} /> },
                            { value: "blue-solid",         label: "Blue",         icon: <img src="/hijab/blue.png"         alt="Blue"         className="w-full h-full object-contain" draggable={false} /> },
                            { value: "dark-blue-solid",    label: "Dark Blue",    icon: <img src="/hijab/dark%20blue.png"  alt="Dark Blue"    className="w-full h-full object-contain" draggable={false} /> },
                            { value: "green-solid",        label: "Green",        icon: <img src="/hijab/green.png"        alt="Green"        className="w-full h-full object-contain" draggable={false} /> },
                            { value: "light-yellow-solid", label: "Light Yellow", icon: <img src="/hijab/light%20yellow.png" alt="Light Yellow" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "pink-solid",         label: "Pink",         icon: <img src="/hijab/pink.png"         alt="Pink"         className="w-full h-full object-contain" draggable={false} /> },
                            { value: "purple-solid",       label: "Purple",       icon: <img src="/hijab/purple.png"       alt="Purple"       className="w-full h-full object-contain" draggable={false} /> },
                            { value: "red-solid",          label: "Red",          icon: <img src="/hijab/red.png"          alt="Red"          className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Hijab colour or custom description…" value={form.hijabColor}
                          onChange={(e) => updateForm("hijabColor", e.target.value)} className="mt-2" />
                      </>
                    )}
                    {/* GIRL — HAIR */}
                    {!isOther && form.gender === "girl" && !form.wearHijab && (
                      <>
                        <VisualPicker columns={3} iconSize="xl" value={form.hairStyle} onChange={(v) => updateForm("hairStyle", v)}
                          options={[
                            { value: "long-black",        label: "Long",          icon: <img src="/girls%20F.%20Hair%20Style%20Cards/long.png" alt="Long" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "long-dark-brown",   label: "Dark Brown",    icon: <img src="/girls%20F.%20Hair%20Style%20Cards/dark%20brown.png" alt="Dark Brown" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "long-brown",        label: "Brown",         icon: <img src="/girls%20F.%20Hair%20Style%20Cards/brown.png" alt="Brown" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "shoulder-length",   label: "Shoulder",      icon: <img src="/girls%20F.%20Hair%20Style%20Cards/shoulder.png" alt="Shoulder" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "short-bob",         label: "Short Bob",     icon: <img src="/girls%20F.%20Hair%20Style%20Cards/short%20bob.png" alt="Short Bob" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "side-swept",        label: "Side Swept",    icon: <img src="/girls%20F.%20Hair%20Style%20Cards/side%20swept.png" alt="Side Swept" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "curly-long",        label: "Long Curly",    icon: <img src="/girls%20F.%20Hair%20Style%20Cards/long%20curly.png" alt="Long Curly" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "curly-short",       label: "Short Curly",   icon: <img src="/girls%20F.%20Hair%20Style%20Cards/short%20curly.png" alt="Short Curly" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "wavy-loose",        label: "Loose Wavy",    icon: <img src="/girls%20F.%20Hair%20Style%20Cards/loose%20wavy.png" alt="Loose Wavy" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "braided-long",      label: "Braided",       icon: <img src="/girls%20F.%20Hair%20Style%20Cards/braided.png" alt="Braided" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "two-braids",        label: "Two Braids",    icon: <img src="/girls%20F.%20Hair%20Style%20Cards/two%20braids.png" alt="Two Braids" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "ponytail-high",     label: "High Ponytail", icon: <img src="/girls%20F.%20Hair%20Style%20Cards/high%20ponytail.png" alt="High Ponytail" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "ponytail-low",      label: "Low Ponytail",  icon: <img src="/girls%20F.%20Hair%20Style%20Cards/low%20ponytail.png" alt="Low Ponytail" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "bun-top",           label: "Top Bun",       icon: <img src="/girls%20F.%20Hair%20Style%20Cards/top%20bun.png" alt="Top Bun" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "half-up-half-down", label: "Half-Up",       icon: <img src="/girls%20F.%20Hair%20Style%20Cards/half%20up.png" alt="Half-Up" className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Hair colour (e.g. dark brown)…" value={form.hairColor}
                          onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                      </>
                    )}
                    {/* BOY — HAIR */}
                    {!isOther && form.gender === "boy" && !isElderMale && (
                      <>
                        <VisualPicker columns={4} iconSize="xl" value={form.hairStyle} onChange={(v) => updateForm("hairStyle", v)}
                          options={[
                            { value: "short-black",      label: "Short",       icon: <img src="/boy%20hairs/short.png" alt="Short" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "short-dark-brown", label: "Short Brown", icon: <img src="/boy%20hairs/short%20brown.png" alt="Short Brown" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "curly-black",      label: "Curly",       icon: <img src="/boy%20hairs/curly.png" alt="Curly" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "wavy-dark",        label: "Wavy",        icon: <img src="/boy%20hairs/wavy.png" alt="Wavy" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "spiky-black",      label: "Spiky",       icon: <img src="/boy%20hairs/spiky.png" alt="Spiky" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "afro",             label: "Afro",        icon: <img src="/boy%20hairs/afro.png" alt="Afro" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "buzz-cut",         label: "Buzz Cut",    icon: <img src="/boy%20hairs/buzz-cut.png" alt="Buzz Cut" className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Hair colour (e.g. dark brown)…" value={form.hairColor}
                          onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                      </>
                    )}
                    {/* ELDER MALE — HAIR */}
                    {!isOther && form.gender === "boy" && isElderMale && (
                      <VisualPicker columns={4} iconSize="md" value={form.hairStyle} onChange={(v) => updateForm("hairStyle", v)}
                        options={[
                          { value: "bald",                       label: "Bald",        icon: <BaldSvg /> },
                          { value: "bald with white hair sides", label: "Bald + Sides",icon: <BaldSvg /> },
                          { value: "short white hair",           label: "White Short", icon: <WhiteShortHairSvg /> },
                          { value: "short gray hair",            label: "Gray Short",  icon: <GrayShortHairSvg /> },
                          { value: "full white hair short",      label: "White Full",  icon: <WhiteShortHairSvg /> },
                          { value: "full gray hair short",       label: "Gray Full",   icon: <GrayShortHairSvg /> },
                        ]}
                      />
                    )}
                    {/* OTHER / CREATURE */}
                    {isOther && (
                      <>
                        <VisualPicker columns={4} iconSize="xl" value={form.hairStyle} onChange={(v) => updateForm("hairStyle", v)}
                          options={[
                            { value: "feathered crest on head", label: "Feather Crest", icon: <img src="/head-texture/feather%20crest.png" alt="Feather Crest" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "no hair (feathers)",      label: "Feathers",       icon: <img src="/head-texture/feathers.png"       alt="Feathers"       className="w-full h-full object-contain" draggable={false} /> },
                            { value: "frill crest",             label: "Frill Crest",    icon: <img src="/head-texture/frill%20crest.png"  alt="Frill Crest"    className="w-full h-full object-contain" draggable={false} /> },
                            { value: "no hair (fur)",           label: "Fur",            icon: <img src="/head-texture/fur.png"            alt="Fur"            className="w-full h-full object-contain" draggable={false} /> },
                            { value: "mane",                    label: "Mane",           icon: <img src="/head-texture/mane.png"           alt="Mane"           className="w-full h-full object-contain" draggable={false} /> },
                            { value: "spikes on head",          label: "Spikes",         icon: <img src="/head-texture/spikes.png"         alt="Spikes"         className="w-full h-full object-contain" draggable={false} /> },
                            { value: "none",                    label: "None / N/A",     icon: <img src="/head-texture/none.png"           alt="None"           className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Crest / texture colour (e.g. orange crest)…" value={form.hairColor}
                          onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                      </>
                    )}
                  </div>

                  {/* Glasses */}
                  {!isOther && (
                    <div className="space-y-2">
                      <Label className="font-bold">
                        👓 Glasses
                        {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Recommended for elders</span>}
                      </Label>
                      <Select value={form.glasses} onValueChange={(v) => updateForm("glasses", v)}>
                        <SelectTrigger><SelectValue placeholder="Select glasses…" /></SelectTrigger>
                        <SelectContent>
                          {GLASSES_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Locks in every illustration</p>
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  OUTFIT TAB
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "outfit" && (
                <div className="space-y-6">
                  {isOther ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base font-bold">🐾 Outfit / Accessories</Label>
                        <VisualPicker columns={4} iconSize="xl" allowDeselect value={form.topGarmentType} onChange={(v) => updateForm("topGarmentType", v)}
                          options={[
                            { value: "red cape",      label: "Red Cape",     icon: <img src="/outfit-accesories/red%20cape.png"      alt="Red Cape"     className="w-full h-full object-contain" draggable={false} /> },
                            { value: "small backpack",label: "Backpack",     icon: <img src="/outfit-accesories/small%20backpack.png" alt="Backpack"     className="w-full h-full object-contain" draggable={false} /> },
                            { value: "flower crown",  label: "Flower Crown", icon: <img src="/outfit-accesories/flower%20crown.png"  alt="Flower Crown" className="w-full h-full object-contain" draggable={false} /> },
                            { value: "simple vest",   label: "Simple Vest",  icon: <img src="/outfit-accesories/simple%20vest.png"   alt="Simple Vest"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "scarf",         label: "Scarf",        icon: <img src="/outfit-accesories/scarf.png"           alt="Scarf"        className="w-full h-full object-contain" draggable={false} /> },
                            { value: "bow tie",       label: "Bow Tie",      icon: <img src="/outfit-accesories/bow%20tie.png"       alt="Bow Tie"      className="w-full h-full object-contain" draggable={false} /> },
                            { value: "none",          label: "None",         icon: <img src="/outfit-accesories/none.png"            alt="None"         className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Or describe custom accessories…"
                          value={["red cape","small backpack","flower crown","simple vest","scarf","bow tie","none"].includes(form.topGarmentType) ? "" : form.topGarmentType}
                          onChange={(e) => updateForm("topGarmentType", e.target.value)} className="mt-1" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Colour Theme</Label>
                        <ColorScrollRow>
                          {OUTFIT_COLORS.map((c) => {
                            const isSel = form.topGarmentColor === c.name;
                            return (
                              <button key={c.name} type="button" title={c.name}
                                onClick={() => updateForm("topGarmentColor", isSel ? "" : c.name)}
                                className={cn("w-11 h-11 sm:w-8 sm:h-8 flex-shrink-0 rounded-full border-2 transition-all hover:scale-110",
                                  isSel ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border")}
                                style={{ backgroundColor: c.hex }} />
                            );
                          })}
                        </ColorScrollRow>
                        <Input placeholder="Or type a custom colour theme…"
                          value={OUTFIT_COLORS.some((c) => c.name === form.topGarmentColor) ? "" : form.topGarmentColor}
                          onChange={(e) => updateForm("topGarmentColor", e.target.value)} className="mt-1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Outfit Rules <span className="text-xs text-muted-foreground">(extra locking rules for AI)</span></Label>
                        <Textarea rows={2} placeholder="e.g. always wears the cape, never changes accessories"
                          value={form.outfitRules} onChange={(e) => updateForm("outfitRules", e.target.value)} />
                      </div>
                    </>
                  ) : (
                  <>
                  {/* Top Garment */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">👕 Top Garment</Label>
                    {form.gender === "girl" ? (
                      <VisualPicker accent="amber" columns={3} iconSize="xl" allowDeselect value={form.topGarmentType}
                        onChange={(v) => { updateForm("topGarmentType", v); if (v === "salwar kameez top" && !form.bottomGarmentType) updateForm("bottomGarmentType", "shalwar"); }}
                        options={[
                          { value: "long-sleeve tunic",     label: "Tunic",   icon: <img src="/girl%20top%20garments/tunic.png" alt="Tunic" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "abaya",                 label: "Abaya",   icon: <img src="/girl%20top%20garments/abaya.png" alt="Abaya" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "modest blouse",         label: "Blouse",  icon: <img src="/girl%20top%20garments/blouse.png" alt="Blouse" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "salwar kameez top",     label: "Kameez",  icon: <img src="/girl%20top%20garments/kameez.png" alt="Kameez" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "long-sleeve dress",     label: "Dress",   icon: <img src="/girl%20top%20garments/dress.png" alt="Dress" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "school uniform blouse", label: "Uniform", icon: <img src="/girl%20top%20garments/uniform.png" alt="Uniform" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "long cardigan",         label: "Cardigan",icon: <LongCardiganSvg /> },
                        ]}
                      />
                    ) : (
                      <VisualPicker accent="amber" columns={4} iconSize="xl" allowDeselect value={form.topGarmentType}
                        onChange={(v) => updateForm("topGarmentType", v)}
                        options={[
                          { value: "t-shirt",           label: "T-Shirt",    icon: <img src="/male%20dress/t-shirt.png"     alt="T-Shirt"     className="w-full h-full object-contain" draggable={false} /> },
                          { value: "long-sleeve shirt", label: "Long Sleeve",icon: <img src="/male%20dress/long-sleeve.png" alt="Long Sleeve" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "collared shirt",    label: "Collar",     icon: <img src="/male%20dress/collar.png"      alt="Collar"      className="w-full h-full object-contain" draggable={false} /> },
                          { value: "hoodie",            label: "Hoodie",     icon: <img src="/male%20dress/hoodie.png"      alt="Hoodie"      className="w-full h-full object-contain" draggable={false} /> },
                          { value: "thobe",             label: "Thobe",      icon: <img src="/male%20dress/thobe.png"       alt="Thobe"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "jalabiya",          label: "Jalabiya",   icon: <img src="/male%20dress/jalabiya.png"   alt="Jalabiya"    className="w-full h-full object-contain" draggable={false} /> },
                          { value: "kurta",             label: "Kurta",      icon: <img src="/male%20dress/kurta.png"       alt="Kurta"       className="w-full h-full object-contain" draggable={false} /> },
                          { value: "jacket",            label: "Jacket",     icon: <img src="/male%20dress/jacket.png"      alt="Jacket"      className="w-full h-full object-contain" draggable={false} /> },
                        ]}
                      />
                    )}
                    <Input placeholder="Or type a custom garment type…"
                      value={(form.gender === "girl" ? TOP_GARMENT_PRESETS_GIRL : TOP_GARMENT_PRESETS_BOY).includes(form.topGarmentType) ? "" : form.topGarmentType}
                      onChange={(e) => updateForm("topGarmentType", e.target.value)} className="mt-1" />
                  </div>

                  {/* Top Color */}
                  <div className="space-y-2">
                    <Label className="font-bold">Top Color</Label>
                    <ColorScrollRow>
                      {OUTFIT_COLORS.map((c) => {
                        const isSel = form.topGarmentColor === c.name;
                        return (
                          <button key={c.name} type="button" title={c.name}
                            onClick={() => updateForm("topGarmentColor", isSel ? "" : c.name)}
                            className={cn("w-11 h-11 sm:w-8 sm:h-8 flex-shrink-0 rounded-full border-2 transition-all hover:scale-110",
                              isSel ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border")}
                            style={{ backgroundColor: c.hex }} />
                        );
                      })}
                    </ColorScrollRow>
                    <Input placeholder="Or type a custom color…"
                      value={OUTFIT_COLORS.some((c) => c.name === form.topGarmentColor) ? "" : form.topGarmentColor}
                      onChange={(e) => updateForm("topGarmentColor", e.target.value)} className="mt-1" />
                  </div>

                  {/* Top Details */}
                  <div className="space-y-2">
                    <Label>Top Details <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input placeholder="e.g. embroidered collar, plain fabric"
                      value={form.topGarmentDetails} onChange={(e) => updateForm("topGarmentDetails", e.target.value)} />
                  </div>

                  {/* Bottom Garment */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">👖 Bottom Garment</Label>
                    {form.gender === "girl" ? (
                      <VisualPicker accent="amber" columns={3} iconSize="xl" allowDeselect value={form.bottomGarmentType}
                        onChange={(v) => updateForm("bottomGarmentType", v)}
                        options={[
                          { value: "wide-leg trousers",    label: "Wide Leg",  icon: <img src="/girl%20bottom%20garments/wide%20leg.png" alt="Wide Leg" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "long skirt",           label: "Long Skirt",icon: <img src="/girl%20bottom%20garments/long%20skirt.png" alt="Long Skirt" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "maxi skirt",           label: "Maxi Skirt",icon: <img src="/girl%20bottom%20garments/maxi%20shirk.png" alt="Maxi Skirt" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "school uniform skirt", label: "Uniform",   icon: <img src="/girl%20bottom%20garments/uniform.png" alt="Uniform" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "shalwar",              label: "Shalwar",   icon: <img src="/girl%20bottom%20garments/shalwar.png" alt="Shalwar" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "palazzo pants",        label: "Palazzo",   icon: <img src="/girl%20bottom%20garments/palazzo.png" alt="Palazzo" className="w-full h-full object-contain" draggable={false} /> },
                        ]}
                      />
                    ) : (
                      <VisualPicker accent="amber" columns={3} iconSize="xl" allowDeselect value={form.bottomGarmentType}
                        onChange={(v) => updateForm("bottomGarmentType", v)}
                        options={[
                          { value: "trousers", label: "Trousers", icon: <TrousersSvg /> },
                          { value: "jeans",    label: "Jeans",    icon: <img src="/trousers/jeans.png" alt="Jeans" className="w-full h-full object-contain" draggable={false} /> },
                          { value: "shorts",   label: "Shorts",   icon: <img src="/trousers/shorts.png" alt="Shorts" className="w-full h-full object-contain" draggable={false} /> },
                        ]}
                      />
                    )}
                    <Input placeholder="Or type a custom bottom garment…"
                      value={(form.gender === "girl" ? BOTTOM_GARMENT_PRESETS_GIRL : BOTTOM_GARMENT_PRESETS_BOY).includes(form.bottomGarmentType) ? "" : form.bottomGarmentType}
                      onChange={(e) => updateForm("bottomGarmentType", e.target.value)} className="mt-1" />
                  </div>

                  {/* Bottom Color */}
                  <div className="space-y-2">
                    <Label className="font-bold">Bottom Color</Label>
                    <ColorScrollRow>
                      {OUTFIT_COLORS.map((c) => {
                        const isSel = form.bottomGarmentColor === c.name;
                        return (
                          <button key={c.name} type="button" title={c.name}
                            onClick={() => updateForm("bottomGarmentColor", isSel ? "" : c.name)}
                            className={cn("w-11 h-11 sm:w-8 sm:h-8 flex-shrink-0 rounded-full border-2 transition-all hover:scale-110",
                              isSel ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border")}
                            style={{ backgroundColor: c.hex }} />
                        );
                      })}
                    </ColorScrollRow>
                    <Input placeholder="Or type a custom color…"
                      value={OUTFIT_COLORS.some((c) => c.name === form.bottomGarmentColor) ? "" : form.bottomGarmentColor}
                      onChange={(e) => updateForm("bottomGarmentColor", e.target.value)} className="mt-1" />
                  </div>

                  {/* Shoes */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">👟 Shoe Type</Label>
                    <VisualPicker accent="amber" columns={4} iconSize="xl" allowDeselect value={form.shoeType}
                      onChange={(v) => updateForm("shoeType", v)}
                      options={[
                        { value: "sneakers",         label: "Sneakers",  icon: <img src="/shoes/sneakers.png" alt="Sneakers" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "school shoes",     label: "School",    icon: <img src="/shoes/school.png" alt="School" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "mary jane flats",  label: "Mary Jane", icon: <img src="/shoes/mary-jane.png" alt="Mary Jane" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "sandals",          label: "Sandals",   icon: <img src="/shoes/sandals.png" alt="Sandals" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "leather sandals",  label: "Leather",   icon: <img src="/shoes/leather.png" alt="Leather Sandals" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "boots",            label: "Boots",     icon: <img src="/shoes/boots.png" alt="Boots" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "slippers",         label: "Slippers",  icon: <img src="/shoes/slippers.png" alt="Slippers" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "oxford shoes",     label: "Oxford",    icon: <img src="/shoes/oxford.png" alt="Oxford" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "khussa",           label: "Khussa",    icon: <img src="/shoes/khussa.png"    alt="Khussa"    className="w-full h-full object-contain" draggable={false} /> },
                        { value: "balgha slippers",  label: "Balgha",    icon: <img src="/shoes/balga.png"     alt="Balgha"    className="w-full h-full object-contain" draggable={false} /> },
                        { value: "open-toe sandals", label: "Open-Toe",  icon: <img src="/shoes/open-toe.png"  alt="Open-Toe"  className="w-full h-full object-contain" draggable={false} /> },
                        { value: "ballerina flats",  label: "Ballerina", icon: <img src="/shoes/balleria.png"  alt="Ballerina" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "heels",            label: "Heels",     icon: <img src="/shoes/heels.png"     alt="Heels"     className="w-full h-full object-contain" draggable={false} /> },
                        { value: "pumps",            label: "Pumps",     icon: <img src="/shoes/pumps.png"     alt="Pumps"     className="w-full h-full object-contain" draggable={false} /> },
                      ]}
                    />
                    <Input placeholder="Or type a custom shoe type…"
                      value={SHOE_PRESETS.includes(form.shoeType) ? "" : form.shoeType}
                      onChange={(e) => updateForm("shoeType", e.target.value)} className="mt-1" />
                  </div>

                  {/* Shoe Color */}
                  <div className="space-y-2">
                    <Label className="font-bold">Shoe Color</Label>
                    <ColorScrollRow>
                      {OUTFIT_COLORS.map((c) => {
                        const isSel = form.shoeColor === c.name;
                        return (
                          <button key={c.name} type="button" title={c.name}
                            onClick={() => updateForm("shoeColor", isSel ? "" : c.name)}
                            className={cn("w-11 h-11 sm:w-8 sm:h-8 flex-shrink-0 rounded-full border-2 transition-all hover:scale-110",
                              isSel ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border")}
                            style={{ backgroundColor: c.hex }} />
                        );
                      })}
                    </ColorScrollRow>
                    <Input placeholder="Or type a custom color…"
                      value={OUTFIT_COLORS.some((c) => c.name === form.shoeColor) ? "" : form.shoeColor}
                      onChange={(e) => updateForm("shoeColor", e.target.value)} className="mt-1" />
                  </div>

                  {/* Modesty Rules */}
                  <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2">
                      <Label>Modesty Rules</Label>
                      {form.valuesMode !== "custom" && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <Lock className="w-3 h-3" /> Locked by {VALUES_PRESETS.find(p => p.id === form.valuesMode)?.label}
                        </span>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={form.longSleeves} disabled={form.valuesMode !== "custom"}
                          onCheckedChange={(v) => updateForm("longSleeves", v)} />
                        <span className="text-sm">Long Sleeves</span>
                        {form.valuesMode !== "custom" && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={form.looseClothing} disabled={form.valuesMode !== "custom"}
                          onCheckedChange={(v) => updateForm("looseClothing", v)} />
                        <span className="text-sm">Loose Clothing</span>
                        {form.valuesMode !== "custom" && <Lock className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Input placeholder="e.g. always neat and modest" value={form.modestyNotes}
                        onChange={(e) => updateForm("modestyNotes", e.target.value)} />
                    </div>
                  </div>

                  {/* Outfit Rules */}
                  <div className="space-y-2">
                    <Label>Outfit Rules <span className="text-xs text-muted-foreground">(extra locking rules for AI)</span></Label>
                    <Textarea rows={2} placeholder="e.g. always wears the same uniform, no random color changes"
                      value={form.outfitRules} onChange={(e) => updateForm("outfitRules", e.target.value)} />
                  </div>
                  </>)}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  BODY TAB
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "body" && (
                <div className="space-y-6">
                  {isOther ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-base font-bold">🐾 Body Proportions</Label>
                        <VisualPicker columns={5} iconSize="xl" accent="blue" allowDeselect value={form.bodyBuild}
                          onChange={(v) => updateForm("bodyBuild", v)}
                          options={[
                            { value: "slim animal body",     label: "Slim",     icon: <img src="/animal-body/slim.png"     alt="Slim"     className="w-full h-full object-contain" draggable={false} /> },
                            { value: "average animal body",  label: "Average",  icon: <img src="/animal-body/average.png"  alt="Average"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "chubby animal body",   label: "Chubby",   icon: <img src="/animal-body/chubby.png"   alt="Chubby"   className="w-full h-full object-contain" draggable={false} /> },
                            { value: "athletic animal body", label: "Athletic", icon: <img src="/animal-body/athletic.png" alt="Athletic"  className="w-full h-full object-contain" draggable={false} /> },
                            { value: "tall animal body",     label: "Tall",     icon: <img src="/animal-body/tall.png"     alt="Tall"     className="w-full h-full object-contain" draggable={false} /> },
                          ]}
                        />
                        <Input placeholder="Or describe a custom build (e.g. tiny fairy-sized, horse-sized, large and fluffy)…"
                          value={["slim animal body","average animal body","chubby animal body","athletic animal body","tall animal body"].includes(form.bodyBuild) ? "" : form.bodyBuild}
                          onChange={(e) => updateForm("bodyBuild", e.target.value)} className="mt-1" />
                      </div>
                    </>
                  ) : (
                  <>
                  {/* Body Build */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">🧍 Body Build</Label>
                    <VisualPicker columns={4} iconSize="xl" accent="blue" allowDeselect value={form.bodyBuild}
                      onChange={(v) => updateForm("bodyBuild", v)}
                      options={[
                        { value: "slim and lean",             label: "Slim",     icon: <img src="/weight%20feel%20card/slim.png" alt="Slim" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "average build",             label: "Average",  icon: <img src="/weight%20feel%20card/average.png" alt="Average" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "soft and round",            label: "Soft",     icon: <img src="/weight%20feel%20card/soft.png" alt="Soft" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "athletic and fit",          label: "Athletic", icon: <img src="/weight%20feel%20card/atletic.png" alt="Athletic" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "stocky and strong",         label: "Stocky",   icon: <img src="/weight%20feel%20card/stocky.png" alt="Stocky" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "tall and slender",          label: "Tall Slim",icon: <TallSlenderBodySvg /> },
                        { value: "petite and light",          label: "Petite",   icon: <img src="/weight%20feel%20card/petite.png" alt="Petite" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "broad-shouldered",          label: "Broad",    icon: <BroadShoulderBodySvg /> },
                        { value: "small toddler round tummy", label: "Toddler",  icon: <img src="/weight%20feel%20card/toddler.png" alt="Toddler" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "round and full",            label: "Round",    icon: <img src="/weight%20feel%20card/round.png" alt="Round" className="w-full h-full object-contain" draggable={false} /> },
                      ]}
                    />
                    <Input placeholder="Or describe a custom build…"
                      value={BODY_BUILDS.includes(form.bodyBuild) ? "" : form.bodyBuild}
                      onChange={(e) => updateForm("bodyBuild", e.target.value)} className="mt-1" />
                  </div>

                  {/* Height Feel */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">📐 Height Feel</Label>
                    <VisualPicker columns={4} iconSize="xl" accent="blue" allowDeselect value={form.heightFeel}
                      onChange={(v) => updateForm("heightFeel", v)}
                      options={[
                        { value: "very small",        label: "Very Small",     icon: <img src="/height-feel-card/very%20small.png" alt="Very Small" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "small",             label: "Small",          icon: <img src="/height-feel-card/small.png" alt="Small" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "slightly short",    label: "Slightly Short", icon: <img src="/height-feel-card/slighlty%20short.png" alt="Slightly Short" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "average height",    label: "Average",        icon: <img src="/height-feel-card/average.png" alt="Average" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "slightly tall",     label: "Slightly Tall",  icon: <img src="/height-feel-card/slighlty%20tall.png" alt="Slightly Tall" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "tall",              label: "Tall",           icon: <img src="/height-feel-card/tall.png" alt="Tall" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "very tall",         label: "Very Tall",      icon: <img src="/height-feel-card/very%20tall.png" alt="Very Tall" className="w-full h-full object-contain" draggable={false} /> },
                        { value: "towers over others",label: "Towering",       icon: <img src="/height-feel-card/towering.png" alt="Towering" className="w-full h-full object-contain" draggable={false} /> },
                      ]}
                    />
                  </div>

                  {/* Exact measurements */}
                  <details className="group">
                    <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors list-none flex items-center gap-1">
                      <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                      Add exact measurements (optional)
                    </summary>
                    <div className="grid sm:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <div className="flex items-center gap-2">
                          <Input type="number" min={40} max={220} placeholder="e.g. 115"
                            value={form.heightCm || ""} onChange={(e) => updateForm("heightCm", parseInt(e.target.value, 10) || 0)} className="flex-1" />
                          <span className="text-xs text-muted-foreground shrink-0">cm</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Typical: {suggestedHeightRange(ageNum)}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Height (ft)</Label>
                        <Input type="number" value={form.heightFeet || ""} placeholder="e.g. 4.0" step="0.1"
                          onChange={(e) => updateForm("heightFeet", parseFloat(e.target.value) || 0)} />
                      </div>
                    </div>
                  </details>
                  </>)}
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════════
                  EXTRAS TAB
              ═══════════════════════════════════════════════════════════════ */}
              {dnaTab === "extras" && (
                <div className="space-y-6">
                  {/* Accessories */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">✨ Accessories</Label>
                    <div className="flex flex-wrap gap-2">
                      {ACCESSORIES_PRESETS.map((opt) => (
                        <button key={opt} type="button"
                          onClick={() => { const list = form.accessoriesList.includes(opt) ? form.accessoriesList.filter((a) => a !== opt) : [...form.accessoriesList, opt]; updateForm("accessoriesList", list); }}
                          className={cn("px-3 py-1.5 rounded-full text-sm border-2 transition-all",
                            form.accessoriesList.includes(opt) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                          )}>{opt}</button>
                      ))}
                    </div>
                    <Input placeholder="Add more accessories (comma-separated)…"
                      value={form.accessoriesText} onChange={(e) => updateForm("accessoriesText", e.target.value)} className="mt-1" />
                    {(form.accessoriesList.length > 0 || form.accessoriesText) && (
                      <p className="text-xs text-primary">
                        Selected: {[...form.accessoriesList, ...form.accessoriesText.split(",").map(s => s.trim()).filter(Boolean)].join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Palette Notes */}
                  <div className="space-y-2">
                    <Label className="text-base font-bold">🎨 Palette Notes</Label>
                    <Input placeholder="e.g. warm soft colors, blue + cream only"
                      value={form.paletteNotes} onChange={(e) => updateForm("paletteNotes", e.target.value)} />
                  </div>
                </div>
              )}

              {/* ── Tab prev / next navigation ──────────────────────────────── */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                {DNA_TABS.indexOf(dnaTab) > 0 ? (
                  <Button variant="outline" onClick={() => { setDnaTab(DNA_TABS[DNA_TABS.indexOf(dnaTab) - 1]); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    {DNA_TAB_META[DNA_TABS[DNA_TABS.indexOf(dnaTab) - 1]].label}
                  </Button>
                ) : <div />}
                {DNA_TABS.indexOf(dnaTab) < DNA_TABS.length - 1 ? (
                  <Button onClick={() => { setDnaTab(DNA_TABS[DNA_TABS.indexOf(dnaTab) + 1]); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    {DNA_TAB_META[DNA_TABS[DNA_TABS.indexOf(dnaTab) + 1]].label}
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button onClick={tryAdvance}>
                    Continue to Generate <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* ── Live Avatar Preview — sticky right column ───────────── */}
            <div className="hidden space-y-3 xl:sticky xl:top-24 xl:block">
              <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-3 pb-2.5 border-b border-border/60 bg-gradient-to-r from-card to-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider">Live Preview</p>
                  </div>
                  <div className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold flex items-center gap-1",
                    form.valuesMode === "shariah-compliant"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : form.valuesMode === "wholesome"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
                        : "bg-muted text-muted-foreground"
                  )}>
                    <Shield className="w-3 h-3" />
                    {VALUES_PRESETS.find(p => p.id === form.valuesMode)?.label}
                  </div>
                </div>

                {/* Avatar canvas */}
                <div className="relative bg-gradient-to-b from-amber-50 via-orange-50/60 to-stone-100 dark:from-stone-900/60 dark:via-stone-800/40 dark:to-stone-900/60 h-[340px] flex items-center justify-center px-6 py-4">
                  {/* Decorative ring */}
                  <div className="absolute inset-4 rounded-2xl border border-amber-200/40 dark:border-stone-700/30 pointer-events-none" />
                  <CharacterAvatarPreview
                    form={{
                      gender: form.gender,
                      skinTone: form.skinTone,
                      eyeColor: form.eyeColor,
                      hairStyle: form.hairStyle,
                      hairColor: form.hairColor,
                      wearHijab: form.wearHijab,
                      hijabStyle: form.hijabStyle,
                      hijabColor: form.hijabColor,
                      topGarmentType: form.topGarmentType,
                      topGarmentColor: form.topGarmentColor,
                      bottomGarmentType: form.bottomGarmentType,
                      bottomGarmentColor: form.bottomGarmentColor,
                      shoeType: form.shoeType,
                      shoeColor: form.shoeColor,
                      bodyBuild: form.bodyBuild,
                      ageLook: form.ageLook,
                      name: form.name || undefined,
                    }}
                  />
                </div>

                {/* Character name */}
                {form.name && (
                  <div className="px-4 py-2 border-t border-border/40 bg-muted/10 text-center">
                    <p className="text-sm font-bold truncate">{form.name}</p>
                    {form.ageLook && <p className="text-xs text-muted-foreground capitalize truncate">{form.ageLook}</p>}
                  </div>
                )}

                {/* Quick stat pills */}
                <div className="px-3 py-3 flex flex-wrap gap-1.5 border-t border-border/60 bg-muted/10">
                  {form.gender && (
                    <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 rounded-full px-2.5 py-0.5 font-semibold capitalize">
                      {form.gender}
                    </span>
                  )}
                  {form.skinTone && (
                    <span className="text-[11px] bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 rounded-full px-2.5 py-0.5 font-semibold capitalize">
                      {form.skinTone.replace(/-/g, " ")}
                    </span>
                  )}
                  {form.topGarmentType && (
                    <span className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 rounded-full px-2.5 py-0.5 font-semibold capitalize">
                      {form.topGarmentType}
                    </span>
                  )}
                  {form.wearHijab && (
                    <span className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full px-2.5 py-0.5 font-semibold">
                      Hijab
                    </span>
                  )}
                  {form.longSleeves && (
                    <span className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full px-2.5 py-0.5 font-semibold">
                      Long sleeves
                    </span>
                  )}
                  {form.bodyBuild && (
                    <span className="text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-full px-2.5 py-0.5 font-semibold capitalize">
                      {form.bodyBuild.replace(/ and /gi, " & ")}
                    </span>
                  )}
                  {!form.skinTone && !form.gender && (
                    <span className="text-xs text-muted-foreground italic">Select options to see preview</span>
                  )}
                </div>
              </div>
            </div>

            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Generate Character</h2>

              {!createdCharacter ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-subtle mx-auto flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground/30" />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1">Ready to Generate</h3>
                    <p className="text-sm text-muted-foreground">
                      Costs {GENERATION_COST} credits. You have {credits}.
                    </p>
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleCreateAndGenerate}
                    disabled={isGenerating || credits < GENERATION_COST}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Character ({GENERATION_COST} cr)
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-6">
                    <div className="w-48 shrink-0">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-subtle">
                        {createdCharacter.imageUrl ? (
                          <img
                            src={createdCharacter.imageUrl}
                            alt={createdCharacter.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {createdCharacter.status !== "approved" && createdCharacter.imageUrl && (
                          <Button
                            variant="hero"
                            size="sm"
                            className="flex-1"
                            onClick={handleApprove}
                            disabled={approveCharacter.isPending}
                          >
                            <ThumbsUp className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={isGenerating || credits < GENERATION_COST}
                          className={createdCharacter.status !== "approved" && createdCharacter.imageUrl ? "" : "flex-1"}
                        >
                          <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                          {createdCharacter.status !== "approved" && createdCharacter.imageUrl ? "" : " Regen"}
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-lg font-bold">{createdCharacter.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {createdCharacter.role} · {createdCharacter.ageRange}
                        </p>
                      </div>

                      {createdCharacter.traits?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {createdCharacter.traits.map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-xs capitalize">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="text-sm space-y-1 text-muted-foreground">
                        {createdCharacter.visualDNA?.skinTone && <p>Skin: {createdCharacter.visualDNA.skinTone}</p>}
                        {createdCharacter.visualDNA?.eyeColor && <p>Eyes: {createdCharacter.visualDNA.eyeColor}</p>}
                        {(createdCharacter.visualDNA?.hairStyle || createdCharacter.visualDNA?.hijabStyle) && (
                          <p>
                            Hair/Hijab: {createdCharacter.visualDNA?.hijabStyle || createdCharacter.visualDNA?.hairStyle}
                          </p>
                        )}
                        {createdCharacter.visualDNA?.topGarmentColor && (
                          <p>Outfit color: {createdCharacter.visualDNA.topGarmentColor}</p>
                        )}
                      </div>

                      {createdCharacter.status === "approved" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                            <Check className="w-4 h-4" />
                            Character approved — ready for books!
                          </div>
                          {/* T-34: Save as template */}
                          {!templateSaved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                              onClick={handleSaveAsTemplate}
                              disabled={savingTemplate}
                            >
                              {savingTemplate
                                ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                                : <BookmarkPlus className="w-3.5 h-3.5 mr-2" />}
                              Save as my template
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 text-amber-600 text-xs">
                              <Check className="w-3 h-3" /> Saved to your template library
                            </div>
                          )}
                          <div className="flex flex-col gap-2 pt-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Reset wizard in-place — navigating to same route won't remount
                                setCurrentStep(0);
                                setCreatedCharacter(null);
                                setIsGenerating(false);
                                setIsGeneratingPose(false);
                                setForm((f) => ({
                                  ...f,
                                  name: "",
                                  role: "Protagonist",
                                  ageRange: "" as any,
                                  traits: [],
                                  ageLook: "",
                                  skinTone: "",
                                  eyeColor: "",
                                  faceShape: "",
                                  eyebrowStyle: "",
                                  noseStyle: "",
                                  cheekStyle: "",
                                  hairStyle: "",
                                  hairColor: "",
                                  hairVisibility: "visible",
                                  hijabStyle: "",
                                  hijabColor: "",
                                  topGarmentType: "",
                                  topGarmentColor: "",
                                  topGarmentDetails: "",
                                  bottomGarmentType: "",
                                  bottomGarmentColor: "",
                                  shoeType: "",
                                  shoeColor: "",
                                  bodyBuild: "",
                                  heightFeel: "",
                                  heightCm: 0,
                                  heightFeet: 0,
                                  facialHair: "none",
                                  glasses: "none",
                                  accessoriesText: "",
                                  paletteNotes: "",
                                  outfitRules: "",
                                  modestyNotes: "",
                                }));
                              }}
                            >
                              ✨ Add Another Character
                            </Button>
                            <Button
                              variant="hero"
                              size="sm"
                              onClick={() => navigate("/app/books/new")}
                            >
                              📚 Start Creating a Book →
                            </Button>
                          </div>
                        </div>
                      )}

                      {!createdCharacter.imageUrl && isGenerating && (
                        <p className="text-sm text-muted-foreground animate-pulse">
                          Generating portrait...
                        </p>
                      )}
                    </div>
                  </div>

                  {credits < GENERATION_COST && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Low credits — you may not be able to regenerate.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Pose Library</h2>
              <p className="text-muted-foreground text-sm">
                Generate all character poses at once for consistent illustrations across your book.
                Costs {POSE_SHEET_COST} credits.
              </p>

              {(() => {
                const poses = createdCharacter?.poseLibrary || [];
                const hasPoses = poses.length > 0;
                const allLoaded = hasPoses && poses.every((p: any) => p.imageUrl);

                const handleRefreshPoses = async () => {
                  if (!createdCharacter) return;
                  try {
                    const id = (createdCharacter as any).id || (createdCharacter as any)._id;
                    const fresh = await charactersApi.get(id);
                    setCreatedCharacter(fresh as any);
                  } catch { /* silently ignore */ }
                };

                return hasPoses ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {poses.map((pose: any) => (
                        <PoseTile key={pose.poseKey} pose={pose} />
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      {allLoaded ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                          <Check className="w-4 h-4" />
                          {poses.length} poses ready!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Some images still loading…
                        </div>
                      )}
                      <Button variant="outline" size="sm" onClick={handleRefreshPoses}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />Refresh
                      </Button>
                    </div>
                    <Button
                      variant="hero"
                      onClick={() => navigate(`/app/characters/${createdCharacter?.id || (createdCharacter as any)?._id}`)}
                    >
                      View Character Profile
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4">
                    <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-muted/50 flex items-center justify-center text-xs text-muted-foreground/40 font-medium border border-border">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="hero"
                        onClick={handleGeneratePoseSheet}
                        disabled={isGeneratingPose || credits < POSE_SHEET_COST}
                      >
                        {isGeneratingPose ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating all poses…</>
                        ) : (
                          <><Sparkles className="w-4 h-4 mr-2" />Generate All Poses ({POSE_SHEET_COST} cr)</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/app/characters/${createdCharacter?.id || (createdCharacter as any)?._id}`)}
                      >
                        Skip for now
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="-mx-4 sticky bottom-0 z-10 mt-4 flex items-center justify-between border-t border-border bg-background/95 px-4 pb-3 pt-3 backdrop-blur-sm sm:-mx-6 sm:px-6 xl:-mx-8 xl:px-8">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStep === 0) navigate("/app/characters");
                else setCurrentStep((s) => s - 1);
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 0 ? "Cancel" : "Previous"}
            </Button>

            {currentStep < steps.length - 1 ? (
              currentStep === 2 && !createdCharacter ? (
                <span />
              ) : (
                <Button
                  variant="hero"
                  onClick={tryAdvance}
                  disabled={!canProceed()}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )
            ) : (
              <Button
                variant="hero"
                onClick={() => navigate(`/app/characters/${createdCharacter?.id || createdCharacter?._id}`)}
                disabled={!createdCharacter}
              >
                <Check className="w-4 h-4 mr-2" />
                View Character
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
