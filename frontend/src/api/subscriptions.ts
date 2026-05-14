import { apiFetch } from "./apiFetch";

export interface Subscription {
  id: number;
  service: {
    categorySlug: any;
    id: number;
    title: string;
  };
  cycle: "monthly" | "yearly";
  price: number;
  status: string;
  startDate: string;
  nextBillingAt?: string;
  endDate?: string;
}

export const subscriptionsApi = {
  /**
   * Récupérer les abonnements de l'utilisateur connecté
   */
  list: () => apiFetch<Subscription[]>("/api/subscriptions/my"),

  /**
   * Créer un abonnement
   */
  create: (serviceId: number, cycle: "monthly" | "yearly") =>
    apiFetch("/api/subscriptions", {
      method: "POST",
      body: JSON.stringify({ serviceId, cycle }),
    }),

  /**
   * Annuler un abonnement
   */
  cancel: (id: number) =>
    apiFetch(`/api/subscriptions/${id}/cancel`, {
      method: "PUT",
    }),
};
