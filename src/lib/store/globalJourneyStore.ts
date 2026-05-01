import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GlobalJourneyState {
  kbVisited: boolean;
  setKbVisited: () => void;
}

export const useGlobalJourneyStore = create<GlobalJourneyState>()(
  persist(
    (set) => ({
      kbVisited: false,
      setKbVisited: () => set({ kbVisited: true }),
    }),
    { name: "noorstudio-global-journey" }
  )
);
