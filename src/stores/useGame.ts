import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface GameState {
  phase: string;
  start: any;
}

const useGame = create<GameState>()(
  devtools((set) => ({
    phase: "welcome",
    start: () =>
      set((state) => {
        if (state.phase === "welcome") {
          return { phase: "game" };
        }

        return {};
      }),
  })),
);

export default useGame;
