import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { css } from "../../styled-system/css";
import { isMobile } from "react-device-detect";

interface MissionBriefingProps {
  hide: boolean;
}

export default function MissionBriefing({ hide }: MissionBriefingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const missionTexts = [
    "INCOMING TRANSMISSION...",
    "MISSION BRIEFING: PLANETARY RECONNAISSANCE",
    "You are tasked with landing on an uncharted planet in the Kepler system.",
    "WARNING: Asteroid field detected in planetary orbit.",
    "PRIMARY OBJECTIVES:",
    "1. Navigate through the asteroid field",
    "2. Approach planetary orbit to initiate landing sequence",
    "3. Execute controlled landing sequence",
    "CAUTION: Ship integrity critical for atmospheric entry.",
    "Good luck, pilot. The fate of the mission rests in your hands.",
    "PRESS LAUNCH WHEN READY",
  ];

  useEffect(() => {
    if (currentTextIndex < missionTexts.length - 1 && !hide) {
      const timer = setTimeout(() => {
        setCurrentTextIndex((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTextIndex, hide]);

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={css({
            position: "absolute",
            left: "0",
            top: isMobile ? "47%" : "50%",
            transform: "translateY(-50%)",
            zIndex: "30",
            width: "100%",
            maxWidth: "42rem",
            paddingX: "1.5rem",
          })}
        >
          <AnimatePresence mode="sync">
            {missionTexts.slice(0, currentTextIndex + 1).map((text, index) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  stiffness: 50,
                  delay: 0.15,
                }}
                className={css({
                  marginBottom: "1rem",
                })}
              >
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [
                      0,
                      1,
                      1,
                      1,
                      1,
                      1,
                      1,
                      1,
                      1,
                      ...(index === 0 ? [0.8, 1, 0.8, 1] : [1]),
                    ],
                  }}
                  transition={{
                    duration: index === 0 ? 2 : 0.5,
                    repeat: index === 0 ? Infinity : 0,
                  }}
                  className={css({
                    color: text.includes("WARNING:")
                      ? "#ef4444"
                      : text.includes("MISSION BRIEFING:")
                        ? "#60a5fa"
                        : text.includes("CAUTION:")
                          ? "#fbbf24"
                          : text === "PRESS LAUNCH WHEN READY"
                            ? "#4ade80"
                            : "#e5e7eb",
                    fontSize: {
                      base: "0.875rem",
                      md: "1rem",
                    },
                    fontFamily: "var(--ui-font-family)",
                    textShadow: "0 0 10px currentColor",
                  })}
                >
                  {text}
                </motion.p>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
