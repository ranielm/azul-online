import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Room, Player } from '@shared/types';
import { Button } from '../UI/Button';
import { copyToClipboard, getRoomUrl } from '../../utils/gameHelpers';
import { useTranslation } from '../../i18n/useLanguage';
import { UserAvatar } from '../UI/UserAvatar';

interface LobbyProps {
  room: Room;
  playerId: string;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  onChangeCode?: (newCode: string) => void;
}

export function Lobby({ room, playerId, onStartGame, onLeaveRoom, onChangeCode }: LobbyProps) {
  const [copied, setCopied] = useState(false);
  const [showChangeCode, setShowChangeCode] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const currentPlayer = room.gameState.players.find((p) => p.id === playerId);
  const isHost = currentPlayer?.isHost;
  const canStart = room.gameState.players.length >= 2;
  const { t } = useTranslation();

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(getRoomUrl(room.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleChangeCode = () => {
    const normalizedCode = newCode.toUpperCase().trim();
    const validFormat = /^[A-Z0-9]{6}$/;

    if (!validFormat.test(normalizedCode)) {
      setCodeError(t.invalidCode);
      return;
    }

    if (onChangeCode) {
      onChangeCode(normalizedCode);
      setShowChangeCode(false);
      setNewCode('');
      setCodeError('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="glass-card relative z-10 px-8 py-10 rounded-2xl w-full max-w-md"
    >
      {/* Title with decorative underline */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-6"
      >
        <h2 className="text-3xl font-bold mb-2 text-tile-white tracking-tight">{t.waitingRoom}</h2>

        {/* Decorative underline */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-[#006DB2] to-[#0080CC]" />
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-[#E6A745] to-[#F0B652]" />
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-[#D93844] to-[#E84550]" />
        </div>

        <p className="text-slate-400 text-sm">{t.roomCode}</p>
      </motion.div>

      {/* Room Code */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="text-4xl font-mono font-bold tracking-widest bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
            {room.id}
          </span>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600/30 text-slate-300 hover:text-white transition-all"
            >
              {copied ? t.copied : t.copyLink}
            </motion.button>
            {isHost && onChangeCode && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowChangeCode(true)}
                className="px-3 py-1.5 text-sm bg-slate-700/50 hover:bg-slate-600/50 rounded-lg border border-slate-600/30 text-slate-300 hover:text-white transition-all"
              >
                {t.changeCode}
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Change Code Modal */}
      {showChangeCode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowChangeCode(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-white">{t.changeCodeTitle}</h3>
            <p className="text-slate-400 text-sm mb-4">{t.changeCodeDescription}</p>
            <input
              type="text"
              value={newCode}
              onChange={(e) => {
                setNewCode(e.target.value.toUpperCase().slice(0, 6));
                setCodeError('');
              }}
              placeholder={t.enterNewRoomCode}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-2xl tracking-widest uppercase mb-2"
              maxLength={6}
              autoFocus
            />
            {codeError && (
              <p className="text-red-400 text-sm mb-4">{codeError}</p>
            )}
            <div className="flex gap-3 mt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowChangeCode(false);
                  setNewCode('');
                  setCodeError('');
                }}
                className="flex-1"
              >
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={handleChangeCode}
                disabled={newCode.length !== 6}
                className="flex-1"
              >
                {t.confirm}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Players List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            {t.playersList}
          </h3>
          <span className="text-sm text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">
            {room.gameState.players.length}/{room.maxPlayers}
          </span>
        </div>

        <div className="space-y-2">
          {room.gameState.players.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <UserAvatar
                    src={player.image}
                    name={player.name}
                    size="md"
                  />
                  <span
                    className={`
                      absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-800
                      ${player.isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}
                    `}
                  />
                </div>
                <span className="font-medium text-white">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-blue-400 ml-2">({t.you})</span>
                  )}
                </span>
              </div>
              {player.isHost && (
                <span className="text-xs bg-gradient-to-r from-yellow-600 to-yellow-500 px-2 py-1 rounded-lg font-semibold text-white shadow-md">
                  {t.host}
                </span>
              )}
            </motion.div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: room.maxPlayers - room.gameState.players.length }).map(
            (_, i) => (
              <motion.div
                key={`empty-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="flex items-center p-3 bg-slate-800/20 rounded-xl border-2 border-dashed border-slate-700/50"
              >
                <span className="text-slate-500 text-sm">{t.waitingForPlayer}</span>
              </motion.div>
            )
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        {isHost ? (
          <>
            <motion.button
              whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0, 109, 178, 0.4)' }}
              whileTap={{ y: 0 }}
              onClick={onStartGame}
              disabled={!canStart}
              className="landing-btn-primary w-full py-4 px-6 rounded-xl font-semibold text-lg text-white
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canStart ? t.startGame : t.needMorePlayers(2 - room.gameState.players.length)}
            </motion.button>
            <p className="text-xs text-slate-500 text-center">
              {t.hostCanStart}
            </p>
          </>
        ) : (
          <div className="text-center py-3 px-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
            <p className="text-slate-400 text-sm">
              {t.waitingForHost}
            </p>
          </div>
        )}

        <motion.button
          whileHover={{ y: -2, backgroundColor: 'rgba(220, 38, 38, 0.3)' }}
          whileTap={{ y: 0 }}
          onClick={onLeaveRoom}
          className="w-full py-3 px-6 rounded-xl font-medium text-red-400 border border-red-500/30 
                     bg-red-500/10 hover:text-red-300 transition-all duration-200"
        >
          {t.leaveRoom}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
