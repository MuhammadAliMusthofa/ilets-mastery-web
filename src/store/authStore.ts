import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// 1. Definisikan Tipe User
interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  avatar?: string;
}

// 2. Definisikan Tipe State & Actions
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

// 3. Bikin Store-nya
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => 
        set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        // Bersihin cookies/localStorage kalau perlu
        localStorage.removeItem("auth-storage");
        window.location.href = "/login";
      },
    }),
    {
      name: "auth-storage", // Nama key di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);