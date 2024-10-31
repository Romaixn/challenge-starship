import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface SoundState {
  soundPlaying: boolean;
  toggleSound: () => void;
}

const useSound = create<SoundState>()(
  devtools(
    persist(
      (set) => ({
        soundPlaying: true,
        toggleSound: () => set((state) => ({ soundPlaying: !state.soundPlaying })),
      }),
      {
        name: "sound-storage",
      }
    )
  )
)

export default useSound;