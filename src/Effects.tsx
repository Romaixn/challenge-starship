import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

export const Effects = () => {
  return (
    <EffectComposer stencilBuffer={false}>
      <Bloom luminanceThreshold={1} intensity={2} levels={9} mipmapBlur />
      <BrightnessContrast brightness={0} contrast={0.1} />
      <Noise opacity={0.02} />
      <Vignette />
    </EffectComposer>
  );
};
