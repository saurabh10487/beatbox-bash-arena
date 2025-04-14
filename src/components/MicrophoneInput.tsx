
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface MicrophoneInputProps {
  onAudioData?: (data: Float32Array) => void;
}

const MicrophoneInput = ({ onAudioData }: MicrophoneInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(75);
  const [micAvailable, setMicAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Check if microphone is available
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setMicAvailable(true);
    } else {
      setError("Microphone access not supported by your browser");
    }
    
    return () => {
      stopMicrophone();
    };
  }, []);
  
  const startMicrophone = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const context = audioContextRef.current;
      
      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create source and analyzer
      const source = context.createMediaStreamSource(stream);
      sourceRef.current = source;
      
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      
      // Create gain node for volume control
      const gainNode = context.createGain();
      gainNode.gain.value = volume / 100;
      gainNodeRef.current = gainNode;
      
      // Connect nodes
      source.connect(analyser);
      analyser.connect(gainNode);
      
      // Don't connect to destination by default to prevent feedback
      // Only connect to destination if we want to hear direct monitor
      // gainNode.connect(context.destination);
      
      setIsRecording(true);
      
      // Start processing audio data
      processAudioData();
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError("Could not access microphone. Please check permissions.");
    }
  };
  
  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    
    setIsRecording(false);
  };
  
  const processAudioData = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    
    analyser.getFloatTimeDomainData(dataArray);
    
    // Send audio data to parent component
    if (onAudioData) {
      onAudioData(dataArray);
    }
    
    // Continue processing
    requestAnimationFrame(processAudioData);
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume / 100;
    }
  };
  
  const toggleMicrophone = () => {
    if (isRecording) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-beatbox-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Microphone Input</h2>
        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMicrophone}
            disabled={!micAvailable}
            className={`
              flex items-center justify-center p-3 rounded-full transition-all
              ${!micAvailable 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : isRecording 
                  ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                  : 'bg-beatbox-primary/10 text-beatbox-primary hover:bg-beatbox-primary/20'
              }
            `}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <div className="flex-1 flex items-center gap-2">
            <VolumeX size={16} className="text-gray-500" />
            <Slider
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="flex-1"
            />
            <Volume2 size={16} className="text-gray-500" />
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          {isRecording 
            ? "Microphone active - Your voice can be used with the BeatBox" 
            : "Click the microphone button to start"}
        </div>
      </div>
    </div>
  );
};

export default MicrophoneInput;
