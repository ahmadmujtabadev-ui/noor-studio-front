import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, Plus, Check, Download, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useGenerateCover } from "@/hooks/useAI";
import { useAuthStore } from "@/hooks/useAuth";
import type { CoverArtifact } from "@/lib/api/types";
import { CreditConfirmModal } from "@/components/shared/CreditConfirmModal";

const COVER_STYLES = [
  { value: "pixar-3d", label: "3D Rendered" },
  { value: "watercolor", label: "Watercolor" },
  { value: "flat-illustration", label: "Flat Illustration" },
  { value: "ornate", label: "Ornate / Decorative" },
];

interface CoverStudioProps {
  projectId: string;
  cover?: CoverArtifact | null;
  onSelectCover?: (cover: CoverArtifact) => void;
}

export function CoverStudio({ projectId, cover, onSelectCover }: CoverStudioProps) {
  const { toast } = useToast();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const generateMutation = useGenerateCover(projectId);

  const [showDialog, setShowDialog] = useState(false);
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);
  const [form, setForm] = useState({
    style: "flat-illustration",
    title: "",
    subtitle: "",
    authorName: "",
    prompt: "",
  });

  /** Step 1: close the settings dialog and open the credit confirmation. */
  const requestGenerate = () => {
    setShowDialog(false);
    setShowCreditConfirm(true);
  };

  /** Step 2: called when user confirms in CreditConfirmModal. */
  const handleGenerate = async () => {
    try {
      const updated = await generateMutation.mutateAsync({
        style: form.style,
        title: form.title || undefined,
        subtitle: form.subtitle || undefined,
        authorName: form.authorName || undefined,
        prompt: form.prompt || undefined,
      });
      refreshUser();
      if (updated.artifacts?.cover) onSelectCover?.(updated.artifacts.cover);
      toast({ title: "Cover generated!" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Cover */}
      {cover ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Book Cover</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
                <Sparkles className="w-4 h-4 mr-2" />Regenerate
              </Button>
              {cover.frontCoverUrl && (
                <a href={cover.frontCoverUrl} download target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />Download
                  </Button>
                </a>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {cover.frontCoverUrl && (
              <div
                className={cn(
                  "rounded-xl border-2 overflow-hidden cursor-pointer transition-all",
                  "border-border hover:border-primary/50"
                )}
                onClick={() => onSelectCover?.(cover)}
              >
                <img src={cover.frontCoverUrl} alt="Front Cover" className="w-full" />
                <div className="p-2 flex items-center justify-between">
                  <p className="text-xs font-medium">Front Cover</p>
                  <Badge variant="outline" className="text-xs">{cover.style}</Badge>
                </div>
              </div>
            )}
            {cover.backCoverUrl && (
              <div className="rounded-xl border-2 border-border overflow-hidden">
                <img src={cover.backCoverUrl} alt="Back Cover" className="w-full" />
                <div className="p-2">
                  <p className="text-xs font-medium">Back Cover</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border-2 border-dashed border-border">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">No cover generated yet.</p>
          <Button variant="hero" size="sm" onClick={() => setShowDialog(true)}>
            <Sparkles className="w-4 h-4 mr-2" />Generate Cover (3 cr)
          </Button>
        </div>
      )}

      {/* Generate Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Book Cover</DialogTitle>
            <DialogDescription>Create front and back cover art. Costs 3 credits.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Art Style</Label>
              <Select value={form.style} onValueChange={(v) => setForm({ ...form, style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COVER_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Book Title (optional override)</Label>
              <Input placeholder="Uses project title by default" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Author Name</Label>
              <Input placeholder="Your name" value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Additional Prompt (optional)</Label>
              <Textarea
                placeholder="Describe mood, colors, or specific elements..."
                value={form.prompt}
                onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button variant="hero" onClick={requestGenerate}>
              <Sparkles className="w-4 h-4 mr-2" />Generate Cover (3 cr)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit confirmation — shown after the settings dialog */}
      <CreditConfirmModal
        open={showCreditConfirm}
        onOpenChange={(open) => { if (!open) setShowCreditConfirm(false); }}
        onConfirm={async () => {
          setShowCreditConfirm(false);
          await handleGenerate();
        }}
        title="Generate Book Cover"
        description="AI will generate front and back cover art for your book. Credits are deducted once generation completes."
        creditCost={3}
        isLoading={generateMutation.isPending}
      />
    </div>
  );
}
