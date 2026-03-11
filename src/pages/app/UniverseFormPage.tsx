import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUniverse, useCreateUniverse, useUpdateUniverse } from "@/hooks/useUniverses";
import { Loader2, Save, ArrowLeft, X, Plus } from "lucide-react";
import { toast } from "sonner";

const ART_STYLES = [
  { id: "pixar-3d", label: "Pixar 3D" },
  { id: "watercolor", label: "Watercolor" },
  { id: "flat-illustration", label: "Flat Illustration" },
  { id: "manga", label: "Manga" },
  { id: "pencil-sketch", label: "Pencil Sketch" },
  { id: "oil-painting", label: "Oil Painting" },
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
    seriesBible: "",
    artStyle: "flat-illustration",
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (universe) {
      setFormData({
        name: universe.name,
        description: universe.description || "",
        seriesBible: universe.seriesBible || "",
        artStyle: universe.artStyle || "flat-illustration",
        tags: universe.tags || [],
      });
    }
  }, [universe]);

  const saving = createMutation.isPending || updateMutation.isPending;

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
          seriesBible: formData.seriesBible || undefined,
          artStyle: formData.artStyle,
          tags: formData.tags,
        });
        toast.success("Universe updated successfully");
        navigate(`/app/universes/${id}`);
      } else {
        const created = await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          seriesBible: formData.seriesBible || undefined,
          artStyle: formData.artStyle,
          tags: formData.tags,
        });
        toast.success("Universe created successfully");
        navigate(`/app/universes/${created.id}`);
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

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
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
      title={isEditing ? "Edit Universe" : "Create Universe"}
      subtitle={isEditing ? "Update your universe settings" : "Create a new story universe"}
      actions={
        <Button variant="outline" onClick={() => navigate("/app/universes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Give your universe a name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Universe Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Adventures of Noor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your universe..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Art Style */}
        <Card>
          <CardHeader>
            <CardTitle>Art Style</CardTitle>
            <CardDescription>Choose the default illustration style</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ART_STYLES.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, artStyle: style.id })}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                    formData.artStyle === style.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to organize your universe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Series Bible */}
        <Card>
          <CardHeader>
            <CardTitle>Series Bible</CardTitle>
            <CardDescription>Document the rules and lore of your universe (used in AI generation)</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Describe the world, its rules, recurring themes, tone of voice..."
              value={formData.seriesBible}
              onChange={(e) => setFormData({ ...formData, seriesBible: e.target.value })}
              rows={6}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pb-8">
          <Button type="button" variant="outline" onClick={() => navigate("/app/universes")}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" disabled={saving}>
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />{isEditing ? "Update Universe" : "Create Universe"}</>
            )}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
