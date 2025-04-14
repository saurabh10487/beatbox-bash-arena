
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
  spriteState?: 'idle' | 'walk' | 'jump' | 'fall';
}

export interface Platform extends GameObject {
  height: number;
}

export interface Coin extends GameObject {
  collected: boolean;
  type?: number; // 0 = gold, 1 = silver, 2 = bronze
}

export interface Enemy extends GameObject {
  velocityX: number;
  spriteState?: 'idle' | 'walk' | 'attack';
}

export interface Boss extends GameObject {
  health: number;
  velocityX: number;
  velocityY: number;
  attackCooldown: number;
  attackTimer: number;
  phase: number;
  isActive: boolean;
  spriteState?: 'idle' | 'active' | 'angry' | 'enraged';
}

export interface Level {
  playerStart: {
    x: number;
    y: number;
  };
  platforms: Platform[];
  coins: Partial<Coin>[];
  enemies: Partial<Enemy>[];
  boss?: Partial<Boss>;
  isBossLevel?: boolean;
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
  onBossHit?: () => void;
  onBossDefeated?: () => void;
}
