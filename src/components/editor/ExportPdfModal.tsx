// components/editor/ExportPdfModal.tsx
// Template picker shown before PDF export.
// Automatically saves all pages, then fetches the PDF from the backend.

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Download, Check, AlertCircle } from "lucide-react";

// ─── Template Definitions ────────────────────────────────────────────────────
// id must match a key in the backend PDF_TEMPLATES object

interface TemplateDef {
  id: string;
  name: string;
  description: string;
  Preview: React.FC;
}

// ── Classic preview ──────────────────────────────────────────────────────────
function ClassicPreview() {
  return (
    <div className="w-full h-full bg-[#fffef7] relative overflow-hidden">
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(139,105,20,0.1) 100%)",
        }}
      />
      {/* Illustration placeholder */}
      <div className="absolute top-[12%] left-[8%] right-[8%] h-[42%] rounded bg-[#e8d5a3]/40 border border-[#c4a96a]/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1 opacity-50">
          <div className="w-10 h-7 rounded bg-[#8b6914]/25" />
          <div className="w-6 h-6 rounded-full bg-[#8b6914]/20" />
        </div>
      </div>
      {/* Text lines */}
      {[60, 68, 76, 84, 92].map((top, i) => (
        <div
          key={top}
          className="absolute rounded-full bg-[#2c1e0f]/20"
          style={{ top: `${top}%`, left: "8%", right: i === 4 ? "40%" : "8%", height: "2px" }}
        />
      ))}
      {/* Page number dot */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-5 h-1.5 rounded-full bg-[#8b6914]/30" />
    </div>
  );
}

// ── Split Panel preview ──────────────────────────────────────────────────────
function SplitPanelPreview() {
  return (
    <div className="w-full h-full bg-white relative overflow-hidden">
      {/* Teal left panel */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[38%]"
        style={{ background: "linear-gradient(180deg, #0d7a6e 0%, #085249 100%)" }}
      />
      {/* Panel edge rule */}
      <div
        className="absolute top-0 bottom-0"
        style={{
          left: "38%",
          width: "2px",
          background:
            "linear-gradient(180deg, transparent, rgba(212,167,44,0.5) 30%, rgba(212,167,44,0.5) 70%, transparent)",
        }}
      />
      {/* Left panel text lines */}
      {[22, 32, 42, 55, 65].map((top, i) => (
        <div
          key={top}
          className="absolute rounded-full bg-white/30"
          style={{ top: `${top}%`, left: "5%", right: i > 2 ? "48%" : "44%", height: "2px" }}
        />
      ))}
      {/* Right image block */}
      <div className="absolute top-[12%] right-[5%] w-[48%] h-[40%] rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
        <div className="flex flex-col items-center gap-1 opacity-40">
          <div className="w-8 h-6 rounded bg-gray-300" />
          <div className="w-5 h-5 rounded-full bg-gray-200" />
        </div>
      </div>
      {/* Right text lines */}
      {[58, 66, 74, 82].map((top, i) => (
        <div
          key={top}
          className="absolute rounded-full bg-gray-200"
          style={{ top: `${top}%`, left: "42%", right: i === 3 ? "30%" : "5%", height: "2px" }}
        />
      ))}
    </div>
  );
}

// ── Storybook Header preview ─────────────────────────────────────────────────
// function StorybookPreview() {
//   return (
//     <div className="w-full h-full bg-[#fdf6ee] relative overflow-hidden">
//       {/* Coral header band */}
//       <div
//         className="absolute top-0 left-0 right-0 h-[14%]"
//         style={{ background: "linear-gradient(135deg, #c94f1e 0%, #e07b54 100%)" }}
//       />
//       {/* Chapter label in band */}
//       <div className="absolute top-[3%] left-[8%] right-[40%] h-[2px] rounded-full bg-white/40" />
//       <div className="absolute top-[8%] left-[8%] right-[55%] h-[2px] rounded-full bg-white/25" />
//       {/* Image block — right half */}
//       <div className="absolute top-[20%] right-[5%] w-[46%] h-[40%] rounded bg-[#e8d8c0]/60 border border-[#c94f1e]/15 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-1 opacity-50">
//           <div className="w-8 h-6 rounded bg-[#c94f1e]/20" />
//           <div className="w-5 h-5 rounded-full bg-[#e07b54]/20" />
//         </div>
//       </div>
//       {/* Text lines — left half */}
//       {[22, 30, 38, 46, 54].map((top, i) => (
//         <div
//           key={top}
//           className="absolute rounded-full bg-[#2d1a0e]/20"
//           style={{ top: `${top}%`, left: "6%", right: i === 4 ? "55%" : "53%", height: "2px" }}
//         />
//       ))}
//       {/* Text lines — full width below image */}
//       {[66, 74, 82, 90].map((top, i) => (
//         <div
//           key={top}
//           className="absolute rounded-full bg-[#2d1a0e]/15"
//           style={{ top: `${top}%`, left: "6%", right: i === 3 ? "35%" : "6%", height: "2px" }}
//         />
//       ))}
//       {/* Bottom warm glow */}
//       <div
//         className="absolute bottom-0 left-0 right-0 h-[4%] pointer-events-none"
//         style={{ background: "linear-gradient(0deg, rgba(201,79,30,0.15) 0%, transparent 100%)" }}
//       />
//     </div>
//   );
// }

// ─── Template list ────────────────────────────────────────────────────────────

const TEMPLATES: TemplateDef[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Cream pages, serif fonts, gold accents — timeless book feel",
    Preview: ClassicPreview,
  },
  // {
  //   id: "splitpanel",
  //   name: "Split Panel",
  //   description: "Dark teal left panel, content right — matches the screenshot layout",
  //   Preview: SplitPanelPreview,
  // },
  // {
  //   id: "storyheader",
  //   name: "Storybook",
  //   description: "Warm cream with coral header band — playful children's book style",
  //   Preview: StorybookPreview,
  // },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExportPdfModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTitle: string;
  projectId: string;
  apiBase: string;
  token: string | null;
  /** Called first — must resolve when all pages are saved to the server */
  onSaveFirst: () => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExportPdfModal({
  open,
  onOpenChange,
  projectTitle,
  projectId,
  apiBase,
  token,
  onSaveFirst,
}: ExportPdfModalProps) {
  const [selectedId, setSelectedId] = useState("classic");
  const [phase, setPhase]           = useState<"idle" | "saving" | "exporting">("idle");
  const [error, setError]           = useState<string | null>(null);

  const busy     = phase !== "idle";
  const selected = TEMPLATES.find((t) => t.id === selectedId)!;

  const handleExport = async () => {
    setError(null);
    try {
      // ── Step 1: Save all pages first ────────────────────────────────────
      setPhase("saving");
      await onSaveFirst();

      // ── Step 2: Fetch PDF from backend ──────────────────────────────────
      setPhase("exporting");
      const res = await fetch(
        `${apiBase}/api/projects/${projectId}/export/pdf?template=${selectedId}`,
        { method: "GET", headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "Unknown error");
        throw new Error(body || `HTTP ${res.status}`);
      }

      // ── Step 3: Trigger download ─────────────────────────────────────────
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${projectTitle || "book"}-${selectedId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onOpenChange(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPhase("idle");
    }
  };

  const phaseLabel =
    phase === "saving"    ? "Saving pages…" :
    phase === "exporting" ? "Generating PDF…" :
    "Save & Export PDF";

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className="max-w-2xl bg-[#13151a] border-white/10 text-white p-0 overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/8">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold">
              Export PDF
            </DialogTitle>
            <DialogDescription className="text-white/45 text-sm mt-0.5">
              Choose a template style. Your pages are automatically saved before export.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Template grid */}
        <div className="px-6 py-5 ap-4">
          {TEMPLATES.map(({ id, name, description, Preview }) => {
            const isSelected = selectedId === id;
            return (
              <button
                key={id}
                onClick={() => !busy && setSelectedId(id)}
                disabled={busy}
                className={cn(
                  "flex flex-col rounded-xl border-2 overflow-hidden transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isSelected
                    ? "border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "border-white/10 hover:border-white/25 hover:scale-[1.01]",
                  busy && "opacity-60 cursor-not-allowed"
                )}
              >
                {/* Preview mockup */}
                <div className="aspect-[3/4] w-full relative">
                  <Preview />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "px-3 py-2.5 border-t transition-colors",
                    isSelected
                      ? "bg-primary/10 border-primary/30"
                      : "bg-[#1c1f27] border-white/5"
                  )}
                >
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-[11px] text-white/40 mt-0.5 leading-snug">{description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Progress indicator */}
        {busy && (
          <div className="mx-6 mb-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary">
                {phase === "saving" ? "Saving all pages…" : "Generating your PDF…"}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                {phase === "saving"
                  ? "Making sure everything is up to date before export."
                  : "Puppeteer is rendering each page. This may take 30–60 seconds."}
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400 leading-snug">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 pt-1 flex items-center justify-between">
          <p className="text-xs text-white/25">
            Template:{" "}
            <span className="text-white/45 font-medium">{selected.name}</span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="h-8 px-4 text-white/50 hover:text-white hover:bg-white/8 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={busy}
              className="h-8 px-5 bg-primary hover:bg-primary/90 text-xs font-semibold"
            >
              {busy
                ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <Download className="w-3.5 h-3.5 mr-1.5" />}
              {phaseLabel}
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
