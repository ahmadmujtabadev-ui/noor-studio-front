import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { characterTemplatesApi, type CharacterTemplate } from "@/lib/api/characterTemplates.api";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { TemplateDetailModal } from "@/components/shared/TemplateDetailModal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "all",         label: "All",          emoji: "✨" },
  { value: "girl",        label: "Girl",          emoji: "👧" },
  { value: "boy",         label: "Boy",           emoji: "👦" },
  { value: "toddler",     label: "Toddler",       emoji: "🍼" },
  { value: "teen-girl",   label: "Teen Girl",     emoji: "🌸" },
  { value: "teen-boy",    label: "Teen Boy",      emoji: "🌟" },
  { value: "elder-female",label: "Nana / Elder",  emoji: "👵" },
  { value: "elder-male",  label: "Baba / Elder",  emoji: "👴" },
  { value: "animal",      label: "Animal / Pet",  emoji: "🐦" },
];

export default function CharacterTemplatesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CharacterTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["character-templates"],
    queryFn: () => characterTemplatesApi.list(),
  });

  const filtered = templates.filter((t) => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-orange-100 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/characters")}
                className="p-2 rounded-full hover:bg-orange-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-orange-500" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Character Templates
                </h1>
                <p className="text-sm text-gray-500">Pick a template to get started in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9 bg-orange-50 border-orange-200 rounded-full"
                  placeholder="Search templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/app/characters/new?scratch=1")}
                className="shrink-0 border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Start from scratch
              </Button>
            </div>
          </div>

          {/* Category pills */}
          <div className="max-w-6xl mx-auto mt-3 flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                  activeCategory === cat.value
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                )}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-lg font-medium">No templates found</p>
              <p className="text-sm mt-1">Try a different category or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map((tpl) => (
                <TemplateCard
                  key={tpl._id}
                  template={tpl}
                  onClick={() => setSelected(tpl)}
                />
              ))}
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-8">
            {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {selected && (
        <TemplateDetailModal
          template={selected}
          onClose={() => setSelected(null)}
          onUse={(tpl) => {
            navigate("/app/characters/new", {
              state: { fromTemplate: tpl },
            });
          }}
        />
      )}
    </AppLayout>
  );
}
