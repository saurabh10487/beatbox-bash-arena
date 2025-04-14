
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
  sounds.forEach(sound => {
    if (!audioCache[sound.id]) {
      try {
        // Try to load the actual sound file
        const audio = new Audio(sound.file);
        audioCache[sound.id] = audio;
        
        // Add error handler to fallback to generated sounds
        audio.addEventListener('error', () => {
          console.log(`Falling back to generated sound for ${sound.id}`);
        });
      } catch (err) {
        console.error(`Error preloading sound ${sound.id}:`, err);
      }
    }
  });
  
  return Promise.resolve(); // Always resolve immediately
};

// Create audio context for visualization
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let lastActiveTime = 0;

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
  const { context, analyser } = getVisualizerAudioContext();
  
  try {
    const source = context.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(context.destination);
    return analyser;
  } catch (err) {
    console.error("Error connecting to analyser:", err);
    return analyser;
  }
};

// Get frequency data for visualization - now uses a simulated approach
export const getFrequencyData = () => {
  // Update the last active time when sounds are played
  const now = Date.now();
  const isActive = now - lastActiveTime < 300; // Consider active for 300ms after last sound
  
  if (!analyser || !isActive) {
    // Create a minimal frequency response when analyzer isn't connected or inactive
    const dataArray = new Uint8Array(128);
    for (let i = 0; i < 128; i++) {
      // Create a minimal baseline visualization
      const position = i / 128;
      const baseLine = 10; // Lower base activity level when inactive
      const randomFactor = Math.random() * 5; // Less randomness
      
      // More subtle curve
      const curve = Math.sin(position * Math.PI) * 20;
      
      dataArray[i] = Math.min(255, Math.max(0, baseLine + randomFactor + curve));
    }
    return dataArray;
  }
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  return dataArray;
};

// Mark a sound as being played (for visualization purposes)
export const markSoundPlayed = () => {
  lastActiveTime = Date.now();
};

// Define the base function that plays the sound
const playGeneratedSoundInternal = (soundId: string) => {
  try {
    // First try to play the cached sound
    if (audioCache[soundId]) {
      const audio = audioCache[soundId];
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Error playing cached sound, falling back to generated sound:", error);
          // Fallback to generated sound
          playGeneratedSound(soundId);
        });
      }
      
      return audio;
    } else {
      // Fallback to generated sound
      const source = playGeneratedSound(soundId);
      return source as unknown as HTMLAudioElement; // Type casting for compatibility
    }
  } catch (err) {
    console.error("Error playing sound, falling back to generated sound:", err);
    // Final fallback
    const source = playGeneratedSound(soundId);
    return source as unknown as HTMLAudioElement;
  }
};

// Export the wrapped version that also marks the sound as played
export const playSound = (soundId: string) => {
  markSoundPlayed(); // Mark that a sound was played
  return playGeneratedSoundInternal(soundId);
};

// Enhanced recorder with better timing precision
export class Recorder {
  private recording: Array<{soundId: string, timestamp: number}> = [];
  private startTime: number = 0;
  private isRecording: boolean = false;
  private patternMode: boolean = false;
  private timeSignature: [number, number] = [4, 4]; // [beats, beat unit]
  private tempo: number = 120; // BPM

  startRecording(patternMode = false, tempo = 120, timeSignature: [number, number] = [4, 4]) {
    this.recording = [];
    this.startTime = Date.now();
    this.isRecording = true;
    this.patternMode = patternMode;
    this.tempo = tempo;
    this.timeSignature = timeSignature;
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
    if (this.recording.length === 0) return 0;
    
    const startTime = Date.now();
    const timeouts: NodeJS.Timeout[] = [];
    
    this.recording.forEach(item => {
      const timeout = setTimeout(() => {
        onPlay(item.soundId);
      }, item.timestamp);
      
      timeouts.push(timeout);
    });
    
    // Return the duration of the recording and cleanup function
    const lastEvent = this.recording[this.recording.length - 1];
    
    // Cleanup function to stop playback
    const cleanup = () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
    
    return {
      duration: lastEvent.timestamp,
      cleanup
    };
  }

  // For pattern-based recording (sequencer)
  getPatternData() {
    if (!this.patternMode || this.recording.length === 0) return null;
    
    // Calculate beat duration in ms
    const beatDuration = (60 / this.tempo) * 1000;
    const patternLength = this.timeSignature[0] * 4; // 4 beats for a whole note
    
    // Create empty pattern grid
    const patternGrid: Record<string, boolean[]> = {};
    sounds.forEach(sound => {
      patternGrid[sound.id] = Array(patternLength).fill(false);
    });
    
    // Fill in pattern based on recording
    this.recording.forEach(item => {
      // Calculate the beat position (quantize)
      const beatPosition = Math.round(item.timestamp / beatDuration);
      if (beatPosition < patternLength) {
        patternGrid[item.soundId][beatPosition] = true;
      }
    });
    
    return patternGrid;
  }
}

// Global recorder instance
export const recorder = new Recorder();

// Add function to analyze microphone input
export const analyzeMicrophoneInput = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    
    source.connect(analyser);
    
    const data = new Uint8Array(analyser.frequencyBinCount);
    
    const getAudioData = () => {
      analyser.getByteFrequencyData(data);
      return data;
    };
    
    const stopAnalyzing = () => {
      stream.getTracks().forEach(track => track.stop());
      source.disconnect();
    };
    
    return {
      getAudioData,
      stopAnalyzing
    };
  } catch (err) {
    console.error("Error analyzing microphone input:", err);
    throw err;
  }
};
