import { WallCell, TileColor, Tile } from '../../../packages/shared/src/types';

// Points for completing a horizontal row
export const POINTS_ROW_COMPLETE = 2;
// Points for completing a vertical column
export const POINTS_COLUMN_COMPLETE = 7;
// Points for collecting 5 of the same color
export const POINTS_COLOR_COMPLETE = 10;
// Floor line penalties sequence
export const FLOOR_PENALTIES = [-1, -1, -2, -2, -2, -3, -3];

/**
 * Calculates the score for a tile placed at the user-specified coordinates.
 * Adheres to standard Azul rules:
 * - 1 point for the tile itself if isolated.
 * - Points for horizontal contiguous line including the tile.
 * - Points for vertical contiguous line including the tile.
 * - If both horizontal and vertical lines are formed, count both (tile counts twice, effectively).
 */
export function calculatePlacementScore(
    wall: WallCell[][],
    row: number,
    col: number
): number {
    let score = 0;
    let horizontalPoints = 0;
    let verticalPoints = 0;

    // Check horizontal
    let hLeft = 0;
    let hRight = 0;

    // Count left
    for (let c = col - 1; c >= 0; c--) {
        if (wall[row][c].filled) {
            hLeft++;
        } else {
            break;
        }
    }

    // Count right
    for (let c = col + 1; c < wall[row].length; c++) {
        if (wall[row][c].filled) {
            hRight++;
        } else {
            break;
        }
    }

    if (hLeft > 0 || hRight > 0) {
        horizontalPoints = hLeft + 1 + hRight; // +1 for the placed tile
    }

    // Check vertical
    let vUp = 0;
    let vDown = 0;

    // Count up
    for (let r = row - 1; r >= 0; r--) {
        if (wall[r][col].filled) {
            vUp++;
        } else {
            break;
        }
    }

    // Count down
    for (let r = row + 1; r < wall.length; r++) {
        if (wall[r][col].filled) {
            vDown++;
        } else {
            break;
        }
    }

    if (vUp > 0 || vDown > 0) {
        verticalPoints = vUp + 1 + vDown; // +1 for the placed tile
    }

    // If connected in both directions, count sum of both
    if (horizontalPoints > 0 && verticalPoints > 0) {
        score = horizontalPoints + verticalPoints;
    } else if (horizontalPoints > 0) {
        score = horizontalPoints;
    } else if (verticalPoints > 0) {
        score = verticalPoints;
    } else {
        // Isolated tile
        score = 1;
    }

    return score;
}

/**
 * Calculates the total penalty for tiles in the floor line.
 */
export function calculateFloorPenalty(floorLine: Tile[]): number {
    let penalty = 0;
    for (let i = 0; i < floorLine.length; i++) {
        // Use defined penalties or max out at -3 for overflow
        const p = i < FLOOR_PENALTIES.length ? FLOOR_PENALTIES[i] : -3;
        penalty += p;
    }
    return penalty;
}

export interface EndGameBonuses {
    rowBonus: number;
    columnBonus: number;
    colorBonus: number;
    totalBonus: number;
}

/**
 * Calculates end-game bonuses for rows, columns, and full color sets.
 */
export function calculateEndGameBonuses(wall: WallCell[][]): EndGameBonuses {
    let rowBonus = 0;
    let columnBonus = 0;
    let colorBonus = 0;
    const wallSize = wall.length;

    // Check Rows
    for (let r = 0; r < wallSize; r++) {
        if (wall[r].every((cell) => cell.filled)) {
            rowBonus += POINTS_ROW_COMPLETE;
        }
    }

    // Check Columns
    for (let c = 0; c < wallSize; c++) {
        let colFilled = true;
        for (let r = 0; r < wallSize; r++) {
            if (!wall[r][c].filled) {
                colFilled = false;
                break;
            }
        }
        if (colFilled) {
            columnBonus += POINTS_COLUMN_COMPLETE;
        }
    }

    // Check Colors
    const colors: TileColor[] = ['blue', 'yellow', 'red', 'black', 'white'];
    for (const color of colors) {
        let count = 0;
        for (let r = 0; r < wallSize; r++) {
            for (let c = 0; c < wallSize; c++) {
                if (wall[r][c].color === color && wall[r][c].filled) {
                    count++;
                }
            }
        }
        if (count === 5) {
            colorBonus += POINTS_COLOR_COMPLETE;
        }
    }

    return {
        rowBonus,
        columnBonus,
        colorBonus,
        totalBonus: rowBonus + columnBonus + colorBonus,
    };
}
