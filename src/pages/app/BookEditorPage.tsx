// pages/app/BookEditorPage.tsx
//
// FIXED v3 — layoutKey-driven persistence.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { useNavigate } from "react-router-dom";
import { exportBookEpub } from "@/lib/exportBookEpub";
import { useBookEditor } from "@/hooks/useBookEditor";
import { DesignPanel } from "@/components/editor/DesignPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { ElementsPanel } from "@/components/editor/ElementsPanel";
import FabricPageCanvas, {
  FabricCanvasHandle, EditorTool, PAGE_W, PAGE_H,
  LayoutAppliedPayload,
} from "@/components/editor/FabricPageCanvas";
import {
  Loader2, AlertCircle, BookOpen, X, Download,
  CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/useAuth";
import { SubscriptionGateModal } from "@/components/shared/SubscriptionGateModal";
import { tokenStorage } from "@/lib/api/client";
import { reviewApi } from "@/lib/api/review.api";

// ─── Platform configs (mirrors EditorStep.tsx) ────────────────────────────────
const EDITOR_PLATFORMS = [
  {
    id: "kdp",
    name: "KDP Kids",
    badge: "Print + Digital",
    badgeClass: "border-orange-300/40 text-orange-300",
    format: "PDF/X-1a", size: "8.5×8.5 in", dpi: "300 DPI", bleed: '0.125"', color: "CMYK",
    note: "Most popular for self-published children's books.",
  },
  {
    id: "apple",
    name: "Apple Books",
    badge: "Digital",
    badgeClass: "border-blue-400/40 text-blue-300",
    format: "EPUB3/PDF", size: "Reflowable", dpi: "72+ DPI", bleed: "None", color: "RGB",
    note: "Optimised for iPad and iPhone.",
  },
  {
    id: "ingram",
    name: "IngramSpark",
    badge: "Print-on-Demand",
    badgeClass: "border-violet-400/40 text-violet-300",
    format: "PDF/X-1a", size: "8.5×8.5 in", dpi: "300 DPI", bleed: '0.125"', color: "CMYK",
    note: "Global print-on-demand distribution.",
  },
] as const;

// ─── Export dialog (inline, dark-themed to match the editor) ─────────────────
interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport: (platform: string) => void;
  exporting: boolean;
  pages: Array<{ id: string; type?: string | null; thumbnail?: string | null; layoutKey?: string | null }>;
  projectTitle: string;
}

function ExportDialog({ open, onClose, onExport, exporting, pages, projectTitle }: ExportDialogProps) {
  const [platform, setPlatform] = useState<string>("kdp");

  if (!open) return null;

  const coverPage = pages.find((p) => p.id === "cover-front" || p.type === "front-cover");
  const coverThumb = coverPage?.thumbnail;
  const totalPages = pages.length;
  const savedPages = pages.filter((p) => p.layoutKey).length;
  const hasFrontCover = pages.some((p) => p.id === "cover-front" || p.type === "front-cover");
  const hasBackCover  = pages.some((p) => p.id === "cover-back"  || p.type === "back-cover");

  const checks = [
    { label: "Pages in book",       pass: totalPages > 0,  detail: `${totalPages} pages` },
    { label: "Layout applied",      pass: savedPages > 0,  detail: `${savedPages}/${totalPages} with layout` },
    { label: "Front cover present", pass: hasFrontCover,   detail: hasFrontCover ? "Found" : "No front cover page" },
    { label: "Back cover present",  pass: hasBackCover,    detail: hasBackCover  ? "Found" : "No back cover page" },
  ];

  const activePlat = EDITOR_PLATFORMS.find((p) => p.id === platform)!;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-2xl bg-[#1a1d24] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Export PDF</h2>
              <p className="text-xs text-white/40">{projectTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Book preview mockup + specs side-by-side */}
          <div className="flex gap-5">
            {/* CSS book mockup */}
            <div className="shrink-0 flex items-center justify-center">
              <div className="relative" style={{ width: 130, height: 96 }}>
                <div className="absolute top-0 left-0 h-full rounded-l border border-white/10 bg-white/5 overflow-hidden" style={{ width: 62 }}>
                  {coverThumb
                    ? <img src={coverThumb} alt="" className="w-full h-full object-cover opacity-50" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">{[40,55,65,75].map((w,i)=><div key={i} className="h-px rounded-full bg-white/15" style={{width:`${w}%`}}/>)}</div>}
                  <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
                </div>
                <div className="absolute top-0 h-full bg-white/5 rounded-sm" style={{ left: 62, width: 6 }}>
                  <div className="w-full h-full bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="absolute top-0 right-0 h-full rounded-r border border-white/15 overflow-hidden shadow-xl" style={{ width: 62 }}>
                  {coverThumb
                    ? <img src={coverThumb} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"><BookOpen className="w-6 h-6 text-primary/40" /></div>}
                  <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                </div>
                <div className="absolute -bottom-1.5 left-3 right-3 h-2 bg-black/30 rounded-full blur-md" style={{zIndex:-1}} />
              </div>
            </div>

            {/* File specs for selected platform */}
            <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">File Specs — {activePlat.name}</p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                {[
                  ["Format",      activePlat.format],
                  ["Page size",   activePlat.size],
                  ["Resolution",  activePlat.dpi],
                  ["Bleed",       activePlat.bleed],
                  ["Color space", activePlat.color],
                  ["Pages",       String(totalPages)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span className="text-white/35">{k}</span>
                    <span className="text-white/80 font-medium tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/30 mt-3 leading-relaxed">{activePlat.note}</p>
            </div>
          </div>

          {/* Platform selector */}
          <div>
            <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-widest">Publishing Platform</p>
            <div className="grid grid-cols-3 gap-2">
              {EDITOR_PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={cn(
                    "relative text-left rounded-xl border-2 p-3 transition-all focus:outline-none",
                    platform === p.id
                      ? "border-primary/60 bg-primary/10"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white/90">{p.name}</span>
                    {platform === p.id && (
                      <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={cn("text-[9px] mb-2", p.badgeClass)}>{p.badge}</Badge>
                  <div className="space-y-0.5">
                    {[["Fmt", p.format], ["DPI", p.dpi], ["Bleed", p.bleed]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-[10px]">
                        <span className="text-white/30">{k}</span>
                        <span className="text-white/60 font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pre-flight checklist */}
          <div>
            <p className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-widest">Pre-flight Check</p>
            <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5 overflow-hidden">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                    c.pass ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                  )}>
                    {c.pass
                      ? <CheckCircle2 className="w-3 h-3" />
                      : <AlertTriangle className="w-3 h-3" />}
                  </div>
                  <span className="text-xs text-white/80 flex-1">{c.label}</span>
                  <span className="text-[11px] text-white/40">{c.detail}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-white/25 mt-2">
              Pages without a layout applied will render using AI-generated images as fallbacks.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
          <p className="text-[11px] text-white/30">
            High-res print PDF · All canvas changes included
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white/50 hover:text-white/80">
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-primary hover:bg-primary/90"
              onClick={() => onExport(platform)}
              disabled={exporting}
            >
              {exporting
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Download className="w-3.5 h-3.5" />}
              {exporting ? "Generating…" : `Export for ${activePlat.name}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const API_BASE = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env.VITE_API_URL || "https://nsb-bacl.vercel.app" || "http://localhost:9008";

const TOOL_SHORTCUTS: Record<string, EditorTool> = {
  v: "select", V: "select", t: "text", T: "text",
  r: "rect", R: "rect", c: "circle", C: "circle",
  l: "line", L: "line", s: "star", S: "star",
};

export default function BookEditorPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const user = useUser();
  const isSubscriptionExpired =
    user?.plan !== "free" &&
    user?.subscriptionStatus !== "active" &&
    user?.subscriptionStatus !== "trialing" &&
    !!user?.subscriptionStatus;
  const [editorGateOpen, setEditorGateOpen] = useState(isSubscriptionExpired);

  const {
    projectId, projectTitle, pages, currentPageIdx, setCurrentPageIdx,
    loading, error, updatePage, saveAllPages, autoSave, goBack,
  } = useBookEditor();

  const canvasRef = useRef<FabricCanvasHandle>(null);
  const prevPageIdxRef = useRef<number>(0);
  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);
  const [scale, setScale] = useState(0.7);
  const [saving, setSaving] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingEpub, setExportingEpub] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [pageReloadNonceById, setPageReloadNonceById] = useState<Record<string, number>>({});

  const currentPage = pages[currentPageIdx];
  const pagesRef = useRef(pages);
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  const currentPageIdxRef = useRef(currentPageIdx);
  useEffect(() => { currentPageIdxRef.current = currentPageIdx; }, [currentPageIdx]);

  const buildCanvasDrivenUpdates = useCallback(
    (json: object, thumbnail: string | undefined, idx: number) => {
      const pageSnapshot = pagesRef.current[idx];
      const objects = (json as any)?.objects ?? [];
      const bodyLeft = objects.find((o: any) => o._role === "body-text");
      const bodyRight = objects.find((o: any) => o._role === "body-text-right");
      const titleObj = objects.find((o: any) => o._role === "title" || o._role === "chapter-title");

      const updates: Record<string, unknown> = { fabricJson: json };
      if (thumbnail !== undefined) updates.thumbnail = thumbnail;

      if (bodyLeft?.text && bodyRight?.text) updates.text = `${bodyLeft.text} ${bodyRight.text}`;
      else if (bodyLeft?.text) updates.text = bodyLeft.text;

      if (titleObj?.text && pageSnapshot?.type === "front-cover") {
        updates.title = titleObj.text;
      }

      return updates;
    },
    []
  );

  const bumpPageReloadNonce = useCallback((pageId?: string) => {
    if (!pageId) return;
    setPageReloadNonceById((prev) => ({
      ...prev,
      [pageId]: (prev[pageId] ?? 0) + 1,
    }));
  }, []);

  const commitCanvasSnapshot = useCallback((
    idx: number,
    json: object,
    thumbnail: string | undefined,
    persistMode: "none" | "auto" | "immediate" = "none",
    bodyTextStyles: Record<string, unknown> | null = null,
  ) => {
    if (!pagesRef.current[idx]) return null;

    const updates = buildCanvasDrivenUpdates(json, thumbnail, idx);
    // Only store bodyTextStyles if the page has a layoutKey (i.e. template is active)
    if (pagesRef.current[idx].layoutKey && bodyTextStyles) {
      (updates as any).bodyTextStyles = bodyTextStyles;
    }
    updatePage(idx, updates);

    const nextPages = pagesRef.current.map((p, i) =>
      i === idx ? { ...p, ...updates } : p
    );

    pagesRef.current = nextPages;

    if (persistMode === "auto") {
      autoSave(nextPages);
    } else if (persistMode === "immediate") {
      saveAllPages(nextPages).catch((err) =>
        console.error("[commitCanvasSnapshot] saveAllPages failed:", err)
      );
    }

    return nextPages;
  }, [autoSave, buildCanvasDrivenUpdates, saveAllPages, updatePage]);

  const commitLiveCanvasSnapshot = useCallback((
    idx: number,
    persistMode: "none" | "auto" | "immediate" = "none",
  ) => {
    const json = canvasRef.current?.toJSON();
    const thumb = canvasRef.current?.toDataURL();
    if (!json) return null;
    const styles = canvasRef.current?.extractBodyTextStyles?.() ?? null;
    return commitCanvasSnapshot(idx, json, thumb, persistMode, styles);
  }, [commitCanvasSnapshot]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const tool = TOOL_SHORTCUTS[e.key];
      if (tool) {
        setActiveTool(tool); canvasRef.current?.setTool(tool);
        if (tool === "line") canvasRef.current?.addLine();
        if (tool === "star") canvasRef.current?.addStar();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") canvasRef.current?.deleteSelected();
      if ((e.metaKey || e.ctrlKey) && e.key === "=") { e.preventDefault(); setScale((s) => Math.min(s + 0.1, 2)); }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") { e.preventDefault(); setScale((s) => Math.max(s - 0.1, 0.2)); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { setFabricCanvas(canvasRef.current?.getCanvas() ?? null); }, 100);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { setFabricCanvas(canvasRef.current?.getCanvas() ?? null); }, 150);
    return () => clearTimeout(id);
  }, [currentPageIdx]);

  const saveCurrentPageState = useCallback(() => {
    const idx = prevPageIdxRef.current;
    commitLiveCanvasSnapshot(idx, "none");
  }, [commitLiveCanvasSnapshot]);

  const handlePageSelect = useCallback((idx: number) => {
    saveCurrentPageState();
    prevPageIdxRef.current = idx;
    setCurrentPageIdx(idx);
    setSelectedObj(null);
  }, [saveCurrentPageState, setCurrentPageIdx]);

  useEffect(() => { prevPageIdxRef.current = currentPageIdx; }, [currentPageIdx]);

  const handleToolChange = useCallback((t: EditorTool) => {
    setActiveTool(t); canvasRef.current?.setTool(t);
  }, []);

  const handleSelectionChange = useCallback((obj: fabric.Object | null) => {
    setSelectedObj(obj);
  }, []);

  const handleCanvasChange = useCallback(
    (json: object, thumbnail: string) => {
      const idx = currentPageIdxRef.current;
      // Capture body-text style overrides so they persist through template rebuilds
      const styles = canvasRef.current?.extractBodyTextStyles?.() ?? null;
      commitCanvasSnapshot(idx, json, thumbnail, "auto", styles);
    },
    [commitCanvasSnapshot]
  );

  // onLayoutComplete fires from FabricPageCanvas right after applyLayout
  // finishes. We DON'T persist here — handleLayoutPayload (below) is the
  // authoritative save point for layout application.
  const handleLayoutComplete = useCallback(
    (_payload: LayoutAppliedPayload) => {
      // Intentional no-op: handleLayoutPayload handles persistence atomically
    },
    []
  );

  /**
   * handleLayoutPayload — ATOMIC save of a layout application.
   *
   * Called by LayoutPickerPanel after applyLayout completes on the canvas.
   * Writes layoutKey + text + fabricJson + thumbnail into the page in a
   * SINGLE update, then saves all pages to the server. Returns the promise
   * so the picker can show "Saving…" / "Saved ✓" feedback.
   */
  const handleLayoutPayload = useCallback(
    async (payload: LayoutAppliedPayload & { pageId: string }): Promise<void> => {
      const idx = pagesRef.current.findIndex((p) => p.id === payload.pageId);
      if (idx === -1) return;

      const updates: Partial<typeof pagesRef.current[number]> = {
        layoutKey: payload.layoutKey,
        fabricJson: payload.fabricJson,
        thumbnail: payload.thumbnail,
        // Reset styles on fresh apply (nothing extracted yet). If payload
        // includes extracted styles (from user-edited text), store those.
        bodyTextStyles: (payload.bodyTextStyles as any) ?? null,
      };
      if (payload.bodyText !== null && payload.bodyText !== undefined) {
        updates.text = payload.bodyText;
      }

      updatePage(idx, updates);

      const nextPages = pagesRef.current.map((p, i) =>
        i === idx ? { ...p, ...updates } : p
      );
      pagesRef.current = nextPages;

      await saveAllPages(nextPages);
    },
    [saveAllPages, updatePage]
  );

  const requestSaveCurrentPage = useCallback(async (): Promise<void> => {
    const json = canvasRef.current?.toJSON();
    const thumb = canvasRef.current?.toDataURL();
    if (!json) return;
    const idx = currentPageIdxRef.current;

    const updates = buildCanvasDrivenUpdates(json, thumb, idx);
    // Include style overrides if the page has an active layout
    const page = pagesRef.current[idx];
    if (page?.layoutKey) {
      const styles = canvasRef.current?.extractBodyTextStyles?.() ?? null;
      if (styles) (updates as any).bodyTextStyles = styles;
    }
    updatePage(idx, updates);

    const nextPages = pagesRef.current.map((p, i) =>
      i === idx ? { ...p, ...updates } : p
    );
    pagesRef.current = nextPages;

    await saveAllPages(nextPages);
  }, [buildCanvasDrivenUpdates, saveAllPages, updatePage]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await requestSaveCurrentPage();
      toast({ title: "Saved ✓", description: "All pages saved to your account" });
    } catch {
      toast({ title: "Save failed", description: "Could not reach the server", variant: "destructive" });
    } finally { setSaving(false); }
  }, [requestSaveCurrentPage, toast]);

  // Opens the export dialog (platform picker + pre-flight check)
  const handleExport = useCallback(() => {
    setExportDialogOpen(true);
  }, []);

  // Called by the export dialog once the user picks a platform and confirms
  const doExport = useCallback(async (platform: string) => {
    if (!projectId) return;
    setExportingPdf(true);
    toast({ title: "Generating PDF…", description: "Saving pages and preparing your download" });
    try {
      saveCurrentPageState();
      await requestSaveCurrentPage();

      const res = await fetch(
        `${API_BASE}/api/projects/${projectId}/export/pdf?platform=${platform}&template=classic`,
        { method: "GET", headers: tokenStorage.get() ? { Authorization: `Bearer ${tokenStorage.get()}` } : {} }
      );

      if (!res.ok) {
        const body = await res.text().catch(() => "Unknown error");
        throw new Error(body || `HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectTitle || "book"}-${platform}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportDialogOpen(false);
      toast({ title: "PDF exported ✓" });
    } catch (err) {
      toast({ title: "PDF export failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setExportingPdf(false);
    }
  }, [projectId, projectTitle, requestSaveCurrentPage, saveCurrentPageState, toast]);

  const handleExportEpub = useCallback(async () => {
    saveCurrentPageState(); setExportingEpub(true);
    toast({ title: "Generating EPUB…", description: "Building e-book file" });
    try {
      await exportBookEpub(pagesRef.current, projectTitle, {
        onProgress: (cur, total) => { if (cur === total) toast({ title: "EPUB exported ✓" }); },
      });
    } catch (err) {
      toast({ title: "EPUB export failed", description: (err as Error).message, variant: "destructive" });
    } finally { setExportingEpub(false); }
  }, [projectTitle, saveCurrentPageState, toast]);

  const handleImageUpload = useCallback(async (dataUrl: string) => {
    if (!projectId) return;
    let imageUrl = dataUrl;
    if (dataUrl.startsWith("data:")) {
      try {
        const { url } = await reviewApi.uploadEditorImage(projectId, dataUrl, `user_${Date.now()}`);
        imageUrl = url;
      } catch (err) { console.error("[handleImageUpload] Upload failed:", err); }
    }
    canvasRef.current?.addImageFromUrl(imageUrl);
    setActiveTool("select"); canvasRef.current?.setTool("select");
  }, [projectId]);

  // ══════════════════════════════════════════════════════════════════════════
  //  UNDO / REDO
  //
  //  We keep a per-page history stack of canvas JSON snapshots. The stack
  //  only holds up to 30 entries per page to bound memory. When the user
  //  undoes, we restore a snapshot on the canvas; when they redo, we
  //  replay forward. Any new edit while NOT at the head of the stack
  //  truncates the future (standard undo semantics).
  // ══════════════════════════════════════════════════════════════════════════
  type HistoryEntry = { json: object };
  type PageHistory = { past: HistoryEntry[]; future: HistoryEntry[] };

  const historyRef = useRef<Record<string, PageHistory>>({});
  const isUndoRedoRef = useRef(false);
  const [, forceHistoryUpdate] = useState(0);
  const bumpHistoryTick = () => forceHistoryUpdate((n) => n + 1);
  const MAX_HISTORY = 30;

  // Push current canvas into history for the current page. Called from
  // handleCanvasChange (via an effect below).
  const pushHistory = useCallback((pageId: string, json: object) => {
    if (isUndoRedoRef.current) return; // don't record undo/redo itself
    const h = historyRef.current[pageId] ?? { past: [], future: [] };
    const last = h.past[h.past.length - 1];
    // Skip if identical to last entry (avoid noise)
    if (last) {
      try {
        if (JSON.stringify(last.json) === JSON.stringify(json)) return;
      } catch { /* ignore */ }
    }
    h.past.push({ json });
    if (h.past.length > MAX_HISTORY) h.past.shift();
    h.future = []; // new edit invalidates future
    historyRef.current[pageId] = h;
    bumpHistoryTick();
  }, []);

  // Seed history with a snapshot whenever the page changes (so undo can
  // restore back to the initial state on page open).
  useEffect(() => {
    const pageId = currentPage?.id;
    if (!pageId) return;
    // Wait a bit for the canvas to finish building the page
    const t = setTimeout(() => {
      const snap = canvasRef.current?.snapshotState?.();
      if (!snap) return;
      const h = historyRef.current[pageId] ?? { past: [], future: [] };
      if (h.past.length === 0) {
        h.past.push({ json: snap });
        historyRef.current[pageId] = h;
        bumpHistoryTick();
      }
    }, 600);
    return () => clearTimeout(t);
  }, [currentPage?.id]);

  // Record changes into history — subscribe to canvas changes via the
  // existing handleCanvasChange pathway. We wrap a helper that both pushes
  // history AND calls the commit logic.
  const onCanvasChangeWithHistory = useCallback(
    (json: object, thumbnail: string) => {
      const pageId = pagesRef.current[currentPageIdxRef.current]?.id;
      if (pageId) pushHistory(pageId, json);
      handleCanvasChange(json, thumbnail);
    },
    [handleCanvasChange, pushHistory],
  );

  const canUndo = (() => {
    const pageId = currentPage?.id;
    if (!pageId) return false;
    const h = historyRef.current[pageId];
    return !!h && h.past.length > 1;
  })();

  const canRedo = (() => {
    const pageId = currentPage?.id;
    if (!pageId) return false;
    const h = historyRef.current[pageId];
    return !!h && h.future.length > 0;
  })();

  const handleUndo = useCallback(async () => {
    const pageId = currentPage?.id;
    if (!pageId) return;
    const h = historyRef.current[pageId];
    if (!h || h.past.length <= 1) return;

    const current = h.past.pop()!;
    const target = h.past[h.past.length - 1];
    h.future.unshift(current);
    historyRef.current[pageId] = h;
    bumpHistoryTick();

    isUndoRedoRef.current = true;
    try {
      await canvasRef.current?.restoreState?.(target.json);
      // After restoring, persist the new state
      const idx = currentPageIdxRef.current;
      const thumb = canvasRef.current?.toDataURL() ?? "";
      const styles = canvasRef.current?.extractBodyTextStyles?.() ?? null;
      commitCanvasSnapshot(idx, target.json, thumb, "auto", styles);
    } finally {
      setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    }
  }, [commitCanvasSnapshot, currentPage?.id]);

  const handleRedo = useCallback(async () => {
    const pageId = currentPage?.id;
    if (!pageId) return;
    const h = historyRef.current[pageId];
    if (!h || h.future.length === 0) return;

    const target = h.future.shift()!;
    h.past.push(target);
    historyRef.current[pageId] = h;
    bumpHistoryTick();

    isUndoRedoRef.current = true;
    try {
      await canvasRef.current?.restoreState?.(target.json);
      const idx = currentPageIdxRef.current;
      const thumb = canvasRef.current?.toDataURL() ?? "";
      const styles = canvasRef.current?.extractBodyTextStyles?.() ?? null;
      commitCanvasSnapshot(idx, target.json, thumb, "auto", styles);
    } finally {
      setTimeout(() => { isUndoRedoRef.current = false; }, 100);
    }
  }, [commitCanvasSnapshot, currentPage?.id]);

  // Keyboard shortcuts: Cmd/Ctrl+Z for undo, Cmd/Ctrl+Shift+Z (or Cmd/Ctrl+Y) for redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const isMeta = e.metaKey || e.ctrlKey;
      if (!isMeta) return;
      if (e.key === "z" || e.key === "Z") {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if (e.key === "y" || e.key === "Y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleUndo, handleRedo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-7 h-7 text-primary animate-pulse" /></div>
          <div className="text-center"><p className="text-white font-semibold">Loading Editor</p><p className="text-white/40 text-sm mt-1">Preparing your book pages…</p></div>
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center px-6">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-white font-semibold">Failed to load book</p>
          <p className="text-white/50 text-sm">{error}</p>
          <Button onClick={goBack} variant="outline" className="text-white border-white/20">Go Back</Button>
        </div>
      </div>
    );
  }
  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="text-center"><p className="text-white/50">No pages to display.</p><Button onClick={goBack} variant="ghost" className="mt-4 text-white/60">Go Back</Button></div>
      </div>
    );
  }

  return (
    <>
      <SubscriptionGateModal open={editorGateOpen} onOpenChange={setEditorGateOpen} workflow="editor" reason="expired" />

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={doExport}
        exporting={exportingPdf}
        pages={pages}
        projectTitle={projectTitle}
      />

      <div className="flex flex-col h-screen bg-[#0f1117] overflow-hidden select-none">
        <EditorToolbar
          title={projectTitle} activeTool={activeTool} onToolChange={handleToolChange}
          scale={scale} onZoomIn={() => setScale((s) => Math.min(s + 0.1, 2))} onZoomOut={() => setScale((s) => Math.max(s - 0.1, 0.25))}
          onSave={handleSave} onExport={handleExport} onExportEpub={handleExportEpub}
          exportingEpub={exportingEpub} onBack={goBack}
          onPreview={() => navigate(`/app/projects/${projectId}/preview`)} saving={saving || exportingPdf}
          onUndo={handleUndo} onRedo={handleRedo}
          canUndo={canUndo} canRedo={canRedo}
        />

        <div className="flex flex-1 overflow-hidden">
          <ElementsPanel
            currentPage={currentPage}
            canvasRef={canvasRef}
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onImageUpload={handleImageUpload}
            onLayoutPayload={handleLayoutPayload}
            onCommitPage={(pageId: string, payload: any) => {
              const idx = pagesRef.current.findIndex((p) => p.id === pageId);
              if (idx === -1) return;
              const up = { fabricJson: payload.fabricJson, thumbnail: payload.thumbnail, layoutType: payload.layoutType };
              updatePage(idx, up);
              const nextPages = pagesRef.current.map((p, i) => i === idx ? { ...p, ...up } : p);
              pagesRef.current = nextPages;
              saveAllPages(nextPages).catch((err) => console.error("[onCommitPage] save failed:", err));
            }}
          />

          <div className="flex-1 overflow-auto bg-[#0f1117]">
            <div className="flex items-center justify-center min-h-full" style={{ padding: "2.5rem 2rem 5rem" }}>
              <div className="relative">
                <div className="absolute -top-7 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
                  <span className="text-xs text-white/40 font-semibold">{currentPage.label}</span>
                </div>

                <div className="relative rounded-sm overflow-hidden" style={{ width: PAGE_W * scale, height: PAGE_H * scale, boxShadow: "0 20px 80px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)" }}>
                  <FabricPageCanvas
                    ref={canvasRef}
                    page={currentPage}
                    scale={scale}
                    tool={activeTool}
                    onSelectionChange={handleSelectionChange}
                    onCanvasChange={onCanvasChangeWithHistory}
                    onLayoutComplete={handleLayoutComplete}
                    reloadNonce={currentPage ? (pageReloadNonceById[currentPage.id] ?? 0) : 0}
                  />
                </div>

                {/* Page navigation — prominent pill bar */}
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex items-center gap-0 pointer-events-auto">
                  <div className="flex items-center gap-1 bg-[#1e2130] border border-white/15 rounded-2xl px-2 py-1.5 shadow-xl shadow-black/40">
                    <button
                      onClick={() => handlePageSelect(Math.max(0, currentPageIdx - 1))}
                      disabled={currentPageIdx === 0}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>

                    <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/8 select-none">
                      <span className="text-sm font-bold text-white tabular-nums">
                        {currentPageIdx + 1}
                      </span>
                      <span className="text-white/30 text-sm">/</span>
                      <span className="text-sm text-white/50 tabular-nums">
                        {pages.length}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePageSelect(Math.min(pages.length - 1, currentPageIdx + 1))}
                      disabled={currentPageIdx === pages.length - 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DesignPanel
            selectedObj={selectedObj} canvas={fabricCanvas} projectId={projectId}
            onDelete={() => canvasRef.current?.deleteSelected()}
            onBringForward={() => canvasRef.current?.bringForward()}
            onSendBackward={() => canvasRef.current?.sendBackward()}
          />
        </div>

        <div className="h-6 bg-[#13151a] border-t border-white/5 flex items-center px-4 gap-4">
          <span className="text-[10px] text-white/25">Tool: <span className="text-white/40 capitalize">{activeTool}</span></span>
          <span className="text-[10px] text-white/25">Zoom: <span className="text-white/40">{Math.round(scale * 100)}%</span></span>
          {selectedObj && <span className="text-[10px] text-white/25">Selected: <span className="text-white/40">{selectedObj.type}</span></span>}
          <span className="ml-auto text-[10px] text-white/20">Press V·T·R·C to switch tools · Delete to remove</span>
        </div>
      </div>
    </>
  );
}
