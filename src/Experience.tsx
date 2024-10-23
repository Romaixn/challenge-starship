import { Canvas } from "@react-three/fiber";
import useGame from "@/stores/useGame";
import { Suspense, useEffect, useRef, useState } from "react";
import Game from "@/Game";
import Welcome from "@/Welcome";
import { Loader } from "@react-three/drei";
import { Joystick } from "./components/controls/Joystick";

const Experience = () => {
  const canvas = useRef();
  const phase = useGame((state) => state.phase);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Considère comme mobile si la largeur est <= 768px
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

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
