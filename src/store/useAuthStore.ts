import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

const INITIAL_STATE = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
} as const;

export const useAuthStore = create<AuthState>((set) => ({
  ...INITIAL_STATE,

  setAuth: (token, user) =>
    set({ accessToken: token, user, isAuthenticated: true }),

  clearAuth: () => set({ ...INITIAL_STATE }),
}));
