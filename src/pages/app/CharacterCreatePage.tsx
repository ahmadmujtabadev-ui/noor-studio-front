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
import { useCredits, useAuthStore } from "@/hooks/useAuth";
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

const AGE_RANGES = ["2-4", "4-7", "5-8", "6-9", "8-12", "12"];

const WEIGHT_CATEGORIES = [
  { value: "slim",    label: "Slim / Lean" },
  { value: "average", label: "Average / Medium" },
  { value: "stocky",  label: "Stocky / Sturdy" },
  { value: "heavy",   label: "Heavy / Chubby" },
];

// Typical height ranges by age (cm) for helper text
function suggestedHeightRange(ageRange: string): string {
  if (ageRange === "2-4")  return "85–105 cm";
  if (ageRange === "4-7")  return "100–125 cm";
  if (ageRange === "5-8")  return "105–132 cm";
  if (ageRange === "6-9")  return "112–138 cm";
  if (ageRange === "8-12") return "128–160 cm";
  return "150–180 cm";
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
  const universeId = searchParams.get("universeId") || undefined;

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
    name: "",
    role: "Protagonist",
    ageRange: "4-7",
    traits: [] as string[],
    speakingStyle: "",

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
    weightCategory: "",

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
        return !!form.name.trim() && !!form.role && !!form.ageRange;
      case 1:
        return !!form.skinTone && !!form.eyeColor && !!form.faceShape;
      case 2:
        return createdCharacter?.status === "approved";
      default:
        return true;
    }
  };

  const hairOptions = form.gender === "boy"
    ? HAIR_STYLES_BOY
    : form.wearHijab
      ? HIJAB_STYLES
      : HAIR_STYLES_GIRL;

  const handleCreateAndGenerate = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    if (!universeId) {
      toast({ title: "Universe is required", description: "Open this page from a universe flow.", variant: "destructive" });
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
        ageRange: form.ageRange,
        traits: form.traits,
        speakingStyle: form.speakingStyle || undefined,
        universeId,
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
          weightCategory: form.weightCategory || undefined,

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

      const portraitRes = await generatePortrait.mutateAsync({ style: form.style });
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
                  <Label>Age Range *</Label>
                  <Select value={form.ageRange} onValueChange={(v) => updateForm("ageRange", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
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

              <div className="space-y-2">
                <Label>Speaking Style</Label>
                <Input
                  placeholder="e.g., gentle, thoughtful, asks careful questions"
                  value={form.speakingStyle}
                  onChange={(e) => updateForm("speakingStyle", e.target.value)}
                />
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
                      Typical for age {form.ageRange}: {suggestedHeightRange(form.ageRange)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Body Type</Label>
                    <Select value={form.weightCategory} onValueChange={(v) => updateForm("weightCategory", v)}>
                      <SelectTrigger><SelectValue placeholder="Select body type…" /></SelectTrigger>
                      <SelectContent>
                        {WEIGHT_CATEGORIES.map((w) => (
                          <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <Check className="w-4 h-4" />
                          Character approved — ready for books
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
              <h2 className="text-xl font-bold">Pose Sheet</h2>
              <p className="text-muted-foreground text-sm">
                Generate a pose sheet and structured pose prompts for consistent illustrations.
                Costs {POSE_SHEET_COST} credits.
              </p>

              {!createdCharacter?.poseSheetUrl ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-full aspect-[4/3] max-w-sm mx-auto rounded-2xl bg-gradient-subtle grid grid-cols-4 gap-2 p-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted/50 aspect-square flex items-center justify-center text-xs text-muted-foreground/50 font-medium"
                      >
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
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Pose Sheet ({POSE_SHEET_COST} cr)
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate(`/app/characters/${createdCharacter?.id || createdCharacter?._id}`)}
                    >
                      Skip for now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <img
                    src={createdCharacter.poseSheetUrl}
                    alt="Pose Sheet"
                    className="w-full rounded-2xl border border-border"
                  />

                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />
                    Pose sheet generated
                  </div>

                  <Button
                    variant="hero"
                    onClick={() => navigate(`/app/characters/${createdCharacter?.id || createdCharacter?._id}`)}
                  >
                    View Character Profile
                  </Button>
                </div>
              )}
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