
import { playGeneratedSound } from './placeholderSounds';

export interface Sound {
  id: string;
  name: string;
  file: string;
  color: string;
}

// Collection of beatbox sounds
export const sounds: Sound[] = [
  { id: 'kick', name: 'Kick', file: '/sounds/kick.mp3', color: 'bg-beatbox-primary' },
  { id: 'snare', name: 'Snare', file: '/sounds/snare.mp3', color: 'bg-beatbox-accent' },
  { id: 'hihat', name: 'Hi-Hat', file: '/sounds/hihat.mp3', color: 'bg-beatbox-secondary' },
  { id: 'clap', name: 'Clap', file: '/sounds/clap.mp3', color: 'bg-teal-400' },
  { id: 'bass', name: 'Bass', file: '/sounds/bass.mp3', color: 'bg-purple-400' },
  { id: 'vocal', name: 'Vocal', file: '/sounds/vocal.mp3', color: 'bg-indigo-400' },
  { id: 'scratch', name: 'Scratch', file: '/sounds/scratch.mp3', color: 'bg-sky-400' },
  { id: 'rimshot', name: 'Rimshot', file: '/sounds/rimshot.mp3', color: 'bg-amber-400' },
];

// Cache for loaded audio elements
const audioCache: Record<string, HTMLAudioElement> = {};

// Preload all sounds to avoid latency
export const preloadSounds = () => {
  // We'll still maintain the original code structure, but we won't use the audioCache anymore
  sounds.forEach(sound => {
    if (!audioCache[sound.id]) {
      // Create empty audio element to maintain code compatibility
      const audio = new Audio();
      audio.src = sound.file;
      audioCache[sound.id] = audio;
    }
  });
  
  return Promise.resolve(); // Always resolve immediately
};

// Play a sound by ID - use generated sounds instead of audio files
export const playSound = (soundId: string) => {
  try {
    // Use the generated sounds
    const source = playGeneratedSound(soundId);
    return source as unknown as HTMLAudioElement; // Type casting for compatibility
  } catch (err) {
    console.error("Error playing sound:", err);
    return null;
  }
};

// Create audio context for visualization
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

// Using a different name to avoid conflict with the imported function
export const getVisualizerAudioContext = (): { context: AudioContext; analyser: AnalyserNode } => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
  }
  
  return { context: audioContext, analyser: analyser! };
};

// Connect an audio element to the analyzer
export const connectToAnalyser = (audioElement: HTMLAudioElement) => {
  // This function is not used with our generated sounds, but kept for compatibility
  const { context, analyser } = getVisualizerAudioContext();
  
  // For generated sounds, we would connect the source directly
  // But for compatibility, we'll just return the analyser
  return analyser;
};

// Get frequency data for visualization - now uses a simulated approach
export const getFrequencyData = () => {
  if (!analyser) {
    // Create a fake frequency response when analyzer isn't connected
    const dataArray = new Uint8Array(128);
    for (let i = 0; i < 128; i++) {
      // Create a realistic-looking frequency response
      const position = i / 128;
      const baseLine = 30; // Base activity level
      const randomFactor = Math.random() * 20; // Some randomness
      
      // Shape the response with a curve
      const curve = Math.sin(position * Math.PI) * 150;
      
      dataArray[i] = Math.min(255, Math.max(0, baseLine + randomFactor + curve));
    }
    return dataArray;
  }
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  return dataArray;
};

// Simple recording functionality
export class Recorder {
  private recording: Array<{soundId: string, timestamp: number}> = [];
  private startTime: number = 0;
  private isRecording: boolean = false;

  startRecording() {
    this.recording = [];
    this.startTime = Date.now();
    this.isRecording = true;
  }

  recordSound(soundId: string) {
    if (this.isRecording) {
      const timestamp = Date.now() - this.startTime;
      this.recording.push({ soundId, timestamp });
    }
  }

  stopRecording() {
    this.isRecording = false;
    return [...this.recording];
  }

  playRecording(onPlay: (soundId: string) => void) {
    if (this.recording.length === 0) return;
    
    const startTime = Date.now();
    
    this.recording.forEach(item => {
      setTimeout(() => {
        onPlay(item.soundId);
      }, item.timestamp);
    });
    
    // Return the duration of the recording
    const lastEvent = this.recording[this.recording.length - 1];
    return lastEvent.timestamp;
  }
}

// Global recorder instance
export const recorder = new Recorder();
