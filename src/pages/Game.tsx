import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mic, Music, Play, Volume } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Header from '../components/Header';
import PlatformerGame from '../components/game/PlatformerGame';
import BeatPad from '../components/BeatPad';
import Sequencer from '../components/Sequencer';
import MicrophoneInput from '../components/MicrophoneInput';
import MusicPlayer from '../components/MusicPlayer';
import { sounds, playSound } from '../utils/audioUtils';

const Game = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'game' | 'beatbox' | 'music'>('game');

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
            BeatBox Studio
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-yellow-300 font-pixelated pixelated-text">
            Game & Music Studio
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-pixelated text-sm">
            Play the platformer game, create beats, or listen to music.
          </p>
          
          {/* Navigation tabs */}
          <div className="flex justify-center gap-2 mt-6">
            <Button 
              onClick={() => setActiveTab('game')}
              variant={activeTab === 'game' ? 'default' : 'secondary'}
              className={`font-pixelated text-sm transition-all duration-200 ${
                activeTab === 'game' 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              <Play className="w-4 h-4 mr-2" />
              Platformer Game
            </Button>
            <Button 
              onClick={() => setActiveTab('beatbox')}
              variant={activeTab === 'beatbox' ? 'default' : 'secondary'}
              className={`font-pixelated text-sm transition-all duration-200 ${
                activeTab === 'beatbox' 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              <Volume className="w-4 h-4 mr-2" />
              Beat Studio
            </Button>
            <Button 
              onClick={() => setActiveTab('music')}
              variant={activeTab === 'music' ? 'default' : 'secondary'}
              className={`font-pixelated text-sm transition-all duration-200 ${
                activeTab === 'music' 
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                  : 'bg-gray-800 text-gray-400 hover:text-gray-300'
              }`}
            >
              <Music className="w-4 h-4 mr-2" />
              Music Player
            </Button>
          </div>
        </div>
        
        {/* Game View */}
        {activeTab === 'game' && (
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
        )}
        
        {/* BeatBox Studio View */}
        {activeTab === 'beatbox' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* BeatPads */}
            <div className="bg-gray-800 rounded-none shadow-lg border-4 border-gray-900 p-6 pixelated-border">
              <h2 className="text-xl text-yellow-300 font-pixelated mb-4">BeatBox Pads</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sounds.map(sound => (
                  <BeatPad 
                    key={sound.id} 
                    sound={sound} 
                    onPlay={() => playSound(sound.id)}
                  />
                ))}
              </div>
            </div>
            
            {/* Sequencer */}
            <div className="bg-gray-800 rounded-none shadow-lg border-4 border-gray-900 p-6 pixelated-border">
              <h2 className="text-xl text-yellow-300 font-pixelated mb-4">Beat Sequencer</h2>
              <Sequencer />
            </div>
            
            {/* Microphone Input */}
            <div className="bg-gray-800 rounded-none shadow-lg border-4 border-gray-900 p-6 pixelated-border">
              <h2 className="text-xl text-yellow-300 font-pixelated mb-4">Microphone Input</h2>
              <MicrophoneInput />
            </div>
          </div>
        )}
        
        {/* Music Player View */}
        {activeTab === 'music' && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-gray-800 rounded-none shadow-lg border-4 border-gray-900 p-6 pixelated-border">
              <h2 className="text-xl text-yellow-300 font-pixelated mb-4">Music Player</h2>
              <MusicPlayer />
            </div>
          </div>
        )}
      </main>
      
      <footer className="relative z-10 bg-gray-800 border-t-4 border-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400 font-pixelated">
          <p>Created by Saurabh Saxena with precision and simplicity in mind. BeatBox Studio © {new Date().getFullYear()}</p>
          <div className="mt-2">
            <a 
              href="https://www.instagram.com/mesaurabhsaxena/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-yellow-300 hover:underline mx-2"
            >
              Follow on Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Game;
