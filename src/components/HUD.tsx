import { useEffect, useRef, useState } from "react";
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
  const [displayLandingInstructions, setDisplayLandingInstructions] =
    useState(false);

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
        content: `Health: ${currentHealth}`,
      },
      details: {
        background: true,
        title: "Controls",
        content: !isMobile
          ? `Use arrow keys or WASD to control the ship.
           Hold SPACE or SHIFT to boost. Press any key to discard this message.`
          : `Use joystick to control the ship. Use right button to boost. Touch to discard this message.`,
      },
      instructions: {
        content: "Goal: Reach the planet.",
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
      if (uiInstance.current && !displayLandingInstructions) {
        if (state.phase === "landing" && state.landingTransitionComplete) {
          setDisplayLandingInstructions(true);

          uiInstance.current.details.content.html(
            !isMobile
              ? `⬆️ UP - Slow down / Brake<br>
       ⬇️ DOWN - Accelerate<br>
       ⬅️ RIGHT / LEFT ➡️ - Control direction<br><br>
       <span style="color: #4ade80;">OBJECTIVE:</span><br>
       Land gently on the platform to succeed!<br><br>
       <span style="opacity: 0.8;">Press any key to begin landing phase...</span>`
              : `⬆️ Push UP - Slow down / Brake<br>
       ⬇️ Pull DOWN - Accelerate<br>
       ⬅️ LEFT / RIGHT ➡️ - Control direction<br><br>
       <span style="color: #4ade80;">OBJECTIVE:</span><br>
       Land gently on the platform to succeed!<br><br>
       <span style="opacity: 0.8;">Touch anywhere to begin landing phase...</span>`,
          );
          uiInstance.current.toggleDetails(true);
          isDetailsShown.current = true;

          uiInstance.current.instructions.content.html(
            "Goal: Land on the planet without crashing",
          );
        }

        if (state.phase === "space") {
          uiInstance.current.instructions.content.html(
            "Goal: Reach the planet.",
          );
        }
      }
    });

    const unsubscribeHealth = useHealth.subscribe((state) => {
      if (uiInstance.current) {
        uiInstance.current.info.content.html(`Health: ${state.currentHealth}`);
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
