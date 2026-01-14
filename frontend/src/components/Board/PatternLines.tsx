import React from 'react';
import { motion } from 'framer-motion';
import { PatternLine, TileColor, WallCell } from '@shared/types';
import { Tile } from '../Tile/Tile';
import { canPlaceTileInPatternLine } from '../../utils/gameHelpers';

interface PatternLinesProps {
  patternLines: PatternLine[];
  wall: WallCell[][];
  selectedColor: TileColor | null;
  onSelectLine: (lineIndex: number) => void;
  selectedLine: number | null;
  disabled?: boolean;
}

export function PatternLines({
  patternLines,
  wall,
  selectedColor,
  onSelectLine,
  selectedLine,
  disabled = false,
}: PatternLinesProps) {
  return (
    <div className="flex flex-col gap-1">
      {patternLines.map((line, rowIndex) => {
        const canPlace =
          selectedColor &&
          canPlaceTileInPatternLine(line, selectedColor, wall, rowIndex);
        const isSelected = selectedLine === rowIndex;

        return (
          <motion.div
            key={rowIndex}
            onClick={() => canPlace && !disabled && onSelectLine(rowIndex)}
            className={`
              pattern-line h-8
              ${canPlace && !disabled ? 'cursor-pointer hover:bg-slate-600' : ''}
              ${isSelected ? 'bg-slate-600 ring-2 ring-yellow-400' : ''}
              ${canPlace && !isSelected ? 'bg-slate-700/50' : ''}
              rounded transition-all duration-150 p-1
            `}
          >
            {/* Empty slots */}
            {Array.from({ length: line.capacity - line.count }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-6 h-6 rounded-sm"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: `2px dashed ${canPlace && !disabled ? 'rgba(232, 241, 242, 1)' : 'rgba(232, 241, 242, 0.5)'}`,
                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.3)',
                }}
              />
            ))}

            {/* Filled slots */}
            {Array.from({ length: line.count }).map((_, i) => (
              <Tile
                key={`filled-${i}`}
                color={line.color!}
                size="sm"
                disabled
              />
            ))}
          </motion.div>
        );
      })}
    </div>
  );
}
