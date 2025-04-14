
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Header from '../components/Header';
import PlatformerGame from '../components/game/PlatformerGame';

const Game = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Game Ready!",
      description: "Use arrow keys to move, space to jump. Reach level 3 to face the boss!",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Header />
      
      {/* Background pattern for retro feeling */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 grid grid-cols-16 gap-px">
          {[...Array(256)].map((_, i) => (
            <div key={i} className="bg-gray-200 w-full h-full"></div>
          ))}
        </div>
      </div>
      
      <main className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto page-transition">
        <div className="text-center mb-8">
          <div className="inline-block rounded-none bg-yellow-500 px-3 py-1 text-sm font-pixelated text-black mb-3">
            BeatBox Platformer
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-yellow-300 font-pixelated pixelated-text">
            Rhythm Jumper
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-pixelated text-sm">
            Jump, run, and collect beats in this music-powered platformer game.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-none shadow-lg border-4 border-gray-900 p-6 pixelated-border">
            <PlatformerGame />
          </div>
          
          <div className="mt-6 text-center">
            <div className="bg-gray-800 rounded-none shadow-lg border-2 border-gray-900 p-4 inline-flex gap-4 pixelated-border">
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400 font-pixelated">Move</div>
                <div className="flex gap-1 mt-1">
                  <kbd className="px-2 py-1 rounded-none bg-gray-700 border-2 border-gray-500 text-xs text-yellow-300 font-pixelated">←</kbd>
                  <kbd className="px-2 py-1 rounded-none bg-gray-700 border-2 border-gray-500 text-xs text-yellow-300 font-pixelated">→</kbd>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400 font-pixelated">Jump</div>
                <kbd className="px-2 py-1 rounded-none bg-gray-700 border-2 border-gray-500 text-xs text-yellow-300 font-pixelated mt-1">Space</kbd>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-sm text-gray-400 font-pixelated">Restart</div>
                <kbd className="px-2 py-1 rounded-none bg-gray-700 border-2 border-gray-500 text-xs text-yellow-300 font-pixelated mt-1">R</kbd>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="relative z-10 bg-gray-800 border-t-4 border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 font-pixelated">
          <p>Created with precision and simplicity in mind. BeatBox Studio © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Game;
