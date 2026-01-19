# LADRILHO: Initial Implementation

**Date:** 2026-01-13

## Changes:

- `packages/shared/`: Shared TypeScript types, constants, and validation logic
- `backend/src/`: Node.js + Socket.io server with game engine, room management, and socket handlers
- `frontend/src/`: React + TypeScript client with components for game board, factories, rooms, and UI
- `docker-compose.yml`: Development Docker configuration with hot reload
- `docker-compose.prod.yml`: Production Docker configuration
- `AZUL_ONLINE.md`: Comprehensive project documentation

## Summary:

Complete implementation of Azul Online, a multiplayer board game prototype. The project includes a full-stack architecture with React/TypeScript frontend using Vite, Tailwind CSS, and Framer Motion for the UI, and a Node.js backend using Express and Socket.io for real-time gameplay. Features include room creation/joining via shareable links, 2-4 player support, complete Azul game rules with tile selection from factories/center, pattern line placement, wall-tiling scoring, and end-game bonuses. Docker Compose configurations enable easy local development and production deployment.

---

# AZUL-ONLINE: Import Path Fix & Online Architecture Docs

**Date:** 2026-01-13

## Changes:

- `frontend/src/**/*.tsx`: Fixed all imports to use @shared alias instead of relative paths
- `frontend/src/App.tsx`: Updated TileSelection import path
- `frontend/src/components/Board/FloorLine.tsx`: Fixed imports for types and constants
- `AZUL_ONLINE.md`: Added comprehensive Online Multiplayer Architecture section
- `package-lock.json` files: Added for reproducible builds

## Summary:

Fixed Vite build errors caused by incorrect relative import paths in frontend components. All imports now use the @shared alias configured in vite.config.ts. Added comprehensive documentation for the Online Multiplayer Architecture including client-server model, WebSocket connectivity, turn enforcement, disconnect handling, security measures, and commercial readiness features. The game is now fully functional with real-time multiplayer support for 2-4 players connecting from different locations.

---

# AZUL-ONLINE: Fix Host Black Screen When Player Joins

**Date:** 2026-01-13

## Changes:

- `frontend/src/store/gameStore.ts`: Updated setRoom and setGameState to support functional updates

## Summary:

Fixed a bug where the host would see a black screen when a second player joined the room. The issue was that the Zustand store's setRoom and setGameState functions only accepted direct values, but the useSocket hook was passing functional updates when handling the onPlayerJoined event. The store now properly detects when a function is passed and calls it with the previous state, enabling proper state updates when players join or leave.

---

# AZUL-ONLINE: i18n Support & Tile Color Improvements

**Date:** 2026-01-14

## Changes:

- `frontend/src/i18n/translations.ts`: Translation strings for PT-BR and EN-US
- `frontend/src/i18n/useLanguage.ts`: Zustand store with localStorage persistence for language preference
- `frontend/src/components/UI/LanguageSelector.tsx`: Language toggle component (PT/EN)
- `frontend/src/App.tsx`: Added LanguageSelector and translations
- `frontend/src/components/Room/CreateRoom.tsx`: Translated all UI strings
- `frontend/src/components/Room/JoinRoom.tsx`: Translated all UI strings
- `frontend/src/components/Room/Lobby.tsx`: Translated all UI strings
- `frontend/src/components/Game/GameBoard.tsx`: Translated all UI strings
- `frontend/src/components/Game/GameOver.tsx`: Translated all UI strings
- `frontend/src/components/Board/Board.tsx`: Translated all UI strings
- `frontend/src/components/Factory/FactoryDisplay.tsx`: Translated all UI strings
- `frontend/src/styles/globals.css`: Adjusted tile colors for better saturation and visibility

## Summary:

Added internationalization (i18n) support with Portuguese (PT-BR) and English (EN-US) languages. The language selector appears in the top-right corner of all screens and the preference is persisted in localStorage. All user-facing strings across the application are now translatable. Also improved tile colors to be more saturated and visually distinct while maintaining a professional appearance without excessive glow effects.

---

# AZUL-ONLINE: Landing Page Redesign, Auth UI & Game Controls

**Date:** 2026-01-14

## Changes:

- `frontend/src/components/Landing/LandingPage.tsx`: Complete redesign with glassmorphism aesthetic, floating animated tiles, tabbed interface (Quick Play / Login)
- `frontend/src/store/authStore.ts`: Zustand store with localStorage persistence for user authentication state
- `frontend/src/components/Auth/AvatarUpload.tsx`: Avatar upload component with game token styling (colored borders, glow effects)
- `frontend/src/components/Auth/LoginForm.tsx`: Login form with email/password fields
- `frontend/src/components/Auth/SignUpForm.tsx`: Multi-step signup form with avatar selection step
- `frontend/src/components/UI/ConfirmModal.tsx`: Reusable confirmation modal with danger/warning variants
- `frontend/src/components/Game/GameControls.tsx`: Game controls toolbar with fullscreen toggle and leave game button
- `frontend/src/components/Game/GameBoard.tsx`: Integrated GameControls, added onLeaveGame prop
- `frontend/src/components/Board/PatternLines.tsx`: Fixed empty slot visibility with dashed borders
- `frontend/src/components/Board/FloorLine.tsx`: Fixed empty slot visibility with dashed borders
- `frontend/src/styles/globals.css`: Added Portuguese tile palette, glassmorphism classes, landing page styles
- `frontend/src/i18n/translations.ts`: Added auth and game controls translations for PT-BR and EN-US
- `frontend/src/App.tsx`: Passed handleLeaveRoom to GameBoard component

## Summary:

Major UI/UX improvements including a complete landing page redesign with "Modern Portuguese Architecture" glassmorphism aesthetic featuring floating animated decorative tiles and a tabbed interface for Quick Play (guest mode) and Login/Register (auth mode). Added user authentication UI with avatar upload that displays profile pictures as game tokens with customizable colored borders matching the tile palette. Implemented game controls toolbar with fullscreen toggle (using browser Fullscreen API) and leave game button with confirmation modal to prevent accidental exits. Fixed pattern lines and floor line empty slot visibility with restored dashed borders and faint backgrounds for better contrast against the dark theme.

---

# AZUL-ONLINE: Fix Mobile Touch Events for Tile Placement

**Date:** 2026-01-14

## Changes:

- `frontend/src/components/Board/PatternLines.tsx`: Replaced motion.div with regular div, switched onClick/onTouchEnd to onPointerUp for cross-platform touch support
- `frontend/src/components/Board/FloorLine.tsx`: Replaced motion.div with regular div, switched onClick/onTouchEnd to onPointerUp for cross-platform touch support

## Summary:

Fixed mobile touch events where users could select tiles from factories but could not place them on pattern lines by tapping. The issue was that Framer Motion's motion.div with onTouchEnd was not properly firing events on some mobile browsers. Replaced motion.div with regular div elements and switched to onPointerUp events which provide unified mouse and touch handling across all platforms. Added e.stopPropagation() to prevent event bubbling issues.

---

# AZUL-ONLINE: Game State Persistence with SQLite Auto-Save

**Date:** 2026-01-14

## Changes:

- `backend/src/persistence/database.ts`: New SQLite persistence module using better-sqlite3
- `backend/src/room/store.ts`: Added auto-save on every game state change, load from DB on startup
- `backend/src/server.ts`: Initialize database and load persisted rooms before accepting connections
- `backend/package.json`: Added better-sqlite3 and @types/better-sqlite3 dependencies
- `frontend/src/hooks/useSocket.ts`: Switched from sessionStorage to localStorage for room/player IDs

## Summary:

Implemented game state persistence using SQLite (better-sqlite3) so players can close their browser and return to continue their game later. The server auto-saves room state to the database on every action (room creation, player join/leave, game moves). On server startup, all persisted rooms are loaded back into memory with players marked as disconnected. Frontend now uses localStorage instead of sessionStorage so reconnection data survives browser restarts. Rooms are automatically cleaned up after 48 hours of inactivity. To configure the database path on Render.com, set the `DB_PATH` environment variable (e.g., `/var/data/azul.db`).

---

# AZUL-ONLINE: Migrate to Turso Cloud Database

**Date:** 2026-01-14

## Changes:

- `backend/src/persistence/database.ts`: Migrated from better-sqlite3 to @libsql/client for Turso cloud SQLite
- `backend/src/room/store.ts`: Updated to use async database operations with fire-and-forget pattern
- `backend/src/server.ts`: Made createServer async to await database initialization
- `backend/src/index.ts`: Added async main function wrapper for server startup
- `backend/package.json`: Replaced better-sqlite3 with @libsql/client

## Summary:

Migrated from local SQLite (better-sqlite3) to Turso cloud database (@libsql/client) because Render.com free tier doesn't support persistent disks. Turso provides free cloud-hosted SQLite that persists across server restarts and deploys. The database operations are now async but use fire-and-forget pattern for writes to avoid blocking game actions. Configuration requires two environment variables on Render: `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. The system gracefully falls back to in-memory only mode if Turso credentials are not configured.

---

# AZUL-ONLINE: Game Features & UX Improvements

**Date:** 2026-01-15

## Changes:

- `backend/src/shared/types.ts`: Added ChangeRoomCodePayload type
- `backend/src/room/store.ts`: Added changeRoomId function for room code changes
- `backend/src/room/manager.ts`: Added changeRoomCode function with validation
- `backend/src/socket/handlers.ts`: Added room:change-code socket event handler
- `frontend/src/services/socket.ts`: Improved reconnection with infinite retries, added reattachListeners and tryAutoReconnect
- `frontend/src/hooks/useSocket.ts`: Added changeRoomCode function
- `frontend/src/components/Room/Lobby.tsx`: Added change room code modal for host
- `frontend/src/components/Game/PenaltyNotification.tsx`: New component for floor penalty notifications
- `frontend/src/components/Game/RoundSummary.tsx`: New component for round score breakdown modal
- `frontend/src/components/Game/GameRules.tsx`: New component with illustrated game tutorial
- `frontend/src/components/Game/GameControls.tsx`: Added help/rules button
- `frontend/src/components/Game/GameBoard.tsx`: Integrated PenaltyNotifications and RoundSummary
- `frontend/src/components/Landing/LandingPage.tsx`: Added rules button and GameRules modal
- `frontend/src/i18n/translations.ts`: Added translations for room code, penalties, round summary, and rules

## Summary:

Implemented five major features: (1) Host can change room code in lobby with validation for 6 alphanumeric characters; (2) Fixed mobile sync bug where host didn't see players joining by improving socket reconnection with infinite retries and auto-reconnect on disconnect; (3) Penalty notifications appear as toast messages when tiles go to floor line or first player marker is taken; (4) Round summary modal shows detailed score breakdown (tiles placed, adjacency bonus, floor penalty) after each round completes; (5) Comprehensive game rules/tutorial section accessible from landing page and during gameplay with illustrated step-by-step instructions, scoring rules, and end game conditions in both PT-BR and EN-US.

---

# AZUL-ONLINE: Fix Render.com Build Configuration

**Date:** 2026-01-15

## Changes:

- `backend/package.json`: Added render-build script for Render.com deployment

## Summary:

Fixed Render.com deployment build failure where the server was trying to run `node dist/index.js` without first compiling TypeScript. Added a `render-build` script to package.json and configured Render's Build Command to `npm install && npm run build` so TypeScript is compiled before the start command runs. The dist/ folder is now properly generated during the build phase.
