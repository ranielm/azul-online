import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface User {
  id?: string;
  name?: string;
  email?: string;
  image?: string | null;
  // Legacy fields mapping
  username?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  guestName: string;
  activeGameId: string | null;
  checkSession: () => Promise<void>;
  setGuestName: (name: string) => void;
  login: () => void; // Redirects to signin
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      guestName: '',
      activeGameId: null,

      checkSession: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/auth/session`, { credentials: 'include' });
          const session = await res.json();
          if (session && session.user) {
            // Map Auth.js user to our internal User format
            // Ensure username is populated (fallback to name or email part)
            const user = {
              ...session.user,
              username: session.user.name || session.user.email?.split('@')[0] || 'Player'
            };

            // Check for active game
            let activeGameId = null;
            try {
              const gameRes = await fetch(`${API_URL}/api/game/active`, { credentials: 'include' });
              if (gameRes.ok) {
                const data = await gameRes.json();
                activeGameId = data.gameId;
              }
            } catch (e) {
              console.error("Failed to check active game", e);
            }

            set({ user, isAuthenticated: true, isLoading: false, activeGameId });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to check session', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setGuestName: (guestName) => set({ guestName }),

      login: () => {
        window.location.href = `${API_URL}/api/auth/signin`;
      },

      logout: async () => {
        // Optional: Call signout endpoint if needed, or just clear local state 
        // usually /api/auth/signout
        await fetch(`${API_URL}/api/auth/signout`, { method: 'POST', credentials: 'include' });
        set({ user: null, isAuthenticated: false });
        window.location.reload();
      },
    }),
    {
      name: 'azul-auth',
    }
  )
);
