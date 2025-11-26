import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from '@/game/scenes/GameScene';
import { GAME_CONFIG } from '@/game/config/gameConfig';

interface GameCanvasProps {
  mode: 'local' | 'online';
  side?: 'left' | 'right';
  onGameEnd?: () => void;
}

const GameCanvas = ({ mode, side = 'left', onGameEnd }: GameCanvasProps) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      ...GAME_CONFIG,
      parent: containerRef.current,
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };
    
    gameRef.current = new Phaser.Game(config);
    
    // Start game scene
    if (gameRef.current.scene.keys['GameScene']) {
      gameRef.current.scene.start('GameScene', { mode, side });
    }
    
    // Auto-focus the game canvas
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        canvas.setAttribute('tabindex', '1');
        canvas.focus();
        console.log('Game canvas focused');
      }
    }, 100);
    
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mode, side]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-deep-space">
      <div 
        ref={containerRef} 
        className="rounded-lg overflow-hidden shadow-neon cursor-pointer"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        onClick={() => {
          const canvas = containerRef.current?.querySelector('canvas');
          canvas?.focus();
        }}
      />
      <div className="absolute bottom-4 left-4 text-xs text-foreground/50 bg-background/80 px-3 py-2 rounded">
        <p>🎮 W/S for left paddle • ↑/↓ for right paddle</p>
        <p className="mt-1">Click on game to focus if keys don't work</p>
      </div>
    </div>
  );
};

export default GameCanvas;
