import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@shared/types';

interface SharedScoreTrackProps {
    players: Player[];
    currentPlayerId?: string;
}

// Player colors for pins
const PLAYER_COLORS = [
    { bg: 'bg-blue-500', border: 'border-blue-300', shadow: 'shadow-blue-500/50' },
    { bg: 'bg-red-500', border: 'border-red-300', shadow: 'shadow-red-500/50' },
    { bg: 'bg-green-500', border: 'border-green-300', shadow: 'shadow-green-500/50' },
    { bg: 'bg-yellow-500', border: 'border-yellow-300', shadow: 'shadow-yellow-500/50' },
];

// Pin offsets when multiple players have same score
const PIN_OFFSETS = [
    { x: -4, y: -4 },
    { x: 4, y: -4 },
    { x: -4, y: 4 },
    { x: 4, y: 4 },
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

    // Generate cells 0-100
    const cells = useMemo(() => Array.from({ length: 101 }, (_, i) => i), []);

    // Get player index for color assignment
    const getPlayerColor = (playerId: string) => {
        const index = players.findIndex(p => p.id === playerId);
        return PLAYER_COLORS[index % PLAYER_COLORS.length];
    };

    // Get initial letter for player pin
    const getPlayerInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="w-full glass-card p-4 rounded-xl mb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                    Score Track
                </h3>
                <div className="flex gap-2">
                    {players.map((player, idx) => (
                        <div key={player.id} className="flex items-center gap-1">
                            <div
                                className={`w-3 h-3 rounded-full ${PLAYER_COLORS[idx % PLAYER_COLORS.length].bg}`}
                            />
                            <span className="text-xs text-slate-400">
                                {player.name}: <span className="text-white font-bold">{player.board.score}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Score Track Grid */}
            <div className="relative">
                <div className="flex flex-wrap gap-[2px]">
                    {cells.map(cellNum => {
                        const isMilestone = cellNum % 10 === 0;
                        const playersOnCell = playersByScore.get(cellNum) || [];

                        return (
                            <div
                                key={cellNum}
                                className={`
                  relative flex items-center justify-center
                  w-6 h-6 sm:w-7 sm:h-7 rounded-sm text-[10px] font-medium
                  transition-all duration-200
                  ${isMilestone
                                        ? 'bg-slate-600/80 text-slate-200 border border-slate-500'
                                        : 'bg-slate-800/50 text-slate-500 border border-slate-700/30'
                                    }
                  ${playersOnCell.length > 0 ? 'ring-1 ring-yellow-400/50' : ''}
                `}
                            >
                                {/* Cell number (only show for milestones or empty cells) */}
                                {(isMilestone || playersOnCell.length === 0) && (
                                    <span className={playersOnCell.length > 0 ? 'opacity-30' : ''}>
                                        {cellNum}
                                    </span>
                                )}

                                {/* Player Pins */}
                                {playersOnCell.map((player, pinIdx) => {
                                    const color = getPlayerColor(player.id);
                                    const offset = playersOnCell.length > 1 ? PIN_OFFSETS[pinIdx % PIN_OFFSETS.length] : { x: 0, y: 0 };
                                    const isCurrentPlayer = player.id === currentPlayerId;

                                    return (
                                        <motion.div
                                            key={player.id}
                                            initial={{ scale: 0 }}
                                            animate={{
                                                scale: 1,
                                                x: offset.x,
                                                y: offset.y,
                                            }}
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20,
                                                delay: pinIdx * 0.05
                                            }}
                                            className={`
                        absolute w-5 h-5 sm:w-6 sm:h-6 rounded-full
                        ${color.bg} border-2 ${color.border}
                        flex items-center justify-center
                        text-[9px] sm:text-[10px] font-bold text-white
                        shadow-lg ${color.shadow}
                        ${isCurrentPlayer ? 'ring-2 ring-white animate-pulse' : ''}
                        z-10
                      `}
                                            title={`${player.name}: ${player.board.score} pts`}
                                        >
                                            {getPlayerInitial(player.name)}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar overlay for visual effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 rounded-full mt-2 overflow-hidden">
                    {players.map((player, idx) => {
                        const progress = Math.min(100, player.board.score);
                        return (
                            <motion.div
                                key={player.id}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={`absolute h-full ${PLAYER_COLORS[idx % PLAYER_COLORS.length].bg} opacity-60`}
                                style={{
                                    zIndex: players.length - idx,
                                    top: 0,
                                    left: 0,
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
