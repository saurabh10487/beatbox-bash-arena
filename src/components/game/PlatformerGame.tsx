
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sounds, playSound } from '../../utils/audioUtils';
import GameEngine from './GameEngine';
import { Level, GameState } from './types';
import { initialLevel } from './levels';

const PlatformerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    isRunning: false,
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    victory: false
  });
  const engineRef = useRef<GameEngine | null>(null);
  const { toast } = useToast();

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Create game engine with initial level
    const engine = new GameEngine(canvas, context, initialLevel, {
      onScoreChange: (score) => setGameState(prev => ({ ...prev, score })),
      onLifeLost: () => {
        playSound('rimshot');
        setGameState(prev => ({ 
          ...prev, 
          lives: prev.lives - 1,
          gameOver: prev.lives <= 1
        }));
      },
      onCoinCollect: () => {
        playSound('hihat');
        setGameState(prev => ({ ...prev, score: prev.score + 10 }));
      },
      onLevelComplete: () => {
        playSound('vocal');
        toast({
          title: "Level Complete!",
          description: `Score: ${gameState.score}`,
        });
        setGameState(prev => ({ 
          ...prev, 
          level: prev.level + 1,
          victory: prev.level >= 3 // Victory after 3 levels
        }));
      },
      onPlayerJump: () => {
        playSound('kick');
      },
      onPlayerLand: () => {
        playSound('bass');
      }
    });
    
    engineRef.current = engine;
    
    // Start game
    if (!gameState.gameOver && !gameState.victory) {
      engine.start();
      setGameState(prev => ({ ...prev, isRunning: true }));
    }
    
    // Handle keyboard input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        restartGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef, gameState.gameOver, gameState.victory, gameState.level]);
  
  const restartGame = () => {
    playSound('clap');
    setGameState({
      isRunning: true,
      score: 0,
      level: 1,
      lives: 3,
      gameOver: false,
      victory: false
    });
    
    if (engineRef.current) {
      engineRef.current.resetLevel(initialLevel);
      engineRef.current.start();
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between w-full mb-4">
        <div className="flex gap-4">
          <div className="bg-gray-100 px-3 py-1 rounded-md">
            Score: <span className="font-bold">{gameState.score}</span>
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-md">
            Level: <span className="font-bold">{gameState.level}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-2">Lives:</span>
          {[...Array(gameState.lives)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-red-500 rounded-full mx-0.5"></div>
          ))}
        </div>
      </div>
      
      <div className="relative border-4 border-beatbox-muted rounded-md overflow-hidden bg-gradient-to-b from-blue-100 to-blue-200">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={450}
          className="bg-transparent"
        />
        
        {gameState.gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
            <h2 className="text-3xl font-bold mb-4">Game Over</h2>
            <p className="mb-4">Final Score: {gameState.score}</p>
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-beatbox-primary text-white rounded-md hover:bg-beatbox-primary/80"
            >
              Play Again
            </button>
          </div>
        )}
        
        {gameState.victory && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
            <h2 className="text-3xl font-bold mb-4">Victory!</h2>
            <p className="mb-4">Final Score: {gameState.score}</p>
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-beatbox-primary text-white rounded-md hover:bg-beatbox-primary/80"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformerGame;
