import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/Ball';
import { GAME_CONFIG, PADDLE_CONFIG, GAME_RULES } from '../config/gameConfig';

interface GameState {
  leftScore: number;
  rightScore: number;
  gameOver: boolean;
  winner: 'left' | 'right' | null;
}

export class GameScene extends Phaser.Scene {
  private leftPaddle!: Paddle;
  private rightPaddle!: Paddle;
  private ball!: Ball;
  private gameState: GameState = {
    leftScore: 0,
    rightScore: 0,
    gameOver: false,
    winner: null,
  };
  
  private leftScoreText!: Phaser.GameObjects.Text;
  private rightScoreText!: Phaser.GameObjects.Text;
  private centerLine!: Phaser.GameObjects.Graphics;
  
  // Controls
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private escKey!: Phaser.Input.Keyboard.Key;
  private gameMode: 'local' | 'online' | 'ai';
  private localSide: 'left' | 'right';
  private aiDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  private isPaused: boolean = false;
  private initCalled: boolean = false;  // Track if init was called
  public onExitRequest?: () => void;
  public onGameEnd?: (leftScore: number, rightScore: number) => void;
  
  constructor() {
    super({ key: 'GameScene' });
    this.gameMode = 'local';
    this.localSide = 'left';
  }
  
  init(data: { mode?: 'local' | 'online' | 'ai'; side?: 'left' | 'right'; difficulty?: 'easy' | 'medium' | 'hard'; onExitRequest?: () => void; onGameEnd?: (leftScore: number, rightScore: number) => void }) {
    this.initCalled = true;
    this.gameMode = data.mode || 'local';
    this.localSide = data.side || 'left';
    this.aiDifficulty = data.difficulty || 'medium';
    this.onExitRequest = data.onExitRequest;
    this.onGameEnd = data.onGameEnd;
    console.log('✅ GameScene.init() - mode:', this.gameMode, 'side:', this.localSide, 'difficulty:', this.aiDifficulty);
  }
  
  preload() {
    // Create particle texture
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(4, 4, 4);
    graphics.generateTexture('particle', 8, 8);
    graphics.destroy();
  }
  
  create() {
    if (!this.initCalled) {
      console.error('❌ WARNING: init() was not called! gameMode is:', this.gameMode);
    }
    console.log('GameScene.create() - mode:', this.gameMode);
    
    // Background grid effect
    this.createBackground();
    
    // Create center line
    this.createCenterLine();
    
    // Create paddles
    this.leftPaddle = new Paddle(
      this,
      PADDLE_CONFIG.offsetFromEdge,
      GAME_CONFIG.height / 2,
      'left'
    );
    
    this.rightPaddle = new Paddle(
      this,
      GAME_CONFIG.width - PADDLE_CONFIG.offsetFromEdge,
      GAME_CONFIG.height / 2,
      'right'
    );
    
    // Create ball
    this.ball = new Ball(this);
    
    // Create score displays
    this.createScoreDisplay();
    
    // Setup collisions
    this.setupCollisions();
    
    // Setup input
    this.setupInput();
    
    // Start game
    this.time.delayedCall(1000, () => {
      this.serveBall();
    });
  }
  
  private createBackground() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00f0ff, 0.1);
    
    // Vertical lines
    for (let x = 0; x < GAME_CONFIG.width; x += 50) {
      graphics.lineBetween(x, 0, x, GAME_CONFIG.height);
    }
    
    // Horizontal lines
    for (let y = 0; y < GAME_CONFIG.height; y += 50) {
      graphics.lineBetween(0, y, GAME_CONFIG.width, y);
    }
  }
  
  private createCenterLine() {
    this.centerLine = this.add.graphics();
    this.centerLine.lineStyle(3, 0x00f0ff, 0.5);
    
    const dashLength = 20;
    const gapLength = 10;
    let y = 0;
    
    while (y < GAME_CONFIG.height) {
      this.centerLine.lineBetween(
        GAME_CONFIG.width / 2,
        y,
        GAME_CONFIG.width / 2,
        y + dashLength
      );
      y += dashLength + gapLength;
    }
  }
  
  private createScoreDisplay() {
    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '64px',
      fontFamily: 'Orbitron',
      color: '#00f0ff',
    };
    
    this.leftScoreText = this.add.text(
      GAME_CONFIG.width / 4,
      50,
      '0',
      style
    ).setOrigin(0.5);
    
    this.rightScoreText = this.add.text(
      (GAME_CONFIG.width / 4) * 3,
      50,
      '0',
      style
    ).setOrigin(0.5);
    
    // Add glow effect to scores
    this.leftScoreText.setStyle({
      ...style,
      shadow: { offsetX: 0, offsetY: 0, color: '#00f0ff', blur: 20, fill: true },
    });
    
    this.rightScoreText.setStyle({
      ...style,
      shadow: { offsetX: 0, offsetY: 0, color: '#00f0ff', blur: 20, fill: true },
    });
  }
  
  private setupCollisions() {
    this.physics.add.collider(
      this.ball.sprite,
      this.leftPaddle.sprite,
      this.handlePaddleHit,
      undefined,
      this
    );
    
    this.physics.add.collider(
      this.ball.sprite,
      this.rightPaddle.sprite,
      this.handlePaddleHit,
      undefined,
      this
    );
  }
  
  private handlePaddleHit(
    ballObj: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    paddleObj: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    const ball = ballObj as Phaser.GameObjects.Arc;
    const paddle = paddleObj as Phaser.GameObjects.Rectangle;
    
    this.ball.createHitParticles();
    this.ball.applyPaddleSpin(paddle.y, ball.y, PADDLE_CONFIG.height);
    
    // Camera shake effect
    this.cameras.main.shake(50, 0.002);
  }
  
  private setupInput() {
    if (!this.input.keyboard) {
      console.error('Keyboard input not available!');
      return;
    }
    
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasdKeys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
    });
    
    // ESC key for exit
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.escKey.on('down', () => {
      if (!this.isPaused && this.onExitRequest) {
        this.isPaused = true;
        this.physics.pause();
        this.onExitRequest();
      }
    });
    
    console.log('Input setup complete', { cursors: this.cursors, wasdKeys: this.wasdKeys });
  }
  
  public resumeGame() {
    this.isPaused = false;
    this.physics.resume();
  }
  
  update(time: number, delta: number) {
    if (this.gameState.gameOver || this.isPaused) return;
    
    // Handle input
    this.handleInput(delta);
    
    // AI control for right paddle in AI mode
    if (this.gameMode === 'ai') {
      this.handleAI(delta);
    }
    
    // Update ball
    this.ball.update();
    
    // Check for scoring
    this.checkScoring();
  }
  
  private handleInput(delta: number) {
    // Safety check
    if (!this.cursors || !this.wasdKeys) {
      console.warn('Input not initialized');
      return;
    }
    
    if (this.gameMode === 'local') {
      // ===== LOCAL MODE: Both paddles controlled by player =====
      // Left paddle (WASD)
      if (this.wasdKeys.up.isDown) {
        this.leftPaddle.move('up', delta);
      } else if (this.wasdKeys.down.isDown) {
        this.leftPaddle.move('down', delta);
      } else {
        this.leftPaddle.move('stop', delta);
      }
      
      // Right paddle (Arrow keys)
      if (this.cursors.up.isDown) {
        this.rightPaddle.move('up', delta);
      } else if (this.cursors.down.isDown) {
        this.rightPaddle.move('down', delta);
      } else {
        this.rightPaddle.move('stop', delta);
      }
    } 
    else if (this.gameMode === 'ai') {
      // ===== AI MODE: Left paddle controlled by player, right by AI =====
      // Left paddle (WASD or Arrow keys)
      if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
        this.leftPaddle.move('up', delta);
      } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
        this.leftPaddle.move('down', delta);
      } else {
        this.leftPaddle.move('stop', delta);
      }
      // Right paddle is controlled ONLY by handleAI()
    } 
    else if (this.gameMode === 'online') {
      // ===== ONLINE MODE: Only player's paddle controlled =====
      const paddle = this.localSide === 'left' ? this.leftPaddle : this.rightPaddle;
      
      if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
        paddle.move('up', delta);
      } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
        paddle.move('down', delta);
      } else {
        paddle.move('stop', delta);
      }
    } 
    else {
      console.error('❌ UNKNOWN GAME MODE:', this.gameMode);
    }
  }
  
  private handleAI(delta: number) {
    // AI for right paddle - proportional velocity to reduce jitter
    try {
      if (!this.ball?.sprite || !this.rightPaddle?.sprite) {
        return;
      }

      const ballY = this.ball.sprite.y;
      // Phaser rectangles use y as the center, so sprite.y already is paddle center
      const paddleY = this.rightPaddle.sprite.y;
      const paddleCenterY = paddleY;

      // Distance from paddle center to ball center
      const distance = ballY - paddleCenterY;

      // Configure AI parameters per difficulty
      const ballVelX = (this.ball.sprite.body as Phaser.Physics.Arcade.Body).velocity.x || 0;
      let k = 14;
      let midFactor = 0.6;
      let snapThreshold = 6;
      let sprintAlpha = 0.18;
      let followAlpha = 0.08;

      switch (this.aiDifficulty) {
        case 'easy':
          k = 8;
          midFactor = 0.75;
          snapThreshold = 10;
          sprintAlpha = 0.22;
          followAlpha = 0.12;
          break;
        case 'hard':
          k = 20;
          midFactor = 0.5;
          snapThreshold = 4;
          sprintAlpha = 0.12;
          followAlpha = 0.06;
          break;
        default:
          // medium already set
          break;
      }

      const midThreshold = GAME_CONFIG.width * midFactor;
      const minY = PADDLE_CONFIG.height / 2;
      const maxY = GAME_CONFIG.height - PADDLE_CONFIG.height / 2;
      if (Math.abs(distance) < snapThreshold) {
        // stop movement and align center to ball Y
        this.rightPaddle.setVelocity(0);
        const targetY = Phaser.Math.Clamp(this.ball.sprite.y, minY, maxY);
        this.rightPaddle.setPosition(this.rightPaddle.sprite.x, targetY);
        return;
      }

      if (ballVelX > 0 && (this.ball.sprite.x > midThreshold)) {
        // Ball is coming toward the AI and is relatively close horizontally — sprint
        const sprintVel = Math.sign(distance) * PADDLE_CONFIG.speed;
        // Use smoothed velocity to avoid immediate jumps
        this.rightPaddle.setVelocitySmoothed(sprintVel, sprintAlpha);
      } else {
        // Proportional control for fine adjustments
        const desiredVel = Phaser.Math.Clamp(distance * k, -PADDLE_CONFIG.speed, PADDLE_CONFIG.speed);

        // Smooth toward desired velocity
        this.rightPaddle.setVelocitySmoothed(desiredVel, followAlpha);
      }

    } catch (error) {
      console.error('❌ Error in handleAI:', error);
    }
  }
  
  private checkScoring() {
    const ballX = this.ball.sprite.x;
    
    if (ballX < -20) {
      // Right player scores
      this.score('right');
    } else if (ballX > GAME_CONFIG.width + 20) {
      // Left player scores
      this.score('left');
    }
  }
  
  private score(side: 'left' | 'right') {
    if (side === 'left') {
      this.gameState.leftScore++;
      this.leftScoreText.setText(this.gameState.leftScore.toString());
    } else {
      this.gameState.rightScore++;
      this.rightScoreText.setText(this.gameState.rightScore.toString());
    }
    
    // Screen flash effect
    this.cameras.main.flash(300, 0, 240, 255);
    
    // Check for winner
    if (
      this.gameState.leftScore >= GAME_RULES.winningScore ||
      this.gameState.rightScore >= GAME_RULES.winningScore
    ) {
      this.endGame(this.gameState.leftScore > this.gameState.rightScore ? 'left' : 'right');
    } else {
      this.ball.reset();
      this.time.delayedCall(1500, () => {
        this.serveBall();
      });
    }
  }
  
  private serveBall() {
    const serveSide = GAME_RULES.serveSide === 'random' 
      ? (Math.random() < 0.5 ? 'left' : 'right')
      : GAME_RULES.serveSide;
    
    this.ball.serve(serveSide);
  }
  
  private endGame(winner: 'left' | 'right') {
    this.gameState.gameOver = true;
    this.gameState.winner = winner;
    
    // Call the onGameEnd callback if provided
    if (this.onGameEnd) {
      this.onGameEnd(this.gameState.leftScore, this.gameState.rightScore);
    }
    
    const winnerText = this.add.text(
      GAME_CONFIG.width / 2,
      GAME_CONFIG.height / 2,
      `${winner.toUpperCase()} WINS!`,
      {
        fontSize: '72px',
        fontFamily: 'Orbitron',
        color: '#ff006e',
        shadow: { offsetX: 0, offsetY: 0, color: '#ff006e', blur: 30, fill: true },
      }
    ).setOrigin(0.5);
    
    this.time.delayedCall(3000, () => {
      this.scene.start('MenuScene');
    });
  }
  
  shutdown() {
    if (this.leftPaddle) this.leftPaddle.destroy();
    if (this.rightPaddle) this.rightPaddle.destroy();
    if (this.ball) this.ball.destroy();
  }
}
