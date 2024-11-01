import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

const vertexShader = `
  uniform float time;
  
  attribute vec3 velocity;
  attribute float size;
  attribute float delay;
  attribute float lifespan;
  
  varying float vOpacity;
  varying vec3 vColor;
  
  // Fonction utilitaire pour interpolation douce
  float cubicOut(float t) {
    float f = t - 1.0;
    return f * f * f + 1.0;
  }
  
  // Fonction pour générer une couleur basée sur la vitesse et le temps
  vec3 generateColor(float progress, vec3 baseVelocity) {
    vec3 hotColor = vec3(1.0, 0.8, 0.3);  // Jaune chaud
    vec3 coolColor = vec3(1.0, 0.2, 0.0);  // Rouge foncé
    float temperature = length(baseVelocity) * (1.0 - progress);
    return mix(coolColor, hotColor, temperature);
  }
  
  void main() {
    // Calcul du temps de vie de la particule
    float particleTime = max(0.0, time - delay);
    float progress = particleTime / lifespan;
    progress = min(1.0, progress);
    
    // Position initiale
    vec3 pos = position;
    
    // Application de la vélocité avec effet d'explosion
    float explosionForce = cubicOut(1.0 - progress) * 2.0;
    vec3 movement = velocity * explosionForce;
    
    // Ajout de turbulence
    float turbulence = sin(time * 5.0 + length(position) * 2.0) * 0.1;
    movement *= (1.0 + turbulence);
    
    // Effet de gravité
    float gravity = -2.0;
    movement.y += gravity * particleTime * particleTime;
    
    // Position finale
    pos += movement;
    
    // Calcul de la couleur
    vColor = generateColor(progress, velocity);
    
    // Calcul de l'opacité
    vOpacity = 1.0 - progress;
    vOpacity *= smoothstep(0.0, 0.2, progress); // Fade in
    
    // Position finale dans l'espace de la caméra
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    
    // Taille variable des particules
    float sizeMultiplier = (1.0 - progress * 0.5);
    gl_PointSize = size * sizeMultiplier * (300.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  uniform sampler2D particleTexture;
  
  varying float vOpacity;
  varying vec3 vColor;
  
  void main() {
    // Lecture de la texture de particule
    vec2 uv = gl_PointCoord;
    vec4 texColor = texture2D(particleTexture, uv);
    
    // Ajout d'un effet de glow
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    float glow = exp(-dist * 3.0);
    
    // Couleur finale
    vec3 finalColor = vColor + glow * 0.5;
    
    gl_FragColor = vec4(finalColor, vOpacity * texColor.a);
  }
`;

interface AdvancedExplosionProps {
  scale?: number;
  onComplete?: () => void; // Callback optionnel quand l'explosion est terminée
}

const ExplosionEffect: React.FC<AdvancedExplosionProps> = ({
  scale = 1,
  onComplete,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now() / 1000);
  const hasCompleted = useRef(false);

  const particleTexture = useTexture("/textures/fire.png");

  const PARTICLE_COUNT = 3000;
  const EXPLOSION_DURATION = 1.5; // Durée totale de l'explosion en secondes

  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const delays = new Float32Array(PARTICLE_COUNT);
    const lifespans = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Positions initiales plus concentrées
      positions[i3] = (Math.random() - 0.5) * 0.05;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.05;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.05;

      // Distribution sphérique des vélocités
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = Math.random() * 3 + 1;

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i3 + 2] = Math.cos(phi) * speed;

      // Tailles variées
      sizes[i] = Math.random() * 30 + 20;

      // Délais plus courts pour une explosion plus instantanée
      delays[i] = Math.random() * 0.05;

      // Durées de vie variables mais plus courtes
      lifespans[i] = Math.random() * 0.3 + 0.7;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("delay", new THREE.BufferAttribute(delays, 1));
    geometry.setAttribute("lifespan", new THREE.BufferAttribute(lifespans, 1));

    return geometry;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        particleTexture: { value: particleTexture },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [particleTexture]);

  useFrame(() => {
    if (!pointsRef.current) return;

    const elapsedTime = Date.now() / 1000 - startTime.current;
    material.uniforms.time.value = elapsedTime;

    // Vérifier si l'explosion est terminée
    if (elapsedTime >= EXPLOSION_DURATION && !hasCompleted.current) {
      hasCompleted.current = true;
      if (onComplete) {
        onComplete();
      }
    }
  });

  return (
    <points
      ref={pointsRef}
      geometry={particles}
      material={material}
      scale={scale}
    />
  );
};

export default ExplosionEffect;
