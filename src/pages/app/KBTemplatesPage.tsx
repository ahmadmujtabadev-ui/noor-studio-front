// pages/app/KBTemplatesPage.tsx
// Dedicated KB Templates browser — users browse, preview, and apply starter templates.
// Design follows NoorStudio Brand Style Guide v1.0:
//   Primary: Teal #1B6B5A / Gold #F5A623 / Coral #E8725C
//   Fonts:   Outfit (display) / Plus Jakarta Sans (body)

import React, { useState } from "react";
import {
  BookOpen, Check, ChevronRight, Loader2, Sparkles,
  Users, TreePine, BookMarked, Frame, ArrowRight,
  AlertTriangle, Star,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  DEFAULT_KB_STARTER_TEMPLATES,
  KBStarterTemplate,
  buildKBPayloadFromTemplate,
} from "@/constants/kbStarterTemplates";
import { useKnowledgeBases } from "@/hooks/useKnowledgeBase";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import type { KnowledgeBase } from "@/lib/api/types";

// ─── Template card (left list) ────────────────────────────────────────────────

interface TemplateCardProps {
  tpl: KBStarterTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ tpl, isSelected, onSelect }: TemplateCardProps) {
  const gradients: Record<string, string> = {
    "under-six":     "from-amber-400 via-yellow-300 to-sky-400",
    "middle-grade":  "from-indigo-900 via-violet-800 to-amber-600",
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 group",
        isSelected
          ? "border-[#1B6B5A] shadow-lg shadow-[#1B6B5A]/15"
          : "border-border hover:border-[#1B6B5A]/40 hover:shadow-md",
      )}
    >
      {/* Visual banner */}
      <div
        className={cn("relative h-28 overflow-hidden", !tpl.previewImage && cn("bg-gradient-to-br", gradients[tpl.ageGroup]))}
        style={tpl.previewImage ? {
          backgroundImage: `url(${tpl.previewImage})`,
          backgroundSize: "cover",
          backgroundPosition: tpl.ageGroup === "under-six" ? "center 55%" : "center 40%",
        } : undefined}
      >
        {/* dark scrim so text/palette dots stay readable */}
        {tpl.previewImage && <div className="absolute inset-0 bg-black/20" />}
        {!tpl.previewImage && (
          /* Decorative placeholder */
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-30">
            <div className="w-12 h-12 rounded-full bg-white/40" />
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div className="w-5 h-5 rounded-full bg-white/30" />
          </div>
        )}
        {/* Palette strip */}
        <div className="absolute bottom-2 left-3 flex gap-1.5">
          {tpl.palette.map((hex) => (
            <span
              key={hex}
              className="w-4 h-4 rounded-full border-2 border-white/60 shadow"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {/* Age badge */}
        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
          {tpl.ageRange}
        </span>
        {isSelected && (
          <span className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#1B6B5A] flex items-center justify-center shadow">
            <Check className="w-3.5 h-3.5 text-white" />
          </span>
        )}
      </div>

      {/* Text */}
      <div className="p-4">
        <p className={cn(
          "font-bold text-base leading-tight",
          isSelected ? "text-[#063D2F]" : "text-foreground",
        )}>
          {tpl.name}
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
          {tpl.tagline}
        </p>
        <div className="flex items-center gap-1 mt-3">
          <ChevronRight className={cn(
            "w-3.5 h-3.5 transition-colors ml-auto",
            isSelected ? "text-[#1B6B5A]" : "text-muted-foreground/40",
          )} />
        </div>
      </div>
    </button>
  );
}

// ─── Content preview tab ──────────────────────────────────────────────────────

const PREVIEW_TABS = [
  { id: "values",     label: "Values",     icon: Star },
  { id: "duas",       label: "Du'as",      icon: BookOpen },
  { id: "background", label: "Background", icon: TreePine },
  { id: "cover",      label: "Cover",      icon: Frame },
] as const;

type PreviewTabId = typeof PREVIEW_TABS[number]["id"];

function TemplateContentPreview({ tpl }: { tpl: KBStarterTemplate }) {
  const [tab, setTab] = useState<PreviewTabId>("values");

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
        {PREVIEW_TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                active
                  ? "bg-white shadow-sm text-[#063D2F] dark:bg-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3 h-3" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Values */}
      {tab === "values" && (
        <div className="flex flex-wrap gap-2">
          {tpl.islamicValues.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F1] text-[#1B6B5A] border border-[#1B6B5A]/20"
            >
              <Check className="w-2.5 h-2.5 text-[#1B6B5A]" />
              {v}
            </span>
          ))}
        </div>
      )}

      {/* Du'as */}
      {tab === "duas" && (
        <div className="space-y-3">
          {tpl.duas.map((d, i) => (
            <div
              key={i}
              className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 p-4"
            >
              {d.arabic && (
                <p className="text-right text-lg font-semibold text-blue-900 dark:text-blue-200 leading-loose mb-1" dir="rtl" lang="ar">
                  {d.arabic}
                </p>
              )}
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300 italic">{d.transliteration}</p>
              <p className="text-xs text-blue-700/80 dark:text-blue-400 mt-0.5">"{d.meaning}"</p>
              {d.context && (
                <p className="text-[10px] text-muted-foreground mt-1.5 bg-blue-100/60 dark:bg-blue-900/30 px-2 py-0.5 rounded-full w-fit">
                  {d.context}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Background */}
      {tab === "background" && (() => {
        const bg = tpl.backgroundSettings.junior || tpl.backgroundSettings.middleGrade;
        if (!bg) return <p className="text-sm text-muted-foreground">No background settings defined.</p>;
        return (
          <div className="space-y-3">
            {bg.tone && (
              <div className="rounded-xl border border-teal-100 bg-teal-50/60 dark:bg-teal-950/15 p-3">
                <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 mb-1">Tone</p>
                <p className="text-sm text-muted-foreground">{bg.tone}</p>
              </div>
            )}
            {bg.locations?.length ? (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Locations</p>
                <div className="flex flex-wrap gap-1.5">
                  {bg.locations.map((l) => (
                    <span key={l} className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">{l}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {bg.colorStyle && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Colours:</span> {bg.colorStyle}
              </p>
            )}
            {bg.lightingStyle && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Lighting:</span> {bg.lightingStyle}
              </p>
            )}
          </div>
        );
      })()}

      {/* Cover */}
      {tab === "cover" && (
        <div className="space-y-3">
          {tpl.coverDesign.moodTheme && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 dark:bg-rose-950/15 p-3">
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">Mood</p>
              <p className="text-sm text-muted-foreground">{tpl.coverDesign.moodTheme}</p>
            </div>
          )}
          {tpl.coverDesign.islamicMotifs?.length ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Islamic Motifs</p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.coverDesign.islamicMotifs.map((m) => (
                  <span key={m} className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{m}</span>
                ))}
              </div>
            </div>
          ) : null}
          {tpl.coverDesign.avoidCover?.length ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Avoid on Cover</p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.coverDesign.avoidCover.map((a) => (
                  <span key={a} className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">{a}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Detail panel (right) ─────────────────────────────────────────────────────

interface DetailPanelProps {
  tpl: KBStarterTemplate;
  kbs: KnowledgeBase[];
  onApply: (tpl: KBStarterTemplate, kbId: string) => void;
  applying: boolean;
}

function DetailPanel({ tpl, kbs, onApply, applying }: DetailPanelProps) {
  const [targetKbId, setTargetKbId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const gradients: Record<string, string> = {
    "under-six":    "from-amber-400 via-yellow-300 to-sky-400",
    "middle-grade": "from-indigo-900 via-violet-800 to-amber-600",
  };

  const targetKb = kbs.find((kb) => (kb.id || (kb as any)._id) === targetKbId);

  const handleApplyClick = () => {
    if (!targetKbId) return;
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    onApply(tpl, targetKbId);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Hero visual */}
        <div className={cn(
          "relative w-full rounded-2xl overflow-hidden",
          !tpl.previewImage && cn("h-48 bg-gradient-to-br", gradients[tpl.ageGroup]),
        )}>
          {tpl.previewImage && (
            <img
              src={tpl.previewImage}
              alt={tpl.name}
              className="w-full h-auto block"
            />
          )}
          {/* gradient scrim over image — bottom fade */}
          {tpl.previewImage && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
          )}
          {!tpl.previewImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4 opacity-20">
                <div className="w-20 h-20 rounded-full bg-white" />
                <div className="w-14 h-14 rounded-full bg-white mt-8" />
                <div className="w-10 h-10 rounded-full bg-white mt-2" />
              </div>
            </div>
          )}
          {/* Age pill */}
          <span className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
            {tpl.ageRange}
          </span>
          {/* Template name over image */}
          <div className="absolute bottom-4 left-5">
            <p className="text-white font-bold text-lg drop-shadow-lg">{tpl.name}</p>
            <p className="text-white/80 text-xs drop-shadow">{tpl.tagline}</p>
          </div>
        </div>

        {/* Title + description */}
        <div>
          <h2 className="text-xl font-bold text-[#063D2F] dark:text-foreground">{tpl.name}</h2>
          <p className="text-sm font-medium text-[#1B6B5A] mt-0.5">{tpl.tagline}</p>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{tpl.description}</p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap gap-2">
          {tpl.highlightBadges.map((b) => (
            <Badge key={b} variant="secondary" className="text-xs gap-1 bg-[#E8F5F1] text-[#1B6B5A] border-[#1B6B5A]/20">
              <Check className="w-2.5 h-2.5" />{b}
            </Badge>
          ))}
        </div>

        {/* What will auto-fill */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/15 p-4 space-y-2">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            What auto-fills
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {[
              `${tpl.islamicValues.length} Islamic values`,
              `${tpl.duas.length} du'as with context`,
              `${tpl.avoidTopics.length} topics to avoid`,
              "Background scene settings",
              "Cover design template",
              "Book formatting rules",
              ...(tpl.underSixDesign ? ["Under-six layout rules"] : []),
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-amber-600 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Content preview */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Content Preview</p>
          <TemplateContentPreview tpl={tpl} />
        </div>

        {/* Apply section */}
        <div className="rounded-2xl border border-[#1B6B5A]/30 bg-[#E8F5F1]/40 dark:bg-[#063D2F]/20 p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-[#063D2F] dark:text-foreground">Apply this template</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose a knowledge base to populate. You can edit everything after applying.
            </p>
          </div>

          {kbs.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4 shrink-0" />
              No knowledge bases yet. Create one first from the Knowledge Base page.
            </div>
          ) : (
            <>
              <Select value={targetKbId} onValueChange={setTargetKbId}>
                <SelectTrigger className="bg-white dark:bg-card border-[#1B6B5A]/30 focus:border-[#1B6B5A]">
                  <SelectValue placeholder="Select knowledge base…" />
                </SelectTrigger>
                <SelectContent>
                  {kbs.map((kb) => {
                    const id = kb.id || (kb as any)._id;
                    return (
                      <SelectItem key={id} value={id}>
                        <span className="flex items-center gap-2">
                          <BookMarked className="w-3.5 h-3.5 text-muted-foreground" />
                          {kb.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Button
                className="w-full gap-2 bg-[#1B6B5A] hover:bg-[#0F4A3E] text-white"
                disabled={!targetKbId || applying}
                onClick={handleApplyClick}
              >
                {applying
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Applying…</>
                  : <><Sparkles className="w-4 h-4" />Apply Template<ArrowRight className="w-4 h-4 ml-auto" /></>
                }
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overwrite confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Apply "{tpl.name}" to "{targetKb?.name}"?
            </DialogTitle>
            <DialogDescription>
              This will overwrite the following sections in <strong>{targetKb?.name}</strong>:
              Islamic values, du'as, avoid topics, background settings, cover design, and book formatting.
              <br /><br />
              <span className="text-amber-600 font-medium">Your existing content in those sections will be replaced.</span> Character voice guides are not affected. You can edit everything after applying.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button
              className="bg-[#1B6B5A] hover:bg-[#0F4A3E] text-white gap-1.5"
              onClick={handleConfirm}
            >
              <Check className="w-4 h-4" />Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KBTemplatesPage() {
  const { toast } = useToast();
  const { data: kbs = [] } = useKnowledgeBases();

  const [selectedTplId, setSelectedTplId] = useState<string>(
    DEFAULT_KB_STARTER_TEMPLATES[0].id,
  );
  const [applying, setApplying] = useState(false);

  const selectedTpl =
    DEFAULT_KB_STARTER_TEMPLATES.find((t) => t.id === selectedTplId) ??
    DEFAULT_KB_STARTER_TEMPLATES[0];

  const handleApply = async (tpl: KBStarterTemplate, kbId: string) => {
    setApplying(true);
    try {
      const payload = buildKBPayloadFromTemplate(tpl);
      await knowledgeBasesApi.update(kbId, payload as any);
      const kb = kbs.find((k) => (k.id || (k as any)._id) === kbId);
      toast({
        title: `Template applied`,
        description: `"${tpl.name}" has been applied to "${kb?.name ?? "your KB"}". Go to Knowledge Base to review and edit.`,
      });
    } catch (err) {
      toast({
        title: "Apply failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <AppLayout
      title="KB Templates"
      subtitle="Start with a pre-built knowledge base for your age group — then customise everything"
    >
      <div className="flex gap-6 items-start">
        {/* ── Left: template list ── */}
        <div className="w-72 shrink-0 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Starter Templates
          </p>
          {DEFAULT_KB_STARTER_TEMPLATES.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              isSelected={selectedTplId === tpl.id}
              onSelect={() => setSelectedTplId(tpl.id)}
            />
          ))}

          {/* Tip */}
          <div className="rounded-xl border border-dashed border-muted-foreground/25 p-4 text-center space-y-1.5">
            <Users className="w-5 h-5 text-muted-foreground/40 mx-auto" />
            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Templates populate your KB instantly. You stay in full control — edit any field after applying.
            </p>
          </div>
        </div>

        {/* ── Right: detail panel ── */}
        <div className="flex-1 min-w-0">
          <DetailPanel
            tpl={selectedTpl}
            kbs={kbs as KnowledgeBase[]}
            onApply={handleApply}
            applying={applying}
          />
        </div>
      </div>
    </AppLayout>
  );
}
