import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ShoppingBag, FileText, Search, Filter, ChevronDown, ChevronUp,
  Shield, Package,
} from "lucide-react";

import { apiFetch } from "../../api/apiFetch";
import { checkoutApi } from "../../api/checkout";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { UserNav } from "../../components/layout/UserNav";

interface OrderItem {
  id: number;
  serviceName: string;
  serviceType: string;
  billing: string | null;
  price: number;
  quantity: number;
}

interface Order {
  id: number;
  total: number;
  status: string;
  gateway: string | null;
  createdAt: string;
  year: number;
  items: OrderItem[];
  paymentId: number | null;
}

function fmt(d: string) {
  try { return format(new Date(d), "dd MMM yyyy", { locale: fr }); }
  catch { return d; }
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    PENDING:   "text-amber-400  bg-amber-500/10  border-amber-500/20",
    CANCELLED: "text-red-400    bg-red-500/10    border-red-500/20",
    FAILED:    "text-red-400    bg-red-500/10    border-red-500/20",
  };
  const cls = map[status] ?? "text-gray-400 bg-gray-800 border-gray-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono border ${cls}`}>
      {status}
    </span>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (year)   params.set("year", year);
    if (status) params.set("status", status);
    if (q)      params.set("q", q);
    apiFetch<Order[]>(`/api/me/orders?${params}`)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [year, status, q]);

  const grouped: Record<number, Order[]> = {};
  for (const o of orders) {
    if (!grouped[o.year]) grouped[o.year] = [];
    grouped[o.year].push(o);
  }
  const sortedYears = Object.keys(grouped).map(Number).sort((a, b) => b - a);

  const toggleExpand = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const inputCls = "bg-gray-900 border border-gray-700 text-white text-sm px-3 py-2 focus:outline-none focus:border-blue-500";

  return (
    <PageTransition>
      <UserNav />

      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-20 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      <div className="container relative py-10 space-y-8 pb-20">

        <header className="space-y-1">
          <div className="inline-flex items-center gap-1.5 border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-mono tracking-widest px-2.5 py-1 rounded mb-3">
            <Shield className="h-3 w-3" />
            HISTORIQUE
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Mes commandes</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Consultez vos commandes passées et téléchargez vos factures.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              placeholder="Rechercher un service…"
              className={`${inputCls} pl-9 w-56`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-gray-500" />
            <select className={inputCls} value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">Toutes les années</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="COMPLETED">Complété</option>
            <option value="PENDING">En attente</option>
            <option value="CANCELLED">Annulé</option>
          </select>
        </div>

        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-800" />)}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <Card className="p-16 text-center border-dashed">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 font-medium">Aucune commande trouvée</p>
            <p className="text-gray-500 text-sm mt-1">
              {q || year || status ? "Modifiez vos filtres pour voir plus de résultats." : "Vos futures commandes apparaîtront ici."}
            </p>
          </Card>
        )}

        {!loading && sortedYears.map((y) => (
          <section key={y}>
            <h2 className="text-sm font-mono text-gray-500 mb-3 border-b border-gray-800 pb-2">
              {y} · {grouped[y].length} commande{grouped[y].length > 1 ? "s" : ""}
            </h2>

            <div className="space-y-3">
              {grouped[y].map((order) => {
                const isOpen = expanded.has(order.id);
                return (
                  <Card key={order.id} className="overflow-hidden">
                    <button
                      className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-800/40 transition-colors"
                      onClick={() => toggleExpand(order.id)}
                    >
                      <div className="h-9 w-9 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-blue-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold text-sm">#{order.id}</span>
                          <StatusChip status={order.status} />
                          {order.gateway && (
                            <span className="text-[10px] font-mono text-gray-500">{order.gateway}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex gap-3">
                          <span>{fmt(order.createdAt)}</span>
                          <span>{order.items.length} article{order.items.length > 1 ? "s" : ""}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold">{order.total} €</p>
                      </div>

                      <div className="text-gray-500 flex-shrink-0">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-800 px-4 pb-4 pt-3 space-y-3">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              <div className="flex-1 text-gray-300">{item.serviceName}</div>
                              <span className="text-[10px] font-mono text-gray-500 border border-gray-700 px-1.5 py-0.5">
                                {item.serviceType === "saas" ? "SaaS" : "One Shot"}
                              </span>
                              {item.billing && (
                                <span className="text-xs text-gray-500">
                                  {item.billing === "yearly" ? "annuel" : "mensuel"}
                                </span>
                              )}
                              <span className="text-white font-medium">{item.price} €</span>
                            </div>
                          ))}
                        </div>

                        {order.paymentId && (
                          <div className="flex justify-end pt-2 border-t border-gray-800">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => checkoutApi.downloadInvoice(order.paymentId!, `facture-${order.id}.pdf`)}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Télécharger la facture
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PageTransition>
  );
}
