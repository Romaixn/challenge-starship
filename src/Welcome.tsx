import useGame from "@/stores/useGame";
import SpaceTravelComponent from "@/components/SpaceTravel";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import { css } from "../styled-system/css";
import useSound from "@/stores/useSound.ts";
import { useProgress } from "@react-three/drei";
import MissionBriefing from "@/components/MissionBriefing.tsx";
import { isMobile } from "react-device-detect";

const Welcome = () => {
  const start = useGame((state) => state.start);
  const phase = useGame((state) => state.phase);
  const soundPlaying = useSound((state) => state.soundPlaying);
  const [throttle, setThrottle] = useState(0.01);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Loader
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const { progress, active } = useProgress();

  const size = 140;
  const strokeWidth = 1.5;
  const color = "var(--ui-color)";
  const center = size / 2;
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - progress / 100);
  const isLoaded = progress === 100;

  const audio = new THREE.Audio(new THREE.AudioListener());

  const playAudio = () => {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/musics/launch.mp3", (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(false);
      audio.setVolume(0.5);
      audio.play();
    });
  };

  useEffect(() => {
    if (isTransitioning) {
      if (soundPlaying) {
        playAudio();
      }

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
      className={css({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
        pointerEvents: phase !== "welcome" ? "none" : "auto",
        opacity: phase !== "welcome" ? 0 : opacity,
        transition: "opacity 1.5s",
      })}
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
          <div
            className={css({
              position: "fixed",
              left: "50%",
              top: isMobile ? "82%" : "50%",
              transform: isMobile
                ? "translateX(-50%)"
                : "translate(-50%, -50%)",
              opacity: isTransitioning ? 0 : 1,
              transition: "all 0.4s ease-in-out",
              zIndex: 1000,
              cursor: isLoaded && !isTransitioning ? "pointer" : "default",
            })}
            onClick={handleEnter}
          >
            <svg
              ref={svgRef}
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className={css({
                transition: "transform 0.3s ease-out",
              })}
            >
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={0.2}
              />
              {/* Progress circle */}
              <circle
                ref={circleRef}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{
                  transition: "stroke-dashoffset 0.1s ease-out",
                }}
              />
              {/* Center text: Loading percentage or Launch */}
              <text
                x={center}
                y={center}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                style={{
                  fontFamily: "var(--ui-font-family)",
                  fontSize: isLoaded ? "14px" : "12px",
                  textTransform: isLoaded ? "uppercase" : "none",
                  letterSpacing: isLoaded ? "0.05em" : "normal",
                  opacity: active ? 0.7 : 1,
                  transition: "all 0.3s ease-out",
                  pointerEvents: "none", // Empêche le texte d'interférer avec les clics
                }}
              >
                {isLoaded ? "Launch" : `${Math.round(progress)}%`}
              </text>
            </svg>
          </div>
        </div>

        <MissionBriefing hide={isTransitioning} />

        <p
          className={css({
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 20,
            opacity: isTransitioning ? 0 : 1,
            padding: "1.5rem",
            textTransform: "uppercase",
          })}
        >
          Challenge by Benjamin Code, made by Romain Herault
        </p>
      </div>
    </div>
  );
};

export default Welcome;
