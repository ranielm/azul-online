import { describe, it, expect } from 'vitest';
import {
    calculatePlacementScore,
    calculateFloorPenalty,
    calculateEndGameBonuses,
} from './scoring';
import type { WallCell, TileColor } from '../../../packages/shared/src/types';

// Helper to create a grid
function createWall(): WallCell[][] {
    const size = 5;
    const wall: WallCell[][] = [];
    const colors: TileColor[] = ['blue', 'yellow', 'red', 'black', 'white'];

    // Standard Azul diagonal pattern
    for (let r = 0; r < size; r++) {
        const row: WallCell[] = [];
        for (let c = 0; c < size; c++) {
            // (c - r + 5) % 5 logic for color pattern
            const colorIndex = (c - r + 5) % 5;
            row.push({
                color: colors[colorIndex],
                filled: false,
                wasCompleted: false
            });
        }
        wall.push(row);
    }
    return wall;
}

describe('Azul Scoring Engine', () => {
    describe('Immediate Placement Scoring', () => {
        it('scores 1 point for an isolated tile', () => {
            const wall = createWall();
            // Place a tile at 2,2 (isolated)
            wall[2][2].filled = true;

            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(1);
        });

        it('scores horizontal line (2 points for 2 tiles)', () => {
            const wall = createWall();
            // Pre-fill left neighbor
            wall[2][1].filled = true;
            // Place target at 2,2
            wall[2][2].filled = true;

            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(2);
        });

        it('scores horizontal line (3 points for middle insertion)', () => {
            const wall = createWall();
            // Pre-fill left and right neighbors
            wall[2][1].filled = true;
            wall[2][3].filled = true;
            // Place target at 2,2
            wall[2][2].filled = true;

            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(3);
        });

        it('scores vertical line (2 points for 2 tiles)', () => {
            const wall = createWall();
            // Pre-fill top neighbor
            wall[1][2].filled = true;
            // Place target at 2,2
            wall[2][2].filled = true;

            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(2);
        });

        it('scores vertical line (3 points for middle insertion)', () => {
            const wall = createWall();
            // Pre-fill top and bottom neighbors
            wall[1][2].filled = true;
            wall[3][2].filled = true;
            // Place target at 2,2
            wall[2][2].filled = true;

            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(3);
        });

        it('scores a COMBO (Horizontal + Vertical) correctly', () => {
            const wall = createWall();
            // Horizontal neighbors: 1 to left
            wall[2][1].filled = true;

            // Vertical neighbors: 1 above
            wall[1][2].filled = true;

            // Place at 2,2
            wall[2][2].filled = true;

            // Expectation:
            // Horizontal set: [2,1] + [2,2] => 2 points
            // Vertical set: [1,2] + [2,2] => 2 points
            // Total = 4 points
            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(4);
        });

        it('scores a complex COMBO (Cross shape)', () => {
            const wall = createWall();
            // Surrounding tiles
            wall[2][1].filled = true; // Left
            wall[2][3].filled = true; // Right
            wall[1][2].filled = true; // Top
            wall[3][2].filled = true; // Bottom

            // Place center at 2,2
            wall[2][2].filled = true;

            // Expectation:
            // Horizontal: 3 tiles (Left + Center + Right) => 3 pts
            // Vertical: 3 tiles (Top + Center + Bottom) => 3 pts
            // Total = 6 points
            const score = calculatePlacementScore(wall, 2, 2);
            expect(score).toBe(6);
        });
    });

    describe('Floor Penalties', () => {
        it('calculates correct penalties for first few tiles', () => {
            // [-1, -1, -2, -2, -2, -3, -3]
            expect(calculateFloorPenalty(['blue'])).toBe(-1);
            expect(calculateFloorPenalty(['blue', 'red'])).toBe(-2); // -1 + -1
            expect(calculateFloorPenalty(['blue', 'red', 'yellow'])).toBe(-4); // -1 + -1 + -2
        });

        it('calculates penalties correctly including overflow', () => {
            // 7 tiles: -1-1-2-2-2-3-3 = -14
            const sevenTiles = Array(7).fill('red');
            expect(calculateFloorPenalty(sevenTiles)).toBe(-14);

            // 8 tiles (overflow usually just caps or continues -3, logic says use -3 for overflow)
            // 7 tiles = -14. 8th tile should be -3. Total -17.
            const eightTiles = Array(8).fill('red');
            expect(calculateFloorPenalty(eightTiles)).toBe(-17);
        });
    });

    describe('End Game Bonuses', () => {
        it('calculates row bonuses (+2 per row)', () => {
            const wall = createWall();
            // Fill first row
            wall[0].forEach(c => c.filled = true);

            const bonuses = calculateEndGameBonuses(wall);
            expect(bonuses.rowBonus).toBe(2);
            expect(bonuses.columnBonus).toBe(0);
        });

        it('calculates column bonuses (+7 per column)', () => {
            const wall = createWall();
            // Fill first column
            wall.forEach(row => row[0].filled = true);

            const bonuses = calculateEndGameBonuses(wall);
            expect(bonuses.columnBonus).toBe(7);
            expect(bonuses.rowBonus).toBe(0);
        });

        it('calculates color bonuses (+10 per color set)', () => {
            const wall = createWall();
            // Fill all 'blue' tiles
            // In our helper, createWall generates correct pattern.
            // We just iterate and fill all blue ones.
            wall.forEach(row => {
                row.forEach(cell => {
                    if (cell.color === 'blue') cell.filled = true;
                });
            });

            const bonuses = calculateEndGameBonuses(wall);
            expect(bonuses.colorBonus).toBe(10);
        });
    });
});
