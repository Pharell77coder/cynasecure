import { apiFetch } from "./apiFetch";

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export const paymentMethodsApi = {
  list: () => apiFetch<PaymentMethod[]>("/api/me/payment-methods"),

  setupIntent: () =>
    apiFetch<{ clientSecret: string }>("/api/me/payment-methods/setup-intent", {
      method: "POST",
    }),

  detach: (pmId: string) =>
    apiFetch<{ success: boolean }>(`/api/me/payment-methods/${pmId}/detach`, {
      method: "DELETE",
    }),

  setDefault: (pmId: string) =>
    apiFetch<{ success: boolean }>(`/api/me/payment-methods/${pmId}/default`, {
      method: "POST",
    }),
};
