// @ts-nocheck

import { RigidBody } from "@react-three/rapier";
import { Box, PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ControlsMap } from "@/Game";
import Spaceship from "./components/Spaceship";
import { useJoystickControls } from "./stores/useJoystickControls";

export const Player = ({ planet, initialPosition, planetPosition, orbitDistance }) => {
  const ref = useRef();
  const body = useRef();
  const camera = useRef();

  let distance = 5;
  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);

  const speed = useRef(0.2);
  const [cameraDistance, _] = React.useState(-5);

  // Constantes pour le mouvement
  const TURN_SPEED = 0.03;
  const PITCH_SPEED = 0.03;
  const FORWARD_SPEED = 0.5;
  const CAMERA_HEIGHT = 2;
  const CAMERA_DISTANCE = 8;
  const CAMERA_SMOOTHNESS = 0.1;
  const ROLL_RETURN_SPEED = 0.1;
  const MAX_ROLL = Math.PI / 4;

  // Rotation actuelle
  const pitch = useRef(0);
  const yaw = useRef(0);
  const roll = useRef(0);

  // Rotation cible
  const targetPitch = useRef(0);
  const targetRoll = useRef(0);

  // Positionnement initial du vaisseau
  useEffect(() => {
    if (ref.current && initialPosition && camera.current) {
      ref.current.position.copy(initialPosition);
    }
  }, [initialPosition, planetPosition]);

  const useIsInsideKeyboardControls = () => {
    try {
      return !!useKeyboardControls();
    } catch {
      return false;
    }
  };
  const isInsideKeyboardControls = useIsInsideKeyboardControls();

  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);

  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues,
  );

  const getJoystickDirection = (angle: number): string => {
    const normalizedAngle =
      ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    if (normalizedAngle >= 5.5 || normalizedAngle <= 0.8) {
      return "right";
    } else if (normalizedAngle > 0.8 && normalizedAngle <= 2.4) {
      return "up";
    } else if (normalizedAngle > 2.4 && normalizedAngle <= 3.9) {
      return "left";
    } else {
      return "down";
    }
  };

  useFrame(({ clock }, delta) => {
    if (!ref.current) return;

    const { joystickDis, joystickAng } = getJoystickValues();
    let direction = "";
    if (joystickDis > 0) {
      direction = getJoystickDirection(joystickAng);
    }

    // Rotation pitch (haut/bas)
    if (upPressed || direction === "up") {
      pitch.current -= PITCH_SPEED;
    } else if (downPressed || direction === "down") {
      pitch.current += PITCH_SPEED;
    }

    // Rotation yaw (gauche/droite)
    if (leftPressed || direction === "left") {
      yaw.current += TURN_SPEED;
      targetRoll.current = -MAX_ROLL;
    } else if (rightPressed || direction === "right") {
      yaw.current -= TURN_SPEED;
      targetRoll.current = MAX_ROLL;
    } else {
      targetRoll.current = 0;
    }

    // Interpolation douce du roll
    roll.current = THREE.MathUtils.lerp(roll.current, targetRoll.current, ROLL_RETURN_SPEED);

    // Application des rotations dans le bon ordre
    ref.current.rotation.set(0, 0, 0);
    ref.current.rotateY(yaw.current);   // Rotation gauche/droite
    ref.current.rotateX(pitch.current); // Rotation haut/bas
    ref.current.rotateZ(roll.current);  // Roll dans les virages

    // Calcul de la direction et déplacement
    const direction_vector = new THREE.Vector3();
    ref.current.getWorldDirection(direction_vector);
    ref.current.position.add(direction_vector.multiplyScalar(FORWARD_SPEED));

    // Mise à jour du RigidBody
    setBodyPosition([
      ref.current.position.x,
      ref.current.position.y,
      ref.current.position.z,
    ]);
    setBodyRotation([
      ref.current.rotation.x,
      ref.current.rotation.y,
      ref.current.rotation.z,
    ]);

    // Mise à jour de la caméra
    if (camera.current) {
      // Position de base de la caméra
      const offsetBase = new THREE.Vector3(0, CAMERA_HEIGHT, -CAMERA_DISTANCE);

      // Appliquer la même rotation que le vaisseau à la caméra
      offsetBase.applyEuler(ref.current.rotation);

      const targetPosition = ref.current.position.clone().add(offsetBase);
      camera.current.position.lerp(targetPosition, CAMERA_SMOOTHNESS);

      // Faire regarder la caméra vers un point légèrement devant le vaisseau
      const lookAtPoint = ref.current.position.clone().add(direction_vector.multiplyScalar(5));
      camera.current.lookAt(lookAtPoint);
    }
  });

  return (
    <group>
      <RigidBody
        ref={body}
        type="dynamic"
        position={bodyPosition}
        rotation={bodyRotation}
      >
        <mesh>
          <boxGeometry args={[1, 1, 2.5]} />
          <meshBasicMaterial color="red" visible={false} />
        </mesh>
      </RigidBody>
      <group ref={ref}>
        <Spaceship scale={0.1} rotation={[0, Math.PI, 0]} />
      </group>
      <PerspectiveCamera
        ref={camera}
        far={10000}
        makeDefault
        position={[0, CAMERA_HEIGHT, -CAMERA_DISTANCE]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
};