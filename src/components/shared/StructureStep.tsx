// steps/StructureStep.tsx
import React, { useState } from "react";
import { Sparkles, ArrowLeft, ArrowRight, Check, CheckCheck, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
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
  // Only show characters belonging to the selected universe
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

  const activeItem = modalKey ? items.find((i) => i.key === modalKey) : null;

  // Build modal fields for the open item
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

          <div className="divide-y divide-border">
            {items.map((item) => {
              const isOpen    = expanded[item.key] ?? false;
              const approved  = item.status === "approved";
              const c         = item.current as any;

              return (
                <div key={item.key} className="group">
                  <div
                    className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpanded((p) => ({ ...p, [item.key]: !p[item.key] }))}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                      approved ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                    )}>
                      {approved ? <Check className="w-3 h-3" /> : item.key}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {isChBook ? (c.title || `Chapter ${c.chapterNumber}`) : (c.text?.slice(0, 120) || `Page ${c.spreadIndex + 1}`)}
                      </p>
                      {isChBook && c.goal && (
                        <p className="text-xs text-muted-foreground truncate">{c.goal}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!approved && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={(e) => { e.stopPropagation(); setModalKey(item.key); }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={approved ? "ghost" : "outline"}
                        className="h-7 text-xs"
                        disabled={bb.loadingKey === `approve-struct-${item.key}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!approved) handleApprove(item.key, item);
                        }}
                      >
                        {bb.loadingKey === `approve-struct-${item.key}`
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : approved ? "✓ Approved" : "Approve"
                        }
                      </Button>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded quick-edit */}
                  {isOpen && (
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