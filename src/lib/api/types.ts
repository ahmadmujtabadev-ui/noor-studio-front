// ─── Auth ────────────────────────────────────────────────────────────────────

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

// ─── Universe ────────────────────────────────────────────────────────────────

export interface Universe {
  id: string;
  _id: string;
  userId: string;
  name: string;
  description?: string;
  seriesBible?: string;
  tags: string[];
  artStyle?: string;
  characterCount: number;
  bookCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Character ───────────────────────────────────────────────────────────────

export interface VisualDNA {
  style?: string;
  gender?: string;
  skinTone?: string;
  eyeColor?: string;
  faceShape?: string;
  hairOrHijab?: string;
  outfitRules?: string;
  accessories?: string;
  paletteNotes?: string;
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

export interface CharacterVersion {
  version: number;
  note: string;
  createdAt: string;
}

export interface Character {
  id: string;
  _id: string;
  userId?: string;
  universeId?: string;
  name: string;
  role: string;
  ageRange: string;
  traits: string[];
  speechStyle?: string;
  speakingStyle?: string;
  appearance?: string;
  visualDNA: VisualDNA;
  modestyRules: ModestyRules;
  colorPalette: string[];
  knowledgeLevel?: string;
  imageUrl?: string;
  poseSheetUrl?: string;
  poseSheetGenerated: boolean;
  poses: CharacterPose[];
  status: 'draft' | 'approved' | 'locked';
  version: number;
  versions: CharacterVersion[];
  createdAt: string;
  updatedAt: string;
}

// ─── Knowledge Base ──────────────────────────────────────────────────────────

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

// ─── Project ─────────────────────────────────────────────────────────────────

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress?: number;
  message?: string;
  completedAt?: string;
}

export interface OutlineChapter {
  title: string;
  goal: string;
  keyScene?: string;
  duaHint?: string;
}

export interface OutlineArtifact {
  chapters: OutlineChapter[] | string[];
  synopsis?: string;
  kbApplied?: string | null;
  _structured?: unknown;
}

export interface ChapterArtifact {
  chapterNumber: number;
  title: string;
  content: string;
  wordCount: number;
  vocabularyNotes?: string[];
  islamicAdabChecks?: string[];
}

export interface HumanizedArtifact {
  humanized: boolean;
  reviewedAt?: string;
  chapters: Array<{
    chapterNumber: number;
    title: string;
    editedText: string;
    changesMade?: string[];
  }>;
}

export interface IllustrationItem {
  id: string;
  chapterNumber: number;
  scene?: string;
  imageUrl?: string;
  status: 'draft' | 'approved';
}

export interface CoverArtifact {
  frontCoverUrl?: string;
  backCoverUrl?: string;
  prompt?: string;
}

export interface SpreadContent {
  imageUrl?: string;
  title?: string;
  author?: string;
  chapterTitle?: string;
  text?: string;
  chapterNumber?: number;
  vocabulary?: VocabularyEntry[];
}

export interface Spread {
  page: number;
  type: 'cover' | 'title-page' | 'illustration' | 'text' | 'glossary' | 'back-cover';
  content: SpreadContent;
}

export interface LayoutArtifact {
  spreads: Spread[];
  pageCount: number;
  layoutStyle?: string;
  trimSize?: string;
}

export interface ProjectArtifacts {
  outline?: OutlineArtifact;
  chapters?: ChapterArtifact[];
  humanize?: HumanizedArtifact;
  illustrations?: IllustrationItem[];
  cover?: CoverArtifact;
  layout?: LayoutArtifact;
}

export interface Project {
  id: string;
  _id: string;
  userId: string;
  universeId?: string;
  universeName?: string;
  knowledgeBaseId?: string;
  knowledgeBaseName?: string;
  title: string;
  ageRange: string;
  templateType: string;
  synopsis?: string;
  learningObjective?: string;
  setting?: string;
  characterIds: string[];
  layoutStyle: string;
  trimSize: string;
  exportTargets: string[];
  artifacts: ProjectArtifacts;
  pipeline: PipelineStage[];
  status: string;
  shareToken?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── AI ──────────────────────────────────────────────────────────────────────

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
  project?: Project;
}

export interface ImageGenerateResponse {
  imageUrl: string;
  provider?: string;
  creditsCharged?: number;
}

// ─── Payments ────────────────────────────────────────────────────────────────

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

// ─── Export ──────────────────────────────────────────────────────────────────

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

// ─── API Error ───────────────────────────────────────────────────────────────

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
