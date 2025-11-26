import { io, Socket } from 'socket.io-client';

interface RoomData {
  roomId: string;
  roomPass: string;
  hostToken?: string;
}

interface PlayerInput {
  seq: number;
  input: 'up' | 'down' | 'stop';
  timestamp: number;
}

interface GameSnapshot {
  seq: number;
  serverTime: number;
  ball: { x: number; y: number; vx: number; vy: number };
  paddles: {
    left: { y: number };
    right: { y: number };
  };
  scores: { left: number; right: number };
}

class SocketClient {
  private socket: Socket | null = null;
  private connected: boolean = false;
  
  // Event callbacks
  private onConnectCallback?: () => void;
  private onDisconnectCallback?: () => void;
  private onRoomJoinedCallback?: (data: any) => void;
  private onStateUpdateCallback?: (snapshot: GameSnapshot) => void;
  private onErrorCallback?: (error: string) => void;
  
  connect(serverUrl: string) {
    if (this.socket && this.connected) {
      console.warn('Socket already connected');
      return;
    }
    
    this.socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.setupEventListeners();
  }
  
  private setupEventListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Connected to server:', this.socket?.id);
      this.onConnectCallback?.();
    });
    
    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Disconnected from server');
      this.onDisconnectCallback?.();
    });
    
    this.socket.on('roomJoined', (data) => {
      console.log('Joined room:', data);
      this.onRoomJoinedCallback?.(data);
    });
    
    this.socket.on('stateSnapshot', (snapshot: GameSnapshot) => {
      this.onStateUpdateCallback?.(snapshot);
    });
    
    this.socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      this.onErrorCallback?.(error);
    });
  }
  
  // Event registration methods
  onConnect(callback: () => void) {
    this.onConnectCallback = callback;
  }
  
  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback;
  }
  
  onRoomJoined(callback: (data: any) => void) {
    this.onRoomJoinedCallback = callback;
  }
  
  onStateUpdate(callback: (snapshot: GameSnapshot) => void) {
    this.onStateUpdateCallback = callback;
  }
  
  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }
  
  // Room management
  createRoom(): Promise<RoomData> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }
      
      this.socket.emit('createRoom', (response: RoomData) => {
        resolve(response);
      });
    });
  }
  
  joinRoom(roomId: string, roomPass: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.connected) {
        reject(new Error('Not connected to server'));
        return;
      }
      
      this.socket.emit('joinRoom', { roomId, roomPass }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }
  
  // Game actions
  sendInput(input: PlayerInput) {
    if (!this.socket || !this.connected) {
      console.warn('Cannot send input: not connected');
      return;
    }
    
    this.socket.emit('playerInput', input);
  }
  
  startGame() {
    if (!this.socket || !this.connected) {
      console.warn('Cannot start game: not connected');
      return;
    }
    
    this.socket.emit('startGame');
  }
  
  // Utility
  measureLatency(): Promise<number> {
    return new Promise((resolve) => {
      if (!this.socket || !this.connected) {
        resolve(-1);
        return;
      }
      
      const start = Date.now();
      this.socket.emit('ping', () => {
        const latency = Date.now() - start;
        resolve(latency);
      });
    });
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
  
  isConnected(): boolean {
    return this.connected;
  }
}

export const socketClient = new SocketClient();
export type { RoomData, PlayerInput, GameSnapshot };
