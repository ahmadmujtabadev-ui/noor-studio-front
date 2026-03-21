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
  History,
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
  const [selectedPoseKey, setSelectedPoseKey] = useState<string | null>(null);

  const [promptConfigForm, setPromptConfigForm] = useState({
    masterSystemNote: "",
    portraitPromptPrefix: "",
    portraitPromptSuffix: "",
    posePromptPrefix: "",
    posePromptSuffix: "",
    scenePromptPrefix: "",
    scenePromptSuffix: "",
  });

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
    setPromptConfigForm({
      masterSystemNote: character.promptConfig?.masterSystemNote || "",
      portraitPromptPrefix: character.promptConfig?.portraitPromptPrefix || "",
      portraitPromptSuffix: character.promptConfig?.portraitPromptSuffix || "",
      posePromptPrefix: character.promptConfig?.posePromptPrefix || "",
      posePromptSuffix: character.promptConfig?.posePromptSuffix || "",
      scenePromptPrefix: character.promptConfig?.scenePromptPrefix || "",
      scenePromptSuffix: character.promptConfig?.scenePromptSuffix || "",
    });
  }, [character]);

  useEffect(() => {
    if (!character || !selectedPoseKey) return;
    const pose = (character.poseLibrary || []).find((p: any) => p.poseKey === selectedPoseKey);
    if (!pose) return;

    setPoseEditor({
      label: pose.label || "",
      prompt: pose.prompt || "",
      notes: pose.notes || "",
      useForScenes: Array.isArray(pose.useForScenes) ? pose.useForScenes.join(", ") : "",
      approved: pose.approved !== false,
      priority: Number(pose.priority || 0),
    });
  }, [character, selectedPoseKey]);

  const sortedPoses = useMemo(() => {
    return [...(character?.poseLibrary || [])].sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0));
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
  const approvedPoses = (character.approvedPoseKeys || []).length;
  const activePose = selectedPoseKey
    ? sortedPoses.find((p: any) => p.poseKey === selectedPoseKey)
    : sortedPoses[0];

  const handleGeneratePortrait = async () => {
    if (credits < PORTRAIT_COST) {
      toast({
        title: "Insufficient credits",
        description: `You need ${PORTRAIT_COST} credits.`,
        variant: "destructive",
      });
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
      toast({
        title: "Insufficient credits",
        description: `You need ${POSE_SHEET_COST} credits.`,
        variant: "destructive",
      });
      setShowGeneratePoses(false);
      return;
    }

    try {
      await generatePoseSheet.mutateAsync();
      toast({
        title: "Pose sheet generated!",
        description: `Pose sheet created for ${character.name}.`,
      });
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
      toast({ title: "Character unlocked", description: `${character.name} can now be edited.` });
      setShowUnlockModal(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(character.id || character._id);
      toast({ title: "Character deleted", description: `${character.name} has been deleted.` });
      navigate("/app/characters");
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleSavePromptConfig = async () => {
    try {
      await updatePromptConfig.mutateAsync(promptConfigForm);
      toast({ title: "Prompt config updated" });
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleApplyMasterToAllPoses = async () => {
    try {
      await applyMasterToPoses.mutateAsync();
      toast({ title: "Applied master rules", description: "All pose prompts were rebuilt." });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleSavePosePrompt = async () => {
    if (!activePose) return;

    try {
      await updatePosePrompt.mutateAsync({
        poseKey: activePose.poseKey,
        data: {
          label: poseEditor.label,
          prompt: poseEditor.prompt,
          notes: poseEditor.notes,
          approved: poseEditor.approved,
          priority: poseEditor.priority,
          useForScenes: poseEditor.useForScenes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      });
      toast({ title: "Pose updated" });
    } catch (err) {
      toast({ title: "Update failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleRegeneratePose = async () => {
    if (!activePose) return;

    if (credits < SINGLE_POSE_COST) {
      toast({
        title: "Insufficient credits",
        description: `You need ${SINGLE_POSE_COST} credits.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await regeneratePose.mutateAsync({
        poseKey: activePose.poseKey,
        body: {
          prompt: poseEditor.prompt,
        },
      });
      toast({ title: "Pose regenerated", description: activePose.label });
    } catch (err) {
      toast({ title: "Regenerate failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const isWorking =
    generatePortrait.isPending ||
    generatePoseSheet.isPending ||
    approveCharacter.isPending ||
    updateCharacter.isPending ||
    updatePromptConfig.isPending ||
    applyMasterToPoses.isPending ||
    updatePosePrompt.isPending ||
    regeneratePose.isPending;

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
              Lock Character
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
        <div className="lg:col-span-1">
          <div className="card-glow p-6 sticky top-6">
            <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-subtle relative">
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
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                  <Image className="w-16 h-16 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground text-center">No image generated yet</p>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={handleGeneratePortrait}
                    disabled={isWorking || credits < PORTRAIT_COST}
                  >
                    {generatePortrait.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate ({PORTRAIT_COST} credits)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {hasPortrait && character.status !== "approved" && (
              <div className="flex gap-2 mb-4">
                <Button variant="hero" size="sm" className="flex-1" onClick={handleApprove} disabled={isWorking}>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePortrait}
                  disabled={isWorking || credits < PORTRAIT_COST}
                >
                  <RefreshCw className={cn("w-4 h-4", generatePortrait.isPending && "animate-spin")} />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[character.status] || statusColors.draft}>
                  {character.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {character.selectedStyle || character.visualDNA?.style || "style"}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {(character.traits || []).map((trait: string) => (
                  <Badge key={trait} variant="outline" className="text-xs capitalize">
                    {trait}
                  </Badge>
                ))}
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Age Range</span>
                  <span className="font-medium">{character.ageRange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved Poses</span>
                  <span className="font-medium">{approvedPoses}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits remaining</span>
                  <span className="font-medium">{credits}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
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
        </div>

        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="poses">Pose Sheet</TabsTrigger>
              <TabsTrigger value="prompts">Prompts</TabsTrigger>
              <TabsTrigger value="versions">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Persona</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-medium">{character.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Role</p>
                    <p className="font-medium">{character.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Age Range</p>
                    <p className="font-medium">{character.ageRange}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Speaking Style</p>
                    <p className="font-medium">{character.speakingStyle || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Visual DNA</h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground mb-1">Skin Tone</p><p className="font-medium">{character.visualDNA?.skinTone || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Eye Color</p><p className="font-medium">{character.visualDNA?.eyeColor || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Face Shape</p><p className="font-medium">{character.visualDNA?.faceShape || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Age Look</p><p className="font-medium">{character.visualDNA?.ageLook || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Hair Style</p><p className="font-medium">{character.visualDNA?.hairStyle || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Hijab Style</p><p className="font-medium">{character.visualDNA?.hijabStyle || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Top Garment</p><p className="font-medium">{character.visualDNA?.topGarmentType || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Top Color</p><p className="font-medium">{character.visualDNA?.topGarmentColor || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Bottom Garment</p><p className="font-medium">{character.visualDNA?.bottomGarmentType || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Bottom Color</p><p className="font-medium">{character.visualDNA?.bottomGarmentColor || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Shoe Type</p><p className="font-medium">{character.visualDNA?.shoeType || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Shoe Color</p><p className="font-medium">{character.visualDNA?.shoeColor || "Not specified"}</p></div>
                </div>

                {!!character.visualDNA?.topGarmentDetails && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Garment Details</p>
                    <p className="font-medium">{character.visualDNA.topGarmentDetails}</p>
                  </div>
                )}

                {!!character.visualDNA?.paletteNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Palette Notes</p>
                    <p className="font-medium">{character.visualDNA.paletteNotes}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="poses" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Pose Sheet + Pose Library</h3>
                  <p className="text-sm text-muted-foreground">
                    Edit approved poses, prompts, and regenerate one pose at a time.
                  </p>
                </div>

                {!hasPoseSheet ? (
                  <Button variant="hero" onClick={() => setShowGeneratePoses(true)} disabled={isWorking}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Poses ({POSE_SHEET_COST} credits)
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleApplyMasterToAllPoses} disabled={isWorking || isLocked}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Apply Master to All
                    </Button>
                    <Button variant="outline" onClick={() => setShowGeneratePoses(true)} disabled={isWorking || isLocked}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate Sheet
                    </Button>
                  </div>
                )}
              </div>

              {hasPoseSheet && character.poseSheetUrl && (
                <div className="card-glow p-4">
                  <img
                    src={character.poseSheetUrl}
                    alt={`${character.name} Pose Sheet`}
                    className="w-full rounded-lg border border-border"
                  />
                </div>
              )}

              <div className="grid lg:grid-cols-[260px_1fr] gap-6">
                <div className="card-glow p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Pose Library</h4>
                  {sortedPoses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No poses yet.</p>
                  ) : (
                    sortedPoses.map((pose: any) => (
                      <button
                        key={pose.poseKey}
                        onClick={() => setSelectedPoseKey(pose.poseKey)}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border transition-all",
                          (selectedPoseKey || activePose?.poseKey) === pose.poseKey
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-sm">{pose.label}</span>
                          <div className="flex items-center gap-1">
                            {pose.approved ? (
                              <Badge variant="secondary" className="text-[10px]">approved</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">off</Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{pose.poseKey}</p>
                      </button>
                    ))
                  )}
                </div>

                <div className="card-glow p-6 space-y-4">
                  {activePose ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{activePose.label}</h4>
                          <p className="text-sm text-muted-foreground">{activePose.poseKey}</p>
                        </div>
                        <Badge variant={poseEditor.approved ? "secondary" : "outline"}>
                          {poseEditor.approved ? "Approved" : "Disabled"}
                        </Badge>
                      </div>

                      {activePose.imageUrl ? (
                        <img
                          src={activePose.imageUrl}
                          alt={activePose.label}
                          className="w-48 h-48 object-cover rounded-xl border border-border"
                        />
                      ) : (
                        <div className="w-48 h-48 rounded-xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                          No single pose image yet
                        </div>
                      )}

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label</Label>
                          <Input
                            value={poseEditor.label}
                            onChange={(e) => setPoseEditor((s) => ({ ...s, label: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Input
                            type="number"
                            value={poseEditor.priority}
                            onChange={(e) => setPoseEditor((s) => ({ ...s, priority: Number(e.target.value || 0) }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Use For Scenes</Label>
                        <Input
                          value={poseEditor.useForScenes}
                          onChange={(e) => setPoseEditor((s) => ({ ...s, useForScenes: e.target.value }))}
                          placeholder="e.g. greeting, discovery, prayer"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id="pose-approved"
                          type="checkbox"
                          checked={poseEditor.approved}
                          onChange={(e) => setPoseEditor((s) => ({ ...s, approved: e.target.checked }))}
                        />
                        <Label htmlFor="pose-approved">Approved for scene generation</Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          rows={2}
                          value={poseEditor.notes}
                          onChange={(e) => setPoseEditor((s) => ({ ...s, notes: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Pose Prompt</Label>
                        <Textarea
                          rows={14}
                          value={poseEditor.prompt}
                          onChange={(e) => setPoseEditor((s) => ({ ...s, prompt: e.target.value }))}
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleSavePosePrompt} disabled={updatePosePrompt.isPending || isLocked}>
                          {updatePosePrompt.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                          ) : (
                            <><Save className="w-4 h-4 mr-2" />Save Pose</>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleRegeneratePose}
                          disabled={regeneratePose.isPending || isLocked || credits < SINGLE_POSE_COST}
                        >
                          {regeneratePose.isPending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Regenerating...</>
                          ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" />Regenerate Pose ({SINGLE_POSE_COST} cr)</>
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a pose to edit.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-6">
              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Generation Prompts</h3>
                </div>

                <div className="space-y-2">
                  <Label>Master System Note</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.masterSystemNote}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, masterSystemNote: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Portrait Prompt Prefix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.portraitPromptPrefix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, portraitPromptPrefix: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Portrait Prompt Suffix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.portraitPromptSuffix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, portraitPromptSuffix: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pose Prompt Prefix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.posePromptPrefix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, posePromptPrefix: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pose Prompt Suffix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.posePromptSuffix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, posePromptSuffix: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scene Prompt Prefix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.scenePromptPrefix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, scenePromptPrefix: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Scene Prompt Suffix</Label>
                  <Textarea
                    rows={3}
                    value={promptConfigForm.scenePromptSuffix}
                    onChange={(e) => setPromptConfigForm((s) => ({ ...s, scenePromptSuffix: e.target.value }))}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSavePromptConfig} disabled={updatePromptConfig.isPending || isLocked}>
                    {updatePromptConfig.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />Save Prompt Config</>
                    )}
                  </Button>

                  <Button variant="outline" onClick={handleApplyMasterToAllPoses} disabled={applyMasterToPoses.isPending || isLocked}>
                    {applyMasterToPoses.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Applying...</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-2" />Apply To All Poses</>
                    )}
                  </Button>
                </div>

                {(character.generationMeta?.portraitPrompt || character.generationMeta?.poseSheetPrompt) && (
                  <div className="pt-4 border-t border-border space-y-4">
                    {character.generationMeta?.portraitPrompt && (
                      <div>
                        <Label>Portrait Prompt</Label>
                        <Textarea
                          rows={14}
                          value={character.generationMeta.portraitPrompt}
                          readOnly
                          className="font-mono text-xs"
                        />
                      </div>
                    )}

                    {character.generationMeta?.poseSheetPrompt && (
                      <div>
                        <Label>Pose Sheet Prompt</Label>
                        <Textarea
                          rows={12}
                          value={character.generationMeta.poseSheetPrompt}
                          readOnly
                          className="font-mono text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="versions" className="space-y-6">
              <div className="card-glow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Version History</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Current Version</p>
                      <p className="text-sm text-muted-foreground">{character.status}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Updated: {new Date(character.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Current</Badge>
                  </div>

                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Version history can be expanded later.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={showGeneratePoses} onOpenChange={setShowGeneratePoses}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Pose Sheet</DialogTitle>
            <DialogDescription>
              Generate a pose sheet for {character.name}. This costs {POSE_SHEET_COST} credits.
              You have {credits} credits.
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

      <Dialog open={showUnlockModal} onOpenChange={setShowUnlockModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gold-500" />
              Unlock Character?
            </DialogTitle>
            <DialogDescription>
              This character is locked. Unlocking will allow editing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowUnlockModal(false)}>Cancel</Button>
            <Button variant="outline" onClick={handleUnlock} disabled={updateCharacter.isPending}>
              <Unlock className="w-4 h-4 mr-2" />
              Unlock Character
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Character?
            </DialogTitle>
            <DialogDescription>
              This will permanently delete {character.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Delete Character
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}