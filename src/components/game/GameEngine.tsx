
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
  private coinSprites: number[] = [0, 1, 2, 3]; // For coin animation frames
  private coinFrame: number = 0;
  private coinFrameCounter: number = 0;
  private playerDirection: 'left' | 'right' = 'right';

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
      width: 32, // Pixel-art friendly size
      height: 48, // Pixel-art friendly size
      velocityX: 0,
      velocityY: 0,
      isOnGround: false,
      color: '#3498db',
      spriteState: 'idle' // For different animations
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
      color: platform.color || '#2e8b57' // More retro green
    }));
    
    // Initialize coins - ensuring all required properties are set
    this.coins = level.coins.map(coin => ({
      x: coin.x || 0,
      y: coin.y || 0,
      width: 24, // Pixel-art friendly size
      height: 24, // Pixel-art friendly size
      collected: false,
      color: coin.color || '#FFD700', // Gold color
      type: Math.floor(Math.random() * 3) // Random coin type (0-2)
    }));
    
    // Initialize enemies - ensuring all required properties are set
    this.enemies = level.enemies.map(enemy => ({
      x: enemy.x || 0,
      y: enemy.y || 0,
      width: 32, // Pixel-art friendly size
      height: 32, // Pixel-art friendly size
      velocityX: enemy.velocityX || 2,
      color: enemy.color || '#e74c3c',
      spriteState: 'walk' // For animation
    }));
    
    // Initialize boss if this is a boss level
    if (level.boss && level.isBossLevel) {
      this.boss = {
        x: level.boss.x || 0,
        y: level.boss.y || 0,
        width: 80, // Pixel-art friendly size
        height: 80, // Pixel-art friendly size
        velocityX: level.boss.velocityX || 2,
        velocityY: level.boss.velocityY || 0,
        health: level.boss.health || 5,
        color: level.boss.color || '#8B5CF6',
        phase: level.boss.phase || 1,
        isActive: false,
        attackCooldown: level.boss.attackCooldown || 2,
        attackTimer: 0,
        spriteState: 'idle' // For animation
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
    
    // Update coin animation
    this.coinFrameCounter += deltaTime;
    if (this.coinFrameCounter > 0.15) { // Change animation frame every 150ms
      this.coinFrame = (this.coinFrame + 1) % this.coinSprites.length;
      this.coinFrameCounter = 0;
    }
    
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
      this.playerDirection = 'left';
      this.player.spriteState = 'walk';
    } else if (this.keysPressed['ArrowRight']) {
      this.player.velocityX = 200; // Move right
      this.playerDirection = 'right';
      this.player.spriteState = 'walk';
    } else {
      // Apply friction
      this.player.velocityX *= 0.8;
      if (Math.abs(this.player.velocityX) < 0.1) {
        this.player.velocityX = 0;
        this.player.spriteState = 'idle';
      }
    }
    
    // Jump
    if ((this.keysPressed['ArrowUp'] || this.keysPressed[' ']) && this.player.isOnGround) {
      this.player.velocityY = -500; // Jump velocity
      this.player.isOnGround = false;
      this.player.spriteState = 'jump';
      
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
          this.player.spriteState = 'idle';
        }
      }
    }
    
    // Set falling animation if not on ground and moving down
    if (!this.player.isOnGround && this.player.velocityY > 0) {
      this.player.spriteState = 'fall';
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
      this.boss.spriteState = 'active';
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
        this.boss.spriteState = 'angry';
        break;
      case 3:
        // Phase 3: Fast and unpredictable
        this.boss.velocityX = Math.sin(this.lastFrameTime / 300) * 200;
        this.boss.velocityY = Math.cos(this.lastFrameTime / 400) * 100;
        this.boss.spriteState = 'enraged';
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
        this.fireProjectileAtPlayer(this.boss, 8);
        break;
      case 2:
        // Three projectiles in a spread pattern
        this.fireProjectileAtPlayer(this.boss, 8, -20);
        this.fireProjectileAtPlayer(this.boss, 8);
        this.fireProjectileAtPlayer(this.boss, 8, 20);
        break;
      case 3:
        // Circle of projectiles
        for (let angle = 0; angle < 360; angle += 45) {
          const radians = angle * Math.PI / 180;
          this.fireProjectile(this.boss, Math.cos(radians) * 200, Math.sin(radians) * 200, 8);
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
    // Draw retro-style sky background with scanlines
    this.ctx.fillStyle = '#000033'; // Dark blue retro sky
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw scanlines for retro CRT effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < this.canvas.height; y += 4) {
      this.ctx.fillRect(0, y, this.canvas.width, 2);
    }
    
    // Draw platforms as retro pixel blocks
    for (const platform of this.platforms) {
      // Draw platform body
      this.ctx.fillStyle = platform.color;
      this.ctx.fillRect(
        Math.floor(platform.x), 
        Math.floor(platform.y), 
        platform.width, 
        platform.height
      );
      
      // Draw pixel-style top edge
      this.ctx.fillStyle = '#32CD32'; // Lighter green
      this.ctx.fillRect(
        Math.floor(platform.x), 
        Math.floor(platform.y), 
        platform.width, 
        4
      );
      
      // Draw pixel detail blocks on platforms
      this.ctx.fillStyle = '#228B22'; // Darker green
      for (let i = 4; i < platform.width; i += 8) {
        this.ctx.fillRect(
          Math.floor(platform.x + i), 
          Math.floor(platform.y + 4), 
          4, 
          4
        );
      }
    }
    
    // Draw coins with animation
    for (const coin of this.coins) {
      if (!coin.collected) {
        // Determine coin type/color
        let coinColor = '#FFD700'; // Default gold
        if (coin.type === 1) coinColor = '#C0C0C0'; // Silver
        if (coin.type === 2) coinColor = '#CD7F32'; // Bronze
        
        // Animate coin (bobbing and rotating effect)
        const bobAmount = Math.sin(this.lastFrameTime / 200) * 3;
        const frameWidth = coin.width * 0.8;
        
        // Draw coin based on current animation frame
        this.ctx.fillStyle = coinColor;
        
        // Different coin shapes based on animation frame
        switch (this.coinFrame) {
          case 0:
            // Full coin
            this.ctx.beginPath();
            this.ctx.arc(
              Math.floor(coin.x + coin.width / 2), 
              Math.floor(coin.y + coin.height / 2 + bobAmount), 
              frameWidth / 2, 
              0, 
              Math.PI * 2
            );
            this.ctx.fill();
            break;
          case 1:
            // Slightly squished horizontally
            this.ctx.beginPath();
            this.ctx.ellipse(
              Math.floor(coin.x + coin.width / 2), 
              Math.floor(coin.y + coin.height / 2 + bobAmount), 
              frameWidth / 2 * 0.7,
              frameWidth / 2,
              0,
              0,
              Math.PI * 2
            );
            this.ctx.fill();
            break;
          case 2:
            // Very thin (rotating sideways)
            this.ctx.fillRect(
              Math.floor(coin.x + coin.width / 2 - 1), 
              Math.floor(coin.y + coin.height / 4 + bobAmount), 
              2, 
              coin.height / 2
            );
            break;
          case 3:
            // Back to slightly squished
            this.ctx.beginPath();
            this.ctx.ellipse(
              Math.floor(coin.x + coin.width / 2), 
              Math.floor(coin.y + coin.height / 2 + bobAmount), 
              frameWidth / 2 * 0.7,
              frameWidth / 2,
              0,
              0,
              Math.PI * 2
            );
            this.ctx.fill();
            break;
        }
        
        // Draw inner highlight for coin
        const highlightColor = coin.type === 1 ? '#FFFFFF' : (coin.type === 2 ? '#FFAA00' : '#FFEF00');
        this.ctx.fillStyle = highlightColor;
        if (this.coinFrame === 0 || this.coinFrame === 3) {
          this.ctx.beginPath();
          this.ctx.arc(
            Math.floor(coin.x + coin.width / 2 - 2), 
            Math.floor(coin.y + coin.height / 2 - 2 + bobAmount), 
            frameWidth / 6, 
            0, 
            Math.PI * 2
          );
          this.ctx.fill();
        }
      }
    }
    
    // Draw enemies with pixel art style
    for (const enemy of this.enemies) {
      // Main body
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(
        Math.floor(enemy.x), 
        Math.floor(enemy.y), 
        enemy.width, 
        enemy.height
      );
      
      // Draw pixel-art eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(
        Math.floor(enemy.x + 8), 
        Math.floor(enemy.y + 8), 
        4, 
        4
      );
      this.ctx.fillRect(
        Math.floor(enemy.x + enemy.width - 12), 
        Math.floor(enemy.y + 8), 
        4, 
        4
      );
      
      // Draw pixel-art pupils (follow player)
      this.ctx.fillStyle = '#000000';
      const eyeOffset = this.player.x < enemy.x ? -1 : 1;
      this.ctx.fillRect(
        Math.floor(enemy.x + 9 + eyeOffset), 
        Math.floor(enemy.y + 9), 
        2, 
        2
      );
      this.ctx.fillRect(
        Math.floor(enemy.x + enemy.width - 11 + eyeOffset), 
        Math.floor(enemy.y + 9), 
        2, 
        2
      );
      
      // Draw pixel-art mouth
      this.ctx.fillStyle = '#000000';
      for (let i = 10; i < enemy.width - 10; i += 4) {
        this.ctx.fillRect(
          Math.floor(enemy.x + i), 
          Math.floor(enemy.y + 20), 
          4, 
          2
        );
      }
      
      // Draw pixel-art spikes on top
      this.ctx.fillStyle = '#D63031';
      for (let i = 4; i < enemy.width - 4; i += 6) {
        this.ctx.beginPath();
        this.ctx.moveTo(Math.floor(enemy.x + i), Math.floor(enemy.y));
        this.ctx.lineTo(Math.floor(enemy.x + i + 3), Math.floor(enemy.y - 4));
        this.ctx.lineTo(Math.floor(enemy.x + i + 6), Math.floor(enemy.y));
        this.ctx.fill();
      }
    }
    
    // Draw boss if present and active
    if (this.boss && this.boss.isActive) {
      // Boss body with pixelated style
      this.ctx.fillStyle = this.boss.color;
      this.ctx.fillRect(
        Math.floor(this.boss.x), 
        Math.floor(this.boss.y), 
        this.boss.width, 
        this.boss.height
      );
      
      // Draw boss face with pixel art
      
      // Eyes
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(
        Math.floor(this.boss.x + 16), 
        Math.floor(this.boss.y + 16), 
        12, 
        12
      );
      this.ctx.fillRect(
        Math.floor(this.boss.x + this.boss.width - 28), 
        Math.floor(this.boss.y + 16), 
        12, 
        12
      );
      
      // Angry eyebrows - animated based on phase
      this.ctx.fillStyle = '#000000';
      const eyebrowOffset = Math.sin(this.lastFrameTime / 200) * 2;
      
      // Left eyebrow
      this.ctx.beginPath();
      this.ctx.moveTo(Math.floor(this.boss.x + 10), Math.floor(this.boss.y + 12 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + 34), Math.floor(this.boss.y + 8 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + 34), Math.floor(this.boss.y + 12 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + 10), Math.floor(this.boss.y + 16 + eyebrowOffset));
      this.ctx.fill();
      
      // Right eyebrow
      this.ctx.beginPath();
      this.ctx.moveTo(Math.floor(this.boss.x + this.boss.width - 10), Math.floor(this.boss.y + 12 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + this.boss.width - 34), Math.floor(this.boss.y + 8 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + this.boss.width - 34), Math.floor(this.boss.y + 12 + eyebrowOffset));
      this.ctx.lineTo(Math.floor(this.boss.x + this.boss.width - 10), Math.floor(this.boss.y + 16 + eyebrowOffset));
      this.ctx.fill();
      
      // Pupils - follow player
      this.ctx.fillStyle = '#FF0000'; // Red eyes
      const bossEyeOffset = this.player.x < this.boss.x ? -2 : 2;
      this.ctx.fillRect(
        Math.floor(this.boss.x + 20 + bossEyeOffset), 
        Math.floor(this.boss.y + 20 + (this.player.y < this.boss.y ? -2 : 2)), 
        4, 
        4
      );
      this.ctx.fillRect(
        Math.floor(this.boss.x + this.boss.width - 24 + bossEyeOffset), 
        Math.floor(this.boss.y + 20 + (this.player.y < this.boss.y ? -2 : 2)), 
        4, 
        4
      );
      
      // Mouth - changes based on boss phase
      if (this.boss.phase === 1) {
        // Angry line
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
          Math.floor(this.boss.x + 20), 
          Math.floor(this.boss.y + 50), 
          this.boss.width - 40, 
          4
        );
      } else if (this.boss.phase === 2) {
        // Jagged teeth mouth
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
          Math.floor(this.boss.x + 20), 
          Math.floor(this.boss.y + 50), 
          this.boss.width - 40, 
          8
        );
        
        // Teeth
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 24; i < this.boss.width - 24; i += 8) {
          this.ctx.fillRect(
            Math.floor(this.boss.x + i), 
            Math.floor(this.boss.y + 50), 
            4, 
            4
          );
        }
      } else {
        // Phase 3: Open mouth with teeth
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(
          Math.floor(this.boss.x + 20), 
          Math.floor(this.boss.y + 50), 
          this.boss.width - 40, 
          16
        );
        
        // Teeth
        this.ctx.fillStyle = '#FFFFFF';
        for (let i = 20; i < this.boss.width - 20; i += 8) {
          // Top teeth
          this.ctx.fillRect(
            Math.floor(this.boss.x + i), 
            Math.floor(this.boss.y + 50), 
            6, 
            4
          );
          // Bottom teeth
          this.ctx.fillRect(
            Math.floor(this.boss.x + i + 4), 
            Math.floor(this.boss.y + 62), 
            6, 
            4
          );
        }
      }
      
      // Phase indicators - pixelated gems on forehead
      for (let i = 0; i < this.boss.phase; i++) {
        let gemColor;
        switch (i) {
          case 0: gemColor = '#FF0000'; break; // Red
          case 1: gemColor = '#D946EF'; break; // Purple
          case 2: gemColor = '#F97316'; break; // Orange
        }
        
        // Draw diamond shaped gem
        this.ctx.fillStyle = gemColor;
        this.ctx.beginPath();
        const gemX = this.boss.x + 30 + i * 15;
        const gemY = this.boss.y - 6;
        this.ctx.moveTo(Math.floor(gemX), Math.floor(gemY));
        this.ctx.lineTo(Math.floor(gemX + 5), Math.floor(gemY - 5));
        this.ctx.lineTo(Math.floor(gemX + 10), Math.floor(gemY));
        this.ctx.lineTo(Math.floor(gemX + 5), Math.floor(gemY + 5));
        this.ctx.fill();
        
        // Gem highlight
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(Math.floor(gemX + 3), Math.floor(gemY - 2), 2, 2);
      }
      
      // Health bar with pixelated styling
      const healthBarWidth = 80;
      const healthBarHeight = 10;
      const healthBarX = this.boss.x + (this.boss.width - healthBarWidth) / 2;
      const healthBarY = this.boss.y - 20;
      
      // Background
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.fillRect(Math.floor(healthBarX), Math.floor(healthBarY), healthBarWidth, healthBarHeight);
      
      // Health segments (pixelated style)
      const healthPerSegment = healthBarWidth / 5; // 5 segments for 5 health
      this.ctx.fillStyle = '#2ecc71';
      for (let i = 0; i < this.boss.health; i++) {
        this.ctx.fillRect(
          Math.floor(healthBarX + i * healthPerSegment), 
          Math.floor(healthBarY), 
          Math.floor(healthPerSegment - 1), // Gap between segments 
          healthBarHeight
        );
      }
      
      // Border
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(Math.floor(healthBarX), Math.floor(healthBarY), healthBarWidth, healthBarHeight);
      
      // Phase text - pixelated style
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '8px Arial';
      this.ctx.textAlign = 'center';
      let phaseText = '';
      switch (this.boss.phase) {
        case 1: phaseText = 'PHASE 1'; break;
        case 2: phaseText = 'PHASE 2!'; break;
        case 3: phaseText = 'FINAL PHASE!!!'; break;
      }
      
      // Draw text with pixelated effect
      this.drawPixelText(
        phaseText, 
        Math.floor(this.boss.x + this.boss.width / 2), 
        Math.floor(this.boss.y - 25)
      );
    }
    
    // Draw projectiles with pixel art effect
    for (const projectile of this.projectiles) {
      // Draw pixelated energy ball
      this.ctx.fillStyle = projectile.color || '#D946EF';
      this.ctx.fillRect(
        Math.floor(projectile.x), 
        Math.floor(projectile.y), 
        projectile.width, 
        projectile.height
      );
      
      // Draw highlight
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(
        Math.floor(projectile.x + 1), 
        Math.floor(projectile.y + 1), 
        2, 
        2
      );
      
      // Draw trail (particle effect)
      this.ctx.fillStyle = 'rgba(217, 70, 239, 0.5)';
      this.ctx.fillRect(
        Math.floor(projectile.x - (projectile as any).velocityX / 60), 
        Math.floor(projectile.y - (projectile as any).velocityY / 60), 
        projectile.width / 2, 
        projectile.height / 2
      );
    }
    
    // Draw player with pixel art styling
    this.ctx.fillStyle = this.player.color;
    
    // Draw player body
    this.ctx.fillRect(
      Math.floor(this.player.x), 
      Math.floor(this.player.y), 
      this.player.width, 
      this.player.height
    );
    
    // Draw player head (slightly different color)
    this.ctx.fillStyle = '#4A9BE0';
    this.ctx.fillRect(
      Math.floor(this.player.x + 4), 
      Math.floor(this.player.y), 
      this.player.width - 8, 
      this.player.height / 3
    );
    
    // Draw player eyes
    this.ctx.fillStyle = '#FFFFFF';
    
    // Left eye
    const eyeY = Math.floor(this.player.y + 8);
    const leftEyeX = this.playerDirection === 'right' ? 
      Math.floor(this.player.x + 9) :
      Math.floor(this.player.x + 6);
    this.ctx.fillRect(leftEyeX, eyeY, 4, 4);
    
    // Right eye
    const rightEyeX = this.playerDirection === 'right' ? 
      Math.floor(this.player.x + this.player.width - 13) :
      Math.floor(this.player.x + this.player.width - 10);
    this.ctx.fillRect(rightEyeX, eyeY, 4, 4);
    
    // Draw pupils (look in direction of movement)
    this.ctx.fillStyle = '#000000';
    const pupilOffsetX = this.playerDirection === 'right' ? 1 : -1;
    this.ctx.fillRect(leftEyeX + 1 + pupilOffsetX, eyeY + 1, 2, 2);
    this.ctx.fillRect(rightEyeX + 1 + pupilOffsetX, eyeY + 1, 2, 2);
    
    // Draw mouth (different based on player state)
    if (this.player.spriteState === 'jump') {
      // Open mouth for jump
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width / 2 - 4), 
        Math.floor(this.player.y + 16), 
        8, 
        4
      );
    } else if (this.player.spriteState === 'fall') {
      // Worried expression for falling
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width / 2 - 3), 
        Math.floor(this.player.y + 16), 
        6, 
        3
      );
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width / 2 - 1), 
        Math.floor(this.player.y + 16), 
        2, 
        3
      );
    } else {
      // Normal smile
      this.ctx.fillStyle = '#FFFFFF';
      const smileWidth = 8;
      
      // Draw smile that faces the right direction
      if (this.playerDirection === 'right') {
        this.ctx.fillRect(
          Math.floor(this.player.x + (this.player.width / 2) - smileWidth / 2), 
          Math.floor(this.player.y + 16), 
          smileWidth, 
          2
        );
        this.ctx.fillRect(
          Math.floor(this.player.x + (this.player.width / 2) + smileWidth / 2 - 2), 
          Math.floor(this.player.y + 14), 
          2, 
          2
        );
      } else {
        this.ctx.fillRect(
          Math.floor(this.player.x + (this.player.width / 2) - smileWidth / 2), 
          Math.floor(this.player.y + 16), 
          smileWidth, 
          2
        );
        this.ctx.fillRect(
          Math.floor(this.player.x + (this.player.width / 2) - smileWidth / 2), 
          Math.floor(this.player.y + 14), 
          2, 
          2
        );
      }
    }
    
    // Draw player limbs with animation based on state
    this.ctx.fillStyle = this.player.color;
    
    if (this.player.spriteState === 'walk') {
      // Animated limbs for walking
      const animSpeed = 8;
      const walkOffset = Math.sin(this.lastFrameTime / (1000 / animSpeed)) * 4;
      
      // Arms
      this.ctx.fillRect(
        Math.floor(this.player.x + 2), 
        Math.floor(this.player.y + 16 + walkOffset), 
        4, 
        12
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 6), 
        Math.floor(this.player.y + 16 - walkOffset), 
        4, 
        12
      );
      
      // Legs
      this.ctx.fillRect(
        Math.floor(this.player.x + 6), 
        Math.floor(this.player.y + 32 - walkOffset), 
        6, 
        16
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 12), 
        Math.floor(this.player.y + 32 + walkOffset), 
        6, 
        16
      );
    } else if (this.player.spriteState === 'jump' || this.player.spriteState === 'fall') {
      // Positioned limbs for jumping/falling
      
      // Arms up for jump, down for fall
      const armY = this.player.spriteState === 'jump' ? -4 : 4;
      this.ctx.fillRect(
        Math.floor(this.player.x + 2), 
        Math.floor(this.player.y + 16 + armY), 
        4, 
        12
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 6), 
        Math.floor(this.player.y + 16 + armY), 
        4, 
        12
      );
      
      // Legs tucked for jump, extended for fall
      const legExtend = this.player.spriteState === 'jump' ? -4 : 4;
      this.ctx.fillRect(
        Math.floor(this.player.x + 6), 
        Math.floor(this.player.y + 32), 
        6, 
        12 + legExtend
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 12), 
        Math.floor(this.player.y + 32), 
        6, 
        12 + legExtend
      );
    } else {
      // Default standing pose
      
      // Arms
      this.ctx.fillRect(
        Math.floor(this.player.x + 2), 
        Math.floor(this.player.y + 16), 
        4, 
        12
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 6), 
        Math.floor(this.player.y + 16), 
        4, 
        12
      );
      
      // Legs
      this.ctx.fillRect(
        Math.floor(this.player.x + 6), 
        Math.floor(this.player.y + 32), 
        6, 
        16
      );
      this.ctx.fillRect(
        Math.floor(this.player.x + this.player.width - 12), 
        Math.floor(this.player.y + 32), 
        6, 
        16
      );
    }
    
    // Draw boss activation zone indicator when close
    if (this.boss && !this.boss.isActive) {
      const distanceToPlayer = Math.abs(this.player.x - this.boss.x);
      if (distanceToPlayer < 400) {
        // Pixelated warning zone
        for (let y = 0; y < this.canvas.height; y += 8) {
          for (let x = 700; x < 800; x += 8) {
            if ((x + y) % 16 === 0) {
              this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
              this.ctx.fillRect(x, y, 8, 8);
            }
          }
        }
        
        // Warning text in pixelated style
        this.drawPixelText(
          'BOSS AHEAD', 
          750, 
          100
        );
        
        // Animated warning arrows
        const arrowOffset = Math.sin(this.lastFrameTime / 200) * 10;
        this.ctx.fillStyle = '#FF0000';
        
        // Right pointing arrows
        for (let i = 0; i < 3; i++) {
          const arrowX = 680 - arrowOffset - i * 30;
          const arrowY = 100;
          
          this.ctx.beginPath();
          this.ctx.moveTo(arrowX, arrowY);
          this.ctx.lineTo(arrowX - 10, arrowY - 10);
          this.ctx.lineTo(arrowX - 10, arrowY + 10);
          this.ctx.fill();
        }
      }
    }
  }
  
  private drawPixelText(text: string, x: number, y: number): void {
    this.ctx.save();
    
    // Set text properties for pixel art look
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textBaseline = 'middle';
    
    // First draw text with shadow for pixel effect
    this.ctx.fillStyle = '#000000';
    this.ctx.fillText(text, x + 2, y + 2);
    
    // Then draw the main text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(text, x, y);
    
    this.ctx.restore();
  }
  
  cleanup(): void {
    this.stop();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}

export default GameEngine;
