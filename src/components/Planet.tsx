import { useMemo, useRef, useState, forwardRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
// @ts-ignore
import { TextureLoader } from "three/src/loaders/TextureLoader";
import * as THREE from "three";

// @ts-ignore
import vertexShader from "@/shaders/planet/vertex.glsl";
// @ts-ignore
import fragmentShader from "@/shaders/planet/fragment.glsl";
// @ts-ignore
import atmosphereVertexShader from "@/shaders/atmosphere/vertex.glsl";
// @ts-ignore
import atmosphereFragmentShader from "@/shaders/atmosphere/fragment.glsl";
import { RigidBody } from "@react-three/rapier";

interface PlanetProps {
  position: THREE.Vector3;
  size?: number;
  speed?: number;
  offset?: number;
  rotationSpeed?: number;
  texture?: string;
  color?: string;
}

const Planet = forwardRef<THREE.Mesh, PlanetProps>(
  (
    {
      position,
      size = 1,
      rotationSpeed = 0.1,
      texture = "/planets/habitable/Tropical.png",
      color = "#00aaff",
    },
    ref,
  ) => {
    const planetTexture = useLoader(TextureLoader, texture);
    planetTexture.colorSpace = THREE.SRGBColorSpace;
    planetTexture.anisotropy = 8;

    const planet = useRef();

    const uniforms = useMemo(
      () => ({
        uPlanetTexture: new THREE.Uniform(planetTexture),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
        uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(color)),
        uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color("#ff6600")),
      }),
      [],
    );

    useFrame((state) => {
      const { clock } = state;

      if (planet.current) {
        planet.current.rotation.y = clock.getElapsedTime() * rotationSpeed;

        // Sun direction
        const sunDirection = new THREE.Vector3(
          -planet.current.position.x,
          0,
          -planet.current.position.z,
        ).normalize();
        planet.current.material.uniforms.uSunDirection.value = sunDirection;
      }
    });

    return (
      <>
        <group ref={ref} position={position}>
          <Atmosphere
            position={position}
            size={size}
            dayColor={color}
            twilightColor="#ff6600"
          />
          <RigidBody colliders="ball">
            <mesh ref={planet}>
              <sphereGeometry args={[size, 64, 64]} />
              <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
              />
            </mesh>
          </RigidBody>
        </group>
      </>
    );
  },
);

interface AtmosphereProps {
  size: number;
  dayColor: string;
  twilightColor: string;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  size,
  dayColor,
  twilightColor,
}) => {
  const atmosphere = useRef<THREE.Mesh | null>(null);
  const uniforms = useMemo(
    () => ({
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
      uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(dayColor)),
      uAtmosphereTwilightColor: new THREE.Uniform(
        new THREE.Color(twilightColor),
      ),
    }),
    [],
  );

  useFrame(() => {
    if (atmosphere.current) {
      // Sun direction
      const sunDirection = new THREE.Vector3(
        -atmosphere.current.position.x,
        0,
        -atmosphere.current.position.z,
      ).normalize();
      (
        atmosphere.current.material as THREE.ShaderMaterial
      ).uniforms.uSunDirection.value = sunDirection;
    }
  });

  return (
    // @ts-ignore
    <mesh ref={atmosphere} scale={[1.04, 1.04, 1.04]}>
      <sphereGeometry args={[size, 64, 64]} />
      <shaderMaterial
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        transparent
      />
    </mesh>
  );
};

export default Planet;
