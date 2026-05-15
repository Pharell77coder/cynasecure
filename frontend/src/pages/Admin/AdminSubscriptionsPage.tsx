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
} from "lucide-react";

/* ─────────────────────────────────────────────── */
/* TYPES                                           */
/* ─────────────────────────────────────────────── */
export interface Subscription {
  id: number;
  user: { id: number; displayName: string; email: string };
  service: { id: number; name: string };
  cycle: string;
  price: number;
  status: string;
  startDate: string;
  nextBillingAt: string | null;
}

/* ─────────────────────────────────────────────── */
/* STAT CARD — style XDR                           */
/* ─────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon }: any) {
  return (
    <div className="p-6 bg-gray-900 border border-gray-800 rounded-none hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      <p className="text-4xl font-black text-white mt-3">{value}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────── */
/* PAGE                                            */
/* ─────────────────────────────────────────────── */
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
    <div className="space-y-20 relative">

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
      <section className="relative py-16 border-b border-gray-900">
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
        <section className="container grid gap-6 md:grid-cols-4">
          <StatCard label="Actifs" value={active} icon={CheckCircle} />
          <StatCard label="Expirés" value={expired} icon={XCircle} />
          <StatCard label="MRR" value={`${mrr.toLocaleString()} €`} icon={TrendingUp} />
          <StatCard label="Cycle le plus utilisé" value={mostUsedCycle} icon={Calendar} />
        </section>
      )}

      {/* TABLE */}
      <section className="container">
        <div className="bg-gray-900 border border-gray-800 rounded-none overflow-hidden">

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
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-left bg-gray-950/40">
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Service</th>
                  <th className="px-6 py-4 font-medium">Cycle</th>
                  <th className="px-6 py-4 font-medium">Prix</th>
                  <th className="px-6 py-4 font-medium">Début</th>
                  <th className="px-6 py-4 font-medium">Prochaine facture</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
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
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <User size={16} className="text-blue-500" />
                      {s.user.displayName}
                    </td>

                    <td className="px-6 py-4 text-gray-400 flex items-center gap-2">
                      <Activity size={16} className="text-blue-500" />
                      {s.service.name}
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
                        className={`text-xs px-3 py-1 rounded-none font-mono tracking-widest ${
                          s.status === "ACTIVE"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-gray-700/30 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {s.status}
                      </span>
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
