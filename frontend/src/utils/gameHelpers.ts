import { TileColor, PatternLine, WallCell } from '@shared/types';
import { WALL_PATTERN } from '@shared/constants';

export function getTileColorClass(color: TileColor | 'first-player'): string {
  switch (color) {
    case 'blue':
      return 'tile-blue';
    case 'yellow':
      return 'tile-yellow';
    case 'red':
      return 'tile-red';
    case 'black':
      return 'tile-black';
    case 'white':
      return 'tile-white';
    case 'first-player':
      return 'tile-first-player';
    default:
      return '';
  }
}

export function canPlaceTileInPatternLine(
  patternLine: PatternLine,
  color: TileColor,
  wall: WallCell[][],
  rowIndex: number
): boolean {
  // Check if the color is already on the wall in this row
  const wallColumn = WALL_PATTERN[rowIndex].indexOf(color);
  if (wall[rowIndex][wallColumn].filled) {
    return false;
  }

  // Check if pattern line is empty or has the same color
  if (patternLine.count === 0) {
    return true;
  }

  if (patternLine.color === color && patternLine.count < patternLine.capacity) {
    return true;
  }

  return false;
}

export function getValidPatternLines(
  patternLines: PatternLine[],
  wall: WallCell[][],
  color: TileColor
): number[] {
  const validLines: number[] = [];

  for (let i = 0; i < patternLines.length; i++) {
    if (canPlaceTileInPatternLine(patternLines[i], color, wall, i)) {
      validLines.push(i);
    }
  }

  return validLines;
}

export function groupTilesByColor(tiles: TileColor[]): Map<TileColor, number> {
  const groups = new Map<TileColor, number>();

  for (const tile of tiles) {
    groups.set(tile, (groups.get(tile) || 0) + 1);
  }

  return groups;
}

export function getWallColumnForColor(row: number, color: TileColor): number {
  return WALL_PATTERN[row].indexOf(color);
}

export function formatScore(score: number): string {
  return score.toString().padStart(3, ' ');
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }

  // Fallback for older browsers
  return new Promise((resolve, reject) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

export function getRoomUrl(roomId: string): string {
  return `${window.location.origin}?room=${roomId}`;
}
