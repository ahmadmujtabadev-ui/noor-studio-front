import { useState, useEffect } from "react";
import { Check, ChevronDown, ChevronUp, Frame, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { COVER_TEMPLATE_SVG_MAP, COVER_TEMPLATE_PNG_MAP } from "@/components/shared/CoverTemplateSvgs";
import { TITLE_PLACEMENT_OPTIONS } from "@/components/shared/KBFieldIcons";
import { useCoverTemplates } from "@/hooks/useKnowledgeBase";

// ─── Per-template field defaults ──────────────────────────────────────────────
// These populate all form fields when a template is selected
const TEMPLATE_FIELD_DEFAULTS: Record<string, {
  moodTheme: string; colorStyle: string; typographyTitle: string; typographyBody: string;
  lightingEffects: string; foregroundLayer: string; midgroundLayer: string; backgroundLayer: string;
  mainVisualConcept: string; characterDescription: string;
  atmosphereMiddleGrade: string; atmosphereJunior: string; islamicMotifs: string[];
}> = {
  ct_classic_children: {
    moodTheme: "Bright, joyful, children's adventure — safe and exciting",
    colorStyle: "Vibrant warm yellows, oranges, sky blue — high saturation",
    typographyTitle: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    typographyBody: "Friendly rounded sans-serif",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Expressive cheerful child character",
    midgroundLayer: "Colorful simple shapes, playful floating elements",
    backgroundLayer: "Big expressive sunny sky, rolling hills or colorful landscape",
    mainVisualConcept: "Bright sunlit outdoor scene with a cheerful Muslim child exploring a colorful world",
    characterDescription: "Expressive cheerful child, bright clothing, warm smile, dynamic pose",
    atmosphereMiddleGrade: "Bright joyful sunshine, safe familiar world, vibrant warm colors",
    atmosphereJunior: "Bright joyful sunshine, warm golden light, safe and exciting",
    islamicMotifs: [],
  },
  ct_epic_cinematic: {
    moodTheme: "Epic, dramatic, cinematic fantasy adventure",
    colorStyle: "Dark midnight blue and deep purple with red accent glow",
    typographyTitle: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    typographyBody: "Clean condensed serif for readability",
    lightingEffects: "Dramatic rim lighting, volumetric fog, cinematic purple dusk sky",
    foregroundLayer: "Silhouetted hero character with dramatic edge lighting",
    midgroundLayer: "Epic dramatic landscape, ruins or rocky terrain",
    backgroundLayer: "Vast dramatic dark sky, atmospheric fog depth, epic scale environment",
    mainVisualConcept: "Silhouetted hero standing in dramatic cinematic landscape at dusk with glowing title zone sky",
    characterDescription: "Hero silhouetted or edge-lit, dramatic pose, sense of determination and scale",
    atmosphereMiddleGrade: "Cinematic dramatic lighting, purple dusk sky, atmospheric fog depth, epic scale",
    atmosphereJunior: "Dramatic but exciting adventure, colorful sky accent, bold and empowering",
    islamicMotifs: [],
  },
  ct_islamic_heritage: {
    moodTheme: "Islamic cultural heritage, dignified, spiritual",
    colorStyle: "Rich teal and warm gold — navy, amber, emerald and cream",
    typographyTitle: "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant",
    typographyBody: "Elegant calligraphic-feel serif",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Character framed by Islamic arch or geometric environment",
    midgroundLayer: "Mosque courtyard or Islamic architectural environment",
    backgroundLayer: "Crescent moon in sky, decorative architectural depth, warm golden horizon",
    mainVisualConcept: "Character standing in front of ornate Islamic arch with mosque and crescent moon in warm golden light",
    characterDescription: "Character in traditional Islamic attire, dignified and curious pose, viewed from behind or profile",
    atmosphereMiddleGrade: "Warm golden hour, dignified and rich, Islamic cultural heritage feel",
    atmosphereJunior: "Warm bright Islamic scene, colorful geometric patterns, welcoming and proud",
    islamicMotifs: ["Arabesque geometric border", "Crescent moon", "Mosque silhouette", "Islamic arch"],
  },
  ct_vintage_ornate: {
    moodTheme: "Dark, mysterious, atmospheric, wonder-filled",
    colorStyle: "Warm amber, gold, chocolate brown, cream — antique palette",
    typographyTitle: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    typographyBody: "Classical serif with ornate character",
    lightingEffects: "Warm candlelight glow, intimate amber radiance in darkness",
    foregroundLayer: "Character in formal symmetrical pose, ornamental setting",
    midgroundLayer: "Richly decorated classical environment with gold inlay detail",
    backgroundLayer: "Dark rich layered background, heraldic and dignified depth",
    mainVisualConcept: "Classical illustrated scene with formal symmetrical layout, warm candlelit environment and ornate gold details",
    characterDescription: "Character in classical dignified pose, ornate surroundings, collector's edition feel",
    atmosphereMiddleGrade: "Rich dark classical, candlelight warmth, prestigious antique collector's edition feel",
    atmosphereJunior: "Warm golden treasure hunt feel, exciting mysterious discovery",
    islamicMotifs: ["Ornamental gold border", "Classical Islamic geometric inlay"],
  },
  ct_modern_minimal: {
    moodTheme: "Contemporary, clean, minimal, bold and modern",
    colorStyle: "High contrast — off-white, bold black shapes, bold red accent",
    typographyTitle: "Ultra-bold display — Anton, Bebas Neue, Impact",
    typographyBody: "Clean geometric sans-serif, maximum legibility",
    lightingEffects: "",
    foregroundLayer: "Character as clean graphical element, bold and graphic",
    midgroundLayer: "Strong geometric shape as dominant focal element",
    backgroundLayer: "Clean off-white or light background with maximum negative space",
    mainVisualConcept: "Bold single geometric shape as dominant visual, character integrated as clean graphical focal point, strong white space",
    characterDescription: "Character rendered as clean minimal graphic element, strong silhouette",
    atmosphereMiddleGrade: "Clean contemporary, sophisticated simplicity, strong visual tension through contrast",
    atmosphereJunior: "Bold playful geometric shapes, bright accent color, modern and fun",
    islamicMotifs: [],
  },
  ct_watercolor_dream: {
    moodTheme: "Cozy, warm, intimate, safe and inviting",
    colorStyle: "Soft pastel watercolor — blush, sage green, lavender, cream",
    typographyTitle: "Handwritten organic — Caveat, Pacifico, Sacramento",
    typographyBody: "Soft organic handwritten feel",
    lightingEffects: "",
    foregroundLayer: "Character gently surrounded by flowing botanical watercolor elements",
    midgroundLayer: "Botanical elements — leaves, flowers, olive branches softly painted",
    backgroundLayer: "Warm cream or blush background, soft watercolor washes, visible brushstroke texture",
    mainVisualConcept: "Dreamy soft watercolor scene with child surrounded by botanical painted nature elements, warm cream background",
    characterDescription: "Gentle soft child character in flowing clothes, dreamy expression, surrounded by flowers and leaves",
    atmosphereMiddleGrade: "Dreamy soft pastels, gentle whimsy, handcrafted warmth, magical and safe",
    atmosphereJunior: "Soft dreamy pastels, magical garden, watercolor warmth and safety",
    islamicMotifs: ["Soft floral arabesque", "Olive branch motif"],
  },
  ct_night_sky: {
    moodTheme: "Islamic cultural heritage, dignified, spiritual",
    colorStyle: "Dark midnight blue and deep purple with red accent glow",
    typographyTitle: "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant",
    typographyBody: "Elegant refined serif with luminous quality",
    lightingEffects: "Cool moonlight, pale silver-blue glow, magical night",
    foregroundLayer: "Character in lower third, gazing upward at sky",
    midgroundLayer: "Distant mosque silhouette or minaret glowing warmly at horizon",
    backgroundLayer: "Vast starry midnight sky with galaxy texture, prominent glowing crescent moon",
    mainVisualConcept: "Child looking up at vast starry night sky with glowing crescent moon and distant mosque silhouette at golden horizon",
    characterDescription: "Child in awe, looking upward, silhouetted against glowing horizon, sense of wonder and faith",
    atmosphereMiddleGrade: "Magical night, deep cool blues and purples, warm gold glow, mystical and awe-inspiring",
    atmosphereJunior: "Magical sparkling night, glowing crescent moon, sense of wonder and discovery",
    islamicMotifs: ["Crescent moon prominent", "Mosque minaret silhouette", "Starfield", "Golden glowing horizon"],
  },
  ct_storybook_warm: {
    moodTheme: "Cozy, warm, intimate, safe and inviting",
    colorStyle: "Warm amber, gold, chocolate brown, cream — antique palette",
    typographyTitle: "Handwritten organic — Caveat, Pacifico, Sacramento",
    typographyBody: "Warm readable serif, classic picture book feel",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    foregroundLayer: "Friendly trusted character in warm lit scene",
    midgroundLayer: "Cozy environmental storytelling elements — leaves, stars, vines",
    backgroundLayer: "Warm sunset or firelit environment, illustrated botanical nature elements",
    mainVisualConcept: "Cozy richly illustrated scene with child character in warm golden firelit environment surrounded by nature",
    characterDescription: "Warm friendly child character, inviting expression, as if welcoming the reader into their world",
    atmosphereMiddleGrade: "Warm cozy golden firelight, inviting classic storybook mood, safe and enchanting",
    atmosphereJunior: "Cozy warm golden light, friendly and safe, classic picture book warmth",
    islamicMotifs: ["Subtle star and crescent", "Natural organic elements"],
  },
  ct_bold_typography: {
    moodTheme: "Contemporary, clean, minimal, bold and modern",
    colorStyle: "High contrast — off-white, bold black shapes, bold red accent",
    typographyTitle: "Ultra-bold display — Anton, Bebas Neue, Impact",
    typographyBody: "Strong condensed sans-serif for maximum impact",
    lightingEffects: "",
    foregroundLayer: "Character integrated as graphic element within bold composition",
    midgroundLayer: "Strong color blocks, bold diagonal shapes or pattern as texture",
    backgroundLayer: "Strong 2-3 color block background, graphic design poster aesthetic",
    mainVisualConcept: "Bold graphic design poster composition with strong color blocking, character as graphic element, powerful visual impact",
    characterDescription: "Character rendered graphically, integrated into bold composition rather than placed in front of scene",
    atmosphereMiddleGrade: "Bold graphic power, high contrast, contemporary editorial, confident and striking",
    atmosphereJunior: "Bold exciting colors, strong shapes, high energy and confidence",
    islamicMotifs: [],
  },
  ct_nature_adventure: {
    moodTheme: "Adventure, discovery, lush nature and exploration",
    colorStyle: "Vibrant warm yellows, oranges, sky blue — high saturation",
    typographyTitle: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    typographyBody: "Clean friendly adventurous sans-serif",
    lightingEffects: "Dappled golden sunlight filtering through forest leaves",
    foregroundLayer: "Character in dynamic outdoor action pose, exploring nature",
    midgroundLayer: "Rich botanical environment, layered foliage, flowers and vines",
    backgroundLayer: "Deep forest or garden landscape, sky visible through canopy",
    mainVisualConcept: "Lush green forest or garden with Muslim child explorer in dynamic action pose, dappled golden sunlight, rich botanical depth",
    characterDescription: "Active adventurous child, explorer pose, surrounded by lush nature elements, sense of discovery",
    atmosphereMiddleGrade: "Vibrant lush green nature, warm sunshine dappling through foliage, adventure and discovery",
    atmosphereJunior: "Bright colorful garden adventure, magical nature, exciting and welcoming",
    islamicMotifs: ["Olive branch", "Garden of paradise motif", "Natural Islamic geometry"],
  },
};

// ─── Section accordion wrapper ────────────────────────────────────────────────
function Section({
  icon, title, badge, defaultOpen = true, children,
}: {
  icon: string; title: string; badge?: string; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-bold text-gray-800">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// ─── Tag pills ────────────────────────────────────────────────────────────────
function TagPills({
  label, items, onAdd, onRemove, placeholder,
}: { label: string; items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void; placeholder: string }) {
  const [val, setVal] = useState("");
  return (
    <div className="space-y-2">
      {label && <Label className="text-xs font-semibold">{label}</Label>}
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-xs font-medium text-rose-700 border border-rose-200">
            {item}
            <button onClick={() => onRemove(i)} className="hover:text-red-600 ml-0.5"><X className="w-3 h-3" /></button>
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground italic">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder} className="text-sm h-9"
          onKeyDown={e => { if (e.key === "Enter" && val.trim()) { onAdd(val.trim()); setVal(""); } }} />
        <Button variant="outline" size="sm" className="h-9 px-3"
          onClick={() => { if (val.trim()) { onAdd(val.trim()); setVal(""); } }}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-gray-700">{label}</Label>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

// ─── Image tile picker (replaces text dropdowns) ──────────────────────────────
const MOOD_TILES = [
  { value: "Epic, dramatic, cinematic fantasy adventure", label: "Epic / Fantasy", img: "/cover-feild/mood-epic.png" },
  { value: "Bright, joyful, children's adventure — safe and exciting", label: "Kids / Joyful", img: "/cover-feild/mood-kids.png" },
  { value: "Dark, mysterious, atmospheric, wonder-filled", label: "Dark / Mystery", img: "/cover-feild/mood-mystery.png" },
  { value: "Cozy, warm, intimate, safe and inviting", label: "Warm / Cozy", img: "/cover-feild/mood-cozy.png" },
  { value: "Islamic cultural heritage, dignified, spiritual", label: "Islamic Heritage", img: "/cover-feild/mood-islamic.png" },
  { value: "Adventure, discovery, lush nature and exploration", label: "Nature / Adventure", img: "/cover-feild/mood-nature.png" },
  { value: "Contemporary, clean, minimal, bold and modern", label: "Modern / Minimal", img: "/cover-feild/mood-minimal.png" },
];

const COLOR_TILES = [
  { value: "Dark midnight blue and deep purple with red accent glow", label: "Dark Cinematic", img: "/cover-feild/color-dark.png" },
  { value: "Vibrant warm yellows, oranges, sky blue — high saturation", label: "Bright & Warm", img: "/cover-feild/color-bright.png" },
  { value: "Warm amber, gold, chocolate brown, cream — antique palette", label: "Golden Rich", img: "/cover-feild/color-golden.png" },
  { value: "Soft pastel watercolor — blush, sage green, lavender, cream", label: "Soft Pastels", img: "/cover-feild/color-pastel.png" },
  { value: "Rich teal and warm gold — navy, amber, emerald and cream", label: "Teal & Gold", img: "/cover-feild/color-teal.png" },
  { value: "High contrast — off-white, bold black shapes, bold red accent", label: "Bold Contrast", img: "/cover-feild/color-vibrant.png" },
];

const LIGHTING_TILES = [
  { value: "Dramatic rim lighting, volumetric fog, cinematic purple dusk sky", label: "Cinematic Dramatic", img: "/cover-feild/light-cinematic.png" },
  { value: "Warm amber golden-hour glow, long shadows, warm sunlight", label: "Golden Hour", img: "/cover-feild/light-golden.png" },
  { value: "Cool moonlight, pale silver-blue glow, magical night", label: "Moonlight", img: "/cover-feild/light-moon.png" },
  { value: "Warm candlelight glow, intimate amber radiance in darkness", label: "Candlelight", img: "/cover-feild/light-candle.png" },
  { value: "Dappled golden sunlight filtering through forest leaves", label: "Forest Dappled", img: "/cover-feild/light-forest.png" },
];

const TYPO_TILES = [
  { value: "Bold condensed serif — Cinzel, Trajan, Bebas Neue", label: "Fantasy Serif", img: "/cover-feild/typo-fantasy.png" },
  { value: "Bold rounded — Fredoka One, Baloo Bhaijaan", label: "Playful Rounded", img: "/cover-feild/typo-playful.png" },
  { value: "Elegant calligraphic serif — Amiri, Scheherazade New, Cormorant", label: "Arabic / Elegant", img: "/cover-feild/typo-arabic.png" },
  { value: "Ultra-bold display — Anton, Bebas Neue, Impact", label: "Ultra Bold", img: "/cover-feild/typo-bold.png" },
  { value: "Handwritten organic — Caveat, Pacifico, Sacramento", label: "Handwritten", img: "/cover-feild/typo-handwritten.png" },
];

// ─── Spine templates ───────────────────────────────────────────────────────────
const SPINE_TEMPLATES = [
  {
    value: "sp_dark_classic",
    label: "Dark Classic",
    img: "/back-cover-spine/Elegant gold-embossed book spine.png",
    colorBackground: "Rich dark maroon or deep chocolate-brown",
    typographyStyle: "Elegant gold serif, vertical orientation",
    promptDirective: "SPINE — DARK CLASSIC: Rich dark maroon or deep chocolate-brown spine background; elegant gold serif typography running vertically top to bottom; small ornate publisher symbol at base; prestigious classical collector's edition feel; no character illustration — pure typographic elegance with warm candlelit gold.",
  },
  {
    value: "sp_bright_kids",
    label: "Bright Kids",
    img: "/back-cover-spine/Sunshine adventures on a vibrant shelf.png",
    colorBackground: "Vibrant orange-yellow-blue gradient",
    typographyStyle: "Bold rounded white sans-serif, vertical",
    promptDirective: "SPINE — BRIGHT KIDS: Vibrant gradient spine — warm orange flowing into bright yellow then sky blue; bold rounded playful white typography running vertically; small cheerful sun or star graphic element at base; high-saturation children's book energy; welcoming, joyful and safe.",
  },
  {
    value: "sp_minimal_cream",
    label: "Minimal Cream",
    img: "/back-cover-spine/Simply elegant book spine design.png",
    colorBackground: "Clean off-white or warm cream",
    typographyStyle: "Thin elegant dark serif, vertical",
    promptDirective: "SPINE — MINIMAL CREAM: Clean off-white or warm cream spine background; thin elegant dark gray or black serif typography running vertically; a single subtle thin horizontal rule as the only decoration; maximum negative space; Scandinavian minimal design aesthetic; sophisticated and understated.",
  },
  {
    value: "sp_teal_islamic",
    label: "Teal & Gold",
    img: "/back-cover-spine/Teal book spine with gold detailing.png",
    colorBackground: "Rich teal with gold Islamic geometric border strip",
    typographyStyle: "Warm gold serif vertical, Islamic feel",
    promptDirective: "SPINE — TEAL ISLAMIC: Rich teal background; subtle thin gold Islamic geometric border strip running along both vertical edges; warm gold serif typography centered vertically; small crescent moon or star motif at the base; dignified Islamic heritage aesthetic with warm golden accent.",
  },
];

// ─── Back cover templates ──────────────────────────────────────────────────────
const BACK_COVER_TEMPLATES = [
  {
    value: "bc_classic_publisher",
    label: "Classic Publisher",
    img: "/back-cover-spine/Elegant book back cover design.png",
    backgroundStyle: "Clean cream/white professional publisher layout",
    promptDirective: "BACK COVER — CLASSIC PUBLISHER: Clean cream or warm white background; professional publisher layout — blurb text zone centered; circular author photo placeholder in lower left; barcode placeholder zone in lower right; publisher name at top center; elegant serif typography throughout; traditional prestigious publishing house aesthetic; subtle thin outer border framing the full page.",
  },
  {
    value: "bc_warm_illustrated",
    label: "Warm Illustrated",
    img: "/back-cover-spine/Botanical book cover with elegant border.png",
    backgroundStyle: "Warm cream with illustrated botanical border frame",
    promptDirective: "BACK COVER — WARM ILLUSTRATED: Warm golden cream background; hand-painted illustrated botanical border framing all four edges — leaves, flowers, olive branches, soft vines curling inward; central blurb text area as a warm cream tinted panel; soft watercolor botanical illustration style; cozy storybook picture book aesthetic; barcode area as a warm brown strip at the bottom.",
  },
  {
    value: "bc_dark_cinematic",
    label: "Dark Cinematic",
    img: "/back-cover-spine/Misty twilight book cover design.png",
    backgroundStyle: "Dark dramatic midnight blue cinematic atmosphere",
    promptDirective: "BACK COVER — DARK CINEMATIC: Dark dramatic atmospheric background — deep midnight blue to dark purple gradient; subtle atmospheric fog or mist texture throughout; faint silhouetted landscape at the lower horizon; central blurb text panel with semi-transparent dark overlay; cinematic epic fantasy mood matching the front cover; barcode area in dark tonal strip at bottom.",
  },
  {
    value: "bc_islamic_heritage",
    label: "Islamic Heritage",
    img: "/back-cover-spine/Elegant Islamic geometric book design.png",
    backgroundStyle: "Rich teal/navy with Islamic geometric pattern and gold arabesque border",
    promptDirective: "BACK COVER — ISLAMIC HERITAGE: Rich teal or deep navy background; ornate Islamic geometric pattern as subtle overall background texture; warm gold arabesque decorative border framing the full page; central blurb text on a slightly lighter teal or translucent panel; small crescent moon motif centered at top; barcode area with gold strip at bottom; dignified culturally rich Islamic heritage aesthetic.",
  },
];

function ImgTilePicker({ options, value, onChange }: {
  options: { value: string; label: string; img: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map(opt => {
        const isSel = value === opt.value;
        return (
          <button key={opt.value} type="button"
            onClick={() => onChange(isSel ? "" : opt.value)}
            className={cn(
              "relative flex flex-col items-center overflow-hidden rounded-xl border-2 transition-all duration-200 hover:scale-[1.03] hover:shadow-md",
              isSel ? "border-rose-500 shadow-md" : "border-gray-200 hover:border-rose-300 bg-white"
            )}>
            <div className="w-full aspect-square overflow-hidden">
              <img src={opt.img} alt={opt.label} className="w-full h-full object-cover" />
            </div>
            <span className={cn("text-[10px] font-bold py-1.5 px-1 leading-tight text-center", isSel ? "text-rose-700" : "text-gray-600")}>
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

// ─── Controlled text input that updates when value prop changes ───────────────
function LiveInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <Input
      className={className}
      value={local}
      placeholder={placeholder}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
    />
  );
}

function LiveTextarea({ value, onChange, placeholder, rows }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => { setLocal(value); }, [value]);
  return (
    <Textarea
      rows={rows || 2}
      className="resize-none text-sm"
      value={local}
      placeholder={placeholder}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => onChange(local)}
    />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  cd: any;
  onSave: (update: object) => Promise<void>;
  isSaving: boolean;
}

export function KBCoverDesign({ cd, onSave, isSaving }: Props) {
  const { data: templates = [] } = useCoverTemplates();
  const selectedTplId = cd.selectedCoverTemplate || null;
  const selectedTpl = templates.find((t: any) => t._id === selectedTplId);

  const patch = (partial: object) => onSave({ coverDesign: { ...cd, ...partial } });

  // ── Select template: always populate ALL fields from template defaults ────────
  const selectTemplate = (tplId: string) => {
    if (selectedTplId === tplId) {
      patch({ selectedCoverTemplate: null });
      return;
    }
    const defaults = TEMPLATE_FIELD_DEFAULTS[tplId];
    if (!defaults) { patch({ selectedCoverTemplate: tplId }); return; }

    patch({
      selectedCoverTemplate: tplId,
      moodTheme:             defaults.moodTheme,
      colorStyle:            defaults.colorStyle,
      typographyTitle:       defaults.typographyTitle,
      typographyBody:        defaults.typographyBody,
      lightingEffects:       defaults.lightingEffects,
      foregroundLayer:       defaults.foregroundLayer,
      midgroundLayer:        defaults.midgroundLayer,
      backgroundLayer:       defaults.backgroundLayer,
      mainVisualConcept:     defaults.mainVisualConcept,
      characterDescription:  defaults.characterDescription,
      atmosphere: {
        ...cd.atmosphere,
        middleGrade: defaults.atmosphereMiddleGrade,
        junior:      defaults.atmosphereJunior,
      },
      // Only pre-fill Islamic motifs if user hasn't added their own
      islamicMotifs: cd.islamicMotifs?.length ? cd.islamicMotifs : defaults.islamicMotifs,
    });
  };

  const brandingRules      = cd.brandingRules || [];
  const characterComp      = cd.characterComposition || [];
  const optionalAddons     = cd.optionalAddons || [];
  const islamicMotifs      = cd.islamicMotifs || [];
  const avoidCover         = cd.avoidCover || [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Define every detail of your book cover. Pick a style template — all fields auto-fill. Then customise as needed.
      </p>

      {/* ── 1. Cover Style Template ── */}
      <Section icon="🎨" title="Cover Style Template" defaultOpen>
        <p className="text-xs text-muted-foreground">
          Click any template below — all fields will instantly populate with its style settings. You can edit anything after.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {templates.map((tpl: any) => {
            const SvgComponent = COVER_TEMPLATE_SVG_MAP[tpl._id];
            const isSelected = selectedTplId === tpl._id;
            return (
              <button key={tpl._id} type="button" onClick={() => selectTemplate(tpl._id)}
                className={cn(
                  "group relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                  isSelected ? "border-rose-500 bg-rose-50 shadow-md" : "border-gray-200 hover:border-rose-300 bg-white"
                )}>
                <div className="w-full rounded-lg overflow-hidden shadow-sm" style={{ aspectRatio: "5/7" }}>
                  {COVER_TEMPLATE_PNG_MAP[tpl._id] ? (
                    <img src={COVER_TEMPLATE_PNG_MAP[tpl._id]} alt={tpl.name} className="w-full h-full object-cover" />
                  ) : SvgComponent ? <SvgComponent /> : (
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
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected template info banner */}
        {selectedTpl && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <p className="text-sm font-bold text-rose-700">{selectedTpl.name} — applied to all fields below</p>
            </div>
            <p className="text-xs text-gray-600">{selectedTpl.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
              <p><span className="font-semibold">Typography:</span> {selectedTpl.typography}</p>
              <p><span className="font-semibold">Atmosphere:</span> {selectedTpl.atmosphere}</p>
              <p className="col-span-2"><span className="font-semibold">Composition:</span> {selectedTpl.composition}</p>
            </div>
            <p className="text-[11px] text-rose-500 font-medium">↓ All fields below are now pre-filled — scroll down to review and customise</p>
          </div>
        )}
      </Section>

      {/* ── 2. Front Cover ── */}
      <Section icon="📖" title="Front Cover" defaultOpen={!!selectedTplId}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Book Title" hint="The main title as it will appear on the cover">
            <LiveInput value={cd.bookTitle || ""} placeholder="e.g. The Desert of Wonders"
              onChange={v => patch({ bookTitle: v })} />
          </Field>
          <Field label="Subtitle / Tagline">
            <LiveInput value={cd.subtitle || ""} placeholder="e.g. A Journey Beyond the Stars"
              onChange={v => patch({ subtitle: v })} />
          </Field>
          <Field label="Author Name">
            <LiveInput value={cd.authorName || ""} placeholder="e.g. Zara Al-Amin"
              onChange={v => patch({ authorName: v })} />
          </Field>
        </div>

        <Field label="Mood / Theme" hint="Tap to select — or leave for template default">
          <ImgTilePicker options={MOOD_TILES} value={cd.moodTheme || ""}
            onChange={v => patch({ moodTheme: v })} />
        </Field>

        <Field label="Color Style" hint="Primary palette for the cover">
          <ImgTilePicker options={COLOR_TILES} value={cd.colorStyle || ""}
            onChange={v => patch({ colorStyle: v })} />
        </Field>

        <Field label="Main Visual Concept" hint="The main scene to illustrate — be specific">
          <LiveTextarea value={cd.mainVisualConcept || ""}
            placeholder="e.g. Child silhouette standing before vast starry night sky with glowing crescent moon and distant mosque"
            onChange={v => patch({ mainVisualConcept: v })} rows={3} />
        </Field>

        <Field label="Character Description" hint="Main character appearance on the cover (optional)">
          <LiveTextarea value={cd.characterDescription || ""}
            placeholder="e.g. Silhouette of a young girl in abaya holding a lantern, facing away from viewer"
            onChange={v => patch({ characterDescription: v })} rows={2} />
        </Field>

        <Field label="Title Placement">
          <div className="grid grid-cols-3 gap-2 mt-1">
            {TITLE_PLACEMENT_OPTIONS.map(opt => {
              const isSel = cd.titlePlacement === opt.value;
              return (
                <button key={opt.value} type="button"
                  onClick={() => patch({ titlePlacement: isSel ? "" : opt.value })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all text-center hover:shadow-sm",
                    isSel ? "border-rose-500 bg-rose-50 shadow-sm" : "border-gray-200 hover:border-rose-300 bg-white"
                  )}>
                  <div className="w-12 h-12">{opt.icon}</div>
                  <span className={cn("text-[10px] font-semibold", isSel ? "text-rose-700" : "text-gray-600")}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* ── 3. Visual Style Settings ── */}
      <Section icon="✨" title="Visual Style Settings" defaultOpen={!!selectedTplId}>
        <Field label="Title Typography" hint="Tap to select font style">
          <ImgTilePicker options={TYPO_TILES} value={cd.typographyTitle || ""}
            onChange={v => patch({ typographyTitle: v })} />
        </Field>

        <Field label="Body Typography">
          <LiveInput value={cd.typographyBody || ""} placeholder="e.g. Clean readable sans-serif"
            onChange={v => patch({ typographyBody: v })} />
        </Field>

        <Field label="Lighting / Effects" hint="Tap to select lighting style">
          <ImgTilePicker options={LIGHTING_TILES} value={cd.lightingEffects || ""}
            onChange={v => patch({ lightingEffects: v })} />
        </Field>

        <div className="rounded-xl border border-gray-200 p-3 space-y-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Scene Layers</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Foreground">
              <LiveInput value={cd.foregroundLayer || ""} placeholder="e.g. Hero silhouette"
                onChange={v => patch({ foregroundLayer: v })} />
            </Field>
            <Field label="Midground">
              <LiveInput value={cd.midgroundLayer || ""} placeholder="e.g. Dramatic landscape"
                onChange={v => patch({ midgroundLayer: v })} />
            </Field>
            <Field label="Background">
              <LiveInput value={cd.backgroundLayer || ""} placeholder="e.g. Epic dark sky"
                onChange={v => patch({ backgroundLayer: v })} />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Atmosphere — Middle Grade">
            <LiveTextarea value={cd.atmosphere?.middleGrade || ""}
              placeholder="e.g. Cinematic lighting, mystery in background"
              onChange={v => patch({ atmosphere: { ...cd.atmosphere, middleGrade: v } })} rows={2} />
          </Field>
          <Field label="Atmosphere — Junior">
            <LiveTextarea value={cd.atmosphere?.junior || ""}
              placeholder="e.g. Bright joyful colors, plot-related objects"
              onChange={v => patch({ atmosphere: { ...cd.atmosphere, junior: v } })} rows={2} />
          </Field>
        </div>
      </Section>

      {/* ── 4. Spine ── */}
      <Section icon="📏" title="Spine" defaultOpen={false}>
        <Field label="Spine Style Template" hint="Tap to select a visual style — used in AI spine generation">
          <ImgTilePicker
            options={SPINE_TEMPLATES.map(t => ({ value: t.value, label: t.label, img: t.img }))}
            value={cd.selectedSpineTemplate || ""}
            onChange={v => {
              const tpl = SPINE_TEMPLATES.find(t => t.value === v);
              patch({
                selectedSpineTemplate: v || null,
                spineColorBackground: tpl?.colorBackground || "",
                spineTypographyStyle: tpl?.typographyStyle || "",
                spinePromptDirective: tpl?.promptDirective || "",
              });
            }}
          />
        </Field>
        {cd.selectedSpineTemplate && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3">
            <p className="text-xs font-bold text-indigo-700">
              {SPINE_TEMPLATES.find(t => t.value === cd.selectedSpineTemplate)?.label} spine style selected
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {SPINE_TEMPLATES.find(t => t.value === cd.selectedSpineTemplate)?.colorBackground}
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Spine Title (Vertical)">
            <LiveInput value={cd.spineTitle || ""} placeholder="Same as book title"
              onChange={v => patch({ spineTitle: v })} />
          </Field>
          <Field label="Spine Author Name">
            <LiveInput value={cd.spineAuthor || ""} placeholder="Author name"
              onChange={v => patch({ spineAuthor: v })} />
          </Field>
          <Field label="Publisher Logo">
            <LiveInput value={cd.publisherLogo || ""} placeholder="Publisher name or description"
              onChange={v => patch({ publisherLogo: v })} />
          </Field>
        </div>
      </Section>

      {/* ── 5. Back Cover ── */}
      <Section icon="📝" title="Back Cover" defaultOpen={false}>
        <Field label="Back Cover Style Template" hint="Tap to select a visual style — used in AI back cover generation">
          <ImgTilePicker
            options={BACK_COVER_TEMPLATES.map(t => ({ value: t.value, label: t.label, img: t.img }))}
            value={cd.selectedBackTemplate || ""}
            onChange={v => {
              const tpl = BACK_COVER_TEMPLATES.find(t => t.value === v);
              patch({
                selectedBackTemplate: v || null,
                backBackgroundStyle: tpl?.backgroundStyle || "",
                backPromptDirective: tpl?.promptDirective || "",
              });
            }}
          />
        </Field>
        {cd.selectedBackTemplate && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-xs font-bold text-emerald-700">
              {BACK_COVER_TEMPLATES.find(t => t.value === cd.selectedBackTemplate)?.label} back cover style selected
            </p>
            <p className="text-[11px] text-gray-600 mt-0.5">
              {BACK_COVER_TEMPLATES.find(t => t.value === cd.selectedBackTemplate)?.backgroundStyle}
            </p>
          </div>
        )}
        <Field label="Blurb (Story Description)" hint="120–180 words: character → situation → conflict → hook">
          <LiveTextarea value={cd.blurb || ""}
            placeholder={"Introduce main character...\nExplain the situation or problem...\nAdd conflict or tension...\nEnd with a hook that makes readers want to open the book."}
            onChange={v => patch({ blurb: v })} rows={6} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Publisher Name">
            <LiveInput value={cd.publisherName || ""} placeholder="e.g. Noor Publishing"
              onChange={v => patch({ publisherName: v })} />
          </Field>
          <Field label="Website (optional)">
            <LiveInput value={cd.website || ""} placeholder="e.g. noorstudio.com"
              onChange={v => patch({ website: v })} />
          </Field>
          <Field label="Price (optional)">
            <LiveInput value={cd.price || ""} placeholder="e.g. £8.99 / $10.99"
              onChange={v => patch({ price: v })} />
          </Field>
          <Field label="ISBN Number">
            <LiveInput value={cd.isbn || ""} placeholder="e.g. 978-0-00-000000-0"
              onChange={v => patch({ isbn: v })} />
          </Field>
        </div>
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
          <p className="text-xs text-amber-700 font-semibold">📌 Barcode — auto-generated from ISBN when published</p>
        </div>
      </Section>

      {/* ── 6. Design Settings ── */}
      <Section icon="📐" title="Design Settings" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trim Size" hint="Final printed book dimensions">
            <LiveInput value={cd.trimSize || ""} placeholder="e.g. 6 × 9 inches"
              onChange={v => patch({ trimSize: v })} />
          </Field>
          <Field label="Spine Width">
            <LiveInput value={cd.spineWidth || ""} placeholder="e.g. 0.85 inches (200 pages)"
              onChange={v => patch({ spineWidth: v })} />
          </Field>
          <Field label="Bleed">
            <LiveInput value={cd.bleed || "0.125 inch"} placeholder="0.125 inch (standard)"
              onChange={v => patch({ bleed: v })} />
          </Field>
          <Field label="Resolution">
            <LiveInput value={cd.resolution || "300 DPI"} placeholder="300 DPI (print standard)"
              onChange={v => patch({ resolution: v })} />
          </Field>
        </div>
      </Section>

      {/* ── 7. Rules & Restrictions ── */}
      <Section icon="📋" title="Rules & Restrictions" defaultOpen={false}>
        <TagPills label="Islamic Motifs" items={islamicMotifs}
          placeholder="e.g. Crescent moon, arabesque border, mosque silhouette"
          onAdd={v => patch({ islamicMotifs: [...islamicMotifs, v] })}
          onRemove={i => patch({ islamicMotifs: islamicMotifs.filter((_: string, j: number) => j !== i) })} />
        <TagPills label="Branding Rules" items={brandingRules}
          placeholder="e.g. Series logo must appear prominently"
          onAdd={v => patch({ brandingRules: [...brandingRules, v] })}
          onRemove={i => patch({ brandingRules: brandingRules.filter((_: string, j: number) => j !== i) })} />
        <TagPills label="Character Composition Rules" items={characterComp}
          placeholder="e.g. Eye contact with reader preferred for Middle Grade"
          onAdd={v => patch({ characterComposition: [...characterComp, v] })}
          onRemove={i => patch({ characterComposition: characterComp.filter((_: string, j: number) => j !== i) })} />
        <TagPills label="Optional Add-ons" items={optionalAddons}
          placeholder="e.g. Icon badge, corner headshot, series number"
          onAdd={v => patch({ optionalAddons: [...optionalAddons, v] })}
          onRemove={i => patch({ optionalAddons: optionalAddons.filter((_: string, j: number) => j !== i) })} />
        <TagPills label="Avoid on Cover" items={avoidCover}
          placeholder="e.g. Generic centered-character-only templates"
          onAdd={v => patch({ avoidCover: [...avoidCover, v] })}
          onRemove={i => patch({ avoidCover: avoidCover.filter((_: string, j: number) => j !== i) })} />
        <Field label="Extra Notes">
          <LiveInput value={cd.extraNotes || ""} placeholder="Any other cover direction for AI..."
            onChange={v => patch({ extraNotes: v })} />
        </Field>
      </Section>
    </div>
  );
}
