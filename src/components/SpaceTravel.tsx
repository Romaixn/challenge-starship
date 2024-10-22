import React, { useEffect, useRef } from "react";
import SpaceTravel from "space-travel";

interface SpaceTravelProps {
  throttle?: number;
  opacity?: number;
  backgroundColor?: string | number;
  onLoad?: () => void;
  className?: string;
}

const SpaceTravelComponent: React.FC<SpaceTravelProps> = ({
  throttle = 0,
  opacity = 1,
  backgroundColor = 0x08000f,
  onLoad,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    sceneRef.current = new SpaceTravel({
      canvas: canvasRef.current,
      throttle,
      opacity,
      backgroundColor,
      startOpacity: 0,
    });

    sceneRef.current.start();

    if (onLoad) onLoad();

    const handleResize = () => {
      if (sceneRef.current) {
        sceneRef.current.resize();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        sceneRef.current.pause();
        sceneRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.throttle = throttle;
    }
  }, [throttle]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.opacity = opacity;
    }
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default SpaceTravelComponent;
