import { createClient, Client } from '@libsql/client';
import { Room, GameState } from '../shared/types';

export let db: Client | null = null;

interface RoomRow {
  id: string;
  data: string;
  created_at: number;
  updated_at: number;
}

export async function initDatabase(): Promise<void> {
  // Use environment variables or fallback to local file for dev
  const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.warn('Turso credentials not configured. Persistence disabled.');
    return;
  }

  try {
    db = createClient({
      url,
      authToken,
    });

    // Create existing tables
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

    // Create Auth.js Tables
    await db.execute(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      emailVerified DATETIME,
      image TEXT
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      provider TEXT NOT NULL,
      providerAccountId TEXT NOT NULL,
      refresh_token TEXT,
      access_token TEXT,
      expires_at INTEGER,
      token_type TEXT,
      scope TEXT,
      id_token TEXT,
      session_state TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(provider, providerAccountId)
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      sessionToken TEXT UNIQUE NOT NULL,
      userId TEXT NOT NULL,
      expires DATETIME NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Required by Auth.js for PKCE verification
    await db.execute(`CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier TEXT NOT NULL,
      token TEXT NOT NULL UNIQUE,
      expires DATETIME NOT NULL,
      PRIMARY KEY (identifier, token)
    )`);

    // Create Game Persistence Tables
    await db.execute(`CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'WAITING',
      state TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.execute(`CREATE TABLE IF NOT EXISTS game_participants (
      game_session_id TEXT NOT NULL,
      user_id TEXT,
      socket_id TEXT,
      is_host BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    console.log('Turso database initialized with Auth & Game tables');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null; // Disable DB if init fails
  }
}

export async function saveGameState(gameState: GameState) {
  if (!db) return;
  try {
    const stateJson = JSON.stringify(gameState);
    const now = new Date().toISOString();
    const status = gameState.phase === 'finished' ? 'FINISHED' : 'PLAYING';

    await db.execute({
      sql: `
          INSERT INTO game_sessions (id, status, state, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            status = excluded.status,
            state = excluded.state,
            updated_at = excluded.updated_at
        `,
      args: [gameState.id, status, stateJson, now]
    });
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function loadGameState(gameId: string): Promise<GameState | null> {
  if (!db) return null;
  try {
    const result = await db.execute({
      sql: 'SELECT state FROM game_sessions WHERE id = ?',
      args: [gameId]
    });
    if (result.rows.length === 0) return null;
    return JSON.parse(result.rows[0].state as string) as GameState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export async function findActiveGameForUser(userId: string): Promise<string | null> {
  if (!db) return null;
  try {
    const result = await db.execute({
      sql: `
          SELECT gs.id 
          FROM game_sessions gs
          JOIN game_participants gp ON gs.id = gp.game_session_id
          WHERE gp.user_id = ? AND gs.status = 'PLAYING'
          ORDER BY gs.updated_at DESC
          LIMIT 1
        `,
      args: [userId]
    });
    return result.rows.length > 0 ? result.rows[0].id as string : null;
  } catch (error) {
    console.error('Failed to find active game:', error);
    return null;
  }
}

export async function addParticipant(gameId: string, userId: string, isHost: boolean = false) {
  if (!db) return;
  try {
    await db.execute({
      sql: `INSERT INTO game_participants (game_session_id, user_id, is_host) VALUES (?, ?, ?)`,
      args: [gameId, userId, isHost]
    });
  } catch (error) {
    // Ignore duplicate participants
    // console.error('Failed to add participant:', error);
  }
}

// ... existing Room functions ...

export async function saveRoom(room: Room): Promise<void> {
  if (!db) return;
  const createdAt = room.createdAt instanceof Date ? room.createdAt.getTime() : new Date(room.createdAt).getTime();
  await db.execute({
    sql: `INSERT OR REPLACE INTO rooms (id, data, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    args: [room.id, JSON.stringify(room), createdAt, Date.now()],
  });
}

export async function loadRoom(id: string): Promise<Room | null> {
  if (!db) return null;
  const result = await db.execute({ sql: 'SELECT data FROM rooms WHERE id = ?', args: [id] });
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as unknown as RoomRow;
  const room = JSON.parse(row.data) as Room;
  room.createdAt = new Date(room.createdAt);
  return room;
}

export async function deleteRoomFromDb(id: string): Promise<void> {
  if (!db) return;
  await db.execute({ sql: 'DELETE FROM rooms WHERE id = ?', args: [id] });
}

export async function loadAllRooms(): Promise<Room[]> {
  if (!db) return [];
  const result = await db.execute('SELECT data FROM rooms');
  return result.rows.map((row) => {
    const roomRow = row as unknown as RoomRow;
    const room = JSON.parse(roomRow.data) as Room;
    room.createdAt = new Date(room.createdAt);
    return room;
  });
}

export async function cleanupStaleRoomsFromDb(maxAgeMs: number): Promise<number> {
  if (!db) return 0;
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

