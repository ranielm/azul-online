import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@shared/types';
import { Button } from '../UI/Button';

interface GameOverProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onRestart: () => void;
  onLeave: () => void;
}

export function GameOver({
  gameState,
  playerId,
  isHost,
  onRestart,
  onLeave,
}: GameOverProps) {
  const sortedPlayers = [...gameState.players].sort(
    (a, b) => b.board.score - a.board.score
  );
  const winner = sortedPlayers[0];
  const isWinner = winner.id === playerId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-800 rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {isWinner ? '🏆' : '🎮'}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">
            {isWinner ? 'You Won!' : 'Game Over'}
          </h2>
          <p className="text-slate-400">
            {isWinner
              ? 'Congratulations on your victory!'
              : `${winner.name} wins the game!`}
          </p>
        </div>

        {/* Final standings */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Final Scores
          </h3>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`
                flex items-center justify-between p-3 rounded-lg
                ${index === 0 ? 'bg-yellow-600/20 border border-yellow-600' : 'bg-slate-700'}
              `}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold
                    ${index === 0 ? 'bg-yellow-600' : 'bg-slate-600'}
                  `}
                >
                  {index + 1}
                </span>
                <span className="font-medium">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-blue-400 ml-2">(You)</span>
                  )}
                </span>
              </div>
              <span className="text-xl font-bold text-yellow-400">
                {player.board.score}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <Button variant="primary" onClick={onRestart} className="w-full">
              Play Again
            </Button>
          ) : (
            <p className="text-center text-slate-400 text-sm">
              Waiting for host to restart...
            </p>
          )}
          <Button variant="ghost" onClick={onLeave} className="w-full">
            Leave Room
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
