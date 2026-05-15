import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import {
  Package,
  Users,
  Activity,
  TrendingUp,
  Shield,
  Radar,
} from "lucide-react";
import { adminApi } from "../../api/admin";
import React from "react";

/* ─────────────────────────────────────────────── */
/* STAT CARD                                       */
/* ─────────────────────────────────────────────── */
function StatCard({ label, value, icon: Icon }: any) {
  return (
    <Card className="p-6 bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{label}</p>
        <Icon className="h-5 w-5 text-blue-500" />
      </div>
      <p className="text-4xl font-black text-white mt-3">{value}</p>
    </Card>
  );
}

/* ─────────────────────────────────────────────── */
/* PAGE                                            */
/* ─────────────────────────────────────────────── */
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
            CONSOLE ADMINISTRATEUR
          </div>

          <h1 className="text-4xl font-black text-white tracking-tight">
            Tableau de bord
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Vue d’ensemble des indicateurs clés de la plateforme : services, utilisateurs,
            abonnements et revenus récurrents.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="container mt-10">
        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard label="Services" value={stats.services} icon={Package} />
            <StatCard label="Utilisateurs" value={stats.users} icon={Users} />
            <StatCard label="Abonnements actifs" value={stats.subscriptions} icon={Activity} />
            <StatCard label="MRR" value={`${stats.mrr.toLocaleString()} €`} icon={TrendingUp} />
          </div>
        )}
      </section>

      {/* ACTIVITÉ RÉCENTE */}
      <section className="container mt-10 mb-20">
        <Card className="p-8 bg-gray-900 border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Activité récente
          </h2>

          <p className="text-gray-500 text-sm">
            Aucune activité récente pour le moment.
          </p>
        </Card>
      </section>
    </div>
  );
}
