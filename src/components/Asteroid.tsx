import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useEffect, useMemo, useRef } from "react";
import { useControls } from "leva";
import {
  CuboidCollider,
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  RigidBody
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";

type GLTFResult = GLTF & {
  nodes: {
    Asteroid_Big: THREE.Mesh;
    Asteroid_Big001: THREE.Mesh;
    Asteroid_Big002: THREE.Mesh;
    Asteroid_Big003: THREE.Mesh;
    Asteroid_Big004: THREE.Mesh;
    Asteroid_Small: THREE.Mesh;
    Asteroid_Small001: THREE.Mesh;
    Asteroid_Small002: THREE.Mesh;
    Asteroid_Small003: THREE.Mesh;
    Asteroid_Small004: THREE.Mesh;
    Asteroid_Small005: THREE.Mesh;
    Asteroid_Small006: THREE.Mesh;
    Asteroid_Small007: THREE.Mesh;
  };
  materials: {
    asteroid: THREE.MeshStandardMaterial;
  };
};

const BigAsteroid = (props: JSX.IntrinsicElements["group"]) => {
  const asteroidType = useMemo(() => {
    const random = Math.floor(Math.random() * 5) + 1;
    let type;

    switch (random) {
      case 1:
        type = "Asteroid_Big";
        break;
      case 2:
        type = "Asteroid_Big001";
        break;
      case 3:
        type = "Asteroid_Big002";
        break;
      case 4:
        type = "Asteroid_Big003";
        break;
      case 5:
        type = "Asteroid_Big004";
        break;
      default:
        type = "Asteroid_Big";
    }

    return type;
  }, []);
  const { nodes, materials } = useGLTF("/models/asteroids.glb") as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes[asteroidType].geometry}
        material={materials.asteroid}
        position={[0.296, 0.408, -0.848]}
      />
    </group>
  );
};

const SmallAsteroid = (props: JSX.IntrinsicElements["group"]) => {
  const asteroidType: string = useMemo(() => {
    const random = Math.floor(Math.random() * 8) + 1;
    let type;

    switch (random) {
      case 1:
        type = "Asteroid_Small";
        break;
      case 2:
        type = "Asteroid_Small001";
        break;
      case 3:
        type = "Asteroid_Small002";
        break;
      case 4:
        type = "Asteroid_Small003";
        break;
      case 5:
        type = "Asteroid_Small004";
        break;
      case 6:
        type = "Asteroid_Small005";
        break;
      case 7:
        type = "Asteroid_Small006";
        break;
      case 8:
        type = "Asteroid_Small007";
        break;
      default:
        type = "Asteroid_Small";
    }

    return type;
  }, []);

  const { nodes, materials } = useGLTF("/models/asteroids.glb") as GLTFResult;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes[asteroidType].geometry}
        material={materials.asteroid}
        position={[1.63, 15.504, -6.027]}
      />
    </group>
  );
};

type AsteroidProps = {
  position?: [number, number, number];
  types?: React.ComponentType<JSX.IntrinsicElements["group"]>[];
};

export const Asteroid: React.FC<AsteroidProps> = ({
                                                    position: initialPosition,
                                                    types = [BigAsteroid, SmallAsteroid]
                                                  }) => {
  const rigidBodyRef = useRef(null);

  const AsteroidType = useMemo(() => {
    return types[Math.floor(Math.random() * types.length)];
  }, [types]);

  const position = useMemo<[number, number, number]>(() => {
    if (initialPosition) return initialPosition;
    return [
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50
    ];
  }, [initialPosition]);

  const rotation = useMemo<[number, number, number]>(() => {
    return [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    ];
  }, []);

  const scale = useMemo(() => {
    return Math.random() + 2.0;
  }, []);

  useEffect(() => {
    // Ajouter une vélocité initiale aléatoire très faible
    // pour éviter que l'astéroïde soit parfaitement statique
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setLinvel({
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
      }, true);
    }
  }, []);

  const handleCollision = (e) => {
    if (!rigidBodyRef.current) return;

    const asteroidPos = rigidBodyRef.current.translation();
    const otherPos = e.other.translation();

    // Récupérer la vélocité actuelle du vaisseau
    const playerVelocity = e.other.linvel();
    const impactSpeed = Math.sqrt(
      playerVelocity.x ** 2 +
      playerVelocity.y ** 2 +
      playerVelocity.z ** 2
    );

    // Calculer la direction de l'impact
    const directionX = asteroidPos.x - otherPos.x;
    const directionY = asteroidPos.y - otherPos.y;
    const directionZ = asteroidPos.z - otherPos.z;

    const magnitude = Math.sqrt(
      directionX * directionX +
      directionY * directionY +
      directionZ * directionZ
    );

    // Force d'impact basée sur la vitesse du vaisseau
    const BASE_IMPULSE = 2000;
    const impactForce = BASE_IMPULSE + (impactSpeed * 100);

    // Appliquer une impulsion massive avec la direction normalisée
    rigidBodyRef.current.applyImpulse({
      x: (directionX / magnitude) * impactForce,
      y: (directionY / magnitude) * impactForce,
      z: (directionZ / magnitude) * impactForce
    }, true);

    // Rotation dramatique
    const rotationForce = impactForce * 0.5;
    rigidBodyRef.current.applyTorqueImpulse({
      x: (Math.random() - 0.5) * rotationForce,
      y: (Math.random() - 0.5) * rotationForce,
      z: (Math.random() - 0.5) * rotationForce
    }, true);

    // Vélocité angulaire pour une rotation plus spectaculaire
    const angularSpeed = 10 + (impactSpeed * 0.1);
    rigidBodyRef.current.setAngvel({
      x: (Math.random() - 0.5) * angularSpeed,
      y: (Math.random() - 0.5) * angularSpeed,
      z: (Math.random() - 0.5) * angularSpeed
    }, true);
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      type="dynamic"
      colliders={false}
      mass={0.1}
      linearDamping={0}
      angularDamping={0}
      restitution={1}
      friction={0}
      gravityScale={0}
      onCollisionEnter={handleCollision}
    >
      <CuboidCollider args={[2, 2, 2]} sensor={false} restitution={1} friction={0} />
      <AsteroidType rotation={rotation} scale={scale} />;
    </RigidBody>
  );
};

const AsteroidBelt = () => {
  const rigidBodies = useRef(null);
  const { nodes } = useGLTF('/models/asteroids.glb') as GLTFResult;

  const asteroidMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
      metalness: 0.2,
      envMapIntensity: 0.5
    });
  }, []);

  const {
    asteroidCount,
    minRadius,
    maxRadius,
    verticalSpread,
    rotationSpeed,
    asteroidMinScale,
    asteroidMaxScale,
    asteroidMass,
    colliderSize,
    impactMultiplier,
  } = useControls('Asteroid Belt', {
    asteroidCount: { value: 1500, min: 100, max: 5000, step: 100 },
    minRadius: { value: 600, min: 500, max: 1500, step: 50 },
    maxRadius: { value: 2500, min: 600, max: 3000, step: 50 },
    verticalSpread: { value: 400, min: 0, max: 800, step: 10 },
    rotationSpeed: { value: 0.1, min: 0, max: 1, step: 0.01 },
    asteroidMinScale: { value: 4, min: 1, max: 6, step: 1 },
    asteroidMaxScale: { value: 12, min: 5, max: 20, step: 1 },
    asteroidMass: { value: 100, min: 1, max: 1000, step: 10 },
    colliderSize: { value: 2, min: 1, max: 10, step: 0.5 },
    impactMultiplier: { value: 50, min: 1, max: 200, step: 1 },
  });

  const hitAsteroids = useRef(new Set<number>());

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < asteroidCount; i++) {
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const angle = (Math.random() * Math.PI * 2);
      const verticalPosition = (Math.random() - 0.5) * verticalSpread;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const randomRotationX = Math.random() * Math.PI * 2;
      const randomRotationY = Math.random() * Math.PI * 2;
      const randomRotationZ = Math.random() * Math.PI * 2;

      const scale = asteroidMinScale + Math.random() * (asteroidMaxScale - asteroidMinScale);
      const scaledMass = asteroidMass * (scale / asteroidMinScale);

      // Initial speed for orbit
      const speed = rotationSpeed * radius;
      const velocityX = -Math.sin(angle) * speed;
      const velocityZ = Math.cos(angle) * speed;

      instances.push({
        key: `asteroid_${i}`,
        position: [x, verticalPosition, z],
        rotation: [randomRotationX, randomRotationY, randomRotationZ],
        scale: [scale, scale, scale],
        rigidBodyProps: {
          type: 'dynamic',
          mass: scaledMass,
          gravityScale: 0,
          linearDamping: 0,
          angularDamping: 0,
          friction: 0.2,
          restitution: 0.3,
          lockRotations: false,
          initialLinvel: { x: velocityX, y: 0, z: velocityZ },
        },
        userData: {
          orbitRadius: radius,
          orbitAngle: angle,
          verticalPosition,
          scale: scale,
        }
      });
    }

    return instances;
  }, [asteroidCount, minRadius, maxRadius, verticalSpread, asteroidMinScale, asteroidMaxScale, asteroidMass, rotationSpeed]);


  useFrame((state, delta) => {
    if (!rigidBodies.current) return;

    rigidBodies.current.forEach((body, index) => {
      if (!body || !body.isValid() || hitAsteroids.current.has(index)) return;

      const position = body.translation();
      const userData = instances[index].userData;

      // Calculate orbital speed only for no-percuted asteroids
      const angle = Math.atan2(position.z, position.x);
      const speed = rotationSpeed * userData.orbitRadius;

      // Maintain orbital speed
      body.setLinvel(
        {
          x: -Math.sin(angle) * speed,
          y: 0,
          z: Math.cos(angle) * speed,
        },
        true
      );

      // Maintain vertical position
      body.setTranslation(
        {
          x: position.x,
          y: userData.verticalPosition,
          z: position.z,
        },
        true
      );
    });
  });

  const handleCollision = (event: any) => {
    const asteroidBody = event.target;
    const asteroidIndex = rigidBodies.current.indexOf(asteroidBody);
    const playerVelocity = event.other.linvel();

    if (asteroidIndex !== -1 && !hitAsteroids.current.has(asteroidIndex)) {
      hitAsteroids.current.add(asteroidIndex);

      const impactDirection = new THREE.Vector3(
        playerVelocity.x,
        playerVelocity.y,
        playerVelocity.z
      ).normalize();

      const asteroidScale = instances[asteroidIndex].userData.scale;
      const scaleAdjustedForce = impactMultiplier * asteroidMass * (asteroidMinScale / asteroidScale);

      asteroidBody.applyImpulse(
        {
          x: impactDirection.x * scaleAdjustedForce,
          y: impactDirection.y * scaleAdjustedForce,
          z: impactDirection.z * scaleAdjustedForce,
        },
        true
      );

      asteroidBody.applyTorqueImpulse(
        {
          x: (Math.random() - 0.5) * scaleAdjustedForce,
          y: (Math.random() - 0.5) * scaleAdjustedForce,
          z: (Math.random() - 0.5) * scaleAdjustedForce,
        },
        true
      );
    }
  };

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      colliders={false}
      onCollisionEnter={handleCollision}
      colliderNodes={[
        <CuboidCollider
          args={[colliderSize, colliderSize, colliderSize]}
          sensor={false}
          restitution={0.3}
          friction={0.2}
        />
      ]}
    >
      <instancedMesh
        args={[nodes.Asteroid_Small.geometry, asteroidMaterial, asteroidCount]}
        count={asteroidCount}
      />
    </InstancedRigidBodies>
  );
};

export default AsteroidBelt;

useGLTF.preload("/models/asteroids.glb");
