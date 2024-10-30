import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { ControlsMap } from "@/Game";
import Spaceship from "@/components/Spaceship";
import useGame from "@/stores/useGame";
import { useJoystickControls } from "@/stores/useJoystickControls";
import { isMobile } from "react-device-detect";

interface LandingPlayerProps {
  planetRadius: number;
}

export const INITIAL_Z_POSITION = 0;
const SAFE_LANDING_VELOCITY = 0.5;
const SAFE_ROTATION_ANGLE = 0.1;

export const LandingPlayer = ({ planetRadius }: LandingPlayerProps) => {
  const ref = useRef<THREE.Group>();
  const body = useRef();
  const camera = useRef<THREE.PerspectiveCamera>();

  const completeLandingTransition = useGame((state) => state.completeLandingTransition);
  const landingTransitionComplete = useGame((state) => state.landingTransitionComplete);
  const setLandingState = useGame((state) => state.setLandingState);
  const landingState = useGame((state) => state.landingState);
  const getJoystickValues = useJoystickControls((state) => state.getJoystickValues);

  const defaultValues = {
    VERTICAL_SPEED: isMobile ? 0.3 : 0.5,
    HORIZONTAL_SPEED: isMobile ? 0.6 : 1,
    GRAVITY_FORCE: 0.1,
    CAMERA_DISTANCE: isMobile ? 40 : 30,
    MIN_ALTITUDE: 1,
    ROTATION_SPEED: isMobile ? 0.4 : 0.8,
    MAX_ROTATION: isMobile ? 0.25 : 0.5,
    DRIFT_FACTOR: isMobile ? 0.25 : 0.5
  };

  const checkLandingConditions = () => {
    if (!ref.current || landingState !== "in_progress") return;

    const altitude = ref.current.position.y - planetRadius;
    if (altitude <= MIN_ALTITUDE) {
      const distance = new THREE.Vector2(
        ref.current.position.x,
        ref.current.position.z
      ).distanceTo(new THREE.Vector2(0, INITIAL_Z_POSITION));

      const isOnPlatform = distance < 5;

      if (!isOnPlatform) {
        console.log("Missed the platform!");
        setLandingState("crash");
        return;
      }

      const isSafeVelocity = Math.abs(verticalVelocity.current) < SAFE_LANDING_VELOCITY;
      const isSafeRotation = Math.abs(currentRotation.current) < SAFE_ROTATION_ANGLE;

      if (isSafeVelocity && isSafeRotation) {
        console.log("Perfect landing!");
        setLandingState("success");
      } else {
        console.log("Bad landing! Speed or rotation wrong", {
          velocity: verticalVelocity.current,
          rotation: currentRotation.current
        });
        setLandingState("crash");
      }
    }
  };

  const {
    STARTING_HEIGHT,
    VERTICAL_SPEED,
    GRAVITY_FORCE,
    CAMERA_DISTANCE,
    MIN_ALTITUDE,
    ROTATION_SPEED,
    MAX_ROTATION,
    DRIFT_FACTOR
  } = useControls("Landing Controls", {
    STARTING_HEIGHT: { value: 100, min: 100, max: 1000, step: 50},
    VERTICAL_SPEED: { value: defaultValues.VERTICAL_SPEED, min: 0.1, max: 2, step: 0.1 },
    GRAVITY_FORCE: { value: defaultValues.GRAVITY_FORCE, min: 0, max: 0.5, step: 0.01 },
    CAMERA_DISTANCE: { value: defaultValues.CAMERA_DISTANCE, min: 10, max: 500, step: 10 },
    MIN_ALTITUDE: { value: defaultValues.MIN_ALTITUDE, min: 0.5, max: 5, step: 0.5 },
    ROTATION_SPEED: { value: defaultValues.ROTATION_SPEED, min: 0.1, max: 2, step: 0.1 },
    MAX_ROTATION: { value: defaultValues.MAX_ROTATION, min: 0.1, max: Math.PI / 2, step: 0.1 },
    DRIFT_FACTOR: { value: defaultValues.DRIFT_FACTOR, min: 0, max: 2, step: 0.1 }
  });

  const verticalVelocity = useRef(0);
  const currentRotation = useRef(0);

  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);

  const getJoystickDirection = (angle: number): string => {
    const normalizedAngle = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (normalizedAngle >= 5.5 || normalizedAngle <= 1.3) return "right";
    if (normalizedAngle > 1.3 && normalizedAngle <= 1.6) return "up";
    if (normalizedAngle > 1.6 && normalizedAngle <= 3.9) return "left";
    return "down";
  };

  const getMobileMovementStrength = (joystickDis: number): number => {
    return Math.min(joystickDis / 50, 1);
  };

  useEffect(() => {
    if (ref.current && camera.current) {
      ref.current.position.set(0, planetRadius + STARTING_HEIGHT, INITIAL_Z_POSITION);
      ref.current.rotation.set(Math.PI / 2, Math.PI, Math.PI / 2);

      camera.current.position.set(
        CAMERA_DISTANCE,
        planetRadius + defaultValues.CAMERA_DISTANCE,
        0
      );
      camera.current.lookAt(ref.current.position);

      completeLandingTransition();
    }
  }, []);

  useFrame((state, delta) => {
    if (!ref.current || !camera.current || !landingTransitionComplete || landingState !== "in_progress") return;

    const currentPosition = ref.current.position;

    // Get joystick state
    const { joystickDis, joystickAng } = getJoystickValues();
    let direction = "";
    if (joystickDis > 0) {
      direction = getJoystickDirection(joystickAng);
    }

    // Calculate movement intensity for mobile
    const mobileStrength = isMobile ? getMobileMovementStrength(joystickDis) : 1;

    // Handle rotation with both keyboard and joystick inputs
    if (leftPressed || direction === "left") {
      currentRotation.current += ROTATION_SPEED * delta * (isMobile ? mobileStrength : 1);
    }
    if (rightPressed || direction === "right") {
      currentRotation.current -= ROTATION_SPEED * delta * (isMobile ? mobileStrength : 1);
    }

    // Clamp rotation
    currentRotation.current = THREE.MathUtils.clamp(
      currentRotation.current,
      -MAX_ROTATION,
      MAX_ROTATION
    );

    // Apply rotation to ship
    ref.current.rotation.set(
      Math.PI / 2 + currentRotation.current,
      Math.PI,
      Math.PI / 2
    );

    // Apply drift based on rotation
    const driftVelocity = currentRotation.current * DRIFT_FACTOR;
    currentPosition.z += driftVelocity;

    // Gravity and vertical controls
    verticalVelocity.current -= GRAVITY_FORCE * delta;

    // Handle vertical movement with both keyboard and joystick inputs
    if (upPressed || direction === "up") {
      verticalVelocity.current += VERTICAL_SPEED * delta * (isMobile ? mobileStrength : 1);
    }
    if (downPressed || direction === "down") {
      verticalVelocity.current -= VERTICAL_SPEED * delta * (isMobile ? mobileStrength : 1);
    }

    currentPosition.y += verticalVelocity.current;

    // Ground collision
    const altitude = currentPosition.y - planetRadius;
    if (altitude <= MIN_ALTITUDE) {
      currentPosition.y = planetRadius + MIN_ALTITUDE;
      checkLandingConditions();
      verticalVelocity.current = 0;
    }

    // Update camera
    camera.current.position.set(
      CAMERA_DISTANCE,
      currentPosition.y,
      currentPosition.z
    );
    camera.current.lookAt(currentPosition);
  });

  return (
    <group>
      <RigidBody
        ref={body}
        type="dynamic"
        colliders={false}
        mass={50}
        onCollisionEnter={(e) => {
          if (!e.other.rigidBodyObject?.name?.includes("landing_pad")) {
            setLandingState("crash");
          }
        }}
      >
        <CuboidCollider args={[1.5, 1.5, 3]} sensor={false} />
      </RigidBody>

      <group ref={ref}>
        <Spaceship scale={0.1} rotation={[0, Math.PI / 2, 0]} />
      </group>

      <PerspectiveCamera
        ref={camera}
        makeDefault
        fov={75}
        far={10000}
        position={[CAMERA_DISTANCE, 0, 0]}
      />
    </group>
  );
};