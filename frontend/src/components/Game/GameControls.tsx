import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { ConfirmModal } from '../UI/ConfirmModal';

interface GameControlsProps {
  onLeaveGame: () => void;
}

export function GameControls({ onLeaveGame }: GameControlsProps) {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  const handleLeaveClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    onLeaveGame();
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-32 z-40 flex gap-2"
      >
        {/* Fullscreen Toggle */}
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(232, 241, 242, 0.2)' }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleFullscreen}
          className="glass-card p-3 rounded-lg transition-all duration-200 group"
          title={isFullscreen ? t.exitFullscreen : t.enterFullscreen}
        >
          {isFullscreen ? (
            // Minimize icon
            <svg
              className="w-5 h-5 text-tile-white group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            </svg>
          ) : (
            // Maximize icon
            <svg
              className="w-5 h-5 text-tile-white group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          )}
        </motion.button>

        {/* Leave Game Button */}
        <motion.button
          whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLeaveClick}
          className="glass-card p-3 rounded-lg transition-all duration-200 group
                     hover:border-red-500/50"
          title={t.leaveGame}
        >
          <svg
            className="w-5 h-5 text-tile-white group-hover:text-red-400 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </motion.button>
      </motion.div>

      {/* Leave Game Confirmation Modal */}
      <ConfirmModal
        isOpen={showLeaveModal}
        title={t.leaveGameTitle}
        message={t.leaveGameMessage}
        confirmText={t.leaveGame}
        cancelText={t.stay}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        variant="danger"
      />
    </>
  );
}
