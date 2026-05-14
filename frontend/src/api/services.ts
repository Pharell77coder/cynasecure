import { apiFetch } from "./apiFetch";

export interface ServiceFeature {
  label: string;
  included: boolean;
}

export interface Service {
  id: number;
  name: string;

  // 🔥 Le backend renvoie category et categorySlug
  category: string | null;
  categorySlug: string | null;

  description: string;
  longDescription: string | null;

  priceMonthly: number;
  priceYearly?: number | null;

  badge?: string | null;

  // 🔥 Peut être null si pas d'image
  image: string | null;

  features: ServiceFeature[];

  // 🔥 AJOUT OBLIGATOIRE
  type: "saas" | "one_shot";
}

export interface CreateServicePayload {
  name: string;
  category: string;
  categorySlug: string;
  description: string;
  longDescription: string;
  priceMonthly: number;
  priceYearly?: number;
  badge?: string;
  image: string;
  features: ServiceFeature[];

  // 🔥 AJOUT
  type: "saas" | "one_shot";
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {}

export const servicesApi = {
  getAll: () => apiFetch<Service[]>("/api/services"),

  getById: (id: string | number) =>
    apiFetch<Service>(`/api/services/${id}`),

  create: (data: CreateServicePayload) =>
    apiFetch<Service>("/api/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string | number, data: UpdateServicePayload) =>
    apiFetch<Service>(`/api/services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: string | number) =>
    apiFetch(`/api/services/${id}`, {
      method: "DELETE",
    }),
};
