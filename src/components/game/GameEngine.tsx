
import { Level, GameObject, Player, Platform, Coin, Enemy, Boss, GameCallbacks } from './types';

class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private level: Level;
  private player: Player;
  private platforms: Platform[] = [];
  private coins: Coin[] = [];
  private enemies: Enemy[] = [];
  private boss: Boss | null = null;
  private projectiles: GameObject[] = [];
  private animationFrameId?: number;
  private lastFrameTime: number = 0;
  private callbacks: GameCallbacks;
  private keysPressed: { [key: string]: boolean } = {};
  private playerJumping: boolean = false;
  private bossDefeated: boolean = false;

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
    this.bossDefeated = false;
    
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
    
    // Initialize coins - ensuring all required properties are set
    this.coins = level.coins.map(coin => ({
      x: coin.x || 0,
      y: coin.y || 0,
      width: coin.width || 20,
      height: coin.height || 20,
      collected: false,
      color: coin.color || '#f1c40f'
    }));
    
    // Initialize enemies - ensuring all required properties are set
    this.enemies = level.enemies.map(enemy => ({
      x: enemy.x || 0,
      y: enemy.y || 0,
      width: enemy.width || 30,
      height: enemy.height || 30,
      velocityX: enemy.velocityX || 2,
      color: enemy.color || '#e74c3c'
    }));
    
    // Initialize boss if this is a boss level
    if (level.boss && level.isBossLevel) {
      this.boss = {
        x: level.boss.x || 0,
        y: level.boss.y || 0,
        width: level.boss.width || 80,
        height: level.boss.height || 80,
        velocityX: level.boss.velocityX || 2,
        velocityY: level.boss.velocityY || 0,
        health: level.boss.health || 5,
        color: level.boss.color || '#8B5CF6',
        phase: level.boss.phase || 1,
        isActive: false,
        attackCooldown: level.boss.attackCooldown || 2,
        attackTimer: 0
      };
    } else {
      this.boss = null;
    }
    
    // Clear projectiles
    this.projectiles = [];
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
    if (this.level.isBossLevel && this.boss) {
      // For boss level, check if boss is defeated
      if (this.boss.health <= 0 && !this.bossDefeated) {
        this.bossDefeated = true;
        this.callbacks.onBossDefeated?.();
        setTimeout(() => {
          this.callbacks.onLevelComplete?.();
        }, 500);
        this.stop();
        return;
      }
    } else {
      // For regular levels, check if all coins are collected
      const remainingCoins = this.coins.filter(coin => !coin.collected);
      if (remainingCoins.length === 0) {
        this.callbacks.onLevelComplete?.();
        this.stop();
        return;
      }
    }
    
    // Continue game loop
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number): void {
    this.updatePlayer(deltaTime);
    this.updateEnemies(deltaTime);
    
    // Update boss if present
    if (this.boss) {
      this.updateBoss(deltaTime);
    }
    
    // Update projectiles
    this.updateProjectiles(deltaTime);
    
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
  
  private updateBoss(deltaTime: number): void {
    if (!this.boss) return;
    
    // Check if player is close enough to activate boss
    const distanceToPlayer = Math.abs(this.player.x - this.boss.x);
    if (distanceToPlayer < 300 && !this.boss.isActive) {
      this.boss.isActive = true;
    }
    
    if (!this.boss.isActive) return;
    
    // Boss movement based on phase
    switch (this.boss.phase) {
      case 1:
        // Phase 1: Horizontal movement
        this.boss.velocityX = Math.sin(this.lastFrameTime / 1000) * 100;
        break;
      case 2:
        // Phase 2: More erratic movement
        this.boss.velocityX = Math.sin(this.lastFrameTime / 500) * 150;
        this.boss.velocityY = Math.cos(this.lastFrameTime / 750) * 50;
        break;
      case 3:
        // Phase 3: Fast and unpredictable
        this.boss.velocityX = Math.sin(this.lastFrameTime / 300) * 200;
        this.boss.velocityY = Math.cos(this.lastFrameTime / 400) * 100;
        break;
    }
    
    // Update boss position
    this.boss.x += this.boss.velocityX * deltaTime;
    this.boss.y += this.boss.velocityY * deltaTime;
    
    // Contain boss within canvas boundaries
    if (this.boss.x < 700) this.boss.x = 700;
    if (this.boss.x + this.boss.width > this.canvas.width) {
      this.boss.x = this.canvas.width - this.boss.width;
    }
    
    if (this.boss.y < 100) this.boss.y = 100;
    if (this.boss.y + this.boss.height > 300) {
      this.boss.y = 300 - this.boss.height;
    }
    
    // Attack logic
    this.boss.attackTimer -= deltaTime;
    if (this.boss.attackTimer <= 0) {
      this.bossAttack();
      this.boss.attackTimer = this.boss.attackCooldown / this.boss.phase; // Faster attacks in later phases
    }
  }
  
  private bossAttack(): void {
    if (!this.boss) return;
    
    // Different attack patterns based on boss phase
    switch (this.boss.phase) {
      case 1:
        // Single projectile aimed at player
        this.fireProjectileAtPlayer(this.boss, 5);
        break;
      case 2:
        // Three projectiles in a spread pattern
        this.fireProjectileAtPlayer(this.boss, 5, -20);
        this.fireProjectileAtPlayer(this.boss, 5);
        this.fireProjectileAtPlayer(this.boss, 5, 20);
        break;
      case 3:
        // Circle of projectiles
        for (let angle = 0; angle < 360; angle += 45) {
          const radians = angle * Math.PI / 180;
          this.fireProjectile(this.boss, Math.cos(radians) * 200, Math.sin(radians) * 200, 5);
        }
        break;
    }
  }
  
  private fireProjectileAtPlayer(source: GameObject, size: number, angleOffset: number = 0): void {
    // Calculate direction to player
    const dx = this.player.x - source.x;
    const dy = this.player.y - source.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Apply angle offset
    const angleRadians = angleOffset * Math.PI / 180;
    const adjustedDx = dx * Math.cos(angleRadians) - dy * Math.sin(angleRadians);
    const adjustedDy = dx * Math.sin(angleRadians) + dy * Math.cos(angleRadians);
    
    // Normalize and set velocity
    const velocityX = (adjustedDx / distance) * 300;
    const velocityY = (adjustedDy / distance) * 300;
    
    this.fireProjectile(source, velocityX, velocityY, size);
  }
  
  private fireProjectile(source: GameObject, velocityX: number, velocityY: number, size: number): void {
    // Create projectile at the center of the source
    const projectile: GameObject = {
      x: source.x + source.width / 2 - size / 2,
      y: source.y + source.height / 2 - size / 2,
      width: size,
      height: size,
      color: '#D946EF'
    };
    
    // Store velocity with the projectile by typing assertion
    (projectile as any).velocityX = velocityX;
    (projectile as any).velocityY = velocityY;
    
    this.projectiles.push(projectile);
  }
  
  private updateProjectiles(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Update position
      projectile.x += (projectile as any).velocityX * deltaTime;
      projectile.y += (projectile as any).velocityY * deltaTime;
      
      // Remove if out of bounds
      if (
        projectile.x < 0 ||
        projectile.x > this.canvas.width ||
        projectile.y < 0 ||
        projectile.y > this.canvas.height
      ) {
        this.projectiles.splice(i, 1);
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
    
    // Check boss collision
    if (this.boss && this.boss.isActive) {
      // Player can attack boss by jumping on its head
      if (this.checkObjectCollision(this.player, this.boss)) {
        if (this.player.velocityY > 0 && this.player.y + this.player.height < this.boss.y + this.boss.height / 2) {
          // Player hit boss from above
          this.boss.health--;
          this.player.velocityY = -400; // Higher bounce
          
          // Change boss phase based on health
          if (this.boss.health <= 3 && this.boss.phase === 1) {
            this.boss.phase = 2;
            this.boss.color = '#D946EF'; // Change color
          } else if (this.boss.health <= 1 && this.boss.phase === 2) {
            this.boss.phase = 3;
            this.boss.color = '#F97316'; // Change color
          }
          
          this.callbacks.onBossHit?.();
        } else {
          // Player hit by boss
          this.callbacks.onLifeLost?.();
          
          // Reset player position
          this.player.x = 700; // Start at boss arena
          this.player.y = 250;
          this.player.velocityX = 0;
          this.player.velocityY = 0;
        }
      }
    }
    
    // Check projectile collisions with player
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      if (this.checkObjectCollision(this.player, projectile)) {
        // Player hit by projectile
        this.callbacks.onLifeLost?.();
        
        // Remove the projectile
        this.projectiles.splice(i, 1);
        
        // Reset player position (to boss arena if in boss level)
        if (this.boss) {
          this.player.x = 700;
          this.player.y = 250;
        } else {
          this.player.x = this.level.playerStart.x;
          this.player.y = this.level.playerStart.y;
        }
        this.player.velocityX = 0;
        this.player.velocityY = 0;
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
    
    // Draw boss if present and active
    if (this.boss && this.boss.isActive) {
      // Draw boss body
      this.ctx.fillStyle = this.boss.color;
      this.ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
      
      // Draw boss face (angry eyes)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(this.boss.x + 20, this.boss.y + 20, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(this.boss.x + this.boss.width - 20, this.boss.y + 20, 6, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw angry eyebrows
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(this.boss.x + 10, this.boss.y + 10);
      this.ctx.lineTo(this.boss.x + 30, this.boss.y + 20);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(this.boss.x + this.boss.width - 10, this.boss.y + 10);
      this.ctx.lineTo(this.boss.x + this.boss.width - 30, this.boss.y + 20);
      this.ctx.stroke();
      
      // Draw boss mouth (angry)
      this.ctx.beginPath();
      this.ctx.moveTo(this.boss.x + 20, this.boss.y + 60);
      this.ctx.lineTo(this.boss.x + this.boss.width - 20, this.boss.y + 60);
      this.ctx.stroke();
      
      // Draw health bar
      const healthBarWidth = 80;
      const healthBarHeight = 10;
      const healthBarX = this.boss.x + (this.boss.width - healthBarWidth) / 2;
      const healthBarY = this.boss.y - 20;
      
      // Background
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
      
      // Health
      const healthPercentage = this.boss.health / 5; // Assuming max health is 5
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fillRect(
        healthBarX, 
        healthBarY, 
        healthBarWidth * healthPercentage, 
        healthBarHeight
      );
      
      // Border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
      
      // Phase indicator
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        `Phase ${this.boss.phase}`, 
        this.boss.x + this.boss.width / 2, 
        this.boss.y - 25
      );
    }
    
    // Draw projectiles
    for (const projectile of this.projectiles) {
      this.ctx.fillStyle = projectile.color || '#D946EF';
      this.ctx.beginPath();
      this.ctx.arc(
        projectile.x + projectile.width / 2,
        projectile.y + projectile.height / 2,
        projectile.width / 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
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
    
    // Draw boss activation zone indicator when close
    if (this.boss && !this.boss.isActive) {
      const distanceToPlayer = Math.abs(this.player.x - this.boss.x);
      if (distanceToPlayer < 400) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        this.ctx.fillRect(700, 0, 100, this.canvas.height);
        
        // Warning text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
          'BOSS AHEAD', 
          750, 
          100
        );
      }
    }
  }
  
  cleanup(): void {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}

export default GameEngine;
