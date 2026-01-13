import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './store/gameStore';
import { CreateRoom } from './components/Room/CreateRoom';
import { JoinRoom } from './components/Room/JoinRoom';
import { Lobby } from './components/Room/Lobby';
import { GameBoard } from './components/Game/GameBoard';
import { GameOver } from './components/Game/GameOver';
import { Toast } from './components/UI/Toast';
import { Button } from './components/UI/Button';
import { TileSelection } from '@shared/types';

type Screen = 'home' | 'create' | 'join' | 'lobby' | 'game';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [initialRoomId, setInitialRoomId] = useState<string>('');
  const [selectedTiles, setSelectedTiles] = useState<TileSelection | null>(null);

  const { createRoom, joinRoom, leaveRoom, startGame, makeMove, restartGame } =
    useSocket();

  const { room, gameState, playerId, error, clearError, isConnected } =
    useGameStore();

  // Check for room ID in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      setInitialRoomId(roomId.toUpperCase());
      setScreen('join');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
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

  return (
    <div className="min-h-screen">
      {/* Connection status */}
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          Connecting to server...
        </div>
      )}

      {/* Error toast */}
      <Toast message={error} onClose={clearError} />

      <AnimatePresence mode="wait">
        {/* Home Screen */}
        {screen === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Azul Online
              </h1>
              <p className="text-xl text-slate-400">
                Play the classic board game with friends
              </p>
            </motion.div>

            <div className="flex flex-col gap-4 w-full max-w-xs">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setScreen('create')}
                className="w-full"
              >
                Create Room
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setScreen('join')}
                className="w-full"
              >
                Join Room
              </Button>
            </div>

            <div className="mt-12 text-center text-slate-500 text-sm">
              <p>No account needed. Just share the room code!</p>
              <p className="mt-2">2-4 players</p>
            </div>
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
