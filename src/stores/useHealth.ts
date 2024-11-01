import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface HealthState {
  maxHealth: number;
  currentHealth: number;
  isInvulnerable: boolean;
  invulnerabilityDuration: number;
  lastDamageTime: number;
  isDead: boolean;
  takeDamage: (amount: number) => void;
  resetHealth: () => void;
  setInvulnerable: (duration: number) => void;
}

const INITIAL_HEALTH = 100;

const useHealth = create<HealthState>()(
  devtools((set, get) => ({
    maxHealth: INITIAL_HEALTH,
    currentHealth: INITIAL_HEALTH,
    isInvulnerable: false,
    invulnerabilityDuration: 2000,
    lastDamageTime: 0,
    isDead: false,

    takeDamage: (amount: number) => {
      const state = get();
      const currentTime = performance.now();

      // Check if player is currently invulnerable
      if (
        state.isInvulnerable &&
        currentTime - state.lastDamageTime < state.invulnerabilityDuration
      ) {
        return;
      }

      const newHealth = Math.max(0, state.currentHealth - amount);

      set({
        currentHealth: newHealth,
        isDead: newHealth <= 0,
        isInvulnerable: true,
        lastDamageTime: currentTime,
      });

      // Reset invulnerability after duration
      setTimeout(() => {
        set({ isInvulnerable: false });
      }, state.invulnerabilityDuration);
    },

    resetHealth: () => {
      set({
        currentHealth: INITIAL_HEALTH,
        isDead: false,
        isInvulnerable: false,
        lastDamageTime: 0,
      });
    },

    setInvulnerable: (duration: number) => {
      set({
        isInvulnerable: true,
        invulnerabilityDuration: duration,
        lastDamageTime: performance.now(),
      });
    },
  })),
);

export default useHealth;
