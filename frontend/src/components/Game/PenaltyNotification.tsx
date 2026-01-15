import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Player } from '@shared/types';
import { useTranslation } from '../../i18n/useLanguage';

interface PenaltyNotification {
  id: string;
  playerName: string;
  message: string;
  tilesAdded: number;
  hasFirstPlayer: boolean;
}

interface PenaltyNotificationProps {
  gameState: GameState;
  players: Player[];
}

export function PenaltyNotifications({ gameState, players }: PenaltyNotificationProps) {
  const [notifications, setNotifications] = useState<PenaltyNotification[]>([]);
  const prevFloorLinesRef = useRef<Map<string, number>>(new Map());
  const prevFirstPlayerRef = useRef<Map<string, boolean>>(new Map());
  const { t } = useTranslation();

  useEffect(() => {
    const newNotifications: PenaltyNotification[] = [];

    for (const player of players) {
      const prevFloorCount = prevFloorLinesRef.current.get(player.id) || 0;
      const currentFloorCount = player.board.floorLine.length;
      const hadFirstPlayer = prevFirstPlayerRef.current.get(player.id) || false;
      const hasFirstPlayer = player.board.floorLine.includes('first-player');

      // Detect new tiles added to floor (excluding first player marker detection)
      const regularTilesAdded = currentFloorCount - prevFloorCount;
      const firstPlayerJustTaken = hasFirstPlayer && !hadFirstPlayer;

      if (regularTilesAdded > 0 || firstPlayerJustTaken) {
        // Calculate how many non-first-player tiles were added
        const tilesAdded = firstPlayerJustTaken ? regularTilesAdded - 1 : regularTilesAdded;

        if (tilesAdded > 0) {
          newNotifications.push({
            id: `${player.id}-${Date.now()}-tiles`,
            playerName: player.name,
            message: t.penaltyFloorChoice(player.name, tilesAdded),
            tilesAdded,
            hasFirstPlayer: false,
          });
        }

        if (firstPlayerJustTaken) {
          newNotifications.push({
            id: `${player.id}-${Date.now()}-fp`,
            playerName: player.name,
            message: t.penaltyFirstPlayer(player.name),
            tilesAdded: 1,
            hasFirstPlayer: true,
          });
        }
      }

      // Update refs for next comparison
      prevFloorLinesRef.current.set(player.id, currentFloorCount);
      prevFirstPlayerRef.current.set(player.id, hasFirstPlayer);
    }

    if (newNotifications.length > 0) {
      setNotifications((prev) => [...prev, ...newNotifications]);

      // Auto-remove notifications after 4 seconds
      setTimeout(() => {
        setNotifications((prev) =>
          prev.filter((n) => !newNotifications.some((nn) => nn.id === n.id))
        );
      }, 4000);
    }
  }, [gameState, players, t]);

  // Reset refs when game restarts (round 1)
  useEffect(() => {
    if (gameState.round === 1) {
      prevFloorLinesRef.current.clear();
      prevFirstPlayerRef.current.clear();
    }
  }, [gameState.round]);

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className={`
              px-4 py-3 rounded-lg shadow-lg flex items-center gap-3
              ${notification.hasFirstPlayer
                ? 'bg-purple-600/90 border border-purple-400'
                : 'bg-red-600/90 border border-red-400'}
            `}
          >
            {/* Warning icon */}
            <div className="flex-shrink-0">
              {notification.hasFirstPlayer ? (
                <svg className="w-5 h-5 text-purple-200" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {notification.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
              }
              className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
