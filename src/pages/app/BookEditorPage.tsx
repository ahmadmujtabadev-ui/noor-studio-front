// pages/app/BookEditorPage.tsx
// Full-screen Fabric.js canvas book editor.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { fabric } from "fabric";
import jsPDF from "jspdf";
import { useNavigate } from "react-router-dom";
import { useBookEditor } from "@/hooks/useBookEditor";
import { PageNavigator } from "@/components/editor/PageNavigator";
import { DesignPanel } from "@/components/editor/DesignPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import FabricPageCanvas, {
  FabricCanvasHandle,
  EditorTool,
  PAGE_W,
  PAGE_H,
} from "@/components/editor/FabricPageCanvas";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// ─── Keyboard shortcuts ───────────────────────────────────────────────────────

const TOOL_SHORTCUTS: Record<string, EditorTool> = {
  v: "select", V: "select",
  t: "text",   T: "text",
  r: "rect",   R: "rect",
  c: "circle", C: "circle",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookEditorPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    projectId,
    projectTitle,
    pages,
    currentPageIdx,
    setCurrentPageIdx,
    loading,
    error,
    updatePage,
    goBack,
  } = useBookEditor();

  const canvasRef = useRef<FabricCanvasHandle>(null);
  const prevPageIdxRef = useRef<number>(0);

  const [activeTool, setActiveTool] = useState<EditorTool>("select");
  const [selectedObj, setSelectedObj] = useState<fabric.Object | null>(null);
  const [scale, setScale] = useState(0.7);
  const [saving, setSaving] = useState(false);

  const currentPage = pages[currentPageIdx];

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const tool = TOOL_SHORTCUTS[e.key];
      if (tool) {
        setActiveTool(tool);
        canvasRef.current?.setTool(tool);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        canvasRef.current?.deleteSelected();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "=") {
        e.preventDefault();
        setScale((s) => Math.min(s + 0.1, 2));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        setScale((s) => Math.max(s - 0.1, 0.2));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Save current page canvas state before switching ────────────────────────
  const saveCurrentPageState = useCallback(() => {
    const idx = prevPageIdxRef.current;
    const json = canvasRef.current?.toJSON();
    const thumb = canvasRef.current?.toDataURL();
    if (json && pages[idx]) {
      updatePage(idx, { fabricJson: json, thumbnail: thumb });
    }
  }, [pages, updatePage]);

  const handlePageSelect = useCallback(
    (idx: number) => {
      saveCurrentPageState();
      prevPageIdxRef.current = idx;
      setCurrentPageIdx(idx);
      setSelectedObj(null);
    },
    [saveCurrentPageState, setCurrentPageIdx]
  );

  // Keep prevPageIdxRef in sync
  useEffect(() => {
    prevPageIdxRef.current = currentPageIdx;
  }, [currentPageIdx]);

  // ── Tool change ────────────────────────────────────────────────────────────
  const handleToolChange = useCallback((t: EditorTool) => {
    setActiveTool(t);
    canvasRef.current?.setTool(t);
  }, []);

  // ── Canvas events ──────────────────────────────────────────────────────────
  const handleSelectionChange = useCallback((obj: fabric.Object | null) => {
    setSelectedObj(obj);
  }, []);

  const handleCanvasChange = useCallback(
    (json: object, thumbnail: string) => {
      updatePage(currentPageIdx, { fabricJson: json, thumbnail });
    },
    [currentPageIdx, updatePage]
  );

  // ── Save (stores in-memory; in a real app POST to backend) ────────────────
  const handleSave = useCallback(async () => {
    saveCurrentPageState();
    setSaving(true);
    // Simulate async save (replace with real API call to persist fabricJson)
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast({ title: "Layout saved ✓" });
  }, [saveCurrentPageState, toast]);

  // ── Export to PDF ─────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    saveCurrentPageState();
    toast({ title: "Exporting…", description: "Rendering all pages to PDF" });

    try {
      // PDF dimensions in mm (A5 book size: 148 × 210mm)
      const pdfW = 148;
      const pdfH = 210;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [pdfW, pdfH] as [number, number] });

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (i > 0) pdf.addPage([pdfW, pdfH], "portrait");

        // Use saved thumbnail OR generate from canvas
        let dataUrl = page.thumbnail || "";

        if (!dataUrl && page.imageUrl) {
          // Fallback: use raw illustration
          dataUrl = page.imageUrl;
        }

        if (dataUrl) {
          pdf.addImage(dataUrl, "JPEG", 0, 0, pdfW, pdfH);
        }
      }

      pdf.save(`${projectTitle || "book"}.pdf`);
      toast({ title: "PDF exported ✓" });
    } catch (err) {
      toast({
        title: "Export failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    }
  }, [pages, projectTitle, saveCurrentPageState, toast]);

  // ── Handle image upload ────────────────────────────────────────────────────
  const handleImageUpload = useCallback((url: string) => {
    canvasRef.current?.addImageFromUrl(url);
    setActiveTool("select");
    canvasRef.current?.setTool("select");
  }, []);

  // ── Canvas handle for design panel ────────────────────────────────────────
  const canvas = canvasRef.current?.getCanvas() ?? null;

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Loading Editor</p>
            <p className="text-white/40 text-sm mt-1">Preparing your book pages…</p>
          </div>
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
          <Button onClick={goBack} variant="outline" className="text-white border-white/20">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!pages.length) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="text-center">
          <p className="text-white/50">No pages to display.</p>
          <Button onClick={goBack} variant="ghost" className="mt-4 text-white/60">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f1117] overflow-hidden select-none">
      {/* ── Top Toolbar ─────────────────────────────────────────────────────── */}
      <EditorToolbar
        title={projectTitle}
        activeTool={activeTool}
        onToolChange={handleToolChange}
        scale={scale}
        onZoomIn={() => setScale((s) => Math.min(s + 0.1, 2))}
        onZoomOut={() => setScale((s) => Math.max(s - 0.1, 0.25))}
        onSave={handleSave}
        onExport={handleExport}
        onBack={goBack}
        onImageUpload={handleImageUpload}
        onPreview={() => navigate(`/app/projects/${projectId}/preview`)}
        saving={saving}
      />

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Page Navigator ──────────────────────────────────────────────── */}
        <PageNavigator
          pages={pages}
          currentIdx={currentPageIdx}
          onSelect={handlePageSelect}
        />

        {/* ── Canvas Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-[#0f1117] flex items-start justify-center p-8">
          {/* Canvas wrapper — centered, with shadow */}
          <div className="relative" style={{ marginTop: "auto", marginBottom: "auto" }}>
            {/* Page label */}
            <div className="absolute -top-7 left-0 right-0 flex items-center justify-center gap-2 pointer-events-none">
              <span className="text-xs text-white/30 font-medium">
                {currentPage.label}
              </span>
              <span className="text-white/15">·</span>
              <span className="text-xs text-white/20">
                {currentPageIdx + 1} / {pages.length}
              </span>
            </div>

            {/* Drop shadow around canvas */}
            {/* No key prop — same FabricPageCanvas instance loads new pages via effect */}
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                width: PAGE_W * scale,
                height: PAGE_H * scale,
                boxShadow: "0 20px 80px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)",
              }}
            >
              <FabricPageCanvas
                ref={canvasRef}
                page={currentPage}
                scale={scale}
                tool={activeTool}
                onSelectionChange={handleSelectionChange}
                onCanvasChange={handleCanvasChange}
              />
            </div>

            {/* Page arrow navigation */}
            <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-4 pointer-events-auto">
              <button
                onClick={() => handlePageSelect(Math.max(0, currentPageIdx - 1))}
                disabled={currentPageIdx === 0}
                className="text-xs text-white/30 hover:text-white/60 disabled:opacity-20 transition px-3 py-1 rounded-full hover:bg-white/5"
              >
                ← Prev
              </button>
              <span className="text-xs text-white/20">
                {currentPageIdx + 1} of {pages.length}
              </span>
              <button
                onClick={() =>
                  handlePageSelect(Math.min(pages.length - 1, currentPageIdx + 1))
                }
                disabled={currentPageIdx === pages.length - 1}
                className="text-xs text-white/30 hover:text-white/60 disabled:opacity-20 transition px-3 py-1 rounded-full hover:bg-white/5"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ── Design Panel ────────────────────────────────────────────────── */}
        <DesignPanel
          selectedObj={selectedObj}
          canvas={canvas}
          onDelete={() => canvasRef.current?.deleteSelected()}
          onBringForward={() => canvasRef.current?.bringForward()}
          onSendBackward={() => canvasRef.current?.sendBackward()}
        />
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────────── */}
      <div className="h-6 bg-[#13151a] border-t border-white/5 flex items-center px-4 gap-4">
        <span className="text-[10px] text-white/25">
          Tool: <span className="text-white/40 capitalize">{activeTool}</span>
        </span>
        <span className="text-[10px] text-white/25">
          Zoom: <span className="text-white/40">{Math.round(scale * 100)}%</span>
        </span>
        {selectedObj && (
          <span className="text-[10px] text-white/25">
            Selected: <span className="text-white/40">{selectedObj.type}</span>
          </span>
        )}
        <span className="ml-auto text-[10px] text-white/20">
          Press V·T·R·C to switch tools · Delete to remove
        </span>
      </div>
    </div>
  );
}
