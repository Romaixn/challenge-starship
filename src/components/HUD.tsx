import { useEffect, useRef } from 'react';
import { UI } from '@alienkitty/space.js';
import { css } from "../../styled-system/css";
import { isMobile } from "react-device-detect";

const HUD = () => {
  const containerRef = useRef(null);
  const uiInstance = useRef(null);
  const animationFrameRef = useRef(null);
  const isDetailsShown = useRef(true);

  useEffect(() => {
    if (!containerRef.current) return;

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
        content: `Use arrow keys or WASD to control the ship.
                 Hold SHIFT to boost. Press any key to discard this message.`,
      },
      instructions: !isMobile ? {
        content: 'Use the arrow keys or WASD to move.'
      } : false,
      detailsButton: true,
    });

    // Animate in the UI
    uiInstance.current.animateIn();
    uiInstance.current.info.animateIn();
    if (!isMobile) {
      uiInstance.current.instructions.animateIn();
    }

    uiInstance.current.toggleDetails(true);

    const handleKeyPress = () => {
      if (isDetailsShown.current) {
        uiInstance.current.toggleDetails(false);
        isDetailsShown.current = false;
      }
    }

    window.addEventListener('keydown', handleKeyPress);

    // Append to our container
    containerRef.current.appendChild(uiInstance.current.element);
    // Setup animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      if (uiInstance.current) {
        uiInstance.current.update();
      }
    };

    animate();
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('keydown', handleKeyPress);

      if (uiInstance.current && uiInstance.current.element && containerRef.current) {
        containerRef.current.removeChild(uiInstance.current.element);
        uiInstance.current = null;
      }
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