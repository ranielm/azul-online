import React from 'react';
import { motion } from 'framer-motion';
import { TileColor, TileSelection } from '@shared/types';
import { Tile } from '../Tile/Tile';
import { groupTilesByColor } from '../../utils/gameHelpers';

interface FactoryProps {
  tiles: TileColor[];
  factoryIndex: number;
  onSelectTiles: (selection: TileSelection) => void;
  selectedTiles: TileSelection | null;
  disabled?: boolean;
}

export function Factory({
  tiles,
  factoryIndex,
  onSelectTiles,
  selectedTiles,
  disabled = false,
}: FactoryProps) {
  const isSelected =
    selectedTiles?.source === 'factory' &&
    selectedTiles?.factoryIndex === factoryIndex;

  const handleTileClick = (color: TileColor) => {
    if (disabled || tiles.length === 0) return;

    onSelectTiles({
      source: 'factory',
      factoryIndex,
      color,
    });
  };

  if (tiles.length === 0) {
    return (
      <div className="factory opacity-50">
        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
        <div className="w-8 h-8" />
      </div>
    );
  }

  // Group tiles by color for display
  const colorGroups = groupTilesByColor(tiles);
  const displayTiles: TileColor[] = [];

  // Flatten back but maintain grouping visually
  colorGroups.forEach((count, color) => {
    for (let i = 0; i < count; i++) {
      displayTiles.push(color);
    }
  });

  // Pad to 4 tiles for consistent layout
  while (displayTiles.length < 4) {
    displayTiles.push(null as unknown as TileColor);
  }

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      className={`factory ${isSelected ? 'ring-2 ring-yellow-400' : ''}`}
    >
      {displayTiles.map((tile, index) =>
        tile ? (
          <Tile
            key={`${factoryIndex}-${index}`}
            color={tile}
            onClick={() => handleTileClick(tile)}
            selected={isSelected && selectedTiles?.color === tile}
            disabled={disabled}
          />
        ) : (
          <div key={`${factoryIndex}-${index}`} className="w-8 h-8" />
        )
      )}
    </motion.div>
  );
}
