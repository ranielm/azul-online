import Database from 'better-sqlite3';
import { Room } from '../shared/types';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

interface RoomRow {
  id: string;
  data: string;
  created_at: number;
  updated_at: number;
}

export async function initDatabase(): Promise<void> {
  // Use environment variable or default to local file
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'azul.db');

  // Ensure data directory exists
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at)
  `);

  console.log(`SQLite database initialized at ${dbPath}`);
}

export async function saveRoom(room: Room): Promise<void> {
  if (!db) {
    return;
  }

  const createdAt =
    room.createdAt instanceof Date
      ? room.createdAt.getTime()
      : new Date(room.createdAt).getTime();

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO rooms (id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(room.id, JSON.stringify(room), createdAt, Date.now());
}

export async function loadRoom(id: string): Promise<Room | null> {
  if (!db) {
    return null;
  }

  const stmt = db.prepare('SELECT data FROM rooms WHERE id = ?');
  const row = stmt.get(id) as RoomRow | undefined;

  if (!row) return null;

  const room = JSON.parse(row.data) as Room;
  room.createdAt = new Date(room.createdAt);
  return room;
}

export async function deleteRoomFromDb(id: string): Promise<void> {
  if (!db) {
    return;
  }

  const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
  stmt.run(id);
}

export async function loadAllRooms(): Promise<Room[]> {
  if (!db) {
    return [];
  }

  const stmt = db.prepare('SELECT data FROM rooms');
  const rows = stmt.all() as RoomRow[];

  return rows.map((row) => {
    const room = JSON.parse(row.data) as Room;
    room.createdAt = new Date(room.createdAt);
    return room;
  });
}

export async function cleanupStaleRoomsFromDb(maxAgeMs: number): Promise<number> {
  if (!db) {
    return 0;
  }

  const cutoff = Date.now() - maxAgeMs;
  const stmt = db.prepare('DELETE FROM rooms WHERE updated_at < ?');
  const result = stmt.run(cutoff);

  return result.changes;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}
