import { useControls } from "leva";

const Lights = () => {

  const { ambientLightIntensity } = useControls('Lights', {
    ambientLightIntensity: { value: 0.6, min: 0, max: 2, step: 0.1 }
  })

  return (
    <>
      <ambientLight intensity={ambientLightIntensity} />
    </>
  );
};

export default Lights;
