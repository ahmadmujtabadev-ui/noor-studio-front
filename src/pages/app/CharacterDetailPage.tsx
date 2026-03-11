import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, Lock, Unlock, RefreshCw, Check, History, Palette, User,
  Sparkles, Trash2, AlertTriangle, Plus, ThumbsUp, Image, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCharacter, useDeleteCharacter, useGeneratePortrait, useGeneratePoseSheet, useApproveCharacter, useUpdateCharacter } from "@/hooks/useCharacters";
import { useCredits } from "@/hooks/useAuth";
import type { Character } from "@/lib/api/types";

const statusColors: Record<string, string> = {
  draft: "bg-gold-100 text-gold-600",
  approved: "bg-teal-100 text-teal-600",
  locked: "bg-muted text-muted-foreground",
  generated: "bg-blue-100 text-blue-600",
};

const PORTRAIT_COST = 2;
const POSE_SHEET_COST = 8;

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

  const [showGeneratePoses, setShowGeneratePoses] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

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
  const hasPoseSheet = character.poseSheetGenerated || !!character.poseSheetUrl;
  const approvedPoses = (character.poses || []).filter(p => p.status === "approved").length;

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
      await approveCharacter.mutateAsync(character.imageUrl);
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
      toast({ title: "Pose sheet generated!", description: `12-pose grid created for ${character.name}.` });
      setShowGeneratePoses(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
      setShowGeneratePoses(false);
    }
  };

  const handleLock = async () => {
    try {
      await updateCharacter.mutateAsync({ status: 'locked' } as Partial<Character>);
      toast({ title: "Character locked", description: `${character.name} is now locked for production.` });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleUnlock = async () => {
    try {
      await updateCharacter.mutateAsync({ status: 'approved' } as Partial<Character>);
      toast({ title: "Character unlocked", description: `${character.name} can now be edited.` });
      setShowUnlockModal(false);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(character.id);
      toast({ title: "Character deleted", description: `${character.name} has been deleted.` });
      navigate("/app/characters");
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const isWorking = generatePortrait.isPending || generatePoseSheet.isPending ||
    approveCharacter.isPending || updateCharacter.isPending;

  return (
    <AppLayout
      title={character.name}
      subtitle={character.role}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/characters")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          {character.status === "approved" && !isLocked && (
            <Button variant="hero" onClick={handleLock} disabled={isWorking}>
              <Lock className="w-4 h-4 mr-2" />Lock Character
            </Button>
          )}
          {isLocked && (
            <Button variant="outline" onClick={() => setShowUnlockModal(true)}>
              <Unlock className="w-4 h-4 mr-2" />Unlock
            </Button>
          )}
        </div>
      }
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Character Preview */}
        <div className="lg:col-span-1">
          <div className="card-glow p-6 sticky top-6">
            <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-subtle relative">
              {hasPortrait ? (
                <>
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/400x400/e2e8f0/64748b?text=${character.name.charAt(0)}`;
                    }}
                  />
                  {character.status === "approved" && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />Approved
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
                  <Image className="w-16 h-16 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground text-center">No image generated yet</p>
                  <Button
                    variant="hero" size="sm"
                    onClick={handleGeneratePortrait}
                    disabled={isWorking || credits < PORTRAIT_COST}
                  >
                    {generatePortrait.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate ({PORTRAIT_COST} credits)</>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Approve / Regenerate when portrait exists but not approved */}
            {hasPortrait && character.status === "draft" && (
              <div className="flex gap-2 mb-4">
                <Button variant="hero" size="sm" className="flex-1" onClick={handleApprove} disabled={isWorking}>
                  <ThumbsUp className="w-4 h-4 mr-2" />Approve
                </Button>
                <Button variant="outline" size="sm" onClick={handleGeneratePortrait} disabled={isWorking || credits < PORTRAIT_COST}>
                  <RefreshCw className={cn("w-4 h-4", generatePortrait.isPending && "animate-spin")} />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[character.status] || statusColors.draft}>{character.status}</Badge>
                <span className="text-sm text-muted-foreground">v{character.version || 1}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {character.traits.map((trait) => (
                  <Badge key={trait} variant="outline" className="text-xs capitalize">{trait}</Badge>
                ))}
              </div>
              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Age Range</span>
                  <span className="font-medium">{character.ageRange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pose Sheet</span>
                  <span className="font-medium">{hasPoseSheet ? `${approvedPoses} poses` : "Not generated"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Credits remaining</span>
                  <span className="font-medium">{credits}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border">
                <Button
                  variant="ghost" size="sm"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />Delete Character
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="poses">Pose Sheet</TabsTrigger>
              <TabsTrigger value="versions">History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Persona</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground mb-1">Name</p><p className="font-medium">{character.name}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Role</p><p className="font-medium">{character.role}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Age Range</p><p className="font-medium">{character.ageRange}</p></div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Speaking Style</p>
                    <p className="font-medium">{character.speakingStyle || character.speechStyle || "Not specified"}</p>
                  </div>
                </div>
                {character.traits.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {character.traits.map((trait) => (
                        <Badge key={trait} variant="secondary" className="capitalize">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Visual DNA</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><p className="text-sm text-muted-foreground mb-1">Skin Tone</p><p className="font-medium">{character.visualDNA?.skinTone || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Hair / Hijab</p><p className="font-medium">{character.visualDNA?.hairOrHijab || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Eye Color</p><p className="font-medium">{character.visualDNA?.eyeColor || "Not specified"}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Face Shape</p><p className="font-medium">{character.visualDNA?.faceShape || "Not specified"}</p></div>
                </div>
                {character.visualDNA?.outfitRules && (
                  <div><p className="text-sm text-muted-foreground mb-1">Outfit Rules</p><p className="font-medium">{character.visualDNA.outfitRules}</p></div>
                )}
                {character.colorPalette?.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Color Palette</p>
                    <div className="flex gap-2">
                      {character.colorPalette.map((color, idx) => (
                        <div key={idx} className="w-10 h-10 rounded-lg shadow-inner border border-border" style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="card-glow p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Modesty Rules</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { key: 'hijabAlways', label: 'Hijab Always' },
                    { key: 'longSleeves', label: 'Long Sleeves' },
                    { key: 'looseClothing', label: 'Loose Clothing' },
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center gap-2">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                        character.modestyRules?.[key as keyof typeof character.modestyRules] ? "bg-primary text-white" : "bg-muted"
                      )}>
                        {character.modestyRules?.[key as keyof typeof character.modestyRules] && <Check className="w-3 h-3" />}
                      </div>
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
                {character.modestyRules?.notes && (
                  <div><p className="text-sm text-muted-foreground mb-1">Additional Notes</p><p className="font-medium">{character.modestyRules.notes}</p></div>
                )}
              </div>
            </TabsContent>

            {/* Pose Sheet Tab */}
            <TabsContent value="poses" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">12-Pose Grid</h3>
                  <p className="text-sm text-muted-foreground">Reference sheet for consistent illustrations</p>
                </div>
                {!hasPoseSheet ? (
                  <Button variant="hero" onClick={() => setShowGeneratePoses(true)} disabled={isWorking}>
                    <Sparkles className="w-4 h-4 mr-2" />Generate Poses ({POSE_SHEET_COST} credits)
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setShowGeneratePoses(true)} disabled={isWorking || isLocked}>
                    <RefreshCw className="w-4 h-4 mr-2" />Regenerate
                  </Button>
                )}
              </div>

              {!hasPoseSheet ? (
                <div className="text-center py-12 card-glow">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Pose Sheet Yet</h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    Generate a 12-pose grid to create consistent character illustrations.
                  </p>
                  <Button variant="hero" onClick={() => setShowGeneratePoses(true)} disabled={isWorking}>
                    <Sparkles className="w-4 h-4 mr-2" />Generate 12-Pose Sheet
                  </Button>
                </div>
              ) : (
                <div className="card-glow p-4">
                  {character.poseSheetUrl ? (
                    <img
                      src={character.poseSheetUrl}
                      alt={`${character.name} Pose Sheet`}
                      className="w-full rounded-lg border border-border"
                    />
                  ) : (
                    <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Pose sheet URL not available</p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      This 12-pose grid is used as reference for consistent character illustrations in your books.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Versions Tab */}
            <TabsContent value="versions" className="space-y-6">
              <div className="card-glow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Version History</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      v{character.version || 1}
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
                  {(character.versions || []).length > 0 ? (
                    [...(character.versions || [])].reverse().map((v) => (
                      <div key={v.version} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                          v{v.version}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{v.note}</p>
                          <p className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No previous versions.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Generate Pose Sheet Confirm */}
      <Dialog open={showGeneratePoses} onOpenChange={setShowGeneratePoses}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Pose Sheet</DialogTitle>
            <DialogDescription>
              Generate a 12-pose grid for {character.name}. This costs {POSE_SHEET_COST} credits.
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

      {/* Unlock Modal */}
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
              <Unlock className="w-4 h-4 mr-2" />Unlock Character
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />Delete Character?
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
