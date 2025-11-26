import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Gamepad2, Users, Trophy, Settings } from 'lucide-react';

interface MainMenuProps {
  onModeSelect: (mode: 'local' | 'online') => void;
}

const MainMenu = ({ onModeSelect }: MainMenuProps) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const menuItems = [
    {
      id: 'local',
      title: 'Local 2-Player',
      description: 'Play on the same device with a friend',
      icon: Gamepad2,
      gradient: 'from-neon-cyan to-neon-purple',
    },
    {
      id: 'online',
      title: 'Online Multiplayer',
      description: 'Create or join a room to play online',
      icon: Users,
      gradient: 'from-neon-purple to-neon-pink',
    },
  ];
  
  return (
    <div className="min-h-screen bg-deep-space cyber-grid flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-8xl font-black neon-text mb-4">
          NEON<span className="neon-text-pink">PONG</span>
        </h1>
        <p className="text-xl text-foreground/70 font-medium tracking-wider">
          COMPETITIVE MULTIPLAYER PING PONG
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-12">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              onMouseEnter={() => setHoveredCard(item.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Card 
                className={`
                  bg-card/50 backdrop-blur-xl border-2 cursor-pointer
                  transition-all duration-300 hover:scale-105
                  ${hoveredCard === item.id ? 'border-primary shadow-neon' : 'border-border'}
                `}
                onClick={() => onModeSelect(item.id as 'local' | 'online')}
              >
                <div className="p-8 flex flex-col items-center text-center space-y-4">
                  <div 
                    className={`
                      w-20 h-20 rounded-full bg-gradient-to-br ${item.gradient}
                      flex items-center justify-center
                      ${hoveredCard === item.id ? 'shadow-neon' : ''}
                      transition-all duration-300
                    `}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold neon-text">{item.title}</h2>
                  <p className="text-foreground/70">{item.description}</p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="flex gap-4"
      >
        <Button 
          variant="outline" 
          size="lg" 
          className="border-primary/50 hover:border-primary hover:bg-primary/10"
        >
          <Trophy className="mr-2" />
          Leaderboard
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          className="border-primary/50 hover:border-primary hover:bg-primary/10"
        >
          <Settings className="mr-2" />
          Settings
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="mt-16 text-center text-sm text-foreground/50"
      >
        <p>Press W/S for left paddle • Arrow keys for right paddle</p>
        <p className="mt-1">Target: {11} points to win</p>
      </motion.div>
    </div>
  );
};

export default MainMenu;
