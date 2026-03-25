// components/ReviewModal.tsx
// Single reusable modal for reviewing/editing any review unit (text, prompt, image)

import React, { useEffect, useState } from "react";
import { X, RefreshCw, CheckCircle2, Loader2, ChevronDown, ChevronUp, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { NodeStatus } from "@/lib/api/reviewTypes";

export interface ReviewModalField {
  key: string;
  label: string;
  value: string;
  rows?: number;
  placeholder?: string;
  readOnly?: boolean;
}

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status: NodeStatus;
  fields: ReviewModalField[];
  prompt?: string;
  versions?: Array<{ version: number; createdAt: string }>;
  isLoading?: boolean;
  loadingLabel?: string;
  onFieldChange?: (key: string, value: string) => void;
  onPromptChange?: (value: string) => void;
  onRegenerate?: () => void;
  onApprove?: () => void;
  approveLabel?: string;
  extra?: React.ReactNode;
}

const STATUS_STYLES: Record<NodeStatus, string> = {
  draft:     "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  generated: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  edited:    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  approved:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function ReviewModal({
  open, onClose, title, subtitle, status, fields, prompt,
  versions = [], isLoading = false, loadingLabel = "Working…",
  onFieldChange, onPromptChange, onRegenerate, onApprove,
  approveLabel = "Approve", extra,
}: ReviewModalProps) {
  const [showPrompt,   setShowPrompt]   = useState(false);
  const [showHistory,  setShowHistory]  = useState(false);

  // trap focus
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold truncate">{title}</h2>
              <Badge className={cn("text-xs capitalize", STATUS_STYLES[status])}>
                {status}
              </Badge>
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Fields */}
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {f.label}
              </Label>
              <Textarea
                value={f.value}
                onChange={(e) => onFieldChange?.(f.key, e.target.value)}
                rows={f.rows ?? 4}
                placeholder={f.placeholder}
                readOnly={f.readOnly}
                className={cn(f.readOnly && "opacity-60 cursor-not-allowed resize-none")}
              />
            </div>
          ))}

          {/* Extra content (e.g. variant grid) */}
          {extra}

          {/* Prompt editor */}
          {onPromptChange !== undefined && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowPrompt((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                <span>Edit AI Prompt</span>
                {showPrompt ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showPrompt && (
                <div className="px-4 pb-4">
                  <Textarea
                    value={prompt ?? ""}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={5}
                    placeholder="Override the AI prompt…"
                    className="font-mono text-xs"
                  />
                </div>
              )}
            </div>
          )}

          {/* Version history */}
          {versions.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setShowHistory((p) => !p)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Version History ({versions.length})
                </span>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showHistory && (
                <div className="px-4 pb-4 space-y-2">
                  {versions.map((v) => (
                    <div key={v.version} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">Version {v.version}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(v.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-border bg-muted/30 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <Button variant="outline" size="sm" disabled={isLoading} onClick={onRegenerate}>
                {isLoading ? (
                  <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />{loadingLabel}</>
                ) : (
                  <><RefreshCw className="w-3 h-3 mr-1.5" />Regenerate</>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            {onApprove && (
              <Button size="sm" disabled={isLoading || status === "approved"} onClick={onApprove}>
                <CheckCircle2 className="w-3 h-3 mr-1.5" />
                {approveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}