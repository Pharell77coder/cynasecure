import { apiFetch } from "./apiFetch";

export interface AdminUser {
  id: number;
  displayName: string;
  email: string;
  role: "admin" | "user";
}

export const adminUsersApi = {
  /**
   * Liste des utilisateurs (admin)
   */
  list: () =>
    apiFetch<AdminUser[]>("/api/admin/users", {
      method: "GET",
      credentials: "include",
    }),

  /**
   * Supprimer un utilisateur
   */
  remove: (id: number) =>
    apiFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    }),
};
