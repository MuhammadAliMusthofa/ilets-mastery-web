import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/src/features/auth/services/auth.service";
import type { AuthUser } from "@/src/models/auth";
import { useExamStore } from "@/src/store/examStore";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  logout: () => Promise<void>;
}

// Beberapa request yang gagal 401 bersamaan masing-masing memicu logout lewat
// interceptor axios. Tanda ini memastikan hanya satu yang benar-benar jalan.
let isLoggingOut = false;

/**
 * Cookie `role` bisa dihapus dari JS; `accessToken` bersifat httpOnly dan
 * hanya bisa dihapus backend. Tanpa `role`, middleware tidak lagi melempar
 * user dari /login ke dashboard, jadi logout tetap tuntas walau backend mati.
 */
const clearClientCookies = () => {
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),

      logout: async () => {
        if (isLoggingOut) {
          return;
        }
        isLoggingOut = true;

        try {
          await authService.logout();
        } catch (error) {
          console.error("Gagal memanggil endpoint logout:", error);
        } finally {
          get().clearAuth();
          useExamStore.getState().reset();
          clearClientCookies();
          // replace: tombol Back tidak membawa kembali ke halaman terproteksi.
          window.location.replace("/login");
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
