// steps/StoryStep.tsx
import React, { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, ArrowRight, Loader2, BookOpen,
  Globe, Library, AlertCircle, ChevronDown, ChevronUp, ExternalLink,
  Lightbulb, X,
} from "lucide-react";
import { reviewApi } from "@/lib/api/review.api";
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
import { KBStrengthScore } from "@/components/kb/KBStrengthScore";
import { useNavigate } from "react-router-dom";

const AGE_RANGES = [
  { value: "1-6",  label: "1-6 years (Picture book)" },
  { value: "8-14", label: "8-14 years (Chapter book)" },
];

const STORY_EXAMPLES = [
  "A young boy named Bilal discovers that saying Alhamdulillah for small things — a sunny day, warm bread, a friend's smile — fills his heart with joy, even on difficult days.",
  "Fatima is nervous about her first day at a new school, but her grandmother reminds her to say Bismillah before every new beginning. She learns that trust in Allah calms every worry.",
  "When Omar finds a lost kitten, he must decide what to do. His journey to find its owner teaches him about honesty, kindness, and caring for Allah's creatures.",
  "Layla wants the biggest toy at the market but has no money. Her father shows her that true happiness comes from giving, not having — and together they buy food for a neighbour in need.",
];

const TONE_OPTIONS = [
  { value: "more playful",  label: "More playful" },
  { value: "more gentle",   label: "More gentle" },
  { value: "more dramatic", label: "More dramatic" },
  { value: "more poetic",   label: "More poetic" },
];

const LENGTH_OPTIONS = [
  { value: "make it shorter", label: "Make it shorter" },
  { value: "expand it",       label: "Expand it" },
  { value: "keep the length", label: "Keep the length" },
];

const FOCUS_OPTIONS = [
  { value: "stronger Islamic moment",  label: "Stronger Islamic moment" },
  { value: "more dialogue",            label: "More dialogue" },
  { value: "stronger ending",          label: "Stronger ending" },
  { value: "simpler vocabulary",       label: "Simpler vocabulary" },
];

interface StoryStepProps {
  bb: BookBuilderHook;
  universes: Universe[];
  onContinue: () => void;
}

function KBImpactPanel({ kb, isIslamic = true }: { kb: any; isIslamic?: boolean }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const kbId = kb.id || kb._id || "";

  const allSections = [
    { label: "Islamic Values", count: kb.islamicValues?.length || 0, tab: "faith", section: "islamicValues", emoji: "🕌", islamicOnly: true },
    { label: "Du'as", count: kb.duas?.length || 0, tab: "faith", section: "duas", emoji: "🤲", islamicOnly: true },
    { label: "Vocabulary", count: kb.vocabulary?.length || 0, tab: "faith", section: "vocabulary", emoji: "📖", islamicOnly: false },
    { label: "Avoid Topics", count: kb.avoidTopics?.length || 0, tab: "faith", section: "avoidTopics", emoji: "🚫", islamicOnly: false },
    { label: "Character Voices", count: kb.characterGuides?.length || 0, tab: "story", section: "characterGuides", emoji: "🗣️", islamicOnly: false },
    { label: "Scene Settings", count: (kb.backgroundSettings?.junior?.locations?.length || 0) + (kb.backgroundSettings?.middleGrade?.locations?.length || 0), tab: "visual", section: "backgroundSettings", emoji: "🏞️", islamicOnly: false },
    { label: "Book Format", count: kb.bookFormatting?.middleGrade?.wordCount || kb.bookFormatting?.junior?.wordCount || kb.underSixDesign?.pageCount ? 1 : 0, tab: "bookFormat", section: "bookFormatting", emoji: "📐", islamicOnly: false },
    { label: "Cover Design", count: (kb.coverDesign?.brandingRules?.length || 0) + (kb.coverDesign?.islamicMotifs?.length || 0) + (kb.coverDesign?.selectedCoverTemplate ? 1 : 0), tab: "cover", section: "coverDesign", emoji: "🎨", islamicOnly: false },
  ];
  const sections = allSections.filter(s => isIslamic || !s.islamicOnly);

  const filledSections = sections.filter(s => s.count > 0);
  const openKB = (workflow?: string, section?: string) => {
    const params = new URLSearchParams({ kbId });
    if (workflow) params.set("workflow", workflow);
    if (section) params.set("section", section);
    navigate(`/app/knowledge-base?${params.toString()}`);
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-emerald-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-emerald-700">
            ✓ KB active — {filledSections.length} of {sections.length} domains populated
          </span>
          <span className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold",
            isIslamic ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-700"
          )}>
            {isIslamic ? "☪ Islamic Mode" : "🌍 Universal Mode"}
          </span>
          {filledSections.length < 5 && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              Build it up for better output
            </span>
          )}
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-emerald-600" /> : <ChevronDown className="h-3.5 w-3.5 text-emerald-600" />}
      </button>

      {open && (
        <div className="border-t border-emerald-100 px-4 py-3 space-y-3 bg-white/60">
          <KBStrengthScore kb={kb} compact mode={isIslamic ? "islamic" : "universal"} onNavigate={(workflow, section) => openKB(workflow, section)} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sections.map(s => (
              <button
                key={s.tab + s.label}
                type="button"
                onClick={() => openKB(s.tab, (s as any).section)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted/60",
                  s.count > 0 ? "border-emerald-200 bg-emerald-50/50 text-emerald-800" : "border-dashed border-muted text-muted-foreground"
                )}
              >
                <span>{s.emoji}</span>
                <span className="font-medium">{s.label}</span>
                <span className={cn("ml-auto font-bold", s.count > 0 ? "text-emerald-600" : "text-muted-foreground/60")}>
                  {s.count}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => openKB()}
            className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open Knowledge Base to edit
          </button>
        </div>
      )}
    </div>
  );
}

// Structured feedback panel used for full-story and per-paragraph regen
interface FeedbackPanelProps {
  onRegen: (opts: { tone?: string; focus?: string }) => void;
  onClose: () => void;
  loading: boolean;
  label?: string;
  isIslamic?: boolean;
}
function FeedbackPanel({ onRegen, onClose, loading, label = "Regenerate", isIslamic = true }: FeedbackPanelProps) {
  const [tone, setTone]   = useState("");
  const [focus, setFocus] = useState("");

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg p-4 space-y-3 w-72">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Regenerate options</p>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Tone</Label>
        <div className="flex flex-wrap gap-1.5">
          {TONE_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setTone(t => t === o.value ? "" : o.value)}
              className={cn(
                "text-[11px] font-medium px-2 py-1 rounded-full border transition-colors",
                tone === o.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Length</Label>
        <div className="flex flex-wrap gap-1.5">
          {LENGTH_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => setFocus(f => f === o.value ? "" : o.value)}
              className={cn(
                "text-[11px] font-medium px-2 py-1 rounded-full border transition-colors",
                focus === o.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Focus</Label>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_OPTIONS.map(o => o.value === "stronger Islamic moment" && !isIslamic ? { value: "stronger emotional moment", label: "Stronger emotional moment" } : o).map(o => (
            <button
              key={o.value}
              onClick={() => setFocus(f => f === o.value ? "" : o.value)}
              className={cn(
                "text-[11px] font-medium px-2 py-1 rounded-full border transition-colors",
                focus === o.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary/40 text-muted-foreground"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Button
        size="sm"
        className="w-full gap-1.5"
        disabled={loading}
        onClick={() => onRegen({ tone: tone || undefined, focus: focus || undefined })}
      >
        {loading
          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Regenerating…</>
          : <><RefreshCw className="w-3.5 h-3.5" />{label}</>
        }
      </Button>
    </div>
  );
}

export function StoryStep({ bb, universes, onContinue }: StoryStepProps) {
  const [showExamples, setShowExamples]   = useState(false);
  const [showFeedback, setShowFeedback]   = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [paraFeedbackIdx, setParaFeedbackIdx] = useState<number | null>(null);
  const [regeningPara, setRegeningPara]   = useState<number | null>(null);

  const { data: allKBs = [] } = useKnowledgeBases(bb.universeId || undefined);
  const kbsForUniverse = bb.universeId
    ? (allKBs as any[]).filter(
        (kb: any) => kb.universeId === bb.universeId || kb.universeId?._id === bb.universeId
      )
    : (allKBs as any[]);

  const hasStory = !!bb.storyReview?.current?.storyText;
  const current  = bb.storyReview?.current;

  const selectedKBData = bb.knowledgeBaseId
    ? kbsForUniverse.find((kb: any) => (kb.id || kb._id) === bb.knowledgeBaseId)
    : null;

  // Auto-sync age range from selected universe
  useEffect(() => {
    if (!bb.universeId) return;
    const u = universes.find((u) => (u.id || u._id) === bb.universeId) as any;
    if (!u?.ageRange) return;
    const raw = String(u.ageRange);
    // Map universe ageRange to AGE_RANGES values
    const matched = AGE_RANGES.find((r) => raw.startsWith(r.value) || r.value.startsWith(raw.split("-")[0]));
    if (matched) bb.setAgeRange(matched.value);
  }, [bb.universeId]);

  const selectedUniverse = bb.universeId ? universes.find((u) => (u.id || u._id) === bb.universeId) : null;
  const isIslamicUniverse = selectedUniverse?.category !== 'universal';
  const missingUniverse = !bb.universeId;
  const missingKB       = !bb.knowledgeBaseId;
  const canGenerate     = !missingUniverse && !missingKB && !!bb.storyIdea.trim();

  const handleGenerate = () => {
    if (!canGenerate) { setShowValidation(true); return; }
    setShowValidation(false);
    bb.generateStory();
  };

  const isRegen = bb.loadingKey === "story-regen";

  const handleFullRegen = async (opts: { tone?: string; focus?: string }) => {
    setShowFeedback(false);
    await bb.regenerateStory(opts);
  };

  // Smart paragraph split: double-newline → single-newline → sentence groups
  const parseParagraphs = (text: string): string[] => {
    if (!text?.trim()) return [];

    // Try double newline first
    let parts = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) return parts;

    // Try single newline
    parts = text.split(/\n/).map(p => p.trim()).filter(Boolean);
    if (parts.length > 1) return parts;

    // Fallback: group every 3 sentences into a paragraph
    const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) || [text];
    const groups: string[] = [];
    for (let i = 0; i < sentences.length; i += 3) {
      groups.push(sentences.slice(i, i + 3).join(" ").trim());
    }
    return groups.filter(Boolean);
  };

  const paragraphs: string[] = parseParagraphs(current?.storyText ?? "");

  const handleParaRegen = async (idx: number, opts: { tone?: string; focus?: string }) => {
    if (!bb.projectId) return;
    setRegeningPara(idx);
    setParaFeedbackIdx(null);
    try {
      const result = await reviewApi.rewriteParagraph(bb.projectId, {
        paragraphText: paragraphs[idx],
        prevParagraph: paragraphs[idx - 1] ?? "",
        nextParagraph: paragraphs[idx + 1] ?? "",
        tone: opts.tone,
        focus: opts.focus,
      });
      if (result.rewrittenParagraph) {
        const updated = [...paragraphs];
        updated[idx] = result.rewrittenParagraph;
        bb.updateStoryCurrent({ storyText: updated.join("\n\n") });
      }
    } catch (e) {
      // silently fall back — user still has the original text
    } finally {
      setRegeningPara(null);
    }
  };

  const updateParagraph = (idx: number, newText: string) => {
    const updated = [...paragraphs];
    updated[idx] = newText;
    bb.updateStoryCurrent({ storyText: updated.join("\n\n") });
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

        {/* Universe + KB */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              Universe
              <span className="text-destructive font-bold">*</span>
            </Label>
            <Select
              value={bb.universeId || ""}
              onValueChange={(v) => { bb.setUniverseId(v); bb.setKnowledgeBaseId(""); }}
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
                <AlertCircle className="w-3 h-3" />Universe is required
              </p>
            )}
            {bb.universeId && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-emerald-600 font-medium">✓ Universe selected</p>
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold",
                  isIslamicUniverse ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-700"
                )}>
                  {isIslamicUniverse ? "☪ Islamic" : "🌍 Universal"}
                </span>
              </div>
            )}
            {!bb.universeId && !(showValidation && missingUniverse) && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Globe className="w-3 h-3 shrink-0" />
                Your series world — shared setting, look &amp; values across all your books
              </p>
            )}
          </div>

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
                <AlertCircle className="w-3 h-3" />Knowledge Base is required
              </p>
            )}
            {bb.knowledgeBaseId && selectedKBData && <KBImpactPanel kb={selectedKBData} isIslamic={isIslamicUniverse} />}
            {bb.knowledgeBaseId && !selectedKBData && (
              <p className="text-xs text-emerald-600 font-medium">✓ KB rules applied to all AI generations</p>
            )}
            {bb.universeId && kbsForUniverse.length === 0 && !bb.knowledgeBaseId && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="w-3 h-3 shrink-0" />
                No Knowledge Base for this Universe.{" "}
                <a href="/app/knowledge-base" className="underline font-medium">Create one →</a>
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Character warning notice */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-amber-800">Characters must be created before writing your story</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Any characters you name in your story idea — whether written manually or picked from an example — must first be created in the{" "}
              <a href="/app/characters" className="underline font-semibold hover:text-amber-900">Characters module</a>.
              The AI uses their reference images and descriptions to generate consistent illustrations. Characters not in the system will produce incorrect or generic images.
            </p>
          </div>
        </div>

        {/* Story idea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              Story idea
              <span className="text-destructive font-bold ml-1">*</span>
            </Label>
            <button
              type="button"
              onClick={() => setShowExamples(o => !o)}
              className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-800 transition-colors"
            >
              <Lightbulb className="w-3 h-3" />
              {showExamples ? "Hide examples" : "See examples"}
            </button>
          </div>

          {showExamples && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-violet-700">Story idea examples — click to use:</p>
              <p className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                Only use character names that already exist in your Characters module
              </p>
              {STORY_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={hasStory}
                  onClick={() => { bb.setStoryIdea(ex); setShowExamples(false); }}
                  className="w-full text-left text-xs text-violet-800 bg-white/70 hover:bg-white border border-violet-100 rounded-lg px-3 py-2 transition-colors leading-relaxed"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}

          <Textarea
            value={bb.storyIdea}
            onChange={(e) => bb.setStoryIdea(e.target.value)}
            rows={4}
            placeholder="e.g. A young girl named Hana learns the importance of saying Bismillah before everything she does. She discovers that this small act of remembrance turns even ordinary moments into blessings…"
            disabled={hasStory}
            className={cn(hasStory && "opacity-60")}
          />
          {!hasStory && (
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                {bb.storyIdea.trim()
                  ? `${bb.storyIdea.trim().split(/\s+/).filter(Boolean).length} words`
                  : "2–4 sentences gives the AI enough to work with"}
              </p>
              {bb.storyIdea.trim().split(/\s+/).filter(Boolean).length > 0 &&
               bb.storyIdea.trim().split(/\s+/).filter(Boolean).length < 8 && (
                <p className="text-[11px] text-amber-500">Add a bit more detail for better results</p>
              )}
            </div>
          )}
        </div>

        {/* Age range — auto-synced from universe, still editable */}
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              Age range
              {bb.universeId && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  auto-synced from Universe
                </span>
              )}
            </Label>
            <Select value={bb.ageRange} onValueChange={bb.setAgeRange} disabled={hasStory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              {bb.ageRange === "1-6"
                ? "Short sentences, simple words, ~24 pages — picture-book style"
                : "Richer prose, subplots, 3–6 chapters — chapter-book style"}
            </p>
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
                    ? "Please select a Universe before generating."
                    : "Please select a Knowledge Base — it injects your story rules, illustration styles, and character voices."}
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
          {/* Header */}
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

            {/* Full-story regenerate with structured feedback */}
            <div className="relative">
              <Button
                size="sm"
                variant="outline"
                disabled={isRegen}
                onClick={() => setShowFeedback(o => !o)}
              >
                {isRegen && regeningPara === null
                  ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Regenerating</>
                  : <><RefreshCw className="w-3 h-3 mr-1.5" />Regenerate</>
                }
              </Button>
              {showFeedback && (
                <div className="absolute right-0 top-full mt-2 z-20">
                  <FeedbackPanel
                    loading={isRegen && regeningPara === null}
                    onRegen={handleFullRegen}
                    onClose={() => setShowFeedback(false)}
                    label="Regenerate full story"
                    isIslamic={isIslamicUniverse}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4">
            {/* Book title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Book Title</Label>
              <Input
                value={current.bookTitle}
                onChange={(e) => bb.updateStoryCurrent({ bookTitle: e.target.value })}
                placeholder="Book title"
                className="text-lg font-semibold"
              />
            </div>

            {/* Synopsis + moral */}
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
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{isIslamicUniverse ? "Islamic Moral" : "Moral"}</Label>
                <Textarea
                  value={current.moral}
                  onChange={(e) => bb.updateStoryCurrent({ moral: e.target.value })}
                  rows={4}
                  placeholder="The moral lesson of the story…"
                />
              </div>
            </div>

            {/* Full story — paragraph-level editing */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Full Story
                <span className="ml-2 font-normal normal-case text-muted-foreground">
                  — click any paragraph to edit, or regenerate individual paragraphs
                </span>
              </Label>

              {paragraphs.length > 0 ? (
                <div className="space-y-3">
                  {paragraphs.map((para, idx) => (
                    <div key={idx} className="group relative rounded-xl border border-border bg-muted/20 overflow-visible">
                      <Textarea
                        value={para}
                        onChange={(e) => updateParagraph(idx, e.target.value)}
                        rows={Math.max(2, Math.ceil(para.length / 80))}
                        className="border-0 bg-transparent font-serif leading-relaxed text-sm resize-none focus-visible:ring-1 focus-visible:ring-primary/50"
                      />
                      {/* Per-paragraph regen controls */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {regeningPara === idx ? (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Loader2 className="w-3 h-3 animate-spin" />Regenerating…
                          </span>
                        ) : (
                          <div className="relative">
                            <button
                              onClick={() => setParaFeedbackIdx(i => i === idx ? null : idx)}
                              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary bg-background border border-border rounded-md px-2 py-1 shadow-sm transition-colors"
                              title="Regenerate this paragraph"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Regen ¶{idx + 1}
                            </button>
                            {paraFeedbackIdx === idx && (
                              <div className="absolute right-0 top-full mt-1.5 z-20">
                                <FeedbackPanel
                                  loading={regeningPara === idx}
                                  onRegen={(opts) => handleParaRegen(idx, opts)}
                                  onClose={() => setParaFeedbackIdx(null)}
                                  label={`Regenerate paragraph ${idx + 1}`}
                                  isIslamic={isIslamicUniverse}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Paragraph index label */}
                      <div className="px-3 pb-1.5 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/50">¶ {idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Textarea
                  value={current.storyText}
                  onChange={(e) => bb.updateStoryCurrent({ storyText: e.target.value })}
                  rows={16}
                  placeholder="Story text…"
                  className="font-serif leading-relaxed text-sm"
                />
              )}
            </div>

            {/* Dedication */}
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
