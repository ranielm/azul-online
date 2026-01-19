import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [hoveredColor, setHoveredColor] = useState<TileColor | null>(null);
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

  // Flatten tiles for display but keep them grouped by color
  const allTiles: { color: TileColor; id: string }[] = [];
  Array.from(colorGroups.entries()).forEach(([color, count]) => {
    for (let i = 0; i < count; i++) {
      allTiles.push({ color, id: `center-${color}-${i}` });
    }
  });

  return (
    <motion.div
      layout
      className={`
        bg-slate-700 rounded-xl p-4 min-h-[100px]
        flex flex-col gap-4
        ${isSelected ? 'ring-2 ring-yellow-400' : ''}
      `}
    >
      <div className={`flex flex-wrap gap-2 content-start ${isEmpty ? 'justify-center items-center min-h-[60px]' : ''}`}>
        <AnimatePresence>
          {centerPool.hasFirstPlayer && (
            <motion.div
              layout
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <Tile color="first-player" disabled />
            </motion.div>
          )}

          {/* Tile Count Badge */}
          {!isEmpty && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-800 z-10 shadow-lg">
              {centerPool.tiles.length}
            </div>
          )}

          {allTiles.map((tile) => {
            const isDimmed = hoveredColor && hoveredColor !== tile.color;
            const isSelectedColor = isSelected && selectedTiles?.color === tile.color;

            return (
              <motion.div
                layout
                key={tile.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: isDimmed ? 0.4 : 1 }}
                exit={{ scale: 0 }}
                onMouseEnter={() => !disabled && setHoveredColor(tile.color)}
                onMouseLeave={() => setHoveredColor(null)}
              >
                <Tile
                  color={tile.color}
                  onClick={() => handleTileClick(tile.color)}
                  selected={isSelectedColor}
                  disabled={disabled}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isEmpty && (
          <span className="text-slate-500 text-sm">Center is empty</span>
        )}
      </div>

      {/* Stats Bar */}
      {!isEmpty && (
        <div className="flex flex-wrap gap-3 justify-center pt-2 border-t border-slate-600/50">
          {Array.from(colorGroups.entries()).map(([color, count]) => (
            <div key={color} className="flex items-center gap-1.5" title={`${count} ${color} tiles`}>
              <div className="scale-75 origin-center">
                <Tile color={color as TileColor} size="sm" disabled />
              </div>
              <span className="text-xs font-bold text-slate-300">{count}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
