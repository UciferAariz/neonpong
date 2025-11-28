import Phaser from 'phaser';
import { PADDLE_CONFIG } from '../config/gameConfig';

export class Paddle {
  public sprite: Phaser.GameObjects.Rectangle;
  private scene: Phaser.Scene;
  private side: 'left' | 'right';
  private glowEffect: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene, x: number, y: number, side: 'left' | 'right') {
    this.scene = scene;
    this.side = side;
    
    // Create glow effect
    this.glowEffect = scene.add.graphics();
    this.updateGlow(x, y);
    
    // Create paddle sprite
    this.sprite = scene.add.rectangle(
      x, 
      y, 
      PADDLE_CONFIG.width, 
      PADDLE_CONFIG.height, 
      0x00f0ff
    );
    
    // Enable physics
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setImmovable(true);
    // Add drag so sudden velocity changes are smoothed out
    // Reduce drag further for very snappy response (AI can sprint)
    body.setDrag(100, 100);
  }
  
  move(direction: 'up' | 'down' | 'stop', delta: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    if (!body) {
      console.error('Paddle body not initialized!');
      return;
    }
    
    if (direction === 'up') {
      body.setVelocityY(-PADDLE_CONFIG.speed);
      console.log(`${this.side} paddle moving UP`, body.velocity.y);
    } else if (direction === 'down') {
      body.setVelocityY(PADDLE_CONFIG.speed);
      console.log(`${this.side} paddle moving DOWN`, body.velocity.y);
    } else {
      body.setVelocityY(0);
    }
    
    this.updateGlow(this.sprite.x, this.sprite.y);
  }

  // Set raw vertical velocity (used by AI for smooth proportional movement)
  setVelocity(y: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    // Clamp velocity to configured max speed
    const clamped = Phaser.Math.Clamp(y, -PADDLE_CONFIG.speed, PADDLE_CONFIG.speed);
    body.setVelocityY(clamped);
    this.updateGlow(this.sprite.x, this.sprite.y);
  }

  // Smoothly move current velocity toward target velocity to reduce jitter
  setVelocitySmoothed(targetY: number, alpha = 0.2) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    const current = body.velocity.y;
    const clampedTarget = Phaser.Math.Clamp(targetY, -PADDLE_CONFIG.speed, PADDLE_CONFIG.speed);
    const smoothed = Phaser.Math.Linear(current, clampedTarget, alpha);
    body.setVelocityY(smoothed);
    this.updateGlow(this.sprite.x, this.sprite.y);
  }
  
  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
    this.updateGlow(x, y);
  }
  
  private updateGlow(x: number, y: number) {
    this.glowEffect.clear();
    this.glowEffect.fillStyle(0x00f0ff, 0.3);
    this.glowEffect.fillRoundedRect(
      x - PADDLE_CONFIG.width / 2 - 5,
      y - PADDLE_CONFIG.height / 2 - 5,
      PADDLE_CONFIG.width + 10,
      PADDLE_CONFIG.height + 10,
      5
    );
  }
  
  createHitParticles(x: number, y: number) {
    const particles = this.scene.add.particles(x, y, 'particle', {
      speed: { min: 100, max: 200 },
      angle: this.side === 'left' ? { min: -45, max: 45 } : { min: 135, max: 225 },
      scale: { start: 1, end: 0 },
      lifespan: 300,
      quantity: 10,
      tint: 0x00f0ff,
    });
    
    this.scene.time.delayedCall(400, () => {
      particles.destroy();
    });
  }
  
  getY(): number {
    return this.sprite.y;
  }
  
  destroy() {
    this.glowEffect.destroy();
    this.sprite.destroy();
  }
}
