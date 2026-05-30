import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Users, Activity, TrendingUp, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card } from "../../components/ui/Card";
import { FadeIn } from "../../components/ui/FadeIn";
import { adminApi } from "../../api/admin";
import type { ChartData } from "../../api/admin";
import type { Subscription } from "./AdminSubscriptionsPage";
import { toast } from "../../hooks/useToast";
import { SalesBarChart, StackedCategoryChart, CategoryPieChart } from "./dashboard/Charts";

function fmt(d: string) {
  try { return format(new Date(d), "dd MMM yyyy", { locale: fr }); }
  catch { return d; }
}

function StatCard({
  label, value, icon: Icon, to, borderCls, iconCls, gradCls,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ElementType;
  to: string;
  borderCls: string;
  iconCls: string;
  gradCls: string;
}) {
  return (
    <Link to={to}>
      <div className={`border ${borderCls} bg-gradient-to-br ${gradCls} bg-gray-900 p-6 hover:bg-gray-800 transition-colors group`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${iconCls}`}>
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-gray-700 group-hover:text-gray-500 transition-colors" />
        </div>
        <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-white mt-1">{value}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ services: 0, users: 0, subscriptions: 0, mrr: 0 });
  const [recentSubs, setRecentSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<"days" | "weeks">("days");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminApi.getStats(), adminApi.getSubscriptions()])
      .then(([s, subs]) => {
        setStats(s);
        setRecentSubs(
          [...subs.items].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 6)
        );
      })
      .catch(() => toast("Erreur lors du chargement des statistiques", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setChartLoading(true);
    adminApi.getChartData(period)
      .then(setChartData)
      .catch(() => toast("Erreur lors du chargement des graphiques", "error"))
      .finally(() => setChartLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-7 w-48 bg-gray-800" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-800" />)}
        </div>
        <div className="h-72 bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-6xl">

      <div>
        <p className="text-[11px] font-mono tracking-widest text-blue-500 mb-1">CONSOLE ADMINISTRATEUR</p>
        <h1 className="text-2xl font-black text-white">Tableau de bord</h1>
      </div>

      {/* KPI Cards */}
      <FadeIn direction="none">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Services" value={stats.services} icon={Package} to="/admin/services"
          borderCls="border-violet-500/20" iconCls="bg-violet-500/10 text-violet-400"
          gradCls="from-violet-500/10 to-transparent"
        />
        <StatCard
          label="Utilisateurs" value={stats.users} icon={Users} to="/admin/utilisateurs"
          borderCls="border-blue-500/20" iconCls="bg-blue-500/10 text-blue-400"
          gradCls="from-blue-500/10 to-transparent"
        />
        <StatCard
          label="Abonnements actifs" value={stats.subscriptions} icon={Activity} to="/admin/abonnements"
          borderCls="border-emerald-500/20" iconCls="bg-emerald-500/10 text-emerald-400"
          gradCls="from-emerald-500/10 to-transparent"
        />
        <StatCard
          label="MRR" value={`${stats.mrr.toLocaleString("fr-FR")} €`} icon={TrendingUp} to="/admin/abonnements"
          borderCls="border-amber-500/20" iconCls="bg-amber-500/10 text-amber-400"
          gradCls="from-amber-500/10 to-transparent"
        />
      </div>
      </FadeIn>

      {/* Charts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Statistiques de ventes</h2>
          <div role="tablist" className="flex border border-gray-800">
            {(["days", "weeks"] as const).map((p) => (
              <button
                key={p}
                role="tab"
                aria-current={period === p ? "true" : undefined}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-[10px] font-mono tracking-widest transition-colors ${
                  period === p ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {p === "days" ? "7 JOURS" : "5 SEMAINES"}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div className="grid md:grid-cols-2 gap-6 animate-pulse">
            <div className="md:col-span-2 h-[320px] bg-gray-800" />
            <div className="h-[320px] bg-gray-800" />
            <div className="h-[320px] bg-gray-800" />
          </div>
        ) : chartData && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SalesBarChart data={chartData.salesOverTime} period={period} />
            </div>
            <StackedCategoryChart data={chartData.salesByCategory} />
            <CategoryPieChart data={chartData.categoryDistribution} />
          </div>
        )}
      </div>

      {/* Recent subscriptions */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white text-sm">Abonnements récents</h2>
          <Link
            to="/admin/abonnements"
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Voir tous <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentSubs.length === 0 ? (
          <p className="text-gray-500 text-sm px-6 py-10 text-center">Aucun abonnement enregistré.</p>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-2.5 text-[10px] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-800 bg-gray-950">
              <span>Utilisateur</span>
              <span>Service</span>
              <span>Montant</span>
              <span className="text-right">Statut · Date</span>
            </div>
            <div className="divide-y divide-gray-800">
              {recentSubs.map((sub) => (
                <div key={sub.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center px-6 py-3.5 hover:bg-gray-800/40 transition-colors">
                  <p className="text-sm text-white font-medium truncate">{sub.user.displayName}</p>
                  <p className="text-sm text-gray-400 truncate">{sub.service.name}</p>
                  <p className="text-sm font-semibold text-white">
                    {sub.price} € <span className="text-gray-500 font-normal text-xs">/ {sub.cycle === "monthly" ? "mois" : "an"}</span>
                  </p>
                  <div className="flex items-center justify-between md:justify-end gap-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {sub.status === "ACTIVE"
                        ? <CheckCircle2 className="h-2.5 w-2.5" />
                        : <XCircle className="h-2.5 w-2.5" />}
                      {sub.status === "ACTIVE" ? "Actif" : "Annulé"}
                    </span>
                    <span className="text-xs text-gray-500">{fmt(sub.startDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
