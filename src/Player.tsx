import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { ControlsMap } from "@/Game";
import Spaceship from "@/components/Spaceship";
import { useJoystickControls } from "@/stores/useJoystickControls";
import { isMobile } from "react-device-detect";

export const Player = ({ initialPosition, planetPosition }) => {
  const ref = useRef();
  const body = useRef();
  const camera = useRef();

  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);

  // Define control values with different defaults for mobile and desktop
  const defaultValues = {
    TURN_SPEED: isMobile ? 0.015 : 0.02,
    PITCH_SPEED: isMobile ? 0.015 : 0.02,
    FORWARD_SPEED: isMobile ? 0.3 : 0.5,
    CAMERA_HEIGHT: 2,
    CAMERA_DISTANCE: isMobile ? 10 : 8,
    CAMERA_SMOOTHNESS: isMobile ? 0.05 : 0.1,
    ROLL_RETURN_SPEED: isMobile ? 0.05 : 0.1,
    MAX_ROLL: isMobile ? Math.PI / 6 : Math.PI / 4
  };

  // Debug controls using Leva panel
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
      value: defaultValues.TURN_SPEED,
      min: 0,
      max: 0.1,
      step: 0.001
    },
    PITCH_SPEED: {
      label: "Pitch speed",
      value: defaultValues.PITCH_SPEED,
      min: 0,
      max: 0.1,
      step: 0.001
    },
    FORWARD_SPEED: {
      label: "Forward speed",
      value: defaultValues.FORWARD_SPEED,
      min: 0,
      max: 1,
      step: 0.1
    },
    CAMERA_HEIGHT: {
      label: "Camera height",
      value: defaultValues.CAMERA_HEIGHT,
      min: 0,
      max: 5,
      step: 1
    },
    CAMERA_DISTANCE: {
      label: "Camera distance",
      value: defaultValues.CAMERA_DISTANCE,
      min: 1,
      max: 20,
      step: 1
    },
    CAMERA_SMOOTHNESS: {
      label: "Camera smoothness",
      value: defaultValues.CAMERA_SMOOTHNESS,
      min: 0,
      max: 1,
      step: 0.01
    },
    ROLL_RETURN_SPEED: {
      label: "Roll return speed",
      value: defaultValues.ROLL_RETURN_SPEED,
      min: 0,
      max: 1,
      step: 0.01
    },
    MAX_ROLL: {
      label: "Max roll",
      value: defaultValues.MAX_ROLL,
      min: 0,
      max: Math.PI / 2,
      step: Math.PI / 8
    }
  });

  // Track current rotation angles of the spaceship
  const pitch = useRef(0);  // Up/down rotation
  const yaw = useRef(0);    // Left/right rotation
  const roll = useRef(0);   // Banking rotation during turns
  const targetRoll = useRef(0);

  // Initialize spaceship position when the game starts
  useEffect(() => {
    if (ref.current && initialPosition && camera.current) {
      ref.current.position.copy(initialPosition);
    }
  }, [initialPosition, planetPosition]);

  // Get keyboard control states
  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);

  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues
  );

  // Convert joystick angle to directional input
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

  // Calculate movement intensity based on joystick distance (mobile only)
  const getMobileMovementStrength = (joystickDis: number): number => {
    const normalizedStrength = Math.min(joystickDis / 50, 1);
    return normalizedStrength;
  };

  useFrame(() => {
    if (!ref.current) return;

    // Get current joystick state
    const { joystickDis, joystickAng } = getJoystickValues();
    let direction = "";
    if (joystickDis > 0) {
      direction = getJoystickDirection(joystickAng);
    }

    // Calculate movement intensity for mobile controls
    const mobileStrength = isMobile ? getMobileMovementStrength(joystickDis) : 1;

    // Normalize pitch to keep it within -PI to PI range
    pitch.current = pitch.current % (2 * Math.PI);
    if (pitch.current > Math.PI) {
      pitch.current -= 2 * Math.PI;
    } else if (pitch.current < -Math.PI) {
      pitch.current += 2 * Math.PI;
    }

    let isTransitioning = false;

    // Handle vertical rotation (pitch)
    if (upPressed || direction === "up") {
      if (pitch.current < -Math.PI / 2) {
        // Smooth transition when passing through vertical
        isTransitioning = true;
        const currentCameraPos = camera.current.position.clone();
        pitch.current = Math.PI - Math.abs(pitch.current);
        camera.current.position.copy(currentCameraPos);
      } else {
        pitch.current -= PITCH_SPEED * mobileStrength;
      }
    } else if (downPressed || direction === "down") {
      if (pitch.current > Math.PI / 2) {
        // Smooth transition when passing through vertical
        isTransitioning = true;
        const currentCameraPos = camera.current.position.clone();
        pitch.current = -Math.PI + Math.abs(pitch.current);
        camera.current.position.copy(currentCameraPos);
      } else {
        pitch.current += PITCH_SPEED * mobileStrength;
      }
    }

    // Handle horizontal rotation (yaw) and banking effect (roll)
    if (leftPressed || direction === "left") {
      yaw.current += TURN_SPEED * mobileStrength;
      targetRoll.current = -MAX_ROLL * mobileStrength;
    } else if (rightPressed || direction === "right") {
      yaw.current -= TURN_SPEED * mobileStrength;
      targetRoll.current = MAX_ROLL * mobileStrength;
    } else {
      targetRoll.current = 0;
    }

    // Smooth roll transition
    roll.current = THREE.MathUtils.lerp(roll.current, targetRoll.current, ROLL_RETURN_SPEED);

    // Apply rotations in the correct order (yaw -> pitch -> roll)
    ref.current.rotation.set(0, 0, 0);
    ref.current.rotateY(yaw.current);
    ref.current.rotateX(pitch.current);
    ref.current.rotateZ(roll.current);

    // Update position based on current direction
    const direction_vector = new THREE.Vector3();
    ref.current.getWorldDirection(direction_vector);
    ref.current.position.add(direction_vector.multiplyScalar(FORWARD_SPEED));

    // Update physics body position and rotation
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

    // Update camera position and look target
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