import { apiFetch } from "./apiFetch";

export interface AdminUser {
  id: number;
  displayName: string;
  email: string;
  role: "admin" | "user";
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export const adminUsersApi = {
  list: (page = 1, perPage = 20) =>
    apiFetch<Paginated<AdminUser>>(`/api/admin/users?page=${page}&perPage=${perPage}`, {
      method: "GET",
      credentials: "include",
    }),

  remove: (id: number) =>
    apiFetch(`/api/admin/users/${id}`, {
      method: "DELETE",
      credentials: "include",
    }),
};
