# Ladrilho

A free, open-source online multiplayer implementation of the classic Ladrilho board game.

## Features

- Real-time multiplayer (2-4 players)
- No account required - just nicknames and shareable room links
- Full implementation of classic Ladrilho rules
- Responsive design for desktop and mobile
- Docker support for easy deployment

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/ranielm/ladrilho.git
cd azul-online

# Start with Docker Compose
docker-compose up

# Access the game
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
```

### Manual Setup

**Prerequisites:**
- Node.js 20+
- npm or yarn

```bash
# Clone the repository
git clone https://github.com/ranielm/azul-online.git
cd azul-online

# Install dependencies for shared package
cd packages/shared
npm install
npm run build
cd ../..

# Install and start backend
cd backend
npm install
cp .env.example .env
npm run dev
cd ..

# Install and start frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Project Structure

```
ladrilho/
├── packages/shared/     # Shared TypeScript types and constants
├── backend/             # Node.js + Socket.io server
├── frontend/            # React + TypeScript client
├── docker-compose.yml   # Development Docker setup
└── AZUL_ONLINE.md       # Full project documentation
```

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Socket.io-client, Zustand, Framer Motion
- **Backend:** Node.js, Express, Socket.io, TypeScript
- **DevOps:** Docker, Docker Compose

## Game Rules

See [LADRILHO.md](./LADRILHO.md) for complete game rules and implementation details.

## Deployment

### Render (Backend) + Vercel (Frontend)

1. **Backend on Render:**
   - Create new Web Service
   - Connect repository
   - Build: `cd backend && npm install && npm run build`
   - Start: `cd backend && npm start`
   - Add env: `CORS_ORIGIN=https://your-vercel-url.vercel.app`

2. **Frontend on Vercel:**
   - Import repository
   - Root: `frontend`
   - Add env: `VITE_SOCKET_URL=https://your-render-url.onrender.com`

## License

MIT License - See [LICENSE](./LICENSE) for details.

## Acknowledgments

- Original Azul game by Michael Kiesling
- Published by Plan B Games / Next Move Games
- This is a fan-made project for educational purposes
