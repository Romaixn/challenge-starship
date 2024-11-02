import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useShieldSystem } from "../stores/useShieldSystem";

const vertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  
  vec3 pos = position;
  float wave = sin(uTime * 2.0) * 0.005;
  pos.xyz += normal * wave;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform float uOpacity;
uniform vec3 uColor;

void main() {
  vec3 viewDirection = normalize(cameraPosition - vPosition);
  float fresnelTerm = 1.0 - max(dot(viewDirection, vNormal), 0.0);
  
  float edge = pow(fresnelTerm, 3.0);
  
  float pulse = sin(uTime * 1.5) * 0.15 + 0.85;
  
  vec3 baseColor = uColor * pulse;
  vec3 edgeColor = vec3(0.0, 0.2, 0.5) * (pulse + 0.2);
  
  vec3 finalColor = mix(baseColor, edgeColor, edge);
  
  float minOpacity = 0.15;
  float maxOpacity = 0.7;
  float alpha = mix(minOpacity, maxOpacity, edge) * uOpacity * pulse;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`;

interface PlanetShieldProps {
  radius: number;
}

export const PlanetShield: React.FC<PlanetShieldProps> = ({ radius }) => {
  const shieldRef = useRef();
  const isActive = useShieldSystem((state) => state.isShieldActive);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0.5 },
      uColor: { value: new THREE.Color(0x00aaff) },
    }),
    [],
  );

  useFrame((state) => {
    if (!shieldRef.current) return;

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uOpacity.value = THREE.MathUtils.lerp(
      uniforms.uOpacity.value,
      isActive ? 0.5 : 0,
      0.05,
    );
  });

  if (!isActive) return null;

  return (
    <mesh scale={[1.05, 1.05, 1.05]}>
      <sphereGeometry args={[radius, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
      />
    </mesh>
  );
};
