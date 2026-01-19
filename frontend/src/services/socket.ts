import { io, Socket } from 'socket.io-client';
import {
  Room,
  GameState,
  Player,
  CreateRoomPayload,
  JoinRoomPayload,
  GameMovePayload,
  RoomIdPayload,
  ReconnectPayload,
  PlayerMove,
} from '@shared/types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map();

  connect(): Socket {
    // Return existing socket if already connected
    if (this.socket?.connected) {
      return this.socket;
    }

    // If socket exists but not connected, just return it (it will auto-reconnect)
    if (this.socket) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      // Re-register all listeners after reconnection
      this.reattachListeners();
      // Try to reconnect to room if we have stored session
      this.tryAutoReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  private reattachListeners(): void {
    // Re-attach all stored listeners to the socket after reconnection
    for (const [event, callbacks] of this.listeners.entries()) {
      for (const callback of callbacks) {
        // Remove first to avoid duplicates, then add
        this.socket?.off(event, callback);
        this.socket?.on(event, callback);
      }
    }
  }

  private tryAutoReconnect(): void {
    // Try to reconnect to room if we have stored session
    const storedRoomId = localStorage.getItem('azul-room-id');
    const storedPlayerId = localStorage.getItem('azul-player-id');
    if (storedRoomId && storedPlayerId) {
      console.log('Attempting to reconnect to room:', storedRoomId);
      this.reconnect(storedRoomId, storedPlayerId);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Room operations
  createRoom(playerName: string, maxPlayers: 2 | 3 | 4, playerImage?: string): void {
    const payload: CreateRoomPayload = { playerName, maxPlayers, playerImage };
    this.socket?.emit('room:create', payload);
  }

  joinRoom(roomId: string, playerName: string, playerImage?: string): void {
    const payload: JoinRoomPayload = { roomId, playerName, playerImage };
    this.socket?.emit('room:join', payload);
  }

  leaveRoom(roomId: string): void {
    const payload: RoomIdPayload = { roomId };
    this.socket?.emit('room:leave', payload);
  }

  // Game operations
  startGame(roomId: string): void {
    const payload: RoomIdPayload = { roomId };
    this.socket?.emit('game:start', payload);
  }

  makeMove(roomId: string, move: PlayerMove): void {
    const payload: GameMovePayload = { roomId, move };
    this.socket?.emit('game:move', payload);
  }

  restartGame(roomId: string): void {
    const payload: RoomIdPayload = { roomId };
    this.socket?.emit('game:restart', payload);
  }

  reconnect(roomId: string, playerId: string): void {
    const payload: ReconnectPayload = { roomId, playerId };
    this.socket?.emit('player:reconnect', payload);
  }

  changeRoomCode(roomId: string, newRoomId: string): void {
    this.socket?.emit('room:change-code', { roomId, newRoomId });
  }

  // Check for active game by player name (session recovery)
  checkActiveGame(playerName: string): void {
    this.socket?.emit('player:check-active-game', { playerName });
  }

  onActiveGameResult(callback: (data: {
    found: boolean;
    roomId?: string;
    playerId?: string;
    gameState?: GameState
  }) => void): void {
    this.on('player:active-game-result', callback);
  }

  // Event listeners
  on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback as (...args: unknown[]) => void);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback as (...args: unknown[]) => void);
  }

  off(event: string, callback?: (...args: unknown[]) => void): void {
    if (callback) {
      this.socket?.off(event, callback);
      this.listeners.get(event)?.delete(callback);
    } else {
      this.socket?.off(event);
      this.listeners.delete(event);
    }
  }

  // Room event listeners
  onRoomCreated(callback: (data: { room: Room; playerId: string }) => void): void {
    this.on('room:created', callback);
  }

  onRoomJoined(callback: (data: { room: Room; playerId: string }) => void): void {
    this.on('room:joined', callback);
  }

  onRoomUpdated(callback: (data: { room: Room }) => void): void {
    this.on('room:updated', callback);
  }

  onPlayerJoined(callback: (data: { player: Player }) => void): void {
    this.on('room:player-joined', callback);
  }

  onPlayerLeft(callback: (data: { playerId: string }) => void): void {
    this.on('room:player-left', callback);
  }

  onRoomError(callback: (data: { message: string }) => void): void {
    this.on('room:error', callback);
  }

  // Game event listeners
  onGameStarted(callback: (data: { gameState: GameState }) => void): void {
    this.on('game:started', callback);
  }

  onGameStateUpdated(callback: (data: { gameState: GameState }) => void): void {
    this.on('game:state-updated', callback);
  }

  onGameFinished(callback: (data: { gameState: GameState }) => void): void {
    this.on('game:finished', callback);
  }

  onGameError(callback: (data: { message: string }) => void): void {
    this.on('game:error', callback);
  }

  // Connection event listeners
  onPlayerReconnected(callback: (data: { gameState: GameState }) => void): void {
    this.on('player:reconnected', callback);
  }

  onPlayerDisconnected(callback: (data: { playerId: string }) => void): void {
    this.on('player:disconnected', callback);
  }

  onRoomCodeChanged(callback: (data: { room: Room; oldRoomId: string }) => void): void {
    this.on('room:code-changed', callback);
  }
}

export const socketService = new SocketService();
export default socketService;
