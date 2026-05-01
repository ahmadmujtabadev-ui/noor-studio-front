import React from "react";
import { X, Zap, TrendingDown, TrendingUp, ExternalLink, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTransactions } from "@/hooks/usePayments";
import { useCredits } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { CreditTransaction } from "@/lib/api/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) return `${Math.floor(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.floor(diffH)}h ago`;
  if (diffH < 48) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function opIcon(description: string): string {
  const d = description.toLowerCase();
  if (d.includes("story") || d.includes("outline")) return "📖";
  if (d.includes("illustration") || d.includes("image")) return "🎨";
  if (d.includes("cover")) return "📚";
  if (d.includes("portrait") || d.includes("character")) return "👤";
  if (d.includes("prose") || d.includes("chapter") || d.includes("text")) return "✍️";
  if (d.includes("pose")) return "🕺";
  if (d.includes("export")) return "📤";
  if (d.includes("purchase") || d.includes("top")) return "💳";
  if (d.includes("bonus") || d.includes("reward")) return "🎁";
  return "⚡";
}

function spentThisWeek(txns: CreditTransaction[]): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return txns
    .filter((t) => t.type === "debit" && new Date(t.createdAt) >= cutoff)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

function spentToday(txns: CreditTransaction[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return txns
    .filter((t) => t.type === "debit" && new Date(t.createdAt) >= today)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CreditHistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CreditHistoryPanel({ open, onClose }: CreditHistoryPanelProps) {
  const navigate = useNavigate();
  const credits = useCredits();
  const { data: txns = [], isLoading } = useTransactions({ limit: 50 });

  const todaySpend  = spentToday(txns);
  const weekSpend   = spentThisWeek(txns);
  const isLow       = credits < 10;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-sm bg-background border-l border-border shadow-2xl z-50",
          "flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Credits</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-5 py-4 space-y-5">

            {/* Balance card */}
            <div className={cn(
              "rounded-2xl p-4 space-y-1",
              isLow
                ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                : "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800"
            )}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Available</p>
              <div className="flex items-end gap-2">
                <span className={cn(
                  "text-4xl font-black",
                  isLow ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                )}>{credits}</span>
                <span className="text-sm text-muted-foreground mb-1">credits</span>
              </div>
              {isLow && (
                <div className="flex items-center gap-1.5 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Running low — top up to avoid interruptions
                  </p>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today</p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-lg font-bold">{todaySpend}</span>
                  <span className="text-xs text-muted-foreground">spent</span>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-0.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">This Week</p>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-lg font-bold">{weekSpend}</span>
                  <span className="text-xs text-muted-foreground">spent</span>
                </div>
              </div>
            </div>

            {/* Top-up button */}
            <Button
              className="w-full"
              onClick={() => { navigate("/app/billing"); onClose(); }}
            >
              <Zap className="w-4 h-4 mr-2" />
              Get More Credits
              <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-70" />
            </Button>

            {/* Transaction history */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</p>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : txns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No transactions yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {txns.map((t) => (
                    <div
                      key={t._id || t.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-lg shrink-0">{opIcon(t.description)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground leading-snug truncate">
                          {t.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatDate(t.createdAt)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className={cn(
                          "text-sm font-bold tabular-nums",
                          t.type === "credit" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                          {t.type === "credit" ? "+" : "−"}{Math.abs(t.amount)}
                        </span>
                        {t.refType && t.refType !== "project" && (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4">
                            {t.refType}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </ScrollArea>
      </div>
    </>
  );
}
