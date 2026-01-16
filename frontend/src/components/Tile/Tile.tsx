import React from 'react';
import { motion } from 'framer-motion';
import { TileColor, Tile as TileType } from '@shared/types';
import { getTileColorClass } from '../../utils/gameHelpers';

interface TileProps {
  color: TileType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showPattern?: boolean;
  wasCompleted?: boolean;
}

export function Tile({
  color,
  onClick,
  selected = false,
  disabled = false,
  size = 'md',
  showPattern = false,
  wasCompleted = false,
}: TileProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    lg: 'w-10 h-10',
  };

  const colorClass = getTileColorClass(color);
  const isFirstPlayer = color === 'first-player';

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={!disabled && onClick ? { scale: 1.15 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      onClick={handleClick}
      onTouchEnd={(e) => {
        if (!disabled && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ touchAction: 'manipulation' }}
      className={`
        ${sizes[size]}
        ${colorClass}
        ${selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : ''}
        ${onClick && !disabled ? 'cursor-pointer' : 'cursor-default'}
        ${disabled && !wasCompleted ? 'tile-empty' : ''}
        ${showPattern ? 'opacity-30' : ''}
        ${wasCompleted ? 'tile-completed' : ''}
        rounded-sm shadow-md transition-all duration-150
        flex items-center justify-center
      `}
    >
      {isFirstPlayer && <span className="text-xs font-bold">1</span>}
    </motion.div>
  );
}
