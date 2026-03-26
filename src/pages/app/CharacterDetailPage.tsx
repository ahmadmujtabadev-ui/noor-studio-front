import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useParams, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  Lock,
  Unlock,
  RefreshCw,
  Check,
  Palette,
  User,
  Sparkles,
  Trash2,
  AlertTriangle,
  ThumbsUp,
  Image,
  Loader2,
  Save,
  Wand2,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useCharacter,
  useDeleteCharacter,
  useGeneratePortrait,
  useGeneratePoseSheet,
  useApproveCharacter,
  useUpdateCharacter,
  useUpdatePromptConfig,
  useApplyMasterToPoses,
  useUpdatePosePrompt,
  useRegeneratePose,
} from "@/hooks/useCharacters";
import { useCredits } from "@/hooks/useAuth";

const statusColors: Record<string, string> = {
  draft: "bg-gold-100 text-gold-600",
  approved: "bg-teal-100 text-teal-600",
  locked: "bg-muted text-muted-foreground",
  generated: "bg-blue-100 text-blue-600",
};

const PORTRAIT_COST = 4;
const POSE_SHEET_COST = 6;
const SINGLE_POSE_COST = 4;

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const credits = useCredits();

  const { data: character, isLoading, error } = useCharacter(id);
  const deleteMutation = useDeleteCharacter();
  const generatePortrait = useGeneratePortrait(id!);
  const generatePoseSheet = useGeneratePoseSheet(id!);
  const approveCharacter = useApproveCharacter(id!);
  const updateCharacter = useUpdateCharacter(id!);
  const updatePromptConfig = useUpdatePromptConfig(id!);
  const applyMasterToPoses = useApplyMasterToPoses(id!);
  const updatePosePrompt = useUpdatePosePrompt(id!);
  const regeneratePose = useRegeneratePose(id!);

  const [showGeneratePoses, setShowGeneratePoses] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Simplified prompt config — 3 fields instead of 7
  const [promptForm, setPromptForm] = useState({
    masterNote: "",
    portraitNote: "",
    sceneNote: "",
  });

  // Pose edit dialog
  const [editingPose, setEditingPose] = useState<any>(null);
  const [poseEditor, setPoseEditor] = useState({
    label: "",
    prompt: "",
    notes: "",
    useForScenes: "",
    approved: true,
    priority: 0,
  });

  useEffect(() => {
    if (!character) return;
    setPromptForm({
      masterNote: character.promptConfig?.masterSystemNote || "",
      portraitNote: character.promptConfig?.portraitPromptPrefix || "",
      sceneNote: character.promptConfig?.scenePromptPrefix || "",
    });
  }, [character]);

  useEffect(() => {
    if (!editingPose) return;
    setPoseEditor({
      label: editingPose.label || "",
      prompt: editingPose.prompt || "",
      notes: editingPose.notes || "",
      useForScenes: Array.isArray(editingPose.useForScenes)
        ? editingPose.useForScenes.join(", ")
        : "",
      approved: editingPose.approved !== false,
      priority: Number(editingPose.priority || 0),
    });
  }, [editingPose]);

  const sortedPoses = useMemo(() => {
    return [...(character?.poseLibrary || [])].sort(
      (a: any, b: any) => (a.priority || 0) - (b.priority || 0)
    );
  }, [character]);

  if (isLoading) {
    return (
      <AppLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !character) {
    return (
      <AppLayout title="Character Not Found">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {error ? (error as Error).message : "This character doesn't exist."}
          </p>
          <Button onClick={() => navigate("/app/characters")}>Back to Characters</Button>
        </div>
      </AppLayout>
    );
  }

  const isLocked = character.status === "locked";
  const hasPortrait = !!character.imageUrl;
  const hasPoseSheet = !!character.poseSheetUrl;

  const isWorking =
    generatePortrait.isPending ||
    generatePoseSheet.isPending ||
    approveCharacter.isPending ||
    updateCharacter.isPending ||
    updatePromptConfig.isPending ||
    applyMasterToPoses.isPending ||
    updatePosePrompt.isPending ||
    regeneratePose.isPending;

  const handleGeneratePortrait = async () => {
    if (credits < PORTRAIT_COST) {
      toast({ title: "Insufficient credits", description: `You need ${PORTRAIT_COST} credits.`, variant: "destructive" });
      return;
    }
    try {
      await generatePortrait.mutateAsync();
      toast({ title: "Portrait generated!", description: `${character.name}'s image has been created.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleApprove = async () => {
    try {
      await approveCharacter.mutateAsync();
      toast({ title: "Character approved!", description: `${character.name} is ready for use.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleGeneratePoseSheet = async () => {
    if (credits < POSE_SHEET_COST) {
      toast({ title: "Insufficient credits", description: `You need ${POSE_SHEET_COST} credits.`, variant: "destructive" });
      setShowGeneratePoses(false);
      return;
    }
    try {
      await generatePoseSheet.mutateAsync();
      toast({ title: "Pose sheet generated!", description: `Pose sheet created for ${character.name}.` });
      setShowGeneratePoses(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
      setShowGeneratePoses(false);
    }
  };

  const handleLock = async () => {
    try {
      await updateCharacter.mutateAsync({ status: "locked" });
      toast({ title: "Character locked", description: `${character.name} is now locked for production.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleUnlock = async () => {
    try {
      await updateCharacter.mutateAsync({ status: "approved" });
      toast({ title: "Character unlocked" });
      setShowUnlockModal(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(character.id || character._id);
      toast({ title: "Character deleted" });
      navigate("/app/characters");
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleSavePrompts = async () => {
    try {
      await updatePromptConfig.mutateAsync({
        masterSystemNote: promptForm.masterNote,
        portraitPromptPrefix: promptForm.portraitNote,
        portraitPromptSuffix: "",
        posePromptPrefix: promptForm.masterNote,
        posePromptSuffix: "",
        scenePromptPrefix: promptForm.sceneNote,
        scenePromptSuffix: "",
      });
      toast({ title: "Prompts saved", description: "Changes will apply to the next generation." });
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleSavePose = async () => {
    if (!editingPose) return;
    try {
      await updatePosePrompt.mutateAsync({
        poseKey: editingPose.poseKey,
        data: {
          label: poseEditor.label,
          prompt: poseEditor.prompt,
          notes: poseEditor.notes,
          approved: poseEditor.approved,
          priority: poseEditor.priority,
          useForScenes: poseEditor.useForScenes
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean),
        },
      });
      toast({ title: "Pose updated" });
      setEditingPose(null);
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleRegeneratePose = async () => {
    if (!editingPose) return;
    if (credits < SINGLE_POSE_COST) {
      toast({ title: "Insufficient credits", description: `You need ${SINGLE_POSE_COST} credits.`, variant: "destructive" });
      return;
    }
    try {
      await regeneratePose.mutateAsync({ poseKey: editingPose.poseKey, body: { prompt: poseEditor.prompt } });
      toast({ title: "Pose regenerated" });
      setEditingPose(null);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  return (
    <AppLayout
      title={character.name}
      subtitle={character.role}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/characters")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          {character.status === "approved" && !isLocked && (
            <Button variant="hero" onClick={handleLock} disabled={isWorking}>
              <Lock className="w-4 h-4 mr-2" />
              Lock for Production
            </Button>
          )}
          {isLocked && (
            <Button variant="outline" onClick={() => setShowUnlockModal(true)}>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          )}
        </div>
      }
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left: Portrait panel ── */}
        <div className="lg:col-span-1">
          <div className="card-glow p-6 sticky top-6 space-y-4">
            {/* Portrait */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-subtle relative">
              {hasPortrait ? (
                <>
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                  {character.status === "approved" && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Approved
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4">
                  <Image className="w-14 h-14 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground text-center">No portrait yet</p>
                </div>
              )}
            </div>

            {/* Generate / Approve */}
            <div className="flex gap-2">
              <Button
                variant="hero"
                size="sm"
                className="flex-1"
                onClick={handleGeneratePortrait}
                disabled={isWorking || credits < PORTRAIT_COST || isLocked}
              >
                {generatePortrait.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />{hasPortrait ? "Regenerate" : "Generate"} ({PORTRAIT_COST} cr)</>
                )}
              </Button>
              {hasPortrait && character.status !== "approved" && character.status !== "locked" && (
                <Button variant="outline" size="sm" onClick={handleApprove} disabled={isWorking}>
                  <ThumbsUp className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColors[character.status] || statusColors.draft}>
                  {character.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Poses</span>
                <span className="font-medium">{sortedPoses.length} poses</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">{credits}</span>
              </div>
              {character.ageRange && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Age Range</span>
                  <span className="font-medium">{character.ageRange}</span>
                </div>
              )}
            </div>

            {/* Traits */}
            {(character.traits || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(character.traits || []).map((trait: string) => (
                  <Badge key={trait} variant="outline" className="text-xs capitalize">
                    {trait}
                  </Badge>
                ))}
              </div>
            )}

            {/* Delete */}
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Character
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right: Tabs ── */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">
                <User className="w-4 h-4 mr-2" />
                Character
              </TabsTrigger>
              <TabsTrigger value="poses">
                <Palette className="w-4 h-4 mr-2" />
                Poses
              </TabsTrigger>
              <TabsTrigger value="prompts">
                <Settings2 className="w-4 h-4 mr-2" />
                Prompts
              </TabsTrigger>
            </TabsList>

            {/* ── Overview Tab ── */}
            <TabsContent value="overview" className="space-y-6">
              {/* Persona */}
              <div className="card-glow p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Persona
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["Name", character.name],
                    ["Role", character.role],
                    ["Age Range", character.ageRange],
                    ["Speaking Style", character.speakingStyle],
                  ].map(([label, value]) => value ? (
                    <div key={label as string}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="font-medium text-sm">{value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Visual DNA */}
              <div className="card-glow p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Visual DNA
                </h3>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["Skin Tone", character.visualDNA?.skinTone],
                    ["Eye Color", character.visualDNA?.eyeColor],
                    ["Face Shape", character.visualDNA?.faceShape],
                    ["Hair Style", character.visualDNA?.hairStyle],
                    ["Hair Color", character.visualDNA?.hairColor],
                    ["Hijab Style", character.visualDNA?.hijabStyle],
                    ["Hijab Color", character.visualDNA?.hijabColor],
                    ["Top Garment", character.visualDNA?.topGarmentType],
                    ["Top Color", character.visualDNA?.topGarmentColor],
                    ["Bottom Garment", character.visualDNA?.bottomGarmentType],
                    ["Shoe Type", character.visualDNA?.shoeType],
                    ["Shoe Color", character.visualDNA?.shoeColor],
                  ].map(([label, value]) => value ? (
                    <div key={label as string}>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                      <p className="font-medium text-sm">{value}</p>
                    </div>
                  ) : null)}
                </div>
                {character.visualDNA?.paletteNotes && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Palette Notes</p>
                    <p className="text-sm">{character.visualDNA.paletteNotes}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ── Poses Tab ── */}
            <TabsContent value="poses" className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Pose Library</h3>
                  <p className="text-sm text-muted-foreground">
                    {sortedPoses.length} poses · click any pose to edit or regenerate
                  </p>
                </div>
                <div className="flex gap-2">
                  {hasPoseSheet && (
                    <Button variant="outline" size="sm" onClick={() => applyMasterToPoses.mutate()} disabled={isWorking || isLocked}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Apply Master
                    </Button>
                  )}
                  <Button
                    variant={hasPoseSheet ? "outline" : "hero"}
                    size="sm"
                    onClick={() => setShowGeneratePoses(true)}
                    disabled={isWorking || isLocked}
                  >
                    {hasPoseSheet ? (
                      <><RefreshCw className="w-4 h-4 mr-2" />Regenerate Sheet</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate Poses ({POSE_SHEET_COST} cr)</>
                    )}
                  </Button>
                </div>
              </div>

              {/* Pose sheet image */}
              {hasPoseSheet && (
                <div className="card-glow p-4">
                  <img
                    src={character.poseSheetUrl}
                    alt={`${character.name} Pose Sheet`}
                    className="w-full rounded-xl border border-border"
                  />
                </div>
              )}

              {/* Pose grid */}
              {sortedPoses.length === 0 ? (
                <div className="card-glow p-12 text-center text-muted-foreground text-sm">
                  No poses yet. Generate a pose sheet to get started.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedPoses.map((pose: any) => (
                    <button
                      key={pose.poseKey}
                      onClick={() => setEditingPose(pose)}
                      className="card-glow p-3 text-left hover:border-primary/50 transition-all group"
                    >
                      {/* Pose image */}
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                        {pose.imageUrl ? (
                          <img src={pose.imageUrl} alt={pose.label} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{pose.label}</span>
                        <Badge
                          variant={pose.approved !== false ? "secondary" : "outline"}
                          className="text-[10px] shrink-0"
                        >
                          {pose.approved !== false ? "on" : "off"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 group-hover:text-primary transition-colors">
                        Edit →
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Prompts Tab ── */}
            <TabsContent value="prompts" className="space-y-6">
              <div className="card-glow p-6 space-y-5">
                <div>
                  <h3 className="font-semibold mb-1">Generation Prompts</h3>
                  <p className="text-sm text-muted-foreground">
                    Custom instructions that override AI generation for this character. Leave blank to use defaults.
                  </p>
                </div>

                {/* Master Note */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Master Note
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — applies to ALL images (portrait, poses, scenes)
                    </span>
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. always wear black rounded glasses, warm expression"
                    value={promptForm.masterNote}
                    onChange={(e) => setPromptForm((s) => ({ ...s, masterNote: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>

                {/* Portrait Note */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Portrait Note
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — extra instructions for portrait/reference image only
                    </span>
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. show full body, strong front-facing pose"
                    value={promptForm.portraitNote}
                    onChange={(e) => setPromptForm((s) => ({ ...s, portraitNote: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>

                {/* Scene Note */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Scene Note
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — extra instructions for book illustration scenes only
                    </span>
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder="e.g. always show carrying a small backpack"
                    value={promptForm.sceneNote}
                    onChange={(e) => setPromptForm((s) => ({ ...s, sceneNote: e.target.value }))}
                    disabled={isLocked}
                  />
                </div>

                <Button
                  onClick={handleSavePrompts}
                  disabled={updatePromptConfig.isPending || isLocked}
                  className="w-full sm:w-auto"
                >
                  {updatePromptConfig.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" />Save Prompts</>
                  )}
                </Button>

                {isLocked && (
                  <p className="text-xs text-muted-foreground">
                    Character is locked. Unlock to edit prompts.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Pose Edit Dialog ── */}
      <Dialog open={!!editingPose} onOpenChange={(open) => { if (!open) setEditingPose(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Pose — {editingPose?.label}</DialogTitle>
            <DialogDescription>{editingPose?.poseKey}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Pose image */}
            {editingPose?.imageUrl && (
              <img
                src={editingPose.imageUrl}
                alt={editingPose.label}
                className="w-32 h-32 object-cover rounded-xl border border-border mx-auto"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={poseEditor.label}
                  onChange={(e) => setPoseEditor((s) => ({ ...s, label: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Priority (lower = first)</Label>
                <Input
                  type="number"
                  value={poseEditor.priority}
                  onChange={(e) => setPoseEditor((s) => ({ ...s, priority: Number(e.target.value || 0) }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Use For Scenes (comma separated)</Label>
              <Input
                value={poseEditor.useForScenes}
                onChange={(e) => setPoseEditor((s) => ({ ...s, useForScenes: e.target.value }))}
                placeholder="e.g. greeting, discovery, prayer"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="pose-approved-dialog"
                type="checkbox"
                checked={poseEditor.approved}
                onChange={(e) => setPoseEditor((s) => ({ ...s, approved: e.target.checked }))}
                className="w-4 h-4"
              />
              <Label htmlFor="pose-approved-dialog" className="text-sm">
                Approved for scene generation
              </Label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pose Prompt</Label>
              <Textarea
                rows={8}
                value={poseEditor.prompt}
                onChange={(e) => setPoseEditor((s) => ({ ...s, prompt: e.target.value }))}
                className="font-mono text-xs"
              />
            </div>

            {poseEditor.notes !== undefined && (
              <div className="space-y-1">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  rows={2}
                  value={poseEditor.notes}
                  onChange={(e) => setPoseEditor((s) => ({ ...s, notes: e.target.value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 flex-wrap">
            <Button variant="ghost" onClick={() => setEditingPose(null)}>Cancel</Button>
            <Button
              variant="outline"
              onClick={handleRegeneratePose}
              disabled={regeneratePose.isPending || isLocked || credits < SINGLE_POSE_COST}
            >
              {regeneratePose.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Regenerating...</>
              ) : (
                <><RefreshCw className="w-4 h-4 mr-2" />Regenerate ({SINGLE_POSE_COST} cr)</>
              )}
            </Button>
            <Button onClick={handleSavePose} disabled={updatePosePrompt.isPending || isLocked}>
              {updatePosePrompt.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-4 h-4 mr-2" />Save Pose</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Generate Pose Sheet Dialog ── */}
      <Dialog open={showGeneratePoses} onOpenChange={setShowGeneratePoses}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Pose Sheet</DialogTitle>
            <DialogDescription>
              Generate a pose sheet for {character.name}. This costs {POSE_SHEET_COST} credits.
              You have {credits} credits remaining.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowGeneratePoses(false)}>Cancel</Button>
            <Button
              variant="hero"
              onClick={handleGeneratePoseSheet}
              disabled={generatePoseSheet.isPending || credits < POSE_SHEET_COST}
            >
              {generatePoseSheet.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Generate ({POSE_SHEET_COST} credits)</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Unlock Dialog ── */}
      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-500" />
              Unlock Character?
            </DialogTitle>
            <DialogDescription>
              This character is locked. Unlocking allows edits.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowUnlockModal(false)}>Cancel</Button>
            <Button variant="outline" onClick={handleUnlock} disabled={updateCharacter.isPending}>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Character?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete {character.name}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
