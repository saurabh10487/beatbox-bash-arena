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
    
    // Apply pixel art rendering style
    context.imageSmoothingEnabled = false; // Crucial for pixel art look
    
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
    
    console.log("Loading level:", gameState.level, "currentLevel:", currentLevel);
    
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
        
        // Check if this is the final level
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
          // Move to next level
          const nextLevel = gameState.level + 1;
          console.log("Moving to level:", nextLevel);
          
          toast({
            title: "Level Complete!",
            description: `Moving to level ${nextLevel}. Score: ${gameState.score}`,
          });
          
          // Important: Reset the engine with the new level before updating state
          if (engineRef.current) {
            let newLevelData: Level;
            if (nextLevel === 2) {
              newLevelData = level2;
            } else {
              newLevelData = level3;
            }
            
            engineRef.current.resetLevel(newLevelData);
            
            // Set the game state with next level but DO NOT set gameOver flag
            setGameState(prev => ({ 
              ...prev, 
              level: nextLevel,
              gameOver: false,  // Ensure gameOver is false
              isRunning: true   // Keep the game running
            }));
          }
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
    
    // Start game if it's not over or won
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
          <div className="bg-gray-800 px-3 py-1 rounded-md text-yellow-300 font-pixelated border-2 border-yellow-500">
            Score: <span className="font-bold">{gameState.score}</span>
          </div>
          <div className="bg-gray-800 px-3 py-1 rounded-md text-yellow-300 font-pixelated border-2 border-yellow-500">
            Level: <span className="font-bold">{gameState.level}</span>
          </div>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-yellow-300 font-pixelated">Lives:</span>
          {[...Array(gameState.lives)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-red-500 rounded-none mx-0.5 pixelated-heart"></div>
          ))}
        </div>
      </div>
      
      <div className="relative border-4 border-gray-900 rounded-none overflow-hidden bg-gradient-to-b from-blue-900 to-black pixelated-border">
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={450}
          className="bg-transparent pixelated"
        />
        
        {gameState.gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <h2 className="text-3xl font-bold mb-4 text-red-500 font-pixelated pixelated-text">Game Over</h2>
            <p className="mb-4 font-pixelated">Final Score: {gameState.score}</p>
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-yellow-500 text-black rounded-none hover:bg-yellow-400 font-pixelated pixelated-button"
            >
              Play Again
            </button>
          </div>
        )}
        
        {gameState.victory && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
            <h2 className="text-3xl font-bold mb-4 text-green-400 font-pixelated pixelated-text">Victory!</h2>
            <p className="mb-4 font-pixelated">You defeated the Boss!</p>
            <p className="mb-4 font-pixelated">Final Score: {gameState.score}</p>
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-yellow-500 text-black rounded-none hover:bg-yellow-400 font-pixelated pixelated-button"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-center text-gray-200">
        {gameState.level === 3 && (
          <p className="mb-2 font-bold text-red-500 font-pixelated">
            Boss Level: Jump on the boss's head to damage it! Watch out for projectiles!
          </p>
        )}
      </div>
    </div>
  );
};

export default PlatformerGame;
