// src/lib/api/types.ts
// Complete type definitions for the 5-step AI book creation flow

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  credits: number;
  plan: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Universe ─────────────────────────────────────────────────────────────────

export interface Universe {
  id: string;
  _id: string;
  userId: string;
  name: string;
  description?: string;
  seriesBible?: string;
  tags: string[];
  artStyle?: string;
  ageRange?: string;
  tone?: string;
  characterCount: number;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Character ────────────────────────────────────────────────────────────────

export interface VisualDNA {
  style?: string;
  gender?: string;
  skinTone?: string;
  skinToneHex?: string;
  eyeColor?: string;
  eyeColorHex?: string;
  faceShape?: string;
  hairOrHijab?: string;
  hairDescription?: string;
  outfitRules?: string;
  outfitDescription?: string;
  outfitColor?: string;
  primaryColor?: string;
  accessories?: string;
  paletteNotes?: string;
  // New fields for better image generation
  ageAppearance?: string;       // "toddler 2-3" | "young child 4-5" | "child 6-8"
  bodyProportions?: string;     // "chubby toddler" | "slim child"
  hatOrHeadwear?: string;       // "none" | "white taqiyah always"
  shoeType?: string;            // "brown sandals" | "barefoot always"
}

export interface ModestyRules {
  hijabAlways?: boolean;
  longSleeves?: boolean;
  looseClothing?: boolean;
  notes?: string;
}

export interface CharacterPose {
  id: number;
  name: string;
  status: 'draft' | 'approved' | 'locked';
}

// export interface Character {
//   id: string;
//   _id: string;
//   userId?: string;
//   universeId?: string;
//   name: string;
//   role: string;
//   ageRange: string;
//   traits: string[];
//   speechStyle?: string;
//   speakingStyle?: string;
//   appearance?: string;
//   visualDNA: VisualDNA;
//   modestyRules: ModestyRules;
//   colorPalette: string[];
//   knowledgeLevel?: string;
//   imageUrl?: string;
//   poseSheetUrl?: string;
//   // Step 3: Character styling
//   masterReferenceUrl?: string;
//   selectedStyle?: string;
//   styleApprovedAt?: string;
//   poseSheetGenerated: boolean;
//   poses: CharacterPose[];
//   status: 'draft' | 'approved' | 'locked';
//   version: number;
//   createdAt: string;
//   updatedAt: string;
// }

// ─── Knowledge Base ───────────────────────────────────────────────────────────

export interface Dua {
  arabic?: string;
  transliteration: string;
  meaning: string;
  context?: string;
}

export interface VocabularyEntry {
  word: string;
  definition: string;
  ageGroup?: string;
}

export interface KnowledgeBase {
  id: string;
  _id: string;
  userId: string;
  universeId?: string;
  name: string;
  islamicValues: string[];
  duas: Dua[];
  vocabulary: VocabularyEntry[];
  illustrationRules: string[];
  avoidTopics: string[];
  customRules?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Project — Spread types ───────────────────────────────────────────────────

export interface SpreadItem {
  spreadIndex: number;
  text: string;
  prompt?: string;
  illustrationHint?: string;
  textPosition?: 'bottom' | 'top' | 'overlay-bottom' | 'overlay-top';
  charactersInScene?: string[];
  characterEmotion?: Record<string, string>;
  sceneEnvironment?: 'indoor' | 'outdoor' | 'auto';
  timeOfDay?: string;
}

export interface SpreadIllustration {
  spreadIndex: number;
  imageUrl?: string;
  prompt?: string;
  text?: string;
  textPosition?: string;
  illustrationHint?: string;
  seed?: number;
  // Step 4: variants
  variants?: ImageVariant[];
  selectedVariantIndex?: number;
  approvedAt?: string;
  createdAt?: string;
}

export interface ImageVariant {
  variantIndex: number;
  imageUrl: string;
  prompt?: string;
  seed?: number;
  provider?: string;
  selected?: boolean;
}

export interface ChapterSpread extends SpreadItem {
  imageUrl?: string;
  variants?: ImageVariant[];
  selectedVariantIndex?: number;
}

export interface ChapterItem {
  chapterNumber: number;
  chapterTitle?: string;
  title?: string;
  text?: string;
  prompt?: string;
  chapterIllustrationHint?: string;
  spreads?: ChapterSpread[];
  changesMade?: string[];
}

export interface IllustrationChapter {
  chapterNumber: number;
  selectedVariantIndex?: number;
  spreads?: SpreadIllustration[];
  variants?: ImageVariant[];
}

// ─── Book style settings ──────────────────────────────────────────────────────

export interface BookStyle {
  artStyle?: string;
  colorPalette?: string;
  lightingStyle?: string;
  backgroundStyle?: string;
  indoorRoomDescription?: string;
  outdoorDescription?: string;
  islamicDecorStyle?: string;
  textPlacementDefault?: string;
  bookProps?: string;
  negativePrompt?: string;
  guidanceScale?: number;
  inferenceSteps?: number;
  referenceStrength?: number;
}

export interface BookEditorStyle {
  globalFont?: string;
  globalFontSize?: number;
  globalFontColor?: string;
  globalBgColor?: string;
  globalBgOpacity?: number;
  globalTextAlign?: string;
  globalLayout?: string;
}

// ─── Steps completion ─────────────────────────────────────────────────────────

export interface StepsComplete {
  story?: boolean;    // Step 1
  spreads?: boolean;  // Step 2
  style?: boolean;    // Step 3
  images?: boolean;   // Step 4
  editor?: boolean;   // Step 5
}

// ─── Project artifacts ────────────────────────────────────────────────────────

export interface ProjectOutline {
  bookTitle?: string;
  moral?: string;
  synopsis?: string;
  spreadOnly?: boolean;
  chapters?: Array<{ title: string; goal: string; keyScene?: string; duaHint?: string; charactersInScene?: string[] }>;
  spreads?: SpreadItem[];
  islamicTheme?: {
    title?: string;
    arabicPhrase?: string;
    transliteration?: string;
    meaning?: string;
    reference?: string;
    referenceText?: string;
    whyWeDoIt?: string;
  };
  dedicationMessage?: string;
  characters?: Array<{ name: string; role: string; ageRange: string; gender: string; keyTraits: string[] }>;
}

export interface ProjectDedication {
  greeting?: string;
  message?: string;
  closing?: string;
  includeQrPlaceholder?: boolean;
}

export interface ProjectThemePage {
  sectionTitle?: string;
  arabicPhrase?: string;
  transliteration?: string;
  meaning?: string;
  referenceType?: string;
  referenceSource?: string;
  referenceText?: string;
  explanation?: string;
  dailyPractice?: string;
}

export interface ProjectCover {
  frontUrl?: string;
  frontPrompt?: string;
  frontSeed?: number;
  frontVariants?: ImageVariant[];
  backUrl?: string;
  backPrompt?: string;
  backSeed?: number;
  backVariants?: ImageVariant[];
  // legacy
  imageUrl?: string;
}

export interface LayoutSpread {
  page: number;
  type: 'cover' | 'title-page' | 'dedication' | 'theme-page' | 'picture-spread' | 'chapter-divider' | 'chapter-illustration' | 'chapter-text' | 'glossary' | 'duas-page' | 'back-cover';
  content: {
    imageUrl?: string | null;
    title?: string;
    author?: string;
    chapterTitle?: string;
    chapterNumber?: number;
    chapterIndex?: number;
    spreadIndex?: number;
    text?: string;
    textPosition?: string;
    illustrationHint?: string;
    hasImage?: boolean;
    moral?: string;
    vocabulary?: VocabularyEntry[];
    duas?: Dua[];
    variants?: ImageVariant[];
    selectedVariantIndex?: number;
  };
}

export interface ProjectLayout {
  spreads: LayoutSpread[];
  pageCount: number;
  trimSize?: string;
  format?: string;
  ageRange?: string;
  title?: string;
  author?: string;
  moral?: string;
  hasCover?: boolean;
  hasDedication?: boolean;
  hasThemePage?: boolean;
  hasGlossary?: boolean;
  hasDuas?: boolean;
  hasBackCover?: boolean;
  storyPageCount?: number;
  missingImages?: number;
  approvedCount?: number;
  generatedAt?: string;
}

export interface ProjectPageEdit {
  status?: 'draft' | 'edited' | 'regenerated' | 'approved' | 'rejected';
  notes?: string;
  textStyle?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    bgColor?: string;
    bgOpacity?: number;
    textAlign?: string;
    lineHeight?: number;
    x?: number;
    y?: number;
    width?: number;
  };
  imageStyle?: {
    objectFit?: string;
    offsetX?: number;
    offsetY?: number;
    scale?: number;
  };
  layout?: string;
  approvedAt?: string;
  rejectionReason?: string;
  updatedAt?: string;
  textVersions?: Array<{ version: number; text: string; prompt?: string | null; source: string; createdAt: string }>;
  imageVersions?: Array<{ version: number; imageUrl: string; prompt?: string; source: string; createdAt: string }>;
  currentTextVersion?: number;
  currentImageVersion?: number;
}

export interface ProjectArtifacts {
  // Step 1
  storyIdea?: string;
  storyText?: string;
  outline?: ProjectOutline;
  dedication?: ProjectDedication;
  themePage?: ProjectThemePage;

  // Step 2
  spreadOnly?: boolean;
  spreads?: SpreadItem[];
  chapters?: ChapterItem[];
  humanized?: ChapterItem[];

  // Step 4
  illustrations?: IllustrationChapter[];
  spreadIllustrations?: SpreadIllustration[];
  cover?: ProjectCover;

  // Step 5
  bookEditorStyle?: BookEditorStyle;
  pageEdits?: Record<string, ProjectPageEdit>;
  layout?: ProjectLayout;

  // Export
  export?: { pdfUrl?: string; epubUrl?: string; pageCount?: number; exportedAt?: string; expiresAt?: string };

  // History
  promptHistory?: Array<{ stage: string; index: number; prompt: string; resultPreview: string; provider: string; createdAt: string }>;
  imagePromptHistory?: Array<{ type: string; chapterIndex: number; spreadIndex: number; prompt: string; imageUrl: string; provider: string; createdAt: string }>;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  message?: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  _id: string;
  userId: string;
  universeId?: string;
  universeName?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  characterIds: string[] | Character[];

  title: string;
  ageRange: string;
  chapterCount: number;
  template?: string;
  templateType?: string;
  learningObjective?: string;
  setting?: string;
  authorName?: string;
  language?: string;

  // New 5-step flow
  currentStep?: number;
  stepsComplete?: StepsComplete;
  bookStyle?: BookStyle;

  // Legacy
  layoutStyle?: string;
  trimSize: string;
  exportTargets?: string[];

  artifacts: ProjectArtifacts;
  pipeline?: PipelineStage[];

  status: string;
  currentStage?: string;
  errorMessage?: string;

  shareToken?: string;
  publishedAt?: string;
  isPublic?: boolean;
  synopsis?: string;

  aiUsage?: {
    totalInputTokens?: number;
    totalOutputTokens?: number;
    totalCostUsd?: number;
    totalCreditsUsed?: number;
  };

  createdAt: string;
  updatedAt: string;
}

// ─── Project summary ──────────────────────────────────────────────────────────

export interface ProjectSummary {
  id: string;
  title: string;
  ageRange: string;
  status: string;
  currentStep: number;
  stepsComplete: StepsComplete;
  spreadOnly: boolean;
  stats: {
    totalPages: number;
    imagesReady: number;
    pagesApproved: number;
    hasStory: boolean;
    hasSpreads: boolean;
    hasCharStyle: boolean;
    hasCover: boolean;
    hasLayout: boolean;
  };
  characters: Character[];
  updatedAt: string;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface AIStatusResponse {
  textProvider: string;
  imageProvider: string;
  claudeConfigured: boolean;
  replicateConfigured: boolean;
  geminiConfigured: boolean;
}

export interface TextGenerateResponse {
  result: unknown;
  usage?: { inputTokens: number; outputTokens: number };
  provider?: string;
  creditsCharged?: number;
  stage?: string;
  prompt?: string;
}

export interface ImageGenerateResponse {
  imageUrl: string;
  provider?: string;
  creditsCharged?: number;
  traceId?: string;
  prompt?: string;
  seed?: number;
  // Step 4: variants
  variants?: ImageVariant[];
  selectedVariantIndex?: number;
  // Step 3: character style
  masterReferenceUrl?: string;
}

export interface CostEstimateResponse {
  task: string;
  estimatedCost: number;
  userCredits: number;
  canAfford: boolean;
  breakdown: Array<{ label: string; cost: number }>;
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  currency: string;
  popular?: boolean;
}

export interface CreditTransaction {
  id: string;
  _id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  refType?: string;
  refId?: string;
  createdAt: string;
}

export interface CreditBalance {
  credits: number;
  plan: string;
}

// ─── Export ───────────────────────────────────────────────────────────────────

export interface Export {
  id: string;
  _id: string;
  projectId: string;
  userId: string;
  pdfUrl?: string;
  epubUrl?: string;
  pageCount?: number;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  expiresAt?: string;
  createdAt: string;
}

// ─── API Error ────────────────────────────────────────────────────────────────

export class NoorApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'NoorApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export interface CharacterVisualDNA {
  style?: string;
  gender?: string;
  ageLook?: string;

  skinTone?: string;
  eyeColor?: string;
  faceShape?: string;
  eyebrowStyle?: string;
  noseStyle?: string;
  cheekStyle?: string;

  hairStyle?: string;
  hairColor?: string;
  hairVisibility?: "visible" | "partially-visible" | "hidden";

  hijabStyle?: string;
  hijabColor?: string;

  topGarmentType?: string;
  topGarmentColor?: string;
  topGarmentDetails?: string;

  bottomGarmentType?: string;
  bottomGarmentColor?: string;

  shoeType?: string;
  shoeColor?: string;

  bodyBuild?: string;
  heightFeel?: string;
  heightCm?: number;
  weightCategory?: string;

  accessories?: string[];
  paletteNotes?: string;

  // legacy
  hairOrHijab?: string;
  outfitRules?: string;
}

export interface CharacterModestyRules {
  hijabAlways?: boolean;
  longSleeves?: boolean;
  looseClothing?: boolean;
  notes?: string;
}

export interface CharacterGenerationMeta {
  portraitPrompt?: string;
  poseSheetPrompt?: string;
  poseCount?: number;
}

export interface PoseLibraryItem {
  poseKey: string;
  label: string;
  prompt?: string;
  imageUrl?: string;
  sourceSheetUrl?: string;
  approved?: boolean;
  priority?: number;
  useForScenes?: string[];
  notes?: string;
}

export interface PromptConfig {
  masterSystemNote?: string;
  portraitPromptPrefix?: string;
  portraitPromptSuffix?: string;
  posePromptPrefix?: string;
  posePromptSuffix?: string;
  scenePromptPrefix?: string;
  scenePromptSuffix?: string;
}

export interface Character {
  id?: string;
  _id?: string;
  userId?: string;
  universeId?: string;

  name: string;
  role: string;
  ageRange?: string;
  traits: string[];
  speakingStyle?: string;
  status: "draft" | "generated" | "approved" | "locked";

  imageUrl?: string;
  poseSheetUrl?: string;
  masterReferenceUrl?: string;
  selectedStyle?: string;
  styleApprovedAt?: string;

  visualDNA?: {
    style?: string;
    gender?: string;
    ageLook?: string;

    skinTone?: string;
    eyeColor?: string;
    faceShape?: string;
    eyebrowStyle?: string;
    noseStyle?: string;
    cheekStyle?: string;

    hairStyle?: string;
    hairColor?: string;
    hairVisibility?: "visible" | "partially-visible" | "hidden";

    hijabStyle?: string;
    hijabColor?: string;

    topGarmentType?: string;
    topGarmentColor?: string;
    topGarmentDetails?: string;

    bottomGarmentType?: string;
    bottomGarmentColor?: string;

    shoeType?: string;
    shoeColor?: string;

    bodyBuild?: string;
    heightFeel?: string;
    heightCm?: number;
    weightCategory?: string;

    accessories?: string[];
    paletteNotes?: string;

    hairOrHijab?: string;
    outfitRules?: string;
  };

  modestyRules?: {
    hijabAlways?: boolean;
    longSleeves?: boolean;
    looseClothing?: boolean;
    notes?: string;
  };

  poseLibrary?: PoseLibraryItem[];
  approvedPoseKeys?: string[];
  promptConfig?: PromptConfig;

  generationMeta?: {
    portraitPrompt?: string;
    poseSheetPrompt?: string;
    poseCount?: number;
  };

  updatedAt: string;
  createdAt?: string;

  // optional legacy UI fields
  version?: number;
  versions?: Array<{
    version: number;
    note: string;
    createdAt: string;
  }>;
}