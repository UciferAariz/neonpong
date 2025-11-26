import Phaser from 'phaser';

export const GAME_CONFIG = {
  width: 1280,
  height: 720,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  backgroundColor: '#0a0e27',
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false,
  },
};

export const PADDLE_CONFIG = {
  width: 20,
  height: 100,
  speed: 600,
  offsetFromEdge: 50,
};

export const BALL_CONFIG = {
  radius: 10,
  initialSpeed: 400,
  maxSpeed: 800,
  speedIncrement: 20,
};

export const GAME_RULES = {
  winningScore: 11,
  serveSide: 'random' as 'left' | 'right' | 'random',
};
