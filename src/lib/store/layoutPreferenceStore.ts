import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PictureBookLayout =
  | "full_bleed"
  | "image_left_text_right"
  | "image_top_text_bottom"
  | "vignette";

export type ChapterBookLayout =
  | "two_column"
  | "text_inline_image"
  | "decorative_full_text";

export type LayoutPreference = PictureBookLayout | ChapterBookLayout;

interface LayoutPreferenceState {
  pictureLayout:  PictureBookLayout;
  chapterLayout:  ChapterBookLayout;
  setPictureLayout: (l: PictureBookLayout) => void;
  setChapterLayout: (l: ChapterBookLayout) => void;
}

export const useLayoutPreferenceStore = create<LayoutPreferenceState>()(
  persist(
    (set) => ({
      pictureLayout:    "full_bleed",
      chapterLayout:    "two_column",
      setPictureLayout: (l) => set({ pictureLayout: l }),
      setChapterLayout: (l) => set({ chapterLayout: l }),
    }),
    { name: "noorstudio-layout-pref" },
  ),
);
