// pages/app/BookEditorPage.tsx
// Full-screen Fabric.js canvas book editor.
//
// FIX CHANGELOG:
// ── Fix 3 (style persistence): handleCanvasChange now receives fresh json/thumb
//    from FabricPageCanvas.fireChange() and builds nextPages from that instead
//    of calling canvasRef.current?.toJSON() again (which was racing).
//    Also added `fabricCanvas` state refresh on every page switch so DesignPanel
//    always holds a live canvas reference.

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { fabric } from "fabric";
import { useNavigate } from "react-router-dom";
import { exportBookEpub } from "@/lib/exportBookEpub";
import { useBookEditor } from "@/hooks/useBookEditor";
import { PageNavigator } from "@/components/editor/PageNavigator";
import { DesignPanel } from "@/components/editor/DesignPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { ElementsPanel } from "@/components/editor/ElementsPanel";
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
  l: "line",   L: "line",
  s: "star",   S: "star",
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
    saveAllPages,
    autoSave,
    goBack,
  } = useBookEditor();

  const canvasRef       = useRef<FabricCanvasHandle>(null);
  const prevPageIdxRef  = useRef<number>(0);

  const [activeTool,    setActiveTool]    = useState<EditorTool>("select");
  const [selectedObj,   setSelectedObj]   = useState<fabric.Object | null>(null);
  const [scale,         setScale]         = useState(0.7);
  const [saving,        setSaving]        = useState(false);
  const [exportingEpub, setExportingEpub] = useState(false);

  // ── FIX 3a: Store fabricCanvas in state so DesignPanel re-renders reactively
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  const currentPage = pages[currentPageIdx];

  // ── FIX 3b: Keep a stable ref to current pages so handleCanvasChange
  //    can build nextPages without closing over a stale snapshot.
  //    Using a ref (not state) avoids unnecessary re-renders.
  const pagesRef = useRef(pages);
  useEffect(() => { pagesRef.current = pages; }, [pages]);

  const currentPageIdxRef = useRef(currentPageIdx);
  useEffect(() => { currentPageIdxRef.current = currentPageIdx; }, [currentPageIdx]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const tool = TOOL_SHORTCUTS[e.key];
      if (tool) {
        setActiveTool(tool);
        canvasRef.current?.setTool(tool);
        if (tool === "line") canvasRef.current?.addLine();
        if (tool === "star") canvasRef.current?.addStar();
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

  // ── Grab fabric.Canvas after mount and store in state ─────────────────────
  useEffect(() => {
    const id = setTimeout(() => {
      const fc = canvasRef.current?.getCanvas() ?? null;
      setFabricCanvas(fc);
    }, 100);
    return () => clearTimeout(id);
  }, []);

  // ── Refresh fabricCanvas ref on every page switch ──────────────────────────
  //    DesignPanel needs the same canvas instance that FabricPageCanvas uses.
  //    Since the canvas element is reused (not remounted), this is safe.
  useEffect(() => {
    const id = setTimeout(() => {
      const fc = canvasRef.current?.getCanvas() ?? null;
      setFabricCanvas(fc);
    }, 150);
    return () => clearTimeout(id);
  }, [currentPageIdx]);

  // ── Save current page canvas state before switching ────────────────────────
  const saveCurrentPageState = useCallback(() => {
    const idx  = prevPageIdxRef.current;
    const json  = canvasRef.current?.toJSON();
    const thumb = canvasRef.current?.toDataURL();
    if (json && pagesRef.current[idx]) {
      updatePage(idx, { fabricJson: json, thumbnail: thumb });
    }
  }, [updatePage]);

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

  // ── FIX 3c: handleCanvasChange — use json/thumb passed in from fireChange ──
  //
  // Previously this function re-called canvasRef.current?.toJSON() internally,
  // which raced against the already-captured json in FabricPageCanvas.fireChange().
  // Now we trust the json/thumb arguments (which ARE the current canvas state)
  // and build nextPages from pagesRef (always fresh via the ref above).
  //
  // This means autoSave always receives the correct fabricJson for the current
  // page, so styles are persisted on the next API call.

  const handleCanvasChange = useCallback(
    (json: object, thumbnail: string) => {
      const idx   = currentPageIdxRef.current;
      const pages = pagesRef.current;

      // Extract text edits from canvas objects so page.text stays in sync
      const objects   = (json as any)?.objects ?? [];
      const bodyLeft  = objects.find((o: any) => o._role === "body-text");
      const bodyRight = objects.find((o: any) => o._role === "body-text-right");
      const titleObj  = objects.find((o: any) => o._role === "title" || o._role === "chapter-title");

      const updates: Parameters<typeof updatePage>[1] = { fabricJson: json, thumbnail };

      if (bodyLeft?.text && bodyRight?.text) {
        updates.text = `${bodyLeft.text} ${bodyRight.text}`;
      } else if (bodyLeft?.text) {
        updates.text = bodyLeft.text;
      }
      if (titleObj?.text && pages[idx]?.type === "front-cover") {
        updates.title = titleObj.text;
      }

      // Update React state for the current page
      updatePage(idx, updates);

      // Build nextPages with the LIVE json already baked in (not from stale state)
      // This is what we pass to autoSave — it must include the just-made change.
      const nextPages = pages.map((p, i) =>
        i === idx ? { ...p, ...updates } : p
      );
      autoSave(nextPages);
    },
    // stable: updatePage and autoSave are stable refs from useBookEditor
    [updatePage, autoSave]
  );

  // ── Save (explicit — Save button) ──────────────────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const json  = canvasRef.current?.toJSON();
      const thumb = canvasRef.current?.toDataURL();

      const pagesToSave = pagesRef.current.map((p, i) => {
        if (i !== currentPageIdxRef.current || !json) return p;

        const objects   = (json as any)?.objects ?? [];
        const bodyLeft  = objects.find((o: any) => o._role === "body-text");
        const bodyRight = objects.find((o: any) => o._role === "body-text-right");
        const titleObj  = objects.find((o: any) => o._role === "title" || o._role === "chapter-title");

        let text  = p.text;
        let title = p.title;
        if (bodyLeft?.text && bodyRight?.text) text = `${bodyLeft.text} ${bodyRight.text}`;
        else if (bodyLeft?.text) text = bodyLeft.text;
        if (titleObj?.text && p.type === "front-cover") title = titleObj.text;

        return { ...p, fabricJson: json, thumbnail: thumb, text, title };
      });

      await saveAllPages(pagesToSave);

      const idx = currentPageIdxRef.current;
      if (json) updatePage(idx, {
        fabricJson: json,
        thumbnail:  thumb,
        ...(pagesToSave[idx]?.text  !== pagesRef.current[idx]?.text  && { text:  pagesToSave[idx].text }),
        ...(pagesToSave[idx]?.title !== pagesRef.current[idx]?.title && { title: pagesToSave[idx].title }),
      });

      toast({ title: "Saved ✓", description: "All pages saved to your account" });
    } catch {
      toast({ title: "Save failed", description: "Could not reach the server", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [saveAllPages, updatePage, toast]);

  // ── Export to PDF ──────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    saveCurrentPageState();
    toast({ title: "Exporting…", description: "Rendering all pages to PDF" });
    try {
      const { exportBookPdf } = await import("@/lib/exportBookPdf");
      await exportBookPdf(pagesRef.current, projectTitle, {
        projectId: projectId ?? "",
        onProgress: (cur, total) => {
          if (cur === total) toast({ title: "PDF exported ✓" });
        },
      });
    } catch (err) {
      toast({ title: "Export failed", description: (err as Error).message, variant: "destructive" });
    }
  }, [projectTitle, projectId, saveCurrentPageState, toast]);

  // ── EPUB export ────────────────────────────────────────────────────────────
  const handleExportEpub = useCallback(async () => {
    saveCurrentPageState();
    setExportingEpub(true);
    toast({ title: "Generating EPUB…", description: "Building e-book file" });
    try {
      await exportBookEpub(pagesRef.current, projectTitle, {
        onProgress: (cur, total) => {
          if (cur === total) toast({ title: "EPUB exported ✓" });
        },
      });
    } catch (err) {
      toast({
        title: "EPUB export failed",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setExportingEpub(false);
    }
  }, [projectTitle, saveCurrentPageState, toast]);

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImageUpload = useCallback((url: string) => {
    canvasRef.current?.addImageFromUrl(url);
    setActiveTool("select");
    canvasRef.current?.setTool("select");
  }, []);

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
        onExportEpub={handleExportEpub}
        exportingEpub={exportingEpub}
        onBack={goBack}
        onPreview={() => navigate(`/app/projects/${projectId}/preview`)}
        saving={saving}
      />

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Elements Panel ──────────────────────────────────────────────── */}
        <ElementsPanel
          canvasRef={canvasRef}
          activeTool={activeTool}
          onToolChange={handleToolChange}
          onImageUpload={handleImageUpload}
        />

        {/* ── Page Navigator ──────────────────────────────────────────────── */}
        <PageNavigator
          pages={pages}
          currentIdx={currentPageIdx}
          onSelect={handlePageSelect}
        />

        {/* ── Canvas Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto bg-[#0f1117] flex items-start justify-center p-8">
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

            {/* Canvas wrapper */}
            <div
              className="relative rounded-sm overflow-hidden"
              style={{
                width: PAGE_W * scale,
                height: PAGE_H * scale,
                boxShadow:
                  "0 20px 80px rgba(0,0,0,0.8), 0 4px 20px rgba(0,0,0,0.6)",
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
                onClick={() =>
                  handlePageSelect(Math.max(0, currentPageIdx - 1))
                }
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
                  handlePageSelect(
                    Math.min(pages.length - 1, currentPageIdx + 1)
                  )
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
          canvas={fabricCanvas}
          projectId={projectId}
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