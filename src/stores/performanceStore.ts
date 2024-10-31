import { getGPUTier } from "detect-gpu";
import { create } from "zustand";
import { isMobile } from "react-device-detect";

interface PerformanceState {
  tier: number;
  fps: number;
  isMobile: boolean;
  settings: GameSettings;
  updateFps: (fps: number) => void;
}

interface GameSettings {
  asteroidCount: number;
  particleCount: number;
  particleSize: number;
}

export const usePerformanceStore = create<PerformanceState>((set) => ({
  tier: 1, // Default to lowest tier
  fps: 60,
  isMobile: false,
  settings: getDefaultSettings(1),
  updateFps: (fps: number) => {
    set((state) => {
      // Adjust settings if FPS drops below threshold
      if (fps < 30 && state.tier > 1) {
        return {
          fps,
          tier: state.tier - 1,
          settings: getDefaultSettings(state.tier - 1),
        };
      }
      return { fps };
    });
  },
}));

function getDefaultSettings(tier: number): GameSettings {
  switch (tier) {
    case 3: // High-end devices
      return {
        asteroidCount: 2500,
        particleCount: 500,
        particleSize: 5,
      };
    case 2: // Mid-range devices
      return {
        asteroidCount: 1250,
        particleCount: 250,
        particleSize: 7,
      };
    default: // Low-end devices
      return {
        asteroidCount: 800,
        particleCount: 100,
        particleSize: 10,
      };
  }
}

// Initialize performance detection
export async function initializePerformanceDetection() {
  try {
    // Detect GPU capabilities
    const gpuTier = await getGPUTier();

    // Convert GPU tier to our performance tier
    let performanceTier = 1;
    if (gpuTier.tier >= 3) {
      performanceTier = 3;
    } else if (gpuTier.tier >= 2) {
      performanceTier = 2;
    }

    if (isMobile) {
      performanceTier = Math.max(1, performanceTier - 1);
    }

    // Initialize performance monitoring
    const settings = getDefaultSettings(performanceTier);
    usePerformanceStore.setState({
      tier: performanceTier,
      isMobile,
      settings,
    });

    // Setup FPS monitoring
    let lastTime = performance.now();
    let frames = 0;

    function checkFPS(timestamp: number) {
      frames++;
      const elapsed = timestamp - lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((frames * 1000) / elapsed);
        usePerformanceStore.getState().updateFps(fps);
        frames = 0;
        lastTime = timestamp;
      }

      requestAnimationFrame(checkFPS);
    }

    requestAnimationFrame(checkFPS);

    return true;
  } catch (error) {
    console.error("Failed to initialize performance detection:", error);
    return false;
  }
}
