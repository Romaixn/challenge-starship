import * as THREE from "three";

export class PositionTracker {
  private lastUpdateTime: number = 0;
  private updateInterval: number = 200; // Mise à jour toutes les 200ms
  private lastDistance: number = Infinity;
  private triggerDistance: number;
  private isTriggered: boolean = false;
  private onTrigger: () => void;

  constructor(triggerDistance: number, onTrigger: () => void) {
    this.triggerDistance = triggerDistance;
    this.onTrigger = onTrigger;
  }

  checkPosition(position: THREE.Vector3): void {
    const currentTime = performance.now();

    // Ne vérifier que toutes les 200ms
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return;
    }

    const distance = position.length();

    // Éviter les calculs si on n'est pas proche de la zone de déclenchement
    if (this.lastDistance > this.triggerDistance * 1.5 &&
      distance > this.triggerDistance * 1.5) {
      this.lastDistance = distance;
      this.lastUpdateTime = currentTime;
      return;
    }

    // Vérifier si on franchit le seuil
    if (!this.isTriggered && distance <= this.triggerDistance) {
      this.isTriggered = true;
      this.onTrigger();
    }

    this.lastDistance = distance;
    this.lastUpdateTime = currentTime;
  }

  reset(): void {
    this.isTriggered = false;
    this.lastDistance = Infinity;
  }
}