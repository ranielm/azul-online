import React from 'react';
import { motion } from 'framer-motion';
import { WallCell } from '@shared/types';
import { Tile } from '../Tile/Tile';

interface WallProps {
  wall: WallCell[][];
}

export function Wall({ wall }: WallProps) {
  return (
    <div className="flex flex-col gap-1">
      {wall.map((row, rowIndex) => (
        <div key={rowIndex} className="wall-row flex gap-1 h-[28px] items-center">
          {row.map((cell, colIndex) => {
            const wasCompleted = cell.filled && cell.wasCompleted;
            
            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                initial={cell.filled ? { scale: 0 } : {}}
                animate={cell.filled ? { scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {cell.filled ? (
                  <Tile 
                    color={cell.color} 
                    size="sm" 
                    disabled 
                    wasCompleted={wasCompleted}
                  />
                ) : (
                  <Tile color={cell.color} size="sm" disabled showPattern />
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
