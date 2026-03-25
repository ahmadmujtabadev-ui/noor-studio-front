// BookBuilderPage.tsx
// Production-ready review-first book builder.
// Steps adapt to mode: picture/spreads = 6 steps, chapter-book = 7 steps.

"use client";

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUniverses } from "@/hooks/useUniverses";
import { useCharacters } from "@/hooks/useCharacters";
import type { Character } from "@/lib/api/types";
import { useBookBuilder } from "@/hooks/useBookBuilder";
import { StepProgress } from "@/components/shared/StepProgress";
import { StoryStep } from "@/components/shared/StoryStep";
import { StructureStep } from "@/components/shared/StructureStep";
import { StyleStep } from "@/components/shared/Styestep";
import { ProseStep } from "@/components/shared/ProseStep";
import { IllustrationsStep } from "@/components/shared/IllustrationStep";
import { CoverStep } from "@/components/shared/CoverStep";
import { EditorStep } from "@/components/shared/EditorStep";



export default function BookBuilderPage() {
  const navigate = useNavigate();
  const bb       = useBookBuilder();

  const { universes = [] }          = useUniverses();
  const { data: allChars = [] } = useCharacters();

  const selectedCharacters = useMemo(() =>
    (allChars as Character[]).filter((c) =>
      bb.characterIds.includes(c.id || c._id || "")
    ),
    [allChars, bb.characterIds]
  );

  // ─── Step navigation helpers ───────────────────────────────────────────────
  const advance = (n: number) => {
    bb.markDone(bb.step);
    bb.setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = (n: number) => {
    bb.setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // For chapter-book: steps are 1-7; for others: 1-6
  // step mapping:
  //   All modes:    1=Story  2=Structure  3=Style
  //   chapter-book: 4=Prose  5=Illustrations  6=Cover  7=Editor
  //   others:                4=Illustrations  5=Cover  6=Editor

  const illStep    = bb.isChapterBook ? 5 : 4;
  const coverStep  = bb.isChapterBook ? 6 : 5;
  const editorStep = bb.isChapterBook ? 7 : 6;

  return (
    <AppLayout
      title="New Book"
      subtitle="Review-first AI book builder"
      actions={
        <Button variant="outline" size="sm" onClick={() => navigate("/app/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />Cancel
        </Button>
      }
    >
      <div className="w-full mx-auto pb-16 px-4">
        {/* Step progress */}
        <StepProgress
          mode={bb.mode}
          currentStep={bb.step}
          completedSteps={bb.completedSteps}
          onStepClick={(s) => bb.completedSteps.has(s) && bb.setStep(s)}
        />

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

        {/* ── Step 3: Character Style ── */}
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