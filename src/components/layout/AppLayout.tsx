import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu, X, Zap, AlertTriangle, BookCopy, ChevronDown, History, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCredits } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/useLanguage";
import { cn } from "@/lib/utils";
import { CreditHistoryPanel } from "@/components/shared/CreditHistoryPanel";
import { ProductionBoardPanel } from "@/components/shared/ProductionBoardPanel";
import { useJourney } from "@/hooks/useJourney";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function CreditIndicator({ current }: { current: number }) {
  const isLow = current < 10;
  return (
    <div
      className={cn(
        "group flex h-11 items-center gap-3 rounded-xl border px-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        isLow
          ? "border-red-200 bg-red-50 text-red-700 hover:border-red-300"
          : "border-amber-200 bg-gradient-to-r from-amber-50 via-white to-emerald-50 text-slate-800 hover:border-primary/45"
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg",
          isLow ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
        )}
      >
        <Zap className="h-4 w-4" />
      </span>
      <span className="flex min-w-0 flex-col items-start leading-none">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Credits</span>
        <span className="mt-1 flex items-baseline gap-1">
          <span className={cn("text-base font-extrabold", isLow ? "text-red-700" : "text-slate-900")}>{current}</span>
          <span className="text-[11px] font-medium text-muted-foreground">available</span>
        </span>
      </span>
      <span className="ml-1 hidden items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/15 lg:flex">
        <History className="h-3.5 w-3.5" />
        History
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </div>
  );
}

export function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isRTL, t } = useLanguage();
  const [mobileSidebarOpen, setMobileSidebarOpen]   = useState(false);
  const [creditPanelOpen, setCreditPanelOpen]       = useState(false);
  const [productionOpen, setProductionOpen]         = useState(false);
  const credits     = useCredits();
  const isLowCredits = credits < 10;

  // Journey summary for header button
  const { data: journey } = useJourney();
  const activeSlot   = journey?.slots[journey.activeSlotIdx];
  const limitLabel   = journey ? (journey.planLimit === -1 ? "∞" : String(journey.planLimit)) : "…";
  const doneCount    = journey?.slots.filter((s) => s.isComplete).length ?? 0;
  const filledCount  = journey?.slots.filter((s) => s.projectId).length ?? 0;
  const currentLabel = activeSlot?.currentStage
    ? activeSlot.stageMeta?.[activeSlot.currentStage]?.label
    : activeSlot?.isComplete ? "Done" : null;

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile drawer */}
      <div className="md:hidden">
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <div
          className={cn(
            "[&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out [&>aside]:z-50 [&>aside]:w-64 [&>aside]:shadow-xl",
            isRTL ? "[&>aside]:translate-x-full [&>aside]:-translate-x-0" : "[&>aside]:-translate-x-full",
            mobileSidebarOpen && (isRTL ? "[&>aside]:-translate-x-0" : "[&>aside]:translate-x-0")
          )}
        >
          <AppSidebar />
          {mobileSidebarOpen && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "fixed top-3 z-[60] bg-background/80 backdrop-blur border",
                isRTL ? "right-[15.25rem]" : "left-[15.25rem]"
              )}
              onClick={() => setMobileSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Top Bar */}
      <header
        className={cn(
          "fixed top-0 h-16 bg-background/80 backdrop-blur-lg border-b border-border z-30 flex items-center justify-between px-4 md:px-6",
          isRTL ? "right-0 md:right-64 left-0 md:left-auto" : "left-0 md:left-64 right-0 md:right-auto"
        )}
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="relative max-w-md flex-1">
            <Search
              className={cn(
                "absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground",
                isRTL ? "right-3" : "left-3"
              )}
            />
            <Input
              placeholder={t("searchPlaceholder")}
              className={cn(isRTL ? "pr-10" : "pl-10", "bg-muted/50 border-border/50")}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* ── Production board button ── */}
          <button
            onClick={() => setProductionOpen(true)}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
            title="Open production board"
          >
            <BookCopy className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">
              {filledCount}/{limitLabel}
            </span>
            {currentLabel && (
              <>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-xs text-primary font-medium hidden lg:inline truncate max-w-[80px]">
                  {currentLabel}
                </span>
              </>
            )}
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {/* ── Credits ── */}
          <button
            type="button"
            onClick={() => setCreditPanelOpen(true)}
            className="hidden cursor-pointer rounded-xl md:flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            title={`${credits} credits available — click to view history`}
          >
            <CreditIndicator current={credits} />
          </button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
          </Button>
        </div>
      </header>

      {/* Credits slide-over panel */}
      <CreditHistoryPanel open={creditPanelOpen} onClose={() => setCreditPanelOpen(false)} />

      {/* Production board slide-over panel */}
      <ProductionBoardPanel open={productionOpen} onClose={() => setProductionOpen(false)} />

      {/* Main Content */}
      <main className={cn("pt-16 min-h-screen", isRTL ? "md:mr-64" : "md:ml-64")}>

        {/* Low-credit persistent banner */}
        {isLowCredits && (
          <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You have <strong>{credits} credits</strong> left — top up to keep creating.</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 h-7 text-xs shrink-0"
              onClick={() => navigate("/app/billing")}
            >
              Top Up
            </Button>
          </div>
        )}
        {(title || actions) && (
          <div className="border-b border-border bg-background">
            <div className="px-6 py-6 flex items-center justify-between">
              <div>
                {title && <h1 className="text-2xl font-bold text-foreground">{title}</h1>}
                {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
