# Azul Online - Multiplayer Board Game

A free, open-source online implementation of the classic Azul board game with real-time multiplayer support.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Game Rules Implementation](#game-rules-implementation)
- [Data Structures](#data-structures)
- [API & Events](#api--events)
- [Docker Setup](#docker-setup)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [MVP Roadmap](#mvp-roadmap)

---

## Project Overview

### Goals
- Create a fully functional online multiplayer Azul board game
- Support 2-4 players in real-time
- No user accounts required - just nicknames and shareable room links
- Responsive design for desktop and mobile
- Completely free and open-source

### Key Features
- **Room System**: Create/join rooms via shareable links
- **Real-time Gameplay**: Instant synchronization across all players
- **Classic Azul Rules**: Full implementation of the base game
- **Visual Feedback**: Clear UI showing turn status, valid moves, and scores
- **Restart Capability**: Play again with the same group

---

## Tech Stack

### Frontend
| Technology | Purpose | Why |
|------------|---------|-----|
| **React 18** | UI Framework | Component-based, excellent ecosystem, hooks |
| **TypeScript** | Type Safety | Catch errors early, better DX |
| **Vite** | Build Tool | Fast HMR, optimized builds |
| **Socket.io-client** | Real-time Communication | Reliable WebSocket with fallbacks |
| **Tailwind CSS** | Styling | Utility-first, rapid development |
| **Zustand** | State Management | Simple, TypeScript-friendly |
| **React DnD** | Drag & Drop | Tile selection interactions |
| **Framer Motion** | Animations | Smooth tile movements |

### Backend
| Technology | Purpose | Why |
|------------|---------|-----|
| **Node.js 20** | Runtime | JavaScript everywhere, async I/O |
| **Express** | HTTP Server | Minimal, flexible |
| **Socket.io** | WebSocket Server | Room management, broadcasting |
| **TypeScript** | Type Safety | Shared types with frontend |
| **nanoid** | ID Generation | Short, URL-friendly room IDs |
| **Zod** | Validation | Runtime type checking |

### DevOps
| Technology | Purpose | Why |
|------------|---------|-----|
| **Docker** | Containerization | Consistent environments |
| **Docker Compose** | Multi-container | Easy local development |
| **Nginx** | Reverse Proxy | Production-ready serving |
| **GitHub Actions** | CI/CD | Automated testing & deployment |

### Free Deployment Options
| Service | Use Case | Limits |
|---------|----------|--------|
| **Render** | Backend hosting | Free tier with sleep |
| **Vercel** | Frontend hosting | Generous free tier |
| **Railway** | Full-stack | $5 free credit/month |
| **Fly.io** | Backend hosting | Free tier available |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Player 1 │  │ Player 2 │  │ Player 3 │  │ Player 4 │        │
│  │  React   │  │  React   │  │  React   │  │  React   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │                │
│       └─────────────┴──────┬──────┴─────────────┘                │
│                            │                                     │
│                     WebSocket (Socket.io)                        │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                     SERVER │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Socket.io Server                      │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ Room Manager│  │ Game Engine │  │ Event Handler│      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   In-Memory Store                        │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │    │
│  │  │ Room A  │  │ Room B  │  │ Room C  │  │ Room D  │    │    │
│  │  │GameState│  │GameState│  │GameState│  │GameState│    │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Player Action → Client Validation → Socket Event → Server Validation
    → Game Logic → State Update → Broadcast to Room → UI Update
```

---

## Project Structure

```
azul-online/
├── docker-compose.yml          # Multi-container orchestration
├── docker-compose.prod.yml     # Production configuration
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── packages/
│   └── shared/                 # Shared TypeScript types
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types.ts        # Game types
│           ├── constants.ts    # Game constants
│           └── validation.ts   # Shared validation
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Entry point
│       ├── server.ts           # Express + Socket.io setup
│       ├── game/
│       │   ├── engine.ts       # Core game logic
│       │   ├── validation.ts   # Move validation
│       │   ├── scoring.ts      # Score calculation
│       │   └── setup.ts        # Game initialization
│       ├── room/
│       │   ├── manager.ts      # Room CRUD operations
│       │   └── store.ts        # In-memory storage
│       ├── socket/
│       │   ├── handlers.ts     # Event handlers
│       │   └── events.ts       # Event definitions
│       └── utils/
│           └── helpers.ts      # Utility functions
└── frontend/
    ├── Dockerfile
    ├── nginx.conf              # Production nginx config
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.tsx            # Entry point
        ├── App.tsx             # Root component
        ├── vite-env.d.ts
        ├── components/
        │   ├── Board/
        │   │   ├── Board.tsx           # Player board
        │   │   ├── PatternLines.tsx    # Left preparation area
        │   │   ├── Wall.tsx            # 5x5 mosaic
        │   │   ├── FloorLine.tsx       # Penalty area
        │   │   └── ScoreTrack.tsx      # Score display
        │   ├── Factory/
        │   │   ├── Factory.tsx         # Single factory
        │   │   ├── FactoryDisplay.tsx  # All factories
        │   │   └── CenterPool.tsx      # Center tiles
        │   ├── Tile/
        │   │   ├── Tile.tsx            # Single tile
        │   │   └── TileStack.tsx       # Grouped tiles
        │   ├── Room/
        │   │   ├── CreateRoom.tsx      # Room creation
        │   │   ├── JoinRoom.tsx        # Join via link
        │   │   ├── Lobby.tsx           # Waiting room
        │   │   └── PlayerList.tsx      # Player roster
        │   ├── Game/
        │   │   ├── GameBoard.tsx       # Main game view
        │   │   ├── TurnIndicator.tsx   # Current player
        │   │   ├── ActionLog.tsx       # Move history
        │   │   └── GameOver.tsx        # End screen
        │   └── UI/
        │       ├── Button.tsx
        │       ├── Modal.tsx
        │       ├── Toast.tsx
        │       └── Loading.tsx
        ├── hooks/
        │   ├── useSocket.ts            # Socket connection
        │   ├── useGame.ts              # Game state
        │   └── useRoom.ts              # Room management
        ├── store/
        │   ├── gameStore.ts            # Zustand game store
        │   └── uiStore.ts              # UI state
        ├── services/
        │   └── socket.ts               # Socket.io client
        ├── utils/
        │   ├── gameHelpers.ts          # Game utilities
        │   └── colors.ts               # Tile color mappings
        └── styles/
            └── globals.css             # Global styles
```

---

## Game Rules Implementation

### Azul Classic Rules

#### Components
- **100 tiles**: 20 of each color (blue, yellow, red, black, white)
- **Factories**: 5 (2 players), 7 (3 players), 9 (4 players)
- **Player board**: Pattern lines (5 rows) + Wall (5x5 mosaic) + Floor line

#### Game Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME ROUND                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. FACTORY OFFER PHASE                                         │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ For each player in turn order:                        │    │
│     │   - Pick ALL tiles of ONE color from:                 │    │
│     │     • A factory (remaining go to center)              │    │
│     │     • The center pool                                 │    │
│     │   - First to pick from center takes first-player tile │    │
│     │   - Place tiles in ONE pattern line OR floor          │    │
│     └──────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  2. WALL-TILING PHASE (when all tiles picked)                   │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ For each player:                                      │    │
│     │   - Move rightmost tile from COMPLETE rows to wall    │    │
│     │   - Score each placed tile + adjacency bonuses        │    │
│     │   - Remaining tiles from row go to discard            │    │
│     │   - Apply floor line penalties                        │    │
│     │   - Clear floor line                                  │    │
│     └──────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  3. CHECK END CONDITION                                          │
│     ┌──────────────────────────────────────────────────────┐    │
│     │ If any player has completed horizontal row on wall:   │    │
│     │   → END GAME, calculate final bonuses                 │    │
│     │ Else:                                                 │    │
│     │   → REFILL factories, start new round                 │    │
│     └──────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Scoring System

```typescript
// Per-tile scoring during wall-tiling phase
Base score: 1 point per tile

Adjacency bonus:
  - +1 for each horizontally connected tile
  - +1 for each vertically connected tile
  - If tile connects both ways, count both bonuses

// Floor line penalties
Position:  1   2   3   4   5   6   7+
Penalty:  -1  -1  -2  -2  -2  -3  -3

// End-game bonuses
Complete horizontal row: +2 points
Complete vertical column: +7 points
All 5 of one color placed: +10 points
```

#### Wall Pattern (Fixed)

```
Row 0: Blue   Yellow Red    Black  White
Row 1: White  Blue   Yellow Red    Black
Row 2: Black  White  Blue   Yellow Red
Row 3: Red    Black  White  Blue   Yellow
Row 4: Yellow Red    Black  White  Blue
```

---

## Data Structures

### Shared Types (`packages/shared/src/types.ts`)

```typescript
// Tile colors
export type TileColor = 'blue' | 'yellow' | 'red' | 'black' | 'white';

// All tile types including first player marker
export type Tile = TileColor | 'first-player';

// Factory containing 0-4 tiles
export type Factory = TileColor[];

// Center pool with tiles and possibly first-player marker
export interface CenterPool {
  tiles: TileColor[];
  hasFirstPlayer: boolean;
}

// Pattern line (preparation area row)
export interface PatternLine {
  color: TileColor | null;  // null if empty
  count: number;            // 0 to row capacity
  capacity: number;         // 1-5 based on row index
}

// Wall cell
export interface WallCell {
  color: TileColor;         // Fixed by wall pattern
  filled: boolean;          // Whether tile is placed
}

// Player board state
export interface PlayerBoard {
  patternLines: PatternLine[];  // 5 rows
  wall: WallCell[][];           // 5x5 grid
  floorLine: Tile[];            // 0-7 tiles
  score: number;                // Current score
}

// Player in a game
export interface Player {
  id: string;                   // Socket ID
  name: string;                 // Display name
  board: PlayerBoard;
  isConnected: boolean;
  isHost: boolean;
}

// Game phases
export type GamePhase =
  | 'waiting'      // In lobby, waiting for players
  | 'playing'      // Factory offer phase
  | 'wall-tiling'  // Automatic wall-tiling phase
  | 'finished';    // Game over

// Full game state
export interface GameState {
  id: string;                   // Room ID
  players: Player[];
  factories: Factory[];
  centerPool: CenterPool;
  bag: TileColor[];             // Draw bag
  discard: TileColor[];         // Discard pile
  currentPlayerIndex: number;
  firstPlayerIndex: number;     // For next round
  phase: GamePhase;
  round: number;
  winner: string | null;        // Player ID
}

// Room metadata
export interface Room {
  id: string;
  createdAt: Date;
  gameState: GameState;
  maxPlayers: 2 | 3 | 4;
}

// Player move action
export interface TileSelection {
  source: 'factory' | 'center';
  factoryIndex?: number;        // If from factory
  color: TileColor;
}

export interface TilePlacement {
  destination: 'pattern-line' | 'floor';
  patternLineIndex?: number;    // If to pattern line (0-4)
}

export interface PlayerMove {
  playerId: string;
  selection: TileSelection;
  placement: TilePlacement;
}
```

### Constants (`packages/shared/src/constants.ts`)

```typescript
export const TILE_COLORS: TileColor[] = ['blue', 'yellow', 'red', 'black', 'white'];

export const TILES_PER_COLOR = 20;
export const TOTAL_TILES = 100;
export const TILES_PER_FACTORY = 4;

export const FACTORIES_BY_PLAYER_COUNT: Record<number, number> = {
  2: 5,
  3: 7,
  4: 9,
};

export const WALL_PATTERN: TileColor[][] = [
  ['blue', 'yellow', 'red', 'black', 'white'],
  ['white', 'blue', 'yellow', 'red', 'black'],
  ['black', 'white', 'blue', 'yellow', 'red'],
  ['red', 'black', 'white', 'blue', 'yellow'],
  ['yellow', 'red', 'black', 'white', 'blue'],
];

export const FLOOR_PENALTIES = [-1, -1, -2, -2, -2, -3, -3];

export const BONUS_COMPLETE_ROW = 2;
export const BONUS_COMPLETE_COLUMN = 7;
export const BONUS_COMPLETE_COLOR = 10;

export const MAX_FLOOR_TILES = 7;
export const PATTERN_LINE_COUNT = 5;
export const WALL_SIZE = 5;

export const ROOM_ID_LENGTH = 6;
export const MAX_PLAYER_NAME_LENGTH = 20;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;
```

---

## API & Events

### Socket.io Events

#### Client → Server

```typescript
// Room events
'room:create'     → { playerName: string, maxPlayers: 2|3|4 }
'room:join'       → { roomId: string, playerName: string }
'room:leave'      → { roomId: string }

// Game events
'game:start'      → { roomId: string }
'game:move'       → { roomId: string, move: PlayerMove }
'game:restart'    → { roomId: string }

// Connection events
'player:reconnect' → { roomId: string, playerId: string }
```

#### Server → Client

```typescript
// Room events
'room:created'    → { room: Room }
'room:joined'     → { room: Room, playerId: string }
'room:updated'    → { room: Room }
'room:player-joined' → { player: Player }
'room:player-left'   → { playerId: string }
'room:error'      → { message: string }

// Game events
'game:started'    → { gameState: GameState }
'game:state-updated' → { gameState: GameState }
'game:move-made'  → { move: PlayerMove, gameState: GameState }
'game:phase-changed' → { phase: GamePhase }
'game:round-ended'   → { gameState: GameState, roundScores: RoundScore[] }
'game:finished'   → { gameState: GameState, finalScores: FinalScore[] }
'game:error'      → { message: string }

// Connection events
'player:reconnected' → { gameState: GameState }
'player:disconnected' → { playerId: string }
```

### REST Endpoints (Optional - for room info)

```
GET  /api/health           → { status: 'ok' }
GET  /api/room/:id         → { room: Room } | { error: 'not found' }
GET  /api/room/:id/exists  → { exists: boolean }
```

---

## Docker Setup

### docker-compose.yml (Development)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: development
    ports:
      - "3001:3001"
    volumes:
      - ./backend/src:/app/src
      - ./packages/shared:/app/packages/shared
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - PORT=3001
      - CORS_ORIGIN=http://localhost:5173
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      target: development
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./packages/shared:/app/packages/shared
      - /app/node_modules
    environment:
      - VITE_SOCKET_URL=http://localhost:3001
    depends_on:
      - backend
    command: npm run dev -- --host

  # Optional: Nginx for production-like testing
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.dev.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - backend
      - frontend
    profiles:
      - proxy
```

### Backend Dockerfile

```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# Development stage
FROM base AS development
COPY package*.json ./
COPY packages/shared ./packages/shared
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY package*.json ./
COPY packages/shared ./packages/shared
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist
EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile

```dockerfile
# Base stage
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# Development stage
FROM base AS development
COPY package*.json ./
COPY packages/shared ./packages/shared
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

# Build stage
FROM base AS build
ARG VITE_SOCKET_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
COPY package*.json ./
COPY packages/shared ./packages/shared
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Running with Docker

```bash
# Development (with hot reload)
docker-compose up

# Development with nginx proxy
docker-compose --profile proxy up

# Production build
docker-compose -f docker-compose.prod.yml up --build

# Rebuild specific service
docker-compose up --build backend

# View logs
docker-compose logs -f backend

# Run tests
docker-compose exec backend npm test
docker-compose exec frontend npm test
```

---

## Development Guide

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Local Setup (Without Docker)

```bash
# Clone repository
git clone https://github.com/yourusername/azul-online.git
cd azul-online

# Install dependencies
npm install

# Build shared package
cd packages/shared && npm run build && cd ../..

# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### Local Setup (With Docker)

```bash
# Clone and start
git clone https://github.com/yourusername/azul-online.git
cd azul-online
docker-compose up

# Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001
```

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_SOCKET_URL=http://localhost:3001
```

### Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests (if configured)
npm run test:e2e
```

---

## Deployment

### Option 1: Render (Recommended for Backend)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend-url.vercel.app`

### Option 2: Vercel (Recommended for Frontend)

1. Import your GitHub repository
2. Set root directory: `frontend`
3. Framework preset: Vite
4. Add environment variable:
   - `VITE_SOCKET_URL=https://your-backend-url.onrender.com`

### Option 3: Railway (Full Stack)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Option 4: Fly.io (Backend)

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
cd backend
fly launch
fly deploy
```

---

## MVP Roadmap

### Phase 1: Foundation (Week 1)
- [x] Project documentation
- [ ] Project structure setup
- [ ] Docker configuration
- [ ] Shared types package
- [ ] Basic Express + Socket.io server
- [ ] Basic React + Vite frontend

### Phase 2: Room System (Week 2)
- [ ] Room creation with unique IDs
- [ ] Join room via link
- [ ] Player nickname system
- [ ] Lobby UI with player list
- [ ] Host controls (start game)

### Phase 3: Core Game Logic (Week 3)
- [ ] Game initialization (bag, factories)
- [ ] Tile selection from factories
- [ ] Tile selection from center
- [ ] Pattern line placement
- [ ] Floor line placement
- [ ] Move validation

### Phase 4: Scoring & Phases (Week 4)
- [ ] Wall-tiling phase automation
- [ ] Per-tile scoring with adjacency
- [ ] Floor line penalties
- [ ] Round transition
- [ ] End game detection
- [ ] Final bonus calculation

### Phase 5: UI Polish (Week 5)
- [ ] Responsive design
- [ ] Tile drag & drop
- [ ] Turn indicator
- [ ] Score animations
- [ ] Game over screen
- [ ] Play again functionality

### Phase 6: Testing & Launch (Week 6)
- [ ] Unit tests for game logic
- [ ] Integration tests for Socket.io
- [ ] Playtesting with friends
- [ ] Bug fixes
- [ ] Production deployment
- [ ] Documentation updates

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Original Azul game by Michael Kiesling
- Published by Plan B Games / Next Move Games
- This is a fan-made project for educational purposes

---

**Ready to play? Start building!** 🎯

---

## Online Multiplayer Architecture (Definitive)

### Online Multiplayer Requirement (Mandatory)

This project is designed as a **true online multiplayer game**, not a local or shared-device experience.

Players must be able to:
- Join the same game **from different physical locations**
- Use **different networks, devices, and browsers**
- Play together **simultaneously in real time**

There is **no local-only mode** in the MVP. All gameplay is synchronized through an online server.

> *Azul Online is a fully online multiplayer game, designed for players connecting remotely over the internet, with a server-authoritative architecture ensuring fair play, synchronization, and scalability.*

### Client-Server Architecture

- The game uses a **central authoritative server**
- Each player connects remotely via the internet
- The server owns and validates:
  - Game state
  - Turn order
  - Rule enforcement
  - Scoring
  - End-game conditions

Clients are **never allowed** to modify game state directly.

### Online Connectivity

**Communication Layer:**
- WebSocket-based real-time communication
- Socket.io over HTTPS/WSS
- Persistent connection per player session

**Why WebSockets:**
- Low latency
- Instant state propagation
- Ideal for turn-based but synchronous gameplay
- Works reliably across browsers and networks

### Online Game Flow

1. **Room Creation (Online)**
   - One player creates a room on the server
   - A unique room ID and URL are generated
   - The link is shared with remote players

2. **Remote Player Join**
   - Players join from different locations
   - Nickname is chosen
   - Server assigns a unique player ID
   - Connection status is tracked

3. **Online Synchronization**
   - All players receive the same authoritative game state
   - Any action by one player is validated server-side
   - Updates are broadcast instantly to all connected clients

4. **Turn Enforcement**
   - Only the active player can perform actions
   - Other players' UIs are locked during that turn
   - Invalid or late actions are rejected

### Connection Reliability

**Disconnect Handling:**
- Temporary disconnections are tolerated
- Player can reconnect using Room ID and Session token
- Game state is restored on reconnect

**Failure Scenarios:**
- Player disconnects mid-turn: turn pauses or auto-resolves
- Player leaves permanently: game can pause, continue with AI, or end by consensus

### Security & Fair Play

- All actions validated server-side
- No trust in client-side calculations
- Anti-spam and rate limiting on socket events
- Sanitized inputs for nicknames and messages

### Scalability

- Each room runs as an isolated game instance
- Multiple rooms can run concurrently
- Stateless backend endpoints + in-memory or Redis-based game state
- Horizontally scalable architecture

### Commercial Readiness

This architecture supports:
- Public matchmaking
- Private invite-only rooms
- Ranked online play
- Spectator mode
- Replays and analytics
- Monetization features (cosmetics, premium rooms)
