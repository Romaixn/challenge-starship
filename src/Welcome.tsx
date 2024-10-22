import useGame from "@/stores/useGame";
import SpaceTravelComponent from "@/components/SpaceTravel";
import { useState, useEffect } from "react";

import { css } from "@styled-system/css";

const Welcome = () => {
  const start = useGame((state) => state.start);
  const phase = useGame((state) => state.phase);
  const [throttle, setThrottle] = useState(0.01);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      let animationFrame: number;
      let startTime = performance.now();
      const duration = 2500;
      const opacityDelay = duration - 200;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        setThrottle(0.01 + eased * 0.99);

        if (elapsed < opacityDelay) {
          setOpacity(1);
        } else {
          const opacityProgress = Math.min(
            (elapsed - opacityDelay) / (duration - opacityDelay),
            1,
          );
          setOpacity(1 - opacityProgress);
        }

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            start();
          }, duration);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }
  }, [isTransitioning, start]);

  const handleEnter = () => {
    setIsTransitioning(true);
  };

  return (
    <div
      className={css(
        phase !== "welcome" && {
          opacity: 0,
          pointerEvents: "none",
        },
        {
          position: "fixed",
          inset: 0,
          transition: "opacity 1.5s",
          opacity: opacity,
        },
      )}
    >
      <div
        className={css({ position: "relative", width: "100%", height: "100%" })}
      >
        <div className={css({ position: "absolute", inset: 0 })}>
          <SpaceTravelComponent
            throttle={throttle}
            backgroundColor={"#0B192C"}
            className={css({ width: "100%", height: "100%" })}
          />
        </div>

        <div
          className={css({
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.5s",
          })}
        >
          <button
            onClick={handleEnter}
            disabled={isTransitioning}
            className={css({
              padding: "1rem 2rem",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "white",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              transition: "all 0.3s",
              _hover: {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                transform: "scale(1.05)",
              },
              _disabled: {
                opacity: 0,
                pointerEvents: "none",
              },
            })}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
