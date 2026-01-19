// Tile colors
export type TileColor = 'blue' | 'yellow' | 'red' | 'black' | 'white';

// All tile types including first player marker
export type Tile = TileColor | 'first-player';

// Factory containing 0-4 tiles
export type Factory = TileColor[];

// Center pool with tiles and possibly first-player marker
export interface CenterPool {
  tiles: TileColor[];
  hasFirstPlayer: boolean;
}

// Pattern line (preparation area row)
export interface PatternLine {
  color: TileColor | null;
  count: number;
  capacity: number;
}

// Wall cell
export interface WallCell {
  color: TileColor;
  filled: boolean;
  wasCompleted: boolean;
}

// Player board state
export interface PlayerBoard {
  patternLines: PatternLine[];
  wall: WallCell[][];
  floorLine: Tile[];
  score: number;
}

// Player in a game
export interface Player {
  id: string;
  name: string;
  image?: string;
  board: PlayerBoard;
  isConnected: boolean;
  isHost: boolean;
}

// Game phases
export type GamePhase =
  | 'waiting'
  | 'playing'
  | 'wall-tiling'
  | 'finished';

// Full game state
export interface GameState {
  id: string;
  players: Player[];
  factories: Factory[];
  centerPool: CenterPool;
  bag: TileColor[];
  discard: TileColor[];
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  phase: GamePhase;
  round: number;
  winner: string | null;
}

// Room metadata
export interface Room {
  id: string;
  createdAt: Date;
  gameState: GameState;
  maxPlayers: 2 | 3 | 4;
}

// Player move action
export interface TileSelection {
  source: 'factory' | 'center';
  factoryIndex?: number;
  color: TileColor;
}

export interface TilePlacement {
  destination: 'pattern-line' | 'floor';
  patternLineIndex?: number;
}

export interface PlayerMove {
  playerId: string;
  selection: TileSelection;
  placement: TilePlacement;
}

// Score tracking
export interface RoundScore {
  playerId: string;
  tilesPlaced: number;
  adjacencyBonus: number;
  floorPenalty: number;
  roundTotal: number;
}

export interface FinalScore {
  playerId: string;
  playerName: string;
  baseScore: number;
  rowBonus: number;
  columnBonus: number;
  colorBonus: number;
  finalTotal: number;
}

// Socket event payloads
export interface CreateRoomPayload {
  playerName: string;
  playerImage?: string;
  maxPlayers: 2 | 3 | 4;
}

export interface JoinRoomPayload {
  roomId: string;
  playerName: string;
  playerImage?: string;
}

export interface GameMovePayload {
  roomId: string;
  move: PlayerMove;
}

export interface RoomIdPayload {
  roomId: string;
}

export interface ReconnectPayload {
  roomId: string;
  playerId: string;
}

// Socket response payloads
export interface RoomCreatedResponse {
  room: Room;
  playerId: string;
}

export interface RoomJoinedResponse {
  room: Room;
  playerId: string;
}

export interface ErrorResponse {
  message: string;
}
