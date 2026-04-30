// steps/StructureStep.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sparkles, ArrowLeft, ArrowRight, Check, CheckCheck, Loader2,
  FileText, ChevronDown, ChevronUp, X, ArrowUp, ArrowDown,
  Scissors, GitMerge, Clock, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { ChapterOutlineItem, normArr, SpreadStructureItem, StructureItem } from "@/lib/api/reviewTypes";
import { ReviewModal, ReviewModalField } from "./ReviewModal";


interface StructureStepProps {
  bb: BookBuilderHook;
  allCharacters: Array<{ id?: string; _id?: string; name: string; role?: string; status?: string; universeId?: string }>;
  universeId?: string;
  onBack: () => void;
  onContinue: () => void;
}

export function StructureStep({ bb, allCharacters, universeId, onBack, onContinue }: StructureStepProps) {
  const universeCharacters = universeId
    ? allCharacters.filter((c) => {
        const cUid = (c as any).universeId;
        if (!cUid) return false;
        const cUidStr = typeof cUid === "string" ? cUid : cUid?._id?.toString() || cUid?.id || "";
        return cUidStr === universeId;
      })
    : allCharacters;

  const [modalKey, setModalKey] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<Record<string, Partial<StructureItem["current"]>>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [lastClickedIdx, setLastClickedIdx] = useState<number | null>(null);
  const [bulkApproving, setBulkApproving] = useState(false);
  const [inlineEditKey, setInlineEditKey] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const inlineRef = useRef<HTMLTextAreaElement>(null);

  const items    = normArr<StructureItem>(bb.structureReview?.items);
  const isChBook = bb.isChapterBook;
  const hasItems = items.length > 0;

  const getLocal = (key: string, item: StructureItem) =>
    ({ ...item.current, ...localItems[key] } as StructureItem["current"]);

  const handleApprove = async (key: string, item: StructureItem) => {
    const current = getLocal(key, item);
    await bb.approveStructureItem(key, current);
    setModalKey(null);
  };

  // ─── Inline save ─────────────────────────────────────────────────────────────
  const handleInlineBlur = useCallback(async (key: string, item: StructureItem) => {
    setInlineEditKey(null);
    const local = localItems[key] as any;
    const text = local?.text ?? (item.current as any).text ?? "";
    setSavingKey(key);
    try {
      await bb.patchStructureItem(key, { ...item.current, text });
    } finally {
      setSavingKey(null);
    }
  }, [localItems, bb]);

  // ─── Reorder (swap content with adjacent item) ─────────────────────────────
  const handleMove = useCallback(async (idx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const a = items[idx];
    const b = items[targetIdx];
    const aText = (getLocal(a.key, a) as any).text ?? "";
    const aHint = (getLocal(a.key, a) as any).illustrationHint ?? "";
    const bText = (getLocal(b.key, b) as any).text ?? "";
    const bHint = (getLocal(b.key, b) as any).illustrationHint ?? "";

    // Optimistic local swap
    setLocalItems((p) => ({
      ...p,
      [a.key]: { ...p[a.key], text: bText, illustrationHint: bHint } as any,
      [b.key]: { ...p[b.key], text: aText, illustrationHint: aHint } as any,
    }));

    // Persist both
    await Promise.all([
      bb.patchStructureItem(a.key, { ...a.current, text: bText, illustrationHint: bHint } as any),
      bb.patchStructureItem(b.key, { ...b.current, text: aText, illustrationHint: aHint } as any),
    ]);
  }, [items, localItems, bb]);

  // ─── Merge with next ──────────────────────────────────────────────────────
  const handleMerge = useCallback(async (idx: number) => {
    if (idx >= items.length - 1) return;
    const curr = items[idx];
    const next = items[idx + 1];
    const currText = (getLocal(curr.key, curr) as any).text ?? "";
    const nextText = (getLocal(next.key, next) as any).text ?? "";
    const merged = [currText, nextText].filter(Boolean).join(" ");

    setLocalItems((p) => ({
      ...p,
      [curr.key]: { ...p[curr.key], text: merged } as any,
      [next.key]: { ...p[next.key], text: "" } as any,
    }));

    await Promise.all([
      bb.patchStructureItem(curr.key, { ...curr.current, text: merged } as any),
      bb.patchStructureItem(next.key, { ...next.current, text: "" } as any),
    ]);
  }, [items, localItems, bb]);

  // ─── Split into next ──────────────────────────────────────────────────────
  const handleSplit = useCallback(async (idx: number) => {
    if (idx >= items.length - 1) return;
    const curr = items[idx];
    const next = items[idx + 1];
    const text: string = (getLocal(curr.key, curr) as any).text ?? "";
    if (!text.trim()) return;

    // Find a sentence boundary near the midpoint
    const mid = Math.floor(text.length / 2);
    const sentenceEnd = /[.!?]\s+/g;
    let splitAt = mid;
    let match: RegExpExecArray | null;
    let bestDist = Infinity;
    while ((match = sentenceEnd.exec(text)) !== null) {
      const pos = match.index + match[0].length;
      const dist = Math.abs(pos - mid);
      if (dist < bestDist) { bestDist = dist; splitAt = pos; }
    }

    const firstHalf = text.slice(0, splitAt).trim();
    const secondHalf = text.slice(splitAt).trim();

    setLocalItems((p) => ({
      ...p,
      [curr.key]: { ...p[curr.key], text: firstHalf } as any,
      [next.key]: { ...p[next.key], text: secondHalf } as any,
    }));

    await Promise.all([
      bb.patchStructureItem(curr.key, { ...curr.current, text: firstHalf } as any),
      bb.patchStructureItem(next.key, { ...next.current, text: secondHalf } as any),
    ]);
  }, [items, localItems, bb]);

  // ─── Bulk selection helpers ────────────────────────────────────────────────
  const handleCheckboxClick = (e: React.MouseEvent, key: string, idx: number) => {
    e.stopPropagation();
    if (e.shiftKey && lastClickedIdx !== null) {
      const [start, end] = [Math.min(lastClickedIdx, idx), Math.max(lastClickedIdx, idx)];
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        items.slice(start, end + 1).forEach((i) => next.add(i.key));
        return next;
      });
    } else {
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
      setLastClickedIdx(idx);
    }
  };

  const handleApproveSelected = async () => {
    setBulkApproving(true);
    const toApprove = items.filter((i) => selectedKeys.has(i.key) && i.status !== "approved");
    for (const item of toApprove) {
      await bb.approveStructureItem(item.key, getLocal(item.key, item));
    }
    setSelectedKeys(new Set());
    setBulkApproving(false);
  };

  const handleEditSelected = () => {
    const first = items.find((i) => selectedKeys.has(i.key));
    if (first) setModalKey(first.key);
  };

  useEffect(() => {
    if (!hasItems) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        setSelectedKeys(new Set(items.map((i) => i.key)));
      }
      if (e.key === "Escape") {
        setSelectedKeys(new Set());
        setInlineEditKey(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, hasItems]);

  // Focus textarea when entering inline edit
  useEffect(() => {
    if (inlineEditKey && inlineRef.current) {
      inlineRef.current.focus();
      const len = inlineRef.current.value.length;
      inlineRef.current.setSelectionRange(len, len);
    }
  }, [inlineEditKey]);

  const activeItem = modalKey ? items.find((i) => i.key === modalKey) : null;

  const buildModalFields = (item: StructureItem): ReviewModalField[] => {
    if (item.unitType === "chapter-outline") {
      const c = item.current as ChapterOutlineItem["current"];
      return [
        { key: "title",      label: "Chapter Title", value: localItems[item.key]?.title ?? c.title      ?? "", rows: 1 },
        { key: "goal",       label: "Goal",          value: localItems[item.key]?.goal  ?? c.goal       ?? "", rows: 2 },
        { key: "keyScene",   label: "Key Scene",     value: (localItems[item.key] as any)?.keyScene  ?? c.keyScene  ?? "", rows: 3 },
        { key: "duaHint",    label: "Dua / Islamic Moment", value: (localItems[item.key] as any)?.duaHint  ?? c.duaHint  ?? "", rows: 2 },
        { key: "endingBeat", label: "Ending Beat",   value: (localItems[item.key] as any)?.endingBeat ?? c.endingBeat ?? "", rows: 2 },
      ];
    }
    const c = item.current as SpreadStructureItem["current"];
    return [
      { key: "text",             label: "Page Text",          value: (localItems[item.key] as any)?.text             ?? c.text             ?? "", rows: 4 },
      { key: "illustrationHint", label: "Illustration Hint",  value: (localItems[item.key] as any)?.illustrationHint ?? c.illustrationHint ?? "", rows: 3 },
    ];
  };

  return (
    <div className="space-y-6">
      {/* Config card */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{isChBook ? "Chapter Outline" : "Page Structure"}</h2>
            <p className="text-sm text-muted-foreground">
              {isChBook
                ? "AI generates chapter outlines — review each, then approve all to continue."
                : "AI generates page spreads — review each, then approve all to continue."}
            </p>
          </div>
        </div>

        {/* Characters */}
        <div className="space-y-2">
          <Label>Characters (optional)</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {universeCharacters
              .filter((c) => c.status === "approved" || !c.status)
              .map((c) => {
                const id     = c.id || c._id || "";
                const active = bb.characterIds.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => bb.setCharacterIds((prev) =>
                      active ? prev.filter((x) => x !== id) : [...prev, id]
                    )}
                    className={cn(
                      "rounded-xl border-2 p-3 text-left transition-all",
                      active ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                    )}
                  >
                    <div className="font-semibold text-sm truncate">{c.name}</div>
                    {c.role && <div className="text-xs text-muted-foreground">{c.role}</div>}
                  </button>
                );
              })}
          </div>
        </div>

        <Button
          onClick={bb.generateStructure}
          disabled={bb.globalLoading}
          className={cn("w-full", hasItems && "variant-outline")}
          variant={hasItems ? "outline" : "default"}
          size="lg"
        >
          {bb.globalLoading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" />{hasItems ? "Regenerate Structure" : `Generate ${isChBook ? "Chapter Outline" : "Pages"}`}</>
          )}
        </Button>
      </div>

      {/* Items list */}
      {hasItems && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
            <h3 className="font-bold">
              {isChBook ? `${items.length} Chapters` : `${items.length} Pages`}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {items.filter((i) => i.status === "approved").length}/{items.length} approved
              </span>
              {bb.allStructureApproved ? (
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  All Approved
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  disabled={bb.loadingKey === "approve-all-structure"}
                  onClick={() => bb.approveAllStructure()}
                >
                  {bb.loadingKey === "approve-all-structure"
                    ? <><Loader2 className="w-3 h-3 animate-spin" />Approving…</>
                    : <><CheckCheck className="w-3 h-3" />Approve All</>
                  }
                </Button>
              )}
            </div>
          </div>

          {/* Floating bulk-action bar */}
          {selectedKeys.size > 0 && (
            <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center gap-3">
              <span className="text-xs font-semibold text-primary">
                {selectedKeys.size} selected
              </span>
              <span className="text-xs text-muted-foreground">
                (Shift-click to range-select · ⌘A to select all · Esc to clear)
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleEditSelected}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={bulkApproving || items.filter((i) => selectedKeys.has(i.key) && i.status !== "approved").length === 0}
                  onClick={handleApproveSelected}
                >
                  {bulkApproving
                    ? <><Loader2 className="w-3 h-3 animate-spin" />Approving…</>
                    : <><CheckCheck className="w-3 h-3" />Approve Selected</>
                  }
                </Button>
                <button
                  onClick={() => setSelectedKeys(new Set())}
                  className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="divide-y divide-border">
            {items.map((item, idx) => {
              const isOpen     = expanded[item.key] ?? false;
              const approved   = item.status === "approved";
              const c          = item.current as any;
              const isSelected = selectedKeys.has(item.key);
              const isInline   = inlineEditKey === item.key;
              const isSaving   = savingKey === item.key;
              const displayText = isChBook
                ? (c.title || `Chapter ${c.chapterNumber}`)
                : ((localItems[item.key] as any)?.text ?? c.text ?? `Page ${c.spreadIndex + 1}`);

              return (
                <div
                  key={item.key}
                  className={cn(
                    "group transition-colors",
                    approved && "bg-emerald-50/60 dark:bg-emerald-950/20",
                    isSelected && "bg-primary/5",
                  )}
                >
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Checkbox */}
                    <div
                      onClick={(e) => handleCheckboxClick(e, item.key, idx)}
                      className={cn(
                        "mt-1 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer",
                        isSelected ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                      )}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                    </div>

                    {/* Status badge */}
                    <div className={cn(
                      "mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-all",
                      approved
                        ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
                    )}>
                      {approved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
                    </div>

                    {/* Inline sentence editor */}
                    <div className="flex-1 min-w-0">
                      {isInline && !isChBook ? (
                        <Textarea
                          ref={inlineRef}
                          className="text-sm font-medium min-h-[60px] resize-none focus-visible:ring-emerald-400"
                          value={(localItems[item.key] as any)?.text ?? c.text ?? ""}
                          onChange={(e) =>
                            setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], text: e.target.value } as any }))
                          }
                          onBlur={() => handleInlineBlur(item.key, item)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") { setInlineEditKey(null); }
                            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); inlineRef.current?.blur(); }
                          }}
                        />
                      ) : (
                        <div className="flex items-start gap-1.5">
                          <p
                            className={cn(
                              "text-sm leading-snug cursor-text flex-1",
                              approved ? "font-bold text-emerald-900 dark:text-emerald-100" : "font-semibold",
                            )}
                            onClick={() => { if (!isChBook) { setInlineEditKey(item.key); setExpanded((p) => ({ ...p, [item.key]: false })); } }}
                            title={isChBook ? undefined : "Click to edit inline"}
                          >
                            {displayText || <span className="text-muted-foreground italic">Empty — click to add text</span>}
                          </p>
                          {!isChBook && !approved && (
                            <button
                              onClick={() => { setInlineEditKey(item.key); setExpanded((p) => ({ ...p, [item.key]: false })); }}
                              className="shrink-0 mt-0.5 text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                              title="Edit inline"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                      {isChBook && c.goal && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{c.goal}</p>
                      )}
                      {/* Pending indicator for unapproved */}
                      {!approved && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <Clock className="w-2.5 h-2.5" /> Pending review
                        </span>
                      )}
                      {isSaving && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Saving…
                        </span>
                      )}
                    </div>

                    {/* Row actions */}
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      {/* Reorder */}
                      <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, "up")}
                          className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={idx === items.length - 1}
                          onClick={() => handleMove(idx, "down")}
                          className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Merge / Split — picture books only */}
                      {!isChBook && idx < items.length - 1 && (
                        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleMerge(idx)}
                            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-violet-600 transition-colors"
                            title="Merge with next page"
                          >
                            <GitMerge className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleSplit(idx)}
                            className="w-5 h-4 flex items-center justify-center text-muted-foreground hover:text-blue-600 transition-colors"
                            title="Split into next page"
                          >
                            <Scissors className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Approve / approved state */}
                      {approved ? (
                        <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          <Check className="w-3 h-3 stroke-[3]" /> Approved
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          disabled={bb.loadingKey === `approve-struct-${item.key}`}
                          onClick={() => handleApprove(item.key, item)}
                        >
                          {bb.loadingKey === `approve-struct-${item.key}`
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : "Approve"
                          }
                        </Button>
                      )}

                      {/* Expand / full edit */}
                      {!approved && (
                        <button
                          onClick={() => setExpanded((p) => ({ ...p, [item.key]: !p[item.key] }))}
                          className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title={isOpen ? "Collapse" : "Full edit"}
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded quick-edit panel */}
                  {isOpen && !approved && (
                    <div className="px-6 pb-5 pt-1 space-y-3 bg-muted/20 border-t border-border">
                      {isChBook ? (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Title</Label>
                              <Input
                                value={localItems[item.key]?.title ?? c.title ?? ""}
                                onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], title: e.target.value } }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Dua / Islamic Moment</Label>
                              <Input
                                value={(localItems[item.key] as any)?.duaHint ?? c.duaHint ?? ""}
                                onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], duaHint: e.target.value } as any }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Goal</Label>
                            <Textarea
                              value={(localItems[item.key] as any)?.goal ?? c.goal ?? ""}
                              onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], goal: e.target.value } as any }))}
                              rows={2}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Key Scene</Label>
                            <Textarea
                              value={(localItems[item.key] as any)?.keyScene ?? c.keyScene ?? ""}
                              onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], keyScene: e.target.value } as any }))}
                              rows={3}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Page Text</Label>
                            <Textarea
                              value={(localItems[item.key] as any)?.text ?? c.text ?? ""}
                              onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], text: e.target.value } as any }))}
                              rows={3}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Illustration Hint</Label>
                            <Textarea
                              value={(localItems[item.key] as any)?.illustrationHint ?? c.illustrationHint ?? ""}
                              onChange={(e) => setLocalItems((p) => ({ ...p, [item.key]: { ...p[item.key], illustrationHint: e.target.value } as any }))}
                              rows={2}
                            />
                          </div>
                        </>
                      )}
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          disabled={bb.loadingKey === `approve-struct-${item.key}`}
                          onClick={() => handleApprove(item.key, item)}
                        >
                          Save & Approve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
        <Button disabled={!bb.allStructureApproved} onClick={onContinue}>
          Continue to Style
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Full edit modal */}
      {activeItem && (
        <ReviewModal
          open={!!modalKey}
          onClose={() => setModalKey(null)}
          title={isChBook ? `Chapter ${(activeItem.current as any).chapterNumber}` : `Page ${(activeItem.current as any).spreadIndex + 1}`}
          subtitle="Edit content"
          status={activeItem.status}
          fields={buildModalFields(activeItem)}
          versions={activeItem.versions as any[]}
          isLoading={bb.loadingKey === `approve-struct-${activeItem.key}`}
          onFieldChange={(key, val) =>
            setLocalItems((p) => ({ ...p, [activeItem.key]: { ...p[activeItem.key], [key]: val } }))
          }
          onApprove={() => handleApprove(activeItem.key, activeItem)}
          approveLabel="Save & Approve"
        />
      )}
    </div>
  );
}
