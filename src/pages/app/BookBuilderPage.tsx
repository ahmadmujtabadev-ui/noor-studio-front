import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Globe, BookOpen, Type, Users, Layout,
  Check, Database, FileText, Download, Info, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCreateProject } from "@/hooks/useProjects";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import { useKnowledgeBases } from "@/hooks/useKnowledgeBase";
import type { Character } from "@/lib/api/types";

const steps = [
  { id: 1, title: "Story World", icon: Globe, description: "Universe & knowledge base" },
  { id: 2, title: "Basics", icon: BookOpen, description: "Template & age range" },
  { id: 3, title: "Characters", icon: Users, description: "Pick your cast" },
  { id: 4, title: "Formatting", icon: Layout, description: "Layout & export targets" },
  { id: 5, title: "Review", icon: FileText, description: "Create your project" },
];

const TEMPLATES = [
  { id: "adventure", name: "Middle-Grade Adventure", description: "Epic journeys with moral lessons", ageRange: "8-12" },
  { id: "values", name: "Junior Values Story", description: "Gentle tales about kindness and sharing", ageRange: "4-7" },
  { id: "educational", name: "Educational (Salah/Quran)", description: "Learn Islamic practices through stories", ageRange: "4-8" },
  { id: "seerah", name: "Seerah-Inspired", description: "Stories from the Prophet's life", ageRange: "6-12" },
];

const AGE_RANGES = ["2-4", "4-7", "5-8", "6-9", "8-12"];

const LAYOUT_STYLES = [
  { id: "split-page", label: "Split Page", description: "Text on left, image on right" },
  { id: "full-image", label: "Full Image", description: "Full-page illustrations with text overlay" },
  { id: "text-under-image", label: "Text Under Image", description: "Image above, text below" },
];

const TRIM_SIZES = [
  { id: "8x10", label: '8" × 10"', description: "Standard children's book" },
  { id: "8.5x8.5", label: '8.5" × 8.5"', description: "Square format" },
  { id: "6x9", label: '6" × 9"', description: "Chapter book" },
  { id: "11x8.5", label: '11" × 8.5"', description: "Landscape / wide" },
];

const EXPORT_TARGETS = [
  { id: "pdf", label: "Print-Ready PDF" },
  { id: "epub", label: "EPUB (digital)" },
  { id: "print-ready-pdf", label: "Commercial Print PDF" },
];

export default function BookBuilderPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createProject = useCreateProject();
  const { universes } = useUniverses();
  const { data: characters = [] } = useCharacters();
  const { data: kbs = [] } = useKnowledgeBases();

  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    universeId: "",
    universeName: "",
    knowledgeBaseId: "",
    knowledgeBaseName: "",
    templateType: "",
    ageRange: "",
    title: "",
    synopsis: "",
    learningObjective: "",
    setting: "",
    characterIds: [] as string[],
    layoutStyle: "split-page",
    trimSize: "8x10",
    exportTargets: ["pdf"] as string[],
  });

  const progressPct = ((currentStep - 1) / (steps.length - 1)) * 100;

  const updateForm = (updates: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...updates }));

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true; // optional step
      case 2: return !!form.templateType && !!form.ageRange && !!form.title;
      case 3: return true; // characters optional
      case 4: return !!form.layoutStyle && !!form.trimSize && form.exportTargets.length > 0;
      default: return true;
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast({ title: "Book title is required", variant: "destructive" });
      return;
    }
    try {
      const project = await createProject.mutateAsync({
        universeId: form.universeId || undefined,
        universeName: form.universeName || undefined,
        knowledgeBaseId: form.knowledgeBaseId || undefined,
        knowledgeBaseName: form.knowledgeBaseName || undefined,
        title: form.title,
        ageRange: form.ageRange,
        templateType: form.templateType,
        synopsis: form.synopsis || undefined,
        learningObjective: form.learningObjective || undefined,
        setting: form.setting || undefined,
        characterIds: form.characterIds,
        layoutStyle: form.layoutStyle,
        trimSize: form.trimSize,
        exportTargets: form.exportTargets,
      });
      toast({ title: "Project created!", description: `"${form.title}" is ready to build.` });
      navigate(`/app/projects/${project.id}`);
    } catch (err) {
      toast({ title: "Failed to create project", description: (err as Error).message, variant: "destructive" });
    }
  };

  const toggleCharacter = (id: string) => {
    if (form.characterIds.includes(id)) {
      updateForm({ characterIds: form.characterIds.filter((c) => c !== id) });
    } else {
      updateForm({ characterIds: [...form.characterIds, id] });
    }
  };

  const toggleExportTarget = (id: string) => {
    if (form.exportTargets.includes(id)) {
      updateForm({ exportTargets: form.exportTargets.filter((t) => t !== id) });
    } else {
      updateForm({ exportTargets: [...form.exportTargets, id] });
    }
  };

  return (
    <AppLayout
      title="New Book Project"
      subtitle="Set up your Islamic children's book"
      actions={
        <Button variant="outline" onClick={() => navigate("/app/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Cancel
        </Button>
      }
    >
      {/* Steps */}
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn("h-0.5 w-12 sm:w-24 mx-1", currentStep > step.id ? "bg-primary" : "bg-border")} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-0.5">
            {steps.map((step) => (
              <span key={step.id} className={cn("hidden sm:block", currentStep === step.id && "text-primary font-medium")}>
                {step.title}
              </span>
            ))}
          </div>
          <Progress value={progressPct} className="h-1.5 mt-3" />
        </div>

        <div className="card-glow p-8 space-y-6">
          {/* Step 1: Story World */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Story World</h2>
                <p className="text-muted-foreground text-sm">Optionally link this book to a universe and knowledge base.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Universe (optional)</Label>
                  <Select
                    value={form.universeId}
                    onValueChange={(v) => {
                      const u = universes.find((u) => u.id === v);
                      updateForm({ universeId: v, universeName: u?.name || "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a universe..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>  {/* ← "none" not "" */}
                      {universes.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Knowledge Base (optional)</Label>
                  <Select
                    value={form.knowledgeBaseId}
                    onValueChange={(v) => {
                      const kb = kbs.find((k) => k.id === v);
                      updateForm({ knowledgeBaseId: v, knowledgeBaseName: kb?.name || "" });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a knowledge base..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>  {/* ← "none" not "" */}
                      {kbs.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>{kb.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">The KB provides Islamic rules and vocabulary to the AI.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Basics */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Book Basics</h2>
                <p className="text-muted-foreground text-sm">Choose a template and fill in your story details.</p>
              </div>
              {/* Template */}
              <div className="space-y-3">
                <Label>Template *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateForm({ templateType: t.id, ageRange: form.ageRange || t.ageRange })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        form.templateType === t.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                      )}
                    >
                      <p className="font-semibold text-sm mb-1">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">Ages {t.ageRange}</Badge>
                    </button>
                  ))}
                </div>
              </div>
              {/* Age Range */}
              <div className="space-y-2">
                <Label>Age Range *</Label>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => updateForm({ ageRange: age })}
                      className={cn(
                        "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                        form.ageRange === age ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                      )}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
              {/* Title */}
              <div className="space-y-2">
                <Label>Book Title *</Label>
                <Input
                  placeholder="The Adventures of Amira..."
                  value={form.title}
                  onChange={(e) => updateForm({ title: e.target.value })}
                />
              </div>
              {/* Synopsis */}
              <div className="space-y-2">
                <Label>Synopsis</Label>
                <Textarea
                  placeholder="A short description of your story..."
                  value={form.synopsis}
                  onChange={(e) => updateForm({ synopsis: e.target.value })}
                  rows={3}
                />
              </div>
              {/* Learning Objective */}
              <div className="space-y-2">
                <Label>Learning Objective</Label>
                <Input
                  placeholder="e.g., Understanding the importance of honesty"
                  value={form.learningObjective}
                  onChange={(e) => updateForm({ learningObjective: e.target.value })}
                />
              </div>
              {/* Setting */}
              <div className="space-y-2">
                <Label>Setting</Label>
                <Input
                  placeholder="e.g., A small village near a beautiful mosque"
                  value={form.setting}
                  onChange={(e) => updateForm({ setting: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 3: Characters */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Choose Characters</h2>
                <p className="text-muted-foreground text-sm">
                  Select characters to appear in this book. You can add them later too.
                </p>
              </div>
              {characters.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No characters yet.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/app/characters/new")}>
                    Create Characters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {characters.map((char: Character) => (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => toggleCharacter(char.id)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all relative",
                        form.characterIds.includes(char.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/30"
                      )}
                    >
                      {form.characterIds.includes(char.id) && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      {char.imageUrl && (
                        <img src={char.imageUrl} alt={char.name} className="w-full aspect-square object-cover rounded-lg mb-2" />
                      )}
                      <p className="font-semibold text-sm truncate">{char.name}</p>
                      <p className="text-xs text-muted-foreground">{char.role}</p>
                    </button>
                  ))}
                </div>
              )}
              {form.characterIds.length > 0 && (
                <p className="text-sm text-primary font-medium">
                  {form.characterIds.length} character{form.characterIds.length > 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Formatting */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Formatting</h2>
                <p className="text-muted-foreground text-sm">Choose layout style, trim size, and export formats.</p>
              </div>
              {/* Layout Style */}
              <div className="space-y-3">
                <Label>Layout Style *</Label>
                <div className="grid gap-3">
                  {LAYOUT_STYLES.map((ls) => (
                    <button
                      key={ls.id}
                      type="button"
                      onClick={() => updateForm({ layoutStyle: ls.id })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        form.layoutStyle === ls.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{ls.label}</p>
                          <p className="text-sm text-muted-foreground">{ls.description}</p>
                        </div>
                        {form.layoutStyle === ls.id && <Check className="w-5 h-5 text-primary" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {/* Trim Size */}
              <div className="space-y-3">
                <Label>Trim Size *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {TRIM_SIZES.map((ts) => (
                    <button
                      key={ts.id}
                      type="button"
                      onClick={() => updateForm({ trimSize: ts.id })}
                      className={cn(
                        "p-4 rounded-xl border-2 text-left transition-all",
                        form.trimSize === ts.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                      )}
                    >
                      <p className="font-bold">{ts.label}</p>
                      <p className="text-xs text-muted-foreground">{ts.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              {/* Export Targets */}
              <div className="space-y-3">
                <Label>Export Formats *</Label>
                <div className="space-y-2">
                  {EXPORT_TARGETS.map((et) => (
                    <div key={et.id} className="flex items-center gap-3">
                      <Checkbox
                        id={et.id}
                        checked={form.exportTargets.includes(et.id)}
                        onCheckedChange={() => toggleExportTarget(et.id)}
                      />
                      <label htmlFor={et.id} className="text-sm font-medium cursor-pointer">{et.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Review & Create</h2>
                <p className="text-muted-foreground text-sm">Everything looks good? Create your project!</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Title</span>
                    <span className="font-semibold">{form.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Template</span>
                    <span className="font-semibold capitalize">{form.templateType.replace(/-/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Age Range</span>
                    <span className="font-semibold">{form.ageRange}</span>
                  </div>
                  {form.universeName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Universe</span>
                      <span className="font-semibold">{form.universeName}</span>
                    </div>
                  )}
                  {form.knowledgeBaseName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Knowledge Base</span>
                      <span className="font-semibold">{form.knowledgeBaseName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters</span>
                    <span className="font-semibold">{form.characterIds.length} selected</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Layout</span>
                    <span className="font-semibold capitalize">{form.layoutStyle.replace(/-/g, " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trim Size</span>
                    <span className="font-semibold">{form.trimSize}"</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Export</span>
                    <span className="font-semibold">{form.exportTargets.join(", ").toUpperCase()}</span>
                  </div>
                </div>
                {form.synopsis && (
                  <div className="p-4 rounded-xl bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-1">Synopsis</p>
                    <p className="text-sm">{form.synopsis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                variant="hero"
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleCreate}
                disabled={createProject.isPending || !form.title}
              >
                {createProject.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><Check className="w-4 h-4 mr-2" />Create Project</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
