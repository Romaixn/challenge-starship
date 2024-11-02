import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { ControlsMap } from "@/Game";
import Spaceship from "@/components/Spaceship";
import { useJoystickControls } from "@/stores/useJoystickControls";
import { isMobile } from "react-device-detect";
import useGame from "@/stores/useGame.ts";
import { PositionTracker } from "@/utils/positionTracker.ts";
import useHealth from "@/stores/useHealth.ts";
import ExplosionEffect from "@/components/ExplosionEffect.tsx";
import { useShieldSystem } from "@/stores/useShieldSystem.ts";

interface CollisionData {
  target: {
    rigidBody: {
      translation(): { x: number; y: number; z: number };
      mass: number;
    };
  };
  other: {
    rigidBody: {
      translation(): { x: number; y: number; z: number };
      linvel(): { x: number; y: number; z: number };
    };
  };
}

export const Player = ({ initialPosition }) => {
  const ref = useRef();
  const body = useRef();
  const camera = useRef();
  const damageLight = useRef<THREE.PointLight>();
  const damageAnimationRef = useRef({
    active: false,
    startTime: 0,
    duration: 3000,
    maxIntensity: 1500,
    flashCount: 4,
  });

  const [bodyPosition, setBodyPosition] = React.useState([0, 0, 0]);
  const [bodyRotation, setBodyRotation] = React.useState([0, 0, 0]);

  const startLandingSequence = useGame((state) => state.startLandingSequence);
  const takeDamage = useHealth((state) => state.takeDamage);
  const isInvulnerable = useHealth((state) => state.isInvulnerable);
  const isDead = useHealth((state) => state.isDead);

  const isShieldActive = useShieldSystem((state) => state.isShieldActive);

  const positionTracker = useRef(
    new PositionTracker(400, () => {
      startLandingSequence();
    }),
  );

  const shieldTracker = useRef(
    new PositionTracker(550, () => {
      approchShield();
    }),
  );

  const approchShield = () => {
    if (!ref.current || !isShieldActive) return;

    const currentPosition = ref.current.position.clone();
    const bounceDirection = currentPosition.clone().normalize();

    const safeDistance = 850;
    ref.current.position.copy(bounceDirection.multiplyScalar(safeDistance));

    yaw.current = (yaw.current + Math.PI) % (2 * Math.PI);
    pitch.current = -pitch.current;

    roll.current = Math.sign(roll.current) * MAX_ROLL * 1.5;

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

    setTimeout(() => {
      shieldTracker.current.reset();
    }, 100);
  };

  const startDamageAnimation = () => {
    if (damageAnimationRef.current) {
      damageAnimationRef.current.active = true;
      damageAnimationRef.current.startTime = performance.now();
    }
  };

  const defaultValues = {
    TURN_SPEED: isMobile ? 0.01 : 0.02,
    PITCH_SPEED: isMobile ? 0.01 : 0.02,
    FORWARD_SPEED: isMobile ? 0.6 : 0.8,
    BOOST_SPEED_MULTIPLIER: 3,
    BOOST_ACCELERATION: 0.1,
    BOOST_DECELERATION: 0.05,
    CAMERA_HEIGHT: 2,
    CAMERA_DISTANCE: isMobile ? 10 : 8,
    CAMERA_SMOOTHNESS: isMobile ? 0.05 : 0.1,
    ROLL_RETURN_SPEED: isMobile ? 0.05 : 0.1,
    MAX_ROLL: isMobile ? Math.PI / 6 : Math.PI / 4,
  };

  const {
    TURN_SPEED,
    PITCH_SPEED,
    FORWARD_SPEED,
    BOOST_SPEED_MULTIPLIER,
    BOOST_ACCELERATION,
    BOOST_DECELERATION,
    CAMERA_HEIGHT,
    CAMERA_DISTANCE,
    CAMERA_SMOOTHNESS,
    ROLL_RETURN_SPEED,
    MAX_ROLL,
  } = useControls("Player", {
    TURN_SPEED: {
      label: "Turn speed",
      value: defaultValues.TURN_SPEED,
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    PITCH_SPEED: {
      label: "Pitch speed",
      value: defaultValues.PITCH_SPEED,
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    FORWARD_SPEED: {
      label: "Forward speed",
      value: defaultValues.FORWARD_SPEED,
      min: 0,
      max: 1,
      step: 0.1,
    },
    BOOST_SPEED_MULTIPLIER: {
      label: "Boost multiplier",
      value: defaultValues.BOOST_SPEED_MULTIPLIER,
      min: 1,
      max: 20,
      step: 1,
    },
    BOOST_ACCELERATION: {
      label: "Boost Acceleration",
      value: defaultValues.BOOST_ACCELERATION,
      min: 0.01,
      max: 1,
      step: 0.01,
    },
    BOOST_DECELERATION: {
      label: "Boost Deceleration",
      value: defaultValues.BOOST_DECELERATION,
      min: 0.01,
      max: 1,
      step: 0.01,
    },
    CAMERA_HEIGHT: {
      label: "Camera height",
      value: defaultValues.CAMERA_HEIGHT,
      min: 0,
      max: 5,
      step: 1,
    },
    CAMERA_DISTANCE: {
      label: "Camera distance",
      value: defaultValues.CAMERA_DISTANCE,
      min: 1,
      max: 20,
      step: 1,
    },
    CAMERA_SMOOTHNESS: {
      label: "Camera smoothness",
      value: defaultValues.CAMERA_SMOOTHNESS,
      min: 0,
      max: 1,
      step: 0.01,
    },
    ROLL_RETURN_SPEED: {
      label: "Roll return speed",
      value: defaultValues.ROLL_RETURN_SPEED,
      min: 0,
      max: 1,
      step: 0.01,
    },
    MAX_ROLL: {
      label: "Max roll",
      value: defaultValues.MAX_ROLL,
      min: 0,
      max: Math.PI / 2,
      step: Math.PI / 8,
    },
  });

  // Track current rotation angles and boost
  const pitch = useRef(0);
  const yaw = useRef(Math.PI);
  const roll = useRef(0);
  const targetRoll = useRef(0);
  const currentBoostMultiplier = useRef(1);

  // Initialize spaceship position
  useEffect(() => {
    if (ref.current && initialPosition && camera.current) {
      ref.current.position.copy(initialPosition);

      ref.current.rotation.set(0, Math.PI, 0);

      const cameraOffset = new THREE.Vector3(
        0,
        CAMERA_HEIGHT,
        -CAMERA_DISTANCE,
      );
      cameraOffset.applyEuler(ref.current.rotation);
      camera.current.position.copy(initialPosition).add(cameraOffset);

      camera.current.lookAt(initialPosition);
    }
  }, [initialPosition]);

  const handleCollision = (e: CollisionData) => {
    if (isInvulnerable) return;

    const asteroidVelocity = e.other.rigidBody.linvel();

    const relativeVelocity = Math.sqrt(
      Math.pow(asteroidVelocity.x, 2) +
        Math.pow(asteroidVelocity.y, 2) +
        Math.pow(asteroidVelocity.z, 2),
    );

    const BASE_DAMAGE = 5;
    const VELOCITY_DAMAGE_MULTIPLIER = 0.08;
    const damage = Math.round(
      BASE_DAMAGE + relativeVelocity * VELOCITY_DAMAGE_MULTIPLIER,
    );

    startDamageAnimation();

    takeDamage(damage);
  };

  // Get keyboard control states
  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);
  const boostPressed = useKeyboardControls((state) => state[ControlsMap.boost]);

  const getJoystickValues = useJoystickControls(
    (state) => state.getJoystickValues,
  );

  // Convert joystick angle to directional input
  const getJoystickDirection = (angle: number): string => {
    const normalizedAngle =
      ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    if (normalizedAngle >= 5.5 || normalizedAngle <= 0.8) return "right";
    if (normalizedAngle > 0.8 && normalizedAngle <= 2.4) return "up";
    if (normalizedAngle > 2.4 && normalizedAngle <= 3.9) return "left";
    return "down";
  };

  // Calculate movement intensity based on joystick distance (mobile only)
  const getMobileMovementStrength = (joystickDis: number): number => {
    return Math.min(joystickDis / 50, 1);
  };

  useFrame((state, delta) => {
    if (!ref.current) return;

    if (!isDead) {
      // Get current joystick state and boost state
      const {
        joystickDis,
        joystickAng,
        button1Pressed: boostButton,
      } = getJoystickValues();
      const isBoosting = boostPressed || boostButton;

      let direction = "";
      if (joystickDis > 0) {
        direction = getJoystickDirection(joystickAng);
      }

      // Calculate movement intensity
      const mobileStrength = isMobile
        ? getMobileMovementStrength(joystickDis)
        : 1;

      // Smoothly update boost multiplier
      const targetBoostMultiplier = isBoosting ? BOOST_SPEED_MULTIPLIER : 1;
      const boostTransitionSpeed = isBoosting
        ? BOOST_ACCELERATION
        : BOOST_DECELERATION;

      currentBoostMultiplier.current = THREE.MathUtils.lerp(
        currentBoostMultiplier.current,
        targetBoostMultiplier,
        boostTransitionSpeed,
      );

      // Calculate final speed with smooth boost
      const currentSpeed = FORWARD_SPEED * currentBoostMultiplier.current;

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
          isTransitioning = true;
          const currentCameraPos = camera.current.position.clone();
          pitch.current = Math.PI - Math.abs(pitch.current);
          camera.current.position.copy(currentCameraPos);
        } else {
          pitch.current -= PITCH_SPEED * mobileStrength;
        }
      } else if (downPressed || direction === "down") {
        if (pitch.current > Math.PI / 2) {
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
      roll.current = THREE.MathUtils.lerp(
        roll.current,
        targetRoll.current,
        ROLL_RETURN_SPEED,
      );

      // Apply rotations in the correct order (yaw -> pitch -> roll)
      ref.current.rotation.set(0, 0, 0);
      ref.current.rotateY(yaw.current);
      ref.current.rotateX(pitch.current);
      ref.current.rotateZ(roll.current);

      // Update position based on current direction and speed
      const direction_vector = new THREE.Vector3();
      ref.current.getWorldDirection(direction_vector);
      ref.current.position.add(direction_vector.multiplyScalar(currentSpeed));

      const currentPosition = ref.current.position.clone();
      const relativePosition = currentPosition
        .clone()
        .sub(new THREE.Vector3(0, 0, 0));
      if (!isShieldActive) {
        positionTracker.current.checkPosition(relativePosition);
      } else {
        shieldTracker.current.checkPosition(relativePosition);
      }

      // Update physics body
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

      // Update camera position and look target
      if (camera.current && !isTransitioning) {
        const offsetBase = new THREE.Vector3(
          0,
          CAMERA_HEIGHT,
          -CAMERA_DISTANCE,
        );
        offsetBase.applyEuler(ref.current.rotation);
        const targetPosition = ref.current.position.clone().add(offsetBase);
        camera.current.position.lerp(targetPosition, CAMERA_SMOOTHNESS);

        const lookAtPoint = ref.current.position
          .clone()
          .add(direction_vector.multiplyScalar(5));
        camera.current.lookAt(lookAtPoint);
      }

      // Damage animation
      if (damageLight.current && damageAnimationRef.current.active) {
        const animation = damageAnimationRef.current;
        const elapsed = performance.now() - animation.startTime;

        if (elapsed > animation.duration) {
          damageLight.current.intensity = 0;
          animation.active = false;
        } else {
          const progress = elapsed / animation.duration;
          const flashSpeed = animation.flashCount * Math.PI * 2;
          const flashIntensity = Math.sin(progress * flashSpeed);
          const fadeOut = 1 - progress;

          damageLight.current.intensity = Math.max(
            0,
            flashIntensity * fadeOut * animation.maxIntensity,
          );
        }
      }
    }
  });

  return (
    <group>
      <RigidBody
        ref={body}
        position={bodyPosition}
        rotation={bodyRotation}
        type="kinematicPosition"
        colliders={false}
        mass={50}
        restitution={1}
        friction={0}
        userData={{ type: "player" }}
      >
        <CuboidCollider
          args={[1.5, 1.5, 3]}
          onCollisionEnter={handleCollision}
          sensor={false}
          restitution={1}
          friction={0}
        />
        <mesh>
          <boxGeometry args={[1, 1, 2.5]} />
          <meshBasicMaterial color="red" visible={false} />
        </mesh>
      </RigidBody>

      <group ref={ref}>
        <Spaceship scale={0.1} rotation={[0, Math.PI, 0]} />
        <pointLight
          ref={damageLight}
          position={[0, 0, 0]}
          intensity={0}
          color={"#ff0000"}
          distance={50}
          decay={2}
        />
        {isDead && <ExplosionEffect scale={0.1} />}
      </group>

      <PerspectiveCamera
        ref={camera}
        far={7000}
        makeDefault
        position={[0, CAMERA_HEIGHT, -CAMERA_DISTANCE]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
};
