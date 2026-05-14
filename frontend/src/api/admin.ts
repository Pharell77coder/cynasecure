import { apiFetch } from "./apiFetch";
import type { Subscription } from "../pages/Admin/AdminSubscriptionsPage";
import type { Payment } from "../pages/Admin/AdminPaiementsPage";

export const adminApi = {
  /**
   * Statistiques admin
   */
  getStats: () =>
    apiFetch<{
      services: number;
      users: number;
      subscriptions: number;
      mrr: number;
    }>("/api/admin/stats"),

  /**
   * Liste des utilisateurs (admin)
   */
  getUsers: () =>
    apiFetch<
      {
        id: number;
        email: string;
        displayName: string;
        role: string;
      }[]
    >("/api/admin/users"),

  /**
   * Liste des services (admin)
   */
  getServices: () =>
    apiFetch<
      {
        id: number;
        name: string;
        price: number;
        description: string;
      }[]
    >("/api/admin/services"),

  /**
   * Liste des abonnements (admin)
   */
  getSubscriptions: () =>
    apiFetch<Subscription[]>("/api/admin/subscriptions"),

  /**
   * Liste des paiements (admin)
   */
  getPayments: () =>
    apiFetch<Payment[]>("/api/admin/payments"),
};
