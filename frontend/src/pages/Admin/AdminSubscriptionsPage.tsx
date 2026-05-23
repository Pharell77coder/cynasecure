import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../api/admin";

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

/* TYPES */
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

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/* STAT CARD */
function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      <p className="text-4xl font-black text-white mt-3">{value}</p>
    </div>
  );
}

/* PAGE */
export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getSubscriptions()
      .then((data: Subscription[]) => setSubs(data))
      .finally(() => setLoading(false));
  }, []);

  const active = subs.filter((s) => s.status === "ACTIVE").length;
  const expired = subs.filter((s) => s.status !== "ACTIVE").length;

  const mrr = subs
    .filter((s) => s.status === "ACTIVE")
    .reduce((sum, s) => sum + s.price, 0);

  const mostUsedCycle =
    subs.length > 0
      ? Object.entries(
          subs.reduce<Record<string, number>>((acc, s) => {
            acc[s.cycle] = (acc[s.cycle] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1])[0][0]
      : "—";

  return (
    <div className="relative">

      {/* Glow bleu */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2563eb 0%, transparent 70%)",
        }}
      />

      {/* Grille technique */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* HEADER */}
      <section className="relative py-10 border-b border-gray-900">
        <div className="container space-y-4">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <Radar className="h-3 w-3" />
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

      {/* STATS */}
      {!loading && (
        <section className="container mt-10 grid gap-6 md:grid-cols-4">
          <StatCard label="Actifs" value={active} icon={CheckCircle} />
          <StatCard label="Expirés" value={expired} icon={XCircle} />
          <StatCard label="MRR" value={`${mrr.toLocaleString()} €`} icon={TrendingUp} />
          <StatCard label="Cycle le plus utilisé" value={mostUsedCycle} icon={Calendar} />
        </section>
      )}

      {/* TABLE */}
      <section className="container mt-10 mb-20">
        <div className="bg-gray-900 border border-gray-800 overflow-hidden">

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-800 flex items-center gap-3">
            <Database className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-white">Liste des abonnements</h2>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500">Chargement…</p>
          ) : subs.length === 0 ? (
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
                {subs.map((s) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="border-b border-gray-800 last:border-0 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-blue-500" />
                        {s.user.displayName}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-500" />
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
                        <a
                          href={`${API_BASE}/api/checkout/invoice/${s.invoicePaymentId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors font-mono"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </a>
                      ) : (
                        <span className="text-gray-700 text-xs">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
