import { Canvas } from "@react-three/fiber";
import useGame from "./stores/useGame";
import { Suspense, useMemo, useRef } from "react";
import Game from "./Game";
import Welcome from "./Welcome";
import {
  KeyboardControls,
  KeyboardControlsEntry,
  Loader,
} from "@react-three/drei";

enum Controls {
  forward = "forward",
  back = "back",
  left = "left",
  right = "right",
  jump = "jump",
}

const Experience = () => {
  const canvas = useRef();
  const phase = useGame((state) => state.phase);
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ["ArrowUp", "KeyW"] },
      { name: Controls.back, keys: ["ArrowDown", "KeyS"] },
      { name: Controls.left, keys: ["ArrowLeft", "KeyA"] },
      { name: Controls.right, keys: ["ArrowRight", "KeyD"] },
      { name: Controls.jump, keys: ["Space"] },
    ],
    [],
  );

  return (
    <>
      <KeyboardControls map={map}>
        <Canvas
          // @ts-ignore
          ref={canvas}
          shadows
          camera={{
            fov: 45,
            position: [2, 5, 50],
            far: 5000,
          }}
        >
          <color attach="background" args={["#0B192C"]} />

          <Suspense fallback={null}>{phase !== "welcome" && <Game />}</Suspense>
        </Canvas>
      </KeyboardControls>
      {phase === "welcome" && (
        <Suspense fallback={null}>
          <Welcome />
        </Suspense>
      )}
      <Loader />
    </>
  );
};

export default Experience;
