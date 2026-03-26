// hooks/useBookBuilder.ts
// Central hook that owns all state and server interactions for BookBuilderPage.

import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import { projectsApi } from "@/lib/api/projects.api";
import { aiApi } from "@/lib/api/ai.api";
import { reviewApi } from "@/lib/api/review.api";
import {
  AgeMode,
  CoverReview,
  getAgeMode,
  HumanizedReviewNode,
  IllustrationNode,
  normArr,
  ProseReviewNode,
  ReviewResponse,
  StoryReview,
  StructureItem,
  StructureReview,
} from "@/lib/api/reviewTypes";

type LoadingKey = string | null;

export interface BookBuilderState {
  projectId: string | null;
  mode: AgeMode;
  step: number;
  completedSteps: Set<number>;
  storyIdea: string;
  ageRange: string;
  language: string;
  authorName: string;
  universeId: string;
  knowledgeBaseId: string;
  theme: string;
  storyReview: StoryReview | null;
  structureReview: StructureReview | null;
  characterIds: string[];
  artStyle: string;
  portraits: Record<string, string>;
  proseReview: ProseReviewNode[];
  humanizedReview: HumanizedReviewNode[];
  illustrationNodes: IllustrationNode[];
  selectedVariants: Record<string, number>;
  coverReview: CoverReview | null;
  globalLoading: boolean;
  loadingKey: LoadingKey;
}

function getProjectId(v: unknown): string {
  if (!v || typeof v !== "object") return "";
  const obj = v as Record<string, unknown>;
  return String(obj.id ?? obj._id ?? "");
}

export function useBookBuilder() {
  const navigate    = useNavigate();
  const { toast }   = useToast();
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const pidRef      = useRef<string | null>(null);

  const [step,           setStep]           = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [storyIdea,  setStoryIdea]  = useState("");
  const [ageRange,   setAgeRange]   = useState("6-8");
  const [language,   setLanguage]   = useState("english");
  const [authorName, setAuthorName] = useState("");
  const [universeId,      setUniverseId]      = useState("");
  const [knowledgeBaseId, setKnowledgeBaseId] = useState("");
  const [theme,           setTheme]           = useState("");
  const [storyReview,       setStoryReview]       = useState<StoryReview | null>(null);
  const [structureReview,   setStructureReview]   = useState<StructureReview | null>(null);
  const [proseReview,       setProseReview]       = useState<ProseReviewNode[]>([]);
  const [humanizedReview,   setHumanizedReview]   = useState<HumanizedReviewNode[]>([]);
  const [illustrationNodes, setIllustrationNodes] = useState<IllustrationNode[]>([]);
  const [selectedVariants,  setSelectedVariants]  = useState<Record<string, number>>({});
  const [coverReview,  setCoverReview]  = useState<CoverReview | null>(null);
  const [characterIds, setCharacterIds] = useState<string[]>([]);
  const [artStyle,     setArtStyle]     = useState("pixar-3d");
  const [portraits,    setPortraits]    = useState<Record<string, string>>({});
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingKey,    setLoadingKey]    = useState<LoadingKey>(null);

  const mode          = useMemo(() => getAgeMode(ageRange), [ageRange]);
  const isChapterBook = mode === "chapter-book";

  const markDone = useCallback((n: number) => {
    setCompletedSteps((prev) => new Set([...prev, n]));
  }, []);

  const getPid = useCallback(() => {
    if (!pidRef.current) throw new Error("Project not created yet");
    return pidRef.current;
  }, []);

  const hydrateReview = useCallback((data: ReviewResponse) => {
    const r = data.review;
    if (r?.story)     setStoryReview(r.story);
    if (r?.structure) setStructureReview(r.structure);

    const prose     = normArr<ProseReviewNode>(r?.prose);
    const humanized = normArr<HumanizedReviewNode>(r?.humanized);
    if (prose.length)     setProseReview(prose);
    if (humanized.length) setHumanizedReview(humanized);

    const illus = normArr<IllustrationNode>(r?.illustrations);
    if (illus.length) {
      setIllustrationNodes(illus);
      const sv: Record<string, number> = {};
      illus.forEach((n) => { sv[n.key] = n.current.selectedVariantIndex ?? 0; });
      setSelectedVariants(sv);
    }
    if (r?.cover) setCoverReview(r.cover);
  }, []);

  const refreshReview = useCallback(async () => {
    const pid  = getPid();
    const data = await reviewApi.get(pid);
    hydrateReview(data);
    return data;
  }, [getPid, hydrateReview]);

  // ─── STEP 1: Story ─────────────────────────────────────────────────────────
  const generateStory = useCallback(async () => {
    if (!storyIdea.trim()) {
      toast({ title: "Story idea is required", variant: "destructive" });
      return;
    }
    setGlobalLoading(true);
    try {
      const created = await projectsApi.create({
        title:             storyIdea.slice(0, 80),
        storyIdea,
        ageRange,
        language,
        authorName:        authorName        || undefined,
        universeId:        universeId        || undefined,
        knowledgeBaseId:   knowledgeBaseId   || undefined,
        learningObjective: theme             || undefined,
        chapterCount:      isChapterBook ? 4 : 10,
      });

      const pid = getProjectId(created);
      pidRef.current = pid;

      await reviewApi.bootstrap(pid);
      if (storyIdea) await aiApi.generateStory(pid, storyIdea);

      const data = await refreshReview();
      hydrateReview(data);
      toast({ title: "Story generated ✓" });
    } catch (err) {
      toast({ title: "Story generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setGlobalLoading(false);
    }
  }, [storyIdea, ageRange, language, authorName, universeId, theme, isChapterBook, refreshReview, hydrateReview, toast]);

  const saveAndApproveStory = useCallback(async () => {
    const pid     = getPid();
    const current = storyReview?.current;
    if (!current) return;
    try {
      await reviewApi.patchStory(pid, current);
      await reviewApi.approveStory(pid);
      await refreshReview();
      markDone(1);
      setStep(2);
      toast({ title: "Story approved ✓" });
    } catch (err) {
      toast({ title: "Approve failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [getPid, storyReview, refreshReview, markDone, toast]);

  const updateStoryCurrent = useCallback(
    (patch: Partial<NonNullable<typeof storyReview>["current"]>) => {
      setStoryReview((prev) => prev ? { ...prev, current: { ...prev.current, ...patch } } : prev);
    },
    []
  );

  const regenerateStory = useCallback(async (ideaOverride?: string) => {
    const pid = getPid();
    setLoadingKey("story-regen");
    try {
      await reviewApi.regenerateStory(pid, ideaOverride || storyIdea);
      await refreshReview();
      toast({ title: "Story regenerated ✓" });
    } catch (err) {
      toast({ title: "Regeneration failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, storyIdea, refreshReview, toast]);

  // ─── STEP 2: Structure ─────────────────────────────────────────────────────
  const generateStructure = useCallback(async () => {
    const pid = getPid();
    setGlobalLoading(true);
    try {
      await projectsApi.update(pid, { characterIds, bookStyle: { artStyle } });
      await reviewApi.regenerateStructure(pid);
      await refreshReview();
      toast({ title: "Structure generated ✓" });
    } catch (err) {
      toast({ title: "Structure generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setGlobalLoading(false);
    }
  }, [getPid, characterIds, artStyle, refreshReview, toast]);

  const patchStructureItem = useCallback(async (key: string, current: Partial<StructureItem["current"]>) => {
    const pid = getPid();
    try {
      await reviewApi.patchStructureItem(pid, key, current);
    } catch (err) {
      toast({ title: "Save failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [getPid, toast]);

  const approveStructureItem = useCallback(async (key: string, current: Partial<StructureItem["current"]>) => {
    const pid = getPid();
    setLoadingKey(`approve-struct-${key}`);
    try {
      await reviewApi.patchStructureItem(pid, key, current);
      const res = await reviewApi.approveStructureItem(pid, key);
      await refreshReview();
      toast({ title: "Approved ✓" });
      return res;
    } catch (err) {
      toast({ title: "Approve failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, refreshReview, toast]);

  const approveAllStructure = useCallback(async () => {
    const pid = getPid();
    const items = normArr<StructureItem>(structureReview?.items);
    const unapproved = items.filter((i) => i.status !== "approved");
    if (!unapproved.length) return;
    setLoadingKey("approve-all-structure");
    try {
      await Promise.all(
        unapproved.map((item) =>
          reviewApi.approveStructureItem(pid, item.key)
        )
      );
      await refreshReview();
      toast({ title: `All ${unapproved.length} items approved ✓` });
    } catch (err) {
      toast({ title: "Approve all failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, structureReview, refreshReview, toast]);

  const allStructureApproved = useMemo(() => {
    const items = normArr<StructureItem>(structureReview?.items);
    return items.length > 0 && items.every((i) => i.status === "approved");
  }, [structureReview]);

  // ─── STEP 3: Style ─────────────────────────────────────────────────────────
  const generatePortrait = useCallback(async (characterId: string) => {
    const pid = getPid();
    setLoadingKey(`portrait-${characterId}`);
    try {
      const res = await aiApi.generateCharacterStyle(pid, characterId, artStyle);
      const url = res.masterReferenceUrl || res.imageUrl;
      if (url) setPortraits((prev) => ({ ...prev, [characterId]: url }));
      await refreshUser();
      toast({ title: "Portrait generated ✓" });
    } catch (err) {
      toast({ title: "Portrait failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, artStyle, refreshUser, toast]);

  // ─── STEP 4: Prose ─────────────────────────────────────────────────────────

  // FIX: saveProseNode — saves manual edits to DB via existing PATCH endpoint
  const saveProseNode = useCallback(async (chapterIndex: number, data: Partial<ProseReviewNode["current"]>) => {
    const pid = getPid();
    await reviewApi.patchChapterProse(pid, chapterIndex, {
      chapterSummary:      data.chapterSummary      ?? "",
      chapterText:         data.chapterText         ?? "",
      islamicMoment:       (data as any).islamicMoment ?? "",
      illustrationMoments: (data as any).illustrationMoments ?? [],
    });
  }, [getPid]);

  const generateChapterProse = useCallback(async (chapterIndex: number) => {
    const pid = getPid();
    setLoadingKey(`prose-gen-${chapterIndex}`);
    try {
      await reviewApi.regenerateChapterProse(pid, chapterIndex);
      await refreshReview();
      toast({ title: `Chapter ${chapterIndex + 1} prose generated ✓` });
    } catch (err) {
      toast({ title: "Prose generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, refreshReview, toast]);

  const humanizeChapterProse = useCallback(async (chapterIndex: number) => {
    const pid = getPid();
    setLoadingKey(`prose-humanize-${chapterIndex}`);
    try {
      await reviewApi.humanizeChapterProse(pid, chapterIndex);
      await refreshReview();
      toast({ title: `Chapter ${chapterIndex + 1} humanized ✓` });
    } catch (err) {
      toast({ title: "Humanize failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, refreshReview, toast]);

  const saveAndApproveChapterProse = useCallback(async (
    chapterIndex: number,
    current: Partial<ProseReviewNode["current"]>
  ) => {
    const pid = getPid();
    setLoadingKey(`prose-approve-${chapterIndex}`);
    try {
      await reviewApi.patchChapterProse(pid, chapterIndex, current);
      await reviewApi.approveChapterProse(pid, chapterIndex);
      await refreshReview();
      toast({ title: `Chapter ${chapterIndex + 1} approved ✓` });
    } catch (err) {
      toast({ title: "Approve failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, refreshReview, toast]);

  const updateProseNode = useCallback((
    chapterIndex: number,
    patch: Partial<ProseReviewNode["current"]>
  ) => {
    setProseReview((prev) =>
      prev.map((n) =>
        n.chapterIndex === chapterIndex
          ? { ...n, current: { ...n.current, ...patch } }
          : n
      )
    );
    // Also update humanized review if it exists for this chapter
    setHumanizedReview((prev) =>
      prev.map((n) =>
        n.chapterIndex === chapterIndex
          ? { ...n, current: { ...n.current, ...patch } }
          : n
      )
    );
  }, []);

  const allProseApproved = useMemo(() => {
    if (!isChapterBook) return true;
    const nodes = humanizedReview.length ? humanizedReview : proseReview;
    return nodes.length > 0 && nodes.every((n) => n.status === "approved");
  }, [isChapterBook, proseReview, humanizedReview]);

  // ─── STEP 4/5: Illustrations ───────────────────────────────────────────────
  const loadIllustrations = useCallback(async () => {
    const pid = getPid();
    setGlobalLoading(true);
    try {
      const res   = await reviewApi.getIllustrations(pid);
      const nodes = normArr<IllustrationNode>(res.illustrations);
      setIllustrationNodes(nodes);
      const sv: Record<string, number> = {};
      nodes.forEach((n) => { sv[n.key] = n.current.selectedVariantIndex ?? 0; });
      setSelectedVariants(sv);
    } catch (err) {
      toast({ title: "Load failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setGlobalLoading(false);
    }
  }, [getPid, toast]);

  const regenerateIllustration = useCallback(async (
    key: string,
    opts?: { prompt?: string; variantCount?: number }
  ) => {
    const pid = getPid();
    setLoadingKey(`ill-${key}`);
    try {
      await reviewApi.regenerateIllustration(pid, key, {
        variantCount: opts?.variantCount ?? 4,
        prompt: opts?.prompt,
      });
      await loadIllustrations();
      toast({ title: "Illustration generated ✓" });
    } catch (err) {
      toast({ title: "Generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, loadIllustrations, toast]);

  const selectIllustrationVariant = useCallback(async (key: string, variantIndex: number) => {
    const pid = getPid();
    try {
      await reviewApi.selectIllustrationVariant(pid, key, variantIndex);
      setSelectedVariants((prev) => ({ ...prev, [key]: variantIndex }));
    } catch (err) {
      toast({ title: "Select failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [getPid, toast]);

  const approveIllustration = useCallback(async (key: string) => {
    const pid = getPid();
    setLoadingKey(`ill-approve-${key}`);
    try {
      await reviewApi.approveIllustration(pid, key);
      await loadIllustrations();
      toast({ title: "Illustration approved ✓" });
    } catch (err) {
      toast({ title: "Approve failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, loadIllustrations, toast]);

  const allIllusApproved = useMemo(() => {
    return illustrationNodes.length > 0 && illustrationNodes.every((n) => n.status === "approved");
  }, [illustrationNodes]);

  // ─── STEP 5/6: Cover ──────────────────────────────────────────────────────
  const loadCover = useCallback(async () => {
    const pid = getPid();
    try {
      const res = await reviewApi.getCover(pid);
      setCoverReview(res.cover);
    } catch (err) {
      toast({ title: "Cover load failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [getPid, toast]);

  const regenerateCover = useCallback(async (side: "front" | "back", opts?: { prompt?: string }) => {
    const pid = getPid();
    setLoadingKey(`cover-${side}`);
    try {
      await reviewApi.regenerateCover(pid, side, { variantCount: 4, prompt: opts?.prompt });
      await loadCover();
      toast({ title: `${side} cover generated ✓` });
    } catch (err) {
      toast({ title: "Cover generation failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, loadCover, toast]);

  const selectCoverVariant = useCallback(async (side: "front" | "back", variantIndex: number) => {
    const pid = getPid();
    try {
      await reviewApi.selectCoverVariant(pid, side, variantIndex);
      await loadCover();
    } catch (err) {
      toast({ title: "Select failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [getPid, loadCover, toast]);

  const approveCover = useCallback(async (side: "front" | "back") => {
    const pid = getPid();
    setLoadingKey(`cover-approve-${side}`);
    try {
      await reviewApi.approveCover(pid, side);
      await loadCover();
      toast({ title: `${side} cover approved ✓` });
    } catch (err) {
      toast({ title: "Approve failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoadingKey(null);
    }
  }, [getPid, loadCover, toast]);

  const bothCoversApproved = useMemo(() => {
    if (!coverReview) return false;
    return coverReview.front?.status === "approved" && coverReview.back?.status === "approved";
  }, [coverReview]);

  // ─── Editor ────────────────────────────────────────────────────────────────
  const openEditor = useCallback(async () => {
    const pid = getPid();
    setGlobalLoading(true);
    try {
      await projectsApi.generateLayout(pid);
      markDone(isChapterBook ? 7 : 6);
      navigate(`/app/projects/${pid}`);
    } catch {
      navigate(`/app/projects/${pid}`);
    } finally {
      setGlobalLoading(false);
    }
  }, [getPid, isChapterBook, markDone, navigate]);

  return {
    // Identity
    projectId: pidRef.current,
    mode,
    isChapterBook,

    // Steps
    step,
    setStep,
    completedSteps,
    markDone,

    // Story
    storyIdea, setStoryIdea,
    ageRange, setAgeRange,
    language, setLanguage,
    authorName, setAuthorName,
    universeId, setUniverseId,
    knowledgeBaseId, setKnowledgeBaseId,
    theme, setTheme,
    storyReview,
    updateStoryCurrent,
    generateStory,
    regenerateStory,
    saveAndApproveStory,

    // Structure
    structureReview,
    allStructureApproved,
    generateStructure,
    patchStructureItem,
    approveStructureItem,
    approveAllStructure,

    // Style
    characterIds, setCharacterIds,
    artStyle, setArtStyle,
    portraits,
    generatePortrait,

    // Prose
    proseReview,
    humanizedReview,
    updateProseNode,
    saveProseNode,          // ← NEW: exposed for ProseStep save-before-regenerate
    allProseApproved,
    generateChapterProse,
    humanizeChapterProse,
    saveAndApproveChapterProse,

    // Illustrations
    illustrationNodes,
    selectedVariants,
    allIllusApproved,
    loadIllustrations,
    regenerateIllustration,
    selectIllustrationVariant,
    approveIllustration,

    // Cover
    coverReview,
    loadCover,
    regenerateCover,
    selectCoverVariant,
    approveCover,
    bothCoversApproved,

    // Misc
    globalLoading,
    loadingKey,
    openEditor,
    refreshReview,
  };
}

export type BookBuilderHook = ReturnType<typeof useBookBuilder>;