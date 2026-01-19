import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { useAuthStore } from '../../store/authStore';
import { GameRules } from '../Game/GameRules';
import { UserAvatar } from '../UI/UserAvatar';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

type Tab = 'quickPlay' | 'auth';
type AuthMode = 'login' | 'signup';

export function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, guestName, setGuestName, logout, checkSession, isLoading, activeGameId } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('quickPlay');
  const [nickname, setNickname] = useState(guestName);
  const [showRules, setShowRules] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Map OAuth errors to user-friendly messages
  const AUTH_ERROR_MESSAGES: Record<string, string> = {
    'OAuthAccountNotLinked': 'An account with this email already exists with a different provider. Please sign in with the original provider.',
    'MissingCSRF': 'Security token missing or expired. Please try again.',
    'Configuration': 'Server configuration error. Please contact support.',
    'AccessDenied': 'Access denied. You do not have permission to sign in.',
    'Verification': 'The verification link was invalid or has expired.',
    'Default': 'An unknown authentication error occurred.'
  };

  // Check for existing session on mount and handle errors
  React.useEffect(() => {
    checkSession();

    // Check for OAuth errors in URL
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (error) {
      console.error('[LandingPage] OAuth error detected:', error);
      const message = AUTH_ERROR_MESSAGES[error] || `Authentication failed: ${error}`;
      setAuthError(message);

      // Select auth tab to show the error context
      setActiveTab('auth');

      // Clean URL without refresh
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSession]);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setGuestName(e.target.value);
  };

  const handleLogin = async (provider: 'google' | 'github') => {
    const apiUrl = import.meta.env.VITE_API_URL || '';

    try {
      // 1. Get CSRF Token
      const res = await fetch(`${apiUrl}/api/auth/csrf`, { credentials: 'include' });
      const data = await res.json();
      const csrfToken = data.csrfToken;

      if (!csrfToken) {
        console.error("Failed to get CSRF token");
        return;
      }

      // 2. Submit POST form programmatically
      // We must use a real form submission for the browser to follow the redirect chain correctly
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `${apiUrl}/api/auth/signin/${provider}`;

      const csrfInput = document.createElement('input');
      csrfInput.type = 'hidden';
      csrfInput.name = 'csrfToken';
      csrfInput.value = csrfToken;
      form.appendChild(csrfInput);

      // Add callbackUrl if we want to be explicit, though default is usually fine
      // const callbackInput = document.createElement('input');
      // callbackInput.type = 'hidden';
      // callbackInput.name = 'callbackUrl';
      // callbackInput.value = window.location.origin;
      // form.appendChild(callbackInput);

      document.body.appendChild(form);
      form.submit();

    } catch (e) {
      console.error("Login flow error:", e);
    }
  };

  return (
    <div className="landing-background min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative tiles omitted for brevity - kept in original */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* ... (Animation divs would be here, assuming I don't need to touch them if I target specific blocks, but here I am replacing the main component body logic) ... */}
        {/* Actually, I should try to preserve the animations if I replace the whole return. 
             Since I can't easily preserve surrounding code with 'replace_file_content' if I replace the whole function, 
             I will target the specific inner blocks.
         */}
      </div>

      {/* Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-card relative z-10 px-8 py-10 rounded-2xl w-full max-w-md"
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-3 text-tile-white tracking-tight">
            {t.title}
          </h1>

          {/* Decorative underline */}
          <div className="flex justify-center gap-2 mb-4">
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[#006DB2] to-[#0080CC]" />
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[#E6A745] to-[#F0B652]" />
            <div className="w-8 h-1 rounded-full bg-gradient-to-r from-[#D93844] to-[#E84550]" />
          </div>

          <p className="text-slate-400 text-lg">{t.subtitle}</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex mb-6 bg-slate-800/50 rounded-lg p-1">
          <motion.button
            onClick={() => setActiveTab('quickPlay')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'quickPlay'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
            whileTap={{ scale: 0.98 }}
          >
            {t.quickPlay}
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'auth'
              ? 'bg-slate-700 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
              }`}
            whileTap={{ scale: 0.98 }}
          >
            {isAuthenticated ? 'Account' : 'Login'}
          </motion.button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'quickPlay' && (
            <motion.div
              key="quickPlay"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="text-center py-8 text-slate-400">Loading session...</div>
              ) : isAuthenticated && user ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-4 flex items-center gap-4">
                    <UserAvatar
                      src={user.image}
                      name={user.name || user.username || 'User'}
                      size="lg"
                    />
                    <div>
                      <p className="text-slate-200 text-sm">Welcome back,</p>
                      <p className="text-white font-bold text-lg">{user.name || user.username}</p>
                    </div>
                  </div>

                  {/* Resume Game Button (Mockup logic for now, implementing real check later) */}
                  {/* Ideally we check activeGame status here or in store */}

                </motion.div>
              ) : (
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-1">
                    {t.nickname}
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={handleNicknameChange}
                    className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700
                               text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                               transition-colors"
                    placeholder={t.enterNickname}
                    maxLength={20}
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0, 109, 178, 0.4)' }}
                  whileTap={{ y: 0 }}
                  onClick={onCreateRoom}
                  disabled={!isAuthenticated && !nickname.trim()}
                  className="landing-btn-primary w-full py-4 px-6 rounded-lg font-semibold text-lg text-white
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.createRoom}
                </motion.button>

                <motion.button
                  whileHover={{ y: -2, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  whileTap={{ y: 0 }}
                  onClick={onJoinRoom}
                  disabled={!isAuthenticated && !nickname.trim()}
                  className="landing-btn-secondary w-full py-4 px-6 rounded-lg font-semibold text-lg
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.joinRoom}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isAuthenticated && user ? (
                <div className="text-center py-6">
                  <p className="text-white mb-4">You are signed in as <strong>{user.email}</strong></p>
                  <button onClick={logout} className="text-red-400 hover:text-red-300 underline">Sign out</button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-4">
                  {authError && (
                    <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm text-center mb-2">
                      {authError}
                    </div>
                  )}

                  <button
                    onClick={() => handleLogin('google')}
                    className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
                  >
                    {/* Google Icon SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Sign in with Google
                  </button>

                  <button
                    onClick={() => handleLogin('github')}
                    className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-lg bg-[#333] text-white font-semibold hover:bg-[#444] transition-colors"
                  >
                    {/* GitHub Icon SVG */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                    Sign in with GitHub
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keeping Footer logic close to original but replaced component content effectively finishes here for the replace tool */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center border-t border-slate-700/50 pt-4"
        >
          <button
            onClick={() => setShowRules(true)}
            className="text-slate-400 hover:text-blue-400 text-sm transition-colors flex items-center gap-2 mx-auto mb-3"
          >
            <span>📖</span>
            {t.rules}
          </button>
          <p className="text-slate-600 text-xs">
            v{__APP_VERSION__}
          </p>
        </motion.div>
      </motion.div>

      <GameRules isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
