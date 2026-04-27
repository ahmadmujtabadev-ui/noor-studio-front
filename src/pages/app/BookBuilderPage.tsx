// BookBuilderPage.tsx — Phase-based book production workspace
// Sidebar phases + overlay loading + book-like feel

"use client";

import React, { useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useBookBuilderNavStore } from "@/lib/store/bookBuilderNavStore";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import type { Character } from "@/lib/api/types";
import { useBookBuilder } from "@/hooks/useBookBuilder";
import { StoryStep } from "@/components/shared/StoryStep";
import { StructureStep } from "@/components/shared/StructureStep";
import { ProseStep } from "@/components/shared/ProseStep";
import { IllustrationsStep } from "@/components/shared/IllustrationStep";
import { CoverStep } from "@/components/shared/CoverStep";
import { EditorStep } from "@/components/shared/EditorStep";
import { CreditConfirmModal } from "@/components/shared/CreditConfirmModal";
import { GeneratingOverlay } from "@/components/shared/GeneratingOverlay";

// ─── Phase definitions ───────────────────────────────────────────────────────

// ─── Main page ───────────────────────────────────────────────────────────────

export default function BookBuilderPage() {
  const navigate = useNavigate();
  const { id: existingProjectId } = useParams<{ id?: string }>();
  const bb = useBookBuilder();

  // If opened with an existing project ID, load it
  useEffect(() => {
    if (existingProjectId) {
      bb.loadExistingProject(existingProjectId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProjectId]);

  const { universes = [] } = useUniverses();
  const { data: allChars = [], isLoading: charsLoading } = useCharacters();

  const selectedCharacters = useMemo(() =>
    (allChars as Character[]).filter((c) =>
      bb.characterIds.includes(c.id || c._id || "")
    ),
    [allChars, bb.characterIds]
  );

  // Auto-set artStyle from the selected universe
  useEffect(() => {
    if (!bb.universeId) return;
    const universe = universes.find((u) => (u.id || u._id) === bb.universeId);
    if (universe?.artStyle) {
      bb.setArtStyle(universe.artStyle);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bb.universeId, universes]);

  // Picture book:  1(Story)→2(Structure)→3(Ill)→4(Cover)→5(Editor)
  // Chapter book:  1(Story)→2(Structure)→3(Prose)→4(Ill)→5(Cover)→6(Editor)
  const illStep    = bb.isChapterBook ? 4 : 3;
  const coverStep  = bb.isChapterBook ? 5 : 4;
  const editorStep = bb.isChapterBook ? 6 : 5;

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

  // Detect Islamic-forward register from the selected universe
  const selectedUniverse = universes.find((u) => (u.id || u._id) === bb.universeId);
  const isIslamicForward =
    (selectedUniverse as any)?.flavour === "islamic-forward" ||
    (selectedUniverse as any)?.islamicForward === true ||
    (selectedUniverse as any)?.templateFlavour === "islamic-forward";
  const loadingRegister: "neutral" | "islamic" = isIslamicForward ? "islamic" : "neutral";

  // Progress label for spread-level generation
  const loadingProgress = bb.loadingKey?.startsWith("ill-")
    ? (() => {
        const m = bb.loadingKey.match(/ill-(\d+)-of-(\d+)/);
        return m ? `Spread ${m[1]} of ${m[2]}` : undefined;
      })()
    : undefined;

  // Show overlay for global loads, AI operations, and cover generation (all >5 s)
  const showOverlay = bb.globalLoading
    || (!!bb.loadingKey && (
      bb.loadingKey.startsWith("prose-gen") ||
      bb.loadingKey.startsWith("prose-humanize") ||
      bb.loadingKey.startsWith("prose-approve") ||
      bb.loadingKey.startsWith("structure") ||
      bb.loadingKey.startsWith("generate-all") ||
      bb.loadingKey.startsWith("cover-")
    ));

  const overlayLabel = bb.loadingKey?.startsWith("cover-front") ? "Generating front cover"
    : bb.loadingKey?.startsWith("cover-back") ? "Generating back cover"
    : bb.loadingKey?.startsWith("cover-spine") ? "Generating spine"
    : undefined;

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
      {showOverlay && (
        <GeneratingOverlay
          register={loadingRegister}
          progress={loadingProgress}
          label={overlayLabel}
        />
      )}

      {/* ── Credit confirmation dialog ── */}
      <CreditConfirmModal
        open={bb.confirmDialog.open}
        onOpenChange={(open) => { if (!open) bb.dismissConfirm(); }}
        onConfirm={bb.runConfirmed}
        title={bb.confirmDialog.title}
        description={bb.confirmDialog.description}
        creditCost={bb.confirmDialog.cost}
        isLoading={bb.confirmDialog.isRunning}
      />

      <div className="w-full">
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
            universeId={bb.universeId}
            onBack={() => back(1)}
            onContinue={() => advance(bb.isChapterBook ? 3 : illStep)}
          />
        )}

        {/* ── Step 3: Prose (chapter-book only) ── */}
        {bb.step === 3 && bb.isChapterBook && (
          <ProseStep
            bb={bb}
            onBack={() => back(2)}
            onContinue={() => advance(illStep)}
          />
        )}

        {/* ── Illustrations ── */}
        {bb.step === illStep && (
          <IllustrationsStep
            bb={bb}
            onBack={() => back(bb.isChapterBook ? 3 : 2)}
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
