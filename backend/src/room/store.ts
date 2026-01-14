import { Room, GameState, Player } from '../shared/types';
import {
  saveRoom,
  deleteRoomFromDb,
  loadAllRooms,
  cleanupStaleRoomsFromDb,
} from '../persistence/database';

// In-memory store for rooms
const rooms: Map<string, Room> = new Map();

// 48 hours in milliseconds
const ROOM_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export async function initializeFromDatabase(): Promise<void> {
  const persistedRooms = await loadAllRooms();

  for (const room of persistedRooms) {
    // Mark all players as disconnected (server restarted)
    room.gameState.players.forEach((p) => (p.isConnected = false));
    rooms.set(room.id, room);
  }

  console.log(`Loaded ${persistedRooms.length} rooms from database`);
}

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
  // Fire and forget - don't block on DB save
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function updateRoom(id: string, room: Room): void {
  rooms.set(id, room);
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
}

export function deleteRoom(id: string): void {
  rooms.delete(id);
  deleteRoomFromDb(id).catch((err) =>
    console.error('Failed to delete room from DB:', err)
  );
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
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
  return room;
}

export function removePlayerFromRoom(
  roomId: string,
  playerId: string
): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.gameState.players = room.gameState.players.filter(
    (p) => p.id !== playerId
  );

  // If room is empty, delete it
  if (room.gameState.players.length === 0) {
    rooms.delete(roomId);
    deleteRoomFromDb(roomId).catch((err) =>
      console.error('Failed to delete room from DB:', err)
    );
    return null;
  }

  // If the host left, assign a new host
  const hasHost = room.gameState.players.some((p) => p.isHost);
  if (!hasHost && room.gameState.players.length > 0) {
    room.gameState.players[0].isHost = true;
  }

  rooms.set(roomId, room);
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
  return room;
}

export function updateGameState(
  roomId: string,
  gameState: GameState
): Room | null {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.gameState = gameState;
  rooms.set(roomId, room);
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
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
  saveRoom(room).catch((err) => console.error('Failed to save room:', err));
  return room;
}

export function getAllRooms(): Room[] {
  return Array.from(rooms.values());
}

// Clean up stale rooms (no activity for 48 hours with all players disconnected)
export async function cleanupStaleRooms(): Promise<void> {
  const cutoffTime = new Date(Date.now() - ROOM_MAX_AGE_MS);

  for (const [id, room] of rooms.entries()) {
    if (room.createdAt < cutoffTime) {
      // Check if all players are disconnected
      const allDisconnected = room.gameState.players.every(
        (p) => !p.isConnected
      );
      if (allDisconnected) {
        rooms.delete(id);
        await deleteRoomFromDb(id);
        console.log(`Cleaned up stale room: ${id}`);
      }
    }
  }

  // Also cleanup from database directly (in case of missed in-memory rooms)
  const cleaned = await cleanupStaleRoomsFromDb(ROOM_MAX_AGE_MS);
  if (cleaned > 0) {
    console.log(`Cleaned up ${cleaned} stale rooms from database`);
  }
}

// Run cleanup every 15 minutes
setInterval(() => {
  cleanupStaleRooms().catch((err) =>
    console.error('Failed to cleanup stale rooms:', err)
  );
}, 15 * 60 * 1000);
