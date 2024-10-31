import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  Environment,
  KeyboardControls,
  KeyboardControlsEntry,
} from "@react-three/drei";
import { Perf } from "r3f-perf";
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
  const landingTransitionComplete = useGame(
    (state) => state.landingTransitionComplete,
  );

  const map = useMemo<KeyboardControlsEntry<ControlsMap>[]>(
    () => [
      { name: ControlsMap.up, keys: ["ArrowUp", "KeyW", "KeyZ"] },
      { name: ControlsMap.down, keys: ["ArrowDown", "KeyS", "KeyS"] },
      { name: ControlsMap.left, keys: ["ArrowLeft", "KeyA", "KeyA"] },
      { name: ControlsMap.right, keys: ["ArrowRight", "KeyD", "KeyD"] },
      { name: ControlsMap.boost, keys: ["Shift"] },
    ],
    [],
  );

  const { texture, color } = useMemo(() => {
    const textures = [
      // Habitable
      { texture: "/planets/habitable/Alpine.png", color: "#334635" },
      { texture: "/planets/habitable/Savannah.png", color: "#A8B624" },
      { texture: "/planets/habitable/Swamp.png", color: "#232B06" },
      { texture: "/planets/habitable/Tropical.png", color: "#017DA9" },
      // Gas
      { texture: "/planets/gaseous/Gaseous1.jpg", color: "#655A46" },
      { texture: "/planets/gaseous/Gaseous2.jpg", color: "#AA777D" },
      { texture: "/planets/gaseous/Gaseous3.jpg", color: "#9CBF89" },
      { texture: "/planets/gaseous/Gaseous4.jpg", color: "#D1466D" },
      // Inhospitable
      { texture: "/planets/inhospitable/Icy.png", color: "#AAC3CD" },
      { texture: "/planets/inhospitable/Martian.png", color: "#784233" },
      { texture: "/planets/inhospitable/Venusian.png", color: "#73370B" },
      { texture: "/planets/inhospitable/Volcanic.png", color: "#B6412D" },
      // Terrestrial
      { texture: "/planets/terrestrial/Terrestrial1.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial2.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial3.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial4.png", color: "#00AAFF" },
    ];

    return textures[Math.floor(Math.random() * textures.length)];
  }, []);

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
      {!isProd && <Perf position="top-left" />}
      <Lights />

      <Environment
        files="/textures/stars.jpg"
        backgroundIntensity={4}
        background
      />

      <Physics
        debug={!isProd}
        timeStep="vary"
        gravity={[0, 0, 0]}
        colliders={false}
      >
        <KeyboardControls map={map}>
          {phase === "space" && (
            <Player initialPosition={initialPlayerPosition} />
          )}

          {phase !== "space" && landingTransitionComplete && (
            <LandingPlayer planetRadius={PLANET_RADIUS} />
          )}
        </KeyboardControls>

        {phase === "space" && <AsteroidBelt />}

        <Planet
          ref={planet}
          position={planetPosition}
          size={PLANET_RADIUS}
          texture={texture}
          color={color}
          shouldRotate={phase === "space"}
        />

        {phase !== "space" && (
          <LandingPlatform planetRadius={PLANET_RADIUS} scale={3} />
        )}
      </Physics>

      <Effects />
    </>
  );
};

export default Game;
