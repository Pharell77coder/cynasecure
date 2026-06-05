import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { adminApi } from "../../api/admin";
import { Pagination } from "../../components/ui/Pagination";
import { toast } from "../../hooks/useToast";

import {
  CreditCard,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

export interface Payment {
  id: number;
  amount: number;
  cycle: string;
  status: "PAID" | "FAILED" | "PENDING";
  paidAt: string;
  user: { id: number; displayName: string; email: string } | null;
  service: { id: number; name: string } | null;
  fraud: { score: number; level: "ok" | "review" | "blocked" } | null;
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

type RiskFilter = "all" | "review" | "blocked";

export default function AdminPaiementsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page      = Math.max(1, Number(searchParams.get("page") || 1));
  const perPage   = Number(searchParams.get("perPage") || 20);
  const riskFilter: RiskFilter = (searchParams.get("risk") as RiskFilter) || "all";

  const [items, setItems]     = useState<Payment[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<{ totalPaid: number; failed: number; pending: number; lastPayment: string } | null>(null);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getPayments(page, perPage)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        if (!stats) {
          const totalPaid = data.items.filter((p) => p.status === "PAID").reduce((sum, p) => sum + p.amount, 0);
          const failed    = data.items.filter((p) => p.status === "FAILED").length;
          const pending   = data.items.filter((p) => p.status === "PENDING").length;
          const last      = data.items.length > 0 ? new Date(data.items[0].paidAt).toLocaleDateString("fr-FR") : "—";
          setStats({ totalPaid, failed, pending, lastPayment: last });
        }
      })
      .catch(() => toast("Erreur lors du chargement des paiements", "error"))
      .finally(() => setLoading(false));
  }, [page, perPage]);

  const setPage      = (p: number) => setSearchParams((prev) => { prev.set("page", String(p)); return prev; });
  const setPerPage   = (pp: number) => setSearchParams((prev) => { prev.set("page", "1"); prev.set("perPage", String(pp)); return prev; });
  const setRisk      = (r: RiskFilter) => setSearchParams({ page: "1", perPage: String(perPage), risk: r });

  const displayed = riskFilter === "all"
    ? items
    : items.filter((p) => p.fraud?.level === riskFilter);

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
            <CreditCard className="h-3 w-3" aria-hidden="true" />
            GESTION DES PAIEMENTS
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Paiements
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Suivi des transactions, paiements réussis, échoués et revenus encaissés.
          </p>
        </div>
      </section>

      {!loading && stats && (
        <section className="container mt-10 grid gap-6 md:grid-cols-4">
          <StatCard label="Total encaissé" value={`${stats.totalPaid.toLocaleString()} €`} icon={TrendingUp} />
          <StatCard label="Échecs" value={stats.failed} icon={XCircle} />
          <StatCard label="En attente" value={stats.pending} icon={Calendar} />
          <StatCard label="Dernier paiement" value={stats.lastPayment} icon={CheckCircle} />
        </section>
      )}

      <section className="container mt-10 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">

          <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <h2 className="font-semibold text-white">Historique des paiements</h2>
            </div>
            <div className="flex items-center gap-2">
              {(["all", "review", "blocked"] as RiskFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`text-xs font-mono px-3 py-1 border transition-colors ${
                    riskFilter === r
                      ? r === "blocked"
                        ? "bg-red-500/10 text-red-400 border-red-500/30"
                        : r === "review"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "text-gray-500 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {r === "all" ? "Tous" : r === "review" ? "À vérifier" : "Bloqués"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : displayed.length === 0 ? (
            <p className="p-6 text-gray-500">Aucun paiement trouvé.</p>
          ) : (
            <table className="w-full text-sm align-middle">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Cycle</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Risque</th>
                </tr>
              </thead>

              <tbody>
                {displayed.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-blue-500" aria-hidden="true" />
                        {p.user?.displayName ?? "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" aria-hidden="true" />
                        {p.service?.name ?? "—"}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      {p.amount.toFixed(2)} €
                    </td>

                    <td className="px-6 py-4 text-gray-400">{p.cycle}</td>

                    <td className="px-6 py-4 text-gray-400">
                      {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-3 py-1 font-mono tracking-widest ${
                          p.status === "PAID"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : p.status === "FAILED"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {p.fraud && p.fraud.level !== "ok" ? (
                        <span
                          title={`Score : ${p.fraud.score}`}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 font-mono border ${
                            p.fraud.level === "blocked"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {p.fraud.level === "blocked"
                            ? <ShieldX className="h-3 w-3" aria-hidden="true" />
                            : <ShieldAlert className="h-3 w-3" aria-hidden="true" />}
                          {p.fraud.level === "blocked" ? "BLOQUÉ" : "REVUE"}
                        </span>
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
