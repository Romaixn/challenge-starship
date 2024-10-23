import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import Spaceship from "@/components/Spaceship";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Controls } from "./Experience";

export const Player: React.FC = () => {
  const player = useRef<RapierRigidBody>(null!);
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();

  const [smoothedCameraPosition] = useState<THREE.Vector3>(
    () => new THREE.Vector3(10, 10, 10),
  );
  const [smoothedCameraTarget] = useState<THREE.Vector3>(
    () => new THREE.Vector3(),
  );

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
    const { forward, back, left, right } = getKeys();

    const impulse: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };
    const torque: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

    const impulseStrength: number = 0.6 * delta;
    const torqueStrength: number = 0.2 * delta;

    if (forward) {
      impulse.z -= impulseStrength;
      torque.x -= torqueStrength;
    }

    if (right) {
      impulse.x += impulseStrength;
      torque.z -= torqueStrength;
    }

    if (back) {
      impulse.z += impulseStrength;
      torque.x += torqueStrength;
    }

    if (left) {
      impulse.x -= impulseStrength;
      torque.z += torqueStrength;
    }

    player.current.applyImpulse(impulse, true);
    player.current.applyTorqueImpulse(torque, true);

    /**
     * Camera
     */
    const playerPosition = player.current.translation();
    const cameraPosition = new THREE.Vector3();
    cameraPosition.copy(playerPosition);
    cameraPosition.z += 20;
    cameraPosition.y += 10;

    const cameraTarget = new THREE.Vector3();
    cameraTarget.copy(playerPosition);
    cameraTarget.y += 0.5;

    smoothedCameraPosition.lerp(cameraPosition, 5 * delta);
    smoothedCameraTarget.lerp(cameraTarget, 5 * delta);

    state.camera.position.copy(smoothedCameraPosition);
    // @ts-ignore
    state.camera.lookAt(smoothedCameraTarget);
  });

  return (
    // @ts-ignore
    <RigidBody ref={player} colliders="cuboid">
      <Spaceship />
    </RigidBody>
  );
};
