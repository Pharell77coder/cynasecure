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

  // Charger le user au démarrage si token existe
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

  const login = async (email: string, password: string) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const register = async (displayName: string, email: string, password: string) => {
    const { token, user } = await authApi.register(displayName, email, password);
    localStorage.setItem("token", token);
    setUser(user);
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    localStorage.removeItem("token");
    setUser(null);
  };

  // 🔥 FIX ADMIN : version robuste et 100% TypeScript-safe
  const isAdmin = Boolean(
    user &&
    typeof user.role === "string" &&
    user.role.toUpperCase().includes("ADMIN")
  );

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
