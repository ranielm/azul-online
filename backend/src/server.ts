import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/handlers';
import { initDatabase } from './persistence/database';
import { initializeFromDatabase } from './room/store';
import { ExpressAuth, getSession } from '@auth/express';
import { authConfig } from './auth.config';

export async function createServer() {
  // Initialize database and load persisted rooms
  await initDatabase();
  await initializeFromDatabase();

  const app = express();
  const httpServer = createHttpServer(app);

  // Support multiple CORS origins (comma-separated in env var)
  const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const corsOrigins = corsOriginEnv.split(',').map((origin) => origin.trim());

  // CORS configuration for production
  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Check if origin is in allowed list
      if (
        corsOrigins.some(
          (allowed) => origin.startsWith(allowed) || allowed === '*'
        )
      ) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  };

  // Auth.js Middleware
  app.use("/api/auth/*", ExpressAuth(authConfig));

  app.use(cors(corsOptions));
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Active Game Endpoint
  app.get('/api/game/active', async (req, res) => {
    try {
      // @ts-ignore - getSession signature might vary slightly based on version, assuming standard express usage
      const session = await getSession(req, authConfig);

      if (!session || !session.user || !session.user.id) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // We need to access findActiveGameForUser. 
      // Use dynamic import or ensure it is exported from db module
      // imported at top level: import { findActiveGameForUser } from './persistence/database';

      const gameId = await import('./persistence/database').then(m => m.findActiveGameForUser(session.user!.id as string));

      res.json({ gameId });
    } catch (error) {
      console.error('Error fetching active game:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Socket.io setup with same CORS config
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Production-ready settings
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  setupSocketHandlers(io);

  return httpServer;
}
