import { useEffect, useState } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { isMobile } from "react-device-detect";
import { useKeyboardTracker } from "@/stores/useKeyboardTracker";
import { css } from "../../styled-system/css";
import { ControlsMap } from "@/Game.tsx";

const KeyContainer = ({
  children,
  isPressed,
  isDiscovered,
  large = false,
  delay = 0,
  shouldHide,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2,
        delay: 0.3 - delay, // Reverse the delay for exit animation
      },
    }}
    transition={{
      duration: 0.3,
      delay: shouldHide ? 0 : delay,
      type: "spring",
      damping: 15,
    }}
    className={css({
      width: large ? "136px" : "40px",
      height: "40px",
      margin: "4px",
      border: "2px solid",
      borderColor: isDiscovered ? "#00ff9580" : "#ffffff",
      background: isPressed
        ? isDiscovered
          ? "#00ff9540"
          : "#ffffff99"
        : isDiscovered
          ? "#00ff9520"
          : "#ffffff44",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      transition: "all 0.2s ease",
      position: "relative",
      overflow: "hidden",
      _after: {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
        opacity: isPressed ? 1 : 0,
        transition: "opacity 0.2s ease",
      },
    })}
  >
    {children}
  </motion.div>
);

export default function KeyboardHUD() {
  const { shouldShowHUD, trackKeyPress, pressedKeys } = useKeyboardTracker();
  const [isVisible, setIsVisible] = useState(false);

  const upPressed = useKeyboardControls((state) => state[ControlsMap.up]);
  const downPressed = useKeyboardControls((state) => state[ControlsMap.down]);
  const leftPressed = useKeyboardControls((state) => state[ControlsMap.left]);
  const rightPressed = useKeyboardControls((state) => state[ControlsMap.right]);
  const boostPressed = useKeyboardControls((state) => state[ControlsMap.boost]);

  useEffect(() => {
    if (shouldShowHUD) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [shouldShowHUD]);

  useEffect(() => {
    if (upPressed) trackKeyPress("up");
    if (downPressed) trackKeyPress("down");
    if (leftPressed) trackKeyPress("left");
    if (rightPressed) trackKeyPress("right");
    if (boostPressed) trackKeyPress("boost");
  }, [upPressed, downPressed, leftPressed, rightPressed, boostPressed]);

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.5 },
          }}
          className={css({
            position: "absolute",
            bottom: "20px",
            right: "100px",
            width: "auto",
            zIndex: 1000,
            pointerEvents: "none",
          })}
        >
          {/* Up arrow row */}
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              width: "100%",
            })}
          >
            <KeyContainer
              isPressed={upPressed}
              isDiscovered={pressedKeys.has("up")}
              delay={0.1}
              shouldHide={!shouldShowHUD}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={css({
                  color: pressedKeys.has("up") ? "#00ff95" : "#fff",
                  width: "1.5rem",
                  transition: "color 0.2s ease",
                })}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75"
                />
              </svg>
            </KeyContainer>
          </div>

          {/* Middle row (Left, Down, Right arrows) */}
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              width: "100%",
            })}
          >
            <KeyContainer
              isPressed={leftPressed}
              isDiscovered={pressedKeys.has("left")}
              delay={0.2}
              shouldHide={!shouldShowHUD}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={css({
                  color: pressedKeys.has("left") ? "#00ff95" : "#fff",
                  width: "1.5rem",
                  transition: "color 0.2s ease",
                })}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"
                />
              </svg>
            </KeyContainer>

            <KeyContainer
              isPressed={downPressed}
              isDiscovered={pressedKeys.has("down")}
              delay={0.3}
              shouldHide={!shouldShowHUD}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={css({
                  color: pressedKeys.has("down") ? "#00ff95" : "#fff",
                  width: "1.5rem",
                  transition: "color 0.2s ease",
                })}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                />
              </svg>
            </KeyContainer>

            <KeyContainer
              isPressed={rightPressed}
              isDiscovered={pressedKeys.has("right")}
              delay={0.4}
              shouldHide={!shouldShowHUD}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className={css({
                  color: pressedKeys.has("right") ? "#00ff95" : "#fff",
                  width: "1.5rem",
                  transition: "color 0.2s ease",
                })}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </KeyContainer>
          </div>

          {/* Boost key row */}
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              width: "100%",
            })}
          >
            <KeyContainer
              isPressed={boostPressed}
              isDiscovered={pressedKeys.has("boost")}
              large={true}
              delay={0.5}
              shouldHide={!shouldShowHUD}
            >
              <span
                className={css({
                  color: pressedKeys.has("boost") ? "#00ff95" : "white",
                  fontSize: "sm",
                  transition: "color 0.2s ease",
                  fontWeight: "medium",
                })}
              >
                BOOST (SPACE)
              </span>
            </KeyContainer>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
