import React from 'react';
import { motion } from 'framer-motion';
import { WallCell } from '@shared/types';
import { Tile } from '../Tile/Tile';

interface WallProps {
  wall: WallCell[][];
}

export function Wall({ wall }: WallProps) {
  return (
    <div className="grid gap-1">
      {wall.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((cell, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              initial={cell.filled ? { scale: 0 } : {}}
              animate={cell.filled ? { scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              {cell.filled ? (
                <Tile color={cell.color} size="sm" disabled />
              ) : (
                <Tile color={cell.color} size="sm" disabled showPattern />
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
