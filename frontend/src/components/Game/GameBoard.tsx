import React from 'react';
import { motion } from 'framer-motion';
import { GameState, TileSelection, PlayerMove } from '@shared/types';
import { Board } from '../Board/Board';
import { FactoryDisplay } from '../Factory/FactoryDisplay';
import { GameControls } from './GameControls';
import { PenaltyNotifications } from './PenaltyNotification';
import { RoundSummary } from './RoundSummary';
import { SharedScoreTrack } from './SharedScoreTrack';
import { useTranslation } from '../../i18n/useLanguage';

interface GameBoardProps {
  gameState: GameState;
  playerId: string;
  selectedTiles: TileSelection | null;
  onSelectTiles: (selection: TileSelection) => void;
  onClearSelection: () => void;
  onMakeMove: (move: PlayerMove) => void;
  onLeaveGame: () => void;
  onShowTutorial?: () => void;
}

export function GameBoard({
  gameState,
  playerId,
  selectedTiles,
  onSelectTiles,
  onClearSelection,
  onMakeMove,
  onLeaveGame,
  onShowTutorial,
}: GameBoardProps) {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const { t } = useTranslation();

  // Sort players: local player first on mobile for better UX
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.id === playerId) return -1;
    if (b.id === playerId) return 1;
    return 0;
  });

  const handleTileDrop = (source: TileSelection, targetRow: number) => {
    if (!isMyTurn) return;

    // Execute the move directly
    // Logic: Select tiles -> Select Line
    // But since we have both source and target, we can just call onMakeMove directly?
    // onMakeMove expects { color, source, sourceIndex, quantity?, targetRow }? 
    // No, onMakeMove expects `PlayerMove` which is { sourceIndex, source: 'factory'|'center', color, targetRow }

    // We need the color from source? TileSelection has color.
    onMakeMove({
      // @ts-ignore
      color: source.color,
      source: source.source,
      factoryIndex: source.factoryIndex,
      targetRow: targetRow
    });

    // Also clear selection to be safe
    onClearSelection();
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-safe flex flex-col gap-4 lg:block">
      {/* Game Controls Toolbar */}
      <GameControls onLeaveGame={onLeaveGame} onShowTutorial={onShowTutorial} roomId={gameState.id} />

      {/* Game info header - compact on mobile */}
      {/* Added mt-14 to fix overlap with fixed buttons on mobile, and order-1 for mobile flow */}
      <div className="text-center mb-4 sm:mb-6 mt-14 sm:mt-0 order-1 lg:order-none">
        <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
          {t.round} {gameState.round}
        </h2>
        <motion.p
          key={currentPlayer?.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`text-base sm:text-lg ${isMyTurn ? 'text-green-400' : 'text-slate-400'}`}
        >
          {isMyTurn ? t.yourTurn : t.playerTurn(currentPlayer?.name || '')}
        </motion.p>
      </div>

      {/* Shared Score Track - Order 4 on mobile */}
      <div className="order-4 lg:order-none w-full">
        <SharedScoreTrack players={gameState.players} currentPlayerId={playerId} />
      </div>

      {/* Mobile: Use contents to flatten for ordering -> Desktop: Grid */}
      <div className="contents lg:grid lg:grid-cols-[1fr_auto] lg:gap-8">
        {/* Factories and center - Order 3 on Mobile */}
        <div className="order-3 lg:order-2 lg:w-80">
          <div className="lg:sticky lg:top-4">
            <FactoryDisplay
              factories={gameState.factories}
              centerPool={gameState.centerPool}
              bag={gameState.bag}
              onSelectTiles={onSelectTiles}
              selectedTiles={selectedTiles}
              disabled={!isMyTurn}
              onTileDrop={handleTileDrop}
            />

            {/* Selection indicator */}
            {selectedTiles && isMyTurn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 sm:mt-4 p-2 sm:p-3 bg-yellow-600/20 border border-yellow-600 rounded-lg text-center"
              >
                <p className="text-yellow-400 text-xs sm:text-sm">
                  {t.selected}: <span className="font-semibold capitalize">{selectedTiles.color}</span>
                  {' '}{t.tiles} {t.from}{' '}
                  <span className="font-semibold">
                    {selectedTiles.source === 'factory'
                      ? `${t.factory} ${(selectedTiles.factoryIndex ?? 0) + 1}`
                      : t.center}
                  </span>
                </p>
                <button
                  onClick={onClearSelection}
                  className="text-xs text-yellow-400/70 hover:text-yellow-400 mt-1 underline"
                >
                  {t.cancelSelection}
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Player boards - Order mixed on mobile (MyBoard=2, Others=5) */}
        <div className="contents lg:block lg:order-1">
          <div className="contents md:grid md:grid-cols-2 md:gap-4">
            {sortedPlayers.map((player) => (
              <div
                key={player.id}
                className={`${player.id === playerId ? 'order-2' : 'order-5'} md:order-none w-full`}
              >
                <Board
                  player={player}
                  isCurrentPlayer={player.id === currentPlayer?.id}
                  isMyBoard={player.id === playerId}
                  selectedTiles={player.id === playerId ? selectedTiles : null}
                  onMakeMove={onMakeMove}
                  onClearSelection={onClearSelection}
                  myPlayerId={playerId}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Penalty Notifications */}
      <PenaltyNotifications gameState={gameState} players={gameState.players} />

      {/* Round Summary Modal */}
      <RoundSummary gameState={gameState} playerId={playerId} />
    </div>
  );
}
