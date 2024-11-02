import { useEffect, useRef } from "react";
import { UI } from "@alienkitty/space.js";
import { css } from "../../styled-system/css";
import { isMobile } from "react-device-detect";
import useSound from "@/stores/useSound.ts";
import { useJoystickControls } from "@/stores/useJoystickControls.ts";
import useGame from "@/stores/useGame.ts";
import useHealth from "@/stores/useHealth.ts";

const HUD = () => {
  const containerRef = useRef(null);
  const uiInstance = useRef(null);
  const animationFrameRef = useRef(null);
  const isDetailsShown = useRef(true);
  const toggleSound = useSound((state) => state.toggleSound);
  const soundPlaying = useSound((state) => state.soundPlaying);
  const currentHealth = useHealth((state) => state.currentHealth);
  const initialLandingInstructionsShown = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let i = 0;

    // Initialize UI instance with all components
    uiInstance.current = new UI({
      fps: true,
      header: {
        links: [
          {
            title: "Starship - rherault",
            link: "https://rherault.dev",
          },
        ],
      },
      info: {
        content: `<div class="health-status health-optimal">
             HULL INTEGRITY OPTIMAL<br>
             <span style="font-size: 0.9em; opacity: 0.9">Integrity: ${currentHealth}%</span>
           </div>`,
      },
      details: {
        background: true,
        title: "Flight Systems",
        content: !isMobile
          ? `WASD or Arrow Keys - Navigation Control<br>
         SHIFT/SPACE - Thruster Boost<br><br>
         <span style="opacity: var(--ui-secondary-opacity)">Press any key to acknowledge...</span>`
          : `Joystick - Navigation Control<br>
         Right Button - Thruster Boost<br><br>
         <span style="opacity: var(--ui-secondary-opacity)">Touch to acknowledge...</span>`,
      },
      instructions: {
        content: "MISSION DIRECTIVE: REACH THE PLANET",
      },
      detailsButton: true,
      muteButton: {
        sound: soundPlaying,
        callback: () => {
          // Necessary to prevent callback at initialization (idk why)
          ++i;
          if (i > 1) {
            toggleSound();
          }
        },
      },
    });

    // Animate in the UI
    uiInstance.current.animateIn();
    uiInstance.current.info.animateIn();
    uiInstance.current.instructions.animateIn();
    uiInstance.current.toggleDetails(true);

    // Update info content based on phase
    const unsubscribePhase = useGame.subscribe((state) => {
      if (uiInstance.current) {
        if (
          state.phase === "landing" &&
          state.landingTransitionComplete &&
          !initialLandingInstructionsShown.current
        ) {
          initialLandingInstructionsShown.current = true;

          uiInstance.current.details.content.html(
            !isMobile
              ? `<span style="opacity: var(--ui-secondary-opacity)">LANDING SEQUENCE PROTOCOLS:</span><br>
         ⬆️ UP - Retro Thrusters (Decelerate)<br>
         ⬇️ DOWN - Forward Thrusters (Accelerate)<br>
         ⬅️ LEFT/RIGHT ➡️ - Attitude Control<br><br>
         <span style="color: var(--ui-color-range-3)">MISSION PARAMETERS:</span><br>
         • Maintain structural integrity<br>
         • Achieve optimal landing velocity<br>
         • Align with designated landing zone<br><br>
         <span style="opacity: var(--ui-secondary-opacity)">Press any key to initiate landing sequence...</span>`
              : `<span style="opacity: var(--ui-secondary-opacity)">LANDING SEQUENCE PROTOCOLS:</span><br>
         ⬆️ UP - Retro Thrusters<br>
         ⬇️ DOWN - Forward Thrusters<br>
         ⬅️ LEFT/RIGHT ➡️ - Attitude Control<br><br>
         <span style="color: var(--ui-color-range-3)">MISSION PARAMETERS:</span><br>
         • Maintain structural integrity<br>
         • Achieve optimal landing velocity<br>
         • Align with designated landing zone<br><br>
         <span style="opacity: var(--ui-secondary-opacity)">Touch to initiate landing sequence...</span>`,
          );

          uiInstance.current.toggleDetails(true);
          isDetailsShown.current = true;

          uiInstance.current.instructions.content.html(
            "CRITICAL MISSION: EXECUTE LANDING MANEUVER",
          );
        }

        if (state.phase === "space") {
          uiInstance.current.instructions.content.html(
            "MISSION DIRECTIVE: REACH THE PLANET",
          );

          initialLandingInstructionsShown.current = false;
        }
      }
    });

    const getHealthStatus = (
      health: number,
    ): { color: string; text: string; class: string } => {
      if (health > 90) {
        return {
          color: "health-optimal",
          text: "HULL INTEGRITY OPTIMAL",
          class: "health-optimal",
        };
      }
      if (health > 75) {
        return {
          color: "health-good",
          text: "HULL INTEGRITY GOOD",
          class: "health-good",
        };
      }
      if (health > 50) {
        return {
          color: "health-stable",
          text: "HULL INTEGRITY STABLE",
          class: "health-stable",
        };
      }
      if (health > 25) {
        return {
          color: "health-warning",
          text: "HULL INTEGRITY WARNING",
          class: "health-warning health-pulse",
        };
      }
      if (health > 10) {
        return {
          color: "health-critical",
          text: "HULL BREACH DETECTED",
          class: "health-critical health-pulse",
        };
      }
      return {
        color: "health-danger",
        text: "CRITICAL HULL FAILURE",
        class: "health-danger health-pulse",
      };
    };

    const unsubscribeHealth = useHealth.subscribe((state) => {
      if (uiInstance.current) {
        const healthStatus = getHealthStatus(state.currentHealth);
        uiInstance.current.info.content.html(
          `<div class="health-status ${healthStatus.class}">
             ${healthStatus.text}<br>
             <span style="font-size: 0.9em; opacity: 0.9">Integrity: ${state.currentHealth}%</span>
           </div>`,
        );
      }
    });

    // Handle key press for details
    const handleKeyPress = () => {
      if (isDetailsShown.current) {
        uiInstance.current.toggleDetails(false);
        isDetailsShown.current = false;
      }
    };

    const unsuscribeJoystickChange = useJoystickControls.subscribe(() => {
      handleKeyPress();
    });
    window.addEventListener("keydown", handleKeyPress);

    containerRef.current.appendChild(uiInstance.current.element);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (uiInstance.current) {
        uiInstance.current.update();
      }
    };
    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener("keydown", handleKeyPress);
      if (
        uiInstance.current &&
        uiInstance.current.element &&
        containerRef.current
      ) {
        containerRef.current.removeChild(uiInstance.current.element);
        uiInstance.current = null;
      }

      unsuscribeJoystickChange();
      unsubscribePhase();
      unsubscribeHealth();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={css({
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
      })}
    />
  );
};

export default HUD;
