import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const fireworksVertexShader = `
  uniform float time;
  uniform float seed;
  uniform vec3 baseColor;
  
  attribute float size;
  attribute float delay;
  attribute float explosionTime;
  attribute vec3 velocity;
  attribute vec3 color;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  float random(float seed) {
    return fract(sin(seed * 78.233) * 43758.5453);
  }

  void main() {
    float particleTime = max(0.0, time - delay);
    float explosionProgress = particleTime / explosionTime;

    vec3 pos = position;

    if (explosionProgress > 0.0 && explosionProgress < 1.0) {
      if (explosionProgress < 0.3) {
        float rocketProgress = explosionProgress / 0.3;
        pos.y += rocketProgress * 5.0;
      } 
      else {
        float dispersalProgress = (explosionProgress - 0.3) / 0.7;
        
        vec3 movement = velocity * dispersalProgress * 4.0;
        
        movement.y -= dispersalProgress * dispersalProgress * 2.0;
        
        float turbulence = sin(time * 5.0 + random(seed + float(gl_VertexID)) * 10.0) * 0.1;
        movement.xz += vec2(turbulence);
        
        pos += movement;
      }

      vAlpha = 1.0 - smoothstep(0.7, 1.0, explosionProgress);
      vColor = mix(baseColor, color, explosionProgress);
      vColor *= (1.0 + sin(time * 10.0) * 0.2);
    } else {
      vAlpha = 0.0;
      vColor = vec3(0.0);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    float finalSize = size * (1.0 - explosionProgress * 0.5);
    gl_PointSize = finalSize * (100.0 / -mvPosition.z); // Réduit de 300.0 à 100.0
  }
`;

const fireworksFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    
    float glow = exp(-dist * 3.0);
    float halo = smoothstep(0.4, 0.5, dist);
    
    vec3 finalColor = vColor * (glow + halo * 0.5);
    float alpha = vAlpha * (1.0 - smoothstep(0.4, 0.5, dist));
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

interface FireworkProps {
  position?: [number, number, number];
  count?: number;
  scale?: number;
  spread?: number;
}

const generateRandomColor = () => {
  const colors = [
    new THREE.Color(0xff0000),
    new THREE.Color(0x00ff00),
    new THREE.Color(0x0000ff),
    new THREE.Color(0xffff00),
    new THREE.Color(0xff00ff),
    new THREE.Color(0x00ffff),
    new THREE.Color(0xffa500),
    new THREE.Color(0xff1493),
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const FireworksEffect = ({
  position = [0, 0, 0],
  count = 5,
  scale = 1,
  spread = 10,
}: FireworkProps) => {
  const groupRef = useRef<THREE.Group>();
  const startTime = useRef(Date.now() / 1000);

  const fireworks = useMemo(() => {
    const systems = [];

    for (let f = 0; f < count; f++) {
      const angle = (f / count) * Math.PI * 2 + Math.random() * 0.5;
      const radiusVariation = Math.random() * 0.4 + 0.8;
      const radius = spread * radiusVariation;

      const offset = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.random() * 2,
        Math.sin(angle) * radius,
      );

      const PARTICLES_PER_FIREWORK = 200;
      const baseColor = generateRandomColor();

      const positions = new Float32Array(PARTICLES_PER_FIREWORK * 3);
      const velocities = new Float32Array(PARTICLES_PER_FIREWORK * 3);
      const colors = new Float32Array(PARTICLES_PER_FIREWORK * 3);
      const sizes = new Float32Array(PARTICLES_PER_FIREWORK);
      const delays = new Float32Array(PARTICLES_PER_FIREWORK);
      const explosionTimes = new Float32Array(PARTICLES_PER_FIREWORK);

      for (let i = 0; i < PARTICLES_PER_FIREWORK; i++) {
        positions[i * 3] = offset.x + (Math.random() - 0.5) * 0.1;
        positions[i * 3 + 1] = offset.y;
        positions[i * 3 + 2] = offset.z + (Math.random() - 0.5) * 0.1;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = Math.random() * 1 + 0.5;

        const outwardDirection = new THREE.Vector3(
          Math.cos(angle),
          0,
          Math.sin(angle),
        ).multiplyScalar(0.3);

        velocities[i * 3] =
          Math.sin(phi) * Math.cos(theta) * speed + outwardDirection.x;
        velocities[i * 3 + 1] =
          Math.abs(Math.sin(phi) * Math.sin(theta)) * speed * 1.2;
        velocities[i * 3 + 2] = Math.cos(phi) * speed + outwardDirection.z;

        const variation = 0.2;
        colors[i * 3] = baseColor.r + (Math.random() - 0.5) * variation;
        colors[i * 3 + 1] = baseColor.g + (Math.random() - 0.5) * variation;
        colors[i * 3 + 2] = baseColor.b + (Math.random() - 0.5) * variation;

        sizes[i] = Math.random() * 6 + 4;

        delays[i] = Math.random() * 0.2 + f * 0.1;
        explosionTimes[i] = Math.random() * 0.3 + 0.7;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute(
        "velocity",
        new THREE.BufferAttribute(velocities, 3),
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
      geometry.setAttribute("delay", new THREE.BufferAttribute(delays, 1));
      geometry.setAttribute(
        "explosionTime",
        new THREE.BufferAttribute(explosionTimes, 1),
      );

      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          seed: { value: Math.random() * 100 },
          baseColor: { value: baseColor },
        },
        vertexShader: fireworksVertexShader,
        fragmentShader: fireworksFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      systems.push({ geometry, material });
    }

    return systems;
  }, [count, spread]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const elapsedTime = Date.now() / 1000 - startTime.current;

    const cameraDistance = state.camera.position.distanceTo(
      new THREE.Vector3(...position),
    );
    state.camera.far = Math.max(state.camera.far, cameraDistance * 2);
    state.camera.updateProjectionMatrix();

    fireworks.forEach(({ material }) => {
      material.uniforms.time.value = elapsedTime;
    });
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {fireworks.map((firework, index) => (
        <points
          key={index}
          geometry={firework.geometry}
          material={firework.material}
          frustumCulled={false}
        />
      ))}
    </group>
  );
};

export default FireworksEffect;
