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
  },
  {
    id: 'dubstep-wobble',
    name: 'Dubstep Wobble',
    difficulty: 'advanced',
    description: 'A crazy dubstep-inspired pattern with wobble bass',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'bass', timing: 0 },
      { soundId: 'hihat', timing: 125 },
      { soundId: 'bass', timing: 250 },
      { soundId: 'hihat', timing: 375 },
      { soundId: 'snare', timing: 500 },
      { soundId: 'bass', timing: 500 },
      { soundId: 'scratch', timing: 625 },
      { soundId: 'hihat', timing: 750 },
      { soundId: 'bass', timing: 750 },
      { soundId: 'snare', timing: 875 },
      { soundId: 'kick', timing: 1000 },
      { soundId: 'bass', timing: 1000 },
      { soundId: 'hihat', timing: 1125 },
      { soundId: 'vocal', timing: 1250 },
      { soundId: 'hihat', timing: 1375 },
      { soundId: 'snare', timing: 1500 },
      { soundId: 'kick', timing: 1500 },
      { soundId: 'hihat', timing: 1625 },
      { soundId: 'bass', timing: 1750 },
      { soundId: 'scratch', timing: 1750 },
      { soundId: 'hihat', timing: 1875 }
    ]
  },
  {
    id: 'beatbox-frenzy',
    name: 'Beatbox Frenzy',
    difficulty: 'advanced',
    description: 'Rapid-fire beatbox pattern with crazy rhythm changes',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'hihat', timing: 100 },
      { soundId: 'snare', timing: 200 },
      { soundId: 'hihat', timing: 300 },
      { soundId: 'kick', timing: 400 },
      { soundId: 'hihat', timing: 450 },
      { soundId: 'kick', timing: 500 },
      { soundId: 'clap', timing: 600 },
      { soundId: 'hihat', timing: 650 },
      { soundId: 'snare', timing: 700 },
      { soundId: 'kick', timing: 800 },
      { soundId: 'hihat', timing: 850 },
      { soundId: 'vocal', timing: 900 },
      { soundId: 'snare', timing: 1000 },
      { soundId: 'hihat', timing: 1050 },
      { soundId: 'kick', timing: 1100 },
      { soundId: 'hihat', timing: 1150 },
      { soundId: 'scratch', timing: 1200 },
      { soundId: 'kick', timing: 1300 },
      { soundId: 'hihat', timing: 1350 },
      { soundId: 'snare', timing: 1400 },
      { soundId: 'kick', timing: 1500 },
      { soundId: 'hihat', timing: 1550 },
      { soundId: 'rimshot', timing: 1600 },
      { soundId: 'vocal', timing: 1650 },
      { soundId: 'snare', timing: 1700 },
      { soundId: 'hihat', timing: 1750 },
      { soundId: 'kick', timing: 1800 },
      { soundId: 'hihat', timing: 1850 },
      { soundId: 'clap', timing: 1900 }
    ]
  },
  {
    id: 'bass-drop',
    name: 'Bass Drop',
    difficulty: 'intermediate',
    description: 'Bass-heavy pattern with a dramatic drop',
    pattern: [
      { soundId: 'hihat', timing: 0 },
      { soundId: 'hihat', timing: 200 },
      { soundId: 'hihat', timing: 400 },
      { soundId: 'rimshot', timing: 500 },
      { soundId: 'hihat', timing: 600 },
      { soundId: 'hihat', timing: 800 },
      { soundId: 'vocal', timing: 900 },
      { soundId: 'hihat', timing: 1000 },
      { soundId: 'hihat', timing: 1200 },
      { soundId: 'clap', timing: 1300 },
      { soundId: 'hihat', timing: 1400 },
      { soundId: 'hihat', timing: 1600 },
      { soundId: 'hihat', timing: 1800 },
      { soundId: 'scratch', timing: 1900 },
      { soundId: 'kick', timing: 2000 },
      { soundId: 'bass', timing: 2000 },
      { soundId: 'snare', timing: 2100 },
      { soundId: 'kick', timing: 2200 },
      { soundId: 'bass', timing: 2200 },
      { soundId: 'hihat', timing: 2300 },
      { soundId: 'kick', timing: 2400 },
      { soundId: 'bass', timing: 2400 },
      { soundId: 'snare', timing: 2500 },
      { soundId: 'kick', timing: 2600 },
      { soundId: 'bass', timing: 2600 },
      { soundId: 'hihat', timing: 2700 },
      { soundId: 'kick', timing: 2800 },
      { soundId: 'bass', timing: 2800 },
      { soundId: 'snare', timing: 2900 }
    ]
  },
  {
    id: 'techno-madness',
    name: 'Techno Madness',
    difficulty: 'advanced',
    description: 'Fast-paced techno pattern with crazy rhythms',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'hihat', timing: 100 },
      { soundId: 'hihat', timing: 200 },
      { soundId: 'rimshot', timing: 300 },
      { soundId: 'hihat', timing: 350 },
      { soundId: 'kick', timing: 400 },
      { soundId: 'hihat', timing: 450 },
      { soundId: 'hihat', timing: 550 },
      { soundId: 'snare', timing: 600 },
      { soundId: 'hihat', timing: 650 },
      { soundId: 'hihat', timing: 750 },
      { soundId: 'kick', timing: 800 },
      { soundId: 'hihat', timing: 850 },
      { soundId: 'hihat', timing: 950 },
      { soundId: 'clap', timing: 1000 },
      { soundId: 'scratch', timing: 1050 },
      { soundId: 'hihat', timing: 1100 },
      { soundId: 'kick', timing: 1200 },
      { soundId: 'hihat', timing: 1250 },
      { soundId: 'hihat', timing: 1350 },
      { soundId: 'snare', timing: 1400 },
      { soundId: 'hihat', timing: 1450 },
      { soundId: 'hihat', timing: 1550 },
      { soundId: 'kick', timing: 1600 },
      { soundId: 'bass', timing: 1600 },
      { soundId: 'hihat', timing: 1650 },
      { soundId: 'hihat', timing: 1750 },
      { soundId: 'snare', timing: 1800 },
      { soundId: 'vocal', timing: 1850 },
      { soundId: 'hihat', timing: 1900 }
    ]
  },
  {
    id: 'glitch-hop',
    name: 'Glitch Hop',
    difficulty: 'advanced',
    description: 'Glitchy pattern with irregular timing and crazy rhythms',
    pattern: [
      { soundId: 'kick', timing: 0 },
      { soundId: 'scratch', timing: 100 },
      { soundId: 'hihat', timing: 175 },
      { soundId: 'kick', timing: 300 },
      { soundId: 'vocal', timing: 350 },
      { soundId: 'snare', timing: 450 },
      { soundId: 'hihat', timing: 500 },
      { soundId: 'kick', timing: 600 },
      { soundId: 'rimshot', timing: 650 },
      { soundId: 'hihat', timing: 725 },
      { soundId: 'snare', timing: 800 },
      { soundId: 'hihat', timing: 850 },
      { soundId: 'kick', timing: 900 },
      { soundId: 'scratch', timing: 975 },
      { soundId: 'hihat', timing: 1025 },
      { soundId: 'bass', timing: 1100 },
      { soundId: 'kick', timing: 1200 },
      { soundId: 'snare', timing: 1250 },
      { soundId: 'hihat', timing: 1325 },
      { soundId: 'kick', timing: 1400 },
      { soundId: 'clap', timing: 1450 },
      { soundId: 'hihat', timing: 1525 },
      { soundId: 'snare', timing: 1600 },
      { soundId: 'vocal', timing: 1650 },
      { soundId: 'hihat', timing: 1725 },
      { soundId: 'kick', timing: 1800 },
      { soundId: 'bass', timing: 1850 },
      { soundId: 'hihat', timing: 1925 }
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
