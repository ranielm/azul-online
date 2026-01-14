import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { useAuthStore } from '../../store/authStore';
import { AvatarUpload } from './AvatarUpload';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

type Step = 'credentials' | 'avatar';

export function SignUpForm({ onSwitchToLogin, onSuccess }: SignUpFormProps) {
  const { t } = useTranslation();
  const { login } = useAuthStore();

  const [step, setStep] = useState<Step>('credentials');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.passwordsMustMatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setStep('avatar');
  };

  const handleAvatarSubmit = async () => {
    setIsLoading(true);

    // Simulate API call - replace with actual auth
    setTimeout(() => {
      login({
        id: 'user-' + Date.now(),
        username,
        email,
        avatar,
      });
      setIsLoading(false);
      onSuccess();
    }, 1000);
  };

  const handleBack = () => {
    setStep('credentials');
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {step === 'credentials' && (
          <motion.form
            key="credentials"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleCredentialsSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                {t.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700
                           text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                           transition-colors"
                placeholder={t.usernamePlaceholder}
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700
                           text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                           transition-colors"
                placeholder="player@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                {t.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700
                           text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                           transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700
                           text-white placeholder-slate-500 focus:outline-none focus:border-blue-500
                           transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="landing-btn-primary w-full py-3 px-6 rounded-lg font-semibold text-white
                         transition-all duration-200"
            >
              {t.continue}
            </motion.button>

            <p className="text-center text-slate-400 text-sm">
              {t.alreadyHaveAccount}{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t.login}
              </button>
            </p>
          </motion.form>
        )}

        {step === 'avatar' && (
          <motion.div
            key="avatar"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">
                {t.chooseYourAvatar}
              </h3>
              <p className="text-slate-400 text-sm">{t.avatarDescription}</p>
            </div>

            <AvatarUpload avatar={avatar} onAvatarChange={setAvatar} />

            <div className="flex gap-3 w-full">
              <motion.button
                type="button"
                onClick={handleBack}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="landing-btn-secondary flex-1 py-3 px-6 rounded-lg font-semibold
                           transition-all duration-200"
              >
                {t.back}
              </motion.button>

              <motion.button
                type="button"
                onClick={handleAvatarSubmit}
                disabled={isLoading}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="landing-btn-primary flex-1 py-3 px-6 rounded-lg font-semibold text-white
                           transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? t.loading : t.createAccount}
              </motion.button>
            </div>

            <button
              type="button"
              onClick={handleAvatarSubmit}
              className="text-slate-500 text-sm hover:text-slate-400 transition-colors"
            >
              {t.skipForNow}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
