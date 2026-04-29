import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export interface VisualOption {
  value: string;
  label: string;
  icon: ReactNode;
  sublabel?: string;
}

interface VisualPickerProps {
  options: VisualOption[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
  iconSize?: "sm" | "md" | "lg" | "xl" | "2xl";
  accent?: "primary" | "amber" | "blue" | "emerald";
  className?: string;
  allowDeselect?: boolean;
}

const ACCENT_RING = {
  primary: "ring-primary/60 border-primary shadow-primary/15",
  amber:   "ring-amber-400/60 border-amber-400 shadow-amber-200/60",
  blue:    "ring-blue-400/60 border-blue-400 shadow-blue-200/60",
  emerald: "ring-emerald-400/60 border-emerald-400 shadow-emerald-200/60",
};

const ACCENT_BADGE = {
  primary: "bg-slate-900",
  amber:   "bg-amber-700",
  blue:    "bg-blue-700",
  emerald: "bg-emerald-700",
};

const ACCENT_CHECK = {
  primary: "bg-primary",
  amber:   "bg-amber-500",
  blue:    "bg-blue-500",
  emerald: "bg-emerald-500",
};

// Icon area height by size
const ICON_H = { sm: "h-12", md: "h-16", lg: "h-20", xl: "h-32", "2xl": "h-44" };

export function VisualPicker({
  options,
  value,
  onChange,
  columns = 4,
  iconSize = "md",
  accent = "primary",
  className,
  allowDeselect = false,
}: VisualPickerProps) {
  const isMobile = useIsMobile();
  const effectiveCols = isMobile ? Math.min(columns, 3) : columns;

  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${effectiveCols}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(allowDeselect && isSelected ? "" : opt.value)}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200",
              "hover:scale-[1.03] active:scale-[0.97] hover:shadow-md",
              isSelected
                ? cn("border-2 shadow-lg ring-2", ACCENT_RING[accent])
                : "border-border/60 bg-white dark:bg-card hover:border-border"
            )}
          >
            {/* Illustration area — warm cream gradient background */}
            <div
              className={cn(
                "relative w-full flex items-center justify-center overflow-hidden",
                "bg-gradient-to-b from-amber-50 via-stone-50 to-orange-50/60",
                "dark:from-stone-900/60 dark:via-stone-800/40 dark:to-amber-950/30",
                ICON_H[iconSize],
                isSelected && "from-amber-100 via-amber-50 to-orange-50"
              )}
            >
              <div className="w-4/5 h-full flex items-center justify-center py-1">
                {opt.icon}
              </div>

              {/* Selected checkmark badge */}
              {isSelected && (
                <span
                  className={cn(
                    "absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center z-10 shadow-sm",
                    ACCENT_CHECK[accent]
                  )}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
            </div>

            {/* Label badge */}
            <div
              className={cn(
                "w-full px-1.5 py-2 text-center transition-colors",
                isSelected
                  ? cn("text-white text-xs font-bold", ACCENT_BADGE[accent])
                  : "bg-gray-100/80 dark:bg-muted/60 text-gray-600 dark:text-muted-foreground text-xs font-semibold"
              )}
            >
              <span className="truncate block leading-tight">{opt.label}</span>
              {opt.sublabel && (
                <span className="text-[10px] opacity-70 block truncate leading-tight">
                  {opt.sublabel}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
