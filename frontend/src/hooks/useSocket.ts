import { useEffect, useCallback } from 'react';
import socketService from '../services/socket';
import { useGameStore } from '../store/gameStore';
import { PlayerMove } from '@shared/types';

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

  // Initialize socket connection
  useEffect(() => {
    const socket = socketService.connect();

    socket.on('connect', () => {
      setConnected(true);
      setPlayerId(socket.id || null);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Room events
    socketService.onRoomCreated(({ room, playerId }) => {
      setRoom(room);
      setPlayerId(playerId);
      // Save to session storage for reconnection
      sessionStorage.setItem('azul-room-id', room.id);
      sessionStorage.setItem('azul-player-id', playerId);
    });

    socketService.onRoomJoined(({ room, playerId }) => {
      setRoom(room);
      setPlayerId(playerId);
      sessionStorage.setItem('azul-room-id', room.id);
      sessionStorage.setItem('azul-player-id', playerId);
    });

    socketService.onRoomUpdated(({ room }) => {
      setRoom(room);
    });

    socketService.onPlayerJoined(({ player }) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gameState: {
            ...prev.gameState,
            players: [...prev.gameState.players, player],
          },
        };
      });
    });

    socketService.onPlayerLeft(({ playerId }) => {
      setRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          gameState: {
            ...prev.gameState,
            players: prev.gameState.players.filter((p) => p.id !== playerId),
          },
        };
      });
    });

    socketService.onRoomError(({ message }) => {
      setError(message);
    });

    // Game events
    socketService.onGameStarted(({ gameState }) => {
      setGameState(gameState);
    });

    socketService.onGameStateUpdated(({ gameState }) => {
      setGameState(gameState);
    });

    socketService.onGameFinished(({ gameState }) => {
      setGameState(gameState);
    });

    socketService.onGameError(({ message }) => {
      setError(message);
    });

    // Reconnection
    socketService.onPlayerReconnected(({ gameState }) => {
      setGameState(gameState);
    });

    socketService.onPlayerDisconnected(({ playerId: disconnectedId }) => {
      setGameState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map((p) =>
            p.id === disconnectedId ? { ...p, isConnected: false } : p
          ),
        };
      });
    });

    // Try to reconnect if we have stored session
    const storedRoomId = sessionStorage.getItem('azul-room-id');
    const storedPlayerId = sessionStorage.getItem('azul-player-id');
    if (storedRoomId && storedPlayerId) {
      socketService.reconnect(storedRoomId, storedPlayerId);
    }

    return () => {
      socketService.disconnect();
    };
  }, [setConnected, setPlayerId, setRoom, setGameState, setError]);

  // Actions
  const createRoom = useCallback((playerName: string, maxPlayers: 2 | 3 | 4) => {
    socketService.createRoom(playerName, maxPlayers);
  }, []);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    socketService.joinRoom(roomId, playerName);
  }, []);

  const leaveRoom = useCallback(() => {
    if (room) {
      socketService.leaveRoom(room.id);
      setRoom(null);
      setGameState(null);
      sessionStorage.removeItem('azul-room-id');
      sessionStorage.removeItem('azul-player-id');
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

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    makeMove,
    restartGame,
  };
}
