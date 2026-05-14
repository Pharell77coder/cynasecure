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
} from "lucide-react";

// ----------------------
// TYPES
// ----------------------
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

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------
  // FETCH DATA (TYPÉ)
  // ----------------------
  useEffect(() => {
    adminApi
      .getSubscriptions()
      .then((data: Subscription[]) => setSubs(data))
      .finally(() => setLoading(false));
  }, []);

  // ----------------------
  // STATS
  // ----------------------
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
    <div className="space-y-12">

      {/* HERO HEADER */}
      <section className="relative py-14 mb-10 bg-gradient-to-br from-[#0A1A2F] to-black text-white rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Abonnements
          </h1>
          <p className="mt-2 text-slate-300">
            Suivi complet des abonnements actifs, expirés et revenus récurrents.
          </p>
        </div>
      </section>

      {/* STATS */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          <StatCard
            label="Actifs"
            value={active}
            icon={<CheckCircle size={22} />}
            gradient="bg-gradient-to-br from-green-600 to-green-800"
          />

          <StatCard
            label="Expirés"
            value={expired}
            icon={<XCircle size={22} />}
            gradient="bg-gradient-to-br from-red-600 to-red-800"
          />

          <StatCard
            label="MRR"
            value={`${mrr.toLocaleString()} €`}
            icon={<TrendingUp size={22} />}
            gradient="bg-gradient-to-br from-purple-600 to-purple-800"
          />

          <StatCard
            label="Cycle le plus utilisé"
            value={mostUsedCycle}
            icon={<Calendar size={22} />}
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Liste des abonnements</h2>
        </div>

        {loading ? (
          <p className="p-6 text-slate-600">Chargement…</p>
        ) : subs.length === 0 ? (
          <p className="p-6 text-slate-600">Aucun abonnement trouvé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
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
                  transition={{ duration: 0.3 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-slate-500" />
                    {s.user.displayName}
                  </td>

                  <td className="px-6 py-4 text-slate-700 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    {s.service.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">{s.cycle}</td>

                  <td className="px-6 py-4 text-slate-600">
                    {s.price.toFixed(2)} €
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {new Date(s.startDate).toLocaleDateString("fr-FR")}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {s.nextBillingAt
                      ? new Date(s.nextBillingAt).toLocaleDateString("fr-FR")
                      : "—"}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        s.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
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
    </div>
  );
}

// ----------------------
// STAT CARD COMPONENT
// ----------------------
function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 flex items-center gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition duration-300"
    >
      <div className={`p-4 rounded-2xl text-white ${gradient}`}>{icon}</div>

      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </motion.div>
  );
}
