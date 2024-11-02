import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Environment } from "@react-three/drei";
import AsteroidBelt from "@/components/Asteroid";
import Planet from "@/components/Planet";
import { Physics } from "@react-three/rapier";
import { Player } from "./Player";
import { useControls } from "leva";
import Lights from "@/Lights.tsx";
import useGame from "@/stores/useGame.ts";
import { LandingPlayer } from "@/LandingPlayer.tsx";
import { LandingPlatform } from "@/components/LandingPlatform.tsx";
import { Effects } from "@/Effects.tsx";

const isProd = process.env.NODE_ENV === "production";

export enum ControlsMap {
  up = "up",
  down = "backward",
  left = "leftward",
  right = "rightward",
  boost = "boost",
}

const Game = () => {
  const phase = useGame((state) => state.phase);
  const seed = useGame((state) => state.seed);
  const landingTransitionComplete = useGame(
    (state) => state.landingTransitionComplete,
  );

  const planet = useRef<THREE.Mesh>();
  const planetPosition = new THREE.Vector3(0, 0, 0);
  const PLANET_RADIUS = 200;
  const { playerDistanceFromPlanet } = useControls("Player", {
    playerDistanceFromPlanet: {
      value: 5000,
      min: 1000,
      max: 10000,
      step: 1000,
    },
  });

  const initialPlayerPosition = useMemo(() => {
    return new THREE.Vector3(0, 0, playerDistanceFromPlanet);
  }, [playerDistanceFromPlanet]);

  return (
    <>
      {/*{!isProd && <Perf position="top-left" />}*/}
      <Lights />

      <Environment
        files="/textures/stars.jpg"
        backgroundIntensity={4}
        background
      />

      <Physics
        // debug={!isProd}
        timeStep="vary"
        gravity={[0, 0, 0]}
      >
        {phase === "space" && (
          <Player initialPosition={initialPlayerPosition} />
        )}

        {phase !== "space" && landingTransitionComplete && (
          <LandingPlayer planetRadius={PLANET_RADIUS} />
        )}

        {phase === "space" && <AsteroidBelt />}

        <Planet
          ref={planet}
          position={planetPosition}
          size={PLANET_RADIUS}
          shouldRotate={phase === "space"}
          seed={seed}
        />

        {phase !== "space" && (
          <>
            <LandingPlatform planetRadius={PLANET_RADIUS} scale={3} />
          </>
        )}
      </Physics>

      <Effects />
    </>
  );
};

export default Game;
