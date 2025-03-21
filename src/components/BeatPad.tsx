
import { useState, useCallback, useRef, useEffect } from 'react';
import { Sound, playSound, recorder } from '../utils/audioUtils';

interface BeatPadProps {
  sound: Sound;
  isRecording?: boolean;
  onPlay?: (sound: Sound) => void;
}

const BeatPad = ({ sound, isRecording = false, onPlay }: BeatPadProps) => {
  const [isActive, setIsActive] = useState(false);
  const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const padRef = useRef<HTMLButtonElement>(null);

  const createRippleEffect = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!padRef.current) return;
    
    const button = padRef.current;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');
    
    // Remove existing ripples
    const ripples = button.getElementsByClassName('ripple');
    if (ripples.length > 0) {
      ripples[0].remove();
    }
    
    button.appendChild(circle);
    
    // Remove ripple after animation completes
    if (rippleTimeoutRef.current) {
      clearTimeout(rippleTimeoutRef.current);
    }
    
    rippleTimeoutRef.current = setTimeout(() => {
      if (circle.parentElement) {
        circle.remove();
      }
    }, 800);
  }, []);

  const handlePadClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Play the sound
    playSound(sound.id);
    
    // Visual feedback
    setIsActive(true);
    createRippleEffect(event);
    
    // Record the sound if recording
    if (isRecording) {
      recorder.recordSound(sound.id);
    }
    
    // Notify parent component
    if (onPlay) {
      onPlay(sound);
    }
    
    // Reset active state after animation
    setTimeout(() => setIsActive(false), 200);
  }, [sound, isRecording, onPlay, createRippleEffect]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Map number keys 1-9 to pads
    const keyIndex = parseInt(event.key) - 1;
    const allSounds = document.querySelectorAll('.beat-pad');
    
    if (!isNaN(keyIndex) && keyIndex >= 0 && keyIndex < allSounds.length) {
      (allSounds[keyIndex] as HTMLElement).click();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <button
      ref={padRef}
      className={`beat-pad relative w-full aspect-square rounded-2xl overflow-hidden transition-all duration-300 ${sound.color} ${
        isActive ? 'active scale-95' : 'shadow-lg hover:shadow-xl hover:-translate-y-1'
      }`}
      onClick={handlePadClick}
      aria-label={`Play ${sound.name} sound`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white font-medium text-lg opacity-90">{sound.name}</span>
      </div>
    </button>
  );
};

export default BeatPad;
