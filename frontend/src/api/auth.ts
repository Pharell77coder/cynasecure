import { apiFetch } from "./apiFetch";

export interface User {
  id: number;
  email: string;
  displayName: string;
  role?: string;
  phone?: string;
  company?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: User }>("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (displayName: string, email: string, password: string) =>
    apiFetch<{ token: string; user: User }>("/api/register", {
      method: "POST",
      body: JSON.stringify({ displayName, email, password }),
    }),

  me: () => apiFetch<User>("/api/me"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/api/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch("/api/logout", {
      method: "POST",
    }),
};
