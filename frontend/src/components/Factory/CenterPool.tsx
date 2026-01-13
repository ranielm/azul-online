import React from 'react';
import { motion } from 'framer-motion';
import { CenterPool as CenterPoolType, TileColor, TileSelection } from '@shared/types';
import { Tile } from '../Tile/Tile';
import { groupTilesByColor } from '../../utils/gameHelpers';

interface CenterPoolProps {
  centerPool: CenterPoolType;
  onSelectTiles: (selection: TileSelection) => void;
  selectedTiles: TileSelection | null;
  disabled?: boolean;
}

export function CenterPool({
  centerPool,
  onSelectTiles,
  selectedTiles,
  disabled = false,
}: CenterPoolProps) {
  const isSelected = selectedTiles?.source === 'center';

  const handleTileClick = (color: TileColor) => {
    if (disabled) return;

    onSelectTiles({
      source: 'center',
      color,
    });
  };

  const colorGroups = groupTilesByColor(centerPool.tiles);
  const isEmpty = centerPool.tiles.length === 0 && !centerPool.hasFirstPlayer;

  return (
    <motion.div
      className={`
        bg-slate-700 rounded-xl p-4 min-h-[100px]
        flex flex-wrap gap-2 justify-center items-center
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
        ${isEmpty ? 'opacity-50' : ''}
      `}
    >
      {centerPool.hasFirstPlayer && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <Tile color="first-player" disabled />
          <span className="text-xs text-slate-400">1st</span>
        </motion.div>
      )}

      {Array.from(colorGroups.entries()).map(([color, count]) => (
        <motion.div
          key={color}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center gap-1"
        >
          <div className="flex gap-1">
            {Array.from({ length: count }).map((_, index) => (
              <Tile
                key={`center-${color}-${index}`}
                color={color}
                onClick={() => handleTileClick(color)}
                selected={isSelected && selectedTiles?.color === color}
                disabled={disabled}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">{count}</span>
        </motion.div>
      ))}

      {isEmpty && (
        <span className="text-slate-500 text-sm">Center is empty</span>
      )}
    </motion.div>
  );
}
