import { TileColor } from './types';

export const TILE_COLORS: TileColor[] = ['blue', 'yellow', 'red', 'black', 'white'];

export const TILES_PER_COLOR = 20;
export const TOTAL_TILES = 100;
export const TILES_PER_FACTORY = 4;

export const FACTORIES_BY_PLAYER_COUNT: Record<number, number> = {
  2: 5,
  3: 7,
  4: 9,
};

export const WALL_PATTERN: TileColor[][] = [
  ['blue', 'yellow', 'red', 'black', 'white'],
  ['white', 'blue', 'yellow', 'red', 'black'],
  ['black', 'white', 'blue', 'yellow', 'red'],
  ['red', 'black', 'white', 'blue', 'yellow'],
  ['yellow', 'red', 'black', 'white', 'blue'],
];

export const FLOOR_PENALTIES = [-1, -1, -2, -2, -2, -3, -3];

export const BONUS_COMPLETE_ROW = 2;
export const BONUS_COMPLETE_COLUMN = 7;
export const BONUS_COMPLETE_COLOR = 10;

export const MAX_FLOOR_TILES = 7;
export const PATTERN_LINE_COUNT = 5;
export const WALL_SIZE = 5;

export const ROOM_ID_LENGTH = 6;
export const MAX_PLAYER_NAME_LENGTH = 20;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

// Tile color to CSS class mapping
export const TILE_COLOR_CLASSES: Record<TileColor, string> = {
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  black: 'bg-gray-800',
  white: 'bg-white border-2 border-gray-300',
};

// Tile color to hex color mapping
export const TILE_COLOR_HEX: Record<TileColor, string> = {
  blue: '#1e40af',
  yellow: '#d97706',
  red: '#dc2626',
  black: '#374151',
  white: '#ffffff',
};
