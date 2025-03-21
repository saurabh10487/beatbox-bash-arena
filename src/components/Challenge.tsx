
import { useState, useEffect, useRef } from 'react';
import { beatPatterns, BeatPattern } from '../utils/beatPatterns';
import { playSound } from '../utils/audioUtils';
import { Play, Medal, Clock, Check, Music } from 'lucide-react';

const Challenge = () => {
  const [selectedPattern, setSelectedPattern] = useState<BeatPattern | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [challengeState, setChallengeState] = useState<'idle' | 'countdown' | 'playing' | 'completed'>('idle');
  const expectedInputsRef = useRef<Array<{ soundId: string, timing: number }>>([]);
  const userInputsRef = useRef<Array<{ soundId: string, timing: number }>>([]);
  const startTimeRef = useRef<number>(0);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      // Clean up any timeouts when component unmounts
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const startChallenge = (pattern: BeatPattern) => {
    if (challengeState !== 'idle') return;
    
    setSelectedPattern(pattern);
    setChallengeState('countdown');
    setIsCompleted(false);
    setScore(0);
    setCountdown(3);
    
    // Start countdown
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          playChallenge(pattern);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    timeoutsRef.current.push(countdownTimer as unknown as NodeJS.Timeout);
  };

  const playChallenge = (pattern: BeatPattern) => {
    setChallengeState('playing');
    setIsPlaying(true);
    expectedInputsRef.current = [...pattern.pattern];
    userInputsRef.current = [];
    startTimeRef.current = Date.now();
    
    // Play each sound at its timing
    pattern.pattern.forEach(item => {
      const timeout = setTimeout(() => {
        playSound(item.soundId);
      }, item.timing);
      timeoutsRef.current.push(timeout);
    });
    
    // End challenge after pattern duration + 2 seconds
    const lastItem = pattern.pattern[pattern.pattern.length - 1];
    const duration = lastItem.timing + 2000; // Add 2 seconds buffer
    
    const endTimeout = setTimeout(() => {
      endChallenge();
    }, duration);
    
    timeoutsRef.current.push(endTimeout);
  };

  const recordUserInput = (soundId: string) => {
    if (challengeState !== 'playing') return;
    
    const timing = Date.now() - startTimeRef.current;
    userInputsRef.current.push({ soundId, timing });
  };

  const endChallenge = () => {
    setIsPlaying(false);
    setChallengeState('completed');
    setIsCompleted(true);
    
    // Calculate score based on timing accuracy
    calculateScore();
  };

  const calculateScore = () => {
    if (!selectedPattern) return;
    
    const expectedInputs = expectedInputsRef.current;
    const userInputs = userInputsRef.current;
    
    // Simple scoring: For each expected input, find the closest user input
    let totalScore = 0;
    const maxScore = expectedInputs.length * 100;
    
    expectedInputs.forEach(expected => {
      // Find closest user input by timing
      let closestInput = null;
      let minTimeDiff = Infinity;
      
      for (const userInput of userInputs) {
        if (userInput.soundId === expected.soundId) {
          const timeDiff = Math.abs(userInput.timing - expected.timing);
          if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestInput = userInput;
          }
        }
      }
      
      // Award points based on timing accuracy
      if (closestInput) {
        // Within 200ms is good
        if (minTimeDiff <= 100) {
          totalScore += 100;
        } else if (minTimeDiff <= 200) {
          totalScore += 75;
        } else if (minTimeDiff <= 400) {
          totalScore += 50;
        } else if (minTimeDiff <= 600) {
          totalScore += 25;
        }
      }
    });
    
    // Convert to percentage
    const percentScore = Math.round((totalScore / maxScore) * 100);
    setScore(percentScore);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-beatbox-border p-6 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Challenge Mode</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-beatbox-foreground/70 mb-2">Select a Challenge</h3>
          
          <div className="space-y-2">
            {beatPatterns.map(pattern => (
              <button
                key={pattern.id}
                onClick={() => challengeState === 'idle' && setSelectedPattern(pattern)}
                disabled={challengeState !== 'idle'}
                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${
                  challengeState !== 'idle' && selectedPattern?.id !== pattern.id
                    ? 'opacity-50 cursor-not-allowed'
                    : selectedPattern?.id === pattern.id
                    ? 'border-beatbox-primary bg-beatbox-primary/5 shadow-sm'
                    : 'border-beatbox-border hover:border-beatbox-primary/30 hover:bg-beatbox-muted/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pattern.name}</span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pattern.difficulty === 'beginner' ? 1 : pattern.difficulty === 'intermediate' ? 2 : 3 }).map((_, i) => (
                      <Medal key={i} className="h-3.5 w-3.5 text-beatbox-accent/70" />
                    ))}
                  </div>
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
              {challengeState === 'countdown' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-5xl font-bold text-beatbox-primary mb-2">
                    {countdown}
                  </div>
                  <p className="text-sm text-beatbox-foreground/70">
                    Get ready to beatbox!
                  </p>
                </div>
              ) : challengeState === 'playing' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-beatbox-primary/10 flex items-center justify-center mb-4">
                    <Music className="h-8 w-8 text-beatbox-primary animate-pulse" />
                  </div>
                  <h3 className="font-medium mb-2">Listen & Repeat</h3>
                  <p className="text-sm text-beatbox-foreground/60">
                    Play the sounds in the correct order and timing
                  </p>
                </div>
              ) : challengeState === 'completed' ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    score >= 80 
                      ? 'bg-green-100' 
                      : score >= 50 
                      ? 'bg-amber-100' 
                      : 'bg-red-100'
                  }`}>
                    <div className={`text-3xl font-bold ${
                      score >= 80 
                        ? 'text-green-600' 
                        : score >= 50 
                        ? 'text-amber-600' 
                        : 'text-red-600'
                    }`}>
                      {score}%
                    </div>
                  </div>
                  <h3 className="font-medium mb-2">
                    {score >= 80 
                      ? 'Excellent!' 
                      : score >= 50 
                      ? 'Good job!' 
                      : 'Keep practicing!'}
                  </h3>
                  <button
                    onClick={() => setChallengeState('idle')}
                    className="px-4 py-2 bg-beatbox-primary text-white rounded-lg shadow-sm hover:bg-beatbox-primary/90 transition-colors mt-2"
                  >
                    Try Another
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{selectedPattern.name}</h3>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: selectedPattern.difficulty === 'beginner' ? 1 : selectedPattern.difficulty === 'intermediate' ? 2 : 3 }).map((_, i) => (
                        <Medal key={i} className="h-4 w-4 text-beatbox-accent/70" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-sm text-beatbox-foreground/70">
                    {selectedPattern.description}
                  </p>
                  
                  <div className="bg-white rounded-lg p-3 border border-beatbox-border">
                    <h4 className="text-sm font-medium mb-2">How to Play</h4>
                    <ol className="text-sm text-beatbox-foreground/70 list-decimal list-inside space-y-1">
                      <li>Click "Start Challenge" to begin</li>
                      <li>Listen to the beat pattern carefully</li>
                      <li>Repeat the pattern using the beat pads</li>
                      <li>Try to match the timing as closely as possible</li>
                    </ol>
                  </div>
                  
                  <button
                    onClick={() => startChallenge(selectedPattern)}
                    className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 bg-beatbox-primary text-white shadow-md hover:shadow-lg hover:bg-beatbox-primary/90"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Challenge</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-beatbox-muted flex items-center justify-center mb-4">
                <Medal className="h-8 w-8 text-beatbox-foreground/30" />
              </div>
              <h3 className="font-medium mb-2">Select a challenge</h3>
              <p className="text-sm text-beatbox-foreground/60">
                Choose a beat pattern challenge from the list to start
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenge;
