import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Package, Users, Activity, TrendingUp } from "lucide-react";
import { adminApi } from "../../api/admin";
import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
}

function StatCard({ label, value, icon, gradient }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 flex items-center gap-4 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition duration-300"
    >
      <div className={`p-4 rounded-2xl text-white ${gradient}`}>
        {icon}
      </div>

      <div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    services: 0,
    users: 0,
    subscriptions: 0,
    mrr: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getStats()
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">

      {/* HERO HEADER */}
      <section className="relative py-16 mb-10 bg-gradient-to-br from-[#0A1A2F] to-black text-white rounded-3xl overflow-hidden shadow-xl">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">
            Dashboard Administrateur
          </h1>
          <p className="mt-2 text-slate-300">
            Vue globale des performances de la plateforme.
          </p>
        </div>
      </section>

      {/* STATS */}
      {loading ? (
        <p className="text-slate-500">Chargement…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            label="Services"
            value={stats.services}
            icon={<Package size={22} />}
            gradient="bg-gradient-to-br from-blue-600 to-blue-800"
          />

          <StatCard
            label="Utilisateurs"
            value={stats.users}
            icon={<Users size={22} />}
            gradient="bg-gradient-to-br from-green-600 to-green-800"
          />

          <StatCard
            label="Abonnements actifs"
            value={stats.subscriptions}
            icon={<Activity size={22} />}
            gradient="bg-gradient-to-br from-orange-500 to-orange-700"
          />

          <StatCard
            label="MRR"
            value={`${stats.mrr.toLocaleString()}€`}
            icon={<TrendingUp size={22} />}
            gradient="bg-gradient-to-br from-purple-600 to-purple-800"
          />
        </div>
      )}

      {/* RECENT ACTIVITY */}
      <div className="bg-white/70 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Activité récente</h2>
        </div>

        <p className="text-sm text-slate-600 p-6">
          Aucune donnée récente pour le moment.
        </p>
      </div>
    </div>
  );
}
