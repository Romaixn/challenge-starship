import { forwardRef, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
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
  position: THREE.Vector3;
  size?: number;
  speed?: number;
  offset?: number;
  rotationSpeed?: number;
  shouldRotate?: boolean;
  seed?: number;
}

const textures = [
  // Habitable
  { texture: "/planets/habitable/Alpine.png", color: "#334635" },
  { texture: "/planets/habitable/Savannah.png", color: "#A8B624" },
  { texture: "/planets/habitable/Swamp.png", color: "#232B06" },
  { texture: "/planets/habitable/Tropical.png", color: "#017DA9" },
  // Gas
  { texture: "/planets/gaseous/Gaseous1.jpg", color: "#655A46" },
  { texture: "/planets/gaseous/Gaseous2.jpg", color: "#AA777D" },
  { texture: "/planets/gaseous/Gaseous3.jpg", color: "#9CBF89" },
  { texture: "/planets/gaseous/Gaseous4.jpg", color: "#D1466D" },
  // Inhospitable
  { texture: "/planets/inhospitable/Icy.png", color: "#AAC3CD" },
  { texture: "/planets/inhospitable/Martian.png", color: "#784233" },
  { texture: "/planets/inhospitable/Venusian.png", color: "#73370B" },
  { texture: "/planets/inhospitable/Volcanic.png", color: "#B6412D" },
  // Terrestrial
  { texture: "/planets/terrestrial/Terrestrial1.png", color: "#00AAFF" },
  { texture: "/planets/terrestrial/Terrestrial2.png", color: "#00AAFF" },
  { texture: "/planets/terrestrial/Terrestrial3.png", color: "#00AAFF" },
  { texture: "/planets/terrestrial/Terrestrial4.png", color: "#00AAFF" },
];

const Planet = forwardRef<THREE.Mesh, PlanetProps>(
  (
    { position, size = 1, rotationSpeed = 0.1, shouldRotate = true, seed = 0 },
    ref,
  ) => {
    const planet = useRef();

    const { texture, color } = useMemo(() => {
      const index =
        Math.abs(Math.floor(seed * textures.length)) % textures.length;
      return textures[index];
    }, [seed]);

    const planetTexture = useMemo(() => {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(texture);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      return tex;
    }, [texture]);

    const uniforms = useMemo(
      () => ({
        uPlanetTexture: { value: planetTexture },
        uSunDirection: { value: new THREE.Vector3(0, 0, 0) },
        uAtmosphereDayColor: { value: new THREE.Color(color) },
        uAtmosphereTwilightColor: { value: new THREE.Color("#ff6600") },
      }),
      [planetTexture, color],
    );

    useFrame((state) => {
      const { clock } = state;

      if (planet.current) {
        if (shouldRotate) {
          planet.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
        }

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
          <mesh ref={planet}>
            <sphereGeometry args={[size, 64, 64]} />
            <shaderMaterial
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              uniforms={uniforms}
            />
          </mesh>
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
