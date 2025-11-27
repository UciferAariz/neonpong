import Phaser from 'phaser';
import { BALL_CONFIG, GAME_CONFIG } from '../config/gameConfig';

export class Ball {
  public sprite: Phaser.GameObjects.Arc;
  private scene: Phaser.Scene;
  private trail: Phaser.GameObjects.Graphics;
  private trailPoints: Array<{ x: number; y: number; alpha: number }> = [];
  private currentSpeed: number;
  private glowEffect: Phaser.GameObjects.Graphics;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentSpeed = BALL_CONFIG.initialSpeed;
    
    // Create trail
    this.trail = scene.add.graphics();
    
    // Create glow effect
    this.glowEffect = scene.add.graphics();
    
    // Create ball
    this.sprite = scene.add.circle(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      BALL_CONFIG.radius,
      0x00f0ff
    );
    
    // Enable physics
    scene.physics.add.existing(this.sprite);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false); // Don't collide with left/right walls for scoring
    body.setBounce(1, 1);
    body.setCircle(BALL_CONFIG.radius);
  }
  
  serve(direction: 'left' | 'right') {
    const angle = direction === 'left' 
      ? Phaser.Math.Between(-30, 30) 
      : Phaser.Math.Between(150, 210);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.scene.physics.velocityFromAngle(
      angle,
      this.currentSpeed,
      body.velocity
    );
  }
  
  reset() {
    this.sprite.setPosition(GAME_CONFIG.width / 2, GAME_CONFIG.height / 2);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    this.trailPoints = [];
    this.currentSpeed = BALL_CONFIG.initialSpeed;
  }
  
  update() {
    this.updateTrail();
    this.updateGlow();
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    // Handle top/bottom wall bounces manually
    if (this.sprite.y <= BALL_CONFIG.radius) {
      this.sprite.y = BALL_CONFIG.radius;
      body.velocity.y = Math.abs(body.velocity.y);
    } else if (this.sprite.y >= GAME_CONFIG.height - BALL_CONFIG.radius) {
      this.sprite.y = GAME_CONFIG.height - BALL_CONFIG.radius;
      body.velocity.y = -Math.abs(body.velocity.y);
    }
    
    // Gradually increase speed
    const currentVelocity = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    if (currentVelocity > 0 && currentVelocity < BALL_CONFIG.maxSpeed) {
      const scale = (currentVelocity + BALL_CONFIG.speedIncrement * 0.01) / currentVelocity;
      body.velocity.scale(scale);
    }
  }
  
  private updateTrail() {
    this.trailPoints.unshift({
      x: this.sprite.x,
      y: this.sprite.y,
      alpha: 1,
    });
    
    if (this.trailPoints.length > 15) {
      this.trailPoints.pop();
    }
    
    this.trail.clear();
    
    for (let i = 0; i < this.trailPoints.length; i++) {
      const point = this.trailPoints[i];
      const alpha = (1 - i / this.trailPoints.length) * 0.6;
      const size = BALL_CONFIG.radius * (1 - i / this.trailPoints.length);
      
      this.trail.fillStyle(0x00f0ff, alpha);
      this.trail.fillCircle(point.x, point.y, size);
    }
  }
  
  private updateGlow() {
    this.glowEffect.clear();
    this.glowEffect.fillStyle(0x00f0ff, 0.2);
    this.glowEffect.fillCircle(this.sprite.x, this.sprite.y, BALL_CONFIG.radius + 15);
    this.glowEffect.fillStyle(0x00f0ff, 0.1);
    this.glowEffect.fillCircle(this.sprite.x, this.sprite.y, BALL_CONFIG.radius + 25);
  }
  
  createHitParticles() {
    const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 1, end: 0 },
      lifespan: 200,
      quantity: 8,
      tint: 0xff006e,
    });
    
    this.scene.time.delayedCall(300, () => {
      particles.destroy();
    });
  }
  
  applyPaddleSpin(paddleY: number, impactY: number, paddleHeight: number) {
    const offset = impactY - paddleY;
    const normalized = offset / (paddleHeight / 2);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    
    body.velocity.y += normalized * 100;
  }
  
  destroy() {
    this.trail.destroy();
    this.glowEffect.destroy();
    this.sprite.destroy();
  }
}
