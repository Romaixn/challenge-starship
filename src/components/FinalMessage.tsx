import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { css } from "../../styled-system/css";
import useGame from "@/stores/useGame";
import useHealth from "@/stores/useHealth";

export const FinalMessage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [messageLines, setMessageLines] = useState<string[]>([]);
  const landingState = useGame((state) => state.landingState);
  const setPhase = useGame((state) => state.setPhase);
  const setLandingState = useGame((state) => state.setLandingState);
  const resetLandingTransition = useGame(
    (state) => state.resetLandingTransition,
  );
  const isDead = useHealth((state) => state.isDead);
  const resetHealth = useHealth((state) => state.resetHealth);

  useEffect(() => {
    if (landingState !== "in_progress" || isDead) {
      const messages = generateMessages(landingState, isDead);
      setMessageLines(messages);
      setTimeout(() => setIsVisible(true), 500);
    }
  }, [landingState, isDead]);

  const generateMessages = (state: string, isDead: boolean): string[] => {
    if (isDead) {
      return [
        "CRITICAL FAILURE",
        "SHIP INTEGRITY: 0%",
        "STATUS: VESSEL DESTROYED",
        "CAUSE: COLLISION DAMAGE EXCEEDS STRUCTURAL LIMITS",
        "MISSION STATUS: FAILED",
        "CREW STATUS: LOST",
        "RECOMMENDATION: INITIATE MISSION REPLAY SEQUENCE",
      ];
    }

    if (state === "crash") {
      return [
        "LANDING SEQUENCE FAILURE",
        "SHIP STATUS: DAMAGED",
        "CAUSE: IMPROPER LANDING PARAMETERS",
        "- VELOCITY EXCEEDS SAFETY THRESHOLD",
        "- ORIENTATION OUTSIDE ACCEPTABLE RANGE",
        "MISSION STATUS: FAILED",
        "RECOMMENDATION: RETRY LANDING SEQUENCE",
      ];
    }

    return [
      "MISSION ACCOMPLISHED",
      "LANDING SEQUENCE: SUCCESSFUL",
      "SHIP STATUS: NOMINAL",
      "ALL PARAMETERS WITHIN ACCEPTABLE RANGE",
      "- VELOCITY CHECK: PASSED",
      "- ORIENTATION CHECK: PASSED",
      "INITIATING POST-LANDING PROCEDURES",
    ];
  };

  const handleRestart = () => {
    setIsVisible(false);
    setPhase("space");
    setLandingState("in_progress");
    resetLandingTransition();
    resetHealth();
  };

  const isSuccess = landingState === "success";

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 50,
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={css({
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: { base: "-8rem", md: "0" },
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            fontFamily: "var(--ui-font-family)",
            zIndex: 1000,
            backdropFilter: "blur(4px)",
          })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={css({
              maxW: "600px",
              w: "90%",
              backgroundColor: "rgba(8, 8, 12, 0.95)",
              border: "1px solid",
              borderColor: isSuccess
                ? "rgb(52, 211, 153, 0.3)"
                : "rgb(239, 68, 68, 0.3)",
              p: "6",
              position: "relative",
              _before: {
                content: '""',
                position: "absolute",
                inset: "-1px",
                background: isSuccess
                  ? "linear-gradient(45deg, rgba(52, 211, 153, 0.1), transparent 40%)"
                  : "linear-gradient(45deg, rgba(239, 68, 68, 0.1), transparent 40%)",
                pointerEvents: "none",
              },
            })}
          >
            <motion.div variants={container} initial="hidden" animate="show">
              {messageLines.map((line, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className={css({
                    color:
                      index === 0
                        ? isSuccess
                          ? "rgb(52, 211, 153)"
                          : "rgb(239, 68, 68)"
                        : "rgba(255, 255, 255, 0.8)",
                    fontSize: index === 0 ? "1.2rem" : "1rem",
                    fontWeight: index === 0 ? "bold" : "normal",
                    mb: "3",
                    textShadow:
                      index === 0
                        ? `0 0 10px ${isSuccess ? "rgba(52, 211, 153, 0.5)" : "rgba(239, 68, 68, 0.5)"}`
                        : "none",
                    letterSpacing: "0.05em",
                  })}
                >
                  {line}
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: messageLines.length * 0.1 }}
              whileHover={{
                y: -1,
                backgroundColor: isSuccess
                  ? "rgba(52, 211, 153, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
              }}
              whileTap={{ y: 1 }}
              onClick={handleRestart}
              className={css({
                mt: "6",
                px: "6",
                py: "3",
                bg: "transparent",
                border: "1px solid",
                borderColor: isSuccess
                  ? "rgb(52, 211, 153)"
                  : "rgb(239, 68, 68)",
                color: isSuccess ? "rgb(52, 211, 153)" : "rgb(239, 68, 68)",
                fontFamily: "var(--ui-font-family)",
                fontSize: "0.9rem",
                letterSpacing: "0.1em",
                cursor: "pointer",
                transition: "all 0.2s ease",
              })}
            >
              {isSuccess ? "INITIATE NEW MISSION" : "RETRY MISSION"}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
