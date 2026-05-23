import { apiFetch } from "./apiFetch";

export interface CheckoutItem {
  serviceId: number;
  billing: "monthly" | "yearly";
}

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface IntentResponse {
  clientSecret: string;
  paypalOrderId: string;
  orderId: number;
  total: number;
  items: { name: string; price: number; billing: string }[];
}

export interface ConfirmResponse {
  ok: boolean;
  paymentId: number;
  invoiceNumber: string;
  total: number;
}

export const checkoutApi = {
  intent: (items: CheckoutItem[], address: CheckoutAddress) =>
    apiFetch<IntentResponse>("/api/checkout/intent", {
      method: "POST",
      body: JSON.stringify({ items, address }),
    }),

  confirm: (payload: {
    orderId: number;
    gateway: "stripe" | "paypal";
    paymentIntentId?: string;
    paypalOrderId?: string;
  }) =>
    apiFetch<ConfirmResponse>("/api/checkout/confirm", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  invoiceUrl: (paymentId: number) =>
    `/api/checkout/invoice/${paymentId}`,
};
