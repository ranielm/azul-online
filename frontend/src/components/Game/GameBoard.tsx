import React from 'react';
import { motion } from 'framer-motion';
import { GameState, TileSelection, PlayerMove } from '@shared/types';
import { Board } from '../Board/Board';
import { FactoryDisplay } from '../Factory/FactoryDisplay';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  selectedTiles: TileSelection | null;
  onSelectTiles: (selection: TileSelection) => void;
  onClearSelection: () => void;
  onMakeMove: (move: PlayerMove) => void;
}

export function GameBoard({
  gameState,
  playerId,
  selectedTiles,
  onSelectTiles,
  onClearSelection,
  onMakeMove,
}: GameBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Game info header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Round {gameState.round}
        </h2>
        <motion.p
          key={currentPlayer?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-lg ${isMyTurn ? 'text-green-400' : 'text-slate-400'}`}
        >
          {isMyTurn ? "It's your turn!" : `${currentPlayer?.name}'s turn`}
        </motion.p>
      </div>

      <div className="grid lg:grid-cols-[1fr_auto] gap-8">
        {/* Player boards */}
        <div className="order-2 lg:order-1">
          <div className="grid md:grid-cols-2 gap-4">
            {gameState.players.map((player) => (
              <Board
                key={player.id}
                player={player}
                isCurrentPlayer={player.id === currentPlayer?.id}
                isMyBoard={player.id === playerId}
                selectedTiles={player.id === playerId ? selectedTiles : null}
                onMakeMove={onMakeMove}
                onClearSelection={onClearSelection}
                myPlayerId={playerId}
              />
            ))}
          </div>
        </div>

        {/* Factories and center */}
        <div className="order-1 lg:order-2 lg:w-80">
          <div className="sticky top-4">
            <FactoryDisplay
              factories={gameState.factories}
              centerPool={gameState.centerPool}
              onSelectTiles={onSelectTiles}
              selectedTiles={selectedTiles}
              disabled={!isMyTurn}
            />

            {/* Selection indicator */}
            {selectedTiles && isMyTurn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-yellow-600/20 border border-yellow-600 rounded-lg text-center"
              >
                <p className="text-yellow-400 text-sm">
                  Selected: <span className="font-semibold capitalize">{selectedTiles.color}</span>
                  {' '}tiles from{' '}
                  <span className="font-semibold">
                    {selectedTiles.source === 'factory'
                      ? `Factory ${(selectedTiles.factoryIndex ?? 0) + 1}`
                      : 'Center'}
                  </span>
                </p>
                <button
                  onClick={onClearSelection}
                  className="text-xs text-yellow-400/70 hover:text-yellow-400 mt-1 underline"
                >
                  Cancel selection
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
