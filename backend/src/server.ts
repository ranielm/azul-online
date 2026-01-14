import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocketHandlers } from './socket/handlers';
import { initDatabase } from './persistence/database';
import { initializeFromDatabase } from './room/store';

export function createServer() {
  // Initialize database and load persisted rooms
  initDatabase();
  initializeFromDatabase();

  const app = express();
  const httpServer = createHttpServer(app);

  // Support multiple CORS origins (comma-separated in env var)
  const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const corsOrigins = corsOriginEnv.split(',').map(origin => origin.trim());

  // CORS configuration for production
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Check if origin is in allowed list
      if (corsOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  };

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
