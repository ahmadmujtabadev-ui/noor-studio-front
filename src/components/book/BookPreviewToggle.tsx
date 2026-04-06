// src/components/book/BookPreviewToggle.tsx
// Toggle between CSS 3D book view and flat wrap view.
// No lazy loading needed — both components are pure CSS/React.

import React, { useState } from "react";
import { Box, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookPreviewFlat } from "./BookPreviewFlat";
import { BookPreview3D } from "./BookPreview3D";
import type { BookPreviewProps, PreviewDisplayMode } from "@/types/cover.types";

interface BookPreviewToggleProps extends BookPreviewProps {
  defaultMode?: PreviewDisplayMode;
  onModeChange?: (mode: PreviewDisplayMode) => void;
}

export function BookPreviewToggle({
  frontUrl,
  spineUrl,
  backUrl,
  bookWidth  = 6,
  bookHeight = 9,
  spineWidth = 0.5,
  className,
  defaultMode   = "flat",
  onModeChange,
}: BookPreviewToggleProps) {
  const [mode, setMode] = useState<PreviewDisplayMode>(defaultMode);

  const switchMode = (next: PreviewDisplayMode) => {
    setMode(next);
    onModeChange?.(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Toggle pill */}
      <div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/30 p-0.5 w-fit">
        {(["flat", "3d"] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={cn(
              "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-all",
              mode === m
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m === "3d"
              ? <Box className="w-3.5 h-3.5" />
              : <LayoutTemplate className="w-3.5 h-3.5" />
            }
            {m === "3d" ? "3D View" : "Flat View"}
          </button>
        ))}
      </div>

      {mode === "3d" ? (
        <BookPreview3D
          frontUrl={frontUrl}
          spineUrl={spineUrl}
          backUrl={backUrl}
          bookWidth={bookWidth}
          bookHeight={bookHeight}
          spineWidth={spineWidth}
        />
      ) : (
        <BookPreviewFlat
          frontUrl={frontUrl}
          spineUrl={spineUrl}
          backUrl={backUrl}
          bookWidth={bookWidth}
          bookHeight={bookHeight}
          spineWidth={spineWidth}
        />
      )}
    </div>
  );
}
