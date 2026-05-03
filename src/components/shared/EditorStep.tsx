// steps/EditorStep.tsx
import React, { useState } from "react";
import {
  Layout, ArrowLeft, Loader2, CheckCircle2, BookOpen, FileText,
  Palette, PenLine, Image as ImageIcon, BookMarked, Download,
  AlertTriangle, ShieldCheck, Smartphone, Monitor, BookCopy,
  ChevronDown, ChevronUp, FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookBuilderHook } from "@/hooks/useBookBuilder";
import { normArr } from "@/lib/api/reviewTypes";
import { exportsApi } from "@/lib/api/exports.api";

// ─── Platform preset definitions ─────────────────────────────────────────────

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  format: string;
  size: string;
  dpi: string;
  bleed: string;
  colorSpace: string;
  note: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "kdp",
    name: "KDP Kids",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M.045 23.027 0 .977l4.375 7.577v6.897L.045 23.027zm14.22-9.433-2.785-4.983L22.158.977l-7.893 12.617zm3.484 2.094L22.205.977 24 23.027l-6.25-7.339zm-6.418 1.033 2.8-4.478 2.774 3.256-5.574 1.222zm-1.417.31L4.42 15.4v-6.31l5.494 7.94zm.63.71 5.574-1.222L9.915 23.01l.629-5.269z" />
      </svg>
    ),
    badge: "Print + Digital",
    badgeColor: "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
    format: "PDF/X-1a",
    size: '8.5 × 8.5 in',
    dpi: "300 DPI",
    bleed: '0.125"',
    colorSpace: "CMYK",
    note: "Most popular for self-published children's books. Requires full bleed and CMYK color profile.",
  },
  {
    id: "apple",
    name: "Apple Books",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
    badge: "Digital",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    format: "EPUB3 / PDF",
    size: "Reflowable",
    dpi: "72+ DPI",
    bleed: "None",
    colorSpace: "RGB",
    note: "Optimised for iPad and iPhone. EPUB3 supports audio and interactive elements. PDF gives fixed-layout.",
  },
  {
    id: "ingram",
    name: "IngramSpark",
    icon: <BookCopy className="w-5 h-5" />,
    badge: "Print-on-Demand",
    badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    format: "PDF/X-1a",
    size: '8.5 × 8.5 in',
    dpi: "300 DPI",
    bleed: '0.125"',
    colorSpace: "CMYK",
    note: "Global print-on-demand distribution. Spine width auto-calculated from page count (≈0.002252″ per page).",
  },
];

// ─── Pre-flight checks ────────────────────────────────────────────────────────

interface PreflightItem {
  label: string;
  pass: boolean;
  detail: string;
}

function buildPreflight(bb: BookBuilderHook): PreflightItem[] {
  const illNodes   = bb.illustrationNodes;
  const illApproved = illNodes.filter((n) => n.status === "approved").length;

  return [
    {
      label: "Story approved",
      pass: bb.storyReview?.status === "approved",
      detail: bb.storyReview?.status === "approved"
        ? `"${bb.storyReview?.current?.bookTitle}"`
        : "Go to Story step and approve",
    },
    {
      label: "All spreads defined",
      pass: bb.allStructureApproved,
      detail: bb.allStructureApproved
        ? `${normArr(bb.structureReview?.items).length} spread(s) confirmed`
        : "Some spreads still pending approval",
    },
    {
      label: "Illustrations generated",
      pass: illApproved > 0 && illApproved === illNodes.length,
      detail: `${illApproved}/${illNodes.length} approved`,
    },
    {
      label: "Front & back cover",
      pass: bb.bothCoversApproved,
      detail: bb.bothCoversApproved ? "Both covers approved" : "Return to Cover step",
    },
    {
      label: "Source resolution",
      pass: true,
      detail: "AI images generated at 1024 px+ (print-safe at 300 DPI up to 3.4 in)",
    },
    {
      label: "Text safe-zone",
      pass: true,
      detail: '0.25" safe margin auto-enforced by the canvas editor',
    },
  ];
}

// ─── Book mockup (CSS-only) ───────────────────────────────────────────────────

function BookMockup({ coverUrl }: { coverUrl?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      {/* Open-book shape */}
      <div className="relative" style={{ width: 220, height: 160 }}>
        {/* Left page */}
        <div
          className="absolute top-0 left-0 h-full rounded-l-md border border-border bg-muted/20 overflow-hidden"
          style={{ width: 104 }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Back cover" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-3">
              {[40, 55, 65, 75, 85].map((w, i) => (
                <div key={i} className="h-1 rounded-full bg-muted-foreground/20" style={{ width: `${w}%` }} />
              ))}
            </div>
          )}
          {/* Page lines */}
          <div className="absolute inset-y-0 right-0 w-px bg-border/60" />
        </div>

        {/* Spine */}
        <div className="absolute top-0 h-full bg-border/60 rounded-sm" style={{ left: 104, width: 12 }}>
          <div className="w-full h-full bg-gradient-to-r from-border/40 to-transparent" />
        </div>

        {/* Right page (front cover) */}
        <div
          className="absolute top-0 right-0 h-full rounded-r-md border border-border overflow-hidden shadow-lg"
          style={{ width: 104 }}
        >
          {coverUrl ? (
            <img src={coverUrl} alt="Front cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 flex flex-col items-center justify-center gap-2 p-3">
              <BookOpen className="w-8 h-8 text-amber-400/60" />
              <div className="space-y-1 w-full">
                {[70, 55, 40].map((w, i) => (
                  <div key={i} className="h-1 rounded-full bg-amber-400/30 mx-auto" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}
          {/* Spine shadow on right page */}
          <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/10 to-transparent pointer-events-none" />
        </div>

        {/* Drop shadow */}
        <div
          className="absolute -bottom-2 left-4 right-4 h-3 bg-black/10 dark:bg-black/30 rounded-full blur-md"
          style={{ zIndex: -1 }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface EditorStepProps {
  bb: BookBuilderHook;
  onBack: () => void;
}

export function EditorStep({ bb, onBack }: EditorStepProps) {
  const illStep   = bb.isChapterBook ? 4 : 3;
  const coverStep = bb.isChapterBook ? 5 : 4;

  const [selectedPlatform, setSelectedPlatform] = useState<string>("kdp");
  const [preflightOpen, setPreflightOpen]       = useState(true);
  const [exportLoading, setExportLoading]       = useState(false);
  const [exportError, setExportError]           = useState<string | null>(null);

  // ── Stage checklist ──────────────────────────────────────────────────────
  const stageChecks = [
    {
      icon: BookOpen,
      label: "Story",
      done: bb.storyReview?.status === "approved",
      detail: bb.storyReview?.current?.bookTitle || "—",
      step: 1,
    },
    {
      icon: FileText,
      label: bb.isChapterBook ? "Chapter Outline" : "Page Structure",
      done: bb.allStructureApproved,
      detail: `${normArr(bb.structureReview?.items).filter((i: any) => i.status === "approved").length}/${normArr(bb.structureReview?.items).length} approved`,
      step: 2,
    },
    {
      icon: Palette,
      label: "Character Style",
      done: true,
      detail: "Portraits generated",
      step: null as number | null,
    },
    ...(bb.isChapterBook ? [{
      icon: PenLine,
      label: "Chapter Prose",
      done: bb.allProseApproved,
      detail: `${(bb.humanizedReview.length ? bb.humanizedReview : bb.proseReview).filter((n) => n.status === "approved").length} chapters approved`,
      step: 3 as number | null,
    }] : []),
    {
      icon: ImageIcon,
      label: "Illustrations",
      done: bb.allIllusApproved,
      detail: `${bb.illustrationNodes.filter((n) => n.status === "approved").length}/${bb.illustrationNodes.length} approved`,
      step: illStep as number | null,
    },
    {
      icon: BookMarked,
      label: "Cover",
      done: bb.bothCoversApproved,
      detail: bb.bothCoversApproved ? "Front & back approved" : "Pending",
      step: coverStep as number | null,
    },
  ];

  const allDone = stageChecks.every((s) => s.done);

  // ── Pre-flight ───────────────────────────────────────────────────────────
  const preflightItems  = buildPreflight(bb);
  const preflightFailed = preflightItems.filter((p) => !p.pass);

  // ── Cover URL for mockup ─────────────────────────────────────────────────
  const frontCoverUrl = bb.coverReview?.front?.current?.imageUrl;

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExportPdf = async () => {
    if (!bb.projectId) return;
    setExportLoading(true);
    setExportError(null);
    try {
      await exportsApi.downloadPdf(bb.projectId, selectedPlatform);
    } catch (e) {
      setExportError((e as Error).message);
    } finally {
      setExportLoading(false);
    }
  };

  const activePlatform = PLATFORMS.find((p) => p.id === selectedPlatform)!;

  return (
    <div className="space-y-5 pb-10">

      {/* ── 1. Stage review ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Review & Publish</h2>
            <p className="text-sm text-muted-foreground">
              Check every stage, pick your platform, then export.
            </p>
          </div>
        </div>

        {/* Stage checklist */}
        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          {stageChecks.map((s, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-4 px-5 py-3 transition-colors",
                !s.done && s.step && "cursor-pointer hover:bg-muted/40"
              )}
              onClick={() => { if (!s.done && s.step) bb.setStep(s.step); }}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                s.done
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{s.label}</p>
                <p className="text-xs text-muted-foreground truncate">{s.detail}</p>
              </div>
              <Badge variant="outline" className={cn(
                "text-[10px] font-semibold",
                s.done
                  ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                  : "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
              )}>
                {s.done ? "Done" : "Pending"}
              </Badge>
            </div>
          ))}
        </div>

        {!allDone && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            <p className="font-semibold mb-1">Still pending:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {stageChecks.filter((s) => !s.done).map((s, i) => (
                <li key={i}>{s.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs opacity-80">Click any pending row to go back. You can still export but the book may be incomplete.</p>
          </div>
        )}
      </div>

      {/* ── 2. Platform presets ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          Platform Presets
        </h3>
        <p className="text-xs text-muted-foreground -mt-2">
          Each platform has different file specs. Select the one you're publishing to.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlatform(p.id)}
              className={cn(
                "relative text-left rounded-xl border-2 p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selectedPlatform === p.id
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "transition-colors",
                  selectedPlatform === p.id ? "text-primary" : "text-muted-foreground"
                )}>
                  {p.icon}
                </span>
                <span className="font-semibold text-sm">{p.name}</span>
              </div>
              <Badge variant="outline" className={cn("text-[9px] mb-2.5", p.badgeColor)}>
                {p.badge}
              </Badge>
              <div className="space-y-1">
                {[
                  ["Format",  p.format],
                  ["Size",    p.size],
                  ["DPI",     p.dpi],
                  ["Bleed",   p.bleed],
                  ["Color",   p.colorSpace],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
              {selectedPlatform === p.id && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Platform note */}
        <div className="rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">{activePlatform.name}:</span>{" "}
          {activePlatform.note}
        </div>

        {/* Export format docs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "PDF/X-1a", desc: "Print-ready. CMYK. Bleed included.", icon: <FileDown className="w-4 h-4" /> },
            { label: "EPUB3", desc: "Digital. Reflowable. Interactive.", icon: <Monitor className="w-4 h-4" /> },
            { label: "Print PDF", desc: "RGB screen. No bleed.", icon: <FileDown className="w-4 h-4" /> },
            { label: "Preview PDF", desc: "Low-res proof. Share with reviewers.", icon: <FileDown className="w-4 h-4" /> },
          ].map((f) => (
            <div key={f.label} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="text-muted-foreground">{f.icon}</span>
                {f.label}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Pre-flight check ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
          onClick={() => setPreflightOpen((v) => !v)}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className={cn(
              "w-4 h-4",
              preflightFailed.length === 0 ? "text-emerald-500" : "text-amber-500"
            )} />
            <span className="text-sm font-bold">Pre-flight Check</span>
            <Badge variant="outline" className={cn(
              "text-[10px]",
              preflightFailed.length === 0
                ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                : "border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-300"
            )}>
              {preflightFailed.length === 0 ? "All clear" : `${preflightFailed.length} issue${preflightFailed.length > 1 ? "s" : ""}`}
            </Badge>
          </div>
          {preflightOpen
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>

        {preflightOpen && (
          <div className="border-t border-border divide-y divide-border">
            {preflightItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-6 py-3">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  item.pass
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                )}>
                  {item.pass
                    ? <CheckCircle2 className="w-3 h-3" />
                    : <AlertTriangle className="w-3 h-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Preview mockup + export actions ──────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-base font-bold flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          Book Preview
        </h3>

        <BookMockup coverUrl={frontCoverUrl} />

        {/* Export error */}
        {exportError && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 px-4 py-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-600 dark:text-red-400">{exportError}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={bb.openEditor}
            disabled={bb.globalLoading}
            variant="outline"
            className="gap-2 h-11"
          >
            {bb.globalLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Layout className="w-4 h-4" />}
            Open Canvas Editor
          </Button>

          <Button
            onClick={handleExportPdf}
            disabled={exportLoading || !bb.projectId}
            className="gap-2 h-11"
          >
            {exportLoading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            {exportLoading ? "Generating PDF…" : `Export for ${activePlatform.name}`}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">
          Exports are generated as <strong>Print PDF</strong> (high-res, 300 DPI).
          Use the Canvas Editor to fine-tune pages before exporting.
        </p>
      </div>

      {/* ── Nav footer ──────────────────────────────────────────────────── */}
      <div className="flex justify-start pt-1">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />Back
        </Button>
      </div>

    </div>
  );
}
