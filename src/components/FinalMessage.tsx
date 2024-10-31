import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useGame from "@/stores/useGame";
import { css } from "../../styled-system/css";
import { center } from "../../styled-system/patterns";

export const FinalMessage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const landingState = useGame((state) => state.landingState);
  const setPhase = useGame((state) => state.setPhase);
  const setLandingState = useGame((state) => state.setLandingState);
  const resetLandingTransition = useGame(
    (state) => state.resetLandingTransition,
  );

  useEffect(() => {
    if (landingState !== "in_progress") {
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [landingState]);

  const handleRestart = () => {
    setIsVisible(false);
    setPhase("space");
    setLandingState("in_progress");
    resetLandingTransition();
  };

  if (landingState === "in_progress") return null;

  const isSuccess = landingState === "success";

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className={center({
            position: "fixed",
            inset: 0,
          })}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={css({
              maxWidth: "400px",
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: isSuccess
                ? "rgba(52, 211, 153, 0.3)"
                : "rgba(239, 68, 68, 0.3)",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
              boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
            })}
          >
            <motion.div
              className={css({
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              })}
            >
              <motion.div
                animate={
                  isSuccess
                    ? {
                        scale: [1, 1.2, 1],
                        transition: { repeat: Infinity, duration: 2 },
                      }
                    : {
                        x: [-5, 5, -5],
                        transition: { repeat: Infinity, duration: 0.5 },
                      }
                }
              >
                {isSuccess ? (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(52, 211, 153)"
                    strokeWidth="2"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgb(239, 68, 68)"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={css({
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  color: isSuccess ? "rgb(52, 211, 153)" : "rgb(239, 68, 68)",
                  margin: 0,
                })}
              >
                {isSuccess ? "Perfect Landing!" : "Landing Failed"}
              </motion.h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={css({
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.8)",
                margin: 0,
                lineHeight: "1.5",
              })}
            >
              {isSuccess
                ? "Congratulations! You successfully landed the spacecraft."
                : "The landing was too rough. Want to try again?"}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className={css({
                backgroundColor: isSuccess
                  ? "rgb(52, 211, 153)"
                  : "rgb(239, 68, 68)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
                transition: "background 0.2s",
                _hover: {
                  backgroundColor: isSuccess
                    ? "rgb(41, 188, 136)"
                    : "rgb(220, 38, 38)",
                },
              })}
            >
              {isSuccess ? "Play Again" : "Try Again"}
            </motion.button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
