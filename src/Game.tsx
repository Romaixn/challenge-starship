import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  Center,
  Environment,
  KeyboardControls,
  OrbitControls,
  Stars
} from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Asteroid } from "@/components/Asteroid";
import Planet from "@/components/Planet";
import { Physics } from "@react-three/rapier";
import { Player } from "./Player";
import { KeyboardControlsEntry } from "@react-three/drei";
import Controls from "./components/controls/Controls";
import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";

const isProd = process.env.NODE_ENV === "production";

export enum ControlsMap {
  up = "up",
  down = "backward",
  left = "leftward",
  right = "rightward",
  boost = "boost",
}

const Game = () => {
  const map = useMemo<KeyboardControlsEntry<ControlsMap>[]>(
    () => [
      { name: ControlsMap.up, keys: ["ArrowUp", "KeyW"] },
      { name: ControlsMap.down, keys: ["ArrowDown", "KeyS"] },
      { name: ControlsMap.left, keys: ["ArrowLeft", "KeyA"] },
      { name: ControlsMap.right, keys: ["ArrowRight", "KeyD"] },
      { name: ControlsMap.boost, keys: ["Space"] }
    ],
    []
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
      { texture: "/planets/terrestrial/Terrestrial4.png", color: "#00AAFF" }
    ];

    return textures[Math.floor(Math.random() * textures.length)];
  }, []);

  const planet = useRef<THREE.Mesh>();
  const planetPosition = new THREE.Vector3(0, 0, 0);
  const playerDistanceFromPlanet = 1000;

  const generateRandomPlayerPosition = () => {
    const randomAngle = Math.random() * Math.PI * 2;

    const x = playerDistanceFromPlanet * Math.cos(randomAngle);
    const y = 0;
    const z = playerDistanceFromPlanet * Math.sin(randomAngle);

    return new THREE.Vector3(x, y, z);
  };

  const initialPlayerPosition = useMemo(
    () => generateRandomPlayerPosition(),
    []
  );

  return (
    <>
      {!isProd && <Perf position="top-left" />}
      {/* <Lights /> */}

      <Environment preset="night" />
      <Stars radius={2000} depth={50} factor={20} />

      <Physics debug timeStep="vary" gravity={[0, 0, 0]}>
        <KeyboardControls map={map}>
          <Player
            planet={planet}
            initialPosition={initialPlayerPosition}
            planetPosition={planetPosition}
            orbitDistance={playerDistanceFromPlanet}
          />
        </KeyboardControls>

        <Planet
          ref={planet}
          position={planetPosition}
          size={200}
          texture={texture}
          color={color}
        />
      </Physics>
    </>
  );
};

export default Game;