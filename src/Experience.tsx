import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { isMobile } from "react-device-detect";
import Welcome from "@/Welcome";
import { Joystick } from "@/components/controls/Joystick";
import useGame from "@/stores/useGame";
import { initializePerformanceDetection } from "@/stores/performanceStore.ts";
import HUD from "@/components/HUD.tsx";
import { FadeTransition } from "@/components/FadeTransition.tsx";
import { AudioManager } from "@/components/AudioManager.tsx";
import { FinalMessage } from "@/components/FinalMessage.tsx";
import useHealth from "@/stores/useHealth.ts";
import Game, { ControlsMap } from "@/Game.tsx";
import KeyboardHUD from "@/components/KeyboardHUD.tsx";
import { KeyboardControls, KeyboardControlsEntry } from "@react-three/drei";

const Experience = () => {
  const canvas = useRef();

  const map = useMemo<KeyboardControlsEntry<ControlsMap>[]>(
    () => [
      { name: ControlsMap.up, keys: ["ArrowUp", "KeyW", "KeyZ"] },
      { name: ControlsMap.down, keys: ["ArrowDown", "KeyS", "KeyS"] },
      { name: ControlsMap.left, keys: ["ArrowLeft", "KeyA", "KeyA"] },
      { name: ControlsMap.right, keys: ["ArrowRight", "KeyD", "KeyD"] },
      { name: ControlsMap.boost, keys: ["Shift", "Space"] },
    ],
    [],
  );

  const phase = useGame((state) => state.phase);
  const landingTransitionComplete = useGame(
    (state) => state.landingTransitionComplete,
  );
  const isDead = useHealth((state) => state.isDead);

  useEffect(() => {
    initializePerformanceDetection();
  }, []);

  return (
    <>
      <KeyboardControls map={map}>
        <Canvas
          ref={canvas}
          dpr={[1, 1]}
          gl={{ antialias: false, stencil: false }}
        >
          <color attach="background" args={["#030304"]} />

          <Suspense fallback={null}>{phase !== "welcome" && <Game />}</Suspense>
        </Canvas>

        {phase !== "welcome" && (
          <>
            <AudioManager />
            <HUD />
            <KeyboardHUD />
          </>
        )}
      </KeyboardControls>
      {phase === "welcome" && (
        <Suspense fallback={null}>
          <Welcome />
        </Suspense>
      )}
      {phase !== "welcome" && isMobile && <Joystick />}
      {phase === "landing" && !landingTransitionComplete && <FadeTransition />}
      {(phase === "landed" || isDead) && <FinalMessage />}
    </>
  );
};

export default Experience;
