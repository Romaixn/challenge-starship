import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useRapier, RigidBody } from "@react-three/rapier";
import Spaceship from "./components/Spaceship";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const Player = () => {
  const player = useRef();
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { rapier, world } = useRapier();

  const [smoothedCameraPosition] = useState(
    () => new THREE.Vector3(10, 10, 10),
  );
  const [smoothedCameraTarget] = useState(() => new THREE.Vector3());

  useEffect(() => {
    const unsubscribeAny = subscribeKeys(() => {
      console.log("coucou");
    });

    return () => {
      unsubscribeAny();
    };
  }, []);

  useFrame((state, delta) => {
    if (!player.current) return;

    /**
     * Controls
     */
    const { forward, backward, leftward, rightward } = getKeys();

    const impulse = { x: 0, y: 0, z: 0 };
    const torque = { x: 0, y: 0, z: 0 };

    const impulseStrength = 0.6 * delta;
    const torqueStrength = 0.2 * delta;

    player.current.applyImpulse(impulse);
    player.current.applyTorqueImpulse(torque);

    /**
     * Camera
     */
    const playerPosition = player.current.translation();
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(playerPosition);
    cameraPosition.z += 2.25;
    cameraPosition.y += 0.65;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(playerPosition);
    cameraTarget.y += 0.25;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    state.camera.lookAt(smoothedCameraTarget);
  });

  return (
    <RigidBody ref={player}>
      <Spaceship />
    </RigidBody>
  );
};
