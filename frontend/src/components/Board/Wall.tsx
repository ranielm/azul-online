import React from 'react';
import { motion } from 'framer-motion';
import { WallCell } from '@shared/types';
import { Tile } from '../Tile/Tile';
import { useGameStore } from '../../store/gameStore';

interface WallProps {
  wall: WallCell[][];
  isMyBoard?: boolean; // Optional: Only highlight on my board if needed (currently global)
}

export function Wall({ wall, isMyBoard = false }: WallProps) {
  // Only subscribe to highlights if we are viewing a board that might be highlighted.
  // For now, we assume interactions are primarily for the main player, 
  // and we passed isMyBoard from Board.tsx. 
  // To simplify: We just check if *this* wall matches the highlights.
  const { highlightedCells } = useGameStore();

  const getHighlightType = (r: number, c: number) => {
    if (!isMyBoard) return null; // Only show highlights on my board for now
    const highlight = highlightedCells.find(h => h.row === r && h.col === c);
    return highlight ? highlight.type : null;
  };

  return (
    <div className="flex flex-col gap-1">
      {wall.map((row, rowIndex) => (
        <div key={rowIndex} className="wall-row flex gap-1 h-[28px] items-center">
          {row.map((cell, colIndex) => {
            const wasCompleted = cell.filled && cell.wasCompleted;
            const highlightType = getHighlightType(rowIndex, colIndex);

            return (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                initial={cell.filled ? { scale: 0 } : {}}
                animate={cell.filled ? { scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`
                    relative rounded
                    ${highlightType === 'focus' ? 'z-10 ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : ''}
                    ${highlightType === 'neighbor' ? 'z-10 ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
              >
                {/* Pulse animation for focus tile */}
                {highlightType === 'focus' && (
                  <motion.div
                    initial={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-yellow-400 rounded-sm"
                  />
                )}

                {cell.filled ? (
                  <Tile
                    color={cell.color}
                    size="sm"
                    disabled
                    wasCompleted={wasCompleted}
                  />
                ) : (
                  <Tile color={cell.color} size="sm" disabled variant="slot" />
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
