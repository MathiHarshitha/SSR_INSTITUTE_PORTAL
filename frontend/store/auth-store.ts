import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  /** In memory only — never persisted. On reload the session is restored from the httpOnly
   * refresh cookie (see RequireAuth), so an XSS can't lift a long-lived token from storage. */
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      clearAuth: () => set({ user: null, accessToken: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "ssr-portal-auth",
      version: 1,
      // v0 persisted the access token; drop it from anything already in storage.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as { user?: AuthUser | null };
        return { user: state.user ?? null };
      },
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
