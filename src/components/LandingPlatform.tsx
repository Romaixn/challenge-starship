import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { INITIAL_Z_POSITION } from "@/LandingPlayer";
import { GLTF } from "three-stdlib";
import { RigidBody } from "@react-three/rapier";

type GLTFResult = GLTF & {
  nodes: {
    Landing_Pad: THREE.Mesh;
    landingarm: THREE.Mesh;
    landingarm_1: THREE.Mesh;
    landingarm_2: THREE.Mesh;
  };
  materials: {
    landingpad: THREE.MeshStandardMaterial;
    grey: THREE.MeshStandardMaterial;
    orange: THREE.MeshStandardMaterial;
    black: THREE.MeshStandardMaterial;
  };
};

interface LandingPlatformProps {
  planetRadius: number;
  scale?: number;
}

export const LandingPlatform = ({
  planetRadius,
  scale = 1,
}: LandingPlatformProps) => {
  const platformRef = useRef<THREE.Group>();
  const lightRef = useRef<THREE.PointLight>();

  useEffect(() => {
    if (platformRef.current) {
      platformRef.current.position.set(0, planetRadius, INITIAL_Z_POSITION);
      platformRef.current.rotation.set(0, Math.PI / 2, 0);
    }
  }, [planetRadius]);

  useFrame((state) => {
    if (lightRef.current) {
      const intensity = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      lightRef.current.intensity = intensity;
    }
  });

  return (
    <group ref={platformRef} scale={scale}>
      <LandingModel rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};

const LandingModel = (props: JSX.IntrinsicElements["group"]) => {
  const { nodes, materials } = useGLTF("/models/landing.glb") as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <RigidBody name="landing_pad" type="fixed" colliders="cuboid">
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Landing_Pad.geometry}
          material={materials.landingpad}
        />
      </RigidBody>
      {/*   <RigidBody name="landing_arm" type="fixed" colliders="cuboid">
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landingarm.geometry}
          material={materials.grey}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landingarm_1.geometry}
          material={materials.orange}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.landingarm_2.geometry}
          material={materials.black}
        />
      </RigidBody>*/}
    </group>
  );
};

useGLTF.preload("/models/landing.glb");
