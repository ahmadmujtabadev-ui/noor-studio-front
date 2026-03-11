import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus, Search, Edit, Trash2, BookOpen, Shield, Type, FileText,
  Database, Palette, Settings, MoreVertical, Check, X, Loader2,
} from "lucide-react";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useKnowledgeBases, useCreateKnowledgeBase, useUpdateKnowledgeBase, useDeleteKnowledgeBase,
} from "@/hooks/useKnowledgeBase";
import type { KnowledgeBase } from "@/lib/api/types";
import { useSearchParams } from "react-router-dom";


type KBCategory = "islamicValues" | "duas" | "vocabulary" | "illustrationRules" | "avoidTopics" | "customRules";

const categoryIcons: Record<KBCategory, React.ElementType> = {
  islamicValues: Shield,
  duas: BookOpen,
  vocabulary: Type,
  illustrationRules: Palette,
  avoidTopics: X,
  customRules: Settings,
};

const categoryLabels: Record<KBCategory, string> = {
  islamicValues: "Islamic Values",
  duas: "Duas",
  vocabulary: "Vocabulary",
  illustrationRules: "Illustration Rules",
  avoidTopics: "Avoid Topics",
  customRules: "Custom Rules",
};

const categoryColors: Record<KBCategory, string> = {
  islamicValues: "bg-purple-100 text-purple-600",
  duas: "bg-blue-100 text-blue-600",
  vocabulary: "bg-orange-100 text-orange-600",
  illustrationRules: "bg-teal-100 text-teal-600",
  avoidTopics: "bg-red-100 text-red-600",
  customRules: "bg-gray-100 text-gray-600",
};

const CATEGORIES = Object.keys(categoryIcons) as KBCategory[];

interface KBForm {
  name: string;
  islamicValues: string;
  illustrationRules: string;
  avoidTopics: string;
  customRules: string;
}

const EMPTY_FORM: KBForm = {
  name: "", islamicValues: "", illustrationRules: "", avoidTopics: "", customRules: "",
};

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const { data: kbs = [], isLoading } = useKnowledgeBases();
  const createMutation = useCreateKnowledgeBase();
  const deleteMutation = useDeleteKnowledgeBase();
  const [searchParams] = useSearchParams();
  const universeId = searchParams.get("universeId") || undefined;
  const [search, setSearch] = useState("");
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [activeCategory, setActiveCategory] = useState<KBCategory>("islamicValues");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [form, setForm] = useState<KBForm>(EMPTY_FORM);
  const [newItem, setNewItem] = useState("");

  const updateMutation = useUpdateKnowledgeBase(selectedKB?.id || "");

  const filteredKBs = kbs.filter((kb: KnowledgeBase) =>
    kb.name.toLowerCase().includes(search.toLowerCase())
  );

  const getCategoryItems = (kb: KnowledgeBase, cat: KBCategory): string[] => {
    if (cat === "customRules") return kb.customRules ? [kb.customRules] : [];
    if (cat === "duas") return (kb.duas || []).map((d) => d.transliteration || "");
    if (cat === "vocabulary") return (kb.vocabulary || []).map((v) => `${v.word}: ${v.definition}`);
    return (kb[cat] as string[]) || [];
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    try {
      const created = await createMutation.mutateAsync({
        name: form.name,
        universeId,                // ✅ add this
        islamicValues: form.islamicValues.split("\n").filter(Boolean),
        illustrationRules: form.illustrationRules.split("\n").filter(Boolean),
        avoidTopics: form.avoidTopics.split("\n").filter(Boolean),
        customRules: form.customRules || undefined,
      });
      toast({ title: "Knowledge base created" });
      setShowCreateDialog(false);
      setForm(EMPTY_FORM);
      setSelectedKB(created);
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleAddItem = async () => {
    if (!selectedKB || !newItem.trim() || !activeCategory) return;
    const items = getCategoryItems(selectedKB, activeCategory);
    try {
      let update: Partial<KnowledgeBase>;
      if (activeCategory === "customRules") {
        update = { customRules: newItem };
      } else if (activeCategory === "islamicValues" || activeCategory === "illustrationRules" || activeCategory === "avoidTopics") {
        update = { [activeCategory]: [...items, newItem.trim()] };
      } else {
        // dois / vocabulary - skip for simplicity, show toast
        toast({ title: "Edit this category in settings", variant: "destructive" });
        return;
      }
      const updated = await updateMutation.mutateAsync(update as Parameters<typeof updateMutation.mutateAsync>[0]);
      setSelectedKB(updated);
      setNewItem("");
      toast({ title: "Item added" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleRemoveItem = async (item: string) => {
    if (!selectedKB || !activeCategory) return;
    const items = getCategoryItems(selectedKB, activeCategory);
    try {
      let update: Partial<KnowledgeBase>;
      if (activeCategory === "customRules") {
        update = { customRules: "" };
      } else if (activeCategory === "islamicValues" || activeCategory === "illustrationRules" || activeCategory === "avoidTopics") {
        update = { [activeCategory]: items.filter((i) => i !== item) };
      } else {
        return;
      }
      const updated = await updateMutation.mutateAsync(update as Parameters<typeof updateMutation.mutateAsync>[0]);
      setSelectedKB(updated);
      toast({ title: "Item removed" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedKB?.id === id) setSelectedKB(null);
      setShowDeleteDialog(null);
      toast({ title: "Knowledge base deleted" });
    } catch (err) {
      toast({ title: "Failed", description: (err as Error).message, variant: "destructive" });
    }
  };

  const getCategoryCount = (kb: KnowledgeBase, cat: KBCategory): number =>
    getCategoryItems(kb, cat).length;

  return (
    <AppLayout
      title="Knowledge Base"
      subtitle="Manage Islamic rules, values, and vocabulary for your books"
      actions={
        <Button variant="hero" onClick={() => { setForm(EMPTY_FORM); setShowCreateDialog(true); }}>
          <Plus className="w-4 h-4 mr-2" />New Knowledge Base
        </Button>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* KB List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filteredKBs.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">{search ? "No results." : "No knowledge bases yet."}</p>
              {!search && (
                <Button variant="hero" size="sm" onClick={() => { setForm(EMPTY_FORM); setShowCreateDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />Create First KB
                </Button>
              )}
            </div>
          ) : (
            filteredKBs.map((kb: KnowledgeBase) => (
              <div
                key={kb.id}
                onClick={() => { setSelectedKB(kb); setActiveCategory("islamicValues"); }}
                className={cn(
                  "card-glow p-4 cursor-pointer transition-all",
                  selectedKB?.id === kb.id && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{kb.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {kb.islamicValues.length} values · {kb.duas.length} duas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(kb.id); }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* KB Detail */}
        <div className="lg:col-span-2">
          {!selectedKB ? (
            <div className="card-glow p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
              <Database className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Knowledge Base</h3>
              <p className="text-muted-foreground">
                Choose a knowledge base from the list to view and edit its contents.
              </p>
            </div>
          ) : (
            <div className="card-glow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{selectedKB.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedKB.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = categoryIcons[cat];
                  const count = getCategoryCount(selectedKB, cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        activeCategory === cat
                          ? `${categoryColors[cat]} border border-current/20`
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {categoryLabels[cat]}
                      <span className="ml-1 opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Items */}
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {getCategoryItems(selectedKB, activeCategory).map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-muted/50 group">
                      <p className="text-sm flex-1 pr-2">{item}</p>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {getCategoryItems(selectedKB, activeCategory).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      No {categoryLabels[activeCategory].toLowerCase()} yet.
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Add Item */}
              {activeCategory !== "duas" && activeCategory !== "vocabulary" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Input
                    placeholder={`Add ${categoryLabels[activeCategory].toLowerCase()}...`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleAddItem} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base</DialogTitle>
            <DialogDescription>Set up Islamic rules and vocabulary for AI generation.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="e.g., Main Islamic Rules" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Islamic Values (one per line)</Label>
              <Textarea rows={3} placeholder="Honesty&#10;Kindness&#10;Prayer" value={form.islamicValues} onChange={(e) => setForm({ ...form, islamicValues: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Illustration Rules (one per line)</Label>
              <Textarea rows={2} placeholder="No faces showing emotions&#10;Modest dress always" value={form.illustrationRules} onChange={(e) => setForm({ ...form, illustrationRules: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Avoid Topics (one per line)</Label>
              <Textarea rows={2} placeholder="Violence&#10;Inappropriate relationships" value={form.avoidTopics} onChange={(e) => setForm({ ...form, avoidTopics: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Knowledge Base?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
