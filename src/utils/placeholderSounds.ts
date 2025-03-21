
// Generate sounds using Web Audio API instead of loading MP3 files
// This helps avoid the "Failed to load because no supported source was found" error

// Function to create an audio buffer with a specific sound
export const createSoundBuffer = (
  context: AudioContext, 
  type: 'kick' | 'snare' | 'hihat' | 'clap' | 'bass' | 'vocal' | 'scratch' | 'rimshot'
): AudioBuffer => {
  // Create a buffer for our sound
  const sampleRate = context.sampleRate;
  const duration = type === 'kick' || type === 'bass' ? 0.5 : 0.3;
  const bufferSize = sampleRate * duration;
  const buffer = context.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  // Fill the buffer based on sound type
  switch (type) {
    case 'kick':
      // A low frequency (bass drum) sound
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const frequency = 120 * Math.exp(-10 * t);
        data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-5 * t);
      }
      break;
    case 'snare':
      // Snare has noise + a mid-frequency tone
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const noise = Math.random() * 2 - 1;
        const tone = Math.sin(2 * Math.PI * 300 * t);
        data[i] = (noise * 0.7 + tone * 0.3) * Math.exp(-10 * t);
      }
      break;
    case 'hihat':
      // Hi-hat is mostly high-frequency noise
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-30 * t);
      }
      break;
    case 'clap':
      // Clap is like a short snare with more noise
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        data[i] = (Math.random() * 2 - 1) * Math.exp(-15 * t);
      }
      break;
    case 'bass':
      // Deep bass sound
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const frequency = 80 * Math.exp(-5 * t);
        data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-3 * t);
      }
      break;
    case 'vocal':
      // A simple "ah" sound approximation
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const f1 = 500; // First formant
        const f2 = 1200; // Second formant
        data[i] = (
          Math.sin(2 * Math.PI * f1 * t) * 0.5 + 
          Math.sin(2 * Math.PI * f2 * t) * 0.3
        ) * Math.exp(-8 * t);
      }
      break;
    case 'scratch':
      // Scratch DJ effect
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const modulation = Math.sin(2 * Math.PI * 8 * t); // Modulation
        const carrier = Math.sin(2 * Math.PI * 400 * t * (1 + 0.5 * modulation));
        data[i] = carrier * Math.exp(-10 * t);
      }
      break;
    case 'rimshot':
      // Rimshot: short attack, quick decay
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const tone = Math.sin(2 * Math.PI * 800 * t);
        const noise = Math.random() * 2 - 1;
        data[i] = (tone * 0.6 + noise * 0.4) * Math.exp(-30 * t);
      }
      break;
  }

  return buffer;
};

// Cache for our sound buffers
const soundBuffers: Record<string, AudioBuffer> = {};

// Audio context
let audioContext: AudioContext | null = null;

// Get or create audio context
export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Get a sound buffer, creating it if needed
export const getSoundBuffer = (soundId: string): AudioBuffer => {
  const context = getAudioContext();
  
  if (!soundBuffers[soundId]) {
    soundBuffers[soundId] = createSoundBuffer(
      context, 
      soundId as 'kick' | 'snare' | 'hihat' | 'clap' | 'bass' | 'vocal' | 'scratch' | 'rimshot'
    );
  }
  
  return soundBuffers[soundId];
};

// Play a sound by ID
export const playGeneratedSound = (soundId: string): AudioBufferSourceNode | null => {
  try {
    const context = getAudioContext();
    const buffer = getSoundBuffer(soundId);
    
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start();
    
    return source;
  } catch (err) {
    console.error("Error playing generated sound:", err);
    return null;
  }
};
