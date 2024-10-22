import { useMemo, useRef, useState } from "react";
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

interface PlanetProps {
  xRadius?: number;
  zRadius?: number;
  size?: number;
  speed?: number;
  offset?: number;
  rotationSpeed?: number;
  texture?: string;
  color?: string;
}

const Planet: React.FC<PlanetProps> = ({
  xRadius = 6,
  zRadius = 6,
  size = 1,
  speed = 0.01,
  offset = 0,
  rotationSpeed = 0.1,
  texture = "/planets/habitable/Tropical.png",
  color = "#00aaff",
}) => {
  const planetTexture = useLoader(TextureLoader, texture);
  planetTexture.colorSpace = THREE.SRGBColorSpace;
  planetTexture.anisotropy = 8;

  const planet = useRef<THREE.Mesh>(null!);

  const [x, setX] = useState<number>(xRadius);
  const [z, setZ] = useState<number>(zRadius);

  const uniforms = useMemo(
    () => ({
      uPlanetTexture: new THREE.Uniform(planetTexture),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 0)),
      uAtmosphereDayColor: new THREE.Uniform(new THREE.Color(color)),
      uAtmosphereTwilightColor: new THREE.Uniform(new THREE.Color("#ff6600")),
      uTimeAfterExplode: new THREE.Uniform(0),
    }),
    [],
  );

  useFrame((state) => {
    const { clock } = state;

    if (planet.current) {
      const t = clock.getElapsedTime() * speed + offset;
      setX(xRadius * Math.cos(t));
      setZ(zRadius * Math.sin(t));
      planet.current.position.x = x;
      planet.current.position.z = z;

      planet.current.rotation.y = clock.getElapsedTime() * rotationSpeed;

      // Sun direction
      const sunDirection = new THREE.Vector3(-x, 0, -z).normalize();
      (
        planet.current.material as THREE.ShaderMaterial
      ).uniforms.uSunDirection.value = sunDirection;
    }
  });

  return (
    <>
      <Atmosphere
        x={x}
        z={z}
        size={size}
        dayColor={color}
        twilightColor="#ff6600"
      />
      {/* @ts-ignore */}
      <mesh ref={planet}>
        <sphereGeometry args={[size, 64, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
        />
      </mesh>
    </>
  );
};

interface AtmosphereProps {
  x: number;
  z: number;
  size: number;
  dayColor: string;
  twilightColor: string;
}

export const Atmosphere: React.FC<AtmosphereProps> = ({
  x,
  z,
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
      atmosphere.current.position.x = x;
      atmosphere.current.position.z = z;

      // Sun direction
      const sunDirection = new THREE.Vector3(-x, 0, -z).normalize();
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
