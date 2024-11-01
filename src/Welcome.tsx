import useGame from "@/stores/useGame";
import SpaceTravelComponent from "@/components/SpaceTravel";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { css } from "../styled-system/css";
import useSound from "@/stores/useSound.ts";
import { useProgress } from "@react-three/drei";
import MissionBriefing from "@/components/MissionBriefing.tsx";

const Welcome = () => {
  const start = useGame((state) => state.start);
  const phase = useGame((state) => state.phase);
  const soundPlaying = useSound((state) => state.soundPlaying);
  const [throttle, setThrottle] = useState(0.01);
  const [opacity, setOpacity] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Loader configuration
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

  // Audio setup and handlers
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

  // Transition effect
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
        inset: 0,
        display: "flex",
        zIndex: 1000,
        pointerEvents: phase !== "welcome" ? "none" : "auto",
        opacity: phase !== "welcome" ? 0 : opacity,
        transition: "opacity 1.5s",
      })}
    >
      {/* Background Space Travel */}
      <div className={css({ position: "absolute", inset: 0, zIndex: 1 })}>
        <SpaceTravelComponent
          throttle={throttle}
          backgroundColor={"#0B192C"}
          className={css({ width: "100%", height: "100%" })}
        />
      </div>

      {/* Main Content Container */}
      <div
        className={css({
          position: "relative",
          zIndex: 2,
          display: "flex",
          width: "100%",
          height: "100%",
        })}
      >
        {/* Left Side Content */}
        <div
          className={css({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem",
            maxWidth: { base: "100%", md: "50%" },
          })}
        >
          {/* Header */}
          <header
            className={css({
              textAlign: { base: "center", md: "left" },
              marginBottom: "1.5rem",
              textTransform: "uppercase",
              opacity: isTransitioning ? 0 : 1,
              transition: "opacity 0.4s ease-in-out",
            })}
          >
            A challenge by Benjamin Code • Built by Romain Herault
          </header>

          {/* Mission Briefing */}
          <div
            className={css({
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: { base: "flex-start", md: "center" },
            })}
          >
            <MissionBriefing hide={isTransitioning} />
          </div>
        </div>

        {/* Center Launch Button Container */}
        <div
          className={css({
            position: "absolute",
            left: "50%",
            top: { base: "auto", md: "50%" },
            bottom: { base: "1%", md: "auto" },
            transform: {
              base: "translateX(-50%)",
              md: "translate(-50%, -50%)",
            },
            opacity: isTransitioning ? 0 : 1,
            transition: "opacity 0.4s ease-in-out",
            zIndex: 3,
          })}
        >
          <div
            onClick={isLoaded && !isTransitioning ? handleEnter : undefined}
            style={{
              cursor: isLoaded && !isTransitioning ? "pointer" : "default",
            }}
          >
            <svg
              ref={svgRef}
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className={css({
                transition: "transform 0.4s ease-out",
              })}
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={0.2}
              />
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
                  transition: "all 0.4s ease-out",
                  pointerEvents: "none",
                }}
              >
                {isLoaded ? "Launch" : `${Math.round(progress)}%`}
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
