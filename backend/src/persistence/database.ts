import { createClient, Client } from '@libsql/client';
import { Room } from '../shared/types';

let db: Client | null = null;

interface RoomRow {
  id: string;
  data: string;
  created_at: number;
  updated_at: number;
}

export async function initDatabase(): Promise<void> {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.warn('Turso credentials not configured. Database persistence disabled.');
    console.warn('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.');
    return;
  }

  db = createClient({
    url,
    authToken,
  });

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at)
  `);

  console.log('Turso database initialized');
}

export async function saveRoom(room: Room): Promise<void> {
  if (!db) {
    return;
  }

  const createdAt =
    room.createdAt instanceof Date
      ? room.createdAt.getTime()
      : new Date(room.createdAt).getTime();

  await db.execute({
    sql: `INSERT OR REPLACE INTO rooms (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    args: [room.id, JSON.stringify(room), createdAt, Date.now()],
  });
}

export async function loadRoom(id: string): Promise<Room | null> {
  if (!db) {
    return null;
  }

  const result = await db.execute({
    sql: 'SELECT data FROM rooms WHERE id = ?',
    args: [id],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0] as unknown as RoomRow;
  const room = JSON.parse(row.data) as Room;
  room.createdAt = new Date(room.createdAt);
  return room;
}

export async function deleteRoomFromDb(id: string): Promise<void> {
  if (!db) {
    return;
  }

  await db.execute({
    sql: 'DELETE FROM rooms WHERE id = ?',
    args: [id],
  });
}

export async function loadAllRooms(): Promise<Room[]> {
  if (!db) {
    return [];
  }

  const result = await db.execute('SELECT data FROM rooms');

  return result.rows.map((row) => {
    const roomRow = row as unknown as RoomRow;
    const room = JSON.parse(roomRow.data) as Room;
    room.createdAt = new Date(room.createdAt);
    return room;
  });
}

export async function cleanupStaleRoomsFromDb(maxAgeMs: number): Promise<number> {
  if (!db) {
    return 0;
  }

  const cutoff = Date.now() - maxAgeMs;
  const result = await db.execute({
    sql: 'DELETE FROM rooms WHERE updated_at < ?',
    args: [cutoff],
  });

  return result.rowsAffected;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
