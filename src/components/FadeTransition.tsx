import { useEffect, useState } from "react";
import useGame from "@/stores/useGame";
import { css } from "../../styled-system/css";

export const FadeTransition = () => {
  const [opacity, setOpacity] = useState(0);
  const completeLandingTransition = useGame(
    (state) => state.completeLandingTransition,
  );

  useEffect(() => {
    // Fade in
    setOpacity(1);

    // Après le fade in, attendre un peu puis fade out
    const timeout = setTimeout(() => {
      setOpacity(0);
      // Après le fade out, indiquer que la transition est terminée
      setTimeout(() => {
        completeLandingTransition();
      }, 500);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={css({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        transition: "opacity 0.5s ease-in-out",
        opacity: opacity,
        zIndex: 1000,
      })}
    />
  );
};
