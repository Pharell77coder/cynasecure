import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { authApi, User } from "../api/auth";

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ requires2fa?: boolean; emailUnverified?: boolean }>;
  register: (displayName: string, email: string, password: string) => Promise<{ needsVerification?: boolean }>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      const res = await authApi.login(email, password, rememberMe);
      if (res.requires2fa) {
        return { requires2fa: true };
      }
      if (res.emailUnverified) {
        return { emailUnverified: true };
      }
      setUser(res);
      return {};
    } catch (err: unknown) {
      const data = (err as { data?: { emailUnverified?: boolean } })?.data;
      if (data?.emailUnverified) {
        return { emailUnverified: true };
      }
      throw err;
    }
  };

  const register = async (displayName: string, email: string, password: string) => {
    await authApi.register(displayName, email, password);
    await login(email, password);
    return { needsVerification: false };
  };

  const updateProfile = async (data: Partial<User>) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
  };

  const logout = () => {
    authApi.logout().catch(() => {});
    setUser(null);
  };

  const isAdmin =
    !!user &&
    typeof user.role === "string" &&
    user.role.toUpperCase().includes("ADMIN");

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
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
