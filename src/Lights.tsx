import { useEffect, useRef, useState } from "react";

const Lights = () => {
  const sunLight = useRef();
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (sunLight.current) {
      setIsReady(true);
    }
  });

  return (
    <>
      <pointLight
        ref={sunLight}
        position={[10, 10, 10]}
        intensity={1000}
        color={"FFCC33"}
      >
        {isReady && <pointLightHelper args={[sunLight.current, 2, 0xff0000]} />}
      </pointLight>
    </>
  );
};

export default Lights;
