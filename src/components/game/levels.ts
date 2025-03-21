import { Level } from './types';

export const initialLevel: Level = {
  playerStart: {
    x: 50,
    y: 350
  },
  platforms: [
    // Ground level
    { x: 0, y: 400, width: 800, height: 50, color: '#2ecc71' },
    // Floating platforms
    { x: 200, y: 300, width: 100, height: 20, color: '#2ecc71' },
    { x: 350, y: 250, width: 100, height: 20, color: '#2ecc71' },
    { x: 500, y: 200, width: 100, height: 20, color: '#2ecc71' },
    { x: 650, y: 150, width: 100, height: 20, color: '#2ecc71' },
    // Small platforms
    { x: 100, y: 350, width: 50, height: 20, color: '#2ecc71' },
    { x: 300, y: 320, width: 30, height: 20, color: '#2ecc71' },
  ],
  coins: [
    // Coins on platforms
    { x: 230, y: 270, width: 20, height: 20, color: '#f1c40f' },
    { x: 380, y: 220, width: 20, height: 20, color: '#f1c40f' },
    { x: 530, y: 170, width: 20, height: 20, color: '#f1c40f' },
    { x: 680, y: 120, width: 20, height: 20, color: '#f1c40f' },
    // Coins in air (jumps)
    { x: 150, y: 300, width: 20, height: 20, color: '#f1c40f' },
    { x: 280, y: 250, width: 20, height: 20, color: '#f1c40f' },
    { x: 430, y: 200, width: 20, height: 20, color: '#f1c40f' },
    { x: 600, y: 150, width: 20, height: 20, color: '#f1c40f' },
  ],
  enemies: [
    // Roaming enemies
    { x: 300, y: 370, width: 30, height: 30, velocityX: 2, color: '#e74c3c' },
    { x: 500, y: 370, width: 30, height: 30, velocityX: -1.5, color: '#e74c3c' },
    // Platform enemy
    { x: 220, y: 270, width: 30, height: 30, velocityX: 1, color: '#e74c3c' },
  ]
};

export const level2: Level = {
  playerStart: {
    x: 50,
    y: 350
  },
  platforms: [
    // Ground with gaps
    { x: 0, y: 400, width: 200, height: 50, color: '#3498db' },
    { x: 300, y: 400, width: 200, height: 50, color: '#3498db' },
    { x: 600, y: 400, width: 200, height: 50, color: '#3498db' },
    // Floating platforms
    { x: 150, y: 300, width: 80, height: 20, color: '#3498db' },
    { x: 300, y: 250, width: 80, height: 20, color: '#3498db' },
    { x: 450, y: 300, width: 80, height: 20, color: '#3498db' },
    { x: 600, y: 250, width: 80, height: 20, color: '#3498db' },
    // High platforms
    { x: 200, y: 180, width: 60, height: 20, color: '#3498db' },
    { x: 400, y: 150, width: 60, height: 20, color: '#3498db' },
    { x: 600, y: 120, width: 60, height: 20, color: '#3498db' },
  ],
  coins: [
    // Coins above gaps (challenging jumps)
    { x: 240, y: 350, width: 20, height: 20, color: '#f39c12' },
    { x: 540, y: 350, width: 20, height: 20, color: '#f39c12' },
    // Coins on platforms
    { x: 170, y: 270, width: 20, height: 20, color: '#f39c12' },
    { x: 320, y: 220, width: 20, height: 20, color: '#f39c12' },
    { x: 470, y: 270, width: 20, height: 20, color: '#f39c12' },
    { x: 620, y: 220, width: 20, height: 20, color: '#f39c12' },
    // High coins
    { x: 210, y: 150, width: 20, height: 20, color: '#f39c12' },
    { x: 410, y: 120, width: 20, height: 20, color: '#f39c12' },
    { x: 610, y: 90, width: 20, height: 20, color: '#f39c12' },
  ],
  enemies: [
    // Ground enemies
    { x: 50, y: 370, width: 30, height: 30, velocityX: 1.5, color: '#e74c3c' },
    { x: 350, y: 370, width: 30, height: 30, velocityX: 2, color: '#e74c3c' },
    { x: 650, y: 370, width: 30, height: 30, velocityX: 1.5, color: '#e74c3c' },
    // Platform enemies
    { x: 160, y: 270, width: 30, height: 30, velocityX: 1, color: '#c0392b' },
    { x: 460, y: 270, width: 30, height: 30, velocityX: 1, color: '#c0392b' },
  ]
};

export const level3: Level = {
  playerStart: {
    x: 50,
    y: 350
  },
  platforms: [
    // Starting platform
    { x: 0, y: 400, width: 150, height: 50, color: '#9b59b6' },
    // Stepping stones
    { x: 200, y: 400, width: 60, height: 20, color: '#9b59b6' },
    { x: 300, y: 350, width: 60, height: 20, color: '#9b59b6' },
    { x: 400, y: 300, width: 60, height: 20, color: '#9b59b6' },
    { x: 500, y: 250, width: 60, height: 20, color: '#9b59b6' },
    { x: 600, y: 200, width: 60, height: 20, color: '#9b59b6' },
    // Boss arena
    { x: 700, y: 300, width: 700, height: 20, color: '#9b59b6' },
    // Alternative path
    { x: 150, y: 300, width: 40, height: 20, color: '#9b59b6' },
    { x: 250, y: 230, width: 40, height: 20, color: '#9b59b6' },
    { x: 350, y: 180, width: 40, height: 20, color: '#9b59b6' },
    { x: 450, y: 130, width: 40, height: 20, color: '#9b59b6' },
    { x: 580, y: 100, width: 40, height: 20, color: '#9b59b6' },
  ],
  coins: [
    // Main path coins
    { x: 210, y: 370, width: 20, height: 20, color: '#f1c40f' },
    { x: 310, y: 320, width: 20, height: 20, color: '#f1c40f' },
    { x: 410, y: 270, width: 20, height: 20, color: '#f1c40f' },
    { x: 510, y: 220, width: 20, height: 20, color: '#f1c40f' },
    { x: 610, y: 170, width: 20, height: 20, color: '#f1c40f' },
    // Alternative path (bonus coins)
    { x: 160, y: 270, width: 20, height: 20, color: '#f1c40f' },
    { x: 260, y: 200, width: 20, height: 20, color: '#f1c40f' },
    { x: 360, y: 150, width: 20, height: 20, color: '#f1c40f' },
    { x: 460, y: 100, width: 20, height: 20, color: '#f1c40f' },
    { x: 590, y: 70, width: 20, height: 20, color: '#f1c40f' },
  ],
  enemies: [
    // Guarding enemies
    { x: 220, y: 370, width: 30, height: 30, velocityX: 0.5, color: '#e74c3c' },
    { x: 420, y: 270, width: 30, height: 30, velocityX: 0.7, color: '#e74c3c' },
    { x: 620, y: 170, width: 30, height: 30, velocityX: 1, color: '#e74c3c' },
    // More challenging enemies
    { x: 100, y: 370, width: 40, height: 40, velocityX: 1.2, color: '#c0392b' },
    { x: 300, y: 320, width: 35, height: 35, velocityX: 1.5, color: '#c0392b' },
  ],
  boss: {
    x: 1050,
    y: 230,
    width: 80,
    height: 80,
    velocityX: 0,
    velocityY: 0,
    health: 5,
    color: '#8B5CF6',
    phase: 1,
    isActive: false,
    attackCooldown: 2,
    attackTimer: 0
  },
  isBossLevel: true
};

// We export the initialLevel for now
// The game engine will use level2 and level3 based on player progression
