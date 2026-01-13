import React from 'react';
import { motion } from 'framer-motion';
import { Tile as TileType } from '@shared/types';
import { Tile } from '../Tile/Tile';
import { FLOOR_PENALTIES, MAX_FLOOR_TILES } from '@shared/constants';

interface FloorLineProps {
  floorLine: TileType[];
  onSelectFloor?: () => void;
  canPlace?: boolean;
  disabled?: boolean;
}

export function FloorLine({
  floorLine,
  onSelectFloor,
  canPlace = false,
  disabled = false,
}: FloorLineProps) {
  return (
    <div className="mt-2">
      <div className="text-xs text-slate-500 mb-1 flex gap-1 justify-start pl-1">
        {FLOOR_PENALTIES.map((penalty, i) => (
          <span key={i} className="w-6 text-center text-red-400">
            {penalty}
          </span>
        ))}
      </div>
      <motion.div
        onClick={canPlace && !disabled ? onSelectFloor : undefined}
        className={`
          floor-line min-h-[40px]
          ${canPlace && !disabled ? 'cursor-pointer hover:bg-slate-600 ring-2 ring-dashed ring-yellow-400/50' : ''}
        `}
      >
        {floorLine.map((tile, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Tile color={tile} size="sm" disabled />
          </motion.div>
        ))}

        {/* Empty slots */}
        {Array.from({ length: MAX_FLOOR_TILES - floorLine.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={`
              w-6 h-6 rounded-sm border-2 border-dashed
              ${canPlace ? 'border-yellow-400/50' : 'border-slate-600'}
            `}
          />
        ))}
      </motion.div>
    </div>
  );
}
