import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../i18n/useLanguage';
import { useAuthStore } from '../../store/authStore';
import { PasswordInput } from '../UI/PasswordInput';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

export function LoginForm({ onSwitchToSignUp, onSuccess }: LoginFormProps) {
  const { t } = useTranslation();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Redirect to Auth.js signin page
    login();
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="block text-sm text-slate-400 mb-1">{t.email}</label>
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

      <PasswordInput
        label={t.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

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
        disabled={isLoading}
        whileHover={{ y: -2 }}
        whileTap={{ y: 0 }}
        className="landing-btn-primary w-full py-3 px-6 rounded-lg font-semibold text-white
                   transition-all duration-200 disabled:opacity-50"
      >
        {isLoading ? t.loading : t.login}
      </motion.button>

      <p className="text-center text-slate-400 text-sm">
        {t.noAccount}{' '}
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {t.signUp}
        </button>
      </p>
    </motion.form>
  );
}
