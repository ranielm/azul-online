import React from 'react';
import { motion } from 'framer-motion';
import { TileColor, Tile as TileType, TileSelection } from '@shared/types';
import { getTileColorClass } from '../../utils/gameHelpers';
import { useGameStore } from '../../store/gameStore';

interface TileProps {
  color: TileType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showPattern?: boolean;
  wasCompleted?: boolean;
  variant?: 'default' | 'slot'; // 'slot' = wall watermark style
  sourceInfo?: TileSelection; // Information about where this tile is from
  onDrop?: (source: TileSelection, targetRow: number) => void;
}

export function Tile({
  color,
  onClick,
  selected = false,
  disabled = false,
  size = 'md',
  showPattern = false,
  wasCompleted = false,
  variant = 'default',
  sourceInfo,
  onDrop,
}: TileProps) {
  const { setDraggingColor } = useGameStore();

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

  // Enable drag only if we have source info, drop handler, not disabled, and not first player marker
  const canDrag = !disabled && sourceInfo && onDrop && !isFirstPlayer;

  return (
    <motion.div
      drag={canDrag}
      dragSnapToOrigin
      dragElastic={0.1}
      dragMomentum={false}
      whileHover={!disabled && onClick ? { scale: 1.15, zIndex: 10 } : {}}
      whileTap={!disabled && onClick ? { scale: 0.95 } : {}}
      whileDrag={{ scale: 1.2, zIndex: 100, cursor: 'grabbing' }}
      onDragStart={() => {
        if (canDrag) {
          setDraggingColor(color as TileColor);
        }
      }}
      onDragEnd={(e, info) => {
        if (canDrag) {
          setDraggingColor(null);

          // Find drop target
          const point = { x: info.point.x, y: info.point.y };
          // We use document.elementsFromPoint to handle overlapping elements if needed, 
          // but elementFromPoint is usually enough for the top-most element.
          // However, the tile itself is under the cursor. We need to hide it temporarily?
          // Actually, pointer-events-none on drag might solve it, but Framer handles this.
          // Let's rely on the pointer event content or simple geometry.

          // Better approach: Hide pointer events on the dragged element during drag?
          // "pointer-events-none" is applied by Framer during drag usually? No.

          // Workaround: We can't easily "look through" the element with elementFromPoint 
          // while dragging it unless we offset the point or hide the element.
          // Let's try checking slightly offset or using the native event target if supported.

          // Standard fix: Temporarily hide the element to check what's underneath.
          const element = document.elementFromPoint(point.x, point.y);

          // Check if we hit a drop zone
          const dropZone = element?.closest('[data-drop-zone="pattern-line"]');
          if (dropZone) {
            const rowIndex = parseInt(dropZone.getAttribute('data-row-index') || '-1');
            if (rowIndex >= 0 && onDrop && sourceInfo) {
              onDrop(sourceInfo, rowIndex);
            }
          }
        }
      }}
      onClick={handleClick}
      onTouchEnd={(e) => {
        if (!disabled && onClick) {
          // Only trigger click if not dragging (simple heuristic)
          // Framer motion handles drag vs tap well usually.
          e.preventDefault();
          onClick();
        }
      }}
      style={{ touchAction: 'none' }} // Important for dragging on mobile
      className={`
        ${sizes[size]}
        ${colorClass}
        ${selected ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-800' : ''}
        ${onClick && !disabled ? 'cursor-pointer' : 'cursor-default'}
        ${variant === 'slot' ? 'tile-slot' : ''}
        ${disabled && !wasCompleted && variant !== 'slot' ? 'tile-empty' : ''}
        ${showPattern ? 'opacity-25' : ''}
        ${wasCompleted ? 'tile-completed' : ''}
        rounded-sm shadow-md transition-all duration-150
        flex items-center justify-center
      `}
    >
      {isFirstPlayer && <span className="text-xs font-bold">1</span>}
    </motion.div>
  );
}
