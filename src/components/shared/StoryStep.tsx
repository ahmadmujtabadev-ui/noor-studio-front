// steps/StoryStep.tsx
import React, { useState } from "react";
import {
  Sparkles, RefreshCw, ArrowRight, Loader2, BookOpen,
  Globe, Library, AlertCircle,
} from "lucide-react";
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
  { value: "1-6",  label: "1-6 years (Picture book)" },
  { value: "8-14", label: "8-14 years (Chapter book)" },
];

interface StoryStepProps {
  bb: BookBuilderHook;
  universes: Universe[];
  onContinue: () => void;
}

export function StoryStep({ bb, universes, onContinue }: StoryStepProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const { data: allKBs = [] } = useKnowledgeBases(bb.universeId || undefined);
  const kbsForUniverse = bb.universeId
    ? (allKBs as any[]).filter(
        (kb: any) => kb.universeId === bb.universeId || kb.universeId?._id === bb.universeId
      )
    : (allKBs as any[]);

  const hasStory = !!bb.storyReview?.current?.storyText;
  const current  = bb.storyReview?.current;

  // Validation
  const missingUniverse = !bb.universeId;
  const missingKB = !bb.knowledgeBaseId;
  const canGenerate = !missingUniverse && !missingKB && !!bb.storyIdea.trim();

  const handleGenerate = () => {
    if (!canGenerate) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    bb.generateStory();
  };

  const handleRegen = async () => {
    setRegenerating(true);
    await bb.regenerateStory();
    setRegenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Setup card */}
      <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Story Foundation</h2>
            <p className="text-sm text-muted-foreground">
              Set up your universe and knowledge base, then write your story idea
            </p>
          </div>
        </div>

        {/* Universe + KB — required, shown prominently first */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Universe — REQUIRED */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              Universe
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Select
              value={bb.universeId || ""}
              onValueChange={(v) => {
                bb.setUniverseId(v);
                bb.setKnowledgeBaseId("");
              }}
              disabled={hasStory}
            >
              <SelectTrigger className={cn(
                "transition-colors",
                showValidation && missingUniverse && "border-destructive ring-1 ring-destructive/30",
                bb.universeId && "border-emerald-400",
              )}>
                <SelectValue placeholder="Select a universe…" />
              </SelectTrigger>
              <SelectContent>
                {universes.length === 0 ? (
                  <SelectItem value="__none__" disabled>No universes — create one first</SelectItem>
                ) : (
                  universes.map((u) => (
                    <SelectItem key={u.id || u._id} value={u.id || u._id}>{u.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {showValidation && missingUniverse && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Universe is required to shape illustrations and characters
              </p>
            )}
            {bb.universeId && (
              <p className="text-xs text-emerald-600 font-medium">✓ Universe selected</p>
            )}
          </div>

          {/* Knowledge Base — REQUIRED */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Library className="w-3.5 h-3.5 text-muted-foreground" />
              Knowledge Base
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Select
              value={bb.knowledgeBaseId || ""}
              onValueChange={(v) => bb.setKnowledgeBaseId(v)}
              disabled={hasStory || !bb.universeId}
            >
              <SelectTrigger className={cn(
                "transition-colors",
                showValidation && missingKB && "border-destructive ring-1 ring-destructive/30",
                bb.knowledgeBaseId && "border-emerald-400",
                !bb.universeId && "opacity-60",
              )}>
                <SelectValue placeholder={!bb.universeId ? "Select universe first…" : "Select knowledge base…"} />
              </SelectTrigger>
              <SelectContent>
                {kbsForUniverse.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    {bb.universeId ? "No KBs for this universe — create one first" : "Select a universe first"}
                  </SelectItem>
                ) : (
                  kbsForUniverse.map((kb: any) => (
                    <SelectItem key={kb.id || kb._id} value={kb.id || kb._id}>{kb.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {showValidation && missingKB && !missingUniverse && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Knowledge Base injects story rules, illustration styles & faith guidance
              </p>
            )}
            {bb.knowledgeBaseId && (
              <p className="text-xs text-emerald-600 font-medium">✓ KB rules applied to all AI generations</p>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Story idea */}
        <div className="space-y-2">
          <Label>
            Story idea
            <span className="text-destructive font-bold ml-1">*</span>
          </Label>
          <Textarea
            value={bb.storyIdea}
            onChange={(e) => bb.setStoryIdea(e.target.value)}
            rows={4}
            placeholder="e.g. A young girl named Hana learns the importance of saying Bismillah before everything she does…"
            disabled={hasStory}
            className={cn(hasStory && "opacity-60")}
          />
        </div>

        {/* Age */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Age range</Label>
            <Select value={bb.ageRange} onValueChange={bb.setAgeRange} disabled={hasStory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Author name */}
        <div className="space-y-2">
          <Label>Author name <span className="text-xs text-muted-foreground">(optional)</span></Label>
          <Input
            value={bb.authorName}
            onChange={(e) => bb.setAuthorName(e.target.value)}
            placeholder="Your name"
            disabled={hasStory}
          />
        </div>

        {/* Generate button */}
        {!hasStory && (
          <div className="space-y-2">
            {showValidation && (missingUniverse || missingKB) && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">
                  {missingUniverse
                    ? "Please select a Universe before generating — it powers your character and illustration consistency."
                    : "Please select a Knowledge Base — it injects your Islamic story rules, illustration styles, and character voices."}
                </p>
              </div>
            )}
            <Button
              onClick={handleGenerate}
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
          </div>
        )}
      </div>

      {/* Review card */}
      {hasStory && current && (
        <div className="rounded-2xl border border-primary/30 bg-card p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Review Your Story</h3>
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
            <Button size="sm" variant="outline" disabled={regenerating} onClick={handleRegen}>
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
                className="text-lg font-semibold"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Synopsis</Label>
                <Textarea
                  value={current.synopsis}
                  onChange={(e) => bb.updateStoryCurrent({ synopsis: e.target.value })}
                  rows={4}
                  placeholder="Short synopsis…"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Islamic Moral</Label>
                <Textarea
                  value={current.moral}
                  onChange={(e) => bb.updateStoryCurrent({ moral: e.target.value })}
                  rows={4}
                  placeholder="The moral lesson of the story…"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Story</Label>
              <Textarea
                value={current.storyText}
                onChange={(e) => bb.updateStoryCurrent({ storyText: e.target.value })}
                rows={16}
                placeholder="Story text…"
                className="font-serif leading-relaxed text-sm"
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
              Approve Story & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
