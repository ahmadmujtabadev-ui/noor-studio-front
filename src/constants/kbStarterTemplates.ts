/**
 * DEFAULT_KB_STARTER_TEMPLATES
 *
 * Two normalised starter templates that cover every age group NoorStudio serves.
 * Each template fully populates every KB section so users start with a solid
 * foundation they can edit, not a blank canvas.
 *
 * Image strategy: store generated images at /public/assets/kb-templates/<id>.jpg
 * Set previewImage to null until an image exists — the UI renders a gradient placeholder.
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface KBDua {
  arabic?: string;
  transliteration: string;
  meaning: string;
  context?: string;
}

export interface KBAgeGroupBackground {
  tone?: string;
  colorStyle?: string;
  lightingStyle?: string;
  timeOfDay?: string;
  cameraHint?: string;
  locations?: string[];
  keyFeatures?: string[];
  additionalNotes?: string;
}

export interface KBStarterTemplate {
  id: string;
  name: string;
  ageGroup: "under-six" | "middle-grade";
  ageRange: string;
  tagline: string;
  description: string;
  /** Path relative to /public — null until generated */
  previewImage: string | null;
  /** AI prompt used to generate the preview image (store for regeneration) */
  previewPrompt: string;
  /** 4 colours that summarise the template's visual identity */
  palette: [string, string, string, string];
  /** Short feature bullets shown in template cards */
  highlightBadges: string[];

  // ── Full KB data ────────────────────────────────────────────────────────────
  islamicValues: string[];
  duas: KBDua[];
  avoidTopics: string[];
  backgroundSettings: {
    junior?: KBAgeGroupBackground;
    middleGrade?: KBAgeGroupBackground;
    saeeda?: KBAgeGroupBackground;
    avoidBackgrounds?: string[];
    universalRules?: string;
  };
  coverDesign: {
    selectedCoverTemplate: string;
    moodTheme?: string;
    colorStyle?: string;
    lightingEffects?: string;
    atmosphere?: { junior?: string; middleGrade?: string; saeeda?: string };
    typography?: { junior?: string; middleGrade?: string; saeeda?: string };
    islamicMotifs?: string[];
    characterComposition?: string[];
    avoidCover?: string[];
    titlePlacement?: string;
  };
  bookFormatting: {
    junior?: { wordCount?: string; pageCount?: string; segmentCount?: string };
    middleGrade?: { wordCount?: string; chapterRange?: string; sceneLength?: string };
  };
  underSixDesign?: {
    maxWordsPerSpread: number;
    readingType: string;
    pageLayout: string;
    fontStyle: string;
  };
}

// ─── Template 1 — Under Six ────────────────────────────────────────────────────

const underSix: KBStarterTemplate = {
  id: "kbt_under_six",
  name: "Under Six",
  ageGroup: "under-six",
  ageRange: "Ages 3–6",
  tagline: "Safe, bright, and full of barakah",
  description:
    "Perfect for picture books and parent-read-aloud stories. Simple faith values, gentle du'as, warm safe scenes, and large-text formatting designed for the very young.",
  previewImage: "/kb-templates/under-six.png",
  previewPrompt:
    "Children's book illustration, warm cosy Islamic home interior, bright morning light streaming through curtained window, young Muslim girl aged 4 wearing soft green dress and cream hijab sitting cross-legged reading a colourful picture book, surrounded by a crescent moon mobile, soft star-shaped cushions, simple Islamic geometric wall art in pastel blue and gold, Pixar 3D render style, warm golden hour light, safe and inviting, high saturation, rounded shapes, friendly atmosphere",
  palette: ["#FFD93D", "#4FC3F7", "#81C784", "#F5A623"],
  highlightBadges: [
    "Ages 3–6 picture book",
    "Parent read-aloud",
    "Max 12 words / spread",
    "Simple du'as & values",
    "Classic Children's cover style",
  ],

  islamicValues: [
    "Saying Alhamdulillah with gratitude",
    "Sharing is a form of sadaqah",
    "Kindness to animals is rewarded by Allah",
    "Listening to parents and grandparents",
    "Saying Bismillah before eating and starting tasks",
    "Helping others makes Allah happy",
    "Smiling at others is sadaqah",
    "Saying Salaam to spread peace",
  ],

  duas: [
    {
      arabic: "بِسْمِ اللَّهِ",
      transliteration: "Bismillah",
      meaning: "In the name of Allah",
      context: "Before eating, drinking, or starting activities",
    },
    {
      arabic: "الْحَمْدُ لِلَّهِ",
      transliteration: "Alhamdulillah",
      meaning: "All praise is for Allah",
      context: "Expressing gratitude after meals or blessings",
    },
    {
      arabic: "سُبْحَانَ اللَّهِ",
      transliteration: "SubhanAllah",
      meaning: "Glory be to Allah",
      context: "When seeing something beautiful in nature",
    },
    {
      arabic: "اللَّهُمَّ بَارِكْ لَنَا",
      transliteration: "Allahumma barik lana",
      meaning: "O Allah, bless us",
      context: "Asking for blessings before important moments",
    },
  ],

  avoidTopics: [
    "Violence or scary content",
    "Adult relationships or romance",
    "Death described graphically",
    "Complex theology or abstract doctrine",
    "Frightening animals or monsters",
    "Conflict without resolution",
  ],

  backgroundSettings: {
    junior: {
      // Exact values that match the visual picker options in KBBackgroundSettings.tsx
      tone: "bright, safe, familiar, cheerful",
      colorStyle: "vibrant, saturated, primary colors with warm accents",
      lightingStyle: "soft diffused daylight, even illumination, crisp and clear",
      timeOfDay: "afternoon",
      cameraHint: "medium",
      locations: [
        "bedroom",
        "masjid",
        "garden",
        "school classroom",
        "kitchen",
      ],
      keyFeatures: [
        "Rounded soft shapes",
        "Warm safe lighting",
        "Clear foreground separation",
        "Islamic motifs woven naturally",
      ],
    },
    avoidBackgrounds: [
      "Dark or shadowy environments",
      "Crowded complex scenes",
      "Abstract or confusing backgrounds",
    ],
    universalRules:
      "Every scene must feel handcrafted and safe. Backgrounds should be simple enough that a 3-year-old understands the space immediately.",
  },

  coverDesign: {
    selectedCoverTemplate: "ct_classic_children",
    // Exact values matching cover picker options in KBCoverDesign.tsx
    moodTheme: "Bright, joyful, children's adventure — safe and exciting",
    colorStyle: "Vibrant warm yellows, oranges, sky blue — high saturation",
    lightingEffects: "Warm amber golden-hour glow, long shadows, warm sunlight",
    typographyTitle: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    atmosphere: {
      junior: "Bright joyful sunshine, warm golden light, safe and exciting",
    },
    typography: {
      junior: "Bold rounded — Fredoka One, Baloo Bhaijaan",
    },
    islamicMotifs: ["Crescent moon", "Stars", "Simple geometric star patterns"],
    characterComposition: [
      "Main character centered lower-half",
      "Big expressive sky background",
      "Character making eye contact with reader",
      "Expression: happy, curious, or welcoming",
    ],
    avoidCover: [
      "Dark moody lighting",
      "Complex multi-character scenes without clear focal point",
      "Text-heavy design",
      "Realistic or photo-realistic style",
    ],
    titlePlacement: "top-center",
  },

  bookFormatting: {
    junior: {
      wordCount: "500–1,500",
      pageCount: "24–32 pages",
      segmentCount: "4–6 segments",
    },
  },

  underSixDesign: {
    maxWordsPerSpread: 12,
    readingType: "parent-read",
    pageLayout:
      "Full-page illustration left, short text right — maximum 12 words per spread",
    fontStyle:
      "Rounded, large, high-contrast, dyslexia-friendly — minimum 24pt equivalent",
  },
};

// ─── Template 2 — Middle Grade (Ages 8–14) ─────────────────────────────────────

const middleGrade: KBStarterTemplate = {
  id: "kbt_middle_grade",
  name: "Ages 8–14",
  ageGroup: "middle-grade",
  ageRange: "Ages 8–14",
  tagline: "Epic adventures rooted in faith",
  description:
    "For chapter books and middle-grade adventures with complex characters, moral dilemmas, and faith tested through action. Cinematic storytelling with layered Islamic themes woven naturally.",
  previewImage: "/kb-templates/middle-grade.png",
  previewPrompt:
    "Cinematic children's book cover illustration, young Muslim boy aged 11 wearing a white thobe standing on a rocky cliff edge at golden hour, looking out over an ancient Islamic city with tall minarets and a crescent moon in the dramatic twilight sky, warm amber and deep purple atmosphere, volumetric clouds, epic scale, Pixar 3D render quality, rim lighting on character, sense of adventure discovery and courage, rich deep colours #1A2456 and #C9A84C",
  palette: ["#1A2456", "#C9A84C", "#2D6A4F", "#E94560"],
  highlightBadges: [
    "Ages 8–14 chapter book",
    "20,000–35,000 words",
    "Cinematic epic cover style",
    "Faith through action & moral dilemmas",
    "Rich character voice & faith integration",
  ],

  islamicValues: [
    "Sabr (patience) in the face of difficulty",
    "Tawakkul (trust in Allah) after doing your best",
    "Honesty even when it is costly",
    "Courage comes from faith, not fearlessness",
    "Respecting knowledge and those who teach it",
    "Speaking up for justice even when it is hard",
    "Brotherhood and sisterhood in Islam",
    "Gratitude (shukr) as a daily practice",
    "Seeking knowledge is an act of worship",
  ],

  duas: [
    {
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbunallahu wa ni'mal wakeel",
      meaning: "Allah is sufficient for us and He is the best disposer of affairs",
      context: "When facing overwhelming odds, fear, or injustice",
    },
    {
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
      transliteration: "Rabbi ishrah li sadri",
      meaning: "My Lord, expand my chest with ease",
      context: "Before a challenge, difficult conversation, or important decision",
    },
    {
      arabic:
        "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
      transliteration:
        "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
      meaning:
        "There is no god but You, glory be to You — I was among the wrongdoers",
      context: "When the character realises they made a serious mistake",
    },
    {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ",
      transliteration: "Allahumma inni as'aluka ath-thabat",
      meaning: "O Allah, I ask You for steadfastness",
      context: "Before a moment that requires courage and standing firm",
    },
  ],

  avoidTopics: [
    "Graphic violence or gore",
    "Romance beyond age-appropriate friendship",
    "Mockery of Islamic practices or scholars",
    "Hopeless or nihilistic endings",
    "Stereotyping of Muslims or other groups",
    "Profanity or adult language",
  ],

  backgroundSettings: {
    middleGrade: {
      // Exact values that match the visual picker options in KBBackgroundSettings.tsx
      tone: "cinematic, dramatic, adventurous with emotional warmth",
      colorStyle: "rich warm tones, oranges, reds, ambers and burnt sienna",
      lightingStyle: "golden hour warm light, long shadows, amber and copper tones",
      timeOfDay: "golden-hour",
      cameraHint: "wide",
      locations: [
        "masjid",
        "desert dunes",
        "forest",
        "market souk",
        "library",
        "snowy mountain",
      ],
      keyFeatures: [
        "Three-layer depth (foreground, mid, background)",
        "Islamic architectural detail in environment",
        "Epic scale and sense of journey",
        "Emotional lighting that matches story tension",
      ],
    },
    avoidBackgrounds: [
      "Flat or plain backgrounds",
      "Modern Western urban environments without Islamic context",
      "Cartoonishly simple scenes that undermine the epic tone",
    ],
    universalRules:
      "Every scene must have a sense of history, faith, and adventure. The environment should feel like a character in the story.",
  },

  coverDesign: {
    selectedCoverTemplate: "ct_epic_cinematic",
    // Exact values matching cover picker options in KBCoverDesign.tsx
    moodTheme: "Epic, dramatic, cinematic fantasy adventure",
    colorStyle: "Dark midnight blue and deep purple with red accent glow",
    lightingEffects: "Dramatic rim lighting, volumetric fog, cinematic purple dusk sky",
    typographyTitle: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    atmosphere: {
      middleGrade:
        "Cinematic dramatic lighting, epic scale, sense of adventure and faith-driven discovery",
    },
    typography: {
      middleGrade: "Bold condensed serif — Cinzel, Trajan, Bebas Neue",
    },
    islamicMotifs: [
      "Mosque silhouette against dramatic sky",
      "Islamic geometric pattern in architecture or ground",
      "Crescent moon in sky",
    ],
    characterComposition: [
      "Main character in dynamic pose — lower center",
      "Character slightly turned, looking toward horizon or challenge",
      "Expression shows determination and quiet faith",
      "Epic landscape dominates the upper 50% of cover",
    ],
    avoidCover: [
      "Bright cheery children's colours",
      "Flat 2D illustration style",
      "Static front-facing character pose",
      "Cluttered busy composition",
    ],
    titlePlacement: "top-center",
  },

  bookFormatting: {
    middleGrade: {
      wordCount: "20,000–35,000",
      chapterRange: "8–12 chapters",
      sceneLength: "500–800 words per scene",
    },
  },
};

// ─── Export ────────────────────────────────────────────────────────────────────

export const DEFAULT_KB_STARTER_TEMPLATES: KBStarterTemplate[] = [
  underSix,
  middleGrade,
];

export type KBStarterTemplateId = "kbt_under_six" | "kbt_middle_grade";

/** Build the KB update payload from a starter template */
export function buildKBPayloadFromTemplate(
  tpl: KBStarterTemplate
): Record<string, unknown> {
  return {
    islamicValues: tpl.islamicValues,
    duas: tpl.duas,
    avoidTopics: tpl.avoidTopics,
    backgroundSettings: tpl.backgroundSettings,
    coverDesign: tpl.coverDesign,
    bookFormatting: tpl.bookFormatting,
    ...(tpl.underSixDesign ? { underSixDesign: tpl.underSixDesign } : {}),
  };
}
