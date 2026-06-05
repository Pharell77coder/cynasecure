import { apiFetch } from "./apiFetch";

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
  images?: string[];

  features: ServiceFeature[];
  technicalSpecs?: { label: string; value: string }[];

  type: "saas" | "one_shot";
  isAvailable?: boolean;
  availability?: "available" | "maintenance" | "unavailable";
  trialAvailable?: boolean;
}

export interface SearchCriteria {
  q?: string;
  cats?: string;
  pmin?: number;
  pmax?: number;
  dispo?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest";
  type?: "all" | "saas" | "one_shot";
}

export interface SearchResult {
  total: number;
  items: Service[];
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
  images?: string[];
  features: ServiceFeature[];
  technicalSpecs?: { label: string; value: string }[];
  type: "saas" | "one_shot";
  availability?: "available" | "maintenance" | "unavailable";
  trialAvailable?: boolean;
}

export type UpdateServicePayload = Partial<CreateServicePayload>

export const servicesApi = {
  // LISTE PUBLIQUE
  getAll: () => apiFetch<Service[]>("/api/services"),

  search: (c: SearchCriteria) => {
    const qs = new URLSearchParams();
    if (c.q)    qs.set("q", c.q);
    if (c.cats) qs.set("categories", c.cats);
    if (c.pmin !== undefined) qs.set("priceMin", String(c.pmin));
    if (c.pmax !== undefined) qs.set("priceMax", String(c.pmax));
    if (c.dispo) qs.set("onlyAvailable", "1");
    if (c.sort)  qs.set("sort", c.sort);
    if (c.type && c.type !== "all") qs.set("type", c.type);
    return apiFetch<SearchResult>(`/api/services/search?${qs}`);
  },

  // GET ONE PUBLIC
  getById: (id: string | number) =>
    apiFetch<Service>(`/api/services/${id}`),

  getSimilar: (id: string | number, limit = 6) =>
    apiFetch<Service[]>(`/api/services/${id}/similar?limit=${limit}`),

  // API admin
  adminList: (page = 1, perPage = 20) =>
    apiFetch<{ items: Service[]; total: number; page: number; perPage: number; totalPages: number }>(
      `/api/admin/services?page=${page}&perPage=${perPage}`
    ),

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
