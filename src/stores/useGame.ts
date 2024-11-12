import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as THREE from "three";

const DEBUG = process.env.NODE_ENV !== "production";

export type GamePhase = "welcome" | "space" | "landing" | "landed";

export type LandingState = "in_progress" | "success" | "crash";

interface GameState {
  phase: GamePhase;
  seed: number;
  landingTransitionComplete: boolean;
  lastKnownPosition: THREE.Vector3;
  start: () => void;
  restart: () => void;
  setPhase: (phase: GamePhase) => void;
  startLandingSequence: () => void;
  completeLandingTransition: () => void;
  resetLandingTransition: () => void;
  setLastKnownPosition: (position: THREE.Vector3) => void;
  landingState: LandingState;
  setLandingState: (state: LandingState) => void;
  isLandingPaused: boolean;
}

const useGame = create<GameState>()(
  devtools((set) => ({
    phase: "welcome",
    seed: 0,
    landingTransitionComplete: false,
    lastKnownPosition: new THREE.Vector3(),

    start: () =>
      set((state) => {
        if (state.phase === "welcome") {
          return { phase: "space" };
        }
        return {};
      }),

    restart: () => {
      set({
        phase: "space",
        landingState: "in_progress",
        landingTransitionComplete: false,
        lastKnownPosition: new THREE.Vector3(0, 0, 5000),
        seed: Math.random(),
      });
    },

    setPhase: (phase) => set({ phase }),

    startLandingSequence: () => {
      if (DEBUG) console.log("Starting landing sequence");
      set({
        phase: "landing",
        landingTransitionComplete: false,
      });
    },

    completeLandingTransition: () => {
      if (DEBUG) console.log("Landing transition complete");
      set({ landingTransitionComplete: true });
    },

    resetLandingTransition: () => {
      if (DEBUG) console.log("Resetting landing transition");
      set({ landingTransitionComplete: false });
    },

    setLastKnownPosition: (position) => {
      if (DEBUG) console.log("Setting last known position", position);
      set({ lastKnownPosition: position });
    },

    landingState: "in_progress",
    isLandingPaused: true,
    setLandingState: (state) => {
      if (DEBUG) console.log("Setting landing state", state);
      set({ landingState: state });
    },
    setLandingPaused: (paused: boolean) => set({ isLandingPaused: paused }),
  })),
);

export default useGame;
