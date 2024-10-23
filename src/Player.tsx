// @ts-nocheck

import { RigidBody } from "@react-three/rapier";
import { Box, PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ControlsMap } from "@/Game";
import Spaceship from "./components/Spaceship";

export const Player = () => {
  const ref = useRef();
  const body = useRef();
  const boxRef = useRef();
  const camera = useRef();

  let distance = 5;
  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);

  const speed = useRef(0.2);
  const [cameraDistance, _] = React.useState(-5);

  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);
  //   const boostPressed = useKeyboardControls((state) => state[ControlsMap.boost]);

  const boxSpeed = 0.15;

  useFrame(({ clock }) => {
    if (speed.current > 0.2) {
      speed.current -= 0.001;
    }
    if (camera.current.fov > 50) {
      camera.current.fov -= 0.1;
    }

    if (speed.current < 0.2) {
      speed.current += 0.001;
    }
    if (camera.current.fov < 50) {
      camera.current.fov += 0.1;
    }

    boxRef.current.rotation.set(0, 0, 0);

    boxRef.current.position.x += leftPressed ? boxSpeed : 0;
    boxRef.current.position.x += rightPressed ? -boxSpeed : 0;

    boxRef.current.position.y += upPressed ? boxSpeed : 0;
    boxRef.current.position.y += downPressed ? -boxSpeed : 0;

    const boxPosition = new THREE.Vector3();
    boxPosition.setFromMatrixPosition(boxRef.current.matrixWorld);
    const distanceX = boxPosition.x - ref.current.position.x;

    camera.current.position.z += speed.current;
    boxRef.current.position.z += speed.current;
    // Calculer l'angle entre les deux points en radians
    ref.current.lookAt(boxPosition);

    const angle = Math.atan2(distanceX, distance);
    // Définir la rotation de l'arwing autour de l'axe Z en fonction de l'angle
    ref.current.rotation.z = -(
      Math.sin(clock.getElapsedTime() * 2) * 0.05 +
      angle
    );

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
            <boxGeometry args={[2, 1, 1]} />
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
