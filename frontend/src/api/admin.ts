import { apiFetch } from "./apiFetch";
import type { Subscription } from "../pages/Admin/AdminSubscriptionsPage";
import type { Payment } from "../pages/Admin/AdminPaiementsPage";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ChartData {
  period: "days" | "weeks";
  salesOverTime: {
    label: string;
    date: string;
    total: number;
    ordersCount: number;
  }[];
  salesByCategory: {
    label: string;
    categories: Record<string, number>;
  }[];
  categoryDistribution: {
    category: string;
    total: number;
    percentage: number;
  }[];
}

export const adminApi = {
  getStats: () =>
    apiFetch<{
      services: number;
      users: number;
      subscriptions: number;
      mrr: number;
    }>("/api/admin/stats"),

  getSubscriptions: (page = 1, perPage = 20) =>
    apiFetch<Paginated<Subscription>>(
      `/api/admin/subscriptions?page=${page}&perPage=${perPage}`
    ),

  getPayments: (page = 1, perPage = 20) =>
    apiFetch<Paginated<Payment>>(
      `/api/admin/payments?page=${page}&perPage=${perPage}`
    ),

  getChartData: (period: "days" | "weeks") =>
    apiFetch<ChartData>(`/api/admin/stats/charts?period=${period}`),
};
