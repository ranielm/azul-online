import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../UI/Button';
import { useTranslation } from '../../i18n/useLanguage';
import { useAuthStore } from '../../store/authStore';

interface CreateRoomProps {
  onCreateRoom: (playerName: string, maxPlayers: 2 | 3 | 4) => void;
  onBack: () => void;
}

export function CreateRoom({ onCreateRoom, onBack }: CreateRoomProps) {
  const { user, guestName } = useAuthStore();
  const { t } = useTranslation();

  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(2);

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
    if (playerName.trim()) {
      onCreateRoom(playerName.trim(), maxPlayers);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-xl p-8 w-full max-w-md"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">{t.createRoomTitle}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {!hasPredefinedName && (
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

        {hasPredefinedName && (
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t.maxPlayers}
          </label>
          <div className="flex gap-3">
            {([2, 3, 4] as const).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxPlayers(num)}
                className={`
                  flex-1 py-3 rounded-lg font-semibold transition-all
                  ${maxPlayers === num
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                {num} {t.playersCount}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
            {t.back}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!playerName.trim()}
            className="flex-1"
          >
            {t.createRoom}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
