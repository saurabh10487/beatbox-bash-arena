import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import BeatPad from '../components/BeatPad';
import Visualizer from '../components/Visualizer';
import RecordingControls from '../components/RecordingControls';
import Tutorial from '../components/Tutorial';
import Challenge from '../components/Challenge';
import Header from '../components/Header';
import Sequencer from '../components/Sequencer';
import { sounds, preloadSounds, playSound, Sound } from '../utils/audioUtils';

const HEADER_GRADIENT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Cdefs%3E%3ClinearGradient id='gradient' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230EA5E9;stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:%238B5CF6;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='400' fill='url(%23gradient)'/%3E%3C/svg%3E";

const Index = () => {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSound, setActiveSound] = useState<Sound | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [visibleSection, setVisibleSection] = useState<'studio' | 'tutorial' | 'challenge'>('studio');
  const [showSequencer, setShowSequencer] = useState(false);

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await preloadSounds();
        setIsLoaded(true);
        toast({
          title: "Ready to beatbox!",
          description: "All sounds loaded successfully. Click on the pads or use number keys 1-8.",
        });
      } catch (error) {
        console.error("Error loading sounds:", error);
        toast({
          title: "Error loading sounds",
          description: "Some sounds might not play correctly.",
          variant: "destructive",
        });
      }
    };
    
    loadSounds();
  }, [toast]);

  const handlePadPlay = (sound: Sound) => {
    setActiveSound(sound);
    setTimeout(() => setActiveSound(null), 300);
  };

  const handlePlay = (soundId: string) => {
    playSound(soundId);
    const sound = sounds.find(s => s.id === soundId);
    if (sound) {
      handlePadPlay(sound);
    }
  };

  return (
    <div className="min-h-screen bg-beatbox-background relative">
      <Header />
      
      <div 
        className="absolute top-0 left-0 right-0 h-96 bg-cover bg-center z-0 opacity-70"
        style={{ backgroundImage: `url("${HEADER_GRADIENT}")` }}
      />
      
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-transition">
        <div className="text-center mb-12">
          <div className="inline-block rounded-full bg-beatbox-highlight px-3 py-1 text-sm font-medium text-beatbox-accent mb-3">
            Premium Beatboxing Experience
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            BeatBox Studio
          </h1>
          <p className="text-beatbox-foreground/70 max-w-2xl mx-auto">
            Create your own beats, learn patterns, and challenge yourself with our minimalist beatboxing interface.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <button 
              onClick={() => setVisibleSection('studio')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                visibleSection === 'studio' 
                  ? 'bg-beatbox-primary text-white shadow-md' 
                  : 'bg-white text-beatbox-foreground/80 shadow-sm hover:bg-beatbox-muted'
              }`}
            >
              Studio
            </button>
            <button 
              onClick={() => setVisibleSection('tutorial')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                visibleSection === 'tutorial' 
                  ? 'bg-beatbox-primary text-white shadow-md' 
                  : 'bg-white text-beatbox-foreground/80 shadow-sm hover:bg-beatbox-muted'
              }`}
            >
              Learn
            </button>
            <button 
              onClick={() => setVisibleSection('challenge')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                visibleSection === 'challenge' 
                  ? 'bg-beatbox-primary text-white shadow-md' 
                  : 'bg-white text-beatbox-foreground/80 shadow-sm hover:bg-beatbox-muted'
              }`}
            >
              Challenge
            </button>
          </div>
        </div>
        
        {visibleSection === 'studio' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-beatbox-border p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Beatbox Studio</h2>
                <button 
                  onClick={() => setShowSequencer(!showSequencer)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    showSequencer 
                      ? 'bg-beatbox-primary text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {showSequencer ? 'Hide Sequencer' : 'Show Sequencer'}
                </button>
              </div>
              
              <Visualizer isActive={activeSound !== null} />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {sounds.map(sound => (
                  <BeatPad 
                    key={sound.id} 
                    sound={sound} 
                    isRecording={isRecording}
                    onPlay={handlePadPlay}
                  />
                ))}
              </div>
            </div>
            
            {showSequencer && (
              <div className="animate-fade-in">
                <Sequencer />
              </div>
            )}
            
            <RecordingControls 
              onRecordingStateChange={setIsRecording}
              onPlay={handlePlay}
            />
          </div>
        )}
        
        {visibleSection === 'tutorial' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Tutorial />
          </div>
        )}
        
        {visibleSection === 'challenge' && (
          <div className="max-w-5xl mx-auto animate-fade-in">
            <Challenge />
          </div>
        )}
      </main>
      
      <footer className="relative z-10 bg-beatbox-muted/30 border-t border-beatbox-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-beatbox-foreground/60">
          <p>Created by Saurabh Saxena with precision and simplicity in mind. BeatBox Studio © {new Date().getFullYear()}</p>
          <div className="mt-2">
            <a 
              href="https://www.instagram.com/mesaurabhsaxena/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-beatbox-primary hover:underline mx-2"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
