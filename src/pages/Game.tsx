
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import PlatformerGame from '../components/game/PlatformerGame';

const Game = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Game Ready!",
      description: "Use arrow keys to move, space to jump.",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-beatbox-background relative">
      <Header />
      
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-transition">
        <div className="text-center mb-8">
          <div className="inline-block rounded-full bg-beatbox-highlight px-3 py-1 text-sm font-medium text-beatbox-accent mb-3">
            BeatBox Platformer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Rhythm Jumper
          </h1>
          <p className="text-beatbox-foreground/70 max-w-2xl mx-auto">
            Jump, run, and collect beats in this music-powered platformer game.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-beatbox-border p-6">
            <PlatformerGame />
          </div>
          
          <div className="mt-6 text-center">
            <div className="bg-white rounded-lg shadow p-4 inline-flex gap-4">
              <div className="flex flex-col items-center">
                <div className="text-sm text-beatbox-foreground/60">Move</div>
                <div className="flex gap-1 mt-1">
                  <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 text-xs">←</kbd>
                  <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 text-xs">→</kbd>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-beatbox-foreground/60">Jump</div>
                <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 text-xs mt-1">Space</kbd>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-beatbox-foreground/60">Restart</div>
                <kbd className="px-2 py-1 rounded bg-gray-100 border border-gray-300 text-xs mt-1">R</kbd>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 bg-beatbox-muted/30 border-t border-beatbox-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-beatbox-foreground/60">
          <p>Created with precision and simplicity in mind. BeatBox Studio © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Game;
