import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookMarked,
  BookOpen,
  Check,
  ChevronRight,
  Frame,
  Loader2,
  Sparkles,
  Star,
  TreePine,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  buildKBPayloadFromTemplate,
  DEFAULT_KB_STARTER_TEMPLATES,
  KBStarterTemplate,
  KB_TEMPLATE_ROADMAP_FLAVOURS,
} from "@/constants/kbStarterTemplates";
import { useKnowledgeBases } from "@/hooks/useKnowledgeBase";
import { knowledgeBasesApi } from "@/lib/api/knowledgeBases.api";
import type { KnowledgeBase } from "@/lib/api/types";

const PREVIEW_TABS = [
  { id: "values", label: "Values", icon: Star },
  { id: "duas", label: "Du'as", icon: BookOpen },
  { id: "background", label: "Background", icon: TreePine },
  { id: "cover", label: "Cover", icon: Frame },
] as const;

type PreviewTabId = (typeof PREVIEW_TABS)[number]["id"];

const TEMPLATE_GRADIENTS: Record<string, string> = {
  "universal-under-six": "from-[#f8d76a] via-[#f7b267] to-[#69c5b8]",
  "universal-middle-grade": "from-[#3c5aa6] via-[#5b7cdb] to-[#f7b267]",
  "islamic-forward-under-six": "from-[#d6b37c] via-[#8ac6bf] to-[#f5e7c7]",
  "islamic-forward-middle-grade": "from-[#14213D] via-[#395b64] to-[#C59D5F]",
};

function getTemplateGradient(tpl: KBStarterTemplate) {
  return (
    TEMPLATE_GRADIENTS[`${tpl.flavour}-${tpl.ageGroup}`] ??
    "from-[#1B6B5A] via-[#4d908e] to-[#f5a623]"
  );
}

function TemplateCard({
  tpl,
  isSelected,
  onSelect,
}: {
  tpl: KBStarterTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 group bg-card",
        isSelected
          ? "border-[#1B6B5A] shadow-lg shadow-[#1B6B5A]/10"
          : "border-border hover:border-[#1B6B5A]/35 hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "relative h-32 overflow-hidden bg-gradient-to-br",
          getTemplateGradient(tpl)
        )}
      >
        {tpl.previewImage ? (
          <img
            src={tpl.previewImage}
            alt={tpl.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            style={{
              objectPosition:
                tpl.ageGroup === "under-six" ? "center 55%" : "center 40%",
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-30">
            <div className="w-12 h-12 rounded-full bg-white/40" />
            <div className="w-8 h-8 rounded-full bg-white/20" />
            <div className="w-5 h-5 rounded-full bg-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="rounded-full bg-white/90 text-[#0f4a3e] px-2.5 py-1 text-[10px] font-semibold">
            {tpl.flavourLabel}
          </span>
          <span className="rounded-full bg-black/40 text-white px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm">
            {tpl.themeLabel}
          </span>
        </div>
        <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/45 text-white backdrop-blur-sm">
          {tpl.ageRange}
        </span>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {tpl.palette.map((hex) => (
            <span
              key={hex}
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
        {isSelected && (
          <span className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-[#1B6B5A] flex items-center justify-center shadow">
            <Check className="w-4 h-4 text-white" />
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="font-bold text-base leading-tight text-foreground">{tpl.name}</p>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {tpl.tagline}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px] font-medium text-[#1B6B5A]">
            {tpl.highlightBadges[0]}
          </span>
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              isSelected ? "text-[#1B6B5A]" : "text-muted-foreground/40"
            )}
          />
        </div>
      </div>
    </button>
  );
}

function TemplateContentPreview({ tpl }: { tpl: KBStarterTemplate }) {
  const [tab, setTab] = useState<PreviewTabId>("values");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit flex-wrap">
        {PREVIEW_TABS.map((previewTab) => {
          const Icon = previewTab.icon;
          const active = tab === previewTab.id;
          return (
            <button
              key={previewTab.id}
              onClick={() => setTab(previewTab.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                active
                  ? "bg-white shadow-sm text-[#063D2F] dark:bg-card"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" />
              {previewTab.label}
            </button>
          );
        })}
      </div>

      {tab === "values" && (
        <div className="flex flex-wrap gap-2">
          {tpl.islamicValues.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5F1] text-[#1B6B5A] border border-[#1B6B5A]/20"
            >
              <Check className="w-2.5 h-2.5 text-[#1B6B5A]" />
              {value}
            </span>
          ))}
        </div>
      )}

      {tab === "duas" && (
        <div className="space-y-3">
          {tpl.duas.map((dua, index) => (
            <div
              key={`${dua.transliteration}-${index}`}
              className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4"
            >
              {dua.arabic && (
                <p
                  className="text-right text-lg font-semibold text-blue-900 leading-loose mb-1"
                  dir="rtl"
                  lang="ar"
                >
                  {dua.arabic}
                </p>
              )}
              <p className="text-sm font-medium text-blue-800 italic">
                {dua.transliteration}
              </p>
              <p className="text-xs text-blue-700/80 mt-0.5">"{dua.meaning}"</p>
              {dua.context && (
                <p className="text-[10px] text-muted-foreground mt-1.5 bg-blue-100/70 px-2 py-0.5 rounded-full w-fit">
                  {dua.context}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "background" &&
        (() => {
          const bg = tpl.backgroundSettings.junior || tpl.backgroundSettings.middleGrade;
          if (!bg) {
            return (
              <p className="text-sm text-muted-foreground">
                No background settings defined.
              </p>
            );
          }
          return (
            <div className="space-y-3">
              {bg.tone && (
                <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                  <p className="text-xs font-semibold text-teal-700 mb-1">Tone</p>
                  <p className="text-sm text-muted-foreground">{bg.tone}</p>
                </div>
              )}
              {bg.locations?.length ? (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Locations
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {bg.locations.map((location) => (
                      <span
                        key={location}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {location}
                      </span>
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

      {tab === "cover" && (
        <div className="space-y-3">
          {tpl.coverDesign.moodTheme && (
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3">
              <p className="text-xs font-semibold text-rose-700 mb-1">Mood</p>
              <p className="text-sm text-muted-foreground">{tpl.coverDesign.moodTheme}</p>
            </div>
          )}
          {tpl.coverDesign.islamicMotifs?.length ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Design Motifs
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.coverDesign.islamicMotifs.map((motif) => (
                  <span
                    key={motif}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    {motif}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {tpl.coverDesign.avoidCover?.length ? (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Avoid On Cover
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tpl.coverDesign.avoidCover.map((item) => (
                  <span
                    key={item}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  tpl,
  kbs,
  onApply,
  applying,
}: {
  tpl: KBStarterTemplate;
  kbs: KnowledgeBase[];
  onApply: (tpl: KBStarterTemplate, kbId: string) => void;
  applying: boolean;
}) {
  const navigate = useNavigate();
  const [targetKbId, setTargetKbId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const targetKb = kbs.find((kb) => (kb.id || (kb as any)._id) === targetKbId);

  const launchCreateFlow = () => {
    navigate(
      `/app/knowledge-base?create=1&template=${encodeURIComponent(tpl.id)}`
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br min-h-[240px]">
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              getTemplateGradient(tpl)
            )}
          />
          {tpl.previewImage ? (
            <img
              src={tpl.previewImage}
              alt={tpl.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                objectPosition:
                  tpl.ageGroup === "under-six" ? "center 55%" : "center 38%",
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-4 opacity-20">
                <div className="w-20 h-20 rounded-full bg-white" />
                <div className="w-14 h-14 rounded-full bg-white mt-8" />
                <div className="w-10 h-10 rounded-full bg-white mt-2" />
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/90 text-[#0f4a3e] px-3 py-1 text-xs font-semibold">
              {tpl.flavourLabel}
            </span>
            <span className="rounded-full bg-black/40 text-white px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {tpl.themeLabel}
            </span>
            <span className="rounded-full bg-black/40 text-white px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              {tpl.ageRange}
            </span>
          </div>
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-white font-bold text-2xl drop-shadow-lg">{tpl.name}</p>
            <p className="text-white/85 text-sm drop-shadow mt-1">{tpl.tagline}</p>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            {tpl.highlightBadges.map((badge) => (
              <Badge
                key={badge}
                variant="secondary"
                className="text-xs gap-1 bg-[#E8F5F1] text-[#1B6B5A] border-[#1B6B5A]/20"
              >
                <Check className="w-2.5 h-2.5" />
                {badge}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{tpl.description}</p>
        </div>

        <div className="rounded-2xl border border-[#1B6B5A]/20 bg-[#E8F5F1]/35 p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-[#063D2F]">Start a new KB with this template</p>
            <p className="text-xs text-muted-foreground mt-1">
              This opens the Knowledge Base page, preselects the template, and
              creates a KB that lands fully populated and editable.
            </p>
          </div>
          <Button
            className="w-full gap-2 bg-[#1B6B5A] hover:bg-[#0F4A3E] text-white"
            onClick={launchCreateFlow}
          >
            <Sparkles className="w-4 h-4" />
            Use This Template For A New KB
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">
            What auto-fills
          </p>
          <div className="grid sm:grid-cols-2 gap-1.5 text-xs text-muted-foreground">
            {[
              `${tpl.islamicValues.length} values`,
              `${tpl.duas.length} du'as with context`,
              `${tpl.avoidTopics.length} topics to avoid`,
              "Background scene settings",
              "Cover design rules",
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

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Content Preview
          </p>
          <TemplateContentPreview tpl={tpl} />
        </div>

        <div className="rounded-2xl border border-border p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-foreground">Apply to an existing KB</p>
            <p className="text-xs text-muted-foreground mt-1">
              Keep this as a secondary action if you want to refresh an existing
              knowledge base instead of creating a new one.
            </p>
          </div>

          {kbs.length === 0 ? (
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-4 py-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4 shrink-0" />
              No knowledge bases yet. Create one from this template first.
            </div>
          ) : (
            <>
              <Select value={targetKbId} onValueChange={setTargetKbId}>
                <SelectTrigger className="bg-white border-[#1B6B5A]/30 focus:border-[#1B6B5A]">
                  <SelectValue placeholder="Select knowledge base..." />
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
                variant="outline"
                className="w-full gap-2 border-[#1B6B5A]/30 text-[#1B6B5A] hover:bg-[#E8F5F1]"
                disabled={!targetKbId || applying}
                onClick={() => setShowConfirm(true)}
              >
                {applying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    Apply To Existing KB
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-dashed border-muted-foreground/25 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Roadmap flavours</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Visible placeholders keep the taxonomy broad without pretending those
            flavours are already built in v1.
          </p>
          <div className="grid md:grid-cols-3 gap-3">
            {KB_TEMPLATE_ROADMAP_FLAVOURS.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 text-[10px] font-bold">
                    Coming soon
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Apply "{tpl.name}" to "{targetKb?.name}"?
            </DialogTitle>
            <DialogDescription>
              This will overwrite Islamic values, du'as, avoid topics,
              background settings, cover design, and book formatting for{" "}
              <strong>{targetKb?.name}</strong>. Character voice guides are not
              affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#1B6B5A] hover:bg-[#0F4A3E] text-white gap-1.5"
              onClick={() => {
                setShowConfirm(false);
                if (targetKbId) onApply(tpl, targetKbId);
              }}
            >
              <Check className="w-4 h-4" />
              Apply Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function KBTemplatesPage() {
  const { toast } = useToast();
  const { data: kbs = [] } = useKnowledgeBases();
  const [selectedTplId, setSelectedTplId] = useState<string>(
    DEFAULT_KB_STARTER_TEMPLATES[0].id
  );
  const [ageFilter, setAgeFilter] = useState<"all" | "under-six" | "middle-grade">(
    "all"
  );
  const [flavourFilter, setFlavourFilter] = useState<
    "all" | "universal" | "islamic-forward"
  >("all");
  const [themeFilter, setThemeFilter] = useState<
    "all" | "wholesome-everyday" | "adventure-discovery" | "animals-nature"
  >("all");
  const [applying, setApplying] = useState(false);

  const filteredTemplates = useMemo(() => {
    return DEFAULT_KB_STARTER_TEMPLATES.filter((tpl) => {
      if (ageFilter !== "all" && tpl.ageGroup !== ageFilter) return false;
      if (flavourFilter !== "all" && tpl.flavour !== flavourFilter) return false;
      if (themeFilter !== "all" && tpl.theme !== themeFilter) return false;
      return true;
    });
  }, [ageFilter, flavourFilter, themeFilter]);

  useEffect(() => {
    if (!filteredTemplates.some((tpl) => tpl.id === selectedTplId)) {
      setSelectedTplId(filteredTemplates[0]?.id ?? DEFAULT_KB_STARTER_TEMPLATES[0].id);
    }
  }, [filteredTemplates, selectedTplId]);

  const selectedTpl =
    filteredTemplates.find((tpl) => tpl.id === selectedTplId) ??
    filteredTemplates[0] ??
    DEFAULT_KB_STARTER_TEMPLATES[0];

  const handleApply = async (tpl: KBStarterTemplate, kbId: string) => {
    setApplying(true);
    try {
      const payload = buildKBPayloadFromTemplate(tpl);
      await knowledgeBasesApi.update(kbId, payload as any);
      const kb = kbs.find((item) => (item.id || (item as any)._id) === kbId);
      toast({
        title: "Template applied",
        description: `"${tpl.name}" has been applied to "${kb?.name ?? "your KB"}".`,
      });
    } catch (error) {
      toast({
        title: "Apply failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <AppLayout
      title="KB Templates"
      subtitle="Universal-first template gallery with Islamic-Forward as a flagship flavour"
    >
      <div className="space-y-6">
        <div className="rounded-3xl border bg-gradient-to-r from-[#f7fbfa] via-white to-[#fbf7ef] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#1B6B5A]">
                {DEFAULT_KB_STARTER_TEMPLATES.length} launch-ready templates
              </p>
              <p className="text-sm text-muted-foreground max-w-3xl">
                Browse by age, theme, and flavour. Universal templates lead the
                gallery, Islamic-Forward templates are explicitly named, and
                roadmap flavours stay visible as coming-soon placeholders.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[640px]">
              <Select value={ageFilter} onValueChange={(value: any) => setAgeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  <SelectItem value="under-six">Under Six</SelectItem>
                  <SelectItem value="middle-grade">Ages 8-14</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={flavourFilter}
                onValueChange={(value: any) => setFlavourFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by flavour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All flavours</SelectItem>
                  <SelectItem value="universal">Universal</SelectItem>
                  <SelectItem value="islamic-forward">Islamic-Forward</SelectItem>
                </SelectContent>
              </Select>
              <Select value={themeFilter} onValueChange={(value: any) => setThemeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All themes</SelectItem>
                  <SelectItem value="wholesome-everyday">Wholesome Everyday</SelectItem>
                  <SelectItem value="adventure-discovery">Adventure & Discovery</SelectItem>
                  <SelectItem value="animals-nature">Animals & Nature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="w-full xl:w-[340px] shrink-0 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Starter Templates
            </p>
            {filteredTemplates.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center space-y-2">
                <p className="font-semibold">No templates match these filters</p>
                <p className="text-sm text-muted-foreground">
                  Try widening the age, flavour, or theme filter.
                </p>
              </div>
            ) : (
              filteredTemplates.map((tpl) => (
                <TemplateCard
                  key={tpl.id}
                  tpl={tpl}
                  isSelected={selectedTplId === tpl.id}
                  onSelect={() => setSelectedTplId(tpl.id)}
                />
              ))
            )}

            <div className="rounded-xl border border-dashed border-muted-foreground/25 p-4 text-center space-y-1.5">
              <Users className="w-5 h-5 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground/70 leading-relaxed">
                Templates pre-fill the KB foundation instantly. Users can still
                edit every field after applying.
              </p>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            {selectedTpl && (
              <DetailPanel
                tpl={selectedTpl}
                kbs={kbs as KnowledgeBase[]}
                onApply={handleApply}
                applying={applying}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
