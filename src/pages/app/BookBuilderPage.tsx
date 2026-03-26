// BookBuilderPage.tsx — Phase-based book production workspace
// Sidebar phases + overlay loading + book-like feel

"use client";

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, BookOpen, FileText, Palette, PenLine,
  Image as ImageIcon, BookMarked, Send, Check, Lock, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import type { Character } from "@/lib/api/types";
import { useBookBuilder } from "@/hooks/useBookBuilder";
import { StoryStep } from "@/components/shared/StoryStep";
import { StructureStep } from "@/components/shared/StructureStep";
import { StyleStep } from "@/components/shared/Styestep";
import { ProseStep } from "@/components/shared/ProseStep";
import { IllustrationsStep } from "@/components/shared/IllustrationStep";
import { CoverStep } from "@/components/shared/CoverStep";
import { EditorStep } from "@/components/shared/EditorStep";

// ─── Loading overlay ────────────────────────────────────────────────────────

function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-card border-4 border-primary/30 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4">
        {/* Bouncing stars around book */}
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-24 rounded-2xl bg-gradient-to-br from-primary/30 to-purple-400/20 border-4 border-primary/40 flex items-center justify-center shadow-lg">
            <BookOpen className="w-9 h-9 text-primary" />
          </div>
          <div className="absolute -top-3 -right-3 text-2xl animate-bounce">✨</div>
          <div className="absolute -bottom-2 -left-3 text-xl animate-bounce" style={{ animationDelay: "0.3s" }}>⭐</div>
          <div className="absolute -top-2 -left-4 text-lg animate-bounce" style={{ animationDelay: "0.6s" }}>🌟</div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-extrabold text-primary">Magic happening…</p>
          <p className="text-sm text-muted-foreground font-medium">{message || "Your story is coming to life!"}</p>
        </div>
        {/* Colorful progress bar */}
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-pink-400 via-primary to-purple-500 rounded-full animate-pulse" style={{ width: "70%" }} />
        </div>
        <p className="text-xs text-muted-foreground">This may take a minute or two 🕐</p>
      </div>
    </div>
  );
}

// ─── Phase definitions ───────────────────────────────────────────────────────

interface Phase {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  steps: number[];
  chapterOnly?: boolean;
}

// ─── Sidebar phase item ──────────────────────────────────────────────────────

function PhaseItem({
  phase, status, isActive, onClick,
}: {
  phase: Phase;
  status: "locked" | "accessible" | "active" | "done";
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = phase.icon;
  const canClick = status !== "locked";

  const PHASE_EMOJIS: Record<string, string> = {
    story: "📖", structure: "🏗️", writing: "✍️", art: "🎨", cover: "📚", export: "🚀",
  };
  const emoji = PHASE_EMOJIS[phase.id] || "⭐";

  return (
    <button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className={cn(
        "w-full text-left px-3 py-3 rounded-2xl transition-all flex items-start gap-3 group border-2",
        isActive && "bg-primary/10 border-primary/40 shadow-sm",
        !isActive && status === "done" && "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 cursor-pointer",
        !isActive && status === "accessible" && "border-transparent hover:bg-muted/50 hover:border-border cursor-pointer",
        !isActive && status === "locked" && "border-transparent opacity-40 cursor-not-allowed",
      )}
    >
      {/* Icon circle */}
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all text-base",
        status === "done" && "bg-emerald-500 text-white shadow-sm",
        status === "active" && "bg-primary text-primary-foreground shadow-md shadow-primary/30",
        status === "accessible" && "bg-muted text-muted-foreground",
        status === "locked" && "bg-muted/50 text-muted-foreground/40",
      )}>
        {status === "done" ? <Check className="w-4 h-4" /> : <span>{emoji}</span>}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-bold leading-tight",
          isActive ? "text-primary" : status === "done" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
        )}>
          {phase.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{phase.description}</p>
      </div>

      {/* Status indicator */}
      {status === "locked" && <Lock className="w-3 h-3 text-muted-foreground/40 shrink-0 mt-1.5" />}
      {isActive && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2 animate-pulse" />}
    </button>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function BookBuilderPage() {
  const navigate = useNavigate();
  const bb = useBookBuilder();

  const { universes = [] } = useUniverses();
  const { data: allChars = [] } = useCharacters();

  const selectedCharacters = useMemo(() =>
    (allChars as Character[]).filter((c) =>
      bb.characterIds.includes(c.id || c._id || "")
    ),
    [allChars, bb.characterIds]
  );

  const illStep    = bb.isChapterBook ? 5 : 4;
  const coverStep  = bb.isChapterBook ? 6 : 5;
  const editorStep = bb.isChapterBook ? 7 : 6;

  // ─── Phase config ────────────────────────────────────────────────────────
  const phases: Phase[] = useMemo(() => [
    { id: "story",     icon: BookOpen,    label: "Story",        description: "Write & approve your story",      steps: [1] },
    { id: "structure", icon: FileText,    label: "Structure",    description: "Outline characters & scenes",     steps: [2, 3] },
    ...(bb.isChapterBook
      ? [{ id: "writing", icon: PenLine, label: "Writing", description: "Write & polish chapters", steps: [4], chapterOnly: true }]
      : []
    ),
    { id: "art",    icon: ImageIcon,  label: "Illustrations", description: "Generate & approve artwork",     steps: [illStep] },
    { id: "cover",  icon: BookMarked, label: "Cover",         description: "Design front & back cover",     steps: [coverStep] },
    { id: "export", icon: Send,       label: "Publish",       description: "Export your finished book",     steps: [editorStep] },
  ], [bb.isChapterBook, illStep, coverStep, editorStep]);

  // ─── Phase status ─────────────────────────────────────────────────────────
  const getPhaseStatus = (phase: Phase): "locked" | "accessible" | "active" | "done" => {
    const isDone = phase.steps.every((s) => bb.completedSteps.has(s));
    if (isDone) return "done";
    const isActive = phase.steps.includes(bb.step);
    if (isActive) return "active";
    // accessible if the max completed step covers at least one step before this phase
    const minStep = Math.min(...phase.steps);
    const accessible = minStep <= (Math.max(0, ...Array.from(bb.completedSteps)) + 1);
    return accessible ? "accessible" : "locked";
  };

  const goToPhase = (phase: Phase) => {
    const status = getPhaseStatus(phase);
    if (status === "locked") return;
    // Navigate to the first non-completed step in the phase, or the first step
    const target = phase.steps.find((s) => !bb.completedSteps.has(s)) ?? phase.steps[0];
    bb.setStep(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Step navigation ──────────────────────────────────────────────────────
  const advance = (n: number) => {
    bb.markDone(bb.step);
    bb.setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = (n: number) => {
    bb.setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Book title from story
  const bookTitle = bb.storyReview?.current?.bookTitle;

  // Determine loading message
  const loadingMsg = bb.loadingKey?.startsWith("ill")
    ? "Generating illustrations…"
    : bb.loadingKey?.startsWith("cover")
    ? "Designing cover…"
    : bb.loadingKey?.startsWith("prose-gen")
    ? "Writing chapter…"
    : bb.loadingKey?.startsWith("prose-humanize")
    ? "Polishing chapter text…"
    : bb.loadingKey?.startsWith("prose-approve")
    ? "Approving chapter…"
    : bb.loadingKey?.startsWith("structure")
    ? "Generating structure…"
    : "AI is generating your book…";

  // Show overlay for global loads OR per-chapter AI operations
  const showOverlay = bb.globalLoading
    || (!!bb.loadingKey && (
      bb.loadingKey.startsWith("prose-gen") ||
      bb.loadingKey.startsWith("prose-humanize") ||
      bb.loadingKey.startsWith("prose-approve") ||
      bb.loadingKey.startsWith("structure") ||
      bb.loadingKey.startsWith("generate-all")
    ));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Global loading overlay ── */}
      {showOverlay && <LoadingOverlay message={loadingMsg} />}

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex items-center gap-4 px-6 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/app/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Dashboard
          </Button>

          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-purple-400/20 flex items-center justify-center shrink-0 text-lg">
              📖
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">
                {bookTitle || "New Book"}
              </p>
              {bookTitle && (
                <p className="text-xs text-muted-foreground">Book Builder ✨</p>
              )}
            </div>
          </div>

          {/* Phase progress — colorful dots */}
          <div className="hidden sm:flex items-center gap-2">
            {phases.map((phase) => {
              const status = getPhaseStatus(phase);
              return (
                <div
                  key={phase.id}
                  className={cn(
                    "transition-all rounded-full",
                    status === "done" && "w-3 h-3 bg-emerald-500 shadow-sm shadow-emerald-300",
                    status === "active" && "w-4 h-4 bg-primary shadow-md shadow-primary/40 scale-110",
                    status === "accessible" && "w-2.5 h-2.5 bg-muted-foreground/25",
                    status === "locked" && "w-2 h-2 bg-muted-foreground/10",
                  )}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + main ── */}
      <div className="flex min-h-[calc(100vh-57px)]">

        {/* ── Left sidebar ── */}
        <aside className="w-60 shrink-0 border-r border-border bg-gradient-to-b from-primary/5 to-background p-4 space-y-1.5 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <div className="px-2 mb-4">
            <p className="text-[10px] font-extrabold text-primary/70 uppercase tracking-widest">
              🗺️ Your Journey
            </p>
          </div>

          {phases.map((phase) => {
            const status = getPhaseStatus(phase);
            const isActive = phase.steps.includes(bb.step);
            return (
              <PhaseItem
                key={phase.id}
                phase={phase}
                status={status}
                isActive={isActive}
                onClick={() => goToPhase(phase)}
              />
            );
          })}

          {/* Book info */}
          {bookTitle && (
            <div className="mt-6 pt-4 border-t border-border/50 px-2 space-y-2">
              <div className="rounded-xl bg-card border border-border p-3 space-y-1.5">
                <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">📚 Your Book</p>
                <p className="text-xs font-bold text-foreground leading-snug">{bookTitle}</p>
                {bb.ageRange && (
                  <p className="text-xs text-muted-foreground">👶 Ages {bb.ageRange}</p>
                )}
                {bb.isChapterBook && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    📖 Chapter Book
                  </span>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 p-6 pb-16 bg-gradient-to-br from-background via-background to-primary/3">
          <div className="max-w-4xl mx-auto">
            {/* ── Step 1: Story ── */}
            {bb.step === 1 && (
              <StoryStep
                bb={bb}
                universes={universes as any[]}
                onContinue={() => advance(2)}
              />
            )}

            {/* ── Step 2: Structure ── */}
            {bb.step === 2 && (
              <StructureStep
                bb={bb}
                allCharacters={allChars as any[]}
                onBack={() => back(1)}
                onContinue={() => advance(3)}
              />
            )}

            {/* ── Step 3: Style ── */}
            {bb.step === 3 && (
              <StyleStep
                bb={bb}
                selectedCharacters={selectedCharacters}
                onBack={() => back(2)}
                onContinue={() => advance(bb.isChapterBook ? 4 : illStep)}
              />
            )}

            {/* ── Step 4: Prose (chapter-book only) ── */}
            {bb.step === 4 && bb.isChapterBook && (
              <ProseStep
                bb={bb}
                onBack={() => back(3)}
                onContinue={() => advance(illStep)}
              />
            )}

            {/* ── Illustrations ── */}
            {bb.step === illStep && (
              <IllustrationsStep
                bb={bb}
                onBack={() => back(bb.isChapterBook ? 4 : 3)}
                onContinue={() => advance(coverStep)}
              />
            )}

            {/* ── Cover ── */}
            {bb.step === coverStep && (
              <CoverStep
                bb={bb}
                onBack={() => back(illStep)}
                onContinue={() => advance(editorStep)}
              />
            )}

            {/* ── Editor ── */}
            {bb.step === editorStep && (
              <EditorStep
                bb={bb}
                onBack={() => back(coverStep)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
