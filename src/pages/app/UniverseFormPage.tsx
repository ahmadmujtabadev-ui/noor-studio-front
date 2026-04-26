import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUniverse, useCreateUniverse, useUpdateUniverse } from "@/hooks/useUniverses";
import { Loader2, ArrowLeft, X, Plus, ChevronDown, ChevronUp, Users, Globe, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UNIVERSE_TEMPLATES } from "@/constants/universeTemplates";

// T-01: Renamed "Pixar 3D" → "3D Rendered" (copyright risk)
const ART_STYLES = [
  { id: "pixar-3d",           label: "3D Rendered",        emoji: "🎬" },
  { id: "watercolor",         label: "Watercolor",         emoji: "🎨" },
  { id: "flat-illustration",  label: "Flat Illustration",  emoji: "📐" },
  { id: "storybook",          label: "Storybook",          emoji: "📖" },
  { id: "manga",              label: "Manga",              emoji: "⭐" },
  { id: "pencil-sketch",      label: "Pencil Sketch",      emoji: "✏️" },
];

const AGE_RANGES = [
  { value: "2-4",  label: "2–4 years",   desc: "Toddler board book" },
  { value: "4-7",  label: "4–7 years",   desc: "Picture book" },
  { value: "6-9",  label: "6–9 years",   desc: "Early reader" },
  { value: "8-12", label: "8–12 years",  desc: "Chapter book / middle grade" },
];

const TONES = [
  { value: "funny-adventurous", emoji: "😄", label: "Funny & Adventurous",  desc: "Light, fun, action-packed" },
  { value: "calm-educational",  emoji: "📚", label: "Calm & Educational",   desc: "Gentle lessons & values" },
  { value: "magical-inspiring", emoji: "✨", label: "Magical & Inspiring",   desc: "Dreamy, empowering, heartfelt" },
  { value: "brave-heroic",      emoji: "🦁", label: "Brave & Heroic",        desc: "Bold, courageous themes" },
];

const FLAVOUR_LABELS: Record<string, string> = {
  "islamic-forward": "Islamic",
  "universal": "Universal",
};

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
    ageRange: "4-7",
    tone: "calm-educational",
    artStyle: "flat-illustration",
    seriesBible: "",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (universe) {
      setFormData({
        name:        universe.name,
        description: universe.description || "",
        ageRange:    universe.ageRange    || "4-7",
        tone:        universe.tone        || "calm-educational",
        artStyle:    universe.artStyle    || "flat-illustration",
        seriesBible: universe.seriesBible || "",
        tags:        universe.tags        || [],
      });
    }
  }, [universe]);

  const saving = createMutation.isPending || updateMutation.isPending;

  function applyTemplate(templateId: string) {
    const tpl = UNIVERSE_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setSelectedTemplate(templateId);
    setFormData({
      name:        tpl.name,
      description: tpl.description,
      ageRange:    tpl.ageRange,
      tone:        tpl.tone,
      artStyle:    tpl.artStyle,
      seriesBible: "",
      tags:        tpl.tags,
    });
    toast.success(`Template applied: ${tpl.name}`);
  }

  function clearTemplate() {
    setSelectedTemplate(null);
    setFormData({ name: "", description: "", ageRange: "4-7", tone: "calm-educational", artStyle: "flat-illustration", seriesBible: "", tags: [] });
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
          name:        formData.name,
          description: formData.description || undefined,
          ageRange:    formData.ageRange,
          tone:        formData.tone,
          artStyle:    formData.artStyle,
          seriesBible: formData.seriesBible || undefined,
          tags:        formData.tags,
        });
        toast.success("Universe updated!");
        navigate(`/app/universes/${id}`);
      } else {
        const created = await createMutation.mutateAsync({
          name:        formData.name,
          description: formData.description || undefined,
          ageRange:    formData.ageRange,
          tone:        formData.tone,
          artStyle:    formData.artStyle,
          seriesBible: formData.seriesBible || undefined,
          tags:        formData.tags,
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
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={isEditing ? "✏️ Edit Universe" : "🌍 Create Universe"}
      subtitle={isEditing ? "Update your universe settings" : "Set up your story world — takes 2 minutes!"}
      actions={
        <Button variant="outline" onClick={() => navigate(isEditing ? `/app/universes/${id}` : "/app/universes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
      }
    >
      <div className="max-w-2xl pb-12">

        {/* T-12: Universe concept explainer */}
        {!isEditing && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-0.5">What is a Universe?</p>
              <p className="text-sm text-muted-foreground">
                A Universe is your <strong>series world</strong> — the shared setting, characters, tone, and values that run through every book you create here.
                Build it once, and every book you make inherits its look and feel automatically.
              </p>
            </div>
          </div>
        )}

        {/* T-14: Template gallery */}
        {!isEditing && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                  <Sparkles className="w-3 h-3 inline mr-1" />Start with a Template
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Pick one to pre-fill your universe, or start from scratch below.</p>
              </div>
              {selectedTemplate && (
                <button
                  type="button"
                  onClick={clearTemplate}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />Start from scratch
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {UNIVERSE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl.id)}
                  className={cn(
                    "flex flex-col items-start gap-1.5 p-3 rounded-2xl border-2 text-left transition-all",
                    selectedTemplate === tpl.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <span className="text-2xl leading-none">{tpl.emoji}</span>
                  <p className={cn(
                    "text-xs font-semibold leading-tight",
                    selectedTemplate === tpl.id ? "text-primary" : "text-foreground"
                  )}>
                    {tpl.name}
                  </p>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    tpl.flavour === "islamic-forward"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {FLAVOUR_LABELS[tpl.flavour]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">

          {/* ── Section 1: Basic Info ── */}
          <div className="space-y-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">🌍 Basic Info</p>

            <div className="space-y-2">
              <Label htmlFor="name">Universe Name <span className="text-destructive">*</span></Label>
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
                placeholder="A few sentences about your universe — who lives there, what it feels like…"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* ── Section 2: Target Audience ── */}
          <div className="space-y-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">👶 Target Audience</p>

            <div className="space-y-2">
              <Label>Age Range</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AGE_RANGES.map((ar) => (
                  <button
                    key={ar.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, ageRange: ar.value })}
                    className={cn(
                      "flex flex-col items-start px-3 py-3 rounded-2xl border-2 text-left transition-all",
                      formData.ageRange === ar.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/40 bg-card"
                    )}
                  >
                    <span className={cn("text-sm font-bold", formData.ageRange === ar.value ? "text-primary" : "text-foreground")}>
                      {ar.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">{ar.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Story Tone</Label>
              <div className="grid grid-cols-2 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, tone: t.value })}
                    className={cn(
                      "flex items-start gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all",
                      formData.tone === t.value
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/40 bg-card"
                    )}
                  >
                    <span className="text-2xl leading-none mt-0.5">{t.emoji}</span>
                    <div>
                      <p className={cn("text-sm font-bold", formData.tone === t.value ? "text-primary" : "text-foreground")}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 3: Art Style ── */}
          <div className="space-y-4">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">🎨 Art Style</p>
            <div className="grid grid-cols-3 gap-3">
              {ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, artStyle: style.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 text-center transition-all",
                    formData.artStyle === style.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 bg-card"
                  )}
                >
                  <span className="text-2xl">{style.emoji}</span>
                  <span className={cn("text-xs font-semibold", formData.artStyle === style.id ? "text-primary" : "text-foreground")}>
                    {style.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Advanced (collapsible) ── */}
          <div className="border rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-muted-foreground hover:bg-muted/40 transition-colors"
            >
              <span>⚙️ Advanced Settings (Tags & Series Bible)</span>
              {advancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {advancedOpen && (
              <div className="px-5 pb-5 space-y-5 border-t bg-muted/10">
                {/* Tags */}
                <div className="space-y-3 pt-4">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag…"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Series Bible */}
                <div className="space-y-2">
                  <Label>Series Bible</Label>
                  <p className="text-xs text-muted-foreground">Describe the world, recurring themes, and rules — injected into every AI generation.</p>
                  <Textarea
                    placeholder="e.g. This universe is set in a lush magical forest where all creatures follow Islamic principles. The tone is always warm, hopeful, and educational…"
                    value={formData.seriesBible}
                    onChange={(e) => setFormData({ ...formData, seriesBible: e.target.value })}
                    rows={6}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(isEditing ? `/app/universes/${id}` : "/app/universes")}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={saving} className="flex-1">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              ) : isEditing ? (
                "✏️ Update Universe"
              ) : (
                <><Users className="w-4 h-4 mr-2" />Create & Add Characters →</>
              )}
            </Button>
          </div>

          {!isEditing && (
            <p className="text-xs text-center text-muted-foreground -mt-4">
              After creating your universe, you'll be taken straight to character creation ✨
            </p>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
