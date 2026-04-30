/**
 * KB starter templates used by the gallery, dashboard, and KB creation flow.
 * T-54 expands the library to a universal-first taxonomy with Islamic-Forward
 * as a flagship flavour, plus visible roadmap flavour placeholders.
 */

export interface KBDua {
  arabic: string;
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

export type KBAgeGroup = "under-six" | "middle-grade";
export type KBTemplateFlavour = "universal" | "islamic-forward";
export type KBTemplateTheme =
  | "wholesome-everyday"
  | "adventure-discovery"
  | "animals-nature";

export interface KBStarterTemplate {
  id: string;
  name: string;
  ageGroup: KBAgeGroup;
  ageRange: string;
  flavour: KBTemplateFlavour;
  flavourLabel: string;
  theme: KBTemplateTheme;
  themeLabel: string;
  tagline: string;
  description: string;
  previewImage: string | null;
  previewPrompt: string;
  palette: [string, string, string, string];
  highlightBadges: string[];
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

export interface KBTemplateRoadmapFlavour {
  id: string;
  label: string;
  description: string;
  status: "coming-soon";
}

const BASE_JUNIOR_BACKGROUND: KBAgeGroupBackground = {
  tone: "bright, safe, familiar, cheerful",
  colorStyle: "vibrant, saturated, primary colors with warm accents",
  lightingStyle: "soft diffused daylight, even illumination, crisp and clear",
  timeOfDay: "afternoon",
  cameraHint: "medium",
  locations: ["bedroom", "garden", "school classroom", "family kitchen", "park"],
  keyFeatures: [
    "Rounded soft shapes",
    "Warm safe lighting",
    "Clear foreground separation",
    "Emotion-first storytelling spaces",
  ],
};

const BASE_MIDDLE_GRADE_BACKGROUND: KBAgeGroupBackground = {
  tone: "cinematic, adventurous, emotionally warm",
  colorStyle: "rich warm tones, jewel accents, storybook contrast",
  lightingStyle: "golden hour and soft dusk lighting with layered depth",
  timeOfDay: "golden-hour",
  cameraHint: "wide",
  locations: ["library", "courtyard", "market street", "forest trail", "hilltop"],
  keyFeatures: [
    "Three-layer depth",
    "Clear story movement through space",
    "Inviting scale for chapter-book scenes",
    "Texture and atmosphere without clutter",
  ],
};

const BASE_UNDER_SIX_VALUES = [
  "Saying Alhamdulillah with gratitude",
  "Sharing is a form of kindness",
  "Listening to parents and grandparents",
  "Helping others makes Allah happy",
  "Saying Salaam to spread peace",
  "Caring for animals gently",
];

const BASE_MIDDLE_GRADE_VALUES = [
  "Sabr (patience) in the face of difficulty",
  "Tawakkul (trust in Allah) after doing your best",
  "Honesty even when it is costly",
  "Courage comes from faith, not fearlessness",
  "Seeking knowledge is an act of worship",
  "Speaking up for justice with wisdom",
];

const BASE_UNDER_SIX_DUAS: KBDua[] = [
  {
    arabic: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    meaning: "In the name of Allah",
    context: "Before starting an activity",
  },
  {
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    meaning: "All praise is for Allah",
    context: "After receiving a blessing",
  },
  {
    arabic: "اللَّهُمَّ بَارِكْ لَنَا",
    transliteration: "Allahumma barik lana",
    meaning: "O Allah, bless us",
    context: "Before important or joyful moments",
  },
];

const BASE_MIDDLE_GRADE_DUAS: KBDua[] = [
  {
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal wakeel",
    meaning: "Allah is sufficient for us and He is the best disposer of affairs",
    context: "When facing something difficult or uncertain",
  },
  {
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي",
    transliteration: "Rabbi ishrah li sadri",
    meaning: "My Lord, expand my chest with ease",
    context: "Before a challenge or important conversation",
  },
  {
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الثَّبَاتَ",
    transliteration: "Allahumma inni as'aluka ath-thabat",
    meaning: "O Allah, I ask You for steadfastness",
    context: "Before a moment that requires courage",
  },
];

const BASE_UNDER_SIX_AVOID = [
  "Violence or scary content",
  "Adult relationships or romance",
  "Death described graphically",
  "Complex abstract doctrine",
  "Frightening monsters or horror tone",
];

const BASE_MIDDLE_GRADE_AVOID = [
  "Graphic violence or gore",
  "Profanity or adult language",
  "Hopeless or nihilistic endings",
  "Romance beyond age-appropriate friendship",
  "Mockery of Islamic practices or scholars",
];

const COMMON_UNDER_SIX_DESIGN = {
  maxWordsPerSpread: 12,
  readingType: "parent-read",
  pageLayout: "Full-page illustration with short text blocks and clear breathing room",
  fontStyle: "Rounded, large, high-contrast, dyslexia-friendly",
};

function createUnderSixTemplate(
  template: Omit<
    KBStarterTemplate,
    | "ageGroup"
    | "ageRange"
    | "bookFormatting"
    | "underSixDesign"
  > & {
    bookFormatting?: KBStarterTemplate["bookFormatting"];
    underSixDesign?: KBStarterTemplate["underSixDesign"];
  }
): KBStarterTemplate {
  return {
    ageGroup: "under-six",
    ageRange: "Ages 3-6",
    bookFormatting: {
      junior: {
        wordCount: "500-1,500",
        pageCount: "24-32 pages",
        segmentCount: "4-6 segments",
      },
      ...template.bookFormatting,
    },
    underSixDesign: template.underSixDesign ?? COMMON_UNDER_SIX_DESIGN,
    ...template,
  };
}

function createMiddleGradeTemplate(
  template: Omit<KBStarterTemplate, "ageGroup" | "ageRange" | "bookFormatting"> & {
    bookFormatting?: KBStarterTemplate["bookFormatting"];
  }
): KBStarterTemplate {
  return {
    ageGroup: "middle-grade",
    ageRange: "Ages 8-14",
    bookFormatting: {
      middleGrade: {
        wordCount: "20,000-35,000",
        chapterRange: "8-12 chapters",
        sceneLength: "500-800 words per scene",
      },
      ...template.bookFormatting,
    },
    ...template,
  };
}

const universalUnderSix = createUnderSixTemplate({
  id: "kbt_universal_under_six",
  name: "Universal Wholesome - Under Six",
  flavour: "universal",
  flavourLabel: "Universal",
  theme: "wholesome-everyday",
  themeLabel: "Wholesome Everyday",
  tagline: "Safe, bright, and full of everyday wonder",
  description:
    "A gentle universal picture-book starter for family warmth, friendship, curiosity, and simple values without overt faith-coded framing.",
  previewImage: "/kb-templates/5.png",
  previewPrompt:
    "Children's book banner, cozy family reading corner at sunrise, child age 4 with expressive eyes reading beside a parent, warm gold and teal palette, soft cushions, books, window light, playful shapes, no text, premium storybook illustration, wholesome universal atmosphere",
  palette: ["#F7C948", "#76C7C0", "#F49D37", "#FFF2CC"],
  highlightBadges: [
    "Universal flagship",
    "Ages 3-6 picture book",
    "Parent read-aloud",
    "Everyday family warmth",
    "Editable after apply",
  ],
  islamicValues: BASE_UNDER_SIX_VALUES,
  duas: BASE_UNDER_SIX_DUAS,
  avoidTopics: BASE_UNDER_SIX_AVOID,
  backgroundSettings: {
    junior: BASE_JUNIOR_BACKGROUND,
    avoidBackgrounds: ["Dark shadowy rooms", "Chaotic crowded scenes", "Visually confusing layouts"],
    universalRules:
      "Scenes should feel warm, understandable, and emotionally safe within a second of viewing.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_classic_children",
    moodTheme: "Warm, welcoming, and gentle storybook wonder",
    colorStyle: "Sunny yellows, soft teals, coral accents, creamy neutrals",
    lightingEffects: "Morning glow with soft bloom and gentle contrast",
    atmosphere: {
      junior: "Cheerful, safe, and emotionally reassuring",
    },
    typography: {
      junior: "Bold rounded display with soft friendly curves",
    },
    islamicMotifs: ["Stars", "Subtle geometric shapes"],
    characterComposition: [
      "Main child character in lower center",
      "Clear focal point and open negative space",
      "Friendly eye contact or engaged activity",
    ],
    avoidCover: ["Photo-realism", "Busy multi-character clutter", "Dark moody grading"],
    titlePlacement: "top-center",
  },
});

const universalMiddleGrade = createMiddleGradeTemplate({
  id: "kbt_universal_middle_grade",
  name: "Universal Wholesome - Ages 8-14",
  flavour: "universal",
  flavourLabel: "Universal",
  theme: "wholesome-everyday",
  themeLabel: "Wholesome Everyday",
  tagline: "Character-led stories with courage, humour, and heart",
  description:
    "A universal chapter-book starter for friendship, discovery, family life, and coming-of-age stories with broad appeal and clean values.",
  previewImage: "/kb-templates/6.png",
  previewPrompt:
    "Cinematic storybook banner, child age 11 standing on a rooftop at sunset looking across a lively old city, glowing sky, adventurous but grounded, warm oranges and deep blue, premium illustrated cover art, no text, universal middle-grade energy",
  palette: ["#1F3C88", "#F7B267", "#5DA9E9", "#F4845F"],
  highlightBadges: [
    "Universal flagship",
    "Ages 8-14 chapter book",
    "Friendship and growth",
    "Adventure-ready pacing",
    "Editable after apply",
  ],
  islamicValues: BASE_MIDDLE_GRADE_VALUES,
  duas: BASE_MIDDLE_GRADE_DUAS,
  avoidTopics: BASE_MIDDLE_GRADE_AVOID,
  backgroundSettings: {
    middleGrade: BASE_MIDDLE_GRADE_BACKGROUND,
    avoidBackgrounds: ["Flat empty locations", "Overly modern sterile scenes", "Low-contrast muddy color"],
    universalRules:
      "Environments should feel story-rich and inviting, with room for emotional stakes and wonder.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_epic_cinematic",
    moodTheme: "Big-hearted middle-grade adventure with emotional warmth",
    colorStyle: "Sunset oranges, twilight blue, brass highlights, grounded neutrals",
    lightingEffects: "Layered cinematic dusk with rim light and atmospheric depth",
    atmosphere: {
      middleGrade: "Hopeful, expansive, and full of possibility",
    },
    typography: {
      middleGrade: "Bold serif or sturdy display title with strong silhouette",
    },
    islamicMotifs: ["Architectural pattern detail", "Skyline rhythm", "Decorative star geometry"],
    characterComposition: [
      "Hero figure facing the next challenge",
      "Landscape occupies upper half",
      "Readable silhouette with strong mood lighting",
    ],
    avoidCover: ["Flat cartoon minimalism", "Grimdark tone", "Cluttered collage"],
    titlePlacement: "top-center",
  },
});

const universalAdventure = createMiddleGradeTemplate({
  id: "kbt_universal_adventure_discovery",
  name: "Adventure & Discovery",
  flavour: "universal",
  flavourLabel: "Universal",
  theme: "adventure-discovery",
  themeLabel: "Adventure & Discovery",
  tagline: "Journeys, quests, clues, and brave first steps",
  description:
    "Built for travel, mysteries, hidden maps, daring rescues, and discovery-driven plotting while staying wholesome and age-appropriate.",
  previewImage: "/kb-templates/3.png",
  previewPrompt:
    "Wide children's book banner, two young explorers with lantern and satchel entering a glowing canyon path at golden hour, map edges, wind, discovery, cinematic illustration, premium middle-grade adventure style, no text",
  palette: ["#E76F51", "#264653", "#E9C46A", "#2A9D8F"],
  highlightBadges: [
    "Universal",
    "Adventure theme",
    "Quest-ready pacing",
    "Maps and mystery hooks",
    "Ages 8-14",
  ],
  islamicValues: [
    ...BASE_MIDDLE_GRADE_VALUES,
    "Curiosity can be a path to wisdom",
    "Teamwork multiplies courage",
  ],
  duas: BASE_MIDDLE_GRADE_DUAS,
  avoidTopics: [...BASE_MIDDLE_GRADE_AVOID, "Meaningless peril without purpose"],
  backgroundSettings: {
    middleGrade: {
      ...BASE_MIDDLE_GRADE_BACKGROUND,
      locations: ["desert pass", "forest trail", "ruined observatory", "seaside port", "hidden library"],
      keyFeatures: [
        "Travel energy and forward motion",
        "Clear path or destination cue",
        "Environmental mystery",
        "Large-scale sense of journey",
      ],
    },
    avoidBackgrounds: ["Static indoor-only repetition", "Confusing action staging"],
    universalRules:
      "Every scene should suggest movement, purpose, and an invitation to keep turning pages.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_epic_cinematic",
    moodTheme: "Quest energy, discovery, courage, and wonder",
    colorStyle: "Burnt orange, deep teal, brass, and storm-blue contrast",
    lightingEffects: "Directional light, glowing horizon, atmospheric dust",
    atmosphere: {
      middleGrade: "Restless, brave, and exciting without becoming frightening",
    },
    typography: {
      middleGrade: "Bold high-contrast title with adventurous silhouette",
    },
    islamicMotifs: ["Compass-like geometry", "Decorative stars", "Architectural arches in the distance"],
    characterComposition: [
      "Characters moving toward a destination",
      "Foreground prop like map, lantern, or satchel",
      "Strong horizon line and sense of scale",
    ],
    avoidCover: ["Passive standing pose", "Flat white background", "Photographic realism"],
    titlePlacement: "top-center",
  },
});

const universalAnimals = createUnderSixTemplate({
  id: "kbt_universal_animals_nature",
  name: "Animals & Nature",
  flavour: "universal",
  flavourLabel: "Universal",
  theme: "animals-nature",
  themeLabel: "Animals & Nature",
  tagline: "Tender animal stories, gardens, rain, and outdoor wonder",
  description:
    "A universal under-six starter for creature friends, nature walks, gentle discovery, and calm emotional learning through the outdoors.",
  previewImage: "/kb-templates/4.png",
  previewPrompt:
    "Children's book banner, joyful child in a garden with a robin, rabbit, and butterflies, morning dew, soft sunlight through leaves, lush greens, premium illustrated style, no text, safe nature wonder for ages 3 to 6",
  palette: ["#6FBF73", "#A7D676", "#F4D35E", "#4EA8DE"],
  highlightBadges: [
    "Universal",
    "Animals and nature",
    "Ages 3-6",
    "Outdoor wonder",
    "Gentle learning moments",
  ],
  islamicValues: [
    "Kindness to animals matters",
    "The natural world invites gratitude",
    "Wonder can lead to thankfulness",
    "Gentle behaviour keeps others safe",
    "Caring for small things builds mercy",
  ],
  duas: BASE_UNDER_SIX_DUAS,
  avoidTopics: [...BASE_UNDER_SIX_AVOID, "Predator-prey fear framing"],
  backgroundSettings: {
    junior: {
      ...BASE_JUNIOR_BACKGROUND,
      locations: ["garden", "meadow", "orchard", "pond edge", "backyard"],
      keyFeatures: [
        "Friendly animal companions",
        "Fresh greens and floral accents",
        "Simple readable landscape shapes",
        "Nature details scaled for young readers",
      ],
    },
    avoidBackgrounds: ["Harsh storms", "Dangerous wilderness"],
    universalRules:
      "Nature should feel magical, accessible, and calm enough for repeated bedtime reading.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_classic_children",
    moodTheme: "Fresh, joyful, and full of soft natural wonder",
    colorStyle: "Leafy greens, sky blue, butter yellow, and berry accents",
    lightingEffects: "Crisp morning light with soft leaf shadows",
    atmosphere: {
      junior: "Calm, curious, and gently playful",
    },
    typography: {
      junior: "Rounded playful display with organic rhythm",
    },
    islamicMotifs: ["Subtle stars", "Petal-like geometric shapes"],
    characterComposition: [
      "Child and animal companion on one focal plane",
      "Clear nature framing around the title area",
      "Open space and cheerful expressions",
    ],
    avoidCover: ["Dark forest horror cues", "Busy wildlife swarms"],
    titlePlacement: "top-center",
  },
});

const islamicUnderSix = createUnderSixTemplate({
  id: "kbt_islamic_under_six",
  name: "Islamic-Forward - Under Six",
  flavour: "islamic-forward",
  flavourLabel: "Islamic-Forward",
  theme: "wholesome-everyday",
  themeLabel: "Wholesome Everyday",
  tagline: "Gentle faith habits for the very young",
  description:
    "A polished under-six template with explicit Islamic family language, simple du'as, and warm home-and-masjid scenes for early childhood stories.",
  previewImage: "/kb-templates/1.png",
  previewPrompt:
    "Children's book banner, cozy Muslim family home, child in cream hijab reading near star cushions and warm lantern light, pastel teal and honey gold, premium 3D storybook illustration, no text, gentle Islamic-forward under-six mood",
  palette: ["#D4A373", "#5CA4A9", "#F6E7CB", "#E9C46A"],
  highlightBadges: [
    "Islamic-Forward",
    "Ages 3-6 picture book",
    "Simple du'as",
    "Home and masjid scenes",
    "Faith-labelled template",
  ],
  islamicValues: [
    "Saying Bismillah before eating and starting tasks",
    "Saying Alhamdulillah with gratitude",
    "Smiling at others is sadaqah",
    "Helping others makes Allah happy",
    "Listening to parents and grandparents",
    "Saying Salaam to spread peace",
  ],
  duas: [
    ...BASE_UNDER_SIX_DUAS,
    {
      arabic: "سُبْحَانَ اللَّهِ",
      transliteration: "SubhanAllah",
      meaning: "Glory be to Allah",
      context: "When seeing something beautiful",
    },
  ],
  avoidTopics: BASE_UNDER_SIX_AVOID,
  backgroundSettings: {
    junior: {
      ...BASE_JUNIOR_BACKGROUND,
      locations: ["bedroom", "family lounge", "masjid", "garden", "kitchen"],
      keyFeatures: [
        "Warm Islamic home details",
        "Simple geometric motifs",
        "Safe devotional atmosphere",
        "Clarity for young readers",
      ],
    },
    avoidBackgrounds: ["Heavy ornament overload", "Dark interiors"],
    universalRules:
      "Faith details should feel natural, warm, and child-accessible rather than formal or intimidating.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_classic_children",
    moodTheme: "Warm family faith, safety, and bright childlike wonder",
    colorStyle: "Honey gold, sage, sky blue, and cream",
    lightingEffects: "Lamplight plus soft morning glow",
    atmosphere: {
      junior: "Reassuring, spiritually warm, and welcoming",
    },
    typography: {
      junior: "Rounded children’s title style with soft confidence",
    },
    islamicMotifs: ["Crescent moon", "Stars", "Simple geometric star patterns"],
    characterComposition: [
      "Main child centered with a clear devotional or family activity",
      "Readable props like book, prayer mat, or lantern",
      "Open title area at top",
    ],
    avoidCover: ["Photo realism", "Severe or austere mood"],
    titlePlacement: "top-center",
  },
});

const islamicMiddleGrade = createMiddleGradeTemplate({
  id: "kbt_islamic_middle_grade",
  name: "Islamic-Forward - Ages 8-14",
  flavour: "islamic-forward",
  flavourLabel: "Islamic-Forward",
  theme: "adventure-discovery",
  themeLabel: "Adventure & Discovery",
  tagline: "Epic stories where faith is named and tested through action",
  description:
    "An explicitly Islamic middle-grade template for courage, moral dilemmas, seerah-inspired atmospheres, and faith-forward adventure arcs.",
  previewImage: "/kb-templates/2.png",
  previewPrompt:
    "Epic illustrated banner, determined Muslim child on a hill above a lantern-lit city with minarets, crescent moon, twilight sky, amber and indigo palette, premium cinematic middle-grade illustration, no text, Islamic-forward flagship energy",
  palette: ["#14213D", "#C59D5F", "#7C9A92", "#FCA311"],
  highlightBadges: [
    "Islamic-Forward",
    "Ages 8-14 chapter book",
    "Faith through action",
    "Cinematic adventure tone",
    "Explicitly labelled flavour",
  ],
  islamicValues: [
    ...BASE_MIDDLE_GRADE_VALUES,
    "Brotherhood and sisterhood in Islam",
    "Gratitude (shukr) as a daily practice",
  ],
  duas: BASE_MIDDLE_GRADE_DUAS,
  avoidTopics: BASE_MIDDLE_GRADE_AVOID,
  backgroundSettings: {
    middleGrade: {
      ...BASE_MIDDLE_GRADE_BACKGROUND,
      locations: ["masjid courtyard", "desert dunes", "mountain path", "historic market", "library"],
      keyFeatures: [
        "Islamic architectural detail in the environment",
        "Epic scale with emotional warmth",
        "History-inflected atmosphere",
        "Faith-rich visual cues",
      ],
    },
    avoidBackgrounds: ["Context-free modern generic cityscapes", "Flattened low-stakes scenery"],
    universalRules:
      "The world should feel like a living companion to the story’s faith, stakes, and sense of mission.",
  },
  coverDesign: {
    selectedCoverTemplate: "ct_epic_cinematic",
    moodTheme: "Faith-forward courage, discovery, and moral clarity",
    colorStyle: "Midnight blue, brass gold, ember orange, and sage accents",
    lightingEffects: "Cinematic twilight, rim lighting, and subtle atmospheric haze",
    atmosphere: {
      middleGrade: "Deep, heroic, and spiritually grounded",
    },
    typography: {
      middleGrade: "Bold serif display with classic adventure authority",
    },
    islamicMotifs: ["Mosque silhouette", "Crescent moon", "Islamic geometry in architecture"],
    characterComposition: [
      "Hero turned toward a challenge or destination",
      "Large-scale skyline or landscape",
      "Determined expression with quiet faith",
    ],
    avoidCover: ["Childish pastel treatment", "Edgy grimdark styling", "Crowded collage layout"],
    titlePlacement: "top-center",
  },
});

export const DEFAULT_KB_STARTER_TEMPLATES: KBStarterTemplate[] = [
  universalUnderSix,
  universalMiddleGrade,
  universalAdventure,
  universalAnimals,
  islamicUnderSix,
  islamicMiddleGrade,
];

export const KB_TEMPLATE_ROADMAP_FLAVOURS: KBTemplateRoadmapFlavour[] = [
  {
    id: "roadmap_christian_forward",
    label: "Christian-Forward",
    description: "Parallel flavour family for values-led Christian storytelling.",
    status: "coming-soon",
  },
  {
    id: "roadmap_jewish_forward",
    label: "Jewish-Forward",
    description: "Parallel flavour family for Jewish values and heritage stories.",
    status: "coming-soon",
  },
  {
    id: "roadmap_secular_values_led",
    label: "Secular-Values-Led",
    description: "Parallel flavour family for broad moral themes without faith framing.",
    status: "coming-soon",
  },
];

export type KBStarterTemplateId = (typeof DEFAULT_KB_STARTER_TEMPLATES)[number]["id"];

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

export function getKBStarterTemplateById(id: string | null | undefined) {
  return DEFAULT_KB_STARTER_TEMPLATES.find((tpl) => tpl.id === id);
}
