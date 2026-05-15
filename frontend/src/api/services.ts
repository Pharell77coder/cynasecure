import { apiFetch } from "./apiFetch";

/* ─────────────────────────────────────────────── */
/* TYPES                                           */
/* ─────────────────────────────────────────────── */

export interface ServiceFeature {
  label: string;
  included: boolean;
}

export interface Service {
  id: number;
  name: string;

  // Catégorie (nom lisible)
  category: string | null;

  // Slug de la catégorie
  categorySlug: string | null;

  description: string;
  longDescription: string | null;

  priceMonthly: number;
  priceYearly?: number | null;

  badge?: string | null;

  image: string | null;

  features: ServiceFeature[];

  type: "saas" | "one_shot";
}

export interface CreateServicePayload {
  name: string;
  categorySlug: string;
  description: string;
  longDescription: string;
  priceMonthly: number;
  priceYearly?: number | null;
  badge?: string | null;
  image: string | null;
  features: ServiceFeature[];
  type: "saas" | "one_shot";
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {}

/* ─────────────────────────────────────────────── */
/* API ADMIN SERVICES                              */
/* ─────────────────────────────────────────────── */

export const servicesApi = {
  // LISTE ADMIN
  getAll: () => apiFetch<Service[]>("/api/admin/services"),

  // GET ONE
  getById: (id: string | number) =>
    apiFetch<Service>(`/api/admin/services/${id}`),

  // CREATE
  create: (data: CreateServicePayload) =>
    apiFetch("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // UPDATE
  update: (id: string | number, data: UpdateServicePayload) =>
    apiFetch(`/api/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE
  remove: (id: string | number) =>
    apiFetch(`/api/admin/services/${id}`, {
      method: "DELETE",
    }),
};
