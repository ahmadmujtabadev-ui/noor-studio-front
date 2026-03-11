import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Palette, Sparkles, Check, RefreshCw, Image, ThumbsUp, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCreateCharacter, useGeneratePortrait, useApproveCharacter, useGeneratePoseSheet } from "@/hooks/useCharacters";
import { useCredits, useAuthStore } from "@/hooks/useAuth";
import type { Character } from "@/lib/api/types";
import { useSearchParams } from "react-router-dom";

// ─── Visual DNA options ───────────────────────────────────────────────────────

const SKIN_TONES = [
  { value: "porcelain", label: "Porcelain" }, { value: "fair", label: "Fair" },
  { value: "light-beige", label: "Light Beige" }, { value: "beige", label: "Beige" },
  { value: "olive", label: "Olive" }, { value: "warm-olive", label: "Warm Olive" },
  { value: "golden", label: "Golden" }, { value: "tan", label: "Tan" },
  { value: "caramel", label: "Caramel" }, { value: "medium-brown", label: "Medium Brown" },
  { value: "brown", label: "Brown" }, { value: "dark-brown", label: "Dark Brown" },
  { value: "ebony", label: "Ebony" },
];

const EYE_COLORS = [
  { value: "dark-brown", label: "Dark Brown" }, { value: "brown", label: "Brown" },
  { value: "hazel", label: "Hazel" }, { value: "green", label: "Green" },
  { value: "blue", label: "Blue" }, { value: "gray", label: "Gray" }, { value: "black", label: "Black" },
];

const FACE_SHAPES = [
  { value: "round-friendly", label: "Round & Friendly" }, { value: "oval-gentle", label: "Oval & Gentle" },
  { value: "heart-creative", label: "Heart-shaped" }, { value: "square-determined", label: "Square & Determined" },
  { value: "oval-balanced", label: "Oval & Balanced" }, { value: "round-youthful", label: "Round & Youthful" },
];

const HAIR_STYLES_BOY = [
  { value: "short-black", label: "Short Black" }, { value: "short-dark-brown", label: "Short Dark Brown" },
  { value: "curly-black", label: "Curly Black" }, { value: "wavy-dark", label: "Wavy Dark" },
  { value: "spiky-black", label: "Spiky Black" }, { value: "afro", label: "Afro" },
  { value: "buzz-cut", label: "Buzz Cut" }, { value: "dreadlocks", label: "Dreadlocks" },
];

const HAIR_STYLES_GIRL = [
  { value: "long-black", label: "Long Black" }, { value: "long-dark-brown", label: "Long Dark Brown" },
  { value: "long-brown", label: "Long Brown" }, { value: "curly-long", label: "Long Curly" },
  { value: "braided-long", label: "Long Braided" }, { value: "ponytail-high", label: "High Ponytail" },
  { value: "bun-top", label: "Top Bun" }, { value: "afro-puffs", label: "Afro Puffs" },
];

const HIJAB_STYLES = [
  { value: "simple-white", label: "Simple White Hijab" }, { value: "simple-black", label: "Simple Black Hijab" },
  { value: "simple-beige", label: "Simple Beige Hijab" }, { value: "blue-solid", label: "Blue Hijab" },
  { value: "pink-solid", label: "Pink Hijab" }, { value: "purple-solid", label: "Purple Hijab" },
];

const TRAIT_OPTIONS = [
  "curious", "brave", "kind", "helpful", "gentle", "patient",
  "wise", "creative", "loyal", "confident", "thoughtful", "playful",
  "adventurous", "caring", "cheerful", "determined",
];

const AGE_RANGES = ["2-4", "4-7", "5-8", "6-9", "8-12"];
const ROLES = ["Protagonist", "Supporting", "Mentor", "Antagonist", "Background"];
const STYLES = [
  { id: "pixar-3d", label: "Pixar 3D" }, { id: "watercolor", label: "Watercolor" },
  { id: "flat-illustration", label: "Flat Illustration" }, { id: "manga", label: "Manga" },
];

const GENERATION_COST = 2;
const POSE_SHEET_COST = 3;

const steps = [
  { id: 0, title: "Persona", icon: User, description: "Name, role & traits" },
  { id: 1, title: "Visual DNA", icon: Palette, description: "Appearance & style" },
  { id: 2, title: "Generate", icon: Sparkles, description: "Create & approve" },
  { id: 3, title: "Pose Sheet", icon: Image, description: "12-pose grid" },
];

export default function CharacterCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits = useCredits();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  // Add this import at the top
  // Add inside the component, near the other hooks
  const [searchParams] = useSearchParams();
  const universeId = searchParams.get("universeId") || undefined;


  const createCharacter = useCreateCharacter();

  const [currentStep, setCurrentStep] = useState(0);
  const [createdCharacter, setCreatedCharacter] = useState<Character | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);

  // Lazy hooks — need character id
  const generatePortrait = useGeneratePortrait(createdCharacter?.id || createdCharacter?._id );
  const approveCharacter = useApproveCharacter(createdCharacter?.id || createdCharacter?._id);
  const generatePoseSheet = useGeneratePoseSheet(createdCharacter?.id || createdCharacter?._id);

  const [form, setForm] = useState({
    name: "", role: "Protagonist", ageRange: "4-7", traits: [] as string[], speakingStyle: "",
    style: "pixar-3d", gender: "girl" as "boy" | "girl",
    wearHijab: false,
    skinTone: "", eyeColor: "", faceShape: "", hairOrHijab: "", outfitRules: "",
    accessories: "", paletteNotes: "",
    hijabAlways: false, longSleeves: true, looseClothing: true, modestyNotes: "",
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
      case 0: return !!form.name.trim() && !!form.role && !!form.ageRange;
      case 1: return !!form.skinTone && !!form.eyeColor && !!form.faceShape && !!form.hairOrHijab;
      case 2: return createdCharacter?.status === "approved" || createdCharacter?.status === "locked";
      default: return true;
    }
  };

  const handleCreateAndGenerate = async () => {
    if (!form.name.trim()) {
      toast({ title: "Name required", variant: "destructive" }); return;
    }
    if (credits < GENERATION_COST) {
      toast({ title: "Insufficient credits", description: `You need ${GENERATION_COST} credits.`, variant: "destructive" }); return;
    }

    setIsGenerating(true);
    try {
      // Step 1: Create character record
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
          skinTone: form.skinTone,
          eyeColor: form.eyeColor,
          faceShape: form.faceShape,
          hairOrHijab: form.hairOrHijab,
          outfitRules: form.outfitRules,
          accessories: form.accessories,
          paletteNotes: form.paletteNotes,
        },
        modestyRules: {
          hijabAlways: form.hijabAlways,
          longSleeves: form.longSleeves,
          looseClothing: form.looseClothing,
          notes: form.modestyNotes,
        },
      });
      setCreatedCharacter(char);

      // Step 2: Generate portrait immediately
      const updated = await generatePortrait.mutateAsync({ style: form.style });
      setCreatedCharacter(updated);
      console.log("api sucessfull",createCharacter)
      // refreshUser();

      toast({ title: "Character generated!", description: `${char.name} is ready for review.` });
    } catch (err) {
      toast({ title: "Generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!createdCharacter) return;
    if (credits < 1) {
      toast({ title: "Insufficient credits", variant: "destructive" }); return;
    }
    setIsGenerating(true);
    try {
      const updated = await generatePortrait.mutateAsync({ style: form.style });
      setCreatedCharacter(updated);
      // refreshUser();
      toast({ title: "Regenerated!", description: "New portrait created." });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    if (!createdCharacter) return;
    try {
      const updated = await approveCharacter.mutateAsync(createdCharacter.imageUrl);
      setCreatedCharacter(updated);
      toast({ title: "Approved!", description: `${createdCharacter.name} is ready for your books.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleGeneratePoseSheet = async () => {
    if (!createdCharacter) return;
    if (credits < POSE_SHEET_COST) {
      toast({ title: "Insufficient credits", description: `You need ${POSE_SHEET_COST} credits.`, variant: "destructive" }); return;
    }
    setIsGeneratingPose(true);
    try {
      const updated = await generatePoseSheet.mutateAsync();
      setCreatedCharacter(updated);
      // refreshUser();
      toast({ title: "Pose sheet ready!", description: "12 poses generated." });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setIsGeneratingPose(false);
    }
  };

  const hairOptions = form.gender === "boy" ? HAIR_STYLES_BOY : (form.wearHijab ? HIJAB_STYLES : HAIR_STYLES_GIRL);

  return (
    <AppLayout
      title="Create Character"
      subtitle="Build a character with consistent visual DNA"
      actions={
        <Button variant="outline" onClick={() => navigate("/app/characters")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Cancel
        </Button>
      }
    >
      <div className="max-w-3xl mx-auto">
        {/* Step Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  currentStep > step.id ? "bg-primary text-primary-foreground" :
                    currentStep === step.id ? "bg-primary/20 text-primary ring-2 ring-primary" :
                      "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("h-0.5 w-16 sm:w-28 mx-1", currentStep > step.id ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
            {steps.map((step) => (
              <span key={step.id} className={cn(currentStep === step.id && "text-primary font-medium")}>{step.title}</span>
            ))}
          </div>
          <Progress value={progressPct} className="h-1.5 mt-3" />
        </div>

        <div className="card-glow p-8 space-y-6">
          {/* ── Step 0: Persona ── */}
          {currentStep === 0 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Persona</h2>
              <div className="space-y-2">
                <Label>Character Name *</Label>
                <Input placeholder="e.g., Amira, Omar, Zainab" value={form.name} onChange={(e) => updateForm("name", e.target.value)} />
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
                  <p className="text-xs text-primary">{form.traits.length}/5 selected: {form.traits.join(", ")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Speaking Style</Label>
                <Input placeholder="e.g., Gentle and thoughtful, often asks questions" value={form.speakingStyle} onChange={(e) => updateForm("speakingStyle", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Step 1: Visual DNA ── */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold">Visual DNA</h2>

              {/* Art Style */}
              <div className="space-y-2">
                <Label>Art Style</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {STYLES.map((s) => (
                    <button key={s.id} type="button" onClick={() => updateForm("style", s.id)}
                      className={cn("p-3 rounded-xl border-2 text-sm text-center transition-all",
                        form.style === s.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                      )}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender + Hijab */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup value={form.gender} onValueChange={(v) => updateForm("gender", v)} className="flex gap-4">
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
                    <Switch checked={form.wearHijab} onCheckedChange={(v) => { updateForm("wearHijab", v); updateForm("hijabAlways", v); updateForm("hairOrHijab", ""); }} />
                    <Label>Wears Hijab</Label>
                  </div>
                )}
              </div>

              {/* Skin Tone */}
              <div className="space-y-2">
                <Label>Skin Tone *</Label>
                <Select value={form.skinTone} onValueChange={(v) => updateForm("skinTone", v)}>
                  <SelectTrigger><SelectValue placeholder="Select skin tone..." /></SelectTrigger>
                  <SelectContent>
                    {SKIN_TONES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Eye Color */}
              <div className="space-y-2">
                <Label>Eye Color *</Label>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map((ec) => (
                    <button key={ec.value} type="button" onClick={() => updateForm("eyeColor", ec.value)}
                      className={cn("px-3 py-1.5 rounded-lg text-sm border-2 transition-all",
                        form.eyeColor === ec.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                      )}>
                      {ec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Face Shape */}
              <div className="space-y-2">
                <Label>Face Shape *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FACE_SHAPES.map((fs) => (
                    <button key={fs.value} type="button" onClick={() => updateForm("faceShape", fs.value)}
                      className={cn("p-2 rounded-lg text-sm border-2 text-center transition-all",
                        form.faceShape === fs.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                      )}>
                      {fs.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair / Hijab */}
              <div className="space-y-2">
                <Label>{form.gender === "girl" && form.wearHijab ? "Hijab Style *" : "Hair Style *"}</Label>
                <Select value={form.hairOrHijab} onValueChange={(v) => updateForm("hairOrHijab", v)}>
                  <SelectTrigger><SelectValue placeholder="Select style..." /></SelectTrigger>
                  <SelectContent>
                    {hairOptions.map((h) => <SelectItem key={h.value} value={h.value}>{h.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Outfit */}
              <div className="space-y-2">
                <Label>Outfit Rules</Label>
                <Input placeholder="e.g., Traditional Islamic dress, pastel colors, embroidered details" value={form.outfitRules} onChange={(e) => updateForm("outfitRules", e.target.value)} />
              </div>

              {/* Modesty */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border">
                <Label>Modesty Rules</Label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { key: "longSleeves", label: "Long Sleeves" },
                    { key: "looseClothing", label: "Loose Clothing" },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <Switch checked={form[key as keyof typeof form] as boolean} onCheckedChange={(v) => updateForm(key, v)} />
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Generate & Approve ── */}
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
                    variant="hero" size="lg"
                    onClick={handleCreateAndGenerate}
                    disabled={isGenerating || credits < GENERATION_COST}
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-5 h-5 mr-2" />Generate Character ({GENERATION_COST} cr)</>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-6">
                    {/* Preview */}
                    <div className="w-48 shrink-0">
                      <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-subtle">
                        {createdCharacter.imageUrl ? (
                          <img src={createdCharacter.imageUrl} alt={createdCharacter.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        {createdCharacter.status !== "approved" && createdCharacter.imageUrl && (
                          <Button variant="hero" size="sm" className="flex-1" onClick={handleApprove} disabled={approveCharacter.isPending}>
                            <ThumbsUp className="w-3 h-3 mr-1" />Approve
                          </Button>
                        )}
                        <Button
                          variant="outline" size="sm"
                          onClick={handleRegenerate}
                          disabled={isGenerating || credits < 1}
                          className={createdCharacter.status !== "approved" && createdCharacter.imageUrl ? "" : "flex-1"}
                        >
                          <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
                          {createdCharacter.status !== "approved" && createdCharacter.imageUrl ? "" : " Regen"}
                        </Button>
                      </div>
                    </div>

                    {/* Character summary */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-lg font-bold">{createdCharacter.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{createdCharacter.role} · {createdCharacter.ageRange}</p>
                      </div>
                      {createdCharacter.traits?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {createdCharacter.traits.map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs capitalize">{t}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="text-sm space-y-1 text-muted-foreground">
                        {createdCharacter.visualDNA?.skinTone && <p>Skin: {createdCharacter.visualDNA.skinTone}</p>}
                        {createdCharacter.visualDNA?.eyeColor && <p>Eyes: {createdCharacter.visualDNA.eyeColor}</p>}
                        {createdCharacter.visualDNA?.hairOrHijab && <p>Hair/Hijab: {createdCharacter.visualDNA.hairOrHijab}</p>}
                      </div>
                      {createdCharacter.status === "approved" && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <Check className="w-4 h-4" />Character approved — ready for books!
                        </div>
                      )}
                      {!createdCharacter.imageUrl && isGenerating && (
                        <p className="text-sm text-muted-foreground animate-pulse">Generating portrait...</p>
                      )}
                    </div>
                  </div>

                  {credits < 1 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Low credits — you may not be able to regenerate.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 3: Pose Sheet ── */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Pose Sheet</h2>
              <p className="text-muted-foreground text-sm">
                Generate a 12-pose reference grid for consistent illustrations across your books.
                Costs {POSE_SHEET_COST} credits.
              </p>

              {!createdCharacter?.poseSheetGenerated ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-full aspect-[4/3] max-w-sm mx-auto rounded-2xl bg-gradient-subtle grid grid-cols-4 gap-2 p-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 aspect-square flex items-center justify-center text-xs text-muted-foreground/50 font-medium">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="hero" onClick={handleGeneratePoseSheet} disabled={isGeneratingPose || credits < POSE_SHEET_COST}>
                      {isGeneratingPose ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating 12 poses...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" />Generate Pose Sheet ({POSE_SHEET_COST} cr)</>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/app/characters/${createdCharacter?.id}`)}>
                      Skip for now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {createdCharacter.poseSheetUrl && (
                    <img
                      src={createdCharacter.poseSheetUrl}
                      alt="Pose Sheet"
                      className="w-full rounded-2xl border border-border"
                    />
                  )}
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <Check className="w-4 h-4" />Pose sheet generated!
                  </div>
                  <Button variant="hero" onClick={() => navigate(`/app/characters/${createdCharacter?.id}`)}>
                    View Character Profile
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
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
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )
            ) : (
              <Button
                variant="hero"
                onClick={() => navigate(`/app/characters/${createdCharacter?.id}`)}
                disabled={!createdCharacter}
              >
                <Check className="w-4 h-4 mr-2" />View Character
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
