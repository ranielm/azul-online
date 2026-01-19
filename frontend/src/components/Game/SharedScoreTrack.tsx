import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@shared/types';
import { UserAvatar } from '../UI/UserAvatar';

interface SharedScoreTrackProps {
    players: Player[];
    currentPlayerId?: string;
}

// Player colors for pins
const PLAYER_COLORS = [
    { bg: 'bg-blue-500', border: 'border-blue-300', shadow: 'shadow-blue-500/50', gradient: 'from-blue-500 to-blue-600' },
    { bg: 'bg-red-500', border: 'border-red-300', shadow: 'shadow-red-500/50', gradient: 'from-red-500 to-red-600' },
    { bg: 'bg-emerald-500', border: 'border-emerald-300', shadow: 'shadow-emerald-500/50', gradient: 'from-emerald-500 to-emerald-600' },
    { bg: 'bg-amber-500', border: 'border-amber-300', shadow: 'shadow-amber-500/50', gradient: 'from-amber-500 to-amber-600' },
];

// Pin offsets when multiple players have same score
const PIN_OFFSETS = [
    { x: -6, y: 0 },
    { x: 6, y: 0 },
    { x: 0, y: -6 },
    { x: 0, y: 6 },
];

export function SharedScoreTrack({ players, currentPlayerId }: SharedScoreTrackProps) {
    // Group players by score for collision handling
    const playersByScore = useMemo(() => {
        const map = new Map<number, Player[]>();
        players.forEach(player => {
            const score = Math.min(100, Math.max(0, player.board.score));
            const existing = map.get(score) || [];
            map.set(score, [...existing, player]);
        });
        return map;
    }, [players]);

    // Only show milestone cells for cleaner look: 0, 5, 10, 15, ... 100
    const milestoneCells = useMemo(() =>
        Array.from({ length: 21 }, (_, i) => i * 5),
        []);

    // Get player index for color assignment
    const getPlayerColor = (playerId: string) => {
        const index = players.findIndex(p => p.id === playerId);
        return PLAYER_COLORS[index % PLAYER_COLORS.length];
    };

    // Find which milestone cell a player should be on (rounds down to nearest 5)
    const getPlayerMilestoneCell = (score: number) => {
        return Math.floor(score / 5) * 5;
    };

    // Get players on a specific milestone (within 5-point range)
    const getPlayersNearMilestone = (milestone: number) => {
        const playersInRange: Player[] = [];
        for (let i = milestone; i < milestone + 5 && i <= 100; i++) {
            const playersAtScore = playersByScore.get(i) || [];
            playersInRange.push(...playersAtScore);
        }
        return playersInRange;
    };

    return (
        <div className="w-full mb-4">
            {/* Player Legend - Compact horizontal list */}
            <div className="flex items-center justify-center gap-4 mb-3 flex-wrap">
                {players.map((player, idx) => {
                    const color = PLAYER_COLORS[idx % PLAYER_COLORS.length];
                    const isLeading = players.every(p => p.board.score <= player.board.score);

                    return (
                        <motion.div
                            key={player.id}
                            className={`
                flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-gradient-to-r ${color.gradient} bg-opacity-20
                border border-white/10
                ${player.id === currentPlayerId ? 'ring-2 ring-white/50' : ''}
              `}
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 border-white/50 shadow-md flex items-center justify-center overflow-hidden`}>
                                <UserAvatar src={player.image} name={player.name} size="sm" className="w-full h-full" />
                            </div>
                            <span className="text-sm font-medium text-white">
                                {player.name}
                            </span>
                            <span className={`
                text-lg font-bold 
                ${isLeading && players.length > 1 ? 'text-yellow-300' : 'text-white'}
              `}>
                                {player.board.score}
                            </span>
                            {isLeading && players.length > 1 && (
                                <span className="text-yellow-300 text-xs">👑</span>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Score Track - Clean horizontal bar */}
            <div className="relative bg-slate-800/50 rounded-2xl p-3 border border-slate-700/30">
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                    {milestoneCells.map(cellNum => {
                        const playersNear = getPlayersNearMilestone(cellNum);
                        const isMajorMilestone = cellNum % 20 === 0;
                        const isEndpoint = cellNum === 0 || cellNum === 100;

                        return (
                            <div
                                key={cellNum}
                                className={`
                  relative flex flex-col items-center justify-center flex-shrink-0
                  ${isMajorMilestone || isEndpoint ? 'w-12 h-12' : 'w-8 h-8'}
                  rounded-lg transition-all duration-200
                  ${isEndpoint
                                        ? 'bg-gradient-to-br from-slate-600 to-slate-700 border-2 border-slate-500'
                                        : isMajorMilestone
                                            ? 'bg-slate-700/80 border border-slate-600'
                                            : 'bg-slate-800/60 border border-slate-700/40'
                                    }
                `}
                            >
                                {/* Cell number */}
                                <span className={`
                  font-mono font-bold
                  ${isEndpoint ? 'text-base text-white' : isMajorMilestone ? 'text-xs text-slate-300' : 'text-[10px] text-slate-500'}
                `}>
                                    {cellNum}
                                </span>

                                {/* Player Pins */}
                                {playersNear.map((player, pinIdx) => {
                                    const color = getPlayerColor(player.id);
                                    const offset = playersNear.length > 1 ? PIN_OFFSETS[pinIdx % PIN_OFFSETS.length] : { x: 0, y: 0 };
                                    const isCurrentPlayer = player.id === currentPlayerId;
                                    const exactScore = player.board.score;

                                    // Only show on the correct milestone cell
                                    if (getPlayerMilestoneCell(exactScore) !== cellNum) return null;

                                    return (
                                        <motion.div
                                            key={player.id}
                                            initial={{ scale: 0, y: 20 }}
                                            animate={{
                                                scale: 1,
                                                x: offset.x,
                                                y: offset.y - 20,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 25,
                                            }}
                                            className={`
                        absolute w-8 h-8 rounded-full
                        ${color.bg} border-2 border-white
                        flex items-center justify-center
                        shadow-lg ${color.shadow}
                        ${isCurrentPlayer ? 'ring-2 ring-yellow-400 animate-bounce' : ''}
                        z-20
                      `}
                                            style={{ top: '-12px' }}
                                            title={`${player.name}: ${exactScore} pts`}
                                        >
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                <UserAvatar src={player.image} name={player.name} size="sm" />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Connecting line */}
                <div className="absolute top-1/2 left-3 right-3 h-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full -z-0 transform -translate-y-1/2" />
            </div>
        </div>
    );
}
