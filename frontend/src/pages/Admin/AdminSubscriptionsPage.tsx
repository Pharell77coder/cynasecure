import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { adminApi } from "../../api/admin";
import { Pagination } from "../../components/ui/Pagination";
import { checkoutApi } from "../../api/checkout";

import {
  Activity,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
  Radar,
  Database,
  Download,
} from "lucide-react";

export interface Subscription {
  id: number;
  user: { id: number; displayName: string; email: string };
  service: { id: number; name: string };
  cycle: string;
  price: number;
  status: string;
  startDate: string;
  nextBillingAt: string | null;
  invoicePaymentId: number | null;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="h-5 w-5 text-blue-500" aria-hidden="true" />
      </div>
      <p className="text-4xl font-black text-white mt-3">{value}</p>
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page    = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage = Number(searchParams.get("perPage") || 20);

  const [items, setItems]     = useState<Subscription[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const [statsAll, setStatsAll] = useState<{ active: number; expired: number; mrr: number; cycle: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getSubscriptions(page, perPage)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        if (!statsAll) {
          const active  = data.items.filter((s) => s.status === "ACTIVE").length;
          const expired = data.items.filter((s) => s.status !== "ACTIVE").length;
          const mrr     = data.items.filter((s) => s.status === "ACTIVE").reduce((sum, s) => sum + s.price, 0);
          const cycles  = data.items.reduce<Record<string, number>>((acc, s) => { acc[s.cycle] = (acc[s.cycle] || 0) + 1; return acc; }, {});
          const cycle   = Object.keys(cycles).length ? Object.entries(cycles).sort((a, b) => b[1] - a[1])[0][0] : "—";
          setStatsAll({ active, expired, mrr, cycle });
        }
      })
      .finally(() => setLoading(false));
  }, [page, perPage]);

  const setPage    = (p: number) => setSearchParams((prev) => { prev.set("page", String(p)); return prev; });
  const setPerPage = (pp: number) => setSearchParams({ page: "1", perPage: String(pp) });

  return (
    <div className="relative">

      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        aria-hidden="true"
      />


      <section className="relative py-10 border-b border-gray-900">
        <div className="container space-y-4">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Radar className="h-3 w-3" aria-hidden="true" />
            GESTION DES ABONNEMENTS
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Abonnements
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Suivi complet des abonnements actifs, expirés, cycles et revenus récurrents.
          </p>
        </div>
      </section>

      {!loading && statsAll && (
        <section className="container mt-10 grid gap-6 md:grid-cols-4">
          <StatCard label="Actifs" value={statsAll.active} icon={CheckCircle} />
          <StatCard label="Expirés" value={statsAll.expired} icon={XCircle} />
          <StatCard label="MRR" value={`${statsAll.mrr.toLocaleString()} €`} icon={TrendingUp} />
          <StatCard label="Cycle le plus utilisé" value={statsAll.cycle} icon={Calendar} />
        </section>
      )}

      <section className="container mt-10 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" aria-hidden="true" />
            <h2 className="font-semibold text-white">Liste des abonnements</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-gray-500">Aucun abonnement trouvé.</p>
          ) : (
            <table className="w-full text-sm align-middle">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Cycle</th>
                  <th className="px-6 py-4 font-medium">Prix</th>
                  <th className="px-6 py-4 font-medium">Début</th>
                  <th className="px-6 py-4 font-medium">Prochaine facture</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Facture</th>
                </tr>
              </thead>

              <tbody>
                {items.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-blue-500" aria-hidden="true" />
                        {s.user.displayName}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" aria-hidden="true" />
                        {s.service.name}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">{s.cycle}</td>

                    <td className="px-6 py-4 text-gray-400">
                      {s.price.toFixed(2)} €
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {new Date(s.startDate).toLocaleDateString("fr-FR")}
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {s.nextBillingAt
                        ? new Date(s.nextBillingAt).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 font-mono tracking-widest ${
                          s.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-gray-700/30 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {s.invoicePaymentId ? (
                        <button
                          onClick={() => checkoutApi.downloadInvoice(s.invoicePaymentId!, `facture-${s.invoicePaymentId}.pdf`)}
                          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                          aria-label="Télécharger la facture PDF"
                        >
                          <Download className="h-3.5 w-3.5" aria-hidden="true" />
                          PDF
                        </button>
                      ) : (
                        <span className="text-gray-500 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && (
            <div className="px-6 pb-4 border-t border-gray-800 pt-3">
              <Pagination
                page={page}
                total={total}
                perPage={perPage}
                onChange={setPage}
                onPerPageChange={setPerPage}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
