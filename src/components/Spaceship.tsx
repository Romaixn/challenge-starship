// @ts-nocheck

import * as THREE from "three";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import RocketEngine from "@/components/RocketEngine.tsx";

type GLTFResult = GLTF & {
  nodes: {
    GreenShip_Body: THREE.Mesh;
    GreenShip_LandingGearItem1: THREE.Mesh;
    GreenShip_LandingGearItem2: THREE.Mesh;
    GreenShip_LandingGearItem3: THREE.Mesh;
    GreenShip_LandingGearItem4: THREE.Mesh;
  };
  materials: {
    GreenShip: THREE.MeshStandardMaterial;
    LandingGear1: THREE.MeshStandardMaterial;
  };
};

export default function Spaceship(props: JSX.IntrinsicElements["group"]) {
  const { nodes, materials } = useGLTF("/models/spaceship.glb") as GLTFResult;
  return (
    <group
      {...props}
      position={[0, 0, -4.5]}
      rotation={[0, Math.PI / 2, 0]}
      dispose={null}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.GreenShip_Body.geometry}
        material={materials.GreenShip}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.GreenShip_LandingGearItem1.geometry}
        material={materials.LandingGear1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.GreenShip_LandingGearItem2.geometry}
        material={materials.LandingGear1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.GreenShip_LandingGearItem3.geometry}
        material={materials.LandingGear1}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.GreenShip_LandingGearItem4.geometry}
        material={materials.LandingGear1}
      />
      <RocketEngine
        position={[-37, 0, 0]}
        scale={3}
        engineColor="#ff3300"
        intensity={1.2}
      />
    </group>
  );
}

useGLTF.preload("/models/spaceship.glb");
