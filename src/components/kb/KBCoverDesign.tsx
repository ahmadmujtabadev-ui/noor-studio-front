import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Frame, Plus, User, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  COVER_TEMPLATE_SVG_MAP,
  COVER_TEMPLATE_PNG_MAP,
} from "@/components/shared/CoverTemplateSvgs";
import { useCoverTemplates } from "@/hooks/useKnowledgeBase";
import { useCharacters } from "@/hooks/useCharacters";

// ─── Per-template field defaults ──────────────────────────────────────────────
const TEMPLATE_FIELD_DEFAULTS: Record<
  string,
  {
    moodTheme: string;
    colorStyle: string;
    typographyTitle: string;
    typographyBody: string;
    lightingEffects: string;
    foregroundLayer: string;
    midgroundLayer: string;
    backgroundLayer: string;
    mainVisualConcept: string;
    characterDescription: string;
    atmosphereMiddleGrade: string;
    atmosphereJunior: string;
    islamicMotifs: string[];
  }
> = {
  ct_classic_children: {
    moodTheme: "Bright, joyful, children's adventure — safe and exciting",
    colorStyle: "Vibrant warm yellows, oranges, sky blue — high saturation",
    typographyTitle: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    typographyBody: "Friendly rounded sans-serif",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Expressive cheerful child character",
    midgroundLayer: "Colorful simple shapes, playful floating elements",
    backgroundLayer: "Big expressive sunny sky, rolling hills or colorful landscape",
    mainVisualConcept:
      "Bright sunlit outdoor scene with a cheerful Muslim child exploring a colorful world",
    characterDescription:
      "Expressive cheerful child, bright clothing, warm smile, dynamic pose",
    atmosphereMiddleGrade:
      "Bright joyful sunshine, safe familiar world, vibrant warm colors",
    atmosphereJunior:
      "Bright joyful sunshine, warm golden light, safe and exciting",
    islamicMotifs: [],
  },
  ct_epic_cinematic: {
    moodTheme: "Epic, dramatic, cinematic fantasy adventure",
    colorStyle: "Dark midnight blue and deep purple with red accent glow",
    typographyTitle: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    typographyBody: "Clean condensed serif for readability",
    lightingEffects:
      "Dramatic rim lighting, volumetric fog, cinematic purple dusk sky",
    foregroundLayer: "Silhouetted hero character with dramatic edge lighting",
    midgroundLayer: "Epic dramatic landscape, ruins or rocky terrain",
    backgroundLayer:
      "Vast dramatic dark sky, atmospheric fog depth, epic scale environment",
    mainVisualConcept:
      "Silhouetted hero standing in dramatic cinematic landscape at dusk with glowing title zone sky",
    characterDescription:
      "Hero silhouetted or edge-lit, dramatic pose, sense of determination and scale",
    atmosphereMiddleGrade:
      "Cinematic dramatic lighting, purple dusk sky, atmospheric fog depth, epic scale",
    atmosphereJunior:
      "Dramatic but exciting adventure, colorful sky accent, bold and empowering",
    islamicMotifs: [],
  },
  ct_islamic_heritage: {
    moodTheme: "Islamic cultural heritage, dignified, spiritual",
    colorStyle: "Rich teal and warm gold — navy, amber, emerald and cream",
    typographyTitle:
      "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant",
    typographyBody: "Elegant calligraphic-feel serif",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Character framed by Islamic arch or geometric environment",
    midgroundLayer: "Mosque courtyard or Islamic architectural environment",
    backgroundLayer:
      "Crescent moon in sky, decorative architectural depth, warm golden horizon",
    mainVisualConcept:
      "Character standing in front of ornate Islamic arch with mosque and crescent moon in warm golden light",
    characterDescription:
      "Character in traditional Islamic attire, dignified and curious pose, viewed from behind or profile",
    atmosphereMiddleGrade:
      "Warm golden hour, dignified and rich, Islamic cultural heritage feel",
    atmosphereJunior:
      "Warm bright Islamic scene, colorful geometric patterns, welcoming and proud",
    islamicMotifs: [
      "Arabesque geometric border",
      "Crescent moon",
      "Mosque silhouette",
      "Islamic arch",
    ],
  },
  ct_vintage_ornate: {
    moodTheme: "Dark, mysterious, atmospheric, wonder-filled",
    colorStyle: "Warm amber, gold, chocolate brown, cream — antique palette",
    typographyTitle: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    typographyBody: "Classical serif with ornate character",
    lightingEffects:
      "Warm candlelight glow, intimate amber radiance in darkness",
    foregroundLayer: "Character in formal symmetrical pose, ornamental setting",
    midgroundLayer:
      "Richly decorated classical environment with gold inlay detail",
    backgroundLayer: "Dark rich layered background, heraldic and dignified depth",
    mainVisualConcept:
      "Classical illustrated scene with formal symmetrical layout, warm candlelit environment and ornate gold details",
    characterDescription:
      "Character in classical dignified pose, ornate surroundings, collector's edition feel",
    atmosphereMiddleGrade:
      "Rich dark classical, candlelight warmth, prestigious antique collector's edition feel",
    atmosphereJunior:
      "Warm golden treasure hunt feel, exciting mysterious discovery",
    islamicMotifs: [
      "Ornamental gold border",
      "Classical Islamic geometric inlay",
    ],
  },
  ct_modern_minimal: {
    moodTheme: "Contemporary, clean, minimal, sophisticated and modern",
    colorStyle: "Clean off-white background, single near-black geometric shape, warm orange accent — minimal restrained palette with maximum negative space",
    typographyTitle: "Modern geometric sans-serif — Futura, Montserrat, Gill Sans",
    typographyBody: "Clean geometric sans-serif, maximum legibility",
    lightingEffects: "",
    foregroundLayer: "Character as clean minimal graphic element, maximum negative space surrounding them",
    midgroundLayer: "Single large bold geometric shape (circle, arc, or abstract brushstroke) as dominant focal element",
    backgroundLayer: "Clean off-white or pale background, absolute minimum visual elements, Scandinavian design aesthetic",
    mainVisualConcept:
      "Single large geometric arc or circle dominates the cover, character as minimal clean focal point, clean off-white background, maximum breathing room — Scandinavian poster design aesthetic",
    characterDescription:
      "Character as minimal graphical element, clean restrained pose, surrounded by generous negative space",
    atmosphereMiddleGrade:
      "Clean contemporary, sophisticated simplicity, strong visual tension through negative space",
    atmosphereJunior:
      "Bold clean geometric shapes, warm orange accent, modern and approachable",
    islamicMotifs: [],
  },
  ct_watercolor_dream: {
    moodTheme: "Cozy, warm, intimate, safe and inviting",
    colorStyle: "Soft pastel watercolor — blush, sage green, lavender, cream",
    typographyTitle: "Handwritten organic — Caveat, Pacifico, Sacramento",
    typographyBody: "Soft organic handwritten feel",
    lightingEffects: "",
    foregroundLayer:
      "Character gently surrounded by flowing botanical watercolor elements",
    midgroundLayer:
      "Botanical elements — leaves, flowers, olive branches softly painted",
    backgroundLayer:
      "Warm cream or blush background, soft watercolor washes, visible brushstroke texture",
    mainVisualConcept:
      "Dreamy soft watercolor scene with child surrounded by botanical painted nature elements, warm cream background",
    characterDescription:
      "Gentle soft child character in flowing clothes, dreamy expression, surrounded by flowers and leaves",
    atmosphereMiddleGrade:
      "Dreamy soft pastels, gentle whimsy, handcrafted warmth, magical and safe",
    atmosphereJunior:
      "Soft dreamy pastels, magical garden, watercolor warmth and safety",
    islamicMotifs: ["Soft floral arabesque", "Olive branch motif"],
  },
  ct_night_sky: {
    moodTheme: "Islamic cultural heritage, dignified, spiritual",
    colorStyle: "Dark midnight blue and deep purple with red accent glow",
    typographyTitle:
      "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant",
    typographyBody: "Elegant refined serif with luminous quality",
    lightingEffects: "Cool moonlight, pale silver-blue glow, magical night",
    foregroundLayer: "Character in lower third, gazing upward at sky",
    midgroundLayer:
      "Distant mosque silhouette or minaret glowing warmly at horizon",
    backgroundLayer:
      "Vast starry midnight sky with galaxy texture, prominent glowing crescent moon",
    mainVisualConcept:
      "Child looking up at vast starry night sky with glowing crescent moon and distant mosque silhouette at golden horizon",
    characterDescription:
      "Child in awe, looking upward, silhouetted against glowing horizon, sense of wonder and faith",
    atmosphereMiddleGrade:
      "Magical night, deep cool blues and purples, warm gold glow, mystical and awe-inspiring",
    atmosphereJunior:
      "Magical sparkling night, glowing crescent moon, sense of wonder and discovery",
    islamicMotifs: [
      "Crescent moon prominent",
      "Mosque minaret silhouette",
      "Starfield",
      "Golden glowing horizon",
    ],
  },
  ct_storybook_warm: {
    moodTheme: "Cozy, warm, intimate, safe and inviting",
    colorStyle: "Warm amber, gold, chocolate brown, cream — antique palette",
    typographyTitle: "Handwritten organic — Caveat, Pacifico, Sacramento",
    typographyBody: "Warm readable serif, classic picture book feel",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Friendly trusted character in warm lit scene",
    midgroundLayer:
      "Cozy environmental storytelling elements — leaves, stars, vines",
    backgroundLayer:
      "Warm sunset or firelit environment, illustrated botanical nature elements",
    mainVisualConcept:
      "Cozy richly illustrated scene with child character in warm golden firelit environment surrounded by nature",
    characterDescription:
      "Warm friendly child character, inviting expression, as if welcoming the reader into their world",
    atmosphereMiddleGrade:
      "Warm cozy golden firelight, inviting classic storybook mood, safe and enchanting",
    atmosphereJunior:
      "Cozy warm golden light, friendly and safe, classic picture book warmth",
    islamicMotifs: ["Subtle star and crescent", "Natural organic elements"],
  },
  ct_bold_typography: {
    moodTheme: "Contemporary, clean, minimal, bold and modern",
    colorStyle: "High contrast — off-white, bold black shapes, bold red accent",
    typographyTitle: "Ultra-bold display — Anton, Bebas Neue, Impact",
    typographyBody: "Strong condensed sans-serif for maximum impact",
    lightingEffects: "",
    foregroundLayer:
      "Character integrated as graphic element within bold composition",
    midgroundLayer:
      "Strong color blocks, bold diagonal shapes or pattern as texture",
    backgroundLayer:
      "Strong 2-3 color block background, graphic design poster aesthetic",
    mainVisualConcept:
      "Bold graphic design poster composition with strong color blocking, character as graphic element, powerful visual impact",
    characterDescription:
      "Character rendered graphically, integrated into bold composition rather than placed in front of scene",
    atmosphereMiddleGrade:
      "Bold graphic power, high contrast, contemporary editorial, confident and striking",
    atmosphereJunior:
      "Bold exciting colors, strong shapes, high energy and confidence",
    islamicMotifs: [],
  },
  ct_nature_adventure: {
    moodTheme: "Adventure, discovery, lush nature and exploration",
    colorStyle: "Vibrant warm yellows, oranges, sky blue — high saturation",
    typographyTitle: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    typographyBody: "Clean friendly adventurous sans-serif",
    lightingEffects:
      "Dappled golden sunlight filtering through forest leaves",
    foregroundLayer:
      "Character in dynamic outdoor action pose, exploring nature",
    midgroundLayer:
      "Rich botanical environment, layered foliage, flowers and vines",
    backgroundLayer:
      "Deep forest or garden landscape, sky visible through canopy",
    mainVisualConcept:
      "Lush green forest or garden with Muslim child explorer in dynamic action pose, dappled golden sunlight, rich botanical depth",
    characterDescription:
      "Active adventurous child, explorer pose, surrounded by lush nature elements, sense of discovery",
    atmosphereMiddleGrade:
      "Vibrant lush green nature, warm sunshine dappling through foliage, adventure and discovery",
    atmosphereJunior:
      "Bright colorful garden adventure, magical nature, exciting and welcoming",
    islamicMotifs: [
      "Olive branch",
      "Garden of paradise motif",
      "Natural Islamic geometry",
    ],
  },
};

// ─── Helpers for matched back/spine generation ────────────────────────────────
type FrontTemplateKey = keyof typeof TEMPLATE_FIELD_DEFAULTS;

function titleCase(value: string) {
  return value
    .replace(/^ct_/, "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildMatchingBackPrompt(frontKey: FrontTemplateKey) {
  const t = TEMPLATE_FIELD_DEFAULTS[frontKey];

  return `
MATCHING BACK COVER — ${titleCase(frontKey).toUpperCase()}:
Create a portrait BOOK BACK COVER that perfectly matches the selected front cover design.

MATCHING RULES:
- same visual family as the front cover
- same mood/theme: ${t.moodTheme}
- same color style: ${t.colorStyle}
- same title typography direction: ${t.typographyTitle}
- same body typography direction: ${t.typographyBody}
- same lighting mood: ${t.lightingEffects || "clean graphic lighting"}
- same foreground language: ${t.foregroundLayer}
- same midground language: ${t.midgroundLayer}
- same background language: ${t.backgroundLayer}
- same motifs: ${t.islamicMotifs.join(", ") || "none"}

DESIGN REQUIREMENTS:
- readable centered blurb area integrated into the design
- matching ornamental / graphic / painterly treatment from the front cover
- premium bookstore-ready composition
- barcode placeholder area near bottom
- no dominant front-cover title repeated on back
- clean hierarchy, good print composition, visually cohesive with front cover
`.trim();
}

function buildMatchingSpinePrompt(frontKey: FrontTemplateKey) {
  const t = TEMPLATE_FIELD_DEFAULTS[frontKey];

  return `
MATCHING SPINE — ${titleCase(frontKey).toUpperCase()}:
Create a clean vertical BOOK SPINE that perfectly matches the selected front cover design.

MATCHING RULES:
- same visual family as the front cover
- same mood/theme: ${t.moodTheme}
- same color style: ${t.colorStyle}
- same typography direction: ${t.typographyTitle}
- same motif language: ${t.islamicMotifs.join(", ") || "none"}

DESIGN REQUIREMENTS:
- highly readable vertical title
- visually connected to front and back cover
- premium print-ready appearance
- subtle decorative accents only when appropriate
- no clutter
`.trim();
}

function buildSpineBackground(frontKey: FrontTemplateKey) {
  const t = TEMPLATE_FIELD_DEFAULTS[frontKey];
  return t.colorStyle;
}

function buildSpineTypography(frontKey: FrontTemplateKey) {
  const t = TEMPLATE_FIELD_DEFAULTS[frontKey];
  return `${t.typographyTitle}, vertical spine orientation`;
}

function buildBackBackgroundStyle(frontKey: FrontTemplateKey) {
  const t = TEMPLATE_FIELD_DEFAULTS[frontKey];
  return `${t.colorStyle}; ${t.moodTheme}`;
}

// ─── Matched spine templates ──────────────────────────────────────────────────
const SPINE_TEMPLATES = [
  {
    value: "sp_cozy_storybook",
    label: "Cozy Storybook",
    img: "/back-spine/A cozy storybook spine design.png",
    frontMatch: "ct_classic_children",
    colorBackground: buildSpineBackground("ct_classic_children"),
    typographyStyle: buildSpineTypography("ct_classic_children"),
    promptDirective: buildMatchingSpinePrompt("ct_classic_children"),
  },
  {
    value: "sp_epic_cinematic",
    label: "Epic Cinematic",
    img: "/back-spine/Bold book spine design with flair.png",
    frontMatch: "ct_epic_cinematic",
    colorBackground: buildSpineBackground("ct_epic_cinematic"),
    typographyStyle: buildSpineTypography("ct_epic_cinematic"),
    promptDirective: buildMatchingSpinePrompt("ct_epic_cinematic"),
  },
  {
    value: "sp_islamic_heritage",
    label: "Islamic Heritage",
    img: "/back-spine/Elegant gold-embossed book spine.png",
    frontMatch: "ct_islamic_heritage",
    colorBackground: buildSpineBackground("ct_islamic_heritage"),
    typographyStyle: buildSpineTypography("ct_islamic_heritage"),
    promptDirective: buildMatchingSpinePrompt("ct_islamic_heritage"),
  },
  {
    value: "sp_vintage_ornate",
    label: "Vintage Ornate",
    img: "/back-spine/Elegant gold-embossed book spine (2).png",
    frontMatch: "ct_vintage_ornate",
    colorBackground: buildSpineBackground("ct_vintage_ornate"),
    typographyStyle: buildSpineTypography("ct_vintage_ornate"),
    promptDirective: buildMatchingSpinePrompt("ct_vintage_ornate"),
  },
  {
    value: "sp_modern_minimal",
    label: "Modern Minimal",
    img: "/back-spine/Minimalist book spine design.png",
    frontMatch: "ct_modern_minimal",
    colorBackground: buildSpineBackground("ct_modern_minimal"),
    typographyStyle: buildSpineTypography("ct_modern_minimal"),
    promptDirective: buildMatchingSpinePrompt("ct_modern_minimal"),
  },
  {
    value: "sp_watercolor_dream",
    label: "Watercolor Dream",
    img: "/back-spine/Sunshine adventures on a vibrant shelf.png",
    frontMatch: "ct_watercolor_dream",
    colorBackground: buildSpineBackground("ct_watercolor_dream"),
    typographyStyle: buildSpineTypography("ct_watercolor_dream"),
    promptDirective: buildMatchingSpinePrompt("ct_watercolor_dream"),
  },
  {
    value: "sp_night_sky",
    label: "Night Sky",
    img: "/back-spine/Stars within us_ a celestial journey.png",
    frontMatch: "ct_night_sky",
    colorBackground: buildSpineBackground("ct_night_sky"),
    typographyStyle: buildSpineTypography("ct_night_sky"),
    promptDirective: buildMatchingSpinePrompt("ct_night_sky"),
  },
  {
    value: "sp_storybook_warm",
    label: "Storybook Warm",
    img: "/back-spine/Teal book spine with gold detailing.png",
    frontMatch: "ct_storybook_warm",
    colorBackground: buildSpineBackground("ct_storybook_warm"),
    typographyStyle: buildSpineTypography("ct_storybook_warm"),
    promptDirective: buildMatchingSpinePrompt("ct_storybook_warm"),
  },
  {
    value: "sp_bold_typography",
    label: "Bold Typography",
    img: "/back-spine/Bold book spine design with flair.png",
    frontMatch: "ct_bold_typography",
    colorBackground: buildSpineBackground("ct_bold_typography"),
    typographyStyle: buildSpineTypography("ct_bold_typography"),
    promptDirective: buildMatchingSpinePrompt("ct_bold_typography"),
  },
  {
    value: "sp_nature_adventure",
    label: "Nature Adventure",
    img: "/back-spine/Nature adventure book spine design.png",
    frontMatch: "ct_nature_adventure",
    colorBackground: buildSpineBackground("ct_nature_adventure"),
    typographyStyle: buildSpineTypography("ct_nature_adventure"),
    promptDirective: buildMatchingSpinePrompt("ct_nature_adventure"),
  },
] as const;

// ─── Matched back cover templates ─────────────────────────────────────────────
const BACK_COVER_TEMPLATES = [
  {
    value: "bc_classic_children",
    label: "Classic Children",
    img: "/back-covers/kids-advanture.png",
    frontMatch: "ct_classic_children",
    backgroundStyle: buildBackBackgroundStyle("ct_classic_children"),
    promptDirective: buildMatchingBackPrompt("ct_classic_children"),
  },
  {
    value: "bc_epic_cinematic",
    label: "Epic Cinematic",
    img: "/back-covers/bc_epic_cinematic.png",
    frontMatch: "ct_epic_cinematic",
    backgroundStyle: buildBackBackgroundStyle("ct_epic_cinematic"),
    promptDirective: buildMatchingBackPrompt("ct_epic_cinematic"),
  },
  {
    value: "bc_islamic_heritage",
    label: "Islamic Heritage",
    img: "/back-covers/bc_islamic_heritage.png",
    frontMatch: "ct_islamic_heritage",
    backgroundStyle: buildBackBackgroundStyle("ct_islamic_heritage"),
    promptDirective: buildMatchingBackPrompt("ct_islamic_heritage"),
  },
  {
    value: "bc_vintage_ornate",
    label: "Vintage Ornate",
    img: "/back-covers/bc_vintage_ornate.svg",
    frontMatch: "ct_vintage_ornate",
    backgroundStyle: buildBackBackgroundStyle("ct_vintage_ornate"),
    promptDirective: buildMatchingBackPrompt("ct_vintage_ornate"),
  },
  {
    value: "bc_modern_minimal",
    label: "Modern Minimal",
    img: "/back-covers/bc_modern_minimal.png",
    frontMatch: "ct_modern_minimal",
    backgroundStyle: buildBackBackgroundStyle("ct_modern_minimal"),
    promptDirective: buildMatchingBackPrompt("ct_modern_minimal"),
  },
  {
    value: "bc_watercolor_dream",
    label: "Watercolor Dream",
    img: "/back-covers/watermalon.png",
    frontMatch: "ct_watercolor_dream",
    backgroundStyle: buildBackBackgroundStyle("ct_watercolor_dream"),
    promptDirective: buildMatchingBackPrompt("ct_watercolor_dream"),
  },
  {
    value: "bc_night_sky",
    label: "Night Sky",
    img: "/back-covers/Misty twilight book cover design.png",
    frontMatch: "ct_night_sky",
    backgroundStyle: buildBackBackgroundStyle("ct_night_sky"),
    promptDirective: buildMatchingBackPrompt("ct_night_sky"),
  },
  {
    value: "bc_storybook_warm",
    label: "Storybook Warm",
    img: "/back-covers/storybook.png",
    frontMatch: "ct_storybook_warm",
    backgroundStyle: buildBackBackgroundStyle("ct_storybook_warm"),
    promptDirective: buildMatchingBackPrompt("ct_storybook_warm"),
  },
  {
    value: "bc_bold_typography",
    label: "Bold Typography",
    img: "/back-covers/bold.png",
    frontMatch: "ct_bold_typography",
    backgroundStyle: buildBackBackgroundStyle("ct_bold_typography"),
    promptDirective: buildMatchingBackPrompt("ct_bold_typography"),
  },
  {
    value: "bc_nature_adventure",
    label: "Nature Adventure",
    img: "/back-covers/nature.png",
    frontMatch: "ct_nature_adventure",
    backgroundStyle: buildBackBackgroundStyle("ct_nature_adventure"),
    promptDirective: buildMatchingBackPrompt("ct_nature_adventure"),
  },
] as const;

// ─── Front to matched back/spine mapping ──────────────────────────────────────
const FRONT_TO_MATCHED_COVER_MAP: Record<
  string,
  { spine: string; back: string }
> = {
  ct_classic_children: {
    spine: "sp_cozy_storybook",
    back: "bc_classic_children",
  },
  ct_epic_cinematic: {
    spine: "sp_epic_cinematic",
    back: "bc_epic_cinematic",
  },
  ct_islamic_heritage: {
    spine: "sp_islamic_heritage",
    back: "bc_islamic_heritage",
  },
  ct_vintage_ornate: {
    spine: "sp_vintage_ornate",
    back: "bc_vintage_ornate",
  },
  ct_modern_minimal: {
    spine: "sp_modern_minimal",
    back: "bc_modern_minimal",
  },
  ct_watercolor_dream: {
    spine: "sp_watercolor_dream",
    back: "bc_watercolor_dream",
  },
  ct_night_sky: {
    spine: "sp_night_sky",
    back: "bc_night_sky",
  },
  ct_storybook_warm: {
    spine: "sp_storybook_warm",
    back: "bc_storybook_warm",
  },
  ct_bold_typography: {
    spine: "sp_bold_typography",
    back: "bc_bold_typography",
  },
  ct_nature_adventure: {
    spine: "sp_nature_adventure",
    back: "bc_nature_adventure",
  },
};

// ─── Section accordion wrapper ────────────────────────────────────────────────
function Section({
  icon,
  title,
  badge,
  defaultOpen = true,
  children,
}: {
  icon: string;
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-bold text-gray-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
              {badge}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Tag pills ────────────────────────────────────────────────────────────────
function TagPills({
  label,
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  onAdd: (v: string) => void;
  onRemove: (i: number) => void;
  placeholder: string;
}) {
  const [val, setVal] = useState("");

  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-semibold">{label}</Label>}

      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-xs font-medium text-rose-700 border border-rose-200"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="hover:text-red-600 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs text-muted-foreground italic">
            None added yet
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          className="text-sm h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter" && val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={() => {
            if (val.trim()) {
              onAdd(val.trim());
              setVal("");
            }
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Image tile picker ────────────────────────────────────────────────────────
const MOOD_TILES = [
  {
    value: "Epic, dramatic, cinematic fantasy adventure",
    label: "Epic / Fantasy",
    img: "/cover-feild/mood-epic.png",
  },
  {
    value: "Bright, joyful, children's adventure — safe and exciting",
    label: "Kids / Joyful",
    img: "/cover-feild/mood-kids.png",
  },
  {
    value: "Dark, mysterious, atmospheric, wonder-filled",
    label: "Dark / Mystery",
    img: "/cover-feild/mood-mystery.png",
  },
  {
    value: "Cozy, warm, intimate, safe and inviting",
    label: "Warm / Cozy",
    img: "/cover-feild/mood-cozy.png",
  },
  {
    value: "Islamic cultural heritage, dignified, spiritual",
    label: "Islamic Heritage",
    img: "/cover-feild/mood-islamic.png",
  },
  {
    value: "Adventure, discovery, lush nature and exploration",
    label: "Nature / Adventure",
    img: "/cover-feild/mood-nature.png",
  },
  {
    value: "Contemporary, clean, minimal, bold and modern",
    label: "Modern / Minimal",
    img: "/cover-feild/mood-minimal.png",
  },
];

const COLOR_TILES = [
  {
    value: "Dark midnight blue and deep purple with red accent glow",
    label: "Dark Cinematic",
    img: "/cover-feild/color-dark.png",
  },
  {
    value: "Vibrant warm yellows, oranges, sky blue — high saturation",
    label: "Bright & Warm",
    img: "/cover-feild/color-bright.png",
  },
  {
    value: "Warm amber, gold, chocolate brown, cream — antique palette",
    label: "Golden Rich",
    img: "/cover-feild/color-golden.png",
  },
  {
    value: "Soft pastel watercolor — blush, sage green, lavender, cream",
    label: "Soft Pastels",
    img: "/cover-feild/color-pastel.png",
  },
  {
    value: "Rich teal and warm gold — navy, amber, emerald and cream",
    label: "Teal & Gold",
    img: "/cover-feild/color-teal.png",
  },
  {
    value: "High contrast — off-white, bold black shapes, bold red accent",
    label: "Bold Contrast",
    img: "/cover-feild/color-vibrant.png",
  },
];

const LIGHTING_TILES = [
  {
    value: "Dramatic rim lighting, volumetric fog, cinematic purple dusk sky",
    label: "Cinematic Dramatic",
    img: "/cover-feild/light-cinematic.png",
  },
  {
    value: "Warm amber golden-hour glow, long shadows, warm sunlight",
    label: "Golden Hour",
    img: "/cover-feild/light-golden.png",
  },
  {
    value: "Cool moonlight, pale silver-blue glow, magical night",
    label: "Moonlight",
    img: "/cover-feild/light-moon.png",
  },
  {
    value: "Warm candlelight glow, intimate amber radiance in darkness",
    label: "Candlelight",
    img: "/cover-feild/light-candle.png",
  },
  {
    value: "Dappled golden sunlight filtering through forest leaves",
    label: "Forest Dappled",
    img: "/cover-feild/light-forest.png",
  },
];

const TYPO_TILES = [
  {
    value: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    label: "Fantasy Serif",
    img: "/cover-feild/typo-fantasy.png",
  },
  {
    value: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    label: "Playful Rounded",
    img: "/cover-feild/typo-playful.png",
  },
  {
    value:
      "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant",
    label: "Arabic / Elegant",
    img: "/cover-feild/typo-arabic.png",
  },
  {
    value: "Ultra-bold display — Anton, Bebas Neue, Impact",
    label: "Ultra Bold",
    img: "/cover-feild/typo-bold.png",
  },
  {
    value: "Handwritten organic — Caveat, Pacifico, Sacramento",
    label: "Handwritten",
    img: "/cover-feild/typo-handwritten.png",
  },
];

function ImgTilePicker({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; img: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {options.map((opt) => {
        const isSel = value === opt.value;

        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(isSel ? "" : opt.value)}
            className={cn(
              "relative flex flex-col items-center overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-md",
              isSel
                ? "border-rose-500 shadow-md"
                : "border-gray-200 hover:border-rose-300 bg-white"
            )}
          >
            <div className="w-full aspect-square overflow-hidden">
              <img
                src={opt.img}
                alt={opt.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold py-1.5 px-1 leading-tight text-center",
                isSel ? "text-rose-700" : "text-gray-600"
              )}
            >
              {opt.label}
            </span>
            {isSel && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Controlled inputs ────────────────────────────────────────────────────────
function LiveInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <Input
      className={className}
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
    />
  );
}

function LiveTextarea({
  value,
  onChange,
  placeholder,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);

  return (
    <Textarea
      rows={rows || 2}
      className="resize-none text-sm"
      value={local}
      placeholder={placeholder}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
    />
  );
}

// ─── Template metadata for filtering ─────────────────────────────────────────
const TEMPLATE_META: Record<string, { mood: string; ageGroup: string; recommended?: boolean }> = {
  ct_classic_children:  { mood: "Joyful",      ageGroup: "Under 6",  recommended: true  },
  ct_epic_cinematic:    { mood: "Adventure",    ageGroup: "Ages 8-14"                    },
  ct_islamic_heritage:  { mood: "Islamic",      ageGroup: "Ages 8-14", recommended: true },
  ct_vintage_ornate:    { mood: "Mysterious",   ageGroup: "Ages 8-14"                    },
  ct_modern_minimal:    { mood: "Modern",       ageGroup: "Ages 8-14"                    },
  ct_watercolor_dream:  { mood: "Calm",         ageGroup: "Ages 6-8",  recommended: true },
  ct_night_sky:         { mood: "Islamic",      ageGroup: "Ages 6-8",  recommended: true },
  ct_storybook_warm:    { mood: "Warm",         ageGroup: "Under 6"                      },
  ct_bold_typography:   { mood: "Modern",       ageGroup: "Ages 8-14"                    },
  ct_nature_adventure:  { mood: "Adventure",    ageGroup: "Ages 6-8"                     },
};

const MOOD_FILTERS = ["All", "Islamic", "Joyful", "Adventure", "Calm", "Warm", "Mysterious", "Modern"] as const;
const AGE_FILTERS  = ["All", "Under 6", "Ages 6-8", "Ages 8-14"] as const;

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  cd: any;
  universeId?: string;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

export function KBCoverDesign({ cd, universeId, onSave, isSaving }: Props) {
  const { data: templates = [] } = useCoverTemplates();
  const { data: allCharacters = [] } = useCharacters(universeId || undefined);
  const [moodFilter, setMoodFilter] = useState<string>("All");
  const [ageFilter, setAgeFilter] = useState<string>("All");
  const [previewTpl, setPreviewTpl] = useState<{ id: string; name: string; src: string } | null>(null);

  const selectedTplId = cd.selectedCoverTemplate || null;
  const selectedTpl = templates.find((t: any) => t._id === selectedTplId);

  const patch = (partial: object) => onSave({ coverDesign: { ...cd, ...partial } });

  const selectTemplate = (tplId: string) => {
    if (selectedTplId === tplId) {
      patch({
        selectedCoverTemplate: null,
        selectedSpineTemplate: null,
        selectedBackTemplate: null,
        spineColorBackground: "",
        spineTypographyStyle: "",
        spinePromptDirective: "",
        backBackgroundStyle: "",
        backPromptDirective: "",
      });
      return;
    }

    const defaults = TEMPLATE_FIELD_DEFAULTS[tplId];
    const matched = FRONT_TO_MATCHED_COVER_MAP[tplId];

    const spineTpl = matched
      ? SPINE_TEMPLATES.find((t) => t.value === matched.spine)
      : undefined;

    const backTpl = matched
      ? BACK_COVER_TEMPLATES.find((t) => t.value === matched.back)
      : undefined;

    const spineFields = {
      selectedSpineTemplate: spineTpl?.value ?? null,
      spineColorBackground: spineTpl?.colorBackground ?? "",
      spineTypographyStyle: spineTpl?.typographyStyle ?? "",
      spinePromptDirective: spineTpl?.promptDirective ?? "",
    };

    const backFields = {
      selectedBackTemplate: backTpl?.value ?? null,
      backBackgroundStyle: backTpl?.backgroundStyle ?? "",
      backPromptDirective: backTpl?.promptDirective ?? "",
    };

    if (!defaults) {
      patch({
        selectedCoverTemplate: tplId,
        ...spineFields,
        ...backFields,
      });
      return;
    }

    patch({
      selectedCoverTemplate: tplId,
      moodTheme: defaults.moodTheme,
      colorStyle: defaults.colorStyle,
      typographyTitle: defaults.typographyTitle,
      typographyBody: defaults.typographyBody,
      lightingEffects: defaults.lightingEffects,
      foregroundLayer: defaults.foregroundLayer,
      midgroundLayer: defaults.midgroundLayer,
      backgroundLayer: defaults.backgroundLayer,
      mainVisualConcept: defaults.mainVisualConcept,
      characterDescription: defaults.characterDescription,
      atmosphere: {
        ...cd.atmosphere,
        middleGrade: defaults.atmosphereMiddleGrade,
        junior: defaults.atmosphereJunior,
      },
      islamicMotifs: cd.islamicMotifs?.length
        ? cd.islamicMotifs
        : defaults.islamicMotifs,
      ...spineFields,
      ...backFields,
    });
  };

  const islamicMotifs = cd.islamicMotifs || [];
  const avoidCover = cd.avoidCover || [];

  const validIds = (allCharacters as any[]).map((c: any) => c.id || c._id || "");
  const selectedCount = (cd.characterMustInclude || []).filter((id: string) => validIds.includes(id)).length;

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Pick a cover style template — all fields auto-fill. AI will generate a
        matching front cover, spine, and back cover in the book builder.
      </p>

      {/* ── 1. Cover Style Template ── */}
      <Section icon="🎨" title="Cover Style Template" defaultOpen>
        <p className="text-xs text-muted-foreground">
          Click any template below — all front-cover fields will populate, and a
          matching spine + back cover style will be applied automatically.
        </p>

        {/* Filter chips */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide self-center mr-1">Mood</span>
            {MOOD_FILTERS.map(f => (
              <button key={f} type="button" onClick={() => setMoodFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                  moodFilter === f ? "bg-rose-500 text-white border-rose-500" : "border-border text-muted-foreground hover:border-rose-300 hover:text-foreground"
                )}>{f}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide self-center mr-1">Age</span>
            {AGE_FILTERS.map(f => (
              <button key={f} type="button" onClick={() => setAgeFilter(f)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all border",
                  ageFilter === f ? "bg-rose-500 text-white border-rose-500" : "border-border text-muted-foreground hover:border-rose-300 hover:text-foreground"
                )}>{f}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {templates
            .filter((tpl: any) => {
              const meta = TEMPLATE_META[tpl._id];
              if (!meta) return true;
              if (moodFilter !== "All" && meta.mood !== moodFilter) return false;
              if (ageFilter !== "All" && meta.ageGroup !== ageFilter) return false;
              return true;
            })
            .map((tpl: any) => {
            const SvgComponent = COVER_TEMPLATE_SVG_MAP[tpl._id];
            const isSelected = selectedTplId === tpl._id;
            const meta = TEMPLATE_META[tpl._id];
            const imgSrc = COVER_TEMPLATE_PNG_MAP[tpl._id];

            return (
              <div key={tpl._id} className="relative flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => selectTemplate(tpl._id)}
                  className={cn(
                    "w-full relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                    isSelected
                      ? "border-rose-500 bg-rose-50 shadow-md"
                      : "border-gray-200 hover:border-rose-300 bg-white"
                  )}
                >
                  <div className="w-full rounded-lg overflow-hidden shadow-sm" style={{ aspectRatio: "5/7" }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={tpl.name} className="w-full h-full object-cover" />
                    ) : SvgComponent ? (
                      <SvgComponent />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Frame className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <span className={cn("text-xs font-semibold text-center leading-tight", isSelected ? "text-rose-700" : "text-gray-700")}>
                    {tpl.name}
                  </span>

                  <div className="flex gap-1">
                    {tpl.palette?.slice(0, 4).map((hex: string) => (
                      <span key={hex} className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                    ))}
                  </div>

                  {/* Recommended badge */}
                  {meta?.recommended && (
                    <span className="absolute top-8 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500 text-white whitespace-nowrap">★ Recommended</span>
                  )}

                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </button>

                {/* Preview button */}
                {imgSrc && (
                  <button
                    type="button"
                    onClick={() => setPreviewTpl({ id: tpl._id, name: tpl.name, src: imgSrc })}
                    className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                    title="Preview"
                  >
                    <ZoomIn className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {selectedTpl && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <p className="text-sm font-bold text-rose-700">
                {selectedTpl.name} — applied to front cover, matching spine, and
                matching back cover
              </p>
            </div>
            <p className="text-xs text-gray-600">{selectedTpl.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              <p>
                <span className="font-semibold">Typography:</span>{" "}
                {selectedTpl.typography}
              </p>
              <p>
                <span className="font-semibold">Atmosphere:</span>{" "}
                {selectedTpl.atmosphere}
              </p>
              <p className="col-span-2">
                <span className="font-semibold">Composition:</span>{" "}
                {selectedTpl.composition}
              </p>
            </div>
            <p className="text-[11px] text-rose-500 font-medium">
              Matching spine &amp; back cover styles are auto-configured — all three will be generated in the book builder.
            </p>
          </div>
        )}
      </Section>

      {/* ── 2. Cover Characters ── */}
      <Section icon="👤" title="Cover Characters" badge={selectedCount > 0 ? `${selectedCount} selected` : undefined} defaultOpen>
        <p className="text-xs text-muted-foreground">
          Select the main character(s) to appear on the front cover. Their visual DNA (appearance, outfit, features) is sent directly to the AI.
        </p>
        {(allCharacters as any[]).length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No characters found in this universe. Create characters first.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(allCharacters as any[]).map((char: any) => {
              const charId = char.id || char._id || "";
              const selected = (cd.characterMustInclude || []).includes(charId);
              return (
                <button
                  key={charId}
                  type="button"
                  onClick={() => {
                    const clean: string[] = (cd.characterMustInclude || []).filter((id: string) => validIds.includes(id));
                    const next = selected ? clean.filter((id) => id !== charId) : [...clean, charId];
                    patch({ characterMustInclude: next });
                  }}
                  className={cn(
                    "relative flex flex-col items-center rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-md text-left",
                    selected ? "border-rose-500 shadow-md" : "border-gray-200 hover:border-rose-300 bg-white"
                  )}
                >
                  <div className="w-full aspect-square overflow-hidden bg-gray-100">
                    {char.imageUrl ? (
                      <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className={cn("w-full px-2 py-2 text-center", selected ? "bg-rose-50" : "bg-white")}>
                    <p className={cn("text-xs font-bold leading-tight truncate", selected ? "text-rose-700" : "text-gray-800")}>
                      {char.name}
                    </p>
                    {char.role && (
                      <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{char.role}</p>
                    )}
                  </div>
                  {selected && (
                    <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {selectedCount > 0 && (
          <p className="text-[10px] text-rose-600 font-medium">
            {selectedCount} character(s) selected — visual DNA will be used in AI cover generation
          </p>
        )}
      </Section>

      {/* ── 3. Front Cover ── */}
      <Section icon="📖" title="Front Cover" defaultOpen={false}>
        <p className="text-xs text-muted-foreground">
          Book title and author are taken from your story — focus here on the visual scene.
          Title placement is handled automatically by the selected template.
        </p>

        <Field label="Mood / Theme" hint="Tap to select — or leave for template default">
          <ImgTilePicker
            options={MOOD_TILES}
            value={cd.moodTheme || ""}
            onChange={(v) => patch({ moodTheme: v })}
          />
        </Field>

        <Field label="Color Style" hint="Primary palette for the cover">
          <ImgTilePicker
            options={COLOR_TILES}
            value={cd.colorStyle || ""}
            onChange={(v) => patch({ colorStyle: v })}
          />
        </Field>

        <Field label="Main Visual Concept" hint="The main scene to illustrate — be specific">
          <LiveTextarea
            value={cd.mainVisualConcept || ""}
            placeholder="e.g. Child silhouette standing before vast starry night sky with glowing crescent moon and distant mosque"
            onChange={(v) => patch({ mainVisualConcept: v })}
            rows={3}
          />
        </Field>

        <Field label="Character Description Override" hint="Optional — only used if no cover character is selected in the Characters section above">
          <LiveTextarea
            value={cd.characterDescription || ""}
            placeholder="e.g. Young girl in abaya holding a lantern, facing viewer with a warm smile"
            onChange={(v) => patch({ characterDescription: v })}
            rows={2}
          />
        </Field>
      </Section>

      {/* ── 4. Visual Style Settings ── */}
      <Section icon="✨" title="Visual Style Settings" defaultOpen={false}>
        <Field label="Title Typography" hint="Tap to select font style">
          <ImgTilePicker
            options={TYPO_TILES}
            value={cd.typographyTitle || ""}
            onChange={(v) => patch({ typographyTitle: v })}
          />
        </Field>

        <Field label="Body Typography">
          <LiveInput
            value={cd.typographyBody || ""}
            placeholder="e.g. Clean readable sans-serif"
            onChange={(v) => patch({ typographyBody: v })}
          />
        </Field>

        <Field label="Lighting / Effects" hint="Tap to select lighting style">
          <ImgTilePicker
            options={LIGHTING_TILES}
            value={cd.lightingEffects || ""}
            onChange={(v) => patch({ lightingEffects: v })}
          />
        </Field>

      </Section>




      <Section icon="📋" title="Rules & Restrictions" defaultOpen={false}>
        <TagPills
          label="Islamic Motifs"
          items={islamicMotifs}
          placeholder="e.g. Crescent moon, arabesque border, mosque silhouette"
          onAdd={(v) => patch({ islamicMotifs: [...islamicMotifs, v] })}
          onRemove={(i) =>
            patch({
              islamicMotifs: islamicMotifs.filter(
                (_: string, j: number) => j !== i
              ),
            })
          }
        />

        <TagPills
          label="Avoid on Cover"
          items={avoidCover}
          placeholder="e.g. Generic centered-character-only templates"
          onAdd={(v) => patch({ avoidCover: [...avoidCover, v] })}
          onRemove={(i) =>
            patch({
              avoidCover: avoidCover.filter(
                (_: string, j: number) => j !== i
              ),
            })
          }
        />

        <Field label="Extra Notes">
          <LiveInput
            value={cd.extraNotes || ""}
            placeholder="Any other cover direction for AI..."
            onChange={(v) => patch({ extraNotes: v })}
          />
        </Field>
      </Section>

      {isSaving && (
        <div className="text-xs text-muted-foreground px-1">Saving changes...</div>
      )}

      {/* Template preview modal */}
      {previewTpl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setPreviewTpl(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-xs w-full"
            onClick={e => e.stopPropagation()}
          >
            <img src={previewTpl.src} alt={previewTpl.name} className="w-full object-cover" style={{ maxHeight: "70vh" }} />
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-800">{previewTpl.name}</p>
              <button type="button" onClick={() => setPreviewTpl(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}