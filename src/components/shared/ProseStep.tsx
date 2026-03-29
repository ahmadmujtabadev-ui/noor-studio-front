// ProseStep.tsx — Kids-friendly book-type layout
// Chapters displayed as open book pages with story-like feel

import React, { useState, useCallback, useRef } from "react";
import {
  PenLine, ArrowLeft, ArrowRight, RefreshCw, Sparkles,
  Loader2, Check, GitCompare, Save, BookOpen, ChevronDown,
  ChevronUp, CheckCheck,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { cn }       from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { reviewApi } from "@/lib/api/review.api";
import { ChapterOutlineItem, normArr, ProseReviewNode, StructureItem } from "@/lib/api/reviewTypes";
import { BookBuilderHook } from "@/hooks/useBookBuilder";

interface ProseStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

type ViewMode = "current" | "compare";

// ── Decorative page corner ───────────────────────────────────────────────────
function PageCorner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("absolute w-8 h-8 text-primary/10", className)}
      viewBox="0 0 32 32" fill="none"
    >
      <path d="M0 0 L32 0 L32 32 Z" fill="currentColor" />
    </svg>
  );
}

export function ProseStep({ bb, onBack, onContinue }: ProseStepProps) {
  const { toast } = useToast();
  const [expanded,  setExpanded]  = useState<Record<number, boolean>>({});
  const [viewMode,  setViewMode]  = useState<Record<number, ViewMode>>({});
  const [saving,    setSaving]    = useState<Record<number, boolean>>({});

  const localEdits = useRef<Record<number, Partial<ProseReviewNode["current"]>>>({});

  const chapters = normArr<StructureItem>(bb.structureReview?.items)
    .filter((i) => i.unitType === "chapter-outline") as ChapterOutlineItem[];

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getHumanizedNode = (ci: number): ProseReviewNode | undefined =>
    bb.humanizedReview.find((n) => n.chapterIndex === ci) as ProseReviewNode | undefined;

  const getRawProseNode = (ci: number): ProseReviewNode | undefined =>
    bb.proseReview.find((n) => n.chapterIndex === ci) as ProseReviewNode | undefined;

  const getActiveProseNode = (ci: number): ProseReviewNode | undefined =>
    getHumanizedNode(ci) ?? getRawProseNode(ci);

  const getOriginalText = (ci: number): string => {
    const raw = getRawProseNode(ci);
    if (!raw) return "";
    const versions = normArr(raw.versions as Array<{ version: number; snapshot: ProseReviewNode["current"]; createdAt: string }>);
    return versions.length > 0
      ? (versions[0].snapshot?.chapterText ?? raw.current.chapterText)
      : raw.current.chapterText;
  };

  const getMergedCurrent = (ci: number): ProseReviewNode["current"] => {
    const node = getActiveProseNode(ci);
    const c    = chapters[ci]?.current;
    const base: ProseReviewNode["current"] = node?.current ?? {
      chapterNumber:      ci + 1,
      chapterTitle:       c?.title ?? `Chapter ${ci + 1}`,
      chapterSummary:     (c as any)?.goal ?? "",
      chapterText:        "",
      islamicMoment:      (c as any)?.duaHint ?? "",
      illustrationMoments: [],
    };
    return { ...base, ...(localEdits.current[ci] ?? {}) };
  };

  // ── Save local edits to server ───────────────────────────────────────────
  const saveLocalEdits = useCallback(async (ci: number): Promise<void> => {
    const edits = localEdits.current[ci];
    if (!edits || Object.keys(edits).length === 0) return;
    if (!bb.projectId) return;
    setSaving((p) => ({ ...p, [ci]: true }));
    try {
      await reviewApi.patchChapterProse(bb.projectId, ci, edits);
      localEdits.current[ci] = {};
    } catch {
      // non-fatal
    } finally {
      setSaving((p) => ({ ...p, [ci]: false }));
    }
  }, [bb.projectId]);

  const handleFieldChange = (ci: number, field: keyof ProseReviewNode["current"], value: string) => {
    localEdits.current[ci] = { ...(localEdits.current[ci] ?? {}), [field]: value };
    bb.updateProseNode(ci, { [field]: value } as any);
  };

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleGenerate = async (ci: number) => {
    await saveLocalEdits(ci);
    await bb.generateChapterProse(ci);
    await bb.refreshReview();
  };

  const handlePolish = async (ci: number) => {
    await saveLocalEdits(ci);
    await bb.humanizeChapterProse(ci);
    await bb.refreshReview();
    setViewMode((p) => ({ ...p, [ci]: "compare" }));
  };

  const handleSave = async (ci: number) => {
    await saveLocalEdits(ci);
    await bb.refreshReview();
    toast({ title: `Chapter ${ci + 1} saved ✓` });
  };

  const handleApprove = async (ci: number) => {
    await saveLocalEdits(ci);
    const current = getMergedCurrent(ci);
    await bb.saveAndApproveChapterProse(ci, current);
    await bb.refreshReview();
  };

  const approvedCount = chapters.filter((_, i) => getActiveProseNode(i)?.status === "approved").length;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Chapter Writing</h2>
            <p className="text-sm text-muted-foreground">
              Write each chapter → polish → compare → approve.
            </p>
          </div>
        </div>

        {/* Progress row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1.5">
            {chapters.map((_, i) => {
              const approved = getActiveProseNode(i)?.status === "approved";
              const hasText  = !!(getRawProseNode(i)?.current?.chapterText);
              return (
                <div
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    approved ? "bg-emerald-500 w-6" : hasText ? "bg-primary/40 w-4" : "bg-muted w-3",
                  )}
                  title={`Chapter ${i + 1}`}
                />
              );
            })}
          </div>
          <span className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{approvedCount}</span>/{chapters.length} approved
          </span>
          {bb.allProseApproved ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              All approved ✓
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 ml-auto"
              disabled={bb.loadingKey?.startsWith("prose-gen") || bb.globalLoading}
              onClick={() => (bb as any).generateAllChapterProse()}
            >
              {bb.loadingKey?.startsWith("prose-gen") ? (
                <><Loader2 className="w-3 h-3 animate-spin" />Writing…</>
              ) : (
                <><Sparkles className="w-3 h-3" />Write All Chapters</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* ── Chapter cards ── */}
      {chapters.map((chapter, i) => {
        const activeNode    = getActiveProseNode(i);
        const humanNode     = getHumanizedNode(i);
        const rawNode       = getRawProseNode(i);
        const isOpen        = expanded[i] ?? false;
        const vMode         = viewMode[i] ?? "current";
        const approved      = activeNode?.status === "approved";
        const hasText       = !!(rawNode?.current?.chapterText);
        const hasPolished   = !!(humanNode?.current?.chapterText);
        const merged        = getMergedCurrent(i);
        const originalText  = getOriginalText(i);
        const polishedText  = humanNode?.current?.chapterText ?? "";

        const isWriting    = bb.loadingKey === `prose-gen-${i}`;
        const isPolishing  = bb.loadingKey === `prose-humanize-${i}`;
        const isApproving  = bb.loadingKey === `prose-approve-${i}`;
        const isSaving     = saving[i] ?? false;
        const c            = chapter.current;

        // Word count estimate
        const wordCount = merged.chapterText?.split(/\s+/).filter(Boolean).length ?? 0;

        return (
          <div
            key={i}
            className={cn(
              "rounded-2xl overflow-hidden transition-all duration-300",
              approved
                ? "border-2 border-emerald-400 dark:border-emerald-600 shadow-md shadow-emerald-500/10"
                : isOpen
                ? "border-2 border-primary/30 shadow-lg shadow-primary/5"
                : "border border-border",
            )}
          >
            {/* ── Chapter tab header ── */}
            <div
              className={cn(
                "px-5 py-4 flex items-center gap-3 cursor-pointer transition-colors",
                approved
                  ? "bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/50"
                  : isOpen
                  ? "bg-primary/5 hover:bg-primary/10"
                  : "bg-muted/30 hover:bg-muted/50",
              )}
              onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
            >
              {/* Chapter number bubble */}
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-all",
                approved ? "bg-emerald-500 text-white"
                  : isWriting || isPolishing ? "bg-primary text-primary-foreground"
                  : isOpen ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}>
                {approved
                  ? <Check className="w-4 h-4" />
                  : (isWriting || isPolishing)
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : i + 1
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-base">
                  {c.title || `Chapter ${i + 1}`}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {c.goal && (
                    <p className="text-xs text-muted-foreground truncate max-w-xs">{c.goal}</p>
                  )}
                  {hasText && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      ~{wordCount} words
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {approved && (
                  <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Approved
                  </Badge>
                )}
                {hasPolished && !approved && (
                  <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    Polished
                  </Badge>
                )}
                {hasText && !hasPolished && !approved && (
                  <Badge className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Written
                  </Badge>
                )}
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                }
              </div>
            </div>

            {/* ── Expanded content ── */}
            {isOpen && (
              <div className="bg-card">
                {/* Action toolbar */}
                <div className="px-5 py-3 border-b border-border bg-muted/20 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isWriting || isSaving}
                    onClick={() => handleGenerate(i)}
                    className="h-8"
                  >
                    {isWriting
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Writing…</>
                      : <><RefreshCw className="w-3 h-3 mr-1.5" />{hasText ? "Rewrite" : "Write Chapter"}</>
                    }
                  </Button>

                  {hasText && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isPolishing || isSaving}
                      onClick={() => handlePolish(i)}
                      className="h-8"
                    >
                      {isPolishing
                        ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Polishing…</>
                        : <><Sparkles className="w-3 h-3 mr-1.5" />Polish Text</>
                      }
                    </Button>
                  )}

                  {hasPolished && (
                    <Button
                      size="sm"
                      variant={vMode === "compare" ? "default" : "ghost"}
                      onClick={() =>
                        setViewMode((p) => ({ ...p, [i]: p[i] === "compare" ? "current" : "compare" }))
                      }
                      className="h-8"
                    >
                      <GitCompare className="w-3 h-3 mr-1.5" />
                      {vMode === "compare" ? "Hide comparison" : "Compare drafts"}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isSaving}
                    onClick={() => handleSave(i)}
                    className="h-8"
                  >
                    {isSaving
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Saving</>
                      : <><Save className="w-3 h-3 mr-1.5" />Save</>
                    }
                  </Button>

                  <Button
                    size="sm"
                    className="ml-auto h-8"
                    disabled={isApproving || !hasText}
                    onClick={() => handleApprove(i)}
                  >
                    {isApproving
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Approving…</>
                      : <><Check className="w-3 h-3 mr-1.5" />Approve</>
                    }
                  </Button>
                </div>

                {/* ── Book page layout ── */}
                <div className="p-5 space-y-5">
                  {/* Chapter heading — book-style */}
                  <div className="text-center py-4 border-b border-dashed border-border">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                      Chapter {i + 1}
                    </p>
                    <h3 className="text-2xl font-serif font-bold text-foreground">
                      {c.title || `Chapter ${i + 1}`}
                    </h3>
                    {c.goal && (
                      <p className="text-sm text-muted-foreground mt-2 italic max-w-md mx-auto">
                        {c.goal}
                      </p>
                    )}
                  </div>

                  {/* Writing area — compare or single */}
                  {vMode === "compare" && hasPolished ? (
                    <div className="grid grid-cols-2 gap-4">
                      {/* Original */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Original Draft
                          </Label>
                          <span className="text-[10px] text-muted-foreground">
                            ~{originalText.split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <div className="relative">
                          <PageCorner className="top-0 left-0" />
                          <PageCorner className="top-0 right-0 rotate-90" />
                          <Textarea
                            value={originalText}
                            readOnly
                            rows={24}
                            className="text-sm leading-relaxed opacity-60 resize-none bg-amber-50/30 dark:bg-amber-950/10 font-serif rounded-xl border-border/50 pt-4 px-5"
                          />
                        </div>
                      </div>
                      {/* Polished */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            Polished Draft
                            <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">AI</Badge>
                          </Label>
                          <span className="text-[10px] text-muted-foreground">
                            ~{polishedText.split(/\s+/).filter(Boolean).length} words
                          </span>
                        </div>
                        <div className="relative">
                          <PageCorner className="top-0 left-0" />
                          <PageCorner className="top-0 right-0 rotate-90" />
                          <Textarea
                            value={polishedText}
                            onChange={(e) => handleFieldChange(i, "chapterText", e.target.value)}
                            rows={24}
                            className="text-sm leading-relaxed font-serif rounded-xl bg-white dark:bg-card pt-4 px-5"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {hasPolished ? "Polished Story Text" : "Story Text"}
                        </Label>
                        {hasText && (
                          <span className="text-[10px] text-muted-foreground">
                            ~{wordCount} words
                          </span>
                        )}
                      </div>
                      {/* Book-page styled textarea */}
                      <div className="relative">
                        <PageCorner className="top-0 left-0" />
                        <PageCorner className="top-0 right-0 rotate-90" />
                        <Textarea
                          value={merged.chapterText ?? ""}
                          onChange={(e) => handleFieldChange(i, "chapterText", e.target.value)}
                          rows={24}
                          placeholder={hasText ? undefined : "✨ Click \"Write Chapter\" to begin…"}
                          className={cn(
                            "text-sm leading-[1.9] font-serif rounded-xl pt-5 px-6 resize-none",
                            !hasText && "bg-muted/20 text-muted-foreground/60",
                            hasText && "bg-white dark:bg-card",
                          )}
                        />
                        {/* Horizontal page lines overlay — subtle */}
                        {!hasText && (
                          <div className="absolute inset-5 top-5 pointer-events-none space-y-[1.9rem] overflow-hidden opacity-30">
                            {Array.from({ length: 12 }).map((_, li) => (
                              <div key={li} className="h-px bg-border" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom meta row */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-dashed border-border">
                    {/* Chapter summary */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Chapter Summary
                      </Label>
                      <Textarea
                        value={merged.chapterSummary ?? ""}
                        onChange={(e) => handleFieldChange(i, "chapterSummary", e.target.value)}
                        rows={2}
                        placeholder={c.goal || "Brief chapter summary…"}
                        className="text-sm resize-none"
                      />
                    </div>

                    {/* Islamic moment */}
                    {!hasPolished && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Islamic Moment / Dua
                        </Label>
                        <Textarea
                          value={merged.islamicMoment ?? (c as any).duaHint ?? ""}
                          onChange={(e) => handleFieldChange(i, "islamicMoment", e.target.value)}
                          rows={2}
                          placeholder="Islamic reflection or dua in this chapter…"
                          className="text-sm resize-none"
                        />
                      </div>
                    )}

                    {/* Improvements chips */}
                    {hasPolished && normArr(humanNode?.current?.changesMade as string[]).length > 0 && (
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Improvements made
                        </Label>
                        <div className="flex flex-wrap gap-1.5">
                          {normArr(humanNode!.current.changesMade as string[]).map((change, ci2) => (
                            <span
                              key={ci2}
                              className="px-2.5 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800"
                            >
                              {change}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Footer nav */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button disabled={!bb.allProseApproved} onClick={onContinue}>
          Continue to Illustrations
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
