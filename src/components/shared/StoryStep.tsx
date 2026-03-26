// steps/StoryStep.tsx
import React, { useState } from "react";
import { Sparkles, RefreshCw, ArrowRight, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Universe } from "@/lib/api/types";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { useKnowledgeBases } from "@/hooks/useKnowledgeBase";

const AGE_RANGES = [
  { value: "2-4",  label: "2–4 years  (Picture spreads)" },
  { value: "4-5",  label: "4–5 years  (Picture book)"   },
  { value: "6-8",  label: "6–8 years  (Picture book)"   },
  { value: "8-12", label: "8–12 years (Chapter book)"   },
];

const LANGUAGES = [
  { value: "english",   label: "English"   },
  { value: "urdu",      label: "Urdu"       },
  { value: "arabic",    label: "Arabic"     },
  { value: "bilingual", label: "Bilingual"  },
];

interface StoryStepProps {
  bb: BookBuilderHook;
  universes: Universe[];
  onContinue: () => void;
}

export function StoryStep({ bb, universes, onContinue }: StoryStepProps) {
  const [regenerating, setRegenerating] = useState(false);
  const { data: allKBs = [] } = useKnowledgeBases(bb.universeId || undefined);
  const kbsForUniverse = bb.universeId
    ? (allKBs as any[]).filter((kb: any) => kb.universeId === bb.universeId || kb.universeId?._id === bb.universeId)
    : (allKBs as any[]);
  const hasStory = !!bb.storyReview?.current?.storyText;
  const current  = bb.storyReview?.current;

  const handleRegen = async () => {
    setRegenerating(true);
    await bb.regenerateStory();
    setRegenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Setup card */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Story</h2>
            <p className="text-sm text-muted-foreground">Write your idea → generate → review → approve</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Story idea <span className="text-destructive">*</span></Label>
          <Textarea
            value={bb.storyIdea}
            onChange={(e) => bb.setStoryIdea(e.target.value)}
            rows={4}
            placeholder="e.g. A young girl named Hana learns the importance of saying Bismillah before everything she does…"
            disabled={hasStory}
            className={cn(hasStory && "opacity-60")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Age range</Label>
            <Select value={bb.ageRange} onValueChange={bb.setAgeRange} disabled={hasStory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={bb.language} onValueChange={bb.setLanguage} disabled={hasStory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Author name</Label>
            <Input
              value={bb.authorName}
              onChange={(e) => bb.setAuthorName(e.target.value)}
              placeholder="Your name"
              disabled={hasStory}
            />
          </div>
          <div className="space-y-2">
            <Label>Universe</Label>
            <Select
              value={bb.universeId || "none"}
              onValueChange={(v) => {
                bb.setUniverseId(v === "none" ? "" : v);
                bb.setKnowledgeBaseId(""); // reset KB when universe changes
              }}
              disabled={hasStory}
            >
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {universes.map((u) => (
                  <SelectItem key={u.id || u._id} value={u.id || u._id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Knowledge Base <span className="text-xs text-muted-foreground">(optional — shapes AI story, illustrations & cover)</span></Label>
            <Select
              value={bb.knowledgeBaseId || "none"}
              onValueChange={(v) => bb.setKnowledgeBaseId(v === "none" ? "" : v)}
              disabled={hasStory}
            >
              <SelectTrigger><SelectValue placeholder="None — select to inject KB rules into all AI prompts" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {kbsForUniverse.map((kb: any) => (
                  <SelectItem key={kb.id || kb._id} value={kb.id || kb._id}>{kb.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {bb.knowledgeBaseId && (
              <p className="text-xs text-emerald-600 font-medium">✓ KB rules will be injected into story, structure, prose, illustrations, and cover prompts.</p>
            )}
          </div>
        </div>

        {!hasStory && (
          <Button
            onClick={bb.generateStory}
            disabled={bb.globalLoading || !bb.storyIdea.trim()}
            className="w-full"
            size="lg"
          >
            {bb.globalLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating story…</>
            ) : (
              <><Sparkles className="w-4 h-4 mr-2" />Generate Story</>
            )}
          </Button>
        )}
      </div>

      {/* Review card — shown after generation */}
      {hasStory && current && (
        <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Review Story</h3>
              <Badge
                className={cn(
                  "capitalize",
                  bb.storyReview?.status === "approved"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                )}
              >
                {bb.storyReview?.status ?? "generated"}
              </Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={regenerating}
              onClick={handleRegen}
            >
              {regenerating
                ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Regenerating</>
                : <><RefreshCw className="w-3 h-3 mr-1.5" />Regenerate</>
              }
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Book Title</Label>
              <Input
                value={current.bookTitle}
                onChange={(e) => bb.updateStoryCurrent({ bookTitle: e.target.value })}
                placeholder="Book title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Synopsis</Label>
                <Textarea
                  value={current.synopsis}
                  onChange={(e) => bb.updateStoryCurrent({ synopsis: e.target.value })}
                  rows={3}
                  placeholder="Short synopsis…"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Islamic Moral</Label>
                <Textarea
                  value={current.moral}
                  onChange={(e) => bb.updateStoryCurrent({ moral: e.target.value })}
                  rows={3}
                  placeholder="The moral of the story…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Story Text</Label>
              <Textarea
                value={current.storyText}
                onChange={(e) => bb.updateStoryCurrent({ storyText: e.target.value })}
                rows={14}
                placeholder="Story text…"
                className="font-serif leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dedication</Label>
              <Input
                value={current.dedicationMessage}
                onChange={(e) => bb.updateStoryCurrent({ dedicationMessage: e.target.value })}
                placeholder="Dedication message (optional)"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={bb.saveAndApproveStory} size="lg">
              Approve Story
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}