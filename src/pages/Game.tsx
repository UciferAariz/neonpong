import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from '@/components/game/GameCanvas';
import MainMenu from '@/components/game/MainMenu';
import RoomManager from '@/components/game/RoomManager';

type GameState = 'menu' | 'room-manager' | 'local-game' | 'ai-game' | 'online-game';

const Game = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isHost, setIsHost] = useState(false);
  const navigate = useNavigate();
  
  const handleModeSelect = (mode: 'local' | 'online' | 'ai') => {
    if (mode === 'local') {
      setGameState('local-game');
    } else if (mode === 'ai') {
      setGameState('ai-game');
    } else {
      setGameState('room-manager');
    }
  };
  
  const handleRoomReady = (roomId: string, host: boolean) => {
    setIsHost(host);
    setGameState('online-game');
  };
  
  const handleBack = () => {
    setGameState('menu');
  };
  
  const handleGameEnd = () => {
    setGameState('menu');
  };
  
  if (gameState === 'menu') {
    return <MainMenu onModeSelect={handleModeSelect} />;
  }
  
  if (gameState === 'room-manager') {
    return <RoomManager onBack={handleBack} onRoomReady={handleRoomReady} />;
  }
  
  if (gameState === 'local-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas mode="local" onGameEnd={handleGameEnd} />
      </div>
    );
  }
  
  if (gameState === 'ai-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas mode="ai" onGameEnd={handleGameEnd} />
      </div>
    );
  }
  
  if (gameState === 'online-game') {
    return (
      <div className="min-h-screen bg-deep-space">
        <GameCanvas 
          mode="online" 
          side={isHost ? 'left' : 'right'}
          onGameEnd={handleGameEnd} 
        />
      </div>
    );
  }
  
  return null;
};

export default Game;
