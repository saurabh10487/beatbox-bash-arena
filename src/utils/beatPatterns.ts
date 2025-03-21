
import { Sound, sounds } from './audioUtils';

export interface BeatPattern {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  pattern: Array<{soundId: string, timing: number}>;
}

// Collection of predefined beat patterns
export const beatPatterns: BeatPattern[] = [
  {
    id: 'basic-beat',
    name: 'Basic Beat',
    difficulty: 'beginner',
    description: 'A simple kick-snare pattern to get started',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'hihat', timing: 250 },
      { soundId: 'snare', timing: 500 },
      { soundId: 'hihat', timing: 750 },
      { soundId: 'kick', timing: 1000 },
      { soundId: 'hihat', timing: 1250 },
      { soundId: 'snare', timing: 1500 },
      { soundId: 'hihat', timing: 1750 },
    ]
  },
  {
    id: 'boots-cats',
    name: 'Boots & Cats',
    difficulty: 'beginner',
    description: 'The classic "boots and cats" pattern',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'hihat', timing: 200 },
      { soundId: 'snare', timing: 400 },
      { soundId: 'hihat', timing: 600 },
      { soundId: 'kick', timing: 800 },
      { soundId: 'hihat', timing: 1000 },
      { soundId: 'snare', timing: 1200 },
      { soundId: 'hihat', timing: 1400 },
    ]
  },
  {
    id: 'trap-beat',
    name: 'Trap Beat',
    difficulty: 'intermediate',
    description: 'A trap-inspired pattern with fast hi-hats',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'snare', timing: 500 },
      { soundId: 'hihat', timing: 0 },
      { soundId: 'hihat', timing: 125 },
      { soundId: 'hihat', timing: 250 },
      { soundId: 'hihat', timing: 375 },
      { soundId: 'hihat', timing: 500 },
      { soundId: 'hihat', timing: 625 },
      { soundId: 'hihat', timing: 750 },
      { soundId: 'hihat', timing: 875 },
      { soundId: 'kick', timing: 1000 },
      { soundId: 'hihat', timing: 1000 },
      { soundId: 'hihat', timing: 1125 },
      { soundId: 'hihat', timing: 1250 },
      { soundId: 'hihat', timing: 1375 },
      { soundId: 'snare', timing: 1500 },
      { soundId: 'hihat', timing: 1500 },
      { soundId: 'hihat', timing: 1625 },
      { soundId: 'hihat', timing: 1750 },
      { soundId: 'hihat', timing: 1875 },
    ]
  }
];

// Get a beat pattern by ID
export const getBeatPatternById = (id: string): BeatPattern | undefined => {
  return beatPatterns.find(pattern => pattern.id === id);
};

// Get sound object by ID
export const getSoundById = (id: string): Sound | undefined => {
  return sounds.find(sound => sound.id === id);
};
