import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Globe, Edit, Trash2, BookOpen, Users, Loader2, ArrowLeft, Plus,
  Dna, ChevronRight, Sparkles, BookMarked,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUniverse, useDeleteUniverse } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import { useKnowledgeBases } from "@/hooks/useKnowledgeBase";
import { cn } from "@/lib/utils";

function kbStrength(kb: { islamicValues: unknown[]; duas: unknown[]; vocabulary: unknown[] }) {
  let score = 0;
  if (kb.islamicValues.length > 0) score++;
  if (kb.duas.length > 0) score++;
  if (kb.vocabulary.length > 0) score++;
  if (score === 3) return { label: "Strong", color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score === 2) return { label: "Good", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" };
  if (score === 1) return { label: "Starter", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" };
  return { label: "Empty", color: "text-muted-foreground", bg: "bg-muted/30 border-border" };
}

export default function UniverseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { universe, loading, error } = useUniverse(id);
  const deleteMutation = useDeleteUniverse();
  const { data: characters = [] } = useCharacters(id);
  const { data: kbs = [] } = useKnowledgeBases(id);

  const primaryKb = kbs[0] ?? null;
  const strength = primaryKb ? kbStrength(primaryKb) : null;

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Universe Deleted", description: `"${universe?.name}" has been deleted.` });
      navigate("/app/universes");
    } catch (err) {
      toast({
        title: "Failed to delete universe",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout title="Loading..." subtitle="">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !universe) {
    return (
      <AppLayout title="Error" subtitle="">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || "Universe not found"}</p>
          <Button onClick={() => navigate("/app/universes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back to Universes
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={universe.name}
      subtitle={universe.description || "No description"}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/app/universes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <Button variant="outline" onClick={() => navigate(`/app/universes/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      {/* Book DNA Hierarchy — T-55 */}
      <div className="mb-8 rounded-2xl border border-border bg-card/50 overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Series Architecture</span>
          <span className="text-xs text-muted-foreground ml-1">— how every book stays consistent</span>
        </div>

        <div className="flex items-stretch divide-x divide-border">
          {/* Universe node */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Universe</span>
            </div>
            <p className="font-semibold text-sm truncate">{universe.name}</p>
            {universe.artStyle && (
              <p className="text-xs text-muted-foreground capitalize">{universe.artStyle.replace(/-/g, " ")}</p>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center px-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>

          {/* Book DNA / KB node — visually highlighted */}
          <div className={cn(
            "flex-1 px-5 py-4 flex flex-col gap-1 border-amber-500/20",
            "bg-amber-500/5"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <Dna className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Book DNA</span>
            </div>
            {primaryKb ? (
              <>
                <p className="font-semibold text-sm truncate">{primaryKb.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("text-xs font-medium", strength?.color)}>{strength?.label}</span>
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => {
                      const filled = (primaryKb.islamicValues.length > 0 ? 1 : 0) +
                        (primaryKb.duas.length > 0 ? 1 : 0) +
                        (primaryKb.vocabulary.length > 0 ? 1 : 0);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "w-5 h-1.5 rounded-full",
                            i < filled ? "bg-amber-500" : "bg-muted"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">No Knowledge Base yet</p>
                <Link to={`/app/knowledge-base?universeId=${id}`} className="text-xs text-amber-500 hover:underline mt-0.5">
                  Add Book DNA →
                </Link>
              </>
            )}
          </div>

          {/* Arrow */}
          <div className="flex items-center px-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>

          {/* Characters node */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Characters</span>
            </div>
            <p className="text-2xl font-bold">{characters.length}</p>
            <Link to={`/app/characters/new?universeId=${id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              + Add character
            </Link>
          </div>

          {/* Arrow */}
          <div className="flex items-center px-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
          </div>

          {/* Books node */}
          <div className="flex-1 px-5 py-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <BookMarked className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Books</span>
            </div>
            <p className="text-2xl font-bold">{universe.bookCount ?? 0}</p>
            <Link to="/app/books/new" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              + New book
            </Link>
          </div>
        </div>
      </div>

      <Tabs defaultValue="characters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="characters">Characters ({characters.length})</TabsTrigger>
          <TabsTrigger value="knowledge">
            Book DNA
            {primaryKb && (
              <span className={cn("ml-1.5 text-xs", strength?.color)}>· {strength?.label}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Characters in this universe</h3>
            <Link to={`/app/characters/new?universeId=${id}`}>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />Add Character
              </Button>
            </Link>
          </div>
          {characters.length === 0 ? (
            <div className="text-center py-12 card-glow">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No characters yet in this universe.</p>
              <Link to={`/app/characters/new?universeId=${id}`}>
                <Button variant="hero"><Plus className="w-4 h-4 mr-2" />Create Character</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {characters.map((char) => (
                <Link key={char.id} to={`/app/characters/${char.id}`} className="card-glow overflow-hidden group">
                  <div className="aspect-square bg-gradient-subtle">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold truncate">{char.name}</p>
                    <p className="text-xs text-muted-foreground">{char.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">Book DNA</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your Knowledge Base is the DNA injected into every book — values, du'as, and vocabulary that make each story consistent.
              </p>
            </div>
            <Link to={`/app/knowledge-base?universeId=${id}`}>
              <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Manage</Button>
            </Link>
          </div>
          {kbs.length === 0 ? (
            <div className="text-center py-12 card-glow border-amber-500/20 bg-amber-500/5">
              <Dna className="w-12 h-12 text-amber-500/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-1">No Book DNA yet.</p>
              <p className="text-xs text-muted-foreground mb-4">Add a Knowledge Base to give every book its values, du'as, and vocabulary.</p>
              <Link to={`/app/knowledge-base?universeId=${id}`}>
                <Button variant="outline" className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                  <Dna className="w-4 h-4 mr-2" />Add Book DNA
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {kbs.map((kb) => {
                const s = kbStrength(kb);
                return (
                  <div key={kb.id} className="card-glow p-4 border-amber-500/20 bg-amber-500/5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Dna className="w-4 h-4 text-amber-500" />
                        <p className="font-semibold">{kb.name}</p>
                      </div>
                      <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium", s.bg, s.color)}>
                        {s.label}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center p-2 rounded-lg bg-background/60">
                        <p className="text-lg font-bold text-foreground">{kb.islamicValues.length}</p>
                        <p className="text-xs text-muted-foreground">Values</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-background/60">
                        <p className="text-lg font-bold text-foreground">{kb.duas.length}</p>
                        <p className="text-xs text-muted-foreground">Du'as</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-background/60">
                        <p className="text-lg font-bold text-foreground">{kb.vocabulary.length}</p>
                        <p className="text-xs text-muted-foreground">Vocab</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="card-glow p-6 space-y-4">
            {universe.artStyle && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Art Style</p>
                <Badge variant="secondary" className="capitalize">{universe.artStyle.replace(/-/g, " ")}</Badge>
              </div>
            )}
            {universe.tags?.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {universe.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {universe.seriesBible && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Series Bible</p>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{universe.seriesBible}</p>
              </div>
            )}
            <div className="pt-4 border-t border-border text-sm text-muted-foreground space-y-1">
              <p>Created: {new Date(universe.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(universe.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Universe?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{universe.name}" and all associated data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
