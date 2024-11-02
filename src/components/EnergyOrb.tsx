import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { BallCollider, RigidBody } from "@react-three/rapier";

const vertexShader = `
varying vec3 vNormal;
varying vec2 vUv;
uniform float uTime;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vUv = uv;
  
  vec3 pos = position;
  // Pulsating effect
  float scale = 1.0 + sin(uTime * 2.0) * 0.1;
  pos *= scale;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

void main() {
  // Energy swirl pattern
  float pattern = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
  pattern *= sin(vUv.y * 10.0 + uTime) * 0.5 + 0.5;
  
  // Glow effect
  vec3 glowColor = uColor + pattern * 0.5;
  
  // Fresnel
  vec3 viewDirection = normalize(cameraPosition - vNormal);
  float fresnelTerm = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 2.0);
  
  vec3 finalColor = mix(glowColor, vec3(1.0), fresnelTerm);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface EnergyOrbProps {
  position: THREE.Vector3;
  id: string;
  onCollect: (id: string) => void;
}

export const EnergyOrb: React.FC<EnergyOrbProps> = ({
  position,
  id,
  onCollect,
}) => {
  const orbRef = useRef();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ffaa) },
    }),
    [],
  );

  const [isCollecting, setIsCollecting] = useState(false);

  useFrame((state) => {
    if (!orbRef.current) return;
    uniforms.uTime.value = state.clock.elapsedTime;

    if (!isCollecting) {
      orbRef.current.position.y =
        position.y + Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  const handleIntersectionEnter = (e) => {
    if (e.other.rigidBody.userData?.type === "player" && !isCollecting) {
      setIsCollecting(true);

      if (orbRef.current) {
        const duration = 0.5;
        const startTime = Date.now();
        const initialScale = orbRef.current.scale.x;

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / (duration * 1000), 1);

          if (orbRef.current) {
            const newScale = initialScale * (1 - progress);
            orbRef.current.scale.set(newScale, newScale, newScale);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              onCollect(id);
            }
          }
        };

        animate();
      }
    }
  };

  return (
    <group ref={orbRef} position={position}>
      <RigidBody colliders={false}>
        <BallCollider
          args={[40]}
          sensor
          onIntersectionEnter={handleIntersectionEnter}
        />
        <mesh>
          <sphereGeometry args={[20, 32, 32]} />
          <shaderMaterial
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            uniforms={uniforms}
            transparent={true}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>
    </group>
  );
};
