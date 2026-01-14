import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  guestName: string;
  setUser: (user: User | null) => void;
  setGuestName: (name: string) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      guestName: '',
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setGuestName: (guestName) => set({ guestName }),
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'azul-auth',
    }
  )
);
