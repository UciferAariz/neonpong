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
    };
    
    gameRef.current = new Phaser.Game(config);
    
    // Start game scene
    if (gameRef.current.scene.keys['GameScene']) {
      gameRef.current.scene.start('GameScene', { mode, side });
    }
    
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
        className="rounded-lg overflow-hidden shadow-neon"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      />
    </div>
  );
};

export default GameCanvas;
