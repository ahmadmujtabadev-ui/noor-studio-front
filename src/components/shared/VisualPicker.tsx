import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

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
  iconSize?: "sm" | "md" | "lg";
  accent?: "primary" | "amber" | "blue" | "emerald";
  className?: string;
  allowDeselect?: boolean;
}

const ACCENT = {
  primary: {
    selected: "border-primary bg-primary/8 shadow-sm shadow-primary/20",
    label: "text-primary",
    check: "bg-primary",
  },
  amber: {
    selected: "border-amber-500 bg-amber-50 shadow-sm shadow-amber-200",
    label: "text-amber-700",
    check: "bg-amber-500",
  },
  blue: {
    selected: "border-blue-500 bg-blue-50 shadow-sm shadow-blue-200",
    label: "text-blue-700",
    check: "bg-blue-500",
  },
  emerald: {
    selected: "border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-200",
    label: "text-emerald-700",
    check: "bg-emerald-500",
  },
};

const ICON_SIZES = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-20 h-20" };

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
  const ac = ACCENT[accent];
  return (
    <div
      className={cn("grid gap-2", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(allowDeselect && isSelected ? "" : opt.value)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all hover:scale-[1.03] active:scale-[0.98]",
              isSelected
                ? ac.selected
                : "border-border hover:border-primary/40 bg-white dark:bg-muted/40"
            )}
          >
            <div className={cn("relative flex items-center justify-center rounded-lg overflow-hidden bg-transparent", ICON_SIZES[iconSize])}>
              {opt.icon}
              {isSelected && (
                <span
                  className={cn(
                    "absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center z-10",
                    ac.check
                  )}
                >
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[11px] font-semibold text-center leading-tight w-full truncate",
                isSelected ? ac.label : "text-muted-foreground"
              )}
            >
              {opt.label}
            </span>
            {opt.sublabel && (
              <span className="text-[9px] text-muted-foreground/70 text-center leading-tight w-full truncate -mt-1">
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
