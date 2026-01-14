import { Room, GameState, Player } from '../shared/types';

// In-memory store for rooms
const rooms: Map<string, Room> = new Map();

export function createRoom(
  id: string,
  hostPlayer: Player,
  maxPlayers: 2 | 3 | 4
): Room {
  const initialGameState: GameState = {
    id,
    players: [hostPlayer],
    factories: [],
    centerPool: { tiles: [], hasFirstPlayer: true },
    bag: [],
    discard: [],
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    phase: 'waiting',
    round: 0,
    winner: null,
  };

  const room: Room = {
    id,
    createdAt: new Date(),
    gameState: initialGameState,
    maxPlayers,
  };

  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function updateRoom(id: string, room: Room): void {
  rooms.set(id, room);
}

export function deleteRoom(id: string): void {
  rooms.delete(id);
}

export function roomExists(id: string): boolean {
  return rooms.has(id);
}

export function addPlayerToRoom(roomId: string, player: Player): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  if (room.gameState.players.length >= room.maxPlayers) {
    return null;
  }

  if (room.gameState.phase !== 'waiting') {
    return null;
  }

  room.gameState.players.push(player);
  rooms.set(roomId, room);
  return room;
}

export function removePlayerFromRoom(roomId: string, playerId: string): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.gameState.players = room.gameState.players.filter((p) => p.id !== playerId);

  // If room is empty, delete it
  if (room.gameState.players.length === 0) {
    rooms.delete(roomId);
    return null;
  }

  // If the host left, assign a new host
  const hasHost = room.gameState.players.some((p) => p.isHost);
  if (!hasHost && room.gameState.players.length > 0) {
    room.gameState.players[0].isHost = true;
  }

  rooms.set(roomId, room);
  return room;
}

export function updateGameState(roomId: string, gameState: GameState): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.gameState = gameState;
  rooms.set(roomId, room);
  return room;
}

export function setPlayerConnected(
  roomId: string,
  playerId: string,
  isConnected: boolean
): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  const player = room.gameState.players.find((p) => p.id === playerId);
  if (player) {
    player.isConnected = isConnected;
  }

  rooms.set(roomId, room);
  return room;
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

// Clean up stale rooms (no activity for 1 hour)
export function cleanupStaleRooms(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  for (const [id, room] of rooms.entries()) {
    if (room.createdAt < oneHourAgo) {
      // Check if all players are disconnected
      const allDisconnected = room.gameState.players.every((p) => !p.isConnected);
      if (allDisconnected) {
        rooms.delete(id);
        console.log(`Cleaned up stale room: ${id}`);
      }
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupStaleRooms, 15 * 60 * 1000);
