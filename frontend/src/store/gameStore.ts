import { create } from 'zustand';
import {
  Room,
  GameState,
  TileColor,
  TileSelection,
} from '@shared/types';

interface GameStore {
  // Connection state
  playerId: string | null;
  isConnected: boolean;

  // Room state
  room: Room | null;

  // Game state
  gameState: GameState | null;

  // UI state
  selectedTiles: TileSelection | null;
  error: string | null;

  // Actions
  setPlayerId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setRoom: (room: Room | null) => void;
  setGameState: (gameState: GameState | null) => void;
  setSelectedTiles: (selection: TileSelection | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  playerId: null,
  isConnected: false,
  room: null,
  gameState: null,
  selectedTiles: null,
  error: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setPlayerId: (id) => set({ playerId: id }),
  setConnected: (connected) => set({ isConnected: connected }),
  setRoom: (room) => set({ room }),
  setGameState: (gameState) => set({ gameState }),
  setSelectedTiles: (selection) => set({ selectedTiles: selection }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));

// Selectors
export const selectCurrentPlayer = (state: GameStore) => {
  if (!state.gameState || !state.playerId) return null;
  return state.gameState.players.find((p) => p.id === state.playerId) || null;
};

export const selectIsMyTurn = (state: GameStore) => {
  if (!state.gameState || !state.playerId) return false;
  const currentPlayer = state.gameState.players[state.gameState.currentPlayerIndex];
  return currentPlayer?.id === state.playerId;
};

export const selectCurrentTurnPlayer = (state: GameStore) => {
  if (!state.gameState) return null;
  return state.gameState.players[state.gameState.currentPlayerIndex] || null;
};

export const selectIsHost = (state: GameStore) => {
  if (!state.room || !state.playerId) return false;
  const player = state.room.gameState.players.find((p) => p.id === state.playerId);
  return player?.isHost || false;
};

export const selectCanStartGame = (state: GameStore) => {
  if (!state.room) return false;
  return (
    selectIsHost(state) &&
    state.room.gameState.phase === 'waiting' &&
    state.room.gameState.players.length >= 2
  );
};
