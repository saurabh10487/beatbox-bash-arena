import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Save, Trash2, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { playSound, sounds } from '../utils/audioUtils';

interface SequencerProps {
  onPatternChange?: (pattern: boolean[][]) => void;
}

const Sequencer = ({ onPatternChange }: SequencerProps) => {
  const [pattern, setPattern] = useState<boolean[][]>(() => 
    Array(sounds.length).fill(null).map(() => Array(16).fill(false))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [tempo, setTempo] = useState(120);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSequencer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsPlaying(true);
    setCurrentStep(-1);
    
    const stepTime = (60 / tempo) * 250;
    intervalRef.current = setInterval(() => {
      setCurrentStep(step => {
        const nextStep = (step + 1) % 16;
        
        pattern.forEach((trackPattern, soundIndex) => {
          if (trackPattern[nextStep]) {
            playSound(sounds[soundIndex].id);
          }
        });
        
        return nextStep;
      });
    }, stepTime);
  };

  const stopSequencer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  const clearPattern = () => {
    const emptyPattern = Array(sounds.length).fill(null).map(() => Array(16).fill(false));
    setPattern(emptyPattern);
    if (onPatternChange) onPatternChange(emptyPattern);
  };

  const toggleCell = (trackIndex: number, stepIndex: number) => {
    const newPattern = [...pattern];
    newPattern[trackIndex] = [...newPattern[trackIndex]];
    newPattern[trackIndex][stepIndex] = !newPattern[trackIndex][stepIndex];
    setPattern(newPattern);
    
    if (onPatternChange) onPatternChange(newPattern);
  };

  const handleTempoChange = (value: number[]) => {
    const newTempo = value[0];
    setTempo(newTempo);
    
    if (isPlaying) {
      stopSequencer();
      startSequencer();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sequencer</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{tempo} BPM</span>
          <div className="w-32">
            <Slider 
              defaultValue={[tempo]} 
              min={60} 
              max={200} 
              step={1} 
              onValueChange={handleTempoChange}
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-16 gap-0 mb-1">
            {Array(16).fill(0).map((_, i) => (
              <div 
                key={`header-${i}`} 
                className={`h-6 w-6 flex items-center justify-center text-xs font-mono ${
                  i % 4 === 0 ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          
          {pattern.map((trackPattern, trackIndex) => (
            <div key={`track-${trackIndex}`} className="flex items-center mb-2">
              <div 
                className={`w-12 h-6 mr-2 rounded-sm text-xs flex items-center justify-center text-white ${sounds[trackIndex].color}`}
              >
                {sounds[trackIndex].name}
              </div>
              <div className="grid grid-cols-16 gap-0 flex-1">
                {trackPattern.map((active, stepIndex) => (
                  <div 
                    key={`cell-${trackIndex}-${stepIndex}`}
                    onClick={() => toggleCell(trackIndex, stepIndex)}
                    className={`
                      h-6 w-6 border border-gray-200 cursor-pointer transition-all
                      ${active ? `${sounds[trackIndex].color} opacity-80` : 'bg-gray-100 hover:bg-gray-200'}
                      ${currentStep === stepIndex ? 'ring-2 ring-blue-400' : ''}
                      ${stepIndex % 4 === 0 ? 'border-l-2 border-l-gray-300' : ''}
                    `}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <div className="flex gap-2">
          <Button
            onClick={isPlaying ? stopSequencer : startSequencer}
            variant="default"
            className={isPlaying 
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-beatbox-primary hover:bg-beatbox-primary/90 text-white"
            }
          >
            {isPlaying ? (
              <>
                <Square size={16} className="mr-2" />
                <span className="text-sm font-medium">Stop</span>
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                <span className="text-sm font-medium">Play</span>
              </>
            )}
          </Button>
        </div>
        
        <Button
          onClick={clearPattern}
          variant="secondary"
          className="bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <Trash2 size={16} className="mr-2" />
          <span className="text-sm font-medium">Clear</span>
        </Button>
      </div>
    </div>
  );
};

export default Sequencer;
