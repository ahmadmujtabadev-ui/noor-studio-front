import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Sparkles, Users, Loader2, LayoutGrid, Upload, Check } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useCharacters } from "@/hooks/useCharacters";
import { useToast } from "@/hooks/use-toast";
import { characterTemplatesApi } from "@/lib/api/characterTemplates.api";
import type { CharacterTemplate } from "@/lib/api/characterTemplates.api";
import type { Character } from "@/lib/api/types";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { SubscriptionGateModal } from "@/components/shared/SubscriptionGateModal";

type StatusFilter = "draft" | "approved" | "generated";

const statusColors: Record<string, string> = {
  draft: "bg-gold-100 text-gold-600",
  approved: "bg-teal-100 text-teal-600",
  generated: "bg-blue-100 text-blue-600",
  locked: "bg-muted text-muted-foreground",
};

function deriveCategory(char: Character): CharacterTemplate["category"] {
  const gender = (char.visualDNA?.gender || "").toLowerCase();
  const parts = (char.ageRange || "").split("-");
  const ageLow = parseInt(parts[0]) || 0;

  if (gender === "neutral" || gender === "other") return "animal";
  const isFemale = gender === "female" || gender === "girl";
  if (ageLow > 0 && ageLow <= 5) return "toddler";
  if (ageLow >= 55) return isFemale ? "elder-female" : "elder-male";
  if (ageLow >= 30 && ageLow <= 54) return isFemale ? "adult-female" : "adult-male";
  if (ageLow >= 12 && ageLow <= 17) return isFemale ? "teen-girl" : "teen-boy";
  return isFemale ? "girl" : "boy";
}

export default function CharactersPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  // optimistic published set — chars that were just published this session
  const [localPublished, setLocalPublished] = useState<Set<string>>(new Set());

  const { data: characters = [], isLoading, error } = useCharacters();
  const { canCreateCharacter, limits, usage } = usePlanLimits();

  const handleCreateCharacter = () => {
    if (!canCreateCharacter) {
      setGateOpen(true);
      return;
    }
    navigate("/app/characters/new");
  };

  const filteredCharacters = characters.filter((char: Character) => {
    const matchesSearch =
      char.name.toLowerCase().includes(search.toLowerCase()) ||
      char.role.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || char.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: characters.length,
    draft: characters.filter((c: Character) => c.status === "draft").length,
    approved: characters.filter((c: Character) => c.status === "approved").length,
    generated: characters.filter((c: Character) => c.status === "generated").length,
  };

  const handlePublish = async (e: React.MouseEvent, char: Character) => {
    e.preventDefault();
    e.stopPropagation();
    const charId = (char.id || char._id || "") as string;
    if (publishingId || localPublished.has(charId) || char.publishedAsTemplateId) return;

    setPublishingId(charId);
    try {
      await characterTemplatesApi.save({
        name: char.name,
        description: `${char.role} character — ${char.ageRange || ""}`.trim().replace(/—\s*$/, ""),
        category: deriveCategory(char),
        characterId: charId,
        isPublic: true,
      });
      setLocalPublished((prev) => new Set([...prev, charId]));
      queryClient.invalidateQueries({ queryKey: ["characters"] });
      queryClient.invalidateQueries({ queryKey: ["character-templates"] });
      toast({ title: "Published to templates!", description: `${char.name} is now in the shared template library.` });
    } catch {
      toast({ title: "Failed to publish", variant: "destructive" });
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <>
    <SubscriptionGateModal
      open={gateOpen}
      onOpenChange={setGateOpen}
      workflow="character"
      reason="limit"
      usageInfo={{ used: usage.characters, limit: limits.characters, label: "characters" }}
    />
    <AppLayout
      title="Character Studio"
      subtitle="Create and manage characters with consistent visual DNA and pose prompts"
      actions={
        <div className="flex items-center gap-2">
          <Link to="/app/character-templates">
            <Button variant="outline" size="default">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </Link>
          <Button variant="hero" size="default" onClick={handleCreateCharacter}>
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </div>
      }
    >
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search characters by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {(["all", "draft", "generated", "approved"] as const).map((status) => (
            <Button
              key={status}
              variant={
                statusFilter === status || (status === "all" && !statusFilter)
                  ? "default"
                  : "outline"
              }
              size="sm"
              onClick={() => setStatusFilter(status === "all" ? null : (status as StatusFilter))}
              className="capitalize"
            >
              {status}
              <span className="ml-1.5 text-xs opacity-70">
                ({status === "all" ? statusCounts.all : statusCounts[status]})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{(error as Error).message}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {!isLoading && !error && characters.length === 0 && (
        <div className="text-center py-16 card-glow">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Characters Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create your first character with detailed visual DNA and reusable pose prompts.
          </p>
          <Button variant="hero" onClick={handleCreateCharacter}>
            <Plus className="w-4 h-4 mr-2" />
            Create Character
          </Button>
        </div>
      )}

      {!isLoading && !error && characters.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCharacters.map((char: Character) => {
            const charId = (char.id || char._id || "") as string;
            const approvedPoses = (char.approvedPoseKeys || []).length;
            const isPublished = !!char.publishedAsTemplateId || localPublished.has(charId);
            const isPublishing = publishingId === charId;
            const canPublish = !!char.imageUrl;

            return (
              <div
                key={charId}
                className="card-glow overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                onClick={() => navigate(`/app/characters/${charId}`)}
              >
                <div className="aspect-square bg-gradient-subtle relative overflow-hidden">
                  {char.imageUrl ? (
                    <img
                      src={char.imageUrl}
                      alt={char.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}

                  <Badge
                    className={cn(
                      "absolute top-3 right-3",
                      statusColors[char.status] || statusColors.draft
                    )}
                  >
                    {char.status}
                  </Badge>

                  {!!char.poseSheetUrl && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-black/50 text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {approvedPoses} poses
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="font-semibold text-foreground mb-0.5 truncate">{char.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{char.role}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {char.ageRange}
                    </span>
                    {char.visualDNA?.style && (
                      <span className="text-xs text-muted-foreground">
                        {char.visualDNA.style}
                      </span>
                    )}
                  </div>

                  {canPublish && (
                    <button
                      onClick={(e) => handlePublish(e, char)}
                      disabled={isPublished || isPublishing}
                      className={cn(
                        "mt-auto w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 px-2 rounded-lg border transition-all",
                        isPublished
                          ? "bg-teal-50 border-teal-200 text-teal-700 cursor-default"
                          : "bg-white border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400"
                      )}
                    >
                      {isPublishing ? (
                        <><Loader2 className="w-3 h-3 animate-spin" /> Publishing…</>
                      ) : isPublished ? (
                        <><Check className="w-3 h-3" /> Published</>
                      ) : (
                        <><Upload className="w-3 h-3" /> Publish to Template</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && characters.length > 0 && filteredCharacters.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No characters match your search.</p>
          <Button variant="outline" onClick={() => { setSearch(""); setStatusFilter(null); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </AppLayout>
    </>
  );
}
