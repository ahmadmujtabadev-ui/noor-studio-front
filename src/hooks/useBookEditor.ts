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

import { useCallback, useEffect, useState } from "react";
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

export interface BookPage {
  id:          string;
  label:       string;
  type:        BookPageType;
  imageUrl:    string;
  title?:      string;  // chapter title / book title
  subTitle?:   string;  // e.g. "Chapter 3"
  text?:       string;  // body text / author / synopsis
  pageNum?:    number;  // running page number (text pages)
  fabricJson?: object | null;
  thumbnail?:  string;
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
function splitProse(text: string, wordsPerPage = 150): string[] {
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
      return {
        id:       `spread-${ill.key}`,
        label:    title,
        type:     "spread" as BookPageType,
        imageUrl: illusUrl(ill),
        title,
        text,
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
      chunks.forEach((chunk, ci) => {
        pages.push({
          id:      `chapter-${chIdx}-text-${ci}`,
          label:   `Ch.${chNum} — Page ${ci + 1}`,
          type:    "text-page",
          imageUrl: "",          // clean cream background — no illustration
          subTitle: chapterTitle,
          text:    chunk,
          pageNum: runningPageNum++,
        });
      });
    }

    // 3. Additional illustration moments (beyond the first used as opener)
    chMoments.slice(1).forEach((moment: any, mi: number) => {
      const caption = moment.current?.illustrationHint || moment.current?.momentTitle || "";
      pages.push({
        id:       `chapter-${chIdx}-moment-${mi}`,
        label:    `Ch.${chNum} — Scene ${mi + 2}`,
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
      const [reviewData, coverData] = await Promise.all([
        reviewApi.get(pid).catch(() => reviewApi.bootstrap(pid)),
        reviewApi.getCover(pid).catch(() => null),
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

      setPages(bookPages);
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
    goBack,
  };
}
