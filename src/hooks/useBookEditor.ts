import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reviewApi } from "@/lib/api/review.api";
import { normArr } from "@/lib/api/reviewTypes";
import { sanitizeFabricImages } from "@/lib/api/sanitizeFabricImages";

export type BookPageType =
  | "front-cover"
  | "spread"
  | "chapter-opener"
  | "text-page"
  | "chapter-moment"
  | "back-cover";

export type SpreadLayoutType =
  | "full_bleed"
  | "image_left_text_right"
  | "image_top_text_bottom"
  | "vignette";

export type TextLayoutType =
  | "two_column"
  | "text_inline_image"
  | "decorative_full_text";

export type LayoutType = SpreadLayoutType | TextLayoutType;

// NEW: identifies one of the canvas layout templates (full-bleed, text-top, etc.)
export type LayoutKey =
  | "full-bleed"
  | "text-bottom"
  | "text-top"
  | "image-focus";

export interface BookPage {
  id: string;
  label: string;
  type: BookPageType;
  imageUrl: string;
  secondImageUrl?: string;
  title?: string;
  subTitle?: string;
  text?: string;
  pageNum?: number;
  layoutType?: LayoutType;
  fabricJson?: object | null;
  thumbnail?: string;
  // NEW: when set, the canvas will rebuild this layout on every page load.
  layoutKey?: LayoutKey | null;
  // NEW: body-text style overrides (font, size, weight, colour, per-char styles)
  // captured from the user's edits. Applied AFTER template rebuild on reload.
  bodyTextStyles?: Record<string, unknown> | null;
}

function resolveSpreadLayout(text: string, imageUrl: string): SpreadLayoutType {
  if (!text || !text.trim()) return imageUrl ? "full_bleed" : "vignette";
  const words = text.trim().split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  if (words <= 10) return "image_top_text_bottom";
  if (sentences <= 2) return "full_bleed";
  return "image_left_text_right";
}

function resolveTextLayout(text: string): TextLayoutType {
  if (!text) return "two_column";
  if (/hadith|ayah|quran|قال|ﷺ|اللَّهُ|bismillah|sunnah/i.test(text)) {
    return "decorative_full_text";
  }
  return "two_column";
}

function illusUrl(illus: any): string {
  const variants = normArr(illus?.current?.variants ?? []);
  const selIdx = illus?.current?.selectedVariantIndex ?? 0;
  return (variants[selIdx] as any)?.imageUrl || illus?.current?.imageUrl || "";
}

function splitProse(text: string, wordsPerPage = 150): string[] {
  if (!text.trim()) return [];

  const sentences = text
    .replace(/([.?!])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const sentence of sentences) {
    const words = sentence.split(/\s+/).length;
    if (wordCount + words > wordsPerPage && current.length > 0) {
      chunks.push(current.join(" "));
      current = [];
      wordCount = 0;
    }
    current.push(sentence);
    wordCount += words;
  }

  if (current.length > 0) chunks.push(current.join(" "));

  if (chunks.length > 1) {
    const lastWordCount = chunks[chunks.length - 1].split(/\s+/).length;
    if (lastWordCount <= 100) {
      const merged = chunks.splice(chunks.length - 2, 2).join(" ");
      chunks.push(merged);
    }
  }

  return chunks.length ? chunks : [text];
}

function buildSpreadPages(illustrations: any[], structures: any[]): BookPage[] {
  return illustrations
    .filter((ill) => ill.sourceType === "spread")
    .sort((a, b) => (a.spreadIndex ?? 0) - (b.spreadIndex ?? 0))
    .map((ill, idx) => {
      const struct = structures.find(
        (s: any) => s.current?.spreadIndex === ill.spreadIndex
      ) as any;
      const text = struct?.current?.text || ill.current?.text || "";
      const title = `Spread ${(ill.spreadIndex ?? idx) + 1}`;
      const imgUrl = illusUrl(ill);
      return {
        id: `spread-${ill.key}`,
        label: title,
        type: "spread",
        imageUrl: imgUrl,
        title,
        text,
        layoutType: resolveSpreadLayout(text, imgUrl),
      };
    });
}

function buildChapterPages(
  illustrations: any[],
  humanized: any[],
  prose: any[]
): BookPage[] {
  const moments = illustrations.filter((ill) => ill.sourceType === "chapter-moment");

  const allChapterIdxs = [
    ...new Set([
      ...moments.map((m: any) => Number(m.chapterIndex ?? 0)),
      ...humanized.map((h: any) => Number(h.chapterIndex ?? 0)),
      ...prose.map((p: any) => Number(p.chapterIndex ?? 0)),
    ]),
  ].sort((a, b) => a - b);

  const pages: BookPage[] = [];
  let runningPageNum = 1;

  allChapterIdxs.forEach((chIdx) => {
    const chNum = chIdx + 1;
    const humanNode = humanized.find((h: any) => Number(h.chapterIndex) === chIdx) as any;
    const proseNode = prose.find((p: any) => Number(p.chapterIndex) === chIdx) as any;
    const chapterNode = humanNode || proseNode;

    const chapterTitle = chapterNode?.current?.chapterTitle || `Chapter ${chNum}`;
    const chapterText = chapterNode?.current?.chapterText || "";

    const chMoments = moments
      .filter((m: any) => Number(m.chapterIndex) === chIdx)
      .sort((a: any, b: any) => (a.spreadIndex ?? 0) - (b.spreadIndex ?? 0));

    const firstMoment = chMoments[0];
    const secondMoment = chMoments[1];

    pages.push({
      id: `chapter-${chIdx}-opener`,
      label: `Ch.${chNum} — ${chapterTitle}`,
      type: "chapter-opener",
      imageUrl: firstMoment ? illusUrl(firstMoment) : "",
      subTitle: `Chapter ${chNum}`,
      title: chapterTitle,
    });

    if (chapterText) {
      const proseChunks = splitProse(chapterText);
      proseChunks.forEach((chunk, ci) => {
        pages.push({
          id: `chapter-${chIdx}-text-${ci}`,
          label: `Ch.${chNum} — Page ${ci + 1}`,
          type: "text-page",
          imageUrl: "",
          subTitle: chapterTitle,
          text: chunk,
          pageNum: runningPageNum++,
          layoutType: resolveTextLayout(chunk),
        });
      });
    }

    if (secondMoment) {
      pages.push({
        id: `chapter-${chIdx}-moment-1`,
        label: `Ch.${chNum} — Scene 2`,
        type: "chapter-moment",
        imageUrl: illusUrl(secondMoment),
        text: secondMoment.current?.momentTitle || "",
      });
    }

    chMoments.slice(2).forEach((moment: any, mi: number) => {
      pages.push({
        id: `chapter-${chIdx}-moment-${mi + 2}`,
        label: `Ch.${chNum} — Scene ${mi + 3}`,
        type: "chapter-moment",
        imageUrl: illusUrl(moment),
        text: moment.current?.momentTitle || "",
      });
    });
  });

  return pages;
}

export function useBookEditor() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("Untitled Book");
  const [isChapterBook, setIsChapterBook] = useState(false);

  const pagesRef = useRef<BookPage[]>([]);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

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

      const r = reviewData.review;
      const bookTitle = r?.story?.current?.bookTitle || "Untitled Book";
      const author = (reviewData as any).authorName || "";
      const mode = reviewData.workflow?.mode || "picture-book";
      const isChapter = mode === "chapter-book";

      setProjectTitle(bookTitle);
      setIsChapterBook(isChapter);

      const frontNode = (coverData as any)?.cover?.front;
      const frontVariants = normArr(frontNode?.current?.variants ?? []);
      const frontSelIdx = frontNode?.current?.selectedVariantIndex ?? 0;
      const frontUrl = (frontVariants[frontSelIdx] as any)?.imageUrl || frontNode?.current?.imageUrl || "";

      const backNode = (coverData as any)?.cover?.back;
      const backVariants = normArr(backNode?.current?.variants ?? []);
      const backSelIdx = backNode?.current?.selectedVariantIndex ?? 0;
      const backUrl = (backVariants[backSelIdx] as any)?.imageUrl || backNode?.current?.imageUrl || "";

      const illustrations = normArr(r?.illustrations ?? []);
      const structures = normArr(r?.structure?.items ?? []);
      const humanized = normArr(r?.humanized ?? []);
      const prose = normArr(r?.prose ?? []);

      const bookPages: BookPage[] = [];

      bookPages.push({
        id: "cover-front",
        label: "Front Cover",
        type: "front-cover",
        imageUrl: frontUrl,
        title: bookTitle,
        text: author ? `By ${author}` : "",
      });

      if (isChapter) {
        bookPages.push(...buildChapterPages(illustrations, humanized, prose));
      } else {
        bookPages.push(...buildSpreadPages(illustrations, structures));
      }

      bookPages.push({
        id: "cover-back",
        label: "Back Cover",
        type: "back-cover",
        imageUrl: backUrl,
        text: r?.story?.current?.synopsis || "",
      });

      const savedById = new Map<string, any>();
      (savedEditorData.pages ?? []).forEach((sp: any) => {
        if (sp?.id) savedById.set(sp.id, sp);
      });

      const mergedPages = bookPages.map((page) => {
        const saved = savedById.get(page.id);
        if (!saved) return page;

        const isValidFabric =
          saved.fabricJson &&
          typeof saved.fabricJson === "object" &&
          (saved.fabricJson as any).objects !== undefined;

        // Read layoutKey from top-level OR from embedded _layoutKey in fabricJson
        const savedLayoutKey =
          saved.layoutKey ??
          (isValidFabric ? (saved.fabricJson as any)._layoutKey : null) ??
          null;

        // Read bodyTextStyles from top-level OR from embedded _bodyTextStyles
        const savedBodyTextStyles =
          saved.bodyTextStyles ??
          (isValidFabric ? (saved.fabricJson as any)._bodyTextStyles : null) ??
          null;

        return {
          ...page,
          ...(isValidFabric && { fabricJson: saved.fabricJson }),
          ...(saved.thumbnail !== undefined && { thumbnail: saved.thumbnail }),
          ...(saved.text !== undefined && { text: saved.text }),
          ...(saved.title !== undefined && { title: saved.title }),
          ...(savedLayoutKey && { layoutKey: savedLayoutKey }),
          ...(savedBodyTextStyles && { bodyTextStyles: savedBodyTextStyles }),
        };
      });

      setPages(mergedPages);
      pagesRef.current = mergedPages;
    } catch (err) {
      setError((err as Error).message || "Failed to load book data");
    } finally {
      setLoading(false);
    }
  };

  const updatePage = useCallback((idx: number, updates: Partial<BookPage>) => {
    setPages((prev) => {
      const next = prev.map((page, i) => (i === idx ? { ...page, ...updates } : page));
      pagesRef.current = next;
      return next;
    });
  }, []);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueuedPagesRef = useRef<BookPage[]>([]);
  const isFlushRunningRef = useRef(false);
  const hasQueuedSaveRef = useRef(false);

  const clearScheduledSave = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const buildPayload = useCallback(async (latestPages: BookPage[]) => {
    if (!projectId) return [];

    const sanitizedPages: BookPage[] = [];
    for (const page of latestPages) {
      const cleanFabric = await sanitizeFabricImages(
        page.fabricJson ?? null,
        projectId,
        page.id
      );
      sanitizedPages.push({ ...page, fabricJson: cleanFabric ?? null });
    }

    return sanitizedPages.map((page) => {
      const fj = page.fabricJson;
      const validFabric =
        fj && typeof fj === "object" && (fj as any).objects !== undefined ? fj : null;

      // ── Embed layoutKey + bodyTextStyles inside fabricJson as fallback metadata.
      // This guarantees they survive even if the backend doesn't know about
      // the top-level fields.
      const metaFields: Record<string, unknown> = {};
      if (page.layoutKey) metaFields._layoutKey = page.layoutKey;
      if (page.bodyTextStyles) metaFields._bodyTextStyles = page.bodyTextStyles;

      const fabricWithMeta = validFabric
        ? { ...validFabric, ...metaFields }
        : (Object.keys(metaFields).length > 0
            ? { version: "5.3.1", objects: [], ...metaFields }
            : null);

      return {
        id: page.id,
        fabricJson: fabricWithMeta,
        thumbnail: page.thumbnail ?? null,
        text: page.text ?? "",
        title: page.title ?? "",
        imageUrl: page.imageUrl ?? "",
        // Also send as top-level for backends that support it
        layoutKey: page.layoutKey ?? null,
        bodyTextStyles: page.bodyTextStyles ?? null,
      };
    });
  }, [projectId]);

  const flushSaveQueue = useCallback(async (): Promise<void> => {
    if (!projectId || isFlushRunningRef.current) return;

    isFlushRunningRef.current = true;

    try {
      while (hasQueuedSaveRef.current) {
        hasQueuedSaveRef.current = false;
        const snapshot = latestQueuedPagesRef.current;
        const payload = await buildPayload(snapshot);
        await reviewApi.saveEditorPages(projectId, payload);
      }
    } finally {
      isFlushRunningRef.current = false;
    }
  }, [buildPayload, projectId]);

  const saveAllPages = useCallback(async (latestPages: BookPage[]): Promise<void> => {
    if (!projectId) return;

    clearScheduledSave();
    latestQueuedPagesRef.current = latestPages;
    hasQueuedSaveRef.current = true;
    await flushSaveQueue();
  }, [clearScheduledSave, flushSaveQueue, projectId]);

  const autoSave = useCallback((latestPages: BookPage[]) => {
    if (!projectId) return;

    latestQueuedPagesRef.current = latestPages;
    hasQueuedSaveRef.current = true;
    clearScheduledSave();

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      flushSaveQueue().catch(console.error);
    }, 1500);
  }, [clearScheduledSave, flushSaveQueue, projectId]);

  useEffect(() => {
    return () => clearScheduledSave();
  }, [clearScheduledSave]);

  const goToPage = useCallback((idx: number) => {
    setCurrentPageIdx(Math.max(0, Math.min(idx, pagesRef.current.length - 1)));
  }, []);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const currentPage = pages[currentPageIdx];
  const currentPageProps = currentPage
    ? { id: currentPage.id, text: currentPage.text, imageUrl: currentPage.imageUrl }
    : undefined;

  return {
    projectId,
    projectTitle,
    isChapterBook,
    pages,
    currentPageIdx,
    currentPage,
    currentPageProps,
    setCurrentPageIdx: goToPage,
    loading,
    error,
    updatePage,
    saveAllPages,
    autoSave,
    goBack,
  };
}