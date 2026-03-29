import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
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
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const [searchParams] = useSearchParams();
  const { universes } = useUniverses();

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
    name: "",
    role: "Protagonist",
    ageRange: 6 as number | string,
    traits: [] as string[],

    style: "pixar-3d",
    gender: "girl" as "boy" | "girl",
    ageLook: "",

    wearHijab: false,

    skinTone: "",
    eyeColor: "",
    faceShape: "",
    eyebrowStyle: "",
    noseStyle: "",
    cheekStyle: "",

    hairStyle: "",
    hairColor: "",
    hairVisibility: "visible" as "visible" | "partially-visible" | "hidden",

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

    longSleeves: true,
    looseClothing: true,
    modestyNotes: "",
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

  const hairOptions = form.gender === "boy"
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
      const accessories = form.accessoriesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

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
        <Button variant="outline" onClick={() => navigate("/app/characters")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
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
            <div className="space-y-5">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">🎨 Visual DNA</h2>

              <div className="space-y-2">
                <Label>Art Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateForm("style", s.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-sm text-center transition-all",
                        form.style === s.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={form.gender}
                    onValueChange={(v) => updateForm("gender", v)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="girl" id="gender-girl" />
                      <label htmlFor="gender-girl" className="text-sm cursor-pointer">Girl</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="boy" id="gender-boy" />
                      <label htmlFor="gender-boy" className="text-sm cursor-pointer">Boy</label>
                    </div>
                  </RadioGroup>
                </div>

                {form.gender === "girl" && (
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.wearHijab}
                      onCheckedChange={(v) => {
                        updateForm("wearHijab", v);
                        if (!v) {
                          updateForm("hijabStyle", "");
                          updateForm("hijabColor", "");
                        }
                      }}
                    />
                    <Label>Wears Hijab</Label>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Age Look</Label>
                  <Input
                    placeholder="e.g. 12 year old girl"
                    value={form.ageLook}
                    onChange={(e) => updateForm("ageLook", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skin Tone *</Label>
                <Select value={form.skinTone} onValueChange={(v) => updateForm("skinTone", v)}>
                  <SelectTrigger><SelectValue placeholder="Select skin tone..." /></SelectTrigger>
                  <SelectContent>
                    {SKIN_TONES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Eye Color *</Label>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map((ec) => (
                    <button
                      key={ec.value}
                      type="button"
                      onClick={() => updateForm("eyeColor", ec.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm border-2 transition-all",
                        form.eyeColor === ec.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {ec.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Face Shape *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACE_SHAPES.map((fs) => (
                    <button
                      key={fs.value}
                      type="button"
                      onClick={() => updateForm("faceShape", fs.value)}
                      className={cn(
                        "p-2 rounded-lg text-sm border-2 text-center transition-all",
                        form.faceShape === fs.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {fs.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Eyebrow Style</Label>
                  <div className="flex flex-col gap-1.5">
                    {EYEBROW_STYLES.map((e) => (
                      <button key={e.value} type="button"
                        onClick={() => updateForm("eyebrowStyle", e.value)}
                        className={cn("px-3 py-1.5 rounded-lg text-sm border-2 text-left transition-all",
                          form.eyebrowStyle === e.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        )}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nose Style</Label>
                  <div className="flex flex-col gap-1.5">
                    {NOSE_STYLES.map((n) => (
                      <button key={n.value} type="button"
                        onClick={() => updateForm("noseStyle", n.value)}
                        className={cn("px-3 py-1.5 rounded-lg text-sm border-2 text-left transition-all",
                          form.noseStyle === n.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        )}>
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Cheek Style</Label>
                  <div className="flex flex-col gap-1.5">
                    {CHEEK_STYLES.map((c) => (
                      <button key={c.value} type="button"
                        onClick={() => updateForm("cheekStyle", c.value)}
                        className={cn("px-3 py-1.5 rounded-lg text-sm border-2 text-left transition-all",
                          form.cheekStyle === c.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/30"
                        )}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hair / Hijab Style</Label>
                  <Select
                    value={form.wearHijab ? form.hijabStyle : form.hairStyle}
                    onValueChange={(v) => form.wearHijab ? updateForm("hijabStyle", v) : updateForm("hairStyle", v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select style..." /></SelectTrigger>
                    <SelectContent>
                      {hairOptions.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{form.wearHijab ? "Hijab Color" : "Hair Color"}</Label>
                  <Input
                    placeholder={form.wearHijab ? "e.g. soft blue" : "e.g. dark brown"}
                    value={form.wearHijab ? form.hijabColor : form.hairColor}
                    onChange={(e) => form.wearHijab ? updateForm("hijabColor", e.target.value) : updateForm("hairColor", e.target.value)}
                  />
                </div>
              </div>

              {/* Facial Hair & Glasses — critical for elder/adult consistency */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Facial Hair
                    {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Required for elder characters</span>}
                  </Label>
                  <Select value={form.facialHair} onValueChange={(v) => updateForm("facialHair", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facial hair…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FACIAL_HAIR_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Lock this so every illustration shows exactly the same facial hair</p>
                </div>
                <div className="space-y-2">
                  <Label>
                    Glasses
                    {isElderAge && <span className="ml-1.5 text-xs text-amber-600 font-medium">Required for elder characters</span>}
                  </Label>
                  <Select value={form.glasses} onValueChange={(v) => updateForm("glasses", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select glasses…" />
                    </SelectTrigger>
                    <SelectContent>
                      {GLASSES_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Lock this so every illustration shows exact same glasses / no glasses</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top Garment Type</Label>
                  <Input
                    placeholder="e.g. salwar kameez top, abaya, shirt"
                    value={form.topGarmentType}
                    onChange={(e) => updateForm("topGarmentType", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top Garment Color</Label>
                  <Input
                    placeholder="e.g. cream, blue, olive"
                    value={form.topGarmentColor}
                    onChange={(e) => updateForm("topGarmentColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Top Garment Details</Label>
                <Input
                  placeholder="e.g. embroidered cuffs, simple plain fabric"
                  value={form.topGarmentDetails}
                  onChange={(e) => updateForm("topGarmentDetails", e.target.value)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bottom Garment Type</Label>
                  <Input
                    placeholder="e.g. pants, skirt, shalwar"
                    value={form.bottomGarmentType}
                    onChange={(e) => updateForm("bottomGarmentType", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bottom Garment Color</Label>
                  <Input
                    placeholder="e.g. dark blue, beige"
                    value={form.bottomGarmentColor}
                    onChange={(e) => updateForm("bottomGarmentColor", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shoe Type</Label>
                  <Input
                    placeholder="e.g. sandals, joggers, flats"
                    value={form.shoeType}
                    onChange={(e) => updateForm("shoeType", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shoe Color</Label>
                  <Input
                    placeholder="e.g. white, brown"
                    value={form.shoeColor}
                    onChange={(e) => updateForm("shoeColor", e.target.value)}
                  />
                </div>
              </div>

              {/* Height & Weight — used to lock character proportions across all illustrations */}
              <div className="space-y-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  📏 Body Proportions
                  <span className="text-xs font-normal text-blue-500 dark:text-blue-400">(locks character size across all illustrations)</span>
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={40}
                        max={220}
                        placeholder="e.g. 115"
                        value={form.heightCm || ""}
                        onChange={(e) => updateForm("heightCm", parseInt(e.target.value, 10) || 0)}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground shrink-0">cm</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Typical for age {form.ageRange}: {suggestedHeightRange(ageNum)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Height (feet)</Label>
                    <Input
                      type="number"
                      value={form.heightFeet}
                      onChange={(e) => updateForm('heightFeet', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 4.0"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={form.weightKg}
                      onChange={(e) => updateForm('weightKg', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 35"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Build Notes <span className="text-xs text-muted-foreground">(optional extra description)</span></Label>
                  <Input
                    placeholder="e.g. broad shoulders, petite frame"
                    value={form.bodyBuild}
                    onChange={(e) => updateForm("bodyBuild", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Accessories</Label>
                <Input
                  placeholder="e.g. round glasses, small bracelet"
                  value={form.accessoriesText}
                  onChange={(e) => updateForm("accessoriesText", e.target.value)}
                />
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
                <Label>Legacy Outfit Rules</Label>
                <Textarea
                  rows={3}
                  placeholder="e.g. traditional modest dress, no random color changes"
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