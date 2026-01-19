import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { ConfirmModal } from '../UI/ConfirmModal';
import { GameRules } from './GameRules';
import { IconButton } from '../UI/IconButton';
import { useThemeStore } from '../../store/themeStore';

interface GameControlsProps {
  onLeaveGame: () => void;
  onShowTutorial?: () => void;
  roomId?: string;
}

export function GameControls({ onLeaveGame, onShowTutorial, roomId }: GameControlsProps) {
  const { t } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Use global theme store
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

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
        className="fixed top-4 right-32 z-40 flex items-center gap-2"
      >
        {/* Room Code Badge */}
        {roomId && (
          <div
            className="px-3 py-1.5 bg-slate-800/70 backdrop-blur-sm rounded-lg border border-slate-600/30 flex items-center gap-2 cursor-pointer hover:bg-slate-700/70 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              // Brief visual feedback
              const el = document.getElementById('room-code-badge');
              if (el) {
                el.classList.add('text-green-400');
                setTimeout(() => el.classList.remove('text-green-400'), 1500);
              }
            }}
            title={t.copyRoomLink}
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <span id="room-code-badge" className="font-mono text-sm text-slate-300 tracking-wider transition-colors">{roomId}</span>
          </div>
        )}

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleTheme}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          icon={
            isDark ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )
          }
        />

        {/* Tutorial Button */}
        {onShowTutorial && (
          <IconButton
            onClick={onShowTutorial}
            title="Tutorial"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        )}

        {/* Rules/Help Button */}
        <IconButton
          onClick={() => setShowRules(true)}
          title={t.rules}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        {/* Copy Link Button */}
        <IconButton
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            // We can't easily show a toast from here without props, 
            // but we can change the icon temporarily or rely on user knowing it works.
            // For better UX, let's toggle a local state to show a checkmark.
            const btn = document.getElementById('copy-link-btn');
            if (btn) {
              btn.classList.add('text-green-400');
              setTimeout(() => btn.classList.remove('text-green-400'), 2000);
            }
          }}
          title={t.copyRoomLink}
          icon={
            <svg id="copy-link-btn" className="w-5 h-5 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />

        {/* Fullscreen Toggle */}
        <IconButton
          onClick={toggleFullscreen}
          title={isFullscreen ? t.exitFullscreen : t.enterFullscreen}
          isActive={isFullscreen}
          icon={
            isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              </svg>
            )
          }
        />

        {/* Leave Game Button */}
        <IconButton
          onClick={handleLeaveClick}
          title={t.leaveGame}
          variant="danger"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        />
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

      {/* Game Rules Modal */}
      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} />
    </>
  );
}

