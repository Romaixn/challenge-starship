import useGame from "./stores/useGame";
import SpaceTravelComponent from "./components/SpaceTravel";
import { css } from "../styled-system/css";
import "../styled-system/styles.css";
import { useState, useEffect } from "react";

const Welcome = () => {
  const start = useGame((state) => state.start);
  const phase = useGame((state) => state.phase);
  const [throttle, setThrottle] = useState(0.01);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isTransitioning) {
      let animationFrame: number;
      let startTime = performance.now();
      const duration = 2000;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);
        setThrottle(0.01 + eased * 0.99);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          setTimeout(() => {
            start();
          }, 500);
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
        },
      )}
    >
      <div
        className={css({ position: "relative", width: "100%", height: "100%" })}
      >
        <div className={css({ position: "absolute", inset: 0 })}>
          <SpaceTravelComponent
            throttle={throttle}
            opacity={1}
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
