import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Player, TileSelection, TilePlacement, PlayerMove } from '@shared/types';
import { PatternLines } from './PatternLines';
import { Wall } from './Wall';
import { FloorLine } from './FloorLine';
import { getValidPatternLines } from '../../utils/gameHelpers';
import { useTranslation } from '../../i18n/useLanguage';
import { UserAvatar } from '../UI/UserAvatar';

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
  const { t } = useTranslation();

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
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar
              src={player.image}
              name={player.name}
              size="md"
            />
            <span
              className={`
                absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-slate-900
                ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
              `}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg leading-tight">
              {player.name}
              {isMyBoard && <span className="text-blue-400 text-base ml-1">({t.you})</span>}
            </span>
            {player.isHost && (
              <span className="text-xs text-yellow-500 font-medium tracking-wide uppercase">{t.host}</span>
            )}
          </div>
        </div>
      </div>

      {/* Board content - Horizontal scroll on small screens to keep Pattern/Wall connected */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-fit">
          {/* Headers */}
          <div className="grid grid-cols-[auto_auto] gap-4 mb-2">
            <h4 className="text-xs text-slate-500 uppercase tracking-wide">
              {t.patternLines}
            </h4>
            <h4 className="text-xs text-slate-500 uppercase tracking-wide">
              {t.wall}
            </h4>
          </div>

          {/* Game board - Pattern lines and Wall aligned */}
          <div className="grid grid-cols-[auto_auto] gap-4 items-start">
            <div className="pattern-lines-container">
              <PatternLines
                patternLines={player.board.patternLines}
                wall={player.board.wall}
                selectedColor={canInteract ? selectedTiles?.color || null : null}
                onSelectLine={handleSelectLine}
                selectedLine={selectedLine}
                disabled={!canInteract}
              />
            </div>

            <div className="wall-container">
              <Wall wall={player.board.wall} />
            </div>
          </div>
        </div>
      </div>

      {/* Floor line */}
      <div>
        <h4 className="text-xs text-slate-500 mb-1 uppercase tracking-wide mt-4">
          {t.floorPenalties}
        </h4>
        <FloorLine
          floorLine={player.board.floorLine}
          onSelectFloor={handleSelectFloor}
          canPlace={canPlaceOnFloor && validLines.length === 0}
          disabled={!canInteract}
        />
        {canPlaceOnFloor && validLines.length === 0 && (
          <p className="text-xs text-yellow-400 mt-1">
            {t.noValidPatternLines}
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
              {selectedTiles ? t.selectWherePlaceTiles : t.yourTurnSelectTiles}
            </span>
          ) : (
            <span className="text-yellow-400">{t.playing}</span>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
