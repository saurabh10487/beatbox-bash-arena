
import { Level, GameObject, Player, Platform, Coin, Enemy, GameCallbacks } from './types';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: Level;
  private player: Player;
  private platforms: Platform[] = [];
  private coins: Coin[] = [];
  private enemies: Enemy[] = [];
  private animationFrameId?: number;
  private lastFrameTime: number = 0;
  private callbacks: GameCallbacks;
  private keysPressed: { [key: string]: boolean } = {};
  private playerJumping: boolean = false;

  constructor(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    level: Level,
    callbacks: GameCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.level = level;
    this.callbacks = callbacks;
    
    // Initialize player
    this.player = {
      x: level.playerStart.x,
      y: level.playerStart.y,
      width: 30,
      height: 50,
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      color: '#3498db'
    };
    
    // Initialize level objects
    this.resetLevel(level);
    
    // Set up keyboard listeners
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }
  
  resetLevel(level: Level): void {
    this.level = level;
    
    // Reset player position
    this.player.x = level.playerStart.x;
    this.player.y = level.playerStart.y;
    this.player.velocityX = 0;
    this.player.velocityY = 0;
    
    // Initialize platforms
    this.platforms = level.platforms.map(platform => ({
      ...platform,
      color: platform.color || '#2ecc71'
    }));
    
    // Initialize coins
    this.coins = level.coins.map(coin => ({
      ...coin,
      width: coin.width || 20,
      height: coin.height || 20,
      collected: false,
      color: coin.color || '#f1c40f'
    }));
    
    // Initialize enemies
    this.enemies = level.enemies.map(enemy => ({
      ...enemy,
      width: enemy.width || 30,
      height: enemy.height || 30,
      velocityX: enemy.velocityX || 2,
      color: enemy.color || '#e74c3c'
    }));
  }
  
  start(): void {
    if (!this.animationFrameId) {
      this.lastFrameTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  }
  
  stop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }
  
  private handleKeyDown = (e: KeyboardEvent): void => {
    this.keysPressed[e.key] = true;
  };
  
  private handleKeyUp = (e: KeyboardEvent): void => {
    this.keysPressed[e.key] = false;
  };
  
  private gameLoop = (timestamp: number): void => {
    // Calculate delta time (time since last frame)
    const deltaTime = (timestamp - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = timestamp;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update game state
    this.update(deltaTime);
    
    // Render game objects
    this.render();
    
    // Check for level completion
    const remainingCoins = this.coins.filter(coin => !coin.collected);
    if (remainingCoins.length === 0) {
      this.callbacks.onLevelComplete?.();
      this.stop();
      return;
    }
    
    // Continue game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number): void {
    this.updatePlayer(deltaTime);
    this.updateEnemies(deltaTime);
    this.checkCollisions();
  }
  
  private updatePlayer(deltaTime: number): void {
    // Handle keyboard input
    if (this.keysPressed['ArrowLeft']) {
      this.player.velocityX = -200; // Move left
    } else if (this.keysPressed['ArrowRight']) {
      this.player.velocityX = 200; // Move right
    } else {
      // Apply friction
      this.player.velocityX *= 0.8;
      if (Math.abs(this.player.velocityX) < 0.1) this.player.velocityX = 0;
    }
    
    // Jump
    if ((this.keysPressed['ArrowUp'] || this.keysPressed[' ']) && this.player.isOnGround) {
      this.player.velocityY = -500; // Jump velocity
      this.player.isOnGround = false;
      
      if (!this.playerJumping) {
        this.callbacks.onPlayerJump?.();
        this.playerJumping = true;
      }
    }
    
    // Apply gravity
    this.player.velocityY += 980 * deltaTime; // Gravity acceleration
    
    // Update position
    this.player.x += this.player.velocityX * deltaTime;
    this.player.y += this.player.velocityY * deltaTime;
    
    // Check boundaries (prevent going out of canvas)
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x + this.player.width > this.canvas.width) {
      this.player.x = this.canvas.width - this.player.width;
    }
    
    // Check if player fell out of the world
    if (this.player.y > this.canvas.height) {
      this.callbacks.onLifeLost?.();
      // Reset player position
      this.player.x = this.level.playerStart.x;
      this.player.y = this.level.playerStart.y;
      this.player.velocityX = 0;
      this.player.velocityY = 0;
    }
    
    // Reset ground flag
    const wasOnGround = this.player.isOnGround;
    this.player.isOnGround = false;
    
    // Check platform collisions
    for (const platform of this.platforms) {
      if (this.checkPlatformCollision(this.player, platform)) {
        // Player is on a platform
        this.player.isOnGround = true;
        this.player.velocityY = 0;
        this.player.y = platform.y - this.player.height;
        
        if (!wasOnGround && this.playerJumping) {
          this.callbacks.onPlayerLand?.();
          this.playerJumping = false;
        }
      }
    }
  }
  
  private updateEnemies(deltaTime: number): void {
    for (const enemy of this.enemies) {
      // Update enemy position
      enemy.x += enemy.velocityX * deltaTime;
      
      // Check if enemy hits platform boundaries and reverse direction
      const platformIndex = this.platforms.findIndex(platform => 
        enemy.y + enemy.height >= platform.y && 
        enemy.y + enemy.height <= platform.y + 10 && 
        enemy.x >= platform.x - enemy.width && 
        enemy.x <= platform.x + platform.width
      );
      
      if (platformIndex !== -1) {
        const platform = this.platforms[platformIndex];
        
        // Check if enemy is at platform edge
        if (enemy.x <= platform.x || enemy.x + enemy.width >= platform.x + platform.width) {
          enemy.velocityX *= -1; // Reverse direction
        }
      }
    }
  }
  
  private checkCollisions(): void {
    // Check coin collisions
    for (const coin of this.coins) {
      if (!coin.collected && this.checkObjectCollision(this.player, coin)) {
        coin.collected = true;
        this.callbacks.onCoinCollect?.();
      }
    }
    
    // Check enemy collisions
    for (const enemy of this.enemies) {
      if (this.checkObjectCollision(this.player, enemy)) {
        // Check if player is falling onto enemy (Mario-style jump on enemy)
        if (this.player.velocityY > 0 && this.player.y + this.player.height < enemy.y + enemy.height / 2) {
          // Remove enemy
          const enemyIndex = this.enemies.indexOf(enemy);
          if (enemyIndex !== -1) {
            this.enemies.splice(enemyIndex, 1);
          }
          
          // Bounce player up
          this.player.velocityY = -300;
          this.callbacks.onCoinCollect?.(); // Award points
        } else {
          // Player hit by enemy
          this.callbacks.onLifeLost?.();
          
          // Reset player position
          this.player.x = this.level.playerStart.x;
          this.player.y = this.level.playerStart.y;
          this.player.velocityX = 0;
          this.player.velocityY = 0;
        }
      }
    }
  }
  
  private checkObjectCollision(obj1: GameObject, obj2: GameObject): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }
  
  private checkPlatformCollision(player: Player, platform: Platform): boolean {
    // Check if player is above the platform and falling
    const playerBottom = player.y + player.height;
    const platformTop = platform.y;
    
    if (
      player.velocityY >= 0 && // Player is falling or on ground
      playerBottom >= platformTop && 
      playerBottom <= platformTop + 20 && // Allow some leeway for collision
      player.x + player.width > platform.x && 
      player.x < platform.x + platform.width
    ) {
      return true;
    }
    
    return false;
  }
  
  private render(): void {
    // Draw background
    this.ctx.fillStyle = '#87CEEB'; // Sky blue
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw platforms
    for (const platform of this.platforms) {
      this.ctx.fillStyle = platform.color;
      this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Draw platform top edge
      this.ctx.fillStyle = '#27ae60';
      this.ctx.fillRect(platform.x, platform.y, platform.width, 5);
    }
    
    // Draw coins
    for (const coin of this.coins) {
      if (!coin.collected) {
        this.ctx.fillStyle = coin.color;
        this.ctx.beginPath();
        this.ctx.arc(
          coin.x + coin.width / 2, 
          coin.y + coin.height / 2, 
          coin.width / 2, 
          0, 
          Math.PI * 2
        );
        this.ctx.fill();
        
        // Draw inner circle for coin detail
        this.ctx.fillStyle = '#f39c12';
        this.ctx.beginPath();
        this.ctx.arc(
          coin.x + coin.width / 2, 
          coin.y + coin.height / 2, 
          coin.width / 4, 
          0, 
          Math.PI * 2
        );
        this.ctx.fill();
      }
    }
    
    // Draw enemies
    for (const enemy of this.enemies) {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Draw enemy face
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(enemy.x + 10, enemy.y + 10, 3, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(enemy.x + enemy.width - 10, enemy.y + 10, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw enemy mouth
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(enemy.x + 10, enemy.y + 25);
      this.ctx.lineTo(enemy.x + enemy.width - 10, enemy.y + 25);
      this.ctx.stroke();
    }
    
    // Draw player character
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
    
    // Draw player face
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x + 10, this.player.y + 15, 3, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.beginPath();
    this.ctx.arc(this.player.x + this.player.width - 10, this.player.y + 15, 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Draw player mouth (smile)
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x + this.player.width / 2, this.player.y + 25, 5, 0, Math.PI);
    this.ctx.stroke();
  }
  
  cleanup(): void {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}

export default GameEngine;
