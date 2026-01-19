import { customAlphabet } from 'nanoid';
import { Room, Player, GameState, PlayerMove } from '../shared/types';
import { ROOM_ID_LENGTH, MIN_PLAYERS } from '../shared/constants';
import * as store from './store';
import { initializeGame, executeMove, processEndOfRound } from '../game/engine';

// Generate URL-friendly room IDs
const generateRoomId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', ROOM_ID_LENGTH);

export function createNewRoom(
  hostId: string,
  hostName: string,
  maxPlayers: 2 | 3 | 4,
  hostImage?: string,
  hostEmail?: string
): Room {
  let roomId = generateRoomId();

  // Ensure unique room ID
  while (store.roomExists(roomId)) {
    roomId = generateRoomId();
  }

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
    email: hostEmail,
    image: hostImage,
    board: {
      patternLines: [],
      wall: [],
      floorLine: [],
      score: 0,
    },
    isConnected: true,
    isHost: true,
  };

  return store.createRoom(roomId, hostPlayer, maxPlayers);
}

export function joinRoom(
  roomId: string,
  playerId: string,
  playerName: string,
  playerImage?: string,
  playerEmail?: string
): { success: boolean; room?: Room; error?: string } {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // IDENTITY LOGIC:
  // 1. Check if this is a REJOIN by email (same user, possibly new socket)
  // 2. Check if name is taken by a DIFFERENT user (collision)

  // First, check for email-based rejoin (authenticated users)
  if (playerEmail) {
    const existingPlayerByEmail = room.gameState.players.findIndex(
      (p) => p.email && p.email.toLowerCase() === playerEmail.toLowerCase()
    );

    if (existingPlayerByEmail !== -1) {
      // REJOIN: Same authenticated user
      room.gameState.players[existingPlayerByEmail].id = playerId;
      room.gameState.players[existingPlayerByEmail].name = playerName; // Allow name update on rejoin
      room.gameState.players[existingPlayerByEmail].image = playerImage;
      room.gameState.players[existingPlayerByEmail].isConnected = true;

      store.updateRoom(roomId, room);
      console.log(`Player ${playerName} (${playerEmail}) rejoined room ${roomId} via email match`);

      return { success: true, room };
    }
  }

  // Check for name collision with OTHER users
  const nameCollision = room.gameState.players.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase() &&
      (!playerEmail || !p.email || p.email.toLowerCase() !== playerEmail.toLowerCase())
  );

  if (nameCollision) {
    // For guests (no email), also check socket-based reconnection
    if (!playerEmail && nameCollision.id !== playerId) {
      const isNewSocket = nameCollision.id !== playerId;
      const canReconnect = !nameCollision.isConnected || isNewSocket;

      if (canReconnect) {
        // Guest reconnection by name
        const idx = room.gameState.players.findIndex(p => p.id === nameCollision.id);
        room.gameState.players[idx].id = playerId;
        room.gameState.players[idx].isConnected = true;

        store.updateRoom(roomId, room);
        console.log(`Guest ${playerName} reconnected to room ${roomId} (socket-based)`);

        return { success: true, room };
      }
    }

    return { success: false, error: 'Name already taken in this room' };
  }

  if (room.gameState.phase !== 'waiting') {
    return { success: false, error: 'Game already in progress' };
  }

  if (room.gameState.players.length >= room.maxPlayers) {
    return { success: false, error: 'Room is full' };
  }

  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    email: playerEmail,
    image: playerImage,
    board: {
      patternLines: [],
      wall: [],
      floorLine: [],
      score: 0,
    },
    isConnected: true,
    isHost: false,
  };

  const updatedRoom = store.addPlayerToRoom(roomId, newPlayer);

  if (!updatedRoom) {
    return { success: false, error: 'Failed to join room' };
  }


  return { success: true, room: updatedRoom };
}

export function leaveRoom(
  roomId: string,
  playerId: string
): { room: Room | null; roomDeleted: boolean } {
  const updatedRoom = store.removePlayerFromRoom(roomId, playerId);
  return {
    room: updatedRoom,
    roomDeleted: updatedRoom === null,
  };
}

export function startGame(roomId: string, playerId: string): {
  success: boolean;
  gameState?: GameState;
  error?: string;
} {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check if player is the host
  const player = room.gameState.players.find((p) => p.id === playerId);
  if (!player?.isHost) {
    return { success: false, error: 'Only the host can start the game' };
  }

  if (room.gameState.players.length < MIN_PLAYERS) {
    return { success: false, error: `Need at least ${MIN_PLAYERS} players to start` };
  }

  if (room.gameState.phase !== 'waiting') {
    return { success: false, error: 'Game already started' };
  }

  const gameState = initializeGame(roomId, room.gameState.players);
  store.updateGameState(roomId, gameState);

  return { success: true, gameState };
}

export function makeMove(
  roomId: string,
  move: PlayerMove
): { success: boolean; gameState?: GameState; error?: string } {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  try {
    let newGameState = executeMove(room.gameState, move);

    // If phase changed to wall-tiling, process it automatically
    if (newGameState.phase === 'wall-tiling') {
      const result = processEndOfRound(newGameState);
      newGameState = result.gameState;
    }

    store.updateGameState(roomId, newGameState);
    return { success: true, gameState: newGameState };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid move',
    };
  }
}

export function restartGame(roomId: string, playerId: string): {
  success: boolean;
  gameState?: GameState;
  error?: string;
} {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check if player is the host
  const player = room.gameState.players.find((p) => p.id === playerId);
  if (!player?.isHost) {
    return { success: false, error: 'Only the host can restart the game' };
  }

  if (room.gameState.phase !== 'finished') {
    return { success: false, error: 'Game is not finished yet' };
  }

  // Keep the same players but reset the game
  const players = room.gameState.players.map((p) => ({
    ...p,
    board: {
      patternLines: [],
      wall: [],
      floorLine: [],
      score: 0,
    },
  }));

  const gameState = initializeGame(roomId, players);
  store.updateGameState(roomId, gameState);

  return { success: true, gameState };
}

export function getRoom(roomId: string): Room | undefined {
  return store.getRoom(roomId);
}

export function findActiveGameByPlayerName(playerName: string) {
  return store.findActiveGameByPlayerName(playerName);
}

export function setPlayerConnection(
  roomId: string,
  playerId: string,
  isConnected: boolean
): Room | null {
  return store.setPlayerConnected(roomId, playerId, isConnected);
}

export function reconnectPlayer(
  roomId: string,
  playerId: string,
  newSocketId: string
): { success: boolean; room?: Room; error?: string } {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Find the player by their original ID
  const playerIndex = room.gameState.players.findIndex((p) => p.id === playerId);
  if (playerIndex === -1) {
    return { success: false, error: 'Player not found in room' };
  }

  // Update player's socket ID and connection status
  room.gameState.players[playerIndex].id = newSocketId;
  room.gameState.players[playerIndex].isConnected = true;

  store.updateRoom(roomId, room);

  return { success: true, room };
}

export function changeRoomCode(
  roomId: string,
  newRoomId: string,
  playerId: string
): { success: boolean; room?: Room; oldRoomId?: string; error?: string } {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check if player is the host
  const player = room.gameState.players.find((p) => p.id === playerId);
  if (!player?.isHost) {
    return { success: false, error: 'Only the host can change the room code' };
  }

  // Can only change code in waiting phase
  if (room.gameState.phase !== 'waiting') {
    return { success: false, error: 'Cannot change room code after game has started' };
  }

  // Validate new room ID format (6 alphanumeric characters)
  const validFormat = /^[A-Z0-9]{6}$/;
  const normalizedNewId = newRoomId.toUpperCase();
  if (!validFormat.test(normalizedNewId)) {
    return { success: false, error: 'Room code must be 6 alphanumeric characters' };
  }

  // Check if new code is already in use
  if (store.roomExists(normalizedNewId)) {
    return { success: false, error: 'Room code already in use' };
  }

  const oldRoomId = roomId;
  const updatedRoom = store.changeRoomId(roomId, normalizedNewId);

  if (!updatedRoom) {
    return { success: false, error: 'Failed to change room code' };
  }

  return { success: true, room: updatedRoom, oldRoomId };
}
