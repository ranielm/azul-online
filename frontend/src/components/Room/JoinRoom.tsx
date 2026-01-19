import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../UI/Button';
import { useTranslation } from '../../i18n/useLanguage';
import { useAuthStore } from '../../store/authStore';

interface JoinRoomProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  onBack: () => void;
  initialRoomId?: string;
}

export function JoinRoom({ onJoinRoom, onBack, initialRoomId = '' }: JoinRoomProps) {
  const { user, guestName, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  const [roomId, setRoomId] = useState(initialRoomId);
  const [playerName, setPlayerName] = useState('');
  const [showGuestInput, setShowGuestInput] = useState(false);

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  useEffect(() => {
    if (user) {
      setPlayerName(user.name || user.username || t.player);
    } else if (guestName) {
      setPlayerName(guestName);
    }
  }, [user, guestName]);

  const hasPredefinedName = !!(user || guestName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && playerName.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    try {
      const res = await fetch(`${apiUrl}/api/auth/csrf`, { credentials: 'include' });
      const data = await res.json();
      const csrfToken = data.csrfToken;

      if (!csrfToken) {
        console.error("Failed to get CSRF token");
        return;
      }

      // Store the room code in sessionStorage so we can return after login
      if (roomId.trim()) {
        sessionStorage.setItem('pendingRoomId', roomId.trim().toUpperCase());
      }

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${apiUrl}/api/auth/signin/${provider}`;

      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfToken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      // Add callbackUrl to return to this room (handling both manual entry and deep links)
      const targetUrl = new URL(window.location.href);
      if (roomId.trim()) {
        targetUrl.searchParams.set('room', roomId.trim());
      }

      const callbackInput = document.createElement('input');
      callbackInput.type = 'hidden';
      callbackInput.name = 'callbackUrl';
      callbackInput.value = targetUrl.toString();
      form.appendChild(callbackInput);

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("Login flow error:", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">{t.joinRoomTitle}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t.roomCode}
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder={t.enterRoomCode}
            maxLength={6}
            className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                     outline-none transition-colors uppercase tracking-widest text-center text-xl"
            autoFocus={!initialRoomId}
          />
        </div>

        {/* Show login options if not authenticated */}
        {!isAuthenticated && !showGuestInput && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm text-center">{t.loginToJoin || 'Faça login para entrar:'}</p>

            <button
              type="button"
              onClick={() => handleLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg 
                       transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.signInWithGoogle || 'Entrar com Google'}
            </button>

            <button
              type="button"
              onClick={() => handleLogin('github')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 
                       bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg 
                       transition-colors border border-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              {t.signInWithGitHub || 'Entrar com GitHub'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-slate-400">{t.or || 'ou'}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowGuestInput(true)}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white 
                       font-medium rounded-lg transition-colors"
            >
              {t.continueAsGuest || 'Continuar como convidado'}
            </button>
          </div>
        )}

        {/* Show name input for guests or when explicitly choosing guest mode */}
        {(!isAuthenticated && showGuestInput) && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.yourName}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.enterYourName}
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         outline-none transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* Show name input when authenticated - editable for custom display name */}
        {isAuthenticated && hasPredefinedName && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t.playingAs}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.enterYourName}
              maxLength={20}
              className="w-full px-4 py-3 bg-slate-700 rounded-lg border border-slate-600
                         focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         outline-none transition-colors"
            />
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
            {t.back}
          </Button>
          {(isAuthenticated || showGuestInput) && (
            <Button
              type="submit"
              variant="primary"
              disabled={!roomId.trim() || !playerName.trim()}
              className="flex-1"
            >
              {t.joinRoom}
            </Button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
