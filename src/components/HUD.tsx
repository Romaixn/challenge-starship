import { useEffect, useRef } from 'react';
import { UI } from '@alienkitty/space.js';
import { css } from "../../styled-system/css";
import { isMobile } from "react-device-detect";
import useSound from "@/stores/useSound.ts";
import { useJoystickControls } from "@/stores/useJoystickControls.ts";

const HUD = () => {
  const containerRef = useRef(null);
  const uiInstance = useRef(null);
  const animationFrameRef = useRef(null);
  const isDetailsShown = useRef(true);
  const toggleSound = useSound((state) => state.toggleSound);
  const soundPlaying = useSound((state) => state.soundPlaying);

  useEffect(() => {
    if (!containerRef.current) return;

    let i = 0;

    // Initialize UI instance with all components
    uiInstance.current = new UI({
      fps: true,
      header: {
        links: [
          {
            title: 'Starship - rherault',
            link: 'https://rherault.dev',
          }
        ]
      },
      info: {
        content: 'Info'
      },
      details: {
        background: true,
        title: 'Controls',
        content: !isMobile ?
          `Use arrow keys or WASD to control the ship.
           Hold SHIFT to boost. Press any key to discard this message.` :
          `Use joystick to control the ship. Use right button to boost. Touch to discard this message.`,
      },
      instructions: !isMobile ? {
        content: 'Use the arrow keys or WASD to move.'
      } : false,
      detailsButton: true,
      muteButton: {
        sound: soundPlaying,
        callback: () => {
          // Necessary to prevent callback at initialization (idk why)
          ++i;
          if (i > 1) {
            toggleSound();
          }
        }
      }
    });

    // Animate in the UI
    uiInstance.current.animateIn();
    uiInstance.current.info.animateIn();
    if (!isMobile) {
      uiInstance.current.instructions.animateIn();
    }
    uiInstance.current.toggleDetails(true);

    // Handle key press for details
    const handleKeyPress = () => {
      if (isDetailsShown.current) {
        uiInstance.current.toggleDetails(false);
        isDetailsShown.current = false;
      }
    };

    const unsuscribeJoystickChange = useJoystickControls.subscribe(() => {
      handleKeyPress()
    })
    window.addEventListener('keydown', handleKeyPress);

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
      window.removeEventListener('keydown', handleKeyPress);
      if (uiInstance.current && uiInstance.current.element && containerRef.current) {
        containerRef.current.removeChild(uiInstance.current.element);
        uiInstance.current = null;
      }

      unsuscribeJoystickChange();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={css({
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
      })}
    />
  );
};

export default HUD;