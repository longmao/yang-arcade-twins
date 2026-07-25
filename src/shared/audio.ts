/**
 * src/shared/audio.ts · react-native-sound 占位
 * Sprint 1 Phase 2:实际接 audio asset。本期提供 mock 接口.
 */
import Sound from 'react-native-sound';
Sound.setCategory('Playback', true);

const MOCK = true;

let cachedEat: Sound | null = null;
let cachedDie: Sound | null = null;

function load(name: 'eat' | 'die'): Sound | null {
  if (MOCK) return null;
  const file = name === 'eat' ? 'eat.wav' : 'die.wav';
  const s = new Sound(file, Sound.MAIN_BUNDLE, () => {});
  return s;
}

export const sfx = {
  eat() {
    if (MOCK) return;
    if (!cachedEat) cachedEat = load('eat');
    cachedEat?.play();
  },
  die() {
    if (MOCK) return;
    if (!cachedDie) cachedDie = load('die');
    cachedDie?.play();
  },
};
