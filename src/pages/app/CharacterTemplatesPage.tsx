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

type AnimalSpeciesFilterId =
  | "rabbit"
  | "cat"
  | "hedgehog"
  | "owl"
  | "fox"
  | "turtle";

type SecondaryFilterId = CharacterTemplate["category"] | "all" | AnimalSpeciesFilterId;

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

const ANIMAL_SECONDARY_FILTERS: Array<{
  value: SecondaryFilterId;
  label: string;
  emoji: string;
}> = [
  { value: "all", label: "All animals", emoji: "\u{1F43E}" },
  { value: "rabbit", label: "Rabbit", emoji: "\u{1F430}" },
  { value: "cat", label: "Cat", emoji: "\u{1F431}" },
  { value: "hedgehog", label: "Hedgehog", emoji: "\u{1F994}" },
  { value: "owl", label: "Owl", emoji: "\u{1F989}" },
  { value: "fox", label: "Fox", emoji: "\u{1F98A}" },
  { value: "turtle", label: "Turtle", emoji: "\u{1F422}" },
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

const BUILT_IN_ANIMAL_TEMPLATES: CharacterTemplate[] = [
  // {
  //   _id: "builtin-animal-rabbit-safa",
  //   name: "Safa - Gentle Rabbit",
  //   description: "A kind rabbit protagonist for cozy woodland stories and friendship adventures.",
  //   category: "animal",
  //   thumbnailUrl: "",
  //   tags: ["animals", "rabbit", "woodland", "gentle", "universal"],
  //   isDefault: true,
  //   isPublic: true,
  //   role: "main",
  //   ageRange: "6-8",
  //   traits: ["gentle", "curious", "kind"],
  //   visualDNA: {
  //     style: "storybook",
  //     gender: "animal",
  //     ageLook: "small rabbit child",
  //     skinTone: "cream fur with soft beige ears",
  //     eyeColor: "brown",
  //     hairStyle: "fur",
  //     hairColor: "cream",
  //     topGarmentType: "cozy cardigan",
  //     topGarmentColor: "sage green",
  //     bottomGarmentType: "short overalls",
  //     bottomGarmentColor: "warm beige",
  //     shoeType: "none",
  //     bodyBuild: "small and soft",
  //     heightFeel: "small",
  //     paletteNotes: "Cream, sage, and warm woodland neutrals",
  //     accessories: ["tiny satchel"],
  //   },
  //   modestyRules: {},
  //   palettePreview: { primary: "#F7E7CE", secondary: "#8FAF88", accent: "#C8A97B" },
  // },
  {
    _id: "builtin-animal-cat-luna",
    name: "Luna - White Cat",
    description: "A polished cat character suited for modern family stories and school-day books.",
    category: "animal",
    thumbnailUrl: "",
    tags: ["animals", "cat", "pet", "school", "universal"],
    isDefault: true,
    isPublic: true,
    role: "main",
    ageRange: "7-9",
    traits: ["clever", "playful", "caring"],
    visualDNA: {
      style: "pixar-3d",
      gender: "animal",
      ageLook: "young white cat",
      skinTone: "snow white fur with peach ears",
      eyeColor: "hazel",
      hairStyle: "fur",
      hairColor: "white",
      topGarmentType: "hoodie",
      topGarmentColor: "coral pink",
      bottomGarmentType: "soft trousers",
      bottomGarmentColor: "cream",
      shoeType: "sneakers",
      shoeColor: "white",
      bodyBuild: "small and lean",
      heightFeel: "small",
      paletteNotes: "Soft white, coral, and warm cream",
      accessories: ["school backpack"],
    },
    modestyRules: {},
    palettePreview: { primary: "#FAF9F6", secondary: "#F59E8B", accent: "#F4E1C1" },
  },
  // {
  //   _id: "builtin-animal-hedgehog-theo",
  //   name: "Theo - Hedgehog",
  //   description: "A tiny hedgehog companion for forest stories, bedtime tales, and quiet courage arcs.",
  //   category: "animal",
  //   thumbnailUrl: "",
  //   tags: ["animals", "hedgehog", "forest", "supporting", "universal"],
  //   isDefault: true,
  //   isPublic: true,
  //   role: "supporting",
  //   ageRange: "5-7",
  //   traits: ["brave", "tiny", "loyal"],
  //   visualDNA: {
  //     style: "storybook",
  //     gender: "animal",
  //     ageLook: "tiny hedgehog child",
  //     skinTone: "forest brown fur with cream face",
  //     eyeColor: "brown",
  //     hairStyle: "spikes on head",
  //     hairColor: "brown",
  //     topGarmentType: "knit scarf",
  //     topGarmentColor: "forest green",
  //     bodyBuild: "tiny and round",
  //     heightFeel: "very small",
  //     paletteNotes: "Forest green, chestnut brown, and soft cream",
  //     accessories: ["leaf satchel"],
  //   },
  //   modestyRules: {},
  //   palettePreview: { primary: "#7B4020", secondary: "#4CAF50", accent: "#F5E6C8" },
  // },
  // {
  //   _id: "builtin-animal-fox-zayd",
  //   name: "Zayd - Clever Fox",
  //   description: "A bright fox adventurer for travel stories, mysteries, and playful outdoor quests.",
  //   category: "animal",
  //   thumbnailUrl: "",
  //   tags: ["animals", "fox", "adventure", "clever", "outdoors"],
  //   isDefault: true,
  //   isPublic: true,
  //   role: "main",
  //   ageRange: "8-10",
  //   traits: ["clever", "quick", "adventurous"],
  //   visualDNA: {
  //     style: "flat-illustration",
  //     gender: "animal",
  //     ageLook: "young fox explorer",
  //     skinTone: "rust orange fur with white chest",
  //     eyeColor: "green",
  //     hairStyle: "fur",
  //     hairColor: "orange",
  //     topGarmentType: "explorer vest",
  //     topGarmentColor: "mustard yellow",
  //     bottomGarmentType: "adventure shorts",
  //     bottomGarmentColor: "brown",
  //     shoeType: "boots",
  //     shoeColor: "brown",
  //     bodyBuild: "small and athletic",
  //     heightFeel: "small",
  //     paletteNotes: "Rust orange, mustard, and bark brown",
  //     accessories: ["compass pouch"],
  //   },
  //   modestyRules: {},
  //   palettePreview: { primary: "#D97706", secondary: "#FACC15", accent: "#7B4020" },
  // },
  // {
  //   _id: "builtin-animal-turtle-sabr",
  //   name: "Sabr - Patient Turtle",
  //   description: "A steady turtle friend for value-led stories about patience, kindness, and gentle growth.",
  //   category: "animal",
  //   thumbnailUrl: "",
  //   tags: ["animals", "turtle", "patience", "garden", "universal"],
  //   isDefault: true,
  //   isPublic: true,
  //   role: "supporting",
  //   ageRange: "6-8",
  //   traits: ["patient", "steady", "kind"],
  //   visualDNA: {
  //     style: "storybook",
  //     gender: "animal",
  //     ageLook: "small turtle child",
  //     skinTone: "soft green shell creature with tan shell",
  //     eyeColor: "dark-brown",
  //     hairStyle: "none",
  //     hairColor: "green",
  //     topGarmentType: "light scarf",
  //     topGarmentColor: "sunny yellow",
  //     bodyBuild: "small and round",
  //     heightFeel: "very small",
  //     paletteNotes: "Soft green, shell tan, and sunny yellow",
  //     accessories: ["garden satchel"],
  //   },
  //   modestyRules: {},
  //   palettePreview: { primary: "#7FB77E", secondary: "#C8A97B", accent: "#FACC15" },
  // },
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

function normalizeTemplateName(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, " ").trim();
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

function isAnimalTemplate(template: CharacterTemplate) {
  return template.category === "animal";
}

function getAnimalSpecies(template: CharacterTemplate): AnimalSpeciesFilterId | null {
  if (!isAnimalTemplate(template)) return null;
  const tokens = collectTemplateTokens(template);
  const species: AnimalSpeciesFilterId[] = ["rabbit", "cat", "hedgehog", "owl", "fox", "turtle"];
  return species.find((entry) => tokens.some((token) => token.includes(entry))) || null;
}

function mergeTemplatesWithBuiltIns(templates: CharacterTemplate[]) {
  const seen = new Set(templates.map((template) => normalizeTemplateName(template.name)));
  const extras = BUILT_IN_ANIMAL_TEMPLATES.filter(
    (template) => !seen.has(normalizeTemplateName(template.name)),
  );
  return [...templates, ...extras];
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
  if (isAnimalTemplate(template)) return false;
  if (hasAnyKeyword(tokens, UNIVERSAL_KEYWORDS)) return true;
  const tagTokens = (template.tags || []).map((t) => normalizeText(t));
  if (hasAnyKeyword(tagTokens, FANTASY_KEYWORDS)) return true;
  if (hasAnyKeyword(tagTokens, ADVENTURE_KEYWORDS)) return true;
  return HUMAN_CATEGORIES.has(template.category) && !isMuslimTemplate(template, tokens);
}

function matchesPrimaryFilter(template: CharacterTemplate, filter: PrimaryFilterId) {
  const tokens = collectTemplateTokens(template);
  // For Fantasy and Adventure, only match on tags — not descriptions — to avoid false positives
  const tagTokens = (template.tags || []).map((t) => normalizeText(t));

  switch (filter) {
    case "all":
      return true;
    case "muslim":
      return isMuslimTemplate(template, tokens);
    case "universal":
      return isUniversalTemplate(template, tokens);
    case "animals":
      return isAnimalTemplate(template);
    case "fantasy":
      return !isAnimalTemplate(template) && hasAnyKeyword(tagTokens, FANTASY_KEYWORDS);
    case "adventure":
      return !isAnimalTemplate(template) && hasAnyKeyword(tagTokens, ADVENTURE_KEYWORDS);
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
  if (isAnimalTemplate(template)) return 2;
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
      [...SECONDARY_FILTERS, ...ANIMAL_SECONDARY_FILTERS].map((filter) => filter.value) as readonly SecondaryFilterId[],
    ),
  );
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CharacterTemplate | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["character-templates"],
    queryFn: () => characterTemplatesApi.list(),
  });

  const allTemplates = useMemo(() => mergeTemplatesWithBuiltIns(templates), [templates]);
  const activeSecondaryFilters = primaryFilter === "animals" ? ANIMAL_SECONDARY_FILTERS : SECONDARY_FILTERS;

  useEffect(() => {
    const allowedValues = new Set(activeSecondaryFilters.map((filter) => filter.value));
    if (!allowedValues.has(secondaryFilter)) {
      setSecondaryFilter("all");
    }
  }, [activeSecondaryFilters, secondaryFilter]);

  useEffect(() => {
    writeStoredFilter(STORAGE_KEYS.primary, primaryFilter);
  }, [primaryFilter]);

  useEffect(() => {
    writeStoredFilter(STORAGE_KEYS.secondary, secondaryFilter);
  }, [secondaryFilter]);

  const activePrimaryMeta = PRIMARY_FILTERS.find((filter) => filter.value === primaryFilter) || PRIMARY_FILTERS[0];

  const filtered = useMemo(() => {
    const narrowed = allTemplates.filter((template) => {
      const matchesPrimary = matchesPrimaryFilter(template, primaryFilter);
      const matchesSecondary = (() => {
        if (secondaryFilter === "all") return true;
        if (primaryFilter === "animals") return getAnimalSpecies(template) === secondaryFilter;
        return template.category === secondaryFilter;
      })();
      return matchesPrimary && matchesSecondary && matchesSearch(template, search);
    });

    if (primaryFilter === "all" && secondaryFilter === "all" && !search.trim()) {
      return balanceTemplatesForAllView(narrowed);
    }

    return [...narrowed].sort((a, b) => a.name.localeCompare(b.name));
  }, [allTemplates, primaryFilter, secondaryFilter, search]);

  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex w-full flex-col gap-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => navigate("/app/characters")}
                  className="rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-slate-50"
                  aria-label="Back to characters"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <div>
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-950">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Character Templates
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Start from a polished library of Muslim, universal, animal, fantasy, and adventure characters
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                <div className="relative w-full sm:min-w-[340px] xl:w-[420px]">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-lg border-slate-200 bg-white pl-9 shadow-sm focus-visible:ring-primary/25"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/app/characters/new?scratch=1")}
                  className="h-11 shrink-0 rounded-lg border-slate-300 px-5 text-slate-700 hover:bg-slate-50"
                >
                  Start from scratch
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap gap-2">
                {PRIMARY_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setPrimaryFilter(filter.value)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm font-semibold transition-all",
                      primaryFilter === filter.value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary/35 hover:text-primary",
                    )}
                  >
                    <span className="mr-1.5">{filter.emoji}</span>
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-950">{activePrimaryMeta.label}:</span>{" "}
                  {activePrimaryMeta.helper}
                </p>
                <p className="text-xs font-medium text-slate-500">
                  {filtered.length} template{filtered.length !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeSecondaryFilters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSecondaryFilter(filter.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    secondaryFilter === filter.value
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary",
                  )}
                >
                  <span className="mr-1.5">{filter.emoji}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full px-6 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-80 rounded-lg border border-slate-200 bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 py-20 text-center text-slate-400">
              <div className="mb-3 text-5xl">🔍</div>
              <p className="text-lg font-medium">No templates found</p>
              <p className="mt-1 text-sm">Try a different library filter, character type, or search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
              {filtered.map((template) => (
                <TemplateCard
                  key={template._id}
                  template={template}
                  onClick={() => setSelected(template)}
                />
              ))}
            </div>
          )}
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
