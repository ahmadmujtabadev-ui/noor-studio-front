// components/editor/EditorToolbar.tsx
// Top toolbar: navigation, tool selection, add elements, zoom, save, export.

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  MousePointer2,
  Type,
  Square,
  Circle,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  BookOpen,
  Layers,
  Eye,
  Loader2,
} from "lucide-react";
import type { EditorTool } from "./FabricPageCanvas";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  title: string;
  activeTool: EditorTool;
  onToolChange: (t: EditorTool) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onExport: () => void;
  onExportEpub?: () => void;
  onBack: () => void;
  onPreview?: () => void;
  saving: boolean;
  exportingEpub?: boolean;
}

// ─── Tool buttons config ──────────────────────────────────────────────────────

const TOOLS: { id: EditorTool; icon: React.FC<{ className?: string }>; label: string; shortcut: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select", shortcut: "V" },
  { id: "text",   icon: Type,          label: "Text",   shortcut: "T" },
  { id: "rect",   icon: Square,        label: "Box",    shortcut: "R" },
  { id: "circle", icon: Circle,        label: "Circle", shortcut: "C" },
];

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-5 bg-white/10 mx-1" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EditorToolbar({
  title, activeTool, onToolChange,
  scale, onZoomIn, onZoomOut,
  onSave, onExport, onExportEpub, onBack,
  onPreview,
  saving, exportingEpub,
}: Props) {
  return (
    <div className="h-12 bg-[#13151a] border-b border-white/10 flex items-center gap-1 px-3 shrink-0 z-10">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="text-white/60 hover:text-white hover:bg-white/10 h-8 px-2.5"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        <span className="text-xs">Exit</span>
      </Button>

      <Divider />

      {/* Book title */}
      <div className="flex items-center gap-1.5 px-2">
        <Layers className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-sm font-semibold text-white/80 max-w-[200px] truncate">
          {title}
        </span>
      </div>

      <Divider />

      {/* Tool buttons */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ id, icon: Icon, label, shortcut }) => (
          <button
            key={id}
            onClick={() => onToolChange(id)}
            title={`${label} (${shortcut})`}
            className={cn(
              "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium transition-all",
              activeTool === id
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}

      </div>

      <Divider />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onZoomOut}
          title="Zoom out"
          className="h-8 w-8 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-mono text-white/40 w-12 text-center select-none">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          title="Zoom in"
          className="h-8 w-8 rounded-md flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={onSave}
          disabled={saving}
          className="h-8 px-3 text-white/70 hover:text-white hover:bg-white/10 text-xs"
        >
          <Save className="w-3.5 h-3.5 mr-1" />
          {saving ? "Saving…" : "Save"}
        </Button>

        {onPreview && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onPreview}
            className="h-8 px-3 text-[#1B6B5A] hover:text-white hover:bg-[#1B6B5A]/80 border border-[#1B6B5A]/40 text-xs"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Preview
          </Button>
        )}

        {onExportEpub && (
          <Button
            size="sm"
            onClick={onExportEpub}
            disabled={exportingEpub}
            className="h-8 px-3 bg-[#2D5A8E] hover:bg-[#2D5A8E]/90 text-xs"
          >
            {exportingEpub
              ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              : <BookOpen className="w-3.5 h-3.5 mr-1" />}
            EPUB
          </Button>
        )}

        <Button
          size="sm"
          onClick={onExport}
          className="h-8 px-3 bg-primary hover:bg-primary/90 text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Export PDF
        </Button>
      </div>
    </div>
  );
}
