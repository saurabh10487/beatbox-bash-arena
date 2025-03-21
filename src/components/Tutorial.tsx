
import { useState } from 'react';
import { beatPatterns, BeatPattern } from '../utils/beatPatterns';
import { playSound } from '../utils/audioUtils';
import { Volume2, Play, Star } from 'lucide-react';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-red-100 text-red-700'
};

const Tutorial = () => {
  const [selectedPattern, setSelectedPattern] = useState<BeatPattern | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPattern = (pattern: BeatPattern) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setSelectedPattern(pattern);
    
    // Play each sound at its timing
    const timeouts: NodeJS.Timeout[] = [];
    pattern.pattern.forEach(item => {
      const timeout = setTimeout(() => {
        // Make sure we're using the correct playSound function 
        // that calls markSoundPlayed internally
        playSound(item.soundId);
      }, item.timing);
      timeouts.push(timeout);
    });
    
    // Clear playing state after the pattern completes
    const lastItem = pattern.pattern[pattern.pattern.length - 1];
    const duration = lastItem.timing + 500; // Add a bit of buffer
    
    setTimeout(() => {
      setIsPlaying(false);
    }, duration);
    
    return () => timeouts.forEach(clearTimeout); // Clean up timeouts
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-beatbox-border p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Learn Beatbox Patterns</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-beatbox-foreground/70 mb-2">Select a Pattern</h3>
          
          <div className="space-y-2">
            {beatPatterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => setSelectedPattern(pattern)}
                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${
                  selectedPattern?.id === pattern.id
                    ? 'border-beatbox-primary bg-beatbox-primary/5 shadow-sm'
                    : 'border-beatbox-border hover:border-beatbox-primary/30 hover:bg-beatbox-muted/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pattern.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[pattern.difficulty]}`}>
                    {pattern.difficulty}
                  </span>
                </div>
                <p className="text-sm text-beatbox-foreground/60 mt-1">
                  {pattern.description}
                </p>
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-beatbox-muted/30 rounded-xl p-4 border border-beatbox-border">
          {selectedPattern ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{selectedPattern.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[selectedPattern.difficulty]}`}>
                  {selectedPattern.difficulty}
                </span>
              </div>
              
              <p className="text-sm text-beatbox-foreground/70">
                {selectedPattern.description}
              </p>
              
              <div className="bg-white rounded-lg p-3 border border-beatbox-border">
                <h4 className="text-sm font-medium mb-2">Pattern Sequence</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.pattern.map((item, index) => (
                    <div 
                      key={`${item.soundId}-${index}`}
                      className="px-3 py-1 rounded-full bg-beatbox-highlight text-beatbox-accent text-xs font-medium"
                    >
                      {item.soundId}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={() => playPattern(selectedPattern)}
                disabled={isPlaying}
                className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 ${
                  isPlaying 
                    ? 'bg-beatbox-muted text-beatbox-foreground/40 cursor-not-allowed' 
                    : 'bg-beatbox-primary text-white shadow-md hover:shadow-lg hover:bg-beatbox-primary/90'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Volume2 className="h-5 w-5" />
                    <span>Playing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span>Play Pattern</span>
                  </>
                )}
              </button>
              
              <div className="text-center text-sm text-beatbox-foreground/60">
                Listen to the pattern and try to recreate it in the studio
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-beatbox-muted flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-beatbox-foreground/30" />
              </div>
              <h3 className="font-medium mb-2">Select a pattern</h3>
              <p className="text-sm text-beatbox-foreground/60">
                Choose a beat pattern from the list to see details and play it
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
