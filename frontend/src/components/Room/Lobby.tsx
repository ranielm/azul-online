import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Room, Player } from '@shared/types';
import { Button } from '../UI/Button';
import { copyToClipboard, getRoomUrl } from '../../utils/gameHelpers';

interface LobbyProps {
  room: Room;
  playerId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function Lobby({ room, playerId, onStartGame, onLeaveRoom }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const currentPlayer = room.gameState.players.find((p) => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const canStart = room.gameState.players.length >= 2;

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(getRoomUrl(room.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">Waiting Room</h2>

      {/* Room Code */}
      <div className="text-center mb-6">
        <p className="text-slate-400 text-sm mb-2">Room Code</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-bold tracking-widest text-blue-400">
            {room.id}
          </span>
          <Button size="sm" variant="ghost" onClick={handleCopyLink}>
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>

      {/* Players List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Players
          </h3>
          <span className="text-sm text-slate-500">
            {room.gameState.players.length}/{room.maxPlayers}
          </span>
        </div>

        <div className="space-y-2">
          {room.gameState.players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`
                    w-3 h-3 rounded-full
                    ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}
                  `}
                />
                <span className="font-medium">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-blue-400 ml-2">(You)</span>
                  )}
                </span>
              </div>
              {player.isHost && (
                <span className="text-xs bg-yellow-600 px-2 py-1 rounded font-semibold">
                  HOST
                </span>
              )}
            </motion.div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: room.maxPlayers - room.gameState.players.length }).map(
            (_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center p-3 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600"
              >
                <span className="text-slate-500">Waiting for player...</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {isHost ? (
          <>
            <Button
              variant="primary"
              onClick={onStartGame}
              disabled={!canStart}
              className="w-full"
            >
              {canStart ? 'Start Game' : `Need ${2 - room.gameState.players.length} more player(s)`}
            </Button>
            <p className="text-xs text-slate-500 text-center">
              As the host, only you can start the game
            </p>
          </>
        ) : (
          <p className="text-center text-slate-400">
            Waiting for host to start the game...
          </p>
        )}

        <Button variant="danger" onClick={onLeaveRoom} className="w-full">
          Leave Room
        </Button>
      </div>
    </motion.div>
  );
}
