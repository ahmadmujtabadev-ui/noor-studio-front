import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
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
import {
  Pixar3DSvg, WatercolorSvg, FlatIllustrationSvg, StorybookSvg, GhibliSvg,
  GirlSvg, BoySvg, CreatureSvg,
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
  { value: "round-youthful", label: "Round & Youthful" },
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
  { value: "long-black", label: "Long Black" },
  { value: "long-dark-brown", label: "Long Dark Brown" },
  { value: "long-brown", label: "Long Brown" },
  { value: "curly-long", label: "Long Curly" },
  { value: "braided-long", label: "Long Braided" },
  { value: "ponytail-high", label: "High Ponytail" },
  { value: "bun-top", label: "Top Bun" },
];

const HIJAB_STYLES = [
  { value: "simple-white", label: "Simple White Hijab" },
  { value: "simple-black", label: "Simple Black Hijab" },
  { value: "simple-beige", label: "Simple Beige Hijab" },
  { value: "blue-solid", label: "Blue Hijab" },
  { value: "pink-solid", label: "Pink Hijab" },
  { value: "purple-solid", label: "Purple Hijab" },
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
  { value: "chubby-rosy",     label: "Chubby & Rosy" },
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
  "chubby and soft",
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
];

const ACCESSORIES_PRESETS = [
  "round glasses",
  "small backpack",
  "wristband",
  "tasbih beads",
  "small book in hand",
  "kite",
  "water bottle",
  "silver compass",
  "notebook",
  "smartwatch",
  "headband",
  "small badge / pin",
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
const ROLES = ["Protagonist", "Supporting", "Villain", "Elder", "Other"];

const STYLES = [
  { id: "pixar-3d", label: "Pixar 3D" },
  { id: "watercolor", label: "Watercolor" },
  { id: "flat-illustration", label: "Flat Illustration" },
  { id: "storybook", label: "Storybook" },
  { id: "ghibli", label: "Ghibli" },
];

const GENERATION_COST = 4;
const POSE_SHEET_COST = 6;

const steps = [
  { id: 0, title: "Persona", icon: User },
  { id: 1, title: "Visual DNA", icon: Palette },
  { id: 2, title: "Generate", icon: Sparkles },
  { id: 3, title: "Pose Sheet", icon: Image },
];

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
    gender: (tplVd.gender === "boy" || tplVd.gender === "male" ? "boy" : tplVd.gender === "other" || tplVd.gender === "neutral" ? "other" : "girl") as "boy" | "girl" | "other",
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
    weightKg: tplVd.weightKg || 0,

    facialHair: tplVd.facialHair || "none",
    glasses: tplVd.glasses || "none",

    accessoriesText: "",
    accessoriesList: tplVd.accessories || [] as string[],
    paletteNotes: tplVd.paletteNotes || "",
    outfitRules: "",

    longSleeves: tplMr.longSleeves ?? true,
    looseClothing: tplMr.looseClothing ?? true,
    modestyNotes: tplMr.notes || "",
  });

  const updateForm = (field: string, value: unknown) =>
    setForm((f) => ({ ...f, [field]: value }));

  const toggleTrait = (trait: string) => {
    setForm((f) => ({
      ...f,
      traits: f.traits.includes(trait)
        ? f.traits.filter((t) => t !== trait)
        : [...f.traits, trait].slice(0, 5),
    }));
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
  const isOther = form.gender === "other";

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
          weightKg: form.weightKg || undefined,

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
      <div className="max-w-4xl mx-auto">
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

        <div className="card-glow p-8 space-y-6 rounded-3xl border-2 border-border">
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
                  <SelectTrigger className={cn(!form.selectedUniverseId && "border-destructive/50")}>
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
                />
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
            <div className="space-y-6">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">🎨 Visual DNA</h2>

              {/* ── Art Style ─────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-base font-bold">🎬 Art Style</Label>
                <VisualPicker
                  columns={5}
                  iconSize="lg"
                  value={form.style}
                  onChange={(v) => updateForm("style", v)}
                  options={[
                    { value: "pixar-3d",          label: "Pixar 3D",       icon: <Pixar3DSvg /> },
                    { value: "watercolor",         label: "Watercolor",     icon: <WatercolorSvg /> },
                    { value: "flat-illustration",  label: "Flat Illus.",    icon: <FlatIllustrationSvg /> },
                    { value: "storybook",          label: "Storybook",      icon: <StorybookSvg /> },
                    { value: "ghibli",             label: "Ghibli",         icon: <GhibliSvg /> },
                  ]}
                />
              </div>

              {/* ── Gender + Hijab + Age Look ─────────────────────────────── */}
              <div className="space-y-3">
                <Label className="text-base font-bold">👤 Gender</Label>
                <VisualPicker
                  columns={3}
                  iconSize="lg"
                  value={form.gender}
                  onChange={(v) => {
                    updateForm("gender", v);
                    if (v !== "girl") {
                      updateForm("wearHijab", false);
                      updateForm("hijabStyle", "");
                      updateForm("hijabColor", "");
                    }
                  }}
                  options={[
                    { value: "girl",  label: "Girl",            icon: <GirlSvg /> },
                    { value: "boy",   label: "Boy",             icon: <BoySvg /> },
                    { value: "other", label: "Other / Creature",icon: <CreatureSvg /> },
                  ]}
                />
                {form.gender === "girl" && (
                  <div className="flex items-center gap-3 pt-1">
                    <Switch
                      checked={form.wearHijab}
                      onCheckedChange={(v) => {
                        updateForm("wearHijab", v);
                        if (!v) { updateForm("hijabStyle", ""); updateForm("hijabColor", ""); }
                      }}
                    />
                    <Label>Wears Hijab 🧕</Label>
                  </div>
                )}
                {isOther && (
                  <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 text-xs text-yellow-800 dark:text-yellow-200 space-y-1">
                    <p className="font-semibold">🐾 Tips for animal / creature characters:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li><strong>Skin Tone</strong> → describe fur / feather / scale colour</li>
                      <li><strong>Hair / Texture</strong> → select a crest, fur, or scale option</li>
                      <li><strong>Palette Notes</strong> → full colour scheme description</li>
                    </ul>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{isOther ? "Creature Description" : "Age Look"}</Label>
                  <Input
                    placeholder={isOther ? "e.g. small cartoon bird, plump and round" : "e.g. 12 year old girl"}
                    value={form.ageLook}
                    onChange={(e) => updateForm("ageLook", e.target.value)}
                  />
                </div>
              </div>

              {/* ── Skin Tone ─────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-base font-bold">
                  {isOther ? "🐾 Fur / Feather / Scale Colour *" : "🎨 Skin Tone *"}
                </Label>
                {isOther ? (
                  <Input
                    placeholder="e.g. bright golden-yellow feathers, orange wingtips"
                    value={form.skinTone}
                    onChange={(e) => updateForm("skinTone", e.target.value)}
                  />
                ) : (
                  <VisualPicker
                    columns={7}
                    iconSize="md"
                    value={form.skinTone}
                    onChange={(v) => updateForm("skinTone", v)}
                    options={Object.entries(SKIN_TONE_COLORS).map(([value, { label }]) => ({
                      value,
                      label,
                      icon: <SkinToneSwatch color={value} />,
                    }))}
                  />
                )}
              </div>

              {/* ── Eye Color ─────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-base font-bold">👁️ Eye Color *</Label>
                <VisualPicker
                  columns={7}
                  iconSize="md"
                  value={form.eyeColor}
                  onChange={(v) => updateForm("eyeColor", v)}
                  options={Object.entries(EYE_COLOR_MAP).map(([value]) => ({
                    value,
                    label: value.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" "),
                    icon: <EyeSwatch color={value} />,
                  }))}
                />
              </div>

              {/* ── Face Shape ────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-base font-bold">😊 Face Shape *</Label>
                <VisualPicker
                  columns={6}
                  iconSize="md"
                  value={form.faceShape}
                  onChange={(v) => updateForm("faceShape", v)}
                  options={[
                    { value: "round-friendly",  label: "Round",        icon: <RoundFaceSvg /> },
                    { value: "oval-gentle",      label: "Oval Gentle",  icon: <OvalFaceSvg /> },
                    { value: "heart-creative",   label: "Heart",        icon: <HeartFaceSvg /> },
                    { value: "square-determined",label: "Square",       icon: <SquareFaceSvg /> },
                    { value: "oval-balanced",    label: "Oval",         icon: <OvalBalancedFaceSvg /> },
                    { value: "round-youthful",   label: "Round Young",  icon: <RoundYouthfulFaceSvg /> },
                  ]}
                />
              </div>

              {/* ── Eyebrow / Nose / Cheek ────────────────────────────────── */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold">🪮 Eyebrow Style</Label>
                  <VisualPicker
                    columns={3}
                    iconSize="sm"
                    value={form.eyebrowStyle}
                    onChange={(v) => updateForm("eyebrowStyle", v)}
                    allowDeselect
                    options={[
                      { value: "thick-arched",   label: "Thick Arch",  icon: <ThickArchedBrowSvg /> },
                      { value: "thin-straight",  label: "Thin Straight",icon: <ThinStraightBrowSvg /> },
                      { value: "bushy-straight", label: "Bushy",       icon: <BushyStraightBrowSvg /> },
                      { value: "soft-rounded",   label: "Soft",        icon: <SoftRoundedBrowSvg /> },
                      { value: "natural-full",   label: "Natural",     icon: <NaturalFullBrowSvg /> },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">👃 Nose Style</Label>
                  <VisualPicker
                    columns={3}
                    iconSize="sm"
                    value={form.noseStyle}
                    onChange={(v) => updateForm("noseStyle", v)}
                    allowDeselect
                    options={[
                      { value: "button",          label: "Button",   icon: <ButtonNoseSvg /> },
                      { value: "broad-flat",      label: "Broad",    icon: <BroadFlatNoseSvg /> },
                      { value: "straight-narrow", label: "Straight", icon: <StraightNarrowNoseSvg /> },
                      { value: "rounded-soft",    label: "Rounded",  icon: <RoundedSoftNoseSvg /> },
                      { value: "wide-nostrils",   label: "Wide",     icon: <WideNostrilsNoseSvg /> },
                    ]}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">😊 Cheek Style</Label>
                  <VisualPicker
                    columns={3}
                    iconSize="sm"
                    value={form.cheekStyle}
                    onChange={(v) => updateForm("cheekStyle", v)}
                    allowDeselect
                    options={[
                      { value: "chubby-rosy",  label: "Chubby",  icon: <ChubbyRosyCheekSvg /> },
                      { value: "flat-smooth",  label: "Flat",    icon: <FlatSmoothCheekSvg /> },
                      { value: "high-defined", label: "High",    icon: <HighDefinedCheekSvg /> },
                      { value: "dimpled",      label: "Dimpled", icon: <DimpledCheekSvg /> },
                      { value: "soft-round",   label: "Soft",    icon: <SoftRoundCheekSvg /> },
                    ]}
                  />
                </div>
              </div>

              {/* ── Hair / Hijab ──────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label className="text-base font-bold">
                  {isOther ? "🪺 Head Texture / Crest" : form.wearHijab ? "🧕 Hijab Style" : "💇 Hair Style"}
                </Label>
                {/* GIRL — HIJAB */}
                {!isOther && form.gender === "girl" && form.wearHijab && (
                  <>
                    <VisualPicker
                      columns={6}
                      iconSize="md"
                      value={form.hijabStyle}
                      onChange={(v) => updateForm("hijabStyle", v)}
                      options={[
                        { value: "simple-white",  label: "White",  icon: <HijabSvg color="white" /> },
                        { value: "simple-black",  label: "Black",  icon: <HijabSvg color="black" /> },
                        { value: "simple-beige",  label: "Beige",  icon: <HijabSvg color="beige" /> },
                        { value: "blue-solid",    label: "Blue",   icon: <HijabSvg color="blue" /> },
                        { value: "pink-solid",    label: "Pink",   icon: <HijabSvg color="pink" /> },
                        { value: "purple-solid",  label: "Purple", icon: <HijabSvg color="purple" /> },
                      ]}
                    />
                    <Input placeholder="Hijab colour or custom description…" value={form.hijabColor}
                      onChange={(e) => updateForm("hijabColor", e.target.value)} className="mt-2" />
                  </>
                )}
                {/* GIRL — HAIR */}
                {!isOther && form.gender === "girl" && !form.wearHijab && (
                  <>
                    <VisualPicker
                      columns={5}
                      iconSize="md"
                      value={form.hairStyle}
                      onChange={(v) => updateForm("hairStyle", v)}
                      options={[
                        { value: "long-black",      label: "Long",         icon: <LongHairGirlSvg /> },
                        { value: "curly-long",      label: "Long Curly",   icon: <CurlyLongHairSvg /> },
                        { value: "braided-long",    label: "Braided",      icon: <BraidedHairSvg /> },
                        { value: "ponytail-high",   label: "Ponytail",     icon: <PonytailHairSvg /> },
                        { value: "bun-top",         label: "Bun",          icon: <BunHairSvg /> },
                        { value: "long-dark-brown", label: "Dark Brown",   icon: <LongHairGirlSvg /> },
                        { value: "long-brown",      label: "Brown",        icon: <LongHairGirlSvg /> },
                      ]}
                    />
                    <Input placeholder="Hair colour (e.g. dark brown)…" value={form.hairColor}
                      onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                  </>
                )}
                {/* BOY — HAIR */}
                {!isOther && form.gender === "boy" && !isElderMale && (
                  <>
                    <VisualPicker
                      columns={5}
                      iconSize="md"
                      value={form.hairStyle}
                      onChange={(v) => updateForm("hairStyle", v)}
                      options={[
                        { value: "short-black",      label: "Short",       icon: <ShortHairBoySvg /> },
                        { value: "short-dark-brown", label: "Short Brown", icon: <ShortHairBoySvg /> },
                        { value: "curly-black",      label: "Curly",       icon: <CurlyHairBoySvg /> },
                        { value: "wavy-dark",        label: "Wavy",        icon: <WavyHairBoySvg /> },
                        { value: "spiky-black",      label: "Spiky",       icon: <SpikyHairBoySvg /> },
                        { value: "afro",             label: "Afro",        icon: <AfroHairSvg /> },
                        { value: "buzz-cut",         label: "Buzz Cut",    icon: <BuzzCutSvg /> },
                      ]}
                    />
                    <Input placeholder="Hair colour (e.g. dark brown)…" value={form.hairColor}
                      onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                  </>
                )}
                {/* ELDER MALE — HAIR */}
                {!isOther && form.gender === "boy" && isElderMale && (
                  <>
                    <VisualPicker
                      columns={4}
                      iconSize="md"
                      value={form.hairStyle}
                      onChange={(v) => updateForm("hairStyle", v)}
                      options={[
                        { value: "bald",                        label: "Bald",          icon: <BaldSvg /> },
                        { value: "bald with white hair sides",  label: "Bald + Sides",  icon: <BaldSvg /> },
                        { value: "short white hair",            label: "White Short",   icon: <WhiteShortHairSvg /> },
                        { value: "short gray hair",             label: "Gray Short",    icon: <GrayShortHairSvg /> },
                        { value: "full white hair short",       label: "White Full",    icon: <WhiteShortHairSvg /> },
                        { value: "full gray hair short",        label: "Gray Full",     icon: <GrayShortHairSvg /> },
                      ]}
                    />
                  </>
                )}
                {/* OTHER / CREATURE */}
                {isOther && (
                  <>
                    <VisualPicker
                      columns={4}
                      iconSize="md"
                      value={form.hairStyle}
                      onChange={(v) => updateForm("hairStyle", v)}
                      options={[
                        { value: "feathered crest on head", label: "Feather Crest", icon: <FeatheredCrestSvg /> },
                        { value: "no hair (feathers)",      label: "Feathers",       icon: <FeatheredCrestSvg /> },
                        { value: "no hair (fur)",           label: "Fur",            icon: <FurBodySvg /> },
                        { value: "mane",                    label: "Mane",           icon: <AfroHairSvg /> },
                        { value: "spikes on head",          label: "Spikes",         icon: <SpikyHairBoySvg /> },
                        { value: "none",                    label: "None / N/A",     icon: <BaldSvg /> },
                      ]}
                    />
                    <Input placeholder="Crest / texture colour (e.g. orange crest)…" value={form.hairColor}
                      onChange={(e) => updateForm("hairColor", e.target.value)} className="mt-2" />
                  </>
                )}
              </div>

              {/* ── Facial Hair & Glasses ─────────────────────────────────── */}
              {!isOther && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">
                      🧔 Facial Hair
                      {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Recommended for elders</span>}
                    </Label>
                    <Select value={form.facialHair} onValueChange={(v) => updateForm("facialHair", v)}>
                      <SelectTrigger><SelectValue placeholder="Select facial hair…" /></SelectTrigger>
                      <SelectContent>
                        {FACIAL_HAIR_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Locks in every illustration</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">
                      👓 Glasses
                      {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Recommended for elders</span>}
                    </Label>
                    <Select value={form.glasses} onValueChange={(v) => updateForm("glasses", v)}>
                      <SelectTrigger><SelectValue placeholder="Select glasses…" /></SelectTrigger>
                      <SelectContent>
                        {GLASSES_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Locks in every illustration</p>
                  </div>
                </div>
              )}

              {/* ── Outfit ─────────────────────────────────────────────────── */}
              <div className="space-y-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">👕 Outfit</p>

                {/* Top Garment */}
                <div className="space-y-2">
                  <Label>Top Garment</Label>
                  {form.gender === "girl" ? (
                    <VisualPicker
                      accent="amber"
                      columns={4}
                      iconSize="lg"
                      allowDeselect
                      value={form.topGarmentType}
                      onChange={(v) => updateForm("topGarmentType", v)}
                      options={[
                        { value: "long-sleeve tunic",      label: "Tunic",        icon: <LongSleeveTunicSvg /> },
                        { value: "abaya",                  label: "Abaya",        icon: <AbayaSvg /> },
                        { value: "modest blouse",          label: "Blouse",       icon: <ModestBlouseSvg /> },
                        { value: "salwar kameez top",      label: "Kameez",       icon: <SalwarKameezTopSvg /> },
                        { value: "long-sleeve dress",      label: "Dress",        icon: <LongSleeveDressSvg /> },
                        { value: "school uniform blouse",  label: "Uniform",      icon: <SchoolUniformBlouseSvg /> },
                        { value: "long cardigan",          label: "Cardigan",     icon: <LongCardiganSvg /> },
                      ]}
                    />
                  ) : (
                    <VisualPicker
                      accent="amber"
                      columns={4}
                      iconSize="lg"
                      allowDeselect
                      value={form.topGarmentType}
                      onChange={(v) => updateForm("topGarmentType", v)}
                      options={[
                        { value: "t-shirt",          label: "T-Shirt",   icon: <TShirtSvg /> },
                        { value: "long-sleeve shirt", label: "Long Sleeve", icon: <LongSleeveShirtSvg /> },
                        { value: "collared shirt",   label: "Collar",    icon: <CollarShirtSvg /> },
                        { value: "hoodie",           label: "Hoodie",    icon: <HoodieSvg /> },
                        { value: "thobe",            label: "Thobe",     icon: <ThobeSvg /> },
                        { value: "kurta",            label: "Kurta",     icon: <KurtaSvg /> },
                        { value: "jacket",           label: "Jacket",    icon: <JacketSvg /> },
                      ]}
                    />
                  )}
                  <Input
                    placeholder="Or type a custom garment type…"
                    value={
                      (form.gender === "girl" ? TOP_GARMENT_PRESETS_GIRL : TOP_GARMENT_PRESETS_BOY).includes(form.topGarmentType)
                        ? ""
                        : form.topGarmentType
                    }
                    onChange={(e) => updateForm("topGarmentType", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Top Color */}
                <div className="space-y-2">
                  <Label>Top Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => {
                      const isSelected = form.topGarmentColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() => updateForm("topGarmentColor", isSelected ? "" : c.name)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                            isSelected ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border"
                          )}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>
                  <Input
                    placeholder="Or type a custom color…"
                    value={OUTFIT_COLORS.some((c) => c.name === form.topGarmentColor) ? "" : form.topGarmentColor}
                    onChange={(e) => updateForm("topGarmentColor", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Top Details */}
                <div className="space-y-2">
                  <Label>Top Details <span className="text-xs text-muted-foreground">(optional)</span></Label>
                  <Input
                    placeholder="e.g. embroidered collar, plain fabric"
                    value={form.topGarmentDetails}
                    onChange={(e) => updateForm("topGarmentDetails", e.target.value)}
                  />
                </div>

                {/* Bottom Garment */}
                <div className="space-y-2">
                  <Label>Bottom Garment</Label>
                  {form.gender === "girl" ? (
                    <VisualPicker
                      accent="amber"
                      columns={4}
                      iconSize="lg"
                      allowDeselect
                      value={form.bottomGarmentType}
                      onChange={(v) => updateForm("bottomGarmentType", v)}
                      options={[
                        { value: "wide-leg trousers", label: "Wide Leg",   icon: <WideLegTrousersSvg /> },
                        { value: "long skirt",        label: "Long Skirt", icon: <LongSkirtSvg /> },
                        { value: "maxi skirt",        label: "Maxi Skirt", icon: <MaxiSkirtSvg /> },
                        { value: "school uniform skirt", label: "Uniform",  icon: <SchoolSkirtSvg /> },
                        { value: "shalwar",           label: "Shalwar",    icon: <ShalwarSvg /> },
                        { value: "palazzo pants",     label: "Palazzo",    icon: <PalazzoPantsSvg /> },
                      ]}
                    />
                  ) : (
                    <VisualPicker
                      accent="amber"
                      columns={4}
                      iconSize="lg"
                      allowDeselect
                      value={form.bottomGarmentType}
                      onChange={(v) => updateForm("bottomGarmentType", v)}
                      options={[
                        { value: "trousers", label: "Trousers", icon: <TrousersSvg /> },
                        { value: "jeans",    label: "Jeans",    icon: <JeansSvg /> },
                        { value: "shorts",   label: "Shorts",   icon: <ShortsSvg /> },
                      ]}
                    />
                  )}
                  <Input
                    placeholder="Or type a custom bottom garment…"
                    value={
                      (form.gender === "girl" ? BOTTOM_GARMENT_PRESETS_GIRL : BOTTOM_GARMENT_PRESETS_BOY).includes(form.bottomGarmentType)
                        ? ""
                        : form.bottomGarmentType
                    }
                    onChange={(e) => updateForm("bottomGarmentType", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Bottom Color */}
                <div className="space-y-2">
                  <Label>Bottom Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => {
                      const isSelected = form.bottomGarmentColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() => updateForm("bottomGarmentColor", isSelected ? "" : c.name)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                            isSelected ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border"
                          )}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>
                  <Input
                    placeholder="Or type a custom color…"
                    value={OUTFIT_COLORS.some((c) => c.name === form.bottomGarmentColor) ? "" : form.bottomGarmentColor}
                    onChange={(e) => updateForm("bottomGarmentColor", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Shoes */}
                <div className="space-y-2">
                  <Label>Shoe Type</Label>
                  <VisualPicker
                    accent="amber"
                    columns={4}
                    iconSize="lg"
                    allowDeselect
                    value={form.shoeType}
                    onChange={(v) => updateForm("shoeType", v)}
                    options={[
                      { value: "sneakers",        label: "Sneakers",     icon: <SneakersSvg /> },
                      { value: "school shoes",    label: "School",       icon: <SchoolShoesSvg /> },
                      { value: "mary jane flats", label: "Mary Jane",    icon: <MaryJaneFlats /> },
                      { value: "sandals",         label: "Sandals",      icon: <SandalsSvg /> },
                      { value: "leather sandals", label: "Leather Sand", icon: <LeatherSandalsSvg /> },
                      { value: "boots",           label: "Boots",        icon: <BootsSvg /> },
                      { value: "slippers",        label: "Slippers",     icon: <SlippersSvg /> },
                      { value: "oxford shoes",    label: "Oxford",       icon: <OxfordShoesSvg /> },
                    ]}
                  />
                  <Input
                    placeholder="Or type a custom shoe type…"
                    value={SHOE_PRESETS.includes(form.shoeType) ? "" : form.shoeType}
                    onChange={(e) => updateForm("shoeType", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Shoe Color */}
                <div className="space-y-2">
                  <Label>Shoe Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {OUTFIT_COLORS.map((c) => {
                      const isSelected = form.shoeColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          title={c.name}
                          onClick={() => updateForm("shoeColor", isSelected ? "" : c.name)}
                          className={cn(
                            "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                            isSelected ? "border-amber-500 scale-110 ring-2 ring-amber-300" : "border-border"
                          )}
                          style={{ backgroundColor: c.hex }}
                        />
                      );
                    })}
                  </div>
                  <Input
                    placeholder="Or type a custom color…"
                    value={OUTFIT_COLORS.some((c) => c.name === form.shoeColor) ? "" : form.shoeColor}
                    onChange={(e) => updateForm("shoeColor", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* ── Body Proportions ───────────────────────────────────────── */}
              <div className="space-y-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  📏 Body Proportions
                  <span className="text-xs font-normal text-blue-500 dark:text-blue-400">(locks size across all illustrations)</span>
                </p>

                {/* Body Build — visual silhouettes */}
                <div className="space-y-2">
                  <Label className="font-bold">🧍 Body Build</Label>
                  <VisualPicker
                    columns={5}
                    iconSize="md"
                    accent="blue"
                    value={form.bodyBuild}
                    onChange={(v) => updateForm("bodyBuild", v)}
                    allowDeselect
                    options={[
                      { value: "slim and lean",             label: "Slim",          icon: <SlimBodySvg /> },
                      { value: "average build",             label: "Average",       icon: <AverageBodySvg /> },
                      { value: "chubby and soft",           label: "Chubby",        icon: <ChubbyBodySvg /> },
                      { value: "athletic and fit",          label: "Athletic",      icon: <AthleticBodySvg /> },
                      { value: "stocky and strong",         label: "Stocky",        icon: <StockyBodySvg /> },
                      { value: "tall and slender",          label: "Tall Slim",     icon: <TallSlenderBodySvg /> },
                      { value: "petite and light",          label: "Petite",        icon: <PetiteBodySvg /> },
                      { value: "broad-shouldered",          label: "Broad",         icon: <BroadShoulderBodySvg /> },
                      { value: "small toddler round tummy", label: "Toddler",       icon: <ToddlerBodySvg /> },
                      { value: "round and full",            label: "Round",         icon: <RoundFullBodySvg /> },
                    ]}
                  />
                  <Input
                    placeholder="Or describe a custom build…"
                    value={BODY_BUILDS.includes(form.bodyBuild) ? "" : form.bodyBuild}
                    onChange={(e) => updateForm("bodyBuild", e.target.value)}
                    className="mt-1"
                  />
                </div>

                {/* Height Feel — visual ruler tiles */}
                <div className="space-y-2">
                  <Label className="font-bold">📐 Height Feel</Label>
                  <VisualPicker
                    columns={8}
                    iconSize="sm"
                    accent="blue"
                    value={form.heightFeel}
                    onChange={(v) => updateForm("heightFeel", v)}
                    allowDeselect
                    options={HEIGHT_FEELS.map((opt, i) => ({
                      value: opt,
                      label: opt,
                      icon: <HeightFeelSvg level={i} />,
                    }))}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <div className="flex items-center gap-2">
                      <Input type="number" min={40} max={220} placeholder="e.g. 115"
                        value={form.heightCm || ""}
                        onChange={(e) => updateForm("heightCm", parseInt(e.target.value, 10) || 0)}
                        className="flex-1" />
                      <span className="text-xs text-muted-foreground shrink-0">cm</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Typical: {suggestedHeightRange(ageNum)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (ft)</Label>
                    <Input type="number" value={form.heightFeet || ""}
                      onChange={(e) => updateForm("heightFeet", parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 4.0" step="0.1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" value={form.weightKg || ""}
                      onChange={(e) => updateForm("weightKg", parseInt(e.target.value) || 0)}
                      placeholder="e.g. 35" />
                  </div>
                </div>
              </div>

              {/* ── Accessories ────────────────────────────────────────────── */}
              <div className="space-y-2">
                <Label>Accessories</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCESSORIES_PRESETS.map((opt) => (
                    <button key={opt} type="button"
                      onClick={() => {
                        const list = form.accessoriesList.includes(opt)
                          ? form.accessoriesList.filter((a) => a !== opt)
                          : [...form.accessoriesList, opt];
                        updateForm("accessoriesList", list);
                      }}
                      className={cn("px-3 py-1.5 rounded-full text-sm border-2 transition-all",
                        form.accessoriesList.includes(opt)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}>{opt}</button>
                  ))}
                </div>
                <Input
                  placeholder="Add more accessories (comma-separated)…"
                  value={form.accessoriesText}
                  onChange={(e) => updateForm("accessoriesText", e.target.value)}
                  className="mt-1"
                />
                {(form.accessoriesList.length > 0 || form.accessoriesText) && (
                  <p className="text-xs text-primary">
                    Selected: {[...form.accessoriesList, ...form.accessoriesText.split(",").map(s=>s.trim()).filter(Boolean)].join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Palette Notes</Label>
                <Input
                  placeholder="e.g. warm soft colors, blue + cream only"
                  value={form.paletteNotes}
                  onChange={(e) => updateForm("paletteNotes", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Outfit Rules <span className="text-xs text-muted-foreground">(extra locking rules for AI)</span></Label>
                <Textarea
                  rows={2}
                  placeholder="e.g. always wears the same uniform, no random color changes"
                  value={form.outfitRules}
                  onChange={(e) => updateForm("outfitRules", e.target.value)}
                />
              </div>

              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                <Label>Modesty Rules</Label>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <Switch checked={form.longSleeves} onCheckedChange={(v) => updateForm("longSleeves", v)} />
                    <span className="text-sm">Long Sleeves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.looseClothing} onCheckedChange={(v) => updateForm("looseClothing", v)} />
                    <span className="text-sm">Loose Clothing</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Input
                    placeholder="e.g. always neat and modest"
                    value={form.modestyNotes}
                    onChange={(e) => updateForm("modestyNotes", e.target.value)}
                  />
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
                                  weightKg: 0,
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
                const posesGenerated = poses.length > 0 && poses.some((p: any) => p.imageUrl);
                return posesGenerated ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {poses.map((pose: any) => (
                        <div key={pose.poseKey} className="space-y-1">
                          <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border">
                            {pose.imageUrl ? (
                              <img src={pose.imageUrl} alt={pose.label} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs">
                                No image
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-center text-muted-foreground capitalize truncate">{pose.label || pose.poseKey}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                      <Check className="w-4 h-4" />
                      {poses.length} poses generated — ready for books!
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
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating all poses...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate All Poses ({POSE_SHEET_COST} cr)
                          </>
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

          <div className="flex justify-between pt-4 border-t border-border">
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
                  onClick={() => setCurrentStep((s) => s + 1)}
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