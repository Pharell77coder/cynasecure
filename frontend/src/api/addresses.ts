import { apiFetch } from "./apiFetch";

export interface Address {
  id: number;
  firstName: string;
  lastName: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postalCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
}

export interface AddressPayload {
  firstName: string;
  lastName: string;
  company?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export const addressesApi = {
  list: () => apiFetch<Address[]>("/api/me/addresses"),

  create: (data: AddressPayload) =>
    apiFetch<Address>("/api/me/addresses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<AddressPayload>) =>
    apiFetch<Address>(`/api/me/addresses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) =>
    apiFetch<{ success: boolean }>(`/api/me/addresses/${id}`, { method: "DELETE" }),

  setDefault: (id: number) =>
    apiFetch<Address>(`/api/me/addresses/${id}/default`, { method: "POST" }),
};
