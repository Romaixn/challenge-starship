import { create } from "zustand";
import * as THREE from "three";
import { subscribeWithSelector } from "zustand/middleware";

interface ShieldOrb {
  id: string;
  position: THREE.Vector3;
  collected: boolean;
}

interface ShieldSystemState {
  orbs: ShieldOrb[];
  orbsCollected: number;
  isShieldActive: boolean;
  totalRequiredOrbs: number;
  nextOrbPosition: THREE.Vector3 | null;
  initializeOrbs: () => void;
  collectOrb: (id: string) => void;
  updateNextVisibleOrb: () => void;
}

const generateOrbPositions = (
  count: number,
  minRadius: number,
  maxRadius: number,
): THREE.Vector3[] => {
  const positions: THREE.Vector3[] = [];
  const maxVerticalOffset = 400;
  let minDistanceBetweenOrbs = (maxRadius - minRadius) * 0.15;
  const sectorAngle = (Math.PI * 2) / count;

  for (let i = 0; i < count; i++) {
    let position: THREE.Vector3;
    let attempts = 0;
    let tooClose: boolean;

    do {
      attempts++;

      const baseAngle = i * sectorAngle;
      const angleVariation = sectorAngle * 0.5;
      const horizontalAngle =
        baseAngle + (Math.random() - 0.5) * angleVariation;

      const verticalOffset = (Math.random() - 0.5) * 2 * maxVerticalOffset;

      const radiusRange = maxRadius - minRadius;
      const radius =
        minRadius + radiusRange * 0.2 + Math.random() * radiusRange * 0.6;

      position = new THREE.Vector3(
        radius * Math.cos(horizontalAngle),
        verticalOffset,
        radius * Math.sin(horizontalAngle),
      );

      tooClose = positions.some(
        (existingPos) =>
          position.distanceTo(existingPos) < minDistanceBetweenOrbs,
      );

      if (attempts > 50) {
        minDistanceBetweenOrbs *= 0.9;
        attempts = 0;
      }
    } while (tooClose && minDistanceBetweenOrbs > 100);

    positions.push(position);
  }

  const spawnPoint = new THREE.Vector3(0, 0, 5000);
  positions.sort((a, b) => {
    const distA = spawnPoint.distanceTo(a);
    const distB = spawnPoint.distanceTo(b);

    const scoreA = distA - Math.abs(a.y) * 10;
    const scoreB = distB - Math.abs(b.y) * 10;

    return scoreA - scoreB;
  });

  return positions;
};

export const useShieldSystem = create<ShieldSystemState>()(
  subscribeWithSelector((set, get) => ({
    orbs: [],
    orbsCollected: 0,
    isShieldActive: true,
    totalRequiredOrbs: 3,
    nextOrbPosition: null,

    initializeOrbs: () => {
      const positions = generateOrbPositions(3, 600, 2500);
      const orbs = positions.map((position, index) => ({
        id: `orb-${index}`,
        position,
        collected: false,
      }));

      set({
        orbs,
        orbsCollected: 0,
        isShieldActive: true,
        nextOrbPosition: positions[0],
      });
    },

    collectOrb: (id: string) => {
      const { orbs, orbsCollected, totalRequiredOrbs } = get();
      const updatedOrbs = orbs.map((orb) =>
        orb.id === id ? { ...orb, collected: true } : orb,
      );

      const newOrbsCollected = orbsCollected + 1;
      const isShieldActive = newOrbsCollected < totalRequiredOrbs;

      set({
        orbs: updatedOrbs,
        orbsCollected: newOrbsCollected,
        isShieldActive,
      });

      get().updateNextVisibleOrb();
    },

    updateNextVisibleOrb: () => {
      const { orbs, orbsCollected } = get();
      const nextUncollectedOrb = orbs.find(
        (orb, index) => index > orbsCollected - 1 && !orb.collected,
      );
      set({ nextOrbPosition: nextUncollectedOrb?.position || null });
    },
  })),
);
