import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { useAuthStore } from './store/authStore';
import { LandingPage } from './components/Landing/LandingPage';
import { CreateRoom } from './components/Room/CreateRoom';
import { JoinRoom } from './components/Room/JoinRoom';
import { Lobby } from './components/Room/Lobby';
import { GameBoard } from './components/Game/GameBoard';
import { GameOver } from './components/Game/GameOver';
import { Toast } from './components/UI/Toast';
import { LanguageSelector } from './components/UI/LanguageSelector';
import { useTranslation } from './i18n/useLanguage';
import { TileSelection } from '@shared/types';
import { TutorialOverlay } from './components/Tutorial/TutorialOverlay';

type Screen = 'home' | 'create' | 'join' | 'lobby' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [initialRoomId, setInitialRoomId] = useState<string>('');
  const [selectedTiles, setSelectedTiles] = useState<TileSelection | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const { createRoom, joinRoom, leaveRoom, startGame, makeMove, restartGame, changeRoomCode, checkActiveGame } =
    useSocket();

  const { room, gameState, playerId, error, clearError, isConnected } =
    useGameStore();

  const { activeGameId, user, setActiveGameId } = useAuthStore();

  const { t } = useTranslation();

  // Handle automatic reconnection
  useEffect(() => {
    if (isConnected && user?.username && !room && !gameState) {
      // 1. If we have a known active game from AuthStore, try to join it
      if (activeGameId) {
        console.log('Attempting auto-reconnect to', activeGameId);
        joinRoom(activeGameId, user.username);
      }
      // 2. Otherwise, double-check with the server via socket if we have any active game
      // (This handles cases where AuthStore might be stale or cleared but server knows better)
      else if (user?.username) {
        const currentUsername = user.username;
        checkActiveGame(currentUsername, (result) => {
          if (result.found && result.roomId) {
            console.log('Found active game via socket check:', result.roomId);
            setActiveGameId(result.roomId);
            joinRoom(result.roomId, currentUsername);
          }
        });
      }
    }
  }, [activeGameId, user?.username, isConnected, room, gameState, joinRoom, checkActiveGame, setActiveGameId]);

  // Check for room ID in URL
  // Check for room ID in URL (Path or Query)
  useEffect(() => {
    // 1. Check path for /game/:id
    const pathMatch = window.location.pathname.match(/\/game\/([a-zA-Z0-9]+)/);
    if (pathMatch && pathMatch[1]) {
      setInitialRoomId(pathMatch[1].toUpperCase());
      setScreen('join');
      return;
    }

    // 2. Check query param ?room=:id
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      setInitialRoomId(roomId.toUpperCase());
      setScreen('join');
      // We do NOT clean up the URL anymore to allow auth redirection back to this context
    }
  }, []);

  // Handle room/game state changes
  useEffect(() => {
    if (room && !gameState) {
      setScreen('lobby');
    } else if (gameState && gameState.phase === 'playing') {
      setScreen('game');
    }
  }, [room, gameState]);

  // Check for tutorial on first visit to game screen
  useEffect(() => {
    if (screen === 'game' && !localStorage.getItem('ladrilho_tutorial_seen')) {
      // Delay slightly to let game load
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Clear selection when turn changes
  useEffect(() => {
    if (gameState) {
      const currentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (currentPlayer?.id !== playerId) {
        setSelectedTiles(null);
      }
    }
  }, [gameState?.currentPlayerIndex, playerId]);

  const handleCreateRoom = (playerName: string, maxPlayers: 2 | 3 | 4) => {
    createRoom(playerName, maxPlayers);
  };

  const handleJoinRoom = (roomId: string, playerName: string) => {
    joinRoom(roomId, playerName);
  };

  const handleLeaveRoom = () => {
    leaveRoom();
    setActiveGameId(null);
    setScreen('home');
    setSelectedTiles(null);
  };

  const handleSelectTiles = (selection: TileSelection) => {
    setSelectedTiles(selection);
  };

  const handleClearSelection = () => {
    setSelectedTiles(null);
  };

  const isHost = room?.gameState.players.find((p) => p.id === playerId)?.isHost ?? false;

  const handleTutorialComplete = () => {
    setShowTutorial(false);
    localStorage.setItem('ladrilho_tutorial_seen', 'true');
  };

  return (
    <div className="min-h-screen">
      {/* Language selector */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Connection status */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          {t.connectingToServer}
        </div>
      )}

      {/* Error toast */}
      <Toast message={error} onClose={clearError} />

      <AnimatePresence>
        {showTutorial && (
          <TutorialOverlay
            onClose={() => setShowTutorial(false)}
            onComplete={handleTutorialComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* Home Screen */}
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage
              onCreateRoom={() => setScreen('create')}
              onJoinRoom={() => setScreen('join')}
            />
          </motion.div>
        )}

        {/* Create Room Screen */}
        {screen === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <CreateRoom
              onCreateRoom={handleCreateRoom}
              onBack={() => setScreen('home')}
            />
          </motion.div>
        )}

        {/* Join Room Screen */}
        {screen === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <JoinRoom
              onJoinRoom={handleJoinRoom}
              onBack={() => {
                setScreen('home');
                setInitialRoomId('');
              }}
              initialRoomId={initialRoomId}
            />
          </motion.div>
        )}

        {/* Lobby Screen */}
        {screen === 'lobby' && room && playerId && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <Lobby
              room={room}
              playerId={playerId}
              onStartGame={startGame}
              onLeaveRoom={handleLeaveRoom}
              onChangeCode={changeRoomCode}
            />
          </motion.div>
        )}

        {/* Game Screen */}
        {screen === 'game' && gameState && playerId && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameBoard
              gameState={gameState}
              playerId={playerId}
              selectedTiles={selectedTiles}
              onSelectTiles={handleSelectTiles}
              onClearSelection={handleClearSelection}
              onMakeMove={makeMove}
              onLeaveGame={handleLeaveRoom}
              onShowTutorial={() => setShowTutorial(true)}
            />

            {/* Game Over Modal */}
            {gameState.phase === 'finished' && (
              <GameOver
                gameState={gameState}
                playerId={playerId}
                isHost={isHost}
                onRestart={restartGame}
                onLeave={handleLeaveRoom}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
