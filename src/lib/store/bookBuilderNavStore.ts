import { create } from 'zustand';

interface BookBuilderNavState {
  step: number;
  completedSteps: number[];
  isChapterBook: boolean;
  setBookNav: (step: number, completedSteps: number[], isChapterBook: boolean) => void;
  resetBookNav: () => void;
}

export const useBookBuilderNavStore = create<BookBuilderNavState>((set) => ({
  step: 1,
  completedSteps: [],
  isChapterBook: false,
  setBookNav: (step, completedSteps, isChapterBook) => set({ step, completedSteps, isChapterBook }),
  resetBookNav: () => set({ step: 1, completedSteps: [], isChapterBook: false }),
}));
