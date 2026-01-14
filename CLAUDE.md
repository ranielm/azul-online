# AZUL-ONLINE: Initial Implementation

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
