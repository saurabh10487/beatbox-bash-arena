
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
      const audio = new Audio();
      audio.src = sound.file;
      audio.preload = 'auto';
      audioCache[sound.id] = audio;
    }
  });
};

// Play a sound by ID
export const playSound = (soundId: string) => {
  if (audioCache[soundId]) {
    // Clone the audio to allow for overlapping sounds
    const audio = audioCache[soundId].cloneNode() as HTMLAudioElement;
    audio.play().catch(err => console.error("Error playing sound:", err));
    return audio;
  } else {
    console.error(`Sound with ID ${soundId} not found in cache`);
    return null;
  }
};

// Create audio context for visualization
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;

export const getAudioContext = (): { context: AudioContext; analyser: AnalyserNode } => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
  }
  
  return { context: audioContext, analyser: analyser! };
};

// Connect an audio element to the analyzer
export const connectToAnalyser = (audioElement: HTMLAudioElement) => {
  const { context, analyser } = getAudioContext();
  const source = context.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(context.destination);
  return analyser;
};

// Get frequency data for visualization
export const getFrequencyData = () => {
  if (!analyser) return new Uint8Array(0);
  
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
