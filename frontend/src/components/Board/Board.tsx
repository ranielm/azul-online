import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Player, TileSelection, TilePlacement, PlayerMove } from '@shared/types';
import { PatternLines } from './PatternLines';
import { Wall } from './Wall';
import { FloorLine } from './FloorLine';
import { getValidPatternLines } from '../../utils/gameHelpers';

interface BoardProps {
  player: Player;
  isCurrentPlayer: boolean;
  isMyBoard: boolean;
  selectedTiles: TileSelection | null;
  onMakeMove: (move: PlayerMove) => void;
  onClearSelection: () => void;
  myPlayerId: string;
}

export function Board({
  player,
  isCurrentPlayer,
  isMyBoard,
  selectedTiles,
  onMakeMove,
  onClearSelection,
  myPlayerId,
}: BoardProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);

  const canInteract = isCurrentPlayer && isMyBoard && selectedTiles !== null;
  const validLines = selectedTiles
    ? getValidPatternLines(
        player.board.patternLines,
        player.board.wall,
        selectedTiles.color
      )
    : [];

  const handleSelectLine = (lineIndex: number) => {
    if (!canInteract || !selectedTiles) return;

    const move: PlayerMove = {
      playerId: myPlayerId,
      selection: selectedTiles,
      placement: {
        destination: 'pattern-line',
        patternLineIndex: lineIndex,
      },
    };

    onMakeMove(move);
    setSelectedLine(null);
    onClearSelection();
  };

  const handleSelectFloor = () => {
    if (!canInteract || !selectedTiles) return;

    const move: PlayerMove = {
      playerId: myPlayerId,
      selection: selectedTiles,
      placement: {
        destination: 'floor',
      },
    };

    onMakeMove(move);
    onClearSelection();
  };

  // Can always place on floor if tiles are selected
  const canPlaceOnFloor = canInteract && selectedTiles !== null;

  return (
    <motion.div
      layout
      className={`
        player-board
        ${isCurrentPlayer ? 'current-turn' : ''}
        ${!player.isConnected ? 'opacity-60' : ''}
      `}
    >
      {/* Player info header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`
              w-3 h-3 rounded-full
              ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
            `}
          />
          <span className="font-semibold text-lg">
            {player.name}
            {isMyBoard && ' (You)'}
            {player.isHost && ' (Host)'}
          </span>
        </div>
        <motion.div
          key={player.board.score}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          className="text-2xl font-bold text-yellow-400"
        >
          {player.board.score} pts
        </motion.div>
      </div>

      {/* Board content */}
      <div className="flex gap-4">
        {/* Pattern lines */}
        <div className="flex-shrink-0">
          <h4 className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
            Pattern Lines
          </h4>
          <PatternLines
            patternLines={player.board.patternLines}
            wall={player.board.wall}
            selectedColor={canInteract ? selectedTiles?.color || null : null}
            onSelectLine={handleSelectLine}
            selectedLine={selectedLine}
            disabled={!canInteract}
          />
        </div>

        {/* Wall */}
        <div className="flex-shrink-0">
          <h4 className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
            Wall
          </h4>
          <Wall wall={player.board.wall} />
        </div>
      </div>

      {/* Floor line */}
      <div>
        <h4 className="text-xs text-slate-500 mb-1 uppercase tracking-wide mt-4">
          Floor (Penalties)
        </h4>
        <FloorLine
          floorLine={player.board.floorLine}
          onSelectFloor={handleSelectFloor}
          canPlace={canPlaceOnFloor && validLines.length === 0}
          disabled={!canInteract}
        />
        {canPlaceOnFloor && validLines.length === 0 && (
          <p className="text-xs text-yellow-400 mt-1">
            No valid pattern lines - must place on floor
          </p>
        )}
      </div>

      {/* Turn indicator */}
      {isCurrentPlayer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center"
        >
          {isMyBoard ? (
            <span className="text-green-400 font-semibold">
              {selectedTiles ? 'Select where to place tiles' : 'Your turn - select tiles'}
            </span>
          ) : (
            <span className="text-yellow-400">Playing...</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
