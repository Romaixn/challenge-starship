import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Loader } from "@react-three/drei";
import { isMobile } from "react-device-detect";
import Game from "@/Game";
import Welcome from "@/Welcome";
import { Joystick } from "@/components/controls/Joystick";
import useGame from "@/stores/useGame";

const Experience = () => {
  const canvas = useRef();
  const phase = useGame((state) => state.phase);

  return (
    <>
      <Canvas
        // @ts-ignore
        ref={canvas}
        dpr={[1, 1]}
        gl={{ antialias: false, stencil: false }}
      >
        <color attach="background" args={["#0B192C"]} />

        <Suspense fallback={null}>{phase !== "welcome" && <Game />}</Suspense>
      </Canvas>
      {phase === "welcome" && (
        <Suspense fallback={null}>
          <Welcome />
        </Suspense>
      )}
      {phase !== "welcome" && isMobile && <Joystick />}
      <Loader />
    </>
  );
};

export default Experience;
