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

  category: string | null;
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
/* API PUBLIC SERVICES (USERS)                     */
/* ─────────────────────────────────────────────── */

export const servicesApi = {
  // LISTE PUBLIQUE
  getAll: () => apiFetch<Service[]>("/api/services"),

  // GET ONE PUBLIC
  getById: (id: string | number) =>
    apiFetch<Service>(`/api/services/${id}`),

  /* ─────────────────────────────────────────────── */
  /* API ADMIN SERVICES                              */
  /* ─────────────────────────────────────────────── */

  create: (data: CreateServicePayload) =>
    apiFetch("/api/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string | number, data: UpdateServicePayload) =>
    apiFetch(`/api/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string | number) =>
    apiFetch(`/api/admin/services/${id}`, {
      method: "DELETE",
    }),
};
