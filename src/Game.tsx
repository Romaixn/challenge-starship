import { useMemo } from "react";
import { Center, Environment, OrbitControls, Stars } from "@react-three/drei";
import { Perf } from "r3f-perf";
import { Asteroid } from "@/components/Asteroid";
import Planet from "@/components/Planet";
import { Physics } from "@react-three/rapier";
import { Player } from "./Player";

const isProd = process.env.NODE_ENV === "production";

const Game = () => {
  const { texture, color } = useMemo(() => {
    const textures = [
      // Habitable
      { texture: "/planets/habitable/Alpine.png", color: "#334635" },
      { texture: "/planets/habitable/Savannah.png", color: "#A8B624" },
      { texture: "/planets/habitable/Swamp.png", color: "#232B06" },
      { texture: "/planets/habitable/Tropical.png", color: "#017DA9" },
      // Gas
      { texture: "/planets/gaseous/Gaseous1.jpg", color: "#655A46" },
      { texture: "/planets/gaseous/Gaseous2.jpg", color: "#AA777D" },
      { texture: "/planets/gaseous/Gaseous3.jpg", color: "#9CBF89" },
      { texture: "/planets/gaseous/Gaseous4.jpg", color: "#D1466D" },
      // Inhospitable
      { texture: "/planets/inhospitable/Icy.png", color: "#AAC3CD" },
      { texture: "/planets/inhospitable/Martian.png", color: "#784233" },
      { texture: "/planets/inhospitable/Venusian.png", color: "#73370B" },
      { texture: "/planets/inhospitable/Volcanic.png", color: "#B6412D" },
      // Terrestrial
      { texture: "/planets/terrestrial/Terrestrial1.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial2.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial3.png", color: "#00AAFF" },
      { texture: "/planets/terrestrial/Terrestrial4.png", color: "#00AAFF" },
    ];

    return textures[Math.floor(Math.random() * textures.length)];
  }, []);
  return (
    <>
      {!isProd && <Perf position="top-left" />}
      {/* <Lights /> */}

      <Environment preset="night" />
      <Stars radius={500} />

      <Physics debug gravity={[0.1, 0.1, 0.1]}>
        <Player />

        <Planet
          xRadius={1000}
          zRadius={1000}
          size={100}
          texture={texture}
          color={color}
        />
      </Physics>
    </>
  );
};

export default Game;
