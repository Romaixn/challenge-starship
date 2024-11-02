import { useEffect } from "react";
import * as THREE from "three";
import useSound from "@/stores/useSound.ts";

export const AudioManager = () => {
  const soundPlaying = useSound((state) => state.soundPlaying);

  const audio = new THREE.Audio(new THREE.AudioListener());

  const toggleAudio = (play: boolean) => {
    if (play && audio.buffer) {
      audio.play();
    } else {
      audio.pause();
    }
  };

  useEffect(() => {
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load("/musics/ambient.mp3", (buffer) => {
      audio.setBuffer(buffer);
      audio.setLoop(true);
      audio.setVolume(0.2);

      if (soundPlaying) {
        audio.play();
      }
    });

    const unsubscribeToggleSound = useSound.subscribe((state) => {
      toggleAudio(state.soundPlaying);
    });

    return () => {
      unsubscribeToggleSound();
    };
  }, []);

  return null;
};
