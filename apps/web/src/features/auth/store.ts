import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  password: string | null;
  authRequired: boolean;
  setPassword: (password: string | null) => void;
  setAuthRequired: (authRequired: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      password: null,
      authRequired: true,
      setPassword: (password) => set({ password }),
      setAuthRequired: (authRequired) => set({ authRequired }),
      logout: () => set({ password: null }),
    }),
    {
      name: "auth",
      partialize: (state) => ({ password: state.password }),
    }
  )
);
