import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Globe, Edit, Trash2, BookOpen, Users, Loader2, ArrowLeft, Plus,
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

export default function UniverseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { universe, loading, error } = useUniverse(id);
  const deleteMutation = useDeleteUniverse();
  const { data: characters = [] } = useCharacters(id);
  const { data: kbs = [] } = useKnowledgeBases(id);

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
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card-glow p-4 text-center">
          <p className="text-2xl font-bold text-primary">{characters.length}</p>
          <p className="text-sm text-muted-foreground">Characters</p>
        </div>
        <div className="card-glow p-4 text-center">
          <p className="text-2xl font-bold text-primary">{kbs.length}</p>
          <p className="text-sm text-muted-foreground">Knowledge Bases</p>
        </div>
        <div className="card-glow p-4 text-center">
          <p className="text-2xl font-bold text-primary">{universe.bookCount ?? 0}</p>
          <p className="text-sm text-muted-foreground">Books</p>
        </div>
      </div>

      <Tabs defaultValue="characters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="characters">Characters</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Bases</TabsTrigger>
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
            <h3 className="font-semibold">Knowledge Bases</h3>
            <Link to={`/app/knowledge-base?universeId=${id}`}>
              <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-2" />Manage</Button>
            </Link>
          </div>
          {kbs.length === 0 ? (
            <div className="text-center py-12 card-glow">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No knowledge bases for this universe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {kbs.map((kb) => (
                <div key={kb.id} className="card-glow p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{kb.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {kb.islamicValues.length} values · {kb.duas.length} duas · {kb.vocabulary.length} vocab
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              ))}
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
