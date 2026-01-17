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
    <div className="fixed z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 sm:w-auto left-0 sm:left-auto top-20 sm:top-auto sm:bottom-4 sm:right-4 items-center sm:items-end pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto
              w-full sm:w-80
              px-4 py-4 sm:py-3 rounded-lg shadow-xl flex items-center gap-3
              backdrop-blur-sm border-2
              ${notification.hasFirstPlayer
                ? 'bg-purple-600/95 border-purple-400 shadow-purple-900/50'
                : 'bg-red-600/95 border-red-400 shadow-red-900/50'}
            `}
          >
            {/* Warning icon - larger on mobile */}
            <div className="flex-shrink-0">
              {notification.hasFirstPlayer ? (
                <svg className="w-8 h-8 sm:w-6 sm:h-6 text-purple-100 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            {/* Message - larger text on mobile */}
            <div className="flex-1 min-w-0">
              <p className="text-base sm:text-sm font-bold sm:font-medium text-white shadow-black drop-shadow-md">
                {notification.message}
              </p>
            </div>

            {/* Close button - larger target on mobile */}
            <button
              onClick={() =>
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
              }
              className="flex-shrink-0 p-2 sm:p-0 -mr-2 sm:mr-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
