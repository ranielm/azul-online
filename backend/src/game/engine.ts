import {
  TileColor,
  GameState,
  PlayerMove,
  Player,
  PlayerBoard,
  PatternLine,
  WallCell,
  Factory,
  CenterPool,
  RoundScore,
  FinalScore,
} from '../shared/types';
import {
  TILE_COLORS,
  TILES_PER_COLOR,
  TILES_PER_FACTORY,
  FACTORIES_BY_PLAYER_COUNT,
  WALL_PATTERN,
  FLOOR_PENALTIES,
  MAX_FLOOR_TILES,
  PATTERN_LINE_COUNT,
  WALL_SIZE,
  BONUS_COMPLETE_ROW,
  BONUS_COMPLETE_COLUMN,
  BONUS_COMPLETE_COLOR,
} from '../shared/constants';
import { validateMove } from '../shared/validation';

// Shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Create initial tile bag
export function createBag(): TileColor[] {
  const bag: TileColor[] = [];
  for (const color of TILE_COLORS) {
    for (let i = 0; i < TILES_PER_COLOR; i++) {
      bag.push(color);
    }
  }
  return shuffleArray(bag);
}

// Create initial player board
export function createPlayerBoard(): PlayerBoard {
  const patternLines: PatternLine[] = [];
  for (let i = 0; i < PATTERN_LINE_COUNT; i++) {
    patternLines.push({
      color: null,
      count: 0,
      capacity: i + 1,
    });
  }

  const wall: WallCell[][] = [];
  for (let row = 0; row < WALL_SIZE; row++) {
    wall.push([]);
    for (let col = 0; col < WALL_SIZE; col++) {
      wall[row].push({
        color: WALL_PATTERN[row][col],
        filled: false,
      });
    }
  }

  return {
    patternLines,
    wall,
    floorLine: [],
    score: 0,
  };
}

// Fill factories from bag
export function fillFactories(
  bag: TileColor[],
  discard: TileColor[],
  factoryCount: number
): { factories: Factory[]; bag: TileColor[]; discard: TileColor[] } {
  let currentBag = [...bag];
  let currentDiscard = [...discard];
  const factories: Factory[] = [];

  for (let i = 0; i < factoryCount; i++) {
    const factory: Factory = [];

    for (let j = 0; j < TILES_PER_FACTORY; j++) {
      // If bag is empty, refill from discard
      if (currentBag.length === 0) {
        if (currentDiscard.length === 0) {
          // No more tiles available
          break;
        }
        currentBag = shuffleArray(currentDiscard);
        currentDiscard = [];
      }

      const tile = currentBag.pop();
      if (tile) {
        factory.push(tile);
      }
    }

    factories.push(factory);
  }

  return { factories, bag: currentBag, discard: currentDiscard };
}

// Initialize game state
export function initializeGame(
  roomId: string,
  players: Player[]
): GameState {
  const playerCount = players.length;
  const factoryCount = FACTORIES_BY_PLAYER_COUNT[playerCount] || 5;

  const bag = createBag();
  const { factories, bag: remainingBag, discard } = fillFactories(bag, [], factoryCount);

  // Initialize player boards
  const initializedPlayers = players.map((player) => ({
    ...player,
    board: createPlayerBoard(),
  }));

  return {
    id: roomId,
    players: initializedPlayers,
    factories,
    centerPool: { tiles: [], hasFirstPlayer: true },
    bag: remainingBag,
    discard,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    phase: 'playing',
    round: 1,
    winner: null,
  };
}

// Execute a player move
export function executeMove(
  gameState: GameState,
  move: PlayerMove
): GameState {
  const validation = validateMove(gameState, move);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid move');
  }

  const { selection, placement } = move;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const playerBoard = { ...currentPlayer.board };

  // Get tiles from source
  let selectedTiles: TileColor[] = [];
  let remainingTiles: TileColor[] = [];
  let tookFirstPlayer = false;

  if (selection.source === 'factory' && selection.factoryIndex !== undefined) {
    const factory = gameState.factories[selection.factoryIndex];
    selectedTiles = factory.filter((t) => t === selection.color);
    remainingTiles = factory.filter((t) => t !== selection.color);
  } else if (selection.source === 'center') {
    selectedTiles = gameState.centerPool.tiles.filter((t) => t === selection.color);
    remainingTiles = gameState.centerPool.tiles.filter((t) => t !== selection.color);

    if (gameState.centerPool.hasFirstPlayer) {
      tookFirstPlayer = true;
    }
  }

  // Update source
  const newFactories = [...gameState.factories];
  let newCenterPool = { ...gameState.centerPool };

  if (selection.source === 'factory' && selection.factoryIndex !== undefined) {
    newFactories[selection.factoryIndex] = [];
    newCenterPool = {
      ...newCenterPool,
      tiles: [...newCenterPool.tiles, ...remainingTiles],
    };
  } else if (selection.source === 'center') {
    newCenterPool = {
      tiles: remainingTiles,
      hasFirstPlayer: false,
    };
  }

  // Place tiles
  const newPatternLines = [...playerBoard.patternLines.map((pl) => ({ ...pl }))];
  let newFloorLine = [...playerBoard.floorLine];

  // Add first player tile to floor if taken
  if (tookFirstPlayer) {
    newFloorLine.push('first-player');
  }

  if (placement.destination === 'pattern-line' && placement.patternLineIndex !== undefined) {
    const lineIndex = placement.patternLineIndex;
    const patternLine = newPatternLines[lineIndex];
    const capacity = patternLine.capacity;
    const currentCount = patternLine.count;
    const availableSpace = capacity - currentCount;

    const tilesToPlace = Math.min(selectedTiles.length, availableSpace);
    const overflow = selectedTiles.length - tilesToPlace;

    newPatternLines[lineIndex] = {
      color: selection.color,
      count: currentCount + tilesToPlace,
      capacity,
    };

    // Overflow goes to floor
    for (let i = 0; i < overflow; i++) {
      if (newFloorLine.length < MAX_FLOOR_TILES) {
        newFloorLine.push(selection.color);
      }
    }
  } else if (placement.destination === 'floor') {
    // All tiles go to floor
    for (const tile of selectedTiles) {
      if (newFloorLine.length < MAX_FLOOR_TILES) {
        newFloorLine.push(tile);
      }
    }
  }

  // Update player board
  const updatedPlayers = gameState.players.map((p, index) => {
    if (index === gameState.currentPlayerIndex) {
      return {
        ...p,
        board: {
          ...playerBoard,
          patternLines: newPatternLines,
          floorLine: newFloorLine,
        },
      };
    }
    return p;
  });

  // Update first player index if first player tile was taken
  let newFirstPlayerIndex = gameState.firstPlayerIndex;
  if (tookFirstPlayer) {
    newFirstPlayerIndex = gameState.currentPlayerIndex;
  }

  // Move to next player
  const nextPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;

  // Check if round is over (all factories and center are empty)
  const allEmpty =
    newFactories.every((f) => f.length === 0) && newCenterPool.tiles.length === 0;

  return {
    ...gameState,
    players: updatedPlayers,
    factories: newFactories,
    centerPool: newCenterPool,
    currentPlayerIndex: nextPlayerIndex,
    firstPlayerIndex: newFirstPlayerIndex,
    phase: allEmpty ? 'wall-tiling' : 'playing',
  };
}

// Calculate adjacency score for a placed tile
function calculateAdjacencyScore(
  wall: WallCell[][],
  row: number,
  col: number
): number {
  let score = 1; // Base score for the tile itself

  // Count horizontal connections
  let horizontalCount = 0;
  // Check left
  for (let c = col - 1; c >= 0 && wall[row][c].filled; c--) {
    horizontalCount++;
  }
  // Check right
  for (let c = col + 1; c < WALL_SIZE && wall[row][c].filled; c++) {
    horizontalCount++;
  }

  // Count vertical connections
  let verticalCount = 0;
  // Check up
  for (let r = row - 1; r >= 0 && wall[r][col].filled; r--) {
    verticalCount++;
  }
  // Check down
  for (let r = row + 1; r < WALL_SIZE && wall[r][col].filled; r++) {
    verticalCount++;
  }

  // If connected in both directions, count the tile twice (once for each line)
  if (horizontalCount > 0 && verticalCount > 0) {
    score = horizontalCount + 1 + verticalCount + 1;
  } else if (horizontalCount > 0) {
    score = horizontalCount + 1;
  } else if (verticalCount > 0) {
    score = verticalCount + 1;
  }

  return score;
}

// Process wall-tiling phase for a player
export function processWallTiling(player: Player): {
  player: Player;
  roundScore: RoundScore;
  discardedTiles: TileColor[];
} {
  const board = { ...player.board };
  const newPatternLines = board.patternLines.map((pl) => ({ ...pl }));
  const newWall = board.wall.map((row) => row.map((cell) => ({ ...cell })));
  const discardedTiles: TileColor[] = [];

  let tilesPlaced = 0;
  let adjacencyBonus = 0;

  // Process each complete pattern line
  for (let row = 0; row < PATTERN_LINE_COUNT; row++) {
    const patternLine = newPatternLines[row];

    if (patternLine.count === patternLine.capacity && patternLine.color) {
      // Find the column for this color in the wall
      const col = WALL_PATTERN[row].indexOf(patternLine.color);

      // Place tile on wall
      newWall[row][col] = { ...newWall[row][col], filled: true };
      tilesPlaced++;

      // Calculate score for this tile
      const tileScore = calculateAdjacencyScore(newWall, row, col);
      adjacencyBonus += tileScore;

      // Discard remaining tiles from this pattern line
      for (let i = 0; i < patternLine.count - 1; i++) {
        discardedTiles.push(patternLine.color);
      }

      // Clear pattern line
      newPatternLines[row] = {
        color: null,
        count: 0,
        capacity: patternLine.capacity,
      };
    }
  }

  // Calculate floor penalty
  let floorPenalty = 0;
  for (let i = 0; i < board.floorLine.length; i++) {
    if (i < FLOOR_PENALTIES.length) {
      floorPenalty += FLOOR_PENALTIES[i];
    }

    // Add non-first-player tiles to discard
    const tile = board.floorLine[i];
    if (tile !== 'first-player') {
      discardedTiles.push(tile);
    }
  }

  // Calculate new score (minimum 0)
  const roundTotal = adjacencyBonus + floorPenalty;
  const newScore = Math.max(0, board.score + roundTotal);

  const updatedPlayer: Player = {
    ...player,
    board: {
      patternLines: newPatternLines,
      wall: newWall,
      floorLine: [],
      score: newScore,
    },
  };

  const roundScore: RoundScore = {
    playerId: player.id,
    tilesPlaced,
    adjacencyBonus,
    floorPenalty,
    roundTotal,
  };

  return { player: updatedPlayer, roundScore, discardedTiles };
}

// Check if any player has completed a horizontal row
export function checkGameEnd(players: Player[]): boolean {
  for (const player of players) {
    for (let row = 0; row < WALL_SIZE; row++) {
      if (player.board.wall[row].every((cell) => cell.filled)) {
        return true;
      }
    }
  }
  return false;
}

// Calculate final bonuses
export function calculateFinalScores(players: Player[]): FinalScore[] {
  return players.map((player) => {
    const wall = player.board.wall;
    let rowBonus = 0;
    let columnBonus = 0;
    let colorBonus = 0;

    // Check complete rows
    for (let row = 0; row < WALL_SIZE; row++) {
      if (wall[row].every((cell) => cell.filled)) {
        rowBonus += BONUS_COMPLETE_ROW;
      }
    }

    // Check complete columns
    for (let col = 0; col < WALL_SIZE; col++) {
      if (wall.every((row) => row[col].filled)) {
        columnBonus += BONUS_COMPLETE_COLUMN;
      }
    }

    // Check complete colors
    for (const color of TILE_COLORS) {
      let colorCount = 0;
      for (let row = 0; row < WALL_SIZE; row++) {
        const col = WALL_PATTERN[row].indexOf(color);
        if (wall[row][col].filled) {
          colorCount++;
        }
      }
      if (colorCount === 5) {
        colorBonus += BONUS_COMPLETE_COLOR;
      }
    }

    const finalTotal = player.board.score + rowBonus + columnBonus + colorBonus;

    return {
      playerId: player.id,
      playerName: player.name,
      baseScore: player.board.score,
      rowBonus,
      columnBonus,
      colorBonus,
      finalTotal,
    };
  });
}

// Process end of round
export function processEndOfRound(gameState: GameState): {
  gameState: GameState;
  roundScores: RoundScore[];
} {
  const updatedPlayers: Player[] = [];
  const roundScores: RoundScore[] = [];
  let allDiscardedTiles: TileColor[] = [];

  // Process wall-tiling for each player
  for (const player of gameState.players) {
    const result = processWallTiling(player);
    updatedPlayers.push(result.player);
    roundScores.push(result.roundScore);
    allDiscardedTiles = [...allDiscardedTiles, ...result.discardedTiles];
  }

  // Check if game should end
  const isGameOver = checkGameEnd(updatedPlayers);

  if (isGameOver) {
    // Calculate final scores and determine winner
    const finalScores = calculateFinalScores(updatedPlayers);
    const maxScore = Math.max(...finalScores.map((s) => s.finalTotal));
    const winner = finalScores.find((s) => s.finalTotal === maxScore);

    // Update player scores with final bonuses
    const finalPlayers = updatedPlayers.map((player) => {
      const finalScore = finalScores.find((s) => s.playerId === player.id);
      return {
        ...player,
        board: {
          ...player.board,
          score: finalScore?.finalTotal || player.board.score,
        },
      };
    });

    return {
      gameState: {
        ...gameState,
        players: finalPlayers,
        phase: 'finished',
        winner: winner?.playerId || null,
        discard: [...gameState.discard, ...allDiscardedTiles],
      },
      roundScores,
    };
  }

  // Start new round
  const factoryCount = FACTORIES_BY_PLAYER_COUNT[updatedPlayers.length] || 5;
  const newDiscard = [...gameState.discard, ...allDiscardedTiles];
  const { factories, bag, discard } = fillFactories(gameState.bag, newDiscard, factoryCount);

  return {
    gameState: {
      ...gameState,
      players: updatedPlayers,
      factories,
      centerPool: { tiles: [], hasFirstPlayer: true },
      bag,
      discard,
      currentPlayerIndex: gameState.firstPlayerIndex,
      phase: 'playing',
      round: gameState.round + 1,
    },
    roundScores,
  };
}
