// @ts-nocheck

import { RigidBody } from "@react-three/rapier";
import { Box, PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ControlsMap } from "@/Game";
import Spaceship from "./components/Spaceship";
import { useJoystickControls } from "./stores/useJoystickControls";

export const Player = () => {
  const ref = useRef();
  const body = useRef();
  const boxRef = useRef();
  const camera = useRef();

  let distance = 5;
  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);
  const [initialPosition, setInitialPosition] = useState(
    new THREE.Vector3(0, 0, 0),
  );

  const speed = useRef(0.2);
  const [cameraDistance, _] = React.useState(-5);

  /**
   * Check if inside keyboardcontrols
   */
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
  //   const boostPressed = useKeyboardControls((state) => state[ControlsMap.boost]);

  /**
   * Joystick controls setup
   */
  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues,
  );
  const pressButton1 = useJoystickControls((state) => state.pressButton1);
  const pressButton2 = useJoystickControls((state) => state.pressButton2);
  const pressButton3 = useJoystickControls((state) => state.pressButton3);
  const pressButton4 = useJoystickControls((state) => state.pressButton4);
  const pressButton5 = useJoystickControls((state) => state.pressButton5);
  const releaseAllButtons = useJoystickControls(
    (state) => state.releaseAllButtons,
  );
  const setJoystick = useJoystickControls((state) => state.setJoystick);
  const resetJoystick = useJoystickControls((state) => state.resetJoystick);

  const getJoystickDirection = (angle: number): string => {
    // Normaliser l'angle entre 0 et 2π
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

  const boxSpeed = 0.15;

  useFrame(({ clock }) => {
    /**
     * Getting all joystick control values
     */
    const { joystickDis, joystickAng, runState, button1Pressed } =
      getJoystickValues();

    if (speed.current > 0.2) {
      speed.current -= 0.001;
    }

    if (speed.current < 0.2) {
      speed.current += 0.001;
    }

    let direction = "";
    if (joystickDis > 0) {
      direction = getJoystickDirection(joystickAng);
    }

    boxRef.current.rotation.set(0, 0, 0);

    boxRef.current.position.x +=
      leftPressed || direction === "left" ? boxSpeed : 0;
    boxRef.current.position.x +=
      rightPressed || direction === "right" ? -boxSpeed : 0;

    boxRef.current.position.y += upPressed || direction === "up" ? boxSpeed : 0;
    boxRef.current.position.y +=
      downPressed || direction === "down" ? -boxSpeed : 0;

    const boxPosition = new THREE.Vector3();
    boxPosition.setFromMatrixPosition(boxRef.current.matrixWorld);
    const distanceX = boxPosition.x - ref.current.position.x;

    camera.current.position.z += speed.current;
    boxRef.current.position.z += speed.current;
    // Calculer l'angle entre les deux points en radians
    ref.current.lookAt(boxPosition);

    ref.current.rotation.z = clock.getElapsedTime() * 2 * 0.02;

    if (ref.current.position.x !== boxPosition.x) {
      ref.current.position.x +=
        ((boxPosition.x - ref.current.position.x) / 10) * 0.3;
    }
    if (ref.current.position.y !== boxPosition.y) {
      ref.current.position.y +=
        ((boxPosition.y - ref.current.position.y) / 10) * 0.3;
    }
    if (ref.current.position.z !== boxPosition.z) {
      ref.current.position.z +=
        ((boxPosition.z - ref.current.position.z) / 10) * speed.current;
    }
    camera.current.position.z = ref.current.position.z + cameraDistance;
    camera.current.position.x = ref.current.position.x * 0.6;
    camera.current.position.y = ref.current.position.y * 0.6;
    camera.current.rotation.x = ref.current.position.y * 0.02;
    camera.current.rotation.y = Math.PI - ref.current.position.x * 0.02;
    camera.current.rotation.z = -ref.current.position.x * 0.01;
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

    camera.current.lookAt(ref.current.position);
    camera.current.position.z -= 0.01;
  });

  return (
    <>
      <group>
        <mesh ref={boxRef} position={[0, 0, 10]} rotation={[0, 0, 0]}></mesh>

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
          <Spaceship scale={0.1} />
        </group>
        <PerspectiveCamera
          ref={camera}
          far={10000}
          makeDefault
          position={[0, 60, -40]}
          rotation={[0, 0, 0]}
        />
      </group>
    </>
  );
};
