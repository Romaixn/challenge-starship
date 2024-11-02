import { useEffect, useState } from "react";
import { create } from "zustand";

interface KeyTrackingState {
  pressedKeys: Set<string>;
  markKeyAsPressed: (key: string) => void;
  resetKeys: () => void;
}

const useKeyTrackingStore = create<KeyTrackingState>((set) => ({
  pressedKeys: new Set(),
  markKeyAsPressed: (key) =>
    set((state) => ({
      pressedKeys: new Set([...state.pressedKeys, key]),
    })),
  resetKeys: () => set({ pressedKeys: new Set() }),
}));

const REQUIRED_KEYS = ["up", "down", "left", "right", "boost"];

export const useKeyboardTracker = () => {
  const [shouldShowHUD, setShouldShowHUD] = useState(true);
  const { pressedKeys, markKeyAsPressed } = useKeyTrackingStore();

  useEffect(() => {
    // Check if all required keys have been pressed
    const allKeysPressed = REQUIRED_KEYS.every((key) => pressedKeys.has(key));
    if (allKeysPressed) {
      // Add a small delay before hiding the HUD
      const timeout = setTimeout(() => {
        setShouldShowHUD(false);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [pressedKeys]);

  const trackKeyPress = (key: string) => {
    if (REQUIRED_KEYS.includes(key) && !pressedKeys.has(key)) {
      markKeyAsPressed(key);
    }
  };

  return {
    shouldShowHUD,
    trackKeyPress,
    pressedKeys,
  };
};
