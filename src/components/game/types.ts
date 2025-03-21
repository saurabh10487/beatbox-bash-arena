
export interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface Player extends GameObject {
  velocityX: number;
  velocityY: number;
  isOnGround: boolean;
}

export interface Platform extends GameObject {
  height: number;
}

export interface Coin extends GameObject {
  collected: boolean;
}

export interface Enemy extends GameObject {
  velocityX: number;
}

export interface Level {
  playerStart: {
    x: number;
    y: number;
  };
  platforms: Platform[];
  coins: Partial<Coin>[];
  enemies: Partial<Enemy>[];
}

export interface GameState {
  isRunning: boolean;
  score: number;
  level: number;
  lives: number;
  gameOver: boolean;
  victory: boolean;
}

export interface GameCallbacks {
  onScoreChange?: (score: number) => void;
  onLifeLost?: () => void;
  onCoinCollect?: () => void;
  onLevelComplete?: () => void;
  onPlayerJump?: () => void;
  onPlayerLand?: () => void;
}
