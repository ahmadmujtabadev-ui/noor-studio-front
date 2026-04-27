import { create } from 'zustand';

interface KbNavState {
  activeWorkflow: string;
  activeSection:  string;
  completedWorkflows: Set<string>;
  setKbNav: (workflow: string, section: string) => void;
  setCompletedWorkflows: (ids: string[]) => void;
  resetKbNav: () => void;
}

export const useKbNavStore = create<KbNavState>((set) => ({
  activeWorkflow: 'faith',
  activeSection:  'islamicValues',
  completedWorkflows: new Set(),
  setKbNav: (workflow, section) => set({ activeWorkflow: workflow, activeSection: section }),
  setCompletedWorkflows: (ids) => set({ completedWorkflows: new Set(ids) }),
  resetKbNav: () => set({ activeWorkflow: 'faith', activeSection: 'islamicValues', completedWorkflows: new Set() }),
}));
