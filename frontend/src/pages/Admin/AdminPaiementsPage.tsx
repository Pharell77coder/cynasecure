import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { adminApi } from "../../api/admin";

import {
  CreditCard,
  Calendar,
  User,
  TrendingUp,
  CheckCircle,
  XCircle,
} from "lucide-react";

export interface Payment {
  id: number;
  amount: number;
  cycle: string;
  status: "PAID" | "FAILED" | "PENDING";
  paidAt: string;
  user: {
    id: number;
    displayName: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
  };
}

export default function AdminPaiementsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getPayments()
      .then((data: Payment[]) => setPayments(data))
      .finally(() => setLoading(false));
  }, []);

  // --- STATS ---
  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const failed = payments.filter((p) => p.status === "FAILED").length;

  const pending = payments.filter((p) => p.status === "PENDING").length;

  const lastPayment =
    payments.length > 0
      ? new Date(payments[0].paidAt).toLocaleDateString("fr-FR")
      : "—";

  return (
    <div className="space-y-12">

      {/* HERO HEADER */}
      <section className="relative py-14 mb-10 bg-gradient-to-br from-[#0A1A2F] to-black text-white rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Paiements
          </h1>
          <p className="mt-2 text-slate-300">
            Suivi des transactions, paiements réussis, échoués et revenus.
          </p>
        </div>
      </section>

      {/* STATS */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          <StatCard
            label="Total encaissé"
            value={`${totalPaid.toLocaleString()} €`}
            icon={<TrendingUp size={22} />}
            gradient="bg-gradient-to-br from-green-600 to-green-800"
          />

          <StatCard
            label="Échecs"
            value={failed}
            icon={<XCircle size={22} />}
            gradient="bg-gradient-to-br from-red-600 to-red-800"
          />

          <StatCard
            label="En attente"
            value={pending}
            icon={<Calendar size={22} />}
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
          />

          <StatCard
            label="Dernier paiement"
            value={lastPayment}
            icon={<CreditCard size={22} />}
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          />
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Historique des paiements</h2>
        </div>

        {loading ? (
          <p className="p-6 text-slate-600">Chargement…</p>
        ) : payments.length === 0 ? (
          <p className="p-6 text-slate-600">Aucun paiement trouvé.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-left">
                <th className="px-6 py-4 font-medium">Utilisateur</th>
                <th className="px-6 py-4 font-medium">Service</th>
                <th className="px-6 py-4 font-medium">Montant</th>
                <th className="px-6 py-4 font-medium">Cycle</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Statut</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-2">
                    <User size={16} className="text-slate-500" />
                    {p.user.displayName}
                  </td>

                  <td className="px-6 py-4 text-slate-700">{p.service.name}</td>

                  <td className="px-6 py-4 text-slate-700">
                    {p.amount.toFixed(2)} €
                  </td>

                  <td className="px-6 py-4 text-slate-600">{p.cycle}</td>

                  <td className="px-6 py-4 text-slate-600">
                    {new Date(p.paidAt).toLocaleDateString("fr-FR")}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        p.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : p.status === "FAILED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {p.status}
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
