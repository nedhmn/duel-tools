import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  password: string | null;
  setPassword: (password: string | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      password: null,
      setPassword: (password) => set({ password }),
      logout: () => set({ password: null }),
    }),
    { name: "auth" }
  )
);
