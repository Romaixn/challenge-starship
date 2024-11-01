import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useGame from "@/stores/useGame";
import { css } from "../../styled-system/css";

const messages = [
  {
    text: "INITIATING LANDING SEQUENCE",
    duration: 2000,
  },
  {
    text: "ENTERING PLANETARY ATMOSPHERE",
    duration: 2000,
  },
  {
    text: "ACTIVATING LANDING THRUSTERS",
    duration: 2000,
  },
  {
    text: "STABILIZING SHIP ORIENTATION",
    duration: 2000,
  },
  {
    text: "LANDING CONTROLS ENGAGED",
    duration: 1500,
  },
];

export const FadeTransition = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeType, setFadeType] = useState<"black" | "message">("black");
  const completeLandingTransition = useGame(
    (state) => state.completeLandingTransition,
  );

  useEffect(() => {
    const displayMessages = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setFadeType("message");

      for (let i = 0; i < messages.length; i++) {
        setCurrentMessageIndex(i);
        await new Promise((resolve) =>
          setTimeout(resolve, messages[i].duration),
        );
      }

      setIsVisible(false);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      completeLandingTransition();
    };

    displayMessages();
  }, [completeLandingTransition]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={css({
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            pointerEvents: "none",
            backgroundColor:
              fadeType === "black" ? "black" : "rgba(0, 0, 0, 0.85)",
          })}
        >
          {fadeType === "message" && (
            <div
              className={css({
                textAlign: "center",
              })}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMessageIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className={css({
                    position: "relative",
                  })}
                >
                  {/* Scanner line effect */}
                  <motion.div
                    className={css({
                      position: "absolute",
                      left: 0,
                      width: "100%",
                      height: "2px",
                      backgroundColor: "rgba(255, 255, 255, 0.3)",
                    })}
                    animate={{
                      top: ["0%", "100%"],
                    }}
                    transition={{
                      duration: 2,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />

                  <div
                    className={css({
                      color: "white",
                      fontSize: "24px",
                      letterSpacing: "wider",
                      padding: "32px",
                      border: "1px solid",
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      backdropFilter: "blur(4px)",
                      fontFamily: "var(--ui-font-family)",
                      textShadow: "0 0 10px rgba(255,255,255,0.5)",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "400px",
                      minHeight: "100px",
                    })}
                  >
                    <div
                      className={css({
                        position: "absolute",
                        inset: 0,
                        border: "1px solid",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        margin: "4px",
                      })}
                    />
                    {messages[currentMessageIndex].text}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
