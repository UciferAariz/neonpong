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
  }
  
  move(direction: 'up' | 'down' | 'stop', delta: number) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    if (direction === 'up') {
      body.setVelocityY(-PADDLE_CONFIG.speed);
    } else if (direction === 'down') {
      body.setVelocityY(PADDLE_CONFIG.speed);
    } else {
      body.setVelocityY(0);
    }
    
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
