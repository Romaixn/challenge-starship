import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { useMemo } from "react";

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

export const BigAsteroid = (props: JSX.IntrinsicElements["group"]) => {
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

export const SmallAsteroid = (props: JSX.IntrinsicElements["group"]) => {
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
  types = [BigAsteroid, SmallAsteroid],
}) => {
  const AsteroidType = useMemo(() => {
    return types[Math.floor(Math.random() * types.length)];
  }, [types]);

  const position = useMemo<[number, number, number]>(() => {
    if (initialPosition) return initialPosition;
    return [
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
      Math.random() * 100 - 50,
    ];
  }, [initialPosition]);

  const rotation = useMemo<[number, number, number]>(() => {
    return [
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
    ];
  }, []);

  const scale = useMemo(() => {
    return Math.random() * 1.0 + 2.0; // Scale between 0.5 and 1
  }, []);

  return <AsteroidType position={position} rotation={rotation} scale={scale} />;
};

useGLTF.preload("/models/asteroids.glb");
