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
  setActiveGameId: (id: string | null) => void;
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
        console.log('[AuthStore] Session state: loading');
        set({ isLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/auth/session`, { credentials: 'include' });
          console.log('[AuthStore] Session check status:', res.status, res.statusText);
          const session = await res.json();
          // Debug log the raw session object
          console.log('[AuthStore] Session data received:', session);

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

            console.log('[AuthStore] Session state: authenticated', { userId: user.id });
            set({ user, isAuthenticated: true, isLoading: false, activeGameId });
          } else {
            console.log('[AuthStore] Session state: unauthenticated');
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('[AuthStore] Session state: error', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setGuestName: (guestName) => set({ guestName }),

      setActiveGameId: (id) => set({ activeGameId: id }),

      login: () => {
        // Redirect to home where LandingPage handles the UI interaction
        window.location.href = '/';
      },

      logout: async () => {
        try {
          // Auth.js requires CSRF token for signout
          const csrfRes = await fetch(`${API_URL}/api/auth/csrf`, { credentials: 'include' });
          const csrfData = await csrfRes.json();
          const csrfToken = csrfData.csrfToken;

          if (csrfToken) {
            // Create form and submit to trigger proper signout
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = `${API_URL}/api/auth/signout`;

            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrfToken';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);

            document.body.appendChild(form);
            form.submit();
          } else {
            // Fallback: just clear local state
            set({ user: null, isAuthenticated: false });
            window.location.reload();
          }
        } catch (error) {
          console.error('Logout error:', error);
          set({ user: null, isAuthenticated: false });
          window.location.reload();
        }
      },
    }),
    {
      name: 'ladrilho-auth',
    }
  )
);
