import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { ControlsMap } from "@/Game";
import Spaceship from "@/components/Spaceship";
import { useJoystickControls } from "@/stores/useJoystickControls";

export const Player = ({ initialPosition, planetPosition }) => {
  const ref = useRef();
  const body = useRef();
  const camera = useRef();

  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);

  const {
    TURN_SPEED,
    PITCH_SPEED,
    FORWARD_SPEED,
    CAMERA_HEIGHT,
    CAMERA_DISTANCE,
    CAMERA_SMOOTHNESS,
    ROLL_RETURN_SPEED,
    MAX_ROLL
  } = useControls("Player", {
    TURN_SPEED: {
      label: "Turn speed",
      value: 0.03,
      min: 0,
      max: 0.1,
      step: 0.01
    },
    PITCH_SPEED: {
      label: "Pitch speed",
      value: 0.03,
      min: 0,
      max: 0.1,
      step: 0.01
    },
    FORWARD_SPEED: {
      label: "Forward speed",
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.1
    },
    CAMERA_HEIGHT: {
      label: "Camera height",
      value: 2,
      min: 0,
      max: 5,
      step: 1
    },
    CAMERA_DISTANCE: {
      label: "Camera distance",
      value: 8,
      min: 1,
      max: 20,
      step: 1
    },
    CAMERA_SMOOTHNESS: {
      label: "Camera smoothness",
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.1
    },
    ROLL_RETURN_SPEED: {
      label: "Roll return speed",
      value: 0.1,
      min: 0,
      max: 1,
      step: 0.1
    },
    MAX_ROLL: {
      label: "Max roll",
      value: Math.PI / 4,
      min: 0,
      max: Math.PI / 2,
      step: Math.PI / 8
    }
  });

  // Rotation actuelle
  const pitch = useRef(0);
  const yaw = useRef(0);
  const roll = useRef(0);
  const targetRoll = useRef(0);

  // Positionnement initial du vaisseau
  useEffect(() => {
    if (ref.current && initialPosition && camera.current) {
      ref.current.position.copy(initialPosition);
    }
  }, [initialPosition, planetPosition]);

  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);

  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues
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

  useFrame(() => {
    if (!ref.current) return;

    const { joystickDis, joystickAng } = getJoystickValues();
    let direction = "";
    if (joystickDis > 0) {
      direction = getJoystickDirection(joystickAng);
    }

    pitch.current = pitch.current % (2 * Math.PI);
    if (pitch.current > Math.PI) {
      pitch.current -= 2 * Math.PI;
    } else if (pitch.current < -Math.PI) {
      pitch.current += 2 * Math.PI;
    }

    let isTransitioning = false;

    // Rotation pitch (haut/bas) avec auto-redressement
    if (upPressed || direction === "up") {
      if (pitch.current < -Math.PI / 2) {
        isTransitioning = true;
        const currentCameraPos = camera.current.position.clone();

        pitch.current = Math.PI - Math.abs(pitch.current);

        camera.current.position.copy(currentCameraPos);
      } else {
        pitch.current -= PITCH_SPEED;
      }
    } else if (downPressed || direction === "down") {
      if (pitch.current > Math.PI / 2) {
        isTransitioning = true;
        const currentCameraPos = camera.current.position.clone();

        pitch.current = -Math.PI + Math.abs(pitch.current);

        camera.current.position.copy(currentCameraPos);
      } else {
        pitch.current += PITCH_SPEED;
      }
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
      ref.current.position.z
    ]);
    setBodyRotation([
      ref.current.rotation.x,
      ref.current.rotation.y,
      ref.current.rotation.z
    ]);

    // Mise à jour de la caméra seulement si on n'est pas en transition
    if (camera.current && !isTransitioning) {
      const offsetBase = new THREE.Vector3(0, CAMERA_HEIGHT, -CAMERA_DISTANCE);
      offsetBase.applyEuler(ref.current.rotation);
      const targetPosition = ref.current.position.clone().add(offsetBase);
      camera.current.position.lerp(targetPosition, CAMERA_SMOOTHNESS);

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