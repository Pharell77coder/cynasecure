import { apiFetch } from "./apiFetch";

export interface User {
  id: number;
  email: string;
  displayName: string;
  role?: string;
  phone?: string;
  company?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const authApi = {
  login: (email: string, password: string, rememberMe = false) =>
    apiFetch<User & { requires2fa?: boolean; emailUnverified?: boolean }>(
      `/api/login${rememberMe ? "?_remember_me=1" : ""}`,
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    ),

  register: (displayName: string, email: string, password: string) =>
    apiFetch<{ needsVerification?: boolean; message?: string }>("/api/register", {
      method: "POST",
      body: JSON.stringify({ displayName, email, password }),
    }),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),

  resendVerification: (email: string) =>
    apiFetch<{ message: string }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  twoFactorCheck: (code: string) =>
    apiFetch<{ token: string; user: User }>("/api/auth/2fa/check", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  twoFactorStatus: () =>
    apiFetch<{ enabled: boolean }>("/api/me/2fa/status"),

  twoFactorSetup: () =>
    apiFetch<{ secret: string; qrContent: string }>("/api/me/2fa/setup", { method: "POST" }),

  twoFactorConfirm: (code: string) =>
    apiFetch<{ message: string }>("/api/me/2fa/confirm", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),

  twoFactorDisable: (password: string, code: string) =>
    apiFetch<{ message: string }>("/api/me/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ password, code }),
    }),

  me: () => apiFetch<User>("/api/me"),

  updateProfile: (data: Partial<User>) =>
    apiFetch<User>("/api/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiFetch<{ message: string }>("/api/me/password", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch("/api/logout", {
      method: "POST",
    }),

  resetPasswordRequest: (email: string) =>
    apiFetch<{ message: string; dev_token?: string }>("/api/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPasswordConfirm: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>("/api/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),

  requestEmailChange: (currentPassword: string, newEmail: string) =>
    apiFetch<{ message: string }>("/api/me/email/request-change", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newEmail }),
    }),

  verifyEmailChange: (token: string) =>
    apiFetch<{ message: string }>("/api/email/verify-change", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
};
