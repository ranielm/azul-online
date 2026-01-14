import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { Room } from '../shared/types';

const DB_PATH = process.env.DB_PATH || './data/azul.db';
let db: Database.Database | null = null;

interface RoomRow {
  id: string;
  data: string;
  created_at: number;
  updated_at: number;
}

export function initDatabase(): void {
  // Create directory if it doesn't exist
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rooms_updated_at ON rooms(updated_at);
  `);

  console.log(`Database initialized at ${DB_PATH}`);
}

export function saveRoom(room: Room): void {
  if (!db) {
    console.warn('Database not initialized, skipping save');
    return;
  }

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO rooms (id, data, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  const createdAt = room.createdAt instanceof Date
    ? room.createdAt.getTime()
    : new Date(room.createdAt).getTime();

  stmt.run(room.id, JSON.stringify(room), createdAt, Date.now());
}

export function loadRoom(id: string): Room | null {
  if (!db) {
    console.warn('Database not initialized');
    return null;
  }

  const stmt = db.prepare('SELECT data FROM rooms WHERE id = ?');
  const row = stmt.get(id) as RoomRow | undefined;

  if (!row) return null;

  const room = JSON.parse(row.data) as Room;
  room.createdAt = new Date(room.createdAt);
  return room;
}

export function deleteRoomFromDb(id: string): void {
  if (!db) {
    console.warn('Database not initialized');
    return;
  }

  const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
  stmt.run(id);
}

export function loadAllRooms(): Room[] {
  if (!db) {
    console.warn('Database not initialized');
    return [];
  }

  const stmt = db.prepare('SELECT data FROM rooms');
  const rows = stmt.all() as RoomRow[];

  return rows.map(row => {
    const room = JSON.parse(row.data) as Room;
    room.createdAt = new Date(room.createdAt);
    return room;
  });
}

export function cleanupStaleRoomsFromDb(maxAgeMs: number): number {
  if (!db) {
    console.warn('Database not initialized');
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
