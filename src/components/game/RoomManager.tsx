import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Copy, ArrowLeft, Plus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RoomManagerProps {
  onBack: () => void;
  onRoomReady: (roomId: string, isHost: boolean) => void;
}

const RoomManager = ({ onBack, onRoomReady }: RoomManagerProps) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomId, setRoomId] = useState('');
  const [roomPass, setRoomPass] = useState('');
  const [createdRoom, setCreatedRoom] = useState<{ id: string; pass: string } | null>(null);
  const { toast } = useToast();
  
  const handleCreateRoom = () => {
    // Generate random room ID and password
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newRoomPass = Math.random().toString(36).substring(2, 10);
    
    setCreatedRoom({ id: newRoomId, pass: newRoomPass });
    setMode('create');
    
    toast({
      title: 'Room Created!',
      description: 'Share the Room ID and Password with your friend',
    });
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };
  
  const handleJoinRoom = () => {
    if (!roomId || !roomPass) {
      toast({
        title: 'Error',
        description: 'Please enter both Room ID and Password',
        variant: 'destructive',
      });
      return;
    }
    
    onRoomReady(roomId, false);
  };
  
  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-deep-space cyber-grid flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-8 left-8 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2" />
          Back to Menu
        </Button>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <h1 className="text-6xl font-black neon-text text-center mb-12">
            Online Multiplayer
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="bg-card/50 backdrop-blur-xl border-2 border-primary/50 hover:border-primary hover:shadow-neon cursor-pointer transition-all"
              onClick={handleCreateRoom}
            >
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold neon-text">Create Room</h2>
                <p className="text-foreground/70">Host a new game and invite a friend</p>
              </div>
            </Card>
            
            <Card 
              className="bg-card/50 backdrop-blur-xl border-2 border-primary/50 hover:border-primary hover:shadow-neon cursor-pointer transition-all"
              onClick={() => setMode('join')}
            >
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold neon-text">Join Room</h2>
                <p className="text-foreground/70">Enter a room ID to join a game</p>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }
  
  if (mode === 'create' && createdRoom) {
    return (
      <div className="min-h-screen bg-deep-space cyber-grid flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          onClick={() => {
            setMode('select');
            setCreatedRoom(null);
          }}
          className="absolute top-8 left-8 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary shadow-neon">
            <div className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-black neon-text mb-2">Room Created!</h2>
                <p className="text-foreground/70">Share these credentials with your friend</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-primary mb-2 block">Room ID</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={createdRoom.id} 
                      readOnly 
                      className="bg-background/50 border-primary/50 text-2xl font-mono text-center"
                    />
                    <Button
                      onClick={() => copyToClipboard(createdRoom.id, 'Room ID')}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="text-primary mb-2 block">Password</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={createdRoom.pass} 
                      readOnly 
                      className="bg-background/50 border-primary/50 font-mono"
                    />
                    <Button
                      onClick={() => copyToClipboard(createdRoom.pass, 'Password')}
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Copy />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 text-center">
                <p className="text-sm text-foreground/60 mb-4">
                  Waiting for opponent to join...
                </p>
                <Button
                  onClick={() => onRoomReady(createdRoom.id, true)}
                  size="lg"
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:shadow-neon"
                >
                  Start Game (Test Mode)
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  if (mode === 'join') {
    return (
      <div className="min-h-screen bg-deep-space cyber-grid flex flex-col items-center justify-center p-8">
        <Button
          variant="ghost"
          onClick={() => setMode('select')}
          className="absolute top-8 left-8 hover:bg-primary/10"
        >
          <ArrowLeft className="mr-2" />
          Back
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full"
        >
          <Card className="bg-card/50 backdrop-blur-xl border-2 border-primary shadow-neon">
            <div className="p-8 space-y-6">
              <div className="text-center">
                <h2 className="text-4xl font-black neon-text mb-2">Join Room</h2>
                <p className="text-foreground/70">Enter the room credentials to join</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-primary mb-2 block">Room ID</Label>
                  <Input 
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    className="bg-background/50 border-primary/50 text-2xl font-mono text-center"
                    maxLength={6}
                  />
                </div>
                
                <div>
                  <Label className="text-primary mb-2 block">Password</Label>
                  <Input 
                    type="password"
                    value={roomPass}
                    onChange={(e) => setRoomPass(e.target.value)}
                    placeholder="Enter room password"
                    className="bg-background/50 border-primary/50 font-mono"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleJoinRoom}
                size="lg"
                className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:shadow-neon"
              >
                Join Game
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return null;
};

export default RoomManager;
