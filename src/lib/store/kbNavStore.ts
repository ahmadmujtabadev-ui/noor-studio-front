import { create } from 'zustand';

interface KbNavState {
  activeWorkflow: string;   // "faith" | "story" | "visual" | "cover"
  activeSection:  string;   // section id
  setKbNav: (workflow: string, section: string) => void;
  resetKbNav: () => void;
}

export const useKbNavStore = create<KbNavState>((set) => ({
  activeWorkflow: 'faith',
  activeSection:  'islamicValues',
  setKbNav: (workflow, section) => set({ activeWorkflow: workflow, activeSection: section }),
  resetKbNav: () => set({ activeWorkflow: 'faith', activeSection: 'islamicValues' }),
}));
