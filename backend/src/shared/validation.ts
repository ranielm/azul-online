import {
  TileColor,
  GameState,
  PlayerMove,
  PatternLine,
  WallCell,
} from './types';
import { TILE_COLORS, WALL_PATTERN, MAX_PLAYER_NAME_LENGTH } from './constants';

export function isValidTileColor(color: string): color is TileColor {
  return TILE_COLORS.includes(color as TileColor);
}

export function isValidPlayerName(name: string): boolean {
  return (
    typeof name === 'string' &&
    name.trim().length > 0 &&
    name.trim().length <= MAX_PLAYER_NAME_LENGTH
  );
}

export function canPlaceTileInPatternLine(
  patternLine: PatternLine,
  color: TileColor,
  wall: WallCell[][],
  rowIndex: number
): boolean {
  // Check if the color is already on the wall in this row
  const wallRow = wall[rowIndex];
  const wallColumn = WALL_PATTERN[rowIndex].indexOf(color);
  if (wallRow[wallColumn].filled) {
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

export function validateMove(
  gameState: GameState,
  move: PlayerMove
): { valid: boolean; error?: string } {
  const { playerId, selection, placement } = move;

  // Check if it's the player's turn
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return { valid: false, error: 'Not your turn' };
  }

  // Check game phase
  if (gameState.phase !== 'playing') {
    return { valid: false, error: 'Game is not in playing phase' };
  }

  // Validate selection
  const { source, factoryIndex, color } = selection;

  if (!isValidTileColor(color)) {
    return { valid: false, error: 'Invalid tile color' };
  }

  let availableTiles: TileColor[] = [];

  if (source === 'factory') {
    if (factoryIndex === undefined || factoryIndex < 0 || factoryIndex >= gameState.factories.length) {
      return { valid: false, error: 'Invalid factory index' };
    }

    const factory = gameState.factories[factoryIndex];
    if (factory.length === 0) {
      return { valid: false, error: 'Factory is empty' };
    }

    availableTiles = factory.filter((t) => t === color);
  } else if (source === 'center') {
    if (gameState.centerPool.tiles.length === 0) {
      return { valid: false, error: 'Center pool is empty' };
    }

    availableTiles = gameState.centerPool.tiles.filter((t) => t === color);
  } else {
    return { valid: false, error: 'Invalid source' };
  }

  if (availableTiles.length === 0) {
    return { valid: false, error: 'No tiles of that color available' };
  }

  // Validate placement
  const { destination, patternLineIndex } = placement;
  const playerBoard = currentPlayer.board;

  if (destination === 'pattern-line') {
    if (patternLineIndex === undefined || patternLineIndex < 0 || patternLineIndex >= 5) {
      return { valid: false, error: 'Invalid pattern line index' };
    }

    if (!canPlaceTileInPatternLine(
      playerBoard.patternLines[patternLineIndex],
      color,
      playerBoard.wall,
      patternLineIndex
    )) {
      return { valid: false, error: 'Cannot place tiles in this pattern line' };
    }
  } else if (destination !== 'floor') {
    return { valid: false, error: 'Invalid destination' };
  }

  return { valid: true };
}
