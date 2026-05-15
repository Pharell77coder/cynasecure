import { useEffect, useState } from "react";
import {
  Shield,
  Activity,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Layers,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { subscriptionsApi } from "../../api/subscriptions";
import { apiFetch } from "../../api/apiFetch";
import { toast } from "../../hooks/useToast";
import { Link } from "react-router-dom";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/* ─────────────────────────────────────────────────────────────── */
/* SKELETON                                                        */
/* ─────────────────────────────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="container py-16 space-y-10 animate-pulse">
      <div className="h-10 w-48 bg-gray-800 rounded" />
      <div className="grid gap-6 md:grid-cols-3">
        <div className="h-24 bg-gray-800 rounded" />
        <div className="h-24 bg-gray-800 rounded" />
        <div className="h-24 bg-gray-800 rounded" />
      </div>
      <div className="h-72 bg-gray-800 rounded" />
      <div className="h-40 bg-gray-800 rounded" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* PAGE                                                            */
/* ─────────────────────────────────────────────────────────────── */
export default function UserDashboardPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      subscriptionsApi.list(),
      apiFetch("/api/payments/my"),
      apiFetch("/api/services"),
    ])
      .then(([subs, pays, services]) => {
        setSubscriptions(subs);
        setPayments(pays);

        if (subs.length > 0) {
          const cat = subs[0].service.categorySlug;
          setRecommended(
            services.filter((s) => s.categorySlug === cat).slice(0, 3)
          );
        }
      })
      .catch(() => toast("Erreur lors du chargement", "error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE");
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const nextPayment = subscriptions
    .filter((s) => s.nextBillingAt)
    .sort(
      (a, b) =>
        new Date(a.nextBillingAt).getTime() -
        new Date(b.nextBillingAt).getTime()
    )[0];

  const chartData = payments.map((p) => ({
    date: p.paidAt,
    amount: p.amount,
  }));

  return (
    <div className="space-y-24">

      {/* ─────────────────────────────────────────────── */}
      {/* HEADER — style XDR sombre                      */}
      {/* ─────────────────────────────────────────────── */}
      <section className="bg-gray-950 border-b border-gray-900 py-20">
        <div className="container space-y-6">
          <div className="inline-flex items-center gap-2 border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-mono tracking-widest px-3 py-1.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            TABLEAU DE BORD UTILISATEUR
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Votre espace de supervision
          </h1>

          <p className="text-gray-400 max-w-2xl leading-relaxed">
            Suivez vos abonnements, vos paiements, vos services actifs et les
            recommandations basées sur votre activité.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* STATS — style premium                          */}
      {/* ─────────────────────────────────────────────── */}
      <section className="container grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Abonnements actifs</p>
            <Layers className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-white mt-3">{activeSubs.length}</p>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Total payé</p>
            <CreditCard className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-4xl font-black text-white mt-3">{totalPaid} €</p>
        </Card>

        <Card className="p-6 bg-gray-900 border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Prochain paiement</p>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-white mt-3">
            {nextPayment ? nextPayment.nextBillingAt : "Aucun"}
          </p>
        </Card>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* GRAPH — style dark XDR                         */}
      {/* ─────────────────────────────────────────────── */}
      <section className="container">
        <Card className="p-8 bg-gray-900 border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Historique des paiements
          </h2>

          {payments.length === 0 ? (
            <p className="text-gray-500">Aucun paiement pour le moment.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    background: "#0f0f0f",
                    border: "1px solid #333",
                    color: "#fff",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* ABONNEMENTS ACTIFS                              */}
      {/* ─────────────────────────────────────────────── */}
      <section className="container space-y-6">
        <h2 className="text-2xl font-bold text-white">Mes abonnements actifs</h2>

        {activeSubs.length === 0 ? (
          <p className="text-gray-500">Aucun abonnement actif.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeSubs.map((s) => (
              <Card key={s.id} className="p-6 bg-gray-900 border-gray-800">
                <h3 className="font-bold text-white">{s.service.title}</h3>
                <p className="text-sm text-gray-400">
                  {s.price} € / {s.cycle === "monthly" ? "mois" : "an"}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Prochain paiement : {s.nextBillingAt}
                </p>

                <Link to="/mes-abonnements">
                  <Button variant="outline" className="mt-4 w-full">
                    Gérer
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* DERNIERS PAIEMENTS                              */}
      {/* ─────────────────────────────────────────────── */}
      <section className="container space-y-6">
        <h2 className="text-2xl font-bold text-white">Derniers paiements</h2>

        {payments.length === 0 ? (
          <p className="text-gray-500">Aucun paiement effectué.</p>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 5).map((p) => (
              <Card
                key={p.id}
                className="p-4 bg-gray-900 border-gray-800 flex justify-between"
              >
                <div>
                  <p className="font-bold text-white">{p.amount} €</p>
                  <p className="text-xs text-gray-500">{p.paidAt}</p>
                </div>
                <span
                  className={
                    p.status === "paid"
                      ? "text-emerald-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {p.status}
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────── */}
      {/* RECOMMANDATIONS                                 */}
      {/* ─────────────────────────────────────────────── */}
      <section className="container space-y-6 pb-20">
        <h2 className="text-2xl font-bold text-white">Recommandations pour vous</h2>

        {recommended.length === 0 ? (
          <p className="text-gray-500">Aucune recommandation disponible.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {recommended.map((s) => (
              <Card key={s.id} className="p-6 bg-gray-900 border-gray-800">
                <h3 className="font-bold text-white">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.priceMonthly} €/mois</p>

                <Link to={`/services/${s.id}`}>
                  <Button className="mt-4 w-full">
                    Voir <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
