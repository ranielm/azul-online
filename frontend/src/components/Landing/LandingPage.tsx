import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { LoginForm } from '../Auth/LoginForm';
import { SignUpForm } from '../Auth/SignUpForm';
import { useAuthStore } from '../../store/authStore';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

type Tab = 'quickPlay' | 'auth';
type AuthMode = 'login' | 'signup';

export function LandingPage({ onCreateRoom, onJoinRoom }: LandingPageProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated, guestName, setGuestName, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<Tab>('quickPlay');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [nickname, setNickname] = useState(guestName);

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setGuestName(e.target.value);
  };

  const handleAuthSuccess = () => {
    setActiveTab('quickPlay');
  };

  return (
    <div className="landing-background min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating decorative tiles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Blue tile */}
        <motion.div
          className="absolute w-24 h-24 rounded-lg opacity-20 blur-sm"
          style={{
            background: 'linear-gradient(145deg, #0080CC 0%, #005A99 100%)',
            top: '15%',
            left: '10%',
          }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Yellow tile */}
        <motion.div
          className="absolute w-20 h-20 rounded-lg opacity-15 blur-sm"
          style={{
            background: 'linear-gradient(145deg, #F0B652 0%, #CC8F38 100%)',
            top: '60%',
            left: '5%',
          }}
          animate={{
            y: [0, 15, 0],
            rotate: [0, -8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1,
          }}
        />
        {/* Red tile */}
        <motion.div
          className="absolute w-28 h-28 rounded-lg opacity-15 blur-sm"
          style={{
            background: 'linear-gradient(145deg, #E84550 0%, #BF2D38 100%)',
            top: '20%',
            right: '8%',
          }}
          animate={{
            y: [0, 25, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.5,
          }}
        />
        {/* White tile */}
        <motion.div
          className="absolute w-16 h-16 rounded-lg opacity-10 blur-sm"
          style={{
            background: 'linear-gradient(145deg, #F2F8F9 0%, #D8E4E6 100%)',
            bottom: '25%',
            right: '12%',
          }}
          animate={{
            y: [0, -18, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
        {/* Black/Slate tile */}
        <motion.div
          className="absolute w-20 h-20 rounded-lg opacity-20 blur-sm"
          style={{
            background: 'linear-gradient(145deg, #3D444D 0%, #1F252B 100%)',
            bottom: '15%',
            left: '15%',
          }}
          animate={{
            y: [0, 12, 0],
            rotate: [0, -6, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />
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

          {/* Decorative underline with game colors */}
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
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'quickPlay'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {t.quickPlay}
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'auth'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            whileTap={{ scale: 0.98 }}
          >
            {t.loginRegister}
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
              {/* Logged in user display */}
              {isAuthenticated && user && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center gap-3"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-blue-500">
                      <span className="text-lg font-bold text-white">
                        {user.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.username}</p>
                    <p className="text-slate-400 text-xs">{t.loggedIn}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-red-400 text-sm transition-colors"
                  >
                    {t.logout}
                  </button>
                </motion.div>
              )}

              {/* Guest nickname input */}
              {!isAuthenticated && (
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

              {/* Footer info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-center"
              >
                <p className="text-slate-500 text-sm">{t.noAccountNeeded}</p>
                <p className="text-slate-600 text-sm mt-1">2-4 {t.players}</p>
              </motion.div>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-6"
                >
                  <div className="flex flex-col items-center gap-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center border-4 border-blue-500">
                        <span className="text-3xl font-bold text-white">
                          {user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white text-xl font-semibold">{user.username}</p>
                      <p className="text-slate-400 text-sm">{user.email}</p>
                    </div>
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      onClick={logout}
                      className="landing-btn-secondary px-6 py-2 rounded-lg font-medium
                                 transition-all duration-200"
                    >
                      {t.logout}
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {authMode === 'login' ? (
                    <LoginForm
                      key="login"
                      onSwitchToSignUp={() => setAuthMode('signup')}
                      onSuccess={handleAuthSuccess}
                    />
                  ) : (
                    <SignUpForm
                      key="signup"
                      onSwitchToLogin={() => setAuthMode('login')}
                      onSuccess={handleAuthSuccess}
                    />
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Version info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center border-t border-slate-700/50 pt-4"
        >
          <p className="text-slate-600 text-xs">
            v{__APP_VERSION__} • Build {new Date(__BUILD_TIME__).toLocaleDateString('pt-BR')}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
