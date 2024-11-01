import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { css } from "../../styled-system/css";

interface MissionBriefingProps {
  hide: boolean;
}

const TypewriterText = ({
  text,
  color,
  isComplete,
  onComplete,
  isFirstElement,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex === text.length) {
      setIsTypingComplete(true);
      onComplete();
      return;
    }

    const randomDelay = Math.random() * 30 + 20;
    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex((prev) => prev + 1);
    }, randomDelay);

    return () => clearTimeout(timer);
  }, [currentIndex, text, onComplete]);

  // Animation plus sophistiquée pour le premier élément
  const getOpacityValues = () => {
    if (!isFirstElement || !isTypingComplete) return [1];
    return [0, 1, 1, 1, 1, 1, 1, 1, 1, 0.8, 1, 0.8, 1];
  };

  return (
    <motion.div
      ref={textContainerRef}
      initial={{ opacity: 0 }}
      animate={{
        opacity: getOpacityValues(),
      }}
      transition={{
        duration: isFirstElement && isTypingComplete ? 2 : 0.5,
        repeat: isFirstElement && isTypingComplete ? Infinity : 0,
      }}
      className={css({
        color: color,
        fontSize: {
          base: "0.875rem",
          md: "1rem",
        },
        lineHeight: "1.5",
        fontFamily: "var(--ui-font-family)",
        textShadow: "0 0 10px currentColor",
        position: "relative",
        display: "inline-block",
      })}
    >
      {/* Texte affiché */}
      <span>{displayedText}</span>

      {/* Curseur */}
      {!isTypingComplete && (
        <motion.span
          initial={false}
          className={css({
            position: "absolute",
            top: "0",
            left: "100%",
            width: "0.5em",
            height: "1.1em",
            backgroundColor: "currentColor",
            display: "inline-block",
            animation: "blink 1s step-end infinite",
            "@keyframes blink": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0 },
            },
          })}
        />
      )}
    </motion.div>
  );
};

export default function MissionBriefing({ hide }: MissionBriefingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isCurrentLineComplete, setIsCurrentLineComplete] = useState(false);

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
    if (
      isCurrentLineComplete &&
      currentTextIndex < missionTexts.length - 1 &&
      !hide
    ) {
      const timer = setTimeout(() => {
        setCurrentTextIndex((prev) => prev + 1);
        setIsCurrentLineComplete(false);
      }, 500); // Délai entre les lignes
      return () => clearTimeout(timer);
    }
  }, [isCurrentLineComplete, currentTextIndex, hide]);

  const getTextColor = (text: string) => {
    if (text.includes("WARNING:")) return "#ef4444";
    if (text.includes("MISSION BRIEFING:")) return "#60a5fa";
    if (text.includes("CAUTION:")) return "#fbbf24";
    if (text === "PRESS LAUNCH WHEN READY") return "#4ade80";
    return "#e5e7eb";
  };

  const handleLineComplete = () => {
    setIsCurrentLineComplete(true);
  };

  return (
    <AnimatePresence>
      {!hide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={css({
            width: "100%",
            maxWidth: "42rem",
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
                <TypewriterText
                  text={text}
                  color={getTextColor(text)}
                  isComplete={index < currentTextIndex}
                  isFirstElement={index === 0}
                  onComplete={
                    index === currentTextIndex ? handleLineComplete : () => {}
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
