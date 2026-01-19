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
  hostImage?: string
): Room {
  let roomId = generateRoomId();

  // Ensure unique room ID
  while (store.roomExists(roomId)) {
    roomId = generateRoomId();
  }

  const hostPlayer: Player = {
    id: hostId,
    name: hostName,
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
  playerImage?: string
): { success: boolean; room?: Room; error?: string } {
  const room = store.getRoom(roomId);

  if (!room) {
    return { success: false, error: 'Room not found' };
  }

  // Check if player name is already taken or if it's a reconnection
  const existingPlayerIndex = room.gameState.players.findIndex(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (existingPlayerIndex !== -1) {
    const existingPlayer = room.gameState.players[existingPlayerIndex];

    // If player exists and is disconnected, allow functionality to reconnect
    // We allow this even if the game is in progress
    if (!existingPlayer.isConnected) {
      // Update player's ID to the new socket ID
      room.gameState.players[existingPlayerIndex].id = playerId;
      room.gameState.players[existingPlayerIndex].isConnected = true;

      store.updateRoom(roomId, room);

      return { success: true, room };
    }

    // Otherwise name is taken by an active player
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
