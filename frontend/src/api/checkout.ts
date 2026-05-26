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
  discount: number;
  promoCode: string | null;
  items: { name: string; price: number; billing: string }[];
}

export interface ConfirmResponse {
  ok: boolean;
  paymentId: number;
  invoiceNumber: string;
  total: number;
}

export const checkoutApi = {
  intent: (items: CheckoutItem[], address: CheckoutAddress, guestEmail?: string, promoCode?: string) =>
    apiFetch<IntentResponse>("/api/checkout/intent", {
      method: "POST",
      body: JSON.stringify({
        items,
        address,
        ...(guestEmail ? { guestEmail } : {}),
        ...(promoCode ? { promoCode } : {}),
      }),
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

  downloadInvoice: async (paymentId: number, filename = "facture.pdf") => {
    const res = await fetch(`/api/checkout/invoice/${paymentId}`, {
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.message ?? `Erreur ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};
