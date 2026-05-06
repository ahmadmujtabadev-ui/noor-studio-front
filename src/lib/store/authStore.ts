import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import { tokenStorage } from '../api/client';
import type { User } from '../api/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await authApi.login({ email, password });
          if ('token' in res && res.token) {
            tokenStorage.set(res.token);
            set({ user: (res as { token: string; user: User }).user, token: res.token as string, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      setAuth: (token, user) => {
        tokenStorage.set(token);
        set({ user, token, isAuthenticated: true, isLoading: false });
      },

      logout: () => {
        tokenStorage.clear();
        set({ user: null, token: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const res = await authApi.me();
          set({ user: res.user, isAuthenticated: true });
        } catch {
          tokenStorage.clear();
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'noor-auth',
      partialize: (state) => ({ token: state.token, user: state.user }) as AuthState,
    }
  )
);

// Selector shortcuts
export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useCredits = () => useAuthStore((s) => s.user?.credits ?? 0);
