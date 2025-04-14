
import { useState, useRef } from 'react';
import { Mic, Square, Play, Save, Trash2 } from 'lucide-react';
import { recorder } from '../utils/audioUtils';

interface RecordingControlsProps {
  onRecordingStateChange: (isRecording: boolean) => void;
  onPlay: (soundId: string) => void;
}

const RecordingControls = ({ onRecordingStateChange, onPlay }: RecordingControlsProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startRecording = () => {
    recorder.startRecording();
    setIsRecording(true);
    onRecordingStateChange(true);
    setHasRecording(false);
    startTimeRef.current = Date.now();
    
    // Start timer to update elapsed time
    timerRef.current = setInterval(() => {
      setElapsedTime(Date.now() - startTimeRef.current);
    }, 100);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    const recording = recorder.stopRecording();
    setIsRecording(false);
    onRecordingStateChange(false);
    setHasRecording(recording.length > 0);
    
    if (recording.length > 0) {
      const duration = recording[recording.length - 1].timestamp;
      setRecordingDuration(duration);
    }
    
    setElapsedTime(0);
  };

  const playRecording = () => {
    setIsPlaying(true);
    const result = recorder.playRecording(onPlay);
    
    if (result && result.duration) {
      setTimeout(() => {
        setIsPlaying(false);
      }, result.duration + 100);
    } else {
      setIsPlaying(false);
    }
  };

  const clearRecording = () => {
    recorder.stopRecording();
    setHasRecording(false);
    setIsRecording(false);
    onRecordingStateChange(false);
    setElapsedTime(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${seconds}.${String(milliseconds).padStart(2, '0')}s`;
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-beatbox-border transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-beatbox-foreground/70">Recording</span>
          {isRecording && (
            <div className="flex h-2 w-2">
              <span className="animate-ping absolute h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative rounded-full h-2 w-2 bg-red-500"></span>
            </div>
          )}
        </div>
        {(isRecording || hasRecording) && (
          <div className="text-sm font-mono text-beatbox-foreground/60">
            {isRecording ? formatTime(elapsedTime) : formatTime(recordingDuration)}
          </div>
        )}
      </div>
      
      <div className="flex gap-2 justify-between">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            disabled={isPlaying}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
              isPlaying 
                ? 'bg-beatbox-muted text-beatbox-foreground/40 cursor-not-allowed' 
                : 'bg-beatbox-accent/10 hover:bg-beatbox-accent/20 text-beatbox-accent'
            }`}
          >
            <Mic className="h-4 w-4" />
            <span className="text-sm font-medium">Record</span>
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="flex-1 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Square className="h-4 w-4" />
            <span className="text-sm font-medium">Stop</span>
          </button>
        )}
        
        <button 
          onClick={playRecording}
          disabled={!hasRecording || isPlaying || isRecording}
          className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
            !hasRecording || isPlaying || isRecording
              ? 'bg-beatbox-muted text-beatbox-foreground/40 cursor-not-allowed' 
              : 'bg-beatbox-primary/10 hover:bg-beatbox-primary/20 text-beatbox-primary'
          }`}
        >
          <Play className="h-4 w-4" />
          <span className="text-sm font-medium">Play</span>
        </button>
        
        <button 
          onClick={clearRecording}
          disabled={!hasRecording || isRecording}
          className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
            !hasRecording || isRecording 
              ? 'bg-beatbox-muted text-beatbox-foreground/40 cursor-not-allowed' 
              : 'bg-beatbox-muted hover:bg-beatbox-muted/80 text-beatbox-foreground/60 hover:text-red-500'
          }`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RecordingControls;
