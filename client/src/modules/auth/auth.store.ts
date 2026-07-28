import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, AuthTokens } from "./types/auth.types";
import { apiClient } from "../../lib/axios";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  mfaToken: string | null;
  mfaEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  defaultDashboardPage: string;

  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  setMfaSession: (mfaToken: string, email: string) => void;
  clearMfaSession: () => void;
  setDefaultDashboardPage: (page: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      mfaToken: null,
      mfaEmail: null,
      isAuthenticated: false,
      isLoading: true,
      defaultDashboardPage: "/dashboard",

      setAuth: (user, tokens) => {
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          mfaToken: null,
          mfaEmail: null,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      setTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setMfaSession: (mfaToken, email) => {
        set({
          mfaToken,
          mfaEmail: email,
        });
      },

      clearMfaSession: () => {
        set({
          mfaToken: null,
          mfaEmail: null,
        });
      },

      setDefaultDashboardPage: (page: string) => {
        set({ defaultDashboardPage: page });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          mfaToken: null,
          mfaEmail: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      initializeAuth: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          set({ isLoading: true });
          const response = await apiClient.get<{ success: boolean; data: User }>("/auth/me");
          set({
            user: response.data.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Session verification failed:", error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "billing_auth_storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        mfaToken: state.mfaToken,
        mfaEmail: state.mfaEmail,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
