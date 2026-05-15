import React, { createContext, useState, useEffect, ReactNode } from "react";
import { authApi, User } from "../api/auth";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  /* ────────────────────────────────────────────────
     🔐 Chargement du user au démarrage
     ──────────────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      });
  }, []);

  /* ────────────────────────────────────────────────
     🔑 Login
     ──────────────────────────────────────────────── */
  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    setUser(user);
  };

  /* ────────────────────────────────────────────────
     🆕 Register
     ──────────────────────────────────────────────── */
  const register = async (displayName: string, email: string, password: string) => {
    const { token, user } = await authApi.register(displayName, email, password);
    localStorage.setItem("token", token);
    setUser(user);
  };

  /* ────────────────────────────────────────────────
     🛠 Update profile
     ──────────────────────────────────────────────── */
  const updateProfile = async (data: Partial<User>) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  };

  /* ────────────────────────────────────────────────
     🚪 Logout
     ──────────────────────────────────────────────── */
  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
  };

  /* ────────────────────────────────────────────────
     🛡 Détection admin robuste
     ──────────────────────────────────────────────── */
  const isAdmin =
    !!user &&
    typeof user.role === "string" &&
    user.role.toUpperCase().includes("ADMIN");

  /* ────────────────────────────────────────────────
     🚀 Provider final
     ──────────────────────────────────────────────── */
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
