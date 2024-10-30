import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { isMobile } from "react-device-detect";
import Game from "@/Game";
import Welcome from "@/Welcome";
import { Joystick } from "@/components/controls/Joystick";
import useGame from "@/stores/useGame";
import { initializePerformanceDetection } from "@/stores/performanceStore.ts";
import HUD from "@/components/HUD.tsx";

const Experience = () => {
  const canvas = useRef();
  const phase = useGame((state) => state.phase);

  useEffect(() => {
    initializePerformanceDetection();
  }, []);

  return (
    <>
      <Canvas
        ref={canvas}
        dpr={[1, 1]}
        gl={{ antialias: false, stencil: false }}
      >
        <color attach="background" args={["#030304"]} />

        <Suspense fallback={null}>{phase !== "welcome" && <Game />}</Suspense>
      </Canvas>
      {phase === "welcome" && (
        <Suspense fallback={null}>
          <Welcome />
        </Suspense>
      )}
      {phase !== "welcome" && isMobile && <Joystick />}
      {phase !== "welcome" && <HUD />}
      <Loader />
    </>
  );
};

export default Experience;
