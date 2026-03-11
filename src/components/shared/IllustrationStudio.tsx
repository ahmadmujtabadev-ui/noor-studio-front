import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Image as ImageIcon, Plus, Check, RefreshCw, Download, Loader2, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useGenerateIllustration } from "@/hooks/useAI";
import { useAuthStore } from "@/hooks/useAuth";
import type { IllustrationArtifact } from "@/lib/api/types";

const ILLUSTRATION_STYLES = [
  { value: "pixar-3d", label: "Pixar 3D" },
  { value: "watercolor", label: "Watercolor" },
  { value: "flat-illustration", label: "Flat Illustration" },
  { value: "manga", label: "Manga" },
];

interface IllustrationStudioProps {
  projectId: string;
  illustrations?: IllustrationArtifact[];
  onSelectIllustration?: (illustration: IllustrationArtifact) => void;
}

export function IllustrationStudio({
  projectId,
  illustrations = [],
  onSelectIllustration,
}: IllustrationStudioProps) {
  const { toast } = useToast();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const generateMutation = useGenerateIllustration(projectId);

  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    scene: "",
    style: "flat-illustration",
    chapterNumber: 1,
    prompt: "",
  });

  const filtered = illustrations.filter((ill) =>
    (ill.scene || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = async () => {
    if (!form.scene.trim()) {
      toast({ title: "Scene description required", variant: "destructive" });
      return;
    }
    try {
      await generateMutation.mutateAsync({
        chapterNumber: form.chapterNumber,
        scene: form.scene,
        style: form.style,
        prompt: form.prompt || undefined,
      });
      refreshUser();
      toast({ title: "Illustration generated!" });
      setShowDialog(false);
      setForm({ scene: "", style: "flat-illustration", chapterNumber: 1, prompt: "" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search illustrations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="hero" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />New Illustration
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl border-2 border-dashed border-border">
          <ImageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">
            {search ? "No illustrations match your search." : "No illustrations yet."}
          </p>
          {!search && (
            <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
              <Sparkles className="w-4 h-4 mr-2" />Generate First Illustration
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filtered.map((ill, idx) => (
            <div
              key={idx}
              onClick={() => onSelectIllustration?.(ill)}
              className={cn(
                "rounded-xl border-2 overflow-hidden cursor-pointer transition-all group",
                "border-border hover:border-primary/50"
              )}
            >
              <div className="aspect-square bg-muted relative">
                {ill.imageUrl ? (
                  <img src={ill.imageUrl} alt={`Ch.${ill.chapterNumber}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {ill.status === "generating" ? (
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    )}
                  </div>
                )}
                {onSelectIllustration && (
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium truncate">Chapter {ill.chapterNumber}</p>
                <div className="flex items-center justify-between mt-1">
                  <Badge variant="outline" className="text-xs">{ill.status}</Badge>
                  {ill.imageUrl && (
                    <a href={ill.imageUrl} download target="_blank" rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-primary transition-colors">
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Illustration</DialogTitle>
            <DialogDescription>Describe the scene for your illustration. Costs 10 credits.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chapter Number</Label>
                <Input
                  type="number" min={1}
                  value={form.chapterNumber}
                  onChange={(e) => setForm({ ...form, chapterNumber: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Art Style</Label>
                <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ILLUSTRATION_STYLES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Scene Description *</Label>
              <Textarea
                placeholder="Describe what happens in this scene..."
                value={form.scene}
                onChange={(e) => setForm({ ...form, scene: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Additional Prompt (optional)</Label>
              <Input
                placeholder="Extra style notes..."
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate (10 cr)</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
