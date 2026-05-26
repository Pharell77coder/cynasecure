import { apiFetch } from "./apiFetch";

export interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string | null;
  imagePath: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  position: number;
  isActive: boolean;
}

export interface HomeContent {
  slug: string;
  title: string | null;
  content: string;
}

export interface HomeCategory {
  id: number;
  name: string;
  slug: string;
  imagePath: string | null;
  homePosition: number | null;
}

export interface HomeService {
  id: number;
  name: string;
  description: string | null;
  priceMonthly: number | null;
  image: string | null;
  category: string | null;
  categorySlug: string | null;
  type: string | null;
  homePosition: number | null;
}

/* ── Public ── */

export const homeApi = {
  getCarousel: () => apiFetch<CarouselSlide[]>("/api/home/carousel"),
  getContent: (slug: string) => apiFetch<HomeContent>(`/api/home/content/${slug}`),
  getCategories: () => apiFetch<HomeCategory[]>("/api/home/categories"),
  getTopProducts: () => apiFetch<HomeService[]>("/api/home/top-products"),
};

/* ── Admin ── */

export const adminHomeApi = {
  // Carousel
  listSlides: () => apiFetch<CarouselSlide[]>("/api/admin/home/carousel"),
  createSlide: (data: Partial<CarouselSlide>) =>
    apiFetch<CarouselSlide>("/api/admin/home/carousel", { method: "POST", body: JSON.stringify(data) }),
  updateSlide: (id: number, data: Partial<CarouselSlide>) =>
    apiFetch<CarouselSlide>(`/api/admin/home/carousel/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSlide: (id: number) =>
    apiFetch<{ ok: boolean }>(`/api/admin/home/carousel/${id}`, { method: "DELETE" }),
  reorderSlides: (ids: number[]) =>
    apiFetch<{ ok: boolean }>("/api/admin/home/carousel/reorder", { method: "PATCH", body: JSON.stringify(ids) }),

  // Content
  getContent: (slug: string) => apiFetch<HomeContent>(`/api/admin/home/content/${slug}`),
  saveContent: (slug: string, data: { title?: string; content: string }) =>
    apiFetch<HomeContent>(`/api/admin/home/content/${slug}`, { method: "PUT", body: JSON.stringify(data) }),

  // Categories
  listCategories: () => apiFetch<HomeCategory[]>("/api/admin/home/categories"),
  reorderCategories: (ids: number[]) =>
    apiFetch<{ ok: boolean }>("/api/admin/home/categories/reorder", { method: "PATCH", body: JSON.stringify(ids) }),
  updateCategoryHome: (id: number, data: { homePosition?: number | null; imagePath?: string | null }) =>
    apiFetch<HomeCategory>(`/api/admin/home/categories/${id}/home`, { method: "PATCH", body: JSON.stringify(data) }),

  // Top products
  listTopProducts: () => apiFetch<HomeService[]>("/api/admin/home/top-products"),
  addTopProduct: (serviceId: number) =>
    apiFetch<HomeService>(`/api/admin/home/top-products/${serviceId}`, { method: "POST" }),
  removeTopProduct: (serviceId: number) =>
    apiFetch<{ ok: boolean }>(`/api/admin/home/top-products/${serviceId}`, { method: "DELETE" }),
  reorderTopProducts: (ids: number[]) =>
    apiFetch<{ ok: boolean }>("/api/admin/home/top-products/reorder", { method: "PATCH", body: JSON.stringify(ids) }),

  // Upload
  uploadImage: async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "include" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? "Échec upload");
    }
    const data = (await res.json()) as { path: string };
    return data.path;
  },
};
