import { useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { PlayerMove } from '@shared/types';
import { useAuthStore } from '../store/authStore';

export function useSocket() {
  const {
    setPlayerId,
    setConnected,
    setRoom,
    setGameState,
    setError,
    playerId,
    room,
  } = useGameStore();

  const user = useAuthStore((state) => state.user);

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    // Define callbacks with 'any' to satisfy socketService.off logic
    const onConnect = () => {
      setConnected(true);
      setPlayerId(socket.id || null);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onRoomCreated = (data: any) => {
      const { room, playerId } = data;
      setRoom(room);
      setPlayerId(playerId);
      localStorage.setItem('ladrilho-room-id', room.id);
      localStorage.setItem('ladrilho-player-id', playerId);
    };

    const onRoomJoined = (data: any) => {
      const { room, playerId } = data;
      setRoom(room);
      setPlayerId(playerId);
      localStorage.setItem('ladrilho-room-id', room.id);
      localStorage.setItem('ladrilho-player-id', playerId);
    };

    const onRoomUpdated = (data: any) => {
      setRoom(data.room);
    };

    const onPlayerJoined = (data: any) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gameState: {
            ...prev.gameState,
            players: [...prev.gameState.players, data.player],
          },
        };
      });
    };

    const onPlayerLeft = (data: any) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gameState: {
            ...prev.gameState,
            players: prev.gameState.players.filter((p) => p.id !== data.playerId),
          },
        };
      });
    };

    const onRoomError = (data: any) => {
      console.error('Room error:', data.message);
      setError(data.message);

      // If room doesn't exist anymore, clear local state
      if (data.message?.includes('not found') || data.message?.includes('Player not found')) {
        console.log('Clearing stale room/player data');
        localStorage.removeItem('ladrilho-room-id');
        localStorage.removeItem('ladrilho-player-id');
        setRoom(null);
        setGameState(null);
      }
    };

    const onGameStarted = (data: any) => {
      setGameState(data.gameState);
    };

    const onGameStateUpdated = (data: any) => {
      setGameState(data.gameState);
    };

    const onGameFinished = (data: any) => {
      setGameState(data.gameState);
    };

    const onGameError = (data: any) => {
      console.error('Game error:', data.message);
      setError(data.message);

      // If player/room doesn't exist anymore, clear local state  
      if (data.message?.includes('not found') || data.message?.includes('Player not found')) {
        console.log('Clearing stale room/player data from game error');
        localStorage.removeItem('ladrilho-room-id');
        localStorage.removeItem('ladrilho-player-id');
        setRoom(null);
        setGameState(null);
      }
    };

    const onPlayerReconnected = (data: any) => {
      setGameState(data.gameState);
    };

    const onPlayerDisconnected = (data: any) => {
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === data.playerId ? { ...p, isConnected: false } : p
          ),
        };
      });
    };

    const onRoomCodeChanged = (data: any) => {
      setRoom(data.room);
      localStorage.setItem('ladrilho-room-id', data.room.id);
    };

    // Register listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socketService.onRoomCreated(onRoomCreated);
    socketService.onRoomJoined(onRoomJoined);
    socketService.onRoomUpdated(onRoomUpdated);
    socketService.onPlayerJoined(onPlayerJoined);
    socketService.onPlayerLeft(onPlayerLeft);
    socketService.onRoomError(onRoomError);
    socketService.onGameStarted(onGameStarted);
    socketService.onGameStateUpdated(onGameStateUpdated);
    socketService.onGameFinished(onGameFinished);
    socketService.onGameError(onGameError);
    socketService.onPlayerReconnected(onPlayerReconnected);
    socketService.onPlayerDisconnected(onPlayerDisconnected);
    socketService.onRoomCodeChanged(onRoomCodeChanged);

    return () => {
      // Cleanup listeners
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socketService.off('room:created', onRoomCreated);
      socketService.off('room:joined', onRoomJoined);
      socketService.off('room:updated', onRoomUpdated);
      socketService.off('room:player-joined', onPlayerJoined);
      socketService.off('room:player-left', onPlayerLeft);
      socketService.off('room:error', onRoomError);
      socketService.off('game:started', onGameStarted);
      socketService.off('game:state-updated', onGameStateUpdated);
      socketService.off('game:finished', onGameFinished);
      socketService.off('game:error', onGameError);
      socketService.off('player:reconnected', onPlayerReconnected);
      socketService.off('player:disconnected', onPlayerDisconnected);
      socketService.off('room:code-changed', onRoomCodeChanged);

      socketService.disconnect();
    };
  }, [setConnected, setPlayerId, setRoom, setGameState, setError]);

  // Actions
  const createRoom = useCallback((playerName: string, maxPlayers: 2 | 3 | 4) => {
    socketService.createRoom(playerName, maxPlayers, user?.image || undefined, user?.email || undefined);
  }, [user?.image, user?.email]);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    socketService.joinRoom(roomId, playerName, user?.image || undefined, user?.email || undefined);
  }, [user?.image, user?.email]);

  const leaveRoom = useCallback(() => {
    if (room) {
      socketService.leaveRoom(room.id);
      setRoom(null);
      setGameState(null);
      localStorage.removeItem('ladrilho-room-id');
      localStorage.removeItem('ladrilho-player-id');
    }
  }, [room, setRoom, setGameState]);

  const startGame = useCallback(() => {
    if (room) {
      socketService.startGame(room.id);
    }
  }, [room]);

  const makeMove = useCallback(
    (move: PlayerMove) => {
      if (room) {
        socketService.makeMove(room.id, move);
      }
    },
    [room]
  );

  const restartGame = useCallback(() => {
    if (room) {
      socketService.restartGame(room.id);
    }
  }, [room]);

  const changeRoomCode = useCallback(
    (newRoomId: string) => {
      if (room) {
        socketService.changeRoomCode(room.id, newRoomId);
      }
    },
    [room]
  );

  // Check for active game and auto-reconnect
  const checkActiveGame = useCallback((playerName: string, onResult: (data: {
    found: boolean;
    roomId?: string;
    playerId?: string;
    gameState?: any;
  }) => void) => {
    socketService.onActiveGameResult(onResult);
    socketService.checkActiveGame(playerName);
  }, []);

  const reconnect = useCallback((roomId: string, playerId: string) => {
    socketService.reconnect(roomId, playerId);
  }, []);

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    makeMove,
    restartGame,
    changeRoomCode,
    checkActiveGame,
    reconnect,
  };
}
