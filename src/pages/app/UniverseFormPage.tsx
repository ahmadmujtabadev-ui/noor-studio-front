import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUniverse, useCreateUniverse, useUpdateUniverse } from "@/hooks/useUniverses";
import {
  Loader2,
  ArrowLeft,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Users,
  Info,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UNIVERSE_TEMPLATES } from "@/constants/universeTemplates";

const AGE_RANGES = [
  { value: "1-6", label: "1-6 years", desc: "Board books and picture books" },
  { value: "6-14", label: "6-14 years", desc: "Early readers to middle grade" },
];

const TONES = [
  { value: "funny-adventurous", emoji: "😄", label: "Funny & Adventurous", desc: "Light, fun, action-packed" },
  { value: "calm-educational", emoji: "📚", label: "Calm & Educational", desc: "Gentle lessons and values" },
  { value: "magical-inspiring", emoji: "✨", label: "Magical & Inspiring", desc: "Dreamy, empowering, heartfelt" },
  { value: "brave-heroic", emoji: "🦁", label: "Brave & Heroic", desc: "Bold, courageous themes" },
];

const FLAVOUR_LABELS: Record<string, string> = {
  "islamic-forward": "Islamic",
  universal: "Universal",
};

const TEMPLATE_FLAVOURS = [
  { value: "all", label: "All Templates" },
  { value: "islamic-forward", label: "Islamic" },
  { value: "universal", label: "Universal" },
];

export default function UniverseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { universe, loading: loadingUniverse } = useUniverse(id);
  const createMutation = useCreateUniverse();
  const updateMutation = useUpdateUniverse(id!);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ageRange: "1-6",
    tone: "calm-educational",
    artStyle: "flat-illustration",
    seriesBible: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateFlavour, setTemplateFlavour] = useState<"all" | "islamic-forward" | "universal">("all");
  const [templateAge, setTemplateAge] = useState<"all" | "1-6" | "6-14">("all");

  useEffect(() => {
    if (universe) {
      setFormData({
        name: universe.name,
        description: universe.description || "",
        ageRange: universe.ageRange || "1-6",
        tone: universe.tone || "calm-educational",
        artStyle: universe.artStyle || "flat-illustration",
        seriesBible: universe.seriesBible || "",
        tags: universe.tags || [],
      });
    }
  }, [universe]);

  const saving = createMutation.isPending || updateMutation.isPending;
  const filteredTemplates = UNIVERSE_TEMPLATES.filter((tpl) => {
    const matchesFlavour = templateFlavour === "all" || tpl.flavour === templateFlavour;
    const matchesAge = templateAge === "all" || tpl.ageRange === templateAge;
    return matchesFlavour && matchesAge;
  });

  function applyTemplate(templateId: string) {
    const tpl = UNIVERSE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    setSelectedTemplate(templateId);
    setFormData({
      name: tpl.name,
      description: tpl.description,
      ageRange: tpl.ageRange,
      tone: tpl.tone,
      artStyle: tpl.artStyle,
      seriesBible: "",
      tags: tpl.tags,
    });
    toast.success(`Template applied: ${tpl.name}`);
  }

  function clearTemplate() {
    setSelectedTemplate(null);
    setFormData({
      name: "",
      description: "",
      ageRange: "1-6",
      tone: "calm-educational",
      artStyle: "flat-illustration",
      seriesBible: "",
      tags: [],
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Universe name is required");
      return;
    }

    try {
      if (isEditing && id) {
        await updateMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          ageRange: formData.ageRange,
          tone: formData.tone,
          artStyle: formData.artStyle,
          seriesBible: formData.seriesBible || undefined,
          tags: formData.tags,
        });
        toast.success("Universe updated!");
        navigate(`/app/universes/${id}`);
      } else {
        const created = await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          ageRange: formData.ageRange,
          tone: formData.tone,
          artStyle: formData.artStyle,
          seriesBible: formData.seriesBible || undefined,
          tags: formData.tags,
        });
        toast.success("Universe created! Now add your characters.");
        navigate(`/app/characters/new?universeId=${created.id || created._id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save universe");
    }
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
    setTagInput("");
  };

  if (loadingUniverse) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isEditing ? "Edit Universe" : "Create Universe"}
      subtitle={isEditing ? "Update your universe settings" : "Set up your story world in a few quick steps."}
      actions={
        <Button variant="outline" onClick={() => navigate(isEditing ? `/app/universes/${id}` : "/app/universes")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      }
    >
      <div className="w-full pb-12">
        {!isEditing && (
          <div className="mb-8 flex items-start gap-4 rounded-[28px] border border-emerald-200 bg-gradient-to-r from-emerald-50 via-lime-50 to-green-50 p-5 shadow-sm">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
              <Info className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <p className="mb-1 text-sm font-semibold text-foreground">What is a Universe?</p>
              <p className="text-sm text-muted-foreground">
                A Universe is your <strong>series world</strong> - the shared setting, characters, tone, and values that
                run through every book you create here. Build it once, and every book inherits that foundation.
              </p>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="mb-10">
            <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="mr-1 inline h-3 w-3" />
                  Start with a Template
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Pick one to pre-fill your universe, or start from scratch below.
                </p>
              </div>
              <div className="flex flex-col gap-3 xl:items-end">
                <div className="flex flex-wrap gap-2">
                  {TEMPLATE_FLAVOURS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setTemplateFlavour(filter.value as "all" | "islamic-forward" | "universal")}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        templateFlavour === filter.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTemplateAge("all")}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      templateAge === "all"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    All Ages
                  </button>
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age.value}
                      type="button"
                      onClick={() => setTemplateAge(age.value as "1-6" | "6-14")}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        templateAge === age.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      )}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>

                {selectedTemplate && (
                  <button
                    type="button"
                    onClick={clearTemplate}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                    Start from scratch
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-4">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-[26px] border bg-card text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg",
                    selectedTemplate === tpl.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/40"
                  )}
                >
                  <div className="relative h-[360px] w-full overflow-hidden rounded-t-[26px] bg-slate-100">
                    <img
                      src={tpl.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl opacity-35"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/35 via-emerald-50/20 to-amber-50/35" />
                    <img
                      src={tpl.image}
                      alt={tpl.name}
                      className="relative z-10 h-full w-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-slate-950/18 to-transparent" />
                    <span
                      className={cn(
                        "absolute left-3 top-3 z-30 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur",
                        tpl.flavour === "islamic-forward"
                          ? "bg-amber-100/95 text-amber-800"
                          : "bg-white/90 text-slate-700"
                      )}
                    >
                      {FLAVOUR_LABELS[tpl.flavour]}
                    </span>
                    {selectedTemplate === tpl.id && (
                      <span className="absolute right-3 top-3 z-30 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 p-4">
                    <p className={cn("text-sm font-semibold leading-snug", selectedTemplate === tpl.id ? "text-primary" : "text-foreground")}>
                      {tpl.name}
                    </p>
                    <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{tpl.description}</p>
                    <div className="flex items-center justify-between pt-1 text-[11px] font-medium text-muted-foreground">
                      <span>Ages {tpl.ageRange}</span>
                      <span className="capitalize">{tpl.tags[0]}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="rounded-[24px] border border-dashed bg-muted/20 px-6 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No templates match these filters.</p>
                <p className="mt-1 text-xs text-muted-foreground">Try switching age or category to see more universe ideas.</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
            <div className="space-y-6 rounded-[28px] border bg-card p-6 shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Basic Info</p>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Universe Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Adventures of Noor, The Zubair Chronicles"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  placeholder="A few sentences about your universe - who lives there, what it feels like..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={7}
                />
              </div>
            </div>

            <div className="space-y-6 rounded-[28px] border bg-card p-6 shadow-sm">
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">Target Audience</p>

              <div className="space-y-2">
                <Label>Age Range</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {AGE_RANGES.map((ar) => (
                    <button
                      key={ar.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, ageRange: ar.value })}
                      className={cn(
                        "flex flex-col items-start rounded-2xl border-2 px-4 py-4 text-left transition-all",
                        formData.ageRange === ar.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span className={cn("text-sm font-bold", formData.ageRange === ar.value ? "text-primary" : "text-foreground")}>
                        {ar.label}
                      </span>
                      <span className="mt-1 text-[11px] text-muted-foreground">{ar.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Story Tone</Label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, tone: t.value })}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all",
                        formData.tone === t.value
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      <span className="mt-0.5 text-2xl leading-none">{t.emoji}</span>
                      <div>
                        <p className={cn("text-sm font-bold", formData.tone === t.value ? "text-primary" : "text-foreground")}>
                          {t.label}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted/40"
            >
              <span>Advanced Settings (Tags & Series Bible)</span>
              {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {advancedOpen && (
              <div className="space-y-5 border-t bg-muted/10 px-5 pb-5">
                <div className="space-y-3 pt-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, tags: formData.tags.filter((existingTag) => existingTag !== tag) })
                            }
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Series Bible</Label>
                  <p className="text-xs text-muted-foreground">
                    Describe the world, recurring themes, and rules - injected into every AI generation.
                  </p>
                  <Textarea
                    placeholder="e.g. This universe is set in a lush magical forest where all creatures follow Islamic principles. The tone is always warm, hopeful, and educational..."
                    value={formData.seriesBible}
                    onChange={(e) => setFormData({ ...formData, seriesBible: e.target.value })}
                    rows={6}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(isEditing ? `/app/universes/${id}` : "/app/universes")}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Universe"
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Create & Add Characters
                </>
              )}
            </Button>
          </div>

          {!isEditing && <p className="text-center text-xs text-muted-foreground">After creating your universe, you'll be taken straight to character creation.</p>}
        </form>
      </div>
    </AppLayout>
  );
}
