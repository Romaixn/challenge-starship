import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useControls } from 'leva';
import vertexShader from '@/shaders/engine/vertex.glsl';
import fragmentShader from '@/shaders/engine/fragment.glsl';

interface RocketEngineProps {
  position?: [number, number, number];
  scale?: number;
  intensity?: number;
  color?: string;
}

const RocketEngine: React.FC<RocketEngineProps> = ({
   position = [0, 0, 0],
   scale = 1,
   intensity = 1.0,
   color = '#00aaff'
 }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const engineLightRef = useRef<THREE.PointLight>(null);

  const particleTexture = useTexture('/textures/fire.png');

  const {
    particleCount,
    particleSize,
    engineLength,
    spreadRadius,
    engineBrightness,
    particleSpeed
  } = useControls('Rocket Engine', {
    particleCount: { value: 1000, min: 100, max: 5000, step: 100 },
    particleSize: { value: 5, min: 1, max: 20, step: 1 },
    engineLength: { value: 2, min: 0.1, max: 10, step: 0.1 },
    spreadRadius: { value: 0.5, min: 0.1, max: 2, step: 0.1 },
    engineBrightness: { value: 0.5, min: 0.1, max: 3, step: 0.1 },
    particleSpeed: { value: 6, min: 2, max: 30, step: 1 }
  });

  // Generate particles
  const particles = useMemo(() => {
    const vertices = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Initial positions in a cone shape
      const angle = Math.random() * Math.PI * 2;
      const radiusAtBase = Math.random() * spreadRadius;
      const heightInCone = -Math.random() * engineLength;

      vertices[i * 3] = Math.cos(angle) * radiusAtBase;
      vertices[i * 3 + 1] = heightInCone;
      vertices[i * 3 + 2] = Math.sin(angle) * radiusAtBase;

      // Velocities pointing downward in a cone
      velocities[i * 3] = Math.cos(angle) * 0.1;
      velocities[i * 3 + 1] = -particleSpeed;
      velocities[i * 3 + 2] = Math.sin(angle) * 0.1;

      // Random lifetimes for continuous flow
      lifetimes[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));

    return geometry;
  }, [particleCount, engineLength, spreadRadius, particleSpeed]);

  const engineMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        particleTexture: { value: particleTexture },
        engineColor: { value: new THREE.Color(color) },
        engineIntensity: { value: intensity * engineBrightness },
        particleSize: { value: particleSize }
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });
  }, [color, intensity, engineBrightness, particleSize, particleTexture]);

  useFrame((state) => {
    if (particlesRef.current && engineLightRef.current) {
      engineMaterial.uniforms.time.value = state.clock.getElapsedTime();

      // Flicker the engine light slightly
      const flicker = 0.9 + Math.random() * 0.2;
      engineLightRef.current.intensity = 20 * intensity * engineBrightness * flicker;
    }
  });

  return (
    <group position={position} scale={scale} rotation={[0, 0, Math.PI / 2]}>
      <points ref={particlesRef} geometry={particles} material={engineMaterial} />

      <pointLight
        position={[0, -1, 0]}
        ref={engineLightRef}
        color={color}
        intensity={20 * intensity * engineBrightness}
        distance={20}
        decay={2}
      />
    </group>
  );
};

export default RocketEngine;