// BookBuilderPage.tsx — Phase-based book production workspace
// Sidebar phases + overlay loading + book-like feel

"use client";

import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBookBuilderNavStore } from "@/lib/store/bookBuilderNavStore";
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

  // Sync step state to sidebar nav store
  const { setBookNav, resetBookNav } = useBookBuilderNavStore();
  useEffect(() => {
    setBookNav(bb.step, Array.from(bb.completedSteps), bb.isChapterBook);
  }, [bb.step, bb.completedSteps.size, bb.isChapterBook]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { resetBookNav(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    <AppLayout
      title={bookTitle ? `📖 ${bookTitle}` : "📖 New Book"}
      subtitle={bookTitle ? "Book Builder ✨" : "Set up your universe and start creating your story"}
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate("/app/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Dashboard
        </Button>
      }
    >
      {/* ── Global loading overlay ── */}
      {showOverlay && <LoadingOverlay message={loadingMsg} />}

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
    </AppLayout>
  );
}
