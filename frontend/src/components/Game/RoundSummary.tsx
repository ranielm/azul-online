import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Player, ScoreDetail, WallHighlight, WallCell } from '@shared/types';
import { Button } from '../UI/Button';
import { useTranslation } from '../../i18n/useLanguage';
import { useGameStore } from '../../store/gameStore';
import { Tile } from '../Tile/Tile';

interface PlayerRoundScore {
  playerId: string;
  playerName: string;
  tilesPlaced: number;
  wallBonus: number;
  floorPenalty: number;
  roundTotal: number;
  previousScore: number;
  newScore: number;
  details: ScoreDetail[];
}

interface RoundSummaryProps {
  gameState: GameState;
  playerId: string;
}

// Helper to calculate score for a specific cell in a grid
const calculateCellScore = (wall: WallCell[][], row: number, col: number) => {
  let horizontalBonus = 0;
  let verticalBonus = 0;

  // Horizontal check
  // Check left
  let c = col - 1;
  while (c >= 0 && wall[row][c].filled) {
    horizontalBonus++;
    c--;
  }
  // Check right
  c = col + 1;
  while (c < 5 && wall[row][c].filled) {
    horizontalBonus++;
    c++;
  }

  // Vertical check
  // Check up
  let r = row - 1;
  while (r >= 0 && wall[r][col].filled) {
    verticalBonus++;
    r--;
  }
  // Check down
  r = row + 1;
  while (r < 5 && wall[r][col].filled) {
    verticalBonus++;
    r++;
  }

  // Base Logic:
  // If no neighbors, 1 point.
  // If neighbors in one direction, 1 (base) + neighbors.
  // If neighbors in both directions, 2 (base for each line) + neighbors.
  // BUT the standard rule is simpler: Counting the contiguous line including the tile.

  // Standard Azul Scoring:
  // 1. Horiz: Count contiguous line including piece.
  // 2. Vert: Count contiguous line including piece.
  // 3. If only one line (length 1), count once. If both, sum them.

  // My variables horizontalBonus excludes self.
  const horizLength = horizontalBonus > 0 ? horizontalBonus + 1 : 0;
  const vertLength = verticalBonus > 0 ? verticalBonus + 1 : 0;

  let total = 0;
  let basePoints = 0;

  if (horizLength > 0 && vertLength > 0) {
    total = horizLength + vertLength;
    basePoints = 2; // contributes to 2 lines
  } else if (horizLength > 0) {
    total = horizLength;
    basePoints = 1;
  } else if (vertLength > 0) {
    total = vertLength;
    basePoints = 1;
  } else {
    total = 1; // standalone
    basePoints = 1;
  }

  return {
    basePoints,
    horizontalBonus,
    verticalBonus,
    total,
    horizNeighbors: horizontalBonus, // legacy naming fix
    vertNeighbors: verticalBonus
  };
};

// Helper to get neighbor coordinates for highlighting
const getNeighbors = (wall: WallCell[][], row: number, col: number): WallHighlight[] => {
  const neighbors: WallHighlight[] = [];

  // Horizontal
  let c = col - 1;
  while (c >= 0 && wall[row][c].filled) {
    neighbors.push({ row, col: c, type: 'neighbor' });
    c--;
  }
  c = col + 1;
  while (c < 5 && wall[row][c].filled) {
    neighbors.push({ row, col: c, type: 'neighbor' });
    c++;
  }

  // Vertical
  let r = row - 1;
  while (r >= 0 && wall[r][col].filled) {
    neighbors.push({ row: r, col, type: 'neighbor' });
    r--;
  }
  r = row + 1;
  while (r < 5 && wall[r][col].filled) {
    neighbors.push({ row: r, col, type: 'neighbor' });
    r++;
  }

  return neighbors;
};

export function RoundSummary({ gameState, playerId }: RoundSummaryProps) {
  const [showSummary, setShowSummary] = useState(false);
  const [roundScores, setRoundScores] = useState<PlayerRoundScore[]>([]);
  const [completedRound, setCompletedRound] = useState(0);
  const prevRoundRef = useRef<number>(0);
  const prevScoresRef = useRef<Map<string, number>>(new Map());
  // Using JSON string to store deep copy of previous wall state to detect EXACT new tiles
  const prevWallsRef = useRef<Map<string, string>>(new Map());

  const { setHighlightedCells } = useGameStore();
  const { t } = useTranslation();

  // Calculate round scores when round changes
  useEffect(() => {
    const currentRound = gameState.round;
    const prevRound = prevRoundRef.current;

    // Detect round change (round increased = wall-tiling completed)
    if (prevRound > 0 && currentRound > prevRound && gameState.phase === 'playing') {
      const scores: PlayerRoundScore[] = [];

      for (const player of gameState.players) {
        const prevScore = prevScoresRef.current.get(player.id) || 0;
        const prevWallJson = prevWallsRef.current.get(player.id);
        const prevWall: WallCell[][] = prevWallJson ? JSON.parse(prevWallJson) : [];
        const newScore = player.board.score;

        const currentWall = player.board.wall;

        // Find new tiles
        const newTiles: { row: number, col: number, color: any }[] = [];

        currentWall.forEach((row, r) => {
          row.forEach((cell, c) => {
            const prevCell = prevWall[r]?.[c];
            const prevCellFilled = prevCell ? prevCell.filled : false;
            if (cell.filled && !prevCellFilled) {
              newTiles.push({ row: r, col: c, color: cell.color });
            }
          });
        });

        // IMPORTANT: Scoring must be purely sequential (Top to Bottom).
        // Sorting by Row ensures we simulate the "One by One" rule.
        newTiles.sort((a, b) => a.row - b.row);

        // Create a temporary wall to simulate the sequence
        // Deep copy the previous wall to start
        const tempWall: WallCell[][] = prevWall.length > 0
          ? JSON.parse(JSON.stringify(prevWall))
          : Array(5).fill(null).map(() => Array(5).fill({ filled: false, color: 'blue' }));
        // Note: Color placeholder 'blue' is fine, we just check 'filled' for adjacency logic helper

        const details: ScoreDetail[] = [];
        let tilesPlacedCount = 0;

        for (const tile of newTiles) {
          tilesPlacedCount++;

          // 1. Calculate score relative to the WALL AS IT EXISTS NOW (including prev tiles this round)
          // The helper 'calculateCellScore' returns the breakdown

          // We need to mark it as filled temporarily in the helper? 
          // Actually, the helper usually assumes the tile is IN the grid.
          // So we should ADD it to tempWall FIRST?
          // "The moment a tile is moved ... Points are calculated based on Final Position"
          // "Count all tiles in that continuous sequence INCLUDING THE ONE JUST PLACED"

          // So: Update tempWall -> Calculate
          if (!tempWall[tile.row]) tempWall[tile.row] = []; // Safety check
          if (!tempWall[tile.row][tile.col]) tempWall[tile.row][tile.col] = { filled: true, color: tile.color } as any;
          else tempWall[tile.row][tile.col].filled = true; // Mark filled

          const score = calculateCellScore(tempWall, tile.row, tile.col);

          details.push({
            row: tile.row,
            col: tile.col,
            color: tile.color,
            basePoints: score.basePoints,
            horizontalBonus: score.horizNeighbors,
            verticalBonus: score.vertNeighbors,
            total: score.total
          });
        }

        // We can now sum up details to check accuracy, but we trust the server score mostly.
        // The remaining delta is Floor Penalty.
        const scoreFromPlacement = details.reduce((acc, d) => acc + d.total, 0);
        const actualScoreDelta = newScore - prevScore;
        // Floor penalty is the discrepancy (usually negative)
        // If scoreFromPlacement is 5, and actualDelta is 3, penalty is -2.
        const floorPenalty = actualScoreDelta - scoreFromPlacement;

        scores.push({
          playerId: player.id,
          playerName: player.name,
          tilesPlaced: tilesPlacedCount,
          wallBonus: scoreFromPlacement, // This is technically "Placement Score"
          floorPenalty: floorPenalty,
          roundTotal: actualScoreDelta,
          previousScore: prevScore,
          newScore,
          details
        });
      }

      setRoundScores(scores);
      setCompletedRound(prevRound);
      setShowSummary(true);
    }

    // Update refs for next comparison
    prevRoundRef.current = currentRound;
    for (const player of gameState.players) {
      prevScoresRef.current.set(player.id, player.board.score);
      prevWallsRef.current.set(player.id, JSON.stringify(player.board.wall));
    }
  }, [gameState.round, gameState.phase, gameState.players]); // Removed t dependency to avoid re-runs

  // Auto-close after 15 seconds (increased for reading)
  useEffect(() => {
    if (showSummary) {
      const timer = setTimeout(() => {
        handleClose();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showSummary]);

  const handleClose = useCallback(() => {
    setShowSummary(false);
    setHighlightedCells([]); // Clear highlights
  }, [setHighlightedCells]);

  const handleHoverDetail = (playerId: string, detail: ScoreDetail | null) => {
    // Only highlight if it's the local player's details being hovered
    // Or we could support highlighting others too if we can see their board.
    // For now, let's support viewing own highlights.
    if (!detail) {
      setHighlightedCells([]);
      return;
    }

    const player = gameState.players.find(p => p.id === playerId);
    if (!player) return;

    const neighbors = getNeighbors(player.board.wall, detail.row, detail.col);
    setHighlightedCells([
      { row: detail.row, col: detail.col, type: 'focus' },
      ...neighbors
    ]);
  };

  // Sort by new score descending
  const sortedScores = [...roundScores].sort((a, b) => b.newScore - a.newScore);

  return (
    <AnimatePresence>
      {showSummary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-start justify-end z-40 p-4 pointer-events-none"
        >
          {/* 
                Changed Layout: 
                - Sidebar/Panel style on the right instead of centered modal.
                - Allows seeing the board (especially the Wall) while reading scores.
                - Pointer events enabled on the card itself.
            */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="bg-slate-800 shadow-2xl rounded-l-2xl p-6 w-full max-w-md h-full overflow-y-auto pointer-events-auto border-l border-slate-700"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {t.roundComplete(completedRound)}
                </h2>
                <p className="text-slate-400 text-sm">
                  {t.nextRound(gameState.round)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                ✕
              </Button>
            </div>

            {/* Player Scores */}
            <div className="space-y-6">
              {sortedScores.map((score, index) => (
                <div key={score.playerId} className="space-y-3">
                  {/* Player Header */}
                  <div className={`p-3 rounded-lg flex justify-between items-center ${score.playerId === playerId ? 'bg-blue-900/40 border border-blue-500/50' : 'bg-slate-700/50'}`}>
                    <span className="font-bold flex items-center gap-2">
                      {score.playerName}
                      {score.playerId === playerId && <span className="text-xs text-blue-400">({t.you})</span>}
                    </span>
                    <span className="text-green-400 font-bold">+{score.roundTotal} pts</span>
                  </div>

                  {/* Score Breakdown (Cards) */}
                  <div className="space-y-2 pl-2">
                    {score.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="bg-slate-900/50 p-2 rounded flex items-center gap-3 text-sm cursor-help hover:bg-slate-700 transition-colors border border-slate-700/50 hover:border-yellow-500/50"
                        onMouseEnter={() => score.playerId === playerId && handleHoverDetail(score.playerId, detail)}
                        onMouseLeave={() => score.playerId === playerId && handleHoverDetail(score.playerId, null)}
                      >
                        <Tile color={detail.color} size="sm" disabled />
                        <div className="flex-1">
                          <div className="flex justify-between text-slate-300">
                            <span>Base</span>
                            <span>1</span>
                          </div>
                          {(detail.horizontalBonus > 0 || detail.verticalBonus > 0) && (
                            <div className="flex justify-between text-yellow-500 text-xs">
                              <span>Bonus</span>
                              <span>+{detail.horizontalBonus + detail.verticalBonus}</span>
                            </div>
                          )}
                        </div>
                        <div className="font-bold text-lg min-w-[24px] text-right">
                          {detail.total}
                        </div>
                      </div>
                    ))}

                    {/* Floor Penalty */}
                    {score.floorPenalty < 0 && (
                      <div className="bg-red-900/20 p-2 rounded flex justify-between text-sm items-center text-red-400 border border-red-900/30">
                        <span>{t.floorPenalty}</span>
                        <span className="font-bold">{score.floorPenalty}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Continue button */}
            <div className="mt-8">
              <Button
                variant="primary"
                onClick={handleClose}
                className="w-full"
              >
                {t.continueGame}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
