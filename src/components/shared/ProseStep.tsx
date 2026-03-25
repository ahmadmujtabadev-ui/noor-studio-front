// steps/ProseStep.tsx — chapter-book only
// Fixes:
// 1. Auto-save local edits BEFORE generate/humanize so nothing is lost
// 2. Compare view: LEFT = first version snapshot (original AI generation)
//                  RIGHT = humanized current text

import React, { useState, useCallback, useRef } from "react";
import {
  PenLine, ArrowLeft, ArrowRight, RefreshCw, Sparkles,
  Loader2, ChevronDown, ChevronUp, Check, GitCompare, Save,
} from "lucide-react";
import { Button }   from "@/components/ui/button";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge }    from "@/components/ui/badge";
import { cn }       from "@/lib/utils";

import { useToast } from "@/hooks/use-toast";
import { ChapterOutlineItem, normArr, ProseReviewNode, StructureItem } from "@/lib/api/reviewTypes";
import { BookBuilderHook } from "@/hooks/useBookBuilder";

interface ProseStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
  onContinue: () => void;
}

type ViewMode = "current" | "compare";

export function ProseStep({ bb, onBack, onContinue }: ProseStepProps) {
  const { toast } = useToast();
  const [expanded,  setExpanded]  = useState<Record<number, boolean>>({});
  const [viewMode,  setViewMode]  = useState<Record<number, ViewMode>>({});
  const [saving,    setSaving]    = useState<Record<number, boolean>>({});

  // Local edits tracked per chapter so we can save before any server action
  const localEdits = useRef<Record<number, Partial<ProseReviewNode["current"]>>>({});

  const chapters = normArr <StructureItem>(bb.structureReview?.items)
    .filter((i) => i.unitType === "chapter-outline") as ChapterOutlineItem[];

  // ── Helpers ─────────────────────────────────────────────────────────────
  const getHumanizedNode = (chapterIndex: number): ProseReviewNode | undefined =>
    bb.humanizedReview.find((n) => n.chapterIndex === chapterIndex) as ProseReviewNode | undefined;

  const getRawProseNode = (chapterIndex: number): ProseReviewNode | undefined =>
    bb.proseReview.find((n) => n.chapterIndex === chapterIndex) as ProseReviewNode | undefined;

  const getActiveProseNode = (chapterIndex: number): ProseReviewNode | undefined =>
    getHumanizedNode(chapterIndex) ?? getRawProseNode(chapterIndex);

  // The "Original" for compare = FIRST version snapshot (raw AI output before edits)
  const getOriginalText = (chapterIndex: number): string => {
    const raw = getRawProseNode(chapterIndex);
    if (!raw) return "";
    const versions = normArr(raw.versions as Array<{ version: number; snapshot: ProseReviewNode["current"]; createdAt: string }>);
    return versions.length > 0
      ? (versions[0].snapshot?.chapterText ?? raw.current.chapterText)
      : raw.current.chapterText;
  };

  // Merge server state + local (unsaved) edits for display
  const getMergedCurrent = (chapterIndex: number): ProseReviewNode["current"] => {
    const node = getActiveProseNode(chapterIndex);
    const c    = chapters[chapterIndex]?.current;
    const base: ProseReviewNode["current"] = node?.current ?? {
      chapterNumber:      chapterIndex + 1,
      chapterTitle:       c?.title ?? `Chapter ${chapterIndex + 1}`,
      chapterSummary:     (c as any)?.goal ?? "",
      chapterText:        "",
      islamicMoment:      (c as any)?.duaHint ?? "",
      illustrationMoments: [],
    };
    return { ...base, ...(localEdits.current[chapterIndex] ?? {}) };
  };

  // ── Save local edits to server ──────────────────────────────────────────
  const saveLocalEdits = useCallback(async (chapterIndex: number): Promise<void> => {
    const edits = localEdits.current[chapterIndex];
    if (!edits || Object.keys(edits).length === 0) return;
    if (!bb.projectId) return;
    setSaving((p) => ({ ...p, [chapterIndex]: true }));
    try {
      await reviewApi.patchChapterProse(bb.projectId, chapterIndex, edits);
      localEdits.current[chapterIndex] = {};
    } catch {
      // non-fatal
    } finally {
      setSaving((p) => ({ ...p, [chapterIndex]: false }));
    }
  }, [bb.projectId]);

  const handleFieldChange = (chapterIndex: number, field: keyof ProseReviewNode["current"], value: string) => {
    localEdits.current[chapterIndex] = { ...(localEdits.current[chapterIndex] ?? {}), [field]: value };
    bb.updateProseNode(chapterIndex, { [field]: value } as any);
  };

  // ── Actions — always auto-save first ────────────────────────────────────
  const handleGenerate = async (chapterIndex: number) => {
    await saveLocalEdits(chapterIndex);
    await bb.generateChapterProse(chapterIndex);
  };

  const handleHumanize = async (chapterIndex: number) => {
    await saveLocalEdits(chapterIndex);
    await bb.humanizeChapterProse(chapterIndex);
    setViewMode((p) => ({ ...p, [chapterIndex]: "compare" }));
  };

  const handleSave = async (chapterIndex: number) => {
    await saveLocalEdits(chapterIndex);
    await bb.refreshReview();
    toast({ title: `Chapter ${chapterIndex + 1} saved ✓` });
  };

  const handleApprove = async (chapterIndex: number) => {
    await saveLocalEdits(chapterIndex);
    const current = getMergedCurrent(chapterIndex);
    await bb.saveAndApproveChapterProse(chapterIndex, current);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <PenLine className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Chapter Prose</h2>
            <p className="text-sm text-muted-foreground">
              Generate → edit → humanize → compare original vs humanized → approve.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
          <span className="font-bold text-foreground">
            {chapters.filter((_, i) => getActiveProseNode(i)?.status === "approved").length}/{chapters.length}
          </span>
          chapters approved
          {bb.allProseApproved && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">All approved</Badge>
          )}
        </div>
      </div>

      {chapters.map((chapter, i) => {
        const activeNode    = getActiveProseNode(i);
        const humanNode     = getHumanizedNode(i);
        const rawNode       = getRawProseNode(i);
        const isOpen        = expanded[i] ?? false;
        const vMode         = viewMode[i] ?? "current";
        const approved      = activeNode?.status === "approved";
        const hasText       = !!(rawNode?.current?.chapterText);
        const hasHuman      = !!(humanNode?.current?.chapterText);
        const merged        = getMergedCurrent(i);
        const originalText  = getOriginalText(i);
        const humanizedText = humanNode?.current?.chapterText ?? "";

        const isGenLoading  = bb.loadingKey === `prose-gen-${i}`;
        const isHumanLoad   = bb.loadingKey === `prose-humanize-${i}`;
        const isApproveLoad = bb.loadingKey === `prose-approve-${i}`;
        const isSaving      = saving[i] ?? false;
        const c             = chapter.current;

        return (
          <div key={i} className={cn(
            "rounded-2xl border overflow-hidden transition-all",
            approved ? "border-emerald-300 dark:border-emerald-700" : "border-border",
          )}>
            {/* Chapter header */}
            <div
              className="px-6 py-4 bg-muted/30 border-b border-border flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm",
                approved ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
              )}>
                {approved ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.title || `Chapter ${i + 1}`}</p>
                {c.goal && <p className="text-xs text-muted-foreground truncate">{c.goal}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {approved && <Badge className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Approved</Badge>}
                {hasHuman && !approved && <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">Humanized</Badge>}
                {hasText && !hasHuman && !approved && <Badge className="text-xs bg-blue-100 text-blue-700">Generated</Badge>}
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </div>

            {isOpen && (
              <div className="p-6 space-y-4">
                {/* Action bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" disabled={isGenLoading || isSaving} onClick={() => handleGenerate(i)}>
                    {isGenLoading
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Generating</>
                      : <><RefreshCw className="w-3 h-3 mr-1.5" />{hasText ? "Regenerate" : "Generate prose"}</>
                    }
                  </Button>

                  {hasText && (
                    <Button size="sm" variant="outline" disabled={isHumanLoad || isSaving} onClick={() => handleHumanize(i)}>
                      {isHumanLoad
                        ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Humanizing</>
                        : <><Sparkles className="w-3 h-3 mr-1.5" />Humanize</>
                      }
                    </Button>
                  )}

                  {hasHuman && (
                    <Button
                      size="sm"
                      variant={vMode === "compare" ? "default" : "ghost"}
                      onClick={() => setViewMode((p) => ({ ...p, [i]: p[i] === "compare" ? "current" : "compare" }))}
                    >
                      <GitCompare className="w-3 h-3 mr-1.5" />
                      {vMode === "compare" ? "Hide compare" : "Compare versions"}
                    </Button>
                  )}

                  <Button size="sm" variant="ghost" disabled={isSaving} onClick={() => handleSave(i)}>
                    {isSaving
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Saving</>
                      : <><Save className="w-3 h-3 mr-1.5" />Save edits</>
                    }
                  </Button>

                  <Button size="sm" className="ml-auto" disabled={isApproveLoad || !hasText} onClick={() => handleApprove(i)}>
                    {isApproveLoad
                      ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Approving</>
                      : <><Check className="w-3 h-3 mr-1.5" />Approve</>
                    }
                  </Button>
                </div>

                {/* Summary — always editable, pre-seeded from outline goal */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chapter Summary</Label>
                  <Textarea
                    value={merged.chapterSummary ?? ""}
                    onChange={(e) => handleFieldChange(i, "chapterSummary", e.target.value)}
                    rows={2}
                    placeholder={c.goal || "Brief chapter summary…"}
                  />
                </div>

                {/* Prose — compare or single */}
                {vMode === "compare" && hasHuman ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Original (AI generation)
                      </Label>
                      <Textarea
                        value={originalText}
                        readOnly
                        rows={20}
                        className="text-sm leading-relaxed opacity-60 resize-none bg-muted/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        Humanized
                        <Badge className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">AI</Badge>
                      </Label>
                      <Textarea
                        value={humanizedText}
                        onChange={(e) => handleFieldChange(i, "chapterText", e.target.value)}
                        rows={20}
                        className="text-sm leading-relaxed font-serif"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {hasHuman ? "Humanized Prose" : "Chapter Prose"}
                    </Label>
                    <Textarea
                      value={merged.chapterText ?? ""}
                      onChange={(e) => handleFieldChange(i, "chapterText", e.target.value)}
                      rows={20}
                      placeholder={hasText ? undefined : "Click Generate prose to begin…"}
                      className="text-sm leading-relaxed font-serif"
                    />
                  </div>
                )}

                {/* Islamic moment */}
                {!hasHuman && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Islamic Moment</Label>
                    <Textarea
                      value={merged.islamicMoment ?? (c as any).duaHint ?? ""}
                      onChange={(e) => handleFieldChange(i, "islamicMoment", e.target.value)}
                      rows={2}
                      placeholder="Islamic reflection or dua in this chapter…"
                    />
                  </div>
                )}

                {/* changesMade chips */}
                {hasHuman && normArr(humanNode?.current?.changesMade as string[]).length > 0 && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Changes made</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {normArr(humanNode!.current.changesMade as string[]).map((change, ci) => (
                        <span key={ci} className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800">
                          {change}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Button disabled={!bb.allProseApproved} onClick={onContinue}>
          Continue to Illustrations<ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}