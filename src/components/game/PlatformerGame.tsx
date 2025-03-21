
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { sounds, playSound } from '../../utils/audioUtils';
import GameEngine from './GameEngine';
import { Level, GameState } from './types';
import { initialLevel, level2, level3 } from './levels';

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
    
    // Determine current level based on gameState.level
    let currentLevel: Level;
    switch (gameState.level) {
      case 2:
        currentLevel = level2;
        break;
      case 3:
        currentLevel = level3;
        break;
      default:
        currentLevel = initialLevel;
    }
    
    // Create game engine with the appropriate level
    const engine = new GameEngine(canvas, context, currentLevel, {
      onScoreChange: (score) => setGameState(prev => ({ ...prev, score })),
      onLifeLost: () => {
        playSound('rimshot');
        setGameState(prev => { 
          const newLives = prev.lives - 1;
          return { 
            ...prev, 
            lives: newLives,
            gameOver: newLives <= 0  // Only game over when lives reach 0
          };
        });
      },
      onCoinCollect: () => {
        playSound('hihat');
        setGameState(prev => ({ ...prev, score: prev.score + 10 }));
      },
      onLevelComplete: () => {
        playSound('vocal');
        
        // Final level victory
        if (gameState.level >= 3) {
          toast({
            title: "Victory!",
            description: `You beat the boss! Final Score: ${gameState.score}`,
          });
          setGameState(prev => ({ 
            ...prev,
            victory: true,
            isRunning: false  // Stop the game
          }));
        } else {
          toast({
            title: "Level Complete!",
            description: `Moving to level ${gameState.level + 1}. Score: ${gameState.score}`,
          });
          // Move to next level without restarting the game
          setGameState(prev => ({ 
            ...prev, 
            level: prev.level + 1
          }));
        }
      },
      onPlayerJump: () => {
        playSound('kick');
      },
      onPlayerLand: () => {
        playSound('bass');
      },
      onBossHit: () => {
        playSound('snare');
        setGameState(prev => ({ ...prev, score: prev.score + 50 }));
        toast({
          title: "Direct Hit!",
          description: "You damaged the boss!",
        });
      },
      onBossDefeated: () => {
        playSound('scratch');
        setGameState(prev => ({ 
          ...prev, 
          score: prev.score + 200,
          victory: true,
          isRunning: false
        }));
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
      engine.cleanup();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canvasRef, gameState.gameOver, gameState.victory, gameState.level, toast]);
  
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
            <p className="mb-4">You defeated the Boss!</p>
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
      
      <div className="mt-6 text-sm text-center text-gray-600">
        {gameState.level === 3 && (
          <p className="mb-2 font-bold text-red-500">
            Boss Level: Jump on the boss's head to damage it! Watch out for projectiles!
          </p>
        )}
      </div>
    </div>
  );
};

export default PlatformerGame;
