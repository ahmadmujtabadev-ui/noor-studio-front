// hooks/useBookEditor.ts
// Loads all book data and builds the ordered page list for the canvas editor.
//
// ── Chapter book page structure (per chapter) ─────────────────────────────────
//   1. chapter-opener  — full-bleed illustration + "Chapter X" + title overlay
//   2. text-page × N   — clean cream pages, prose split into ~200 word chunks
//   3. chapter-moment  — any additional illustration moments for that chapter
//
// ── Spread / picture book page structure (per spread) ─────────────────────────
//   1. spread          — full-bleed illustration + text overlay (unchanged)

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reviewApi } from "@/lib/api/review.api";
import { normArr } from "@/lib/api/reviewTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BookPageType =
  | "front-cover"    // book cover (illustration background, title + author text)
  | "spread"         // picture-book spread (illustration bg + short text overlay)
  | "chapter-opener" // chapter title page  (illustration bg + chapter heading)
  | "text-page"      // prose text page     (plain cream bg, body text only)
  | "chapter-moment" // illustration moment  (illustration only, optional caption)
  | "back-cover";    // back cover           (illustration bg, synopsis text)

/** Picture-book spread sub-layouts */
export type SpreadLayoutType =
  | "full_bleed"           // image 100% bg, white card overlay with text
  | "image_left_text_right"// left half = image, right half = white + dropcap text
  | "image_top_text_bottom"// top 62% image, bottom band with text
  | "vignette";            // circular image, text beside, Islamic corner ornaments

/** Chapter-book text-page sub-layouts */
export type TextLayoutType =
  | "two_column"           // two equal columns, running header, outer page nums
  | "text_inline_image"    // single column + image floated right 38%
  | "decorative_full_text";// ornamental border + Arabic/hadith pull-quote

export type LayoutType = SpreadLayoutType | TextLayoutType;

export interface BookPage {
  id:              string;
  label:           string;
  type:            BookPageType;
  imageUrl:        string;
  /** Second moment illustration — rendered as full-bleed at bottom of first text page */
  secondImageUrl?: string;
  title?:          string;       // chapter title / book title
  subTitle?:       string;       // e.g. "Chapter 3"
  text?:           string;       // body text / author / synopsis
  pageNum?:        number;       // running page number (text pages)
  layoutType?:     LayoutType;   // auto-assigned sub-layout
  fabricJson?:     object | null;
  thumbnail?:      string;
}

// ─── Layout auto-assignment ───────────────────────────────────────────────────

/** Infer the best picture-book spread layout from page content. */
function resolveSpreadLayout(text: string, imageUrl: string): SpreadLayoutType {
  if (!text || !text.trim()) return imageUrl ? "full_bleed" : "vignette";
  const words     = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  if (words <= 10) return "image_top_text_bottom"; // rhyme / single line
  if (sentences <= 2) return "full_bleed";          // short prose
  return "image_left_text_right";                   // 3-4 sentences
}

/** Infer the best chapter-book text-page layout from page content. */
function resolveTextLayout(text: string): TextLayoutType {
  if (!text) return "two_column";
  // Detect Islamic/hadith/Quranic content → decorative layout
  if (/hadith|ayah|quran|قال|ﷺ|اللَّهُ|bismillah|sunnah/i.test(text)) return "decorative_full_text";
  const words = text.trim().split(/\s+/).length;
  // Short text on text page (unlikely but safe fallback)
  if (words < 80) return "text_inline_image";
  return "two_column";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract the selected variant image URL from an illustration node. */
function illusUrl(illus: any): string {
  const variants = normArr(illus?.current?.variants ?? []);
  const selIdx   = illus?.current?.selectedVariantIndex ?? 0;
  return (variants[selIdx] as any)?.imageUrl || illus?.current?.imageUrl || "";
}

/**
 * Split long prose into chunks of at most `wordsPerPage` words.
 * Tries to break on sentence boundaries first.
 */
function splitProse(text: string, wordsPerPage = 180): string[] {
  if (!text.trim()) return [];

  const sentences = text
    .replace(/([.?!])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const pages: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length;
    if (wordCount + words > wordsPerPage && current.length > 0) {
      pages.push(current.join(" "));
      current = [];
      wordCount = 0;
    }
    current.push(sentence);
    wordCount += words;
  }
  if (current.length > 0) pages.push(current.join(" "));

  // Merge a sparse last page into the previous one.
  // Threshold = 100 words: a last chunk of ≤100 words fills less than one column
  // and leaves a mostly-blank page; merging it keeps both pages well-balanced.
  if (pages.length > 1) {
    const lastWc = pages[pages.length - 1].split(/\s+/).length;
    if (lastWc <= 100) {
      const merged = pages.splice(pages.length - 2, 2).join(" ");
      pages.push(merged);
    }
  }

  return pages.length ? pages : [text];
}

// ─── Page builders ────────────────────────────────────────────────────────────

function buildSpreadPages(
  illustrations: any[],
  structures: any[],
): BookPage[] {
  return illustrations
    .filter((ill) => ill.sourceType === "spread")
    .sort((a, b) => (a.spreadIndex ?? 0) - (b.spreadIndex ?? 0))
    .map((ill, idx) => {
      const struct = structures.find(
        (s: any) => s.current?.spreadIndex === ill.spreadIndex,
      ) as any;
      const text  = struct?.current?.text || ill.current?.text || "";
      const title = `Spread ${(ill.spreadIndex ?? idx) + 1}`;
      const imgUrl = illusUrl(ill);
      return {
        id:         `spread-${ill.key}`,
        label:      title,
        type:       "spread" as BookPageType,
        imageUrl:   imgUrl,
        title,
        text,
        layoutType: resolveSpreadLayout(text, imgUrl),
      };
    });
}

function buildChapterPages(
  illustrations: any[],
  humanized: any[],
  prose: any[],
): BookPage[] {
  const moments = illustrations.filter((ill) => ill.sourceType === "chapter-moment");

  // Collect all unique chapter indices across moments + prose + humanized
  const allChapterIdxs = [
    ...new Set([
      ...moments.map((m: any) => Number(m.chapterIndex ?? 0)),
      ...humanized.map((h: any) => Number(h.chapterIndex ?? 0)),
      ...prose.map((p: any) => Number(p.chapterIndex ?? 0)),
    ]),
  ].sort((a, b) => a - b);

  const pages: BookPage[] = [];
  let runningPageNum = 1; // running page counter for text pages

  allChapterIdxs.forEach((chIdx) => {
    const chNum = chIdx + 1;

    // Find prose / humanized for this chapter
    const humanNode  = humanized.find((h: any) => Number(h.chapterIndex) === chIdx) as any;
    const proseNode  = prose.find((p: any) => Number(p.chapterIndex) === chIdx) as any;
    const chapterNode = humanNode || proseNode;

    const chapterTitle = chapterNode?.current?.chapterTitle || `Chapter ${chNum}`;
    const chapterText  = chapterNode?.current?.chapterText  || "";

    // Illustration moments for this chapter, sorted
    const chMoments = moments
      .filter((m: any) => Number(m.chapterIndex) === chIdx)
      .sort((a: any, b: any) => (a.spreadIndex ?? 0) - (b.spreadIndex ?? 0));

    const firstMoment = chMoments[0];

    // 1. Chapter opener
    pages.push({
      id:       `chapter-${chIdx}-opener`,
      label:    `Ch.${chNum} — ${chapterTitle}`,
      type:     "chapter-opener",
      imageUrl: firstMoment ? illusUrl(firstMoment) : "",
      subTitle: `Chapter ${chNum}`,
      title:    chapterTitle,
    });

    // 2. Text pages (prose split into readable chunks)
    if (chapterText) {
      const chunks = splitProse(chapterText);
      // First illustration  → floated inline on first text page (ci === 0)
      const chapterIllUrl = firstMoment ? illusUrl(firstMoment) : "";
      // Second illustration → full-bleed at bottom of the MID-CHAPTER text page
      const secondIllUrl  = chMoments[1] ? illusUrl(chMoments[1]) : "";
      // Mid-chapter index: for 1 chunk use 0, for 2+ use the middle chunk
      const midIdx = chunks.length > 1 ? Math.floor(chunks.length / 2) : 0;

      chunks.forEach((chunk, ci) => {
        const imgUrl       = ci === 0 ? chapterIllUrl : "";
        // Second illustration goes at the bottom of the mid-chapter page
        const secondImgUrl = (secondIllUrl && ci === midIdx && ci !== 0) ? secondIllUrl : "";

        // Force text_inline_image when either image is present
        const lt: TextLayoutType =
          imgUrl || secondImgUrl ? "text_inline_image" : resolveTextLayout(chunk);

        pages.push({
          id:             `chapter-${chIdx}-text-${ci}`,
          label:          `Ch.${chNum} — Page ${ci + 1}`,
          type:           "text-page",
          imageUrl:       imgUrl,
          secondImageUrl: secondImgUrl || undefined,
          subTitle:       chapterTitle,
          text:           chunk,
          pageNum:        runningPageNum++,
          layoutType:     lt,
        });
      });
    }

    // 3. Standalone moment pages — only beyond the 2nd
    //    (1st → opener + first text page inline; 2nd → bottom of first text page)
    chMoments.slice(2).forEach((moment: any, mi: number) => {
      const caption = moment.current?.momentTitle || "";
      pages.push({
        id:       `chapter-${chIdx}-moment-${mi}`,
        label:    `Ch.${chNum} — Scene ${mi + 3}`,
        type:     "chapter-moment",
        imageUrl: illusUrl(moment),
        text:     caption,
      });
    });
  });

  return pages;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useBookEditor() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate           = useNavigate();

  const [pages,          setPages]          = useState<BookPage[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [projectTitle,   setProjectTitle]   = useState("Untitled Book");
  const [isChapterBook,  setIsChapterBook]  = useState(false);

  useEffect(() => {
    if (!projectId) return;
    load(projectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const load = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      const [reviewData, coverData, savedEditorData] = await Promise.all([
        reviewApi.get(pid).catch(() => reviewApi.bootstrap(pid)),
        reviewApi.getCover(pid).catch(() => null),
        reviewApi.getEditorPages(pid).catch(() => ({ pages: [] })),
      ]);

      const r         = reviewData.review;
      const bookTitle = r?.story?.current?.bookTitle || "Untitled Book";
      const author    = (reviewData as any).authorName || "";
      const mode      = reviewData.workflow?.mode || "picture-book";
      const isChapter = mode === "chapter-book";

      setProjectTitle(bookTitle);
      setIsChapterBook(isChapter);

      // ── Cover URLs ──────────────────────────────────────────────────────────
      const frontNode     = (coverData as any)?.cover?.front;
      const frontVariants = normArr(frontNode?.current?.variants ?? []);
      const frontSelIdx   = frontNode?.current?.selectedVariantIndex ?? 0;
      const frontUrl      = (frontVariants[frontSelIdx] as any)?.imageUrl || frontNode?.current?.imageUrl || "";

      const backNode      = (coverData as any)?.cover?.back;
      const backVariants  = normArr(backNode?.current?.variants ?? []);
      const backSelIdx    = backNode?.current?.selectedVariantIndex ?? 0;
      const backUrl       = (backVariants[backSelIdx] as any)?.imageUrl || backNode?.current?.imageUrl || "";

      // ── Raw data ────────────────────────────────────────────────────────────
      const illustrations = normArr(r?.illustrations ?? []);
      const structures    = normArr(r?.structure?.items ?? []);
      const humanized     = normArr(r?.humanized ?? []);
      const prose         = normArr(r?.prose ?? []);

      // ── Build page list ─────────────────────────────────────────────────────
      const bookPages: BookPage[] = [];

      // Front cover
      bookPages.push({
        id:       "cover-front",
        label:    "Front Cover",
        type:     "front-cover",
        imageUrl: frontUrl,
        title:    bookTitle,
        text:     author ? `By ${author}` : "",
      });

      if (isChapter) {
        bookPages.push(...buildChapterPages(illustrations, humanized, prose));
      } else {
        bookPages.push(...buildSpreadPages(illustrations, structures));
      }

      // Back cover
      bookPages.push({
        id:       "cover-back",
        label:    "Back Cover",
        type:     "back-cover",
        imageUrl: backUrl,
        text:     r?.story?.current?.synopsis || "",
      });

      // ── Merge saved editor state (fabricJson, thumbnail, text edits) ─────────
      // Build a lookup map from the backend-saved pages
      const savedById = new Map<string, any>();
      (savedEditorData.pages ?? []).forEach((sp: any) => {
        if (sp?.id) savedById.set(sp.id, sp);
      });

      // Apply saved fabricJson / thumbnail / text on top of generated pages
      const mergedPages = bookPages.map((p) => {
        const saved = savedById.get(p.id);
        if (!saved) return p;
        return {
          ...p,
          ...(saved.fabricJson !== undefined  && { fabricJson: saved.fabricJson }),
          ...(saved.thumbnail  !== undefined  && { thumbnail:  saved.thumbnail }),
          ...(saved.text       !== undefined  && { text:       saved.text }),
          ...(saved.title      !== undefined  && { title:      saved.title }),
        };
      });

      setPages(mergedPages);
    } catch (err) {
      setError((err as Error).message || "Failed to load book data");
    } finally {
      setLoading(false);
    }
  };

  const updatePage = useCallback(
    (idx: number, updates: Partial<BookPage>) => {
      setPages((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  // Debounce ref — avoids hammering the API on every canvas change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Persist all pages to the backend.
   * Only sends the fields that need to be saved — not imageUrl etc.
   * Returns a promise that resolves when the save completes.
   */
  const saveAllPages = useCallback(
    async (latestPages: BookPage[]): Promise<void> => {
      if (!projectId) return;
      const payload = latestPages.map((p) => ({
        id:        p.id,
        fabricJson: p.fabricJson ?? null,
        thumbnail:  p.thumbnail  ?? null,
        text:       p.text       ?? "",
        title:      p.title      ?? "",
      }));
      await reviewApi.saveEditorPages(projectId, payload);
    },
    [projectId],
  );

  /**
   * Auto-save: called by the editor after every canvas change.
   * Debounced to 1.5 s so rapid edits don't flood the network.
   */
  const autoSave = useCallback(
    (latestPages: BookPage[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveAllPages(latestPages).catch(console.error);
      }, 1500);
    },
    [saveAllPages],
  );

  const goToPage = useCallback(
    (idx: number) => {
      setCurrentPageIdx(Math.max(0, Math.min(idx, pages.length - 1)));
    },
    [pages.length],
  );

  const goBack = useCallback(() => { navigate(-1); }, [navigate]);

  return {
    projectId,
    projectTitle,
    isChapterBook,
    pages,
    currentPageIdx,
    setCurrentPageIdx: goToPage,
    loading,
    error,
    updatePage,
    saveAllPages,
    autoSave,
    goBack,
  };
}
