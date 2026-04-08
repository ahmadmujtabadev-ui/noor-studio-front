/**
 * bookTextStyleStore.ts
 * Persists the text style settings the user sets in the canvas editor
 * so the preview page can apply the same font/color to layouts.
 * Stored per-project in localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BookTextStyle {
  fontFamily: string;
  fontSize:   number;   // px – used to scale relative sizes in layouts
  textColor:  string;
  textAlign:  "left" | "center" | "right";
  bold:       boolean;
  italic:     boolean;
}

interface BookTextStyleState {
  /** Styles keyed by projectId so each book is independent */
  styles: Record<string, BookTextStyle>;
  setStyle: (projectId: string, style: Partial<BookTextStyle>) => void;
  getStyle: (projectId: string) => BookTextStyle;
}

const DEFAULT_STYLE: BookTextStyle = {
  fontFamily: "Baloo 2",
  fontSize:   20,
  textColor:  "#1a1a1a",
  textAlign:  "left",
  bold:       false,
  italic:     false,
};

export const useBookTextStyleStore = create<BookTextStyleState>()(
  persist(
    (set, get) => ({
      styles: {},
      setStyle: (projectId, style) =>
        set((s) => ({
          styles: {
            ...s.styles,
            [projectId]: { ...(s.styles[projectId] ?? DEFAULT_STYLE), ...style },
          },
        })),
      getStyle: (projectId) => get().styles[projectId] ?? DEFAULT_STYLE,
    }),
    { name: "noorstudio-text-style" },
  ),
);

export { DEFAULT_STYLE };
