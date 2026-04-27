import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { characterTemplatesApi, type CharacterTemplate } from "@/lib/api/characterTemplates.api";
import { TemplateCard } from "@/components/shared/TemplateCard";
import { TemplateDetailModal } from "@/components/shared/TemplateDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PrimaryFilterId =
  | "all"
  | "muslim"
  | "universal"
  | "animals"
  | "fantasy"
  | "adventure";

type SecondaryFilterId = CharacterTemplate["category"] | "all";

const STORAGE_KEYS = {
  primary: "ns.characterTemplates.primaryFilter",
  secondary: "ns.characterTemplates.secondaryFilter",
} as const;

const PRIMARY_FILTERS: Array<{
  value: PrimaryFilterId;
  label: string;
  emoji: string;
  helper: string;
}> = [
  { value: "all", label: "All", emoji: "✨", helper: "Balanced mix across the full library" },
  { value: "muslim", label: "Muslim", emoji: "🌙", helper: "Polished Muslim-coded starters" },
  { value: "universal", label: "Universal", emoji: "🌍", helper: "Broader kid-book characters and everyday heroes" },
  { value: "animals", label: "Animals", emoji: "🐾", helper: "Pets and animal protagonists" },
  { value: "fantasy", label: "Fantasy", emoji: "🪄", helper: "Mythic and imaginative characters" },
  { value: "adventure", label: "Adventure", emoji: "🚀", helper: "Pirates, explorers, space kids, and more" },
];

const SECONDARY_FILTERS: Array<{
  value: SecondaryFilterId;
  label: string;
  emoji: string;
}> = [
  { value: "all", label: "All types", emoji: "🗂️" },
  { value: "girl", label: "Girl", emoji: "👧" },
  { value: "boy", label: "Boy", emoji: "👦" },
  { value: "toddler", label: "Toddler", emoji: "🍼" },
  { value: "teen-girl", label: "Teen Girl", emoji: "🌸" },
  { value: "teen-boy", label: "Teen Boy", emoji: "🌟" },
  { value: "elder-female", label: "Nana / Elder", emoji: "👵" },
  { value: "elder-male", label: "Baba / Elder", emoji: "👴" },
  { value: "animal", label: "Animal / Pet", emoji: "🐦" },
];

const HUMAN_CATEGORIES = new Set<CharacterTemplate["category"]>([
  "girl",
  "boy",
  "toddler",
  "teen-girl",
  "teen-boy",
  "elder-female",
  "elder-male",
  "adult-male",
  "adult-female",
]);

const MUSLIM_KEYWORDS = [
  "muslim",
  "islamic",
  "hijab",
  "hijabi",
  "abaya",
  "thobe",
  "jalabiya",
  "kufi",
  "masjid",
  "eid",
  "ramadan",
  "quran",
  "dua",
  "ummah",
  "modest",
];

const UNIVERSAL_KEYWORDS = [
  "universal",
  "global",
  "everyday",
  "school",
  "books",
  "friendship",
  "family",
];

const FANTASY_KEYWORDS = [
  "fantasy",
  "magic",
  "magical",
  "dragon",
  "fairy",
  "unicorn",
  "wizard",
  "myth",
  "mythic",
  "castle",
];

const ADVENTURE_KEYWORDS = [
  "adventure",
  "pirate",
  "space",
  "robot",
  "explorer",
  "explore",
  "astronaut",
  "quest",
  "travel",
  "jungle",
  "discovery",
];

function readStoredFilter<T extends string>(key: string, fallback: T, allowedValues: readonly T[]) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored && allowedValues.includes(stored as T)) {
      return stored as T;
    }
  } catch {
    // Ignore storage errors and fall back to defaults.
  }
  return fallback;
}

function writeStoredFilter(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors.
  }
}

function normalizeText(value?: string | null) {
  return (value || "").toLowerCase().trim();
}

function collectTemplateTokens(template: CharacterTemplate) {
  const visualDNA = template.visualDNA || {};
  return [
    template.name,
    template.description,
    template.role,
    template.ageRange,
    template.category,
    ...(template.tags || []),
    ...(template.traits || []),
    visualDNA.gender,
    visualDNA.ageLook,
    visualDNA.style,
    visualDNA.hijabStyle,
    visualDNA.hijabColor,
    visualDNA.topGarmentType,
    visualDNA.topGarmentDetails,
    visualDNA.accessories?.join(" "),
    visualDNA.paletteNotes,
  ]
    .filter(Boolean)
    .map((value) => normalizeText(String(value)));
}

function hasAnyKeyword(tokens: string[], keywords: string[]) {
  return keywords.some((keyword) => tokens.some((token) => token.includes(keyword)));
}

function isAnimalTemplate(template: CharacterTemplate, tokens: string[]) {
  return template.category === "animal" || hasAnyKeyword(tokens, ["animal", "pet", "rabbit", "cat", "hedgehog", "owl", "fox", "turtle", "bird"]);
}

function isMuslimTemplate(template: CharacterTemplate, tokens: string[]) {
  const visualDNA = template.visualDNA || {};
  return (
    hasAnyKeyword(tokens, MUSLIM_KEYWORDS) ||
    !!visualDNA.hijabStyle ||
    !!visualDNA.hijabColor ||
    !!template.modestyRules?.hijabAlways
  );
}

function isUniversalTemplate(template: CharacterTemplate, tokens: string[]) {
  if (isAnimalTemplate(template, tokens)) return false;
  if (hasAnyKeyword(tokens, UNIVERSAL_KEYWORDS)) return true;
  if (hasAnyKeyword(tokens, FANTASY_KEYWORDS)) return true;
  if (hasAnyKeyword(tokens, ADVENTURE_KEYWORDS)) return true;
  return HUMAN_CATEGORIES.has(template.category) && !isMuslimTemplate(template, tokens);
}

function matchesPrimaryFilter(template: CharacterTemplate, filter: PrimaryFilterId) {
  const tokens = collectTemplateTokens(template);

  switch (filter) {
    case "all":
      return true;
    case "muslim":
      return isMuslimTemplate(template, tokens);
    case "universal":
      return isUniversalTemplate(template, tokens);
    case "animals":
      return isAnimalTemplate(template, tokens);
    case "fantasy":
      return hasAnyKeyword(tokens, FANTASY_KEYWORDS);
    case "adventure":
      return hasAnyKeyword(tokens, ADVENTURE_KEYWORDS);
    default:
      return true;
  }
}

function matchesSearch(template: CharacterTemplate, search: string) {
  const query = normalizeText(search);
  if (!query) return true;

  return collectTemplateTokens(template).some((token) => token.includes(query));
}

function rankTemplateForDefaultView(template: CharacterTemplate) {
  const tokens = collectTemplateTokens(template);
  if (isUniversalTemplate(template, tokens)) return 0;
  if (isMuslimTemplate(template, tokens)) return 1;
  if (isAnimalTemplate(template, tokens)) return 2;
  return 3;
}

function balanceTemplatesForAllView(templates: CharacterTemplate[]) {
  const buckets = new Map<number, CharacterTemplate[]>();

  for (const template of templates) {
    const rank = rankTemplateForDefaultView(template);
    const bucket = buckets.get(rank) || [];
    bucket.push(template);
    buckets.set(rank, bucket);
  }

  for (const bucket of buckets.values()) {
    bucket.sort((a, b) => a.name.localeCompare(b.name));
  }

  const orderedRanks = [0, 1, 2, 3];
  const balanced: CharacterTemplate[] = [];
  let added = true;

  while (added) {
    added = false;
    for (const rank of orderedRanks) {
      const bucket = buckets.get(rank);
      if (bucket && bucket.length > 0) {
        balanced.push(bucket.shift()!);
        added = true;
      }
    }
  }

  return balanced;
}

export default function CharacterTemplatesPage() {
  const navigate = useNavigate();
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilterId>(() =>
    readStoredFilter(
      STORAGE_KEYS.primary,
      "all",
      PRIMARY_FILTERS.map((filter) => filter.value) as readonly PrimaryFilterId[],
    ),
  );
  const [secondaryFilter, setSecondaryFilter] = useState<SecondaryFilterId>(() =>
    readStoredFilter(
      STORAGE_KEYS.secondary,
      "all",
      SECONDARY_FILTERS.map((filter) => filter.value) as readonly SecondaryFilterId[],
    ),
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CharacterTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["character-templates"],
    queryFn: () => characterTemplatesApi.list(),
  });

  useEffect(() => {
    writeStoredFilter(STORAGE_KEYS.primary, primaryFilter);
  }, [primaryFilter]);

  useEffect(() => {
    writeStoredFilter(STORAGE_KEYS.secondary, secondaryFilter);
  }, [secondaryFilter]);

  const activePrimaryMeta = PRIMARY_FILTERS.find((filter) => filter.value === primaryFilter) || PRIMARY_FILTERS[0];

  const filtered = useMemo(() => {
    const narrowed = templates.filter((template) => {
      const matchesPrimary = matchesPrimaryFilter(template, primaryFilter);
      const matchesSecondary =
        secondaryFilter === "all" || template.category === secondaryFilter;
      return matchesPrimary && matchesSecondary && matchesSearch(template, search);
    });

    if (primaryFilter === "all" && secondaryFilter === "all" && !search.trim()) {
      return balanceTemplatesForAllView(narrowed);
    }

    return [...narrowed].sort((a, b) => a.name.localeCompare(b.name));
  }, [primaryFilter, secondaryFilter, search, templates]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <div className="sticky top-0 z-20 border-b border-orange-100 bg-white/90 px-4 py-4 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => navigate("/app/characters")}
                  className="rounded-full p-2 transition-colors hover:bg-orange-50"
                >
                  <ArrowLeft className="h-5 w-5 text-orange-500" />
                </button>
                <div>
                  <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Character Templates
                  </h1>
                  <p className="text-sm text-gray-500">
                    Start from a polished library of Muslim, universal, animal, fantasy, and adventure characters
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <div className="relative w-full sm:min-w-[260px] lg:w-72">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    className="rounded-full border-orange-200 bg-orange-50 pl-9"
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

            <div className="rounded-2xl border border-orange-100 bg-gradient-to-r from-amber-50/90 to-white px-4 py-4 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {PRIMARY_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setPrimaryFilter(filter.value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-all",
                      primaryFilter === filter.value
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-orange-200 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600",
                    )}
                  >
                    <span className="mr-1.5">{filter.emoji}</span>
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{activePrimaryMeta.label}:</span>{" "}
                  {activePrimaryMeta.helper}
                </p>
                <p className="text-xs text-gray-500">
                  Search works inside the active library filter and your selected view is remembered.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {SECONDARY_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSecondaryFilter(filter.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                    secondaryFilter === filter.value
                      ? "border-orange-400 bg-orange-100 text-orange-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600",
                  )}
                >
                  <span className="mr-1.5">{filter.emoji}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl bg-white animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <div className="mb-3 text-5xl">🔍</div>
              <p className="text-lg font-medium">No templates found</p>
              <p className="mt-1 text-sm">Try a different library filter, character type, or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onClick={() => setSelected(template)}
                />
              ))}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      {selected && (
        <TemplateDetailModal
          template={selected}
          onClose={() => setSelected(null)}
          onUse={(template) => {
            navigate("/app/characters/new", {
              state: { fromTemplate: template },
            });
          }}
        />
      )}
    </AppLayout>
  );
}
