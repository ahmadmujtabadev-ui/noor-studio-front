// hooks/useBookEditor.ts
// Loads all book data and builds the ordered page list for the canvas editor.
//
// FIX CHANGELOG:
// ── Fix 3 (style persistence): Removed the special-case that stripped fabricJson
//    from text-page types on load. Previously, every page refresh re-built text
//    pages from scratch (ignoring saved fabricJson), causing all style edits
//    (font changes, colour, position etc.) to vanish. Now text pages restore
//    their full fabricJson just like every other page type.
//
// ── Why this was originally stripped:
//    The comment said "let canvas regenerate" so that font/image-placement rules
//    would be reflected immediately. But this made it impossible to persist ANY
//    editor change on a text page. The correct approach is to save & restore
//    fabricJson always, and only apply the initial layout on pages that have
//    never been edited (fabricJson is null/empty) — which FabricPageCanvas
//    already handles correctly via the loadFromJSON → buildInitialObjects branch.

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reviewApi } from "@/lib/api/review.api";
import { normArr } from "@/lib/api/reviewTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

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
}

// ─── Layout auto-assignment ───────────────────────────────────────────────────

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
  if (/hadith|ayah|quran|قال|ﷺ|اللَّهُ|bismillah|sunnah/i.test(text)) return "decorative_full_text";
  return "two_column";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function buildSpreadPages(illustrations: any[], structures: any[]): BookPage[] {
  return illustrations
    .filter((ill) => ill.sourceType === "spread")
    .sort((a, b) => (a.spreadIndex ?? 0) - (b.spreadIndex ?? 0))
    .map((ill, idx) => {
      const struct = structures.find(
        (s: any) => s.current?.spreadIndex === ill.spreadIndex,
      ) as any;
      const text = struct?.current?.text || ill.current?.text || "";
      const title = `Spread ${(ill.spreadIndex ?? idx) + 1}`;
      const imgUrl = illusUrl(ill);
      return {
        id: `spread-${ill.key}`, label: title, type: "spread" as BookPageType,
        imageUrl: imgUrl, title, text,
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

    // 1. Chapter opener — always uses img0 (firstMoment)
    pages.push({
      id: `chapter-${chIdx}-opener`,
      label: `Ch.${chNum} — ${chapterTitle}`,
      type: "chapter-opener",
      imageUrl: firstMoment ? illusUrl(firstMoment) : "",
      subTitle: `Chapter ${chNum}`,
      title: chapterTitle,
    });

    // 2. Text pages — pure text, no embedded illustrations
    if (chapterText) {
      const chunks = splitProse(chapterText);
      chunks.forEach((chunk, ci) => {
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

    // 3. img1 (secondMoment) as its own dedicated full-bleed page
    //    — always shown, never buried inside a text page
    if (secondMoment) {
      pages.push({
        id: `chapter-${chIdx}-moment-1`,
        label: `Ch.${chNum} — Scene 2`,
        type: "chapter-moment",
        imageUrl: illusUrl(secondMoment),
        text: secondMoment.current?.momentTitle || "",
      });
    }

    // 4. Any additional moments beyond the 2nd (img2, img3 …)
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
        id: "cover-front", label: "Front Cover", type: "front-cover",
        imageUrl: frontUrl, title: bookTitle,
        text: author ? `By ${author}` : "",
      });

      if (isChapter) {
        bookPages.push(...buildChapterPages(illustrations, humanized, prose));
      } else {
        bookPages.push(...buildSpreadPages(illustrations, structures));
      }

      bookPages.push({
        id: "cover-back", label: "Back Cover", type: "back-cover",
        imageUrl: backUrl, text: r?.story?.current?.synopsis || "",
      });

      // ── Merge saved editor state ─────────────────────────────────────────────
      const savedById = new Map<string, any>();
      (savedEditorData.pages ?? []).forEach((sp: any) => {
        if (sp?.id) savedById.set(sp.id, sp);
      });

      // ── FIX 3: Restore fabricJson for ALL page types including text-page ────
      //
      // Previously text-page stripped fabricJson and only restored text/title.
      // This caused every style edit (font, colour, position) to vanish on refresh
      // because FabricPageCanvas re-built the page from scratch with hardcoded defaults.
      //
      // Fix: treat text-page identically to all other page types — restore the
      // full saved state (fabricJson + thumbnail + text + title).
      //
      // FabricPageCanvas already handles this correctly:
      //   • fabricJson present  → loadFromJSON (restores exact editor state)
      //   • fabricJson absent   → buildInitialObjects (fresh layout from text)
      // So there is no risk of "stale layout" — it only applies on brand-new pages.

      const mergedPages = bookPages.map((p) => {
        const saved = savedById.get(p.id);
        if (!saved) return p;

        // Restore full editor state for every page type (text-page included)
        return {
          ...p,
          ...(saved.fabricJson !== undefined && { fabricJson: saved.fabricJson }),
          ...(saved.thumbnail !== undefined && { thumbnail: saved.thumbnail }),
          ...(saved.text !== undefined && { text: saved.text }),
          ...(saved.title !== undefined && { title: saved.title }),
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
      setPages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...updates } : p)));
    },
    [],
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveAllPages = useCallback(
    async (latestPages: BookPage[]): Promise<void> => {
      if (!projectId) return;
      const payload = latestPages.map((p) => ({
        id: p.id,
        fabricJson: p.fabricJson ?? null,
        thumbnail: p.thumbnail ?? null,
        text: p.text ?? "",
        title: p.title ?? "",
      }));
      await reviewApi.saveEditorPages(projectId, payload);
    },
    [projectId],
  );

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